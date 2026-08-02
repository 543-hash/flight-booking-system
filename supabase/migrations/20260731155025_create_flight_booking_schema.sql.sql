/*
# Flight Booking Management System — Schema

## Overview
Creates the complete database schema for a flight booking management system
where users create accounts, search for suitable flights by price, book
flights, and view/cancel their bookings. Payments are handled at booking time
and a Stripe integration is wired in once configured.

## New Tables

1. `airports`
   - `id` (uuid, PK)
   - `code` (text, unique, 3-letter IATA code, e.g. "JFK")
   - `name` (text, full airport name, e.g. "John F. Kennedy International")
   - `city` (text, city name)
   - `country` (text, country name)
   - `created_at` (timestamptz)

2. `flights`
   - `id` (uuid, PK)
   - `flight_number` (text, unique, e.g. "AA123")
   - `airline` (text, airline name)
   - `airline_code` (text, 2-letter IATA airline code, e.g. "AA")
   - `origin_id` (uuid, FK -> airports.id)
   - `destination_id` (uuid, FK -> airports.id)
   - `departure_time` (timestamptz, when the flight departs)
   - `arrival_time` (timestamptz, when the flight arrives)
   - `duration_minutes` (int, total flight duration in minutes)
   - `base_price` (numeric(10,2), the economy/base fare)
   - `business_price` (numeric(10,2), the business-class fare)
   - `first_price` (numeric(10,2), the first-class fare)
   - `total_seats` (int, total seat capacity)
   - `available_seats` (int, seats currently available to book)
   - `aircraft` (text, aircraft model, e.g. "Boeing 737")
   - `created_at` (timestamptz)

3. `bookings`
   - `id` (uuid, PK)
   - `user_id` (uuid, NOT NULL, defaults to the authenticated user, FK -> auth.users ON DELETE CASCADE)
   - `flight_id` (uuid, FK -> flights.id ON DELETE RESTRICT)
   - `passenger_name` (text, full name of the passenger)
   - `passenger_email` (text, contact email for the passenger)
   - `passenger_phone` (text, contact phone)
   - `cabin_class` (text, one of 'economy', 'business', 'first')
   - `passengers` (int, number of passengers, default 1)
   - `total_price` (numeric(10,2), total charged)
   - `status` (text, one of 'confirmed', 'cancelled', 'pending')
   - `booking_reference` (text, unique 6-char confirmation code)
   - `payment_status` (text, one of 'pending', 'paid', 'failed', 'refunded')
   - `stripe_session_id` (text, nullable, Stripe checkout session id once payments configured)
   - `created_at` (timestamptz)

## Security (RLS)

- `airports`: public read for all (anon + authenticated). No writes from client.
- `flights`: public read for all (anon + authenticated). No writes from client
  (flight inventory is managed server-side; a separate admin path is out of scope).
- `bookings`: owner-scoped CRUD. Each authenticated user can only see, create,
  update, and cancel their own bookings. `user_id` defaults to `auth.uid()` so
  inserts that omit it still succeed. No anon access — a signed-in user is
  required to book.

## Indexes
- `flights(origin_id, destination_id)` for route searches
- `flights(departure_time)` for date filtering
- `flights(base_price)` for price sorting
- `bookings(user_id)` for "my trips" queries
- `bookings(booking_reference)` for lookups by confirmation code

## Notes
- A unique constraint on `flights(origin_id, destination_id, departure_time)`
  prevents exact duplicate flight entries.
- `available_seats` is decremented when a booking is confirmed and restored on
  cancellation (handled in the application layer for the booking flow).
- `booking_reference` is a 6-character alphanumeric code generated per booking.
*/

-- Airports
CREATE TABLE IF NOT EXISTS airports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE airports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "airports_public_read" ON airports;
CREATE POLICY "airports_public_read" ON airports FOR SELECT
  TO anon, authenticated USING (true);

-- Flights
CREATE TABLE IF NOT EXISTS flights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_number text UNIQUE NOT NULL,
  airline text NOT NULL,
  airline_code text NOT NULL,
  origin_id uuid NOT NULL REFERENCES airports(id) ON DELETE RESTRICT,
  destination_id uuid NOT NULL REFERENCES airports(id) ON DELETE RESTRICT,
  departure_time timestamptz NOT NULL,
  arrival_time timestamptz NOT NULL,
  duration_minutes int NOT NULL,
  base_price numeric(10,2) NOT NULL,
  business_price numeric(10,2) NOT NULL,
  first_price numeric(10,2) NOT NULL,
  total_seats int NOT NULL,
  available_seats int NOT NULL,
  aircraft text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_flight_times CHECK (arrival_time > departure_time),
  CONSTRAINT valid_seats CHECK (available_seats >= 0 AND total_seats > 0),
  CONSTRAINT valid_prices CHECK (base_price > 0 AND business_price > 0 AND first_price > 0),
  CONSTRAINT unique_flight UNIQUE (origin_id, destination_id, departure_time)
);

ALTER TABLE flights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "flights_public_read" ON flights;
CREATE POLICY "flights_public_read" ON flights FOR SELECT
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_flights_route ON flights(origin_id, destination_id);
CREATE INDEX IF NOT EXISTS idx_flights_departure ON flights(departure_time);
CREATE INDEX IF NOT EXISTS idx_flights_price ON flights(base_price);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_id uuid NOT NULL REFERENCES flights(id) ON DELETE RESTRICT,
  passenger_name text NOT NULL,
  passenger_email text NOT NULL,
  passenger_phone text NOT NULL,
  cabin_class text NOT NULL DEFAULT 'economy',
  passengers int NOT NULL DEFAULT 1,
  total_price numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  booking_reference text UNIQUE NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  stripe_session_id text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_cabin CHECK (cabin_class IN ('economy', 'business', 'first')),
  CONSTRAINT valid_booking_status CHECK (status IN ('confirmed', 'cancelled', 'pending')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  CONSTRAINT valid_passenger_count CHECK (passengers > 0 AND passengers <= 9)
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_bookings" ON bookings;
CREATE POLICY "select_own_bookings" ON bookings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_bookings" ON bookings;
CREATE POLICY "insert_own_bookings" ON bookings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_bookings" ON bookings;
CREATE POLICY "update_own_bookings" ON bookings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_bookings" ON bookings;
CREATE POLICY "delete_own_bookings" ON bookings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);