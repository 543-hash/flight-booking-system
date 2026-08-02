/*
# Atomic booking creation and cancellation functions

## Overview
Moves the two privileged operations in the booking flow — creating a booking
(with seat decrement + server-side price computation) and cancelling one
(with seat restoration) — into SECURITY DEFINER functions so the browser
cannot forge prices, oversell seats, or cancel another user's booking.

## Why
- `flights` has no INSERT/UPDATE/DELETE policy, so the frontend cannot change
  `available_seats` directly. The decrement must happen server-side.
- The total price is computed from the flight's own price columns inside the
  function, so a client cannot submit a forged `total_price`.
- The seat claim (decrement) and the booking insert run in one function, so two
  concurrent bookings cannot both grab the last seat.
- Cancellation verifies ownership via `auth.uid()` before restoring seats.

## New Functions

1. `create_booking(p_flight_id, p_cabin_class, p_passengers, p_passenger_name, p_passenger_email, p_passenger_phone)`
   - Runs as owner (bypasses RLS) but authorizes the caller via `auth.uid()`.
   - Validates passenger count is between 1 and 9.
   - Validates cabin class is one of economy/business/first.
   - Looks up the flight and the price for the chosen cabin FROM THE DATABASE.
   - Atomically decrements `available_seats` only if enough seats remain
     (the check and the update are the same statement).
   - Generates a unique 6-char booking reference with collision retry.
   - Inserts the booking row owned by the caller, computes total + 12% taxes.
   - Returns `{ booking_id, booking_reference, total_price }`.

2. `cancel_booking(p_booking_id)`
   - Runs as owner. Authorizes the caller via `auth.uid() = user_id`.
   - Only cancels a booking whose status is 'confirmed'.
   - Sets status to 'cancelled' and payment_status to 'refunded'.
   - Restores the seats to the flight.
   - Returns `{ ok: boolean }`.

## Security
- Both functions are `SECURITY DEFINER` with `SET search_path = public`.
- EXECUTE is revoked from `anon` and granted to `authenticated` only.
- The actor is always derived from `auth.uid()`, never from a parameter.
- The price and seat count are read from the database, not trusted from input.

## Notes
- These functions are idempotent against re-runs (CREATE OR REPLACE).
- `cancel_booking` is safe to re-run on an already-cancelled booking: it
  restores seats only when a row is actually updated from confirmed -> cancelled.
*/

-- create_booking
CREATE OR REPLACE FUNCTION create_booking(
  p_flight_id uuid,
  p_cabin_class text,
  p_passengers int,
  p_passenger_name text,
  p_passenger_email text,
  p_passenger_phone text
)
RETURNS TABLE(booking_id uuid, booking_reference text, total_price numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_unit_price numeric;
  v_subtotal numeric;
  v_total numeric;
  v_reference text;
  v_attempts int := 0;
  v_exists int;
  v_updated int;
BEGIN
  -- Authorize: a signed-in user is required.
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to book a flight';
  END IF;

  -- Validate inputs.
  IF p_passengers IS NULL OR p_passengers < 1 OR p_passengers > 9 THEN
    RAISE EXCEPTION 'Invalid passenger count';
  END IF;
  IF p_cabin_class NOT IN ('economy', 'business', 'first') THEN
    RAISE EXCEPTION 'Invalid cabin class';
  END IF;
  IF p_passenger_name IS NULL OR btrim(p_passenger_name) = '' THEN
    RAISE EXCEPTION 'Passenger name is required';
  END IF;
  IF p_passenger_email IS NULL OR btrim(p_passenger_email) = '' THEN
    RAISE EXCEPTION 'Passenger email is required';
  END IF;
  IF p_passenger_phone IS NULL OR btrim(p_passenger_phone) = '' THEN
    RAISE EXCEPTION 'Passenger phone is required';
  END IF;

  -- Look up the price FROM THE DATABASE (never trust a client-supplied price).
  SELECT CASE p_cabin_class
           WHEN 'business' THEN business_price
           WHEN 'first' THEN first_price
           ELSE base_price
         END
  INTO v_unit_price
  FROM flights
  WHERE id = p_flight_id;

  IF v_unit_price IS NULL THEN
    RAISE EXCEPTION 'Flight not found';
  END IF;

  v_subtotal := v_unit_price * p_passengers;
  v_total := v_subtotal + ROUND(v_subtotal * 0.12);

  -- Atomically claim seats: the check (available_seats >= p_passengers) and
  -- the decrement are the same statement, so two concurrent callers cannot
  -- both succeed on the last seat(s).
  UPDATE flights
    SET available_seats = available_seats - p_passengers
    WHERE id = p_flight_id
      AND available_seats >= p_passengers
    RETURNING 1 INTO v_updated;

  IF v_updated IS NULL THEN
    RAISE EXCEPTION 'Not enough seats available on this flight';
  END IF;

  -- Generate a unique booking reference with a short retry loop.
  LOOP
    v_reference := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 6));
    v_reference := translate(v_reference, 'O01IL', 'AABBC'); -- avoid ambiguous chars
    SELECT 1 INTO v_exists FROM bookings WHERE booking_reference = v_reference LIMIT 1;
    EXIT WHEN v_exists IS NULL;
    v_attempts := v_attempts + 1;
    IF v_attempts > 5 THEN
      v_reference := upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 8));
      EXIT;
    END IF;
  END LOOP;

  -- Insert the booking owned by the caller. user_id defaults to auth.uid().
  INSERT INTO bookings (
    user_id, flight_id, passenger_name, passenger_email, passenger_phone,
    cabin_class, passengers, total_price, status, payment_status, booking_reference
  ) VALUES (
    auth.uid(), p_flight_id, p_passenger_name, p_passenger_email, p_passenger_phone,
    p_cabin_class, p_passengers, v_total, 'confirmed', 'paid', v_reference
  )
  RETURNING id, booking_reference, total_price
  INTO booking_id, booking_reference, total_price;

  RETURN NEXT;
END;
$$;

REVOKE EXECUTE ON FUNCTION create_booking FROM anon;
GRANT EXECUTE ON FUNCTION create_booking TO authenticated;

-- cancel_booking
CREATE OR REPLACE FUNCTION cancel_booking(p_booking_id uuid)
RETURNS TABLE(ok boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_flight_id uuid;
  v_passengers int;
  v_updated int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'You must be signed in';
  END IF;

  -- Fetch the booking, verifying ownership AND that it is still confirmed.
  -- The update + seat restore happen only when a row matches, so it is safe
  -- to call again on an already-cancelled booking (no double seat restore).
  SELECT flight_id, passengers
  INTO v_flight_id, v_passengers
  FROM bookings
  WHERE id = p_booking_id
    AND user_id = auth.uid()
    AND status = 'confirmed';

  IF v_flight_id IS NULL THEN
    RAISE EXCEPTION 'Booking not found or already cancelled';
  END IF;

  UPDATE bookings
    SET status = 'cancelled', payment_status = 'refunded'
    WHERE id = p_booking_id AND user_id = auth.uid() AND status = 'confirmed'
    RETURNING 1 INTO v_updated;

  IF v_updated IS NOT NULL THEN
    UPDATE flights
      SET available_seats = available_seats + v_passengers
      WHERE id = v_flight_id;
  END IF;

  ok := true;
  RETURN NEXT;
END;
$$;

REVOKE EXECUTE ON FUNCTION cancel_booking FROM anon;
GRANT EXECUTE ON FUNCTION cancel_booking TO authenticated;