/*
# Tighten SECURITY DEFINER function execute grants

## Overview
The Supabase linter flagged that `create_booking` and `cancel_booking` were
callable by the `anon` role. The earlier migration revoked EXECUTE from `anon`
explicitly, but the default grant to `PUBLIC` (which includes anon) was still
in place, so anon could still call both functions.

## Changes
- Revoke EXECUTE on both functions from PUBLIC.
- Re-grant EXECUTE to `authenticated` only (signed-in users need to book/cancel).
- This makes anon unable to call either function, closing the flagged gap.

## Security
- After this change, only `authenticated` can call `create_booking` and
  `cancel_booking`. Anonymous requests are rejected at the API boundary.
- The functions still authorize the caller via `auth.uid()` internally, so this
  is defense in depth, not the only control.
*/

REVOKE EXECUTE ON FUNCTION create_booking(uuid, text, int, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION create_booking(uuid, text, int, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION create_booking(uuid, text, int, text, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION cancel_booking(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION cancel_booking(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION cancel_booking(uuid) TO authenticated;