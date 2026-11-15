# Design

## Structure
```
app.py             creates the Flask app, registers blueprints and error handlers
errors.py          ApiError and helpers for 400 / 404 / 409
controllers/       routes only - read the request, call a service, return JSON
services/          validation and business rules
repositories/      SQLite queries (database.py has the connection and schema)
```
Controllers never talk to the database and contain no business rules.

## Data model
- rooms: id, name, capacity, floor, amenities (stored as JSON). Name is unique and case-insensitive (COLLATE NOCASE).
- bookings: id, room_id, title, organizer_email, start_time, end_time, status (confirmed / cancelled)
- idempotency_keys: organizer_email, key, booking_id. Primary key is (organizer_email, key).

Times are stored in UTC. I assumed all rooms are in UTC, so working hours (Mon-Fri 08:00-20:00) are checked in UTC.

## Preventing overlaps
Two bookings overlap if start1 < end2 and start2 < end1, so back-to-back bookings are allowed.
Before inserting, the new booking is compared with the confirmed bookings of that room.
Cancelled bookings are skipped, so they don't block new ones.

## Error handling
Services raise ApiError(status, error, message) and Flask error handlers return it as
{"error": ..., "message": ...}. Flask's own errors (404, 405) and unexpected errors use the same format.

- 400 validation errors
- 404 room or booking not found
- 409 overlapping booking or duplicate room name

## Idempotency
Idempotency-Key is read from the request header. Keys are unique per organizer.
If the organizer already used the key, the saved booking is returned instead of creating a new one.
Otherwise the booking is created, and the booking and key are saved in the same transaction.
The keys are in the database, so they survive a restart. If a request fails, the key isn't saved and can be reused.

## Concurrency
Creating a booking (key check, overlap check, insert) runs inside a threading.Lock, so two requests
can't both pass the checks at the same time. The primary key on (organizer_email, key) also stops duplicate keys.

Limitation: the lock only works in a single process. With multiple processes you'd need a database lock instead
(BEGIN IMMEDIATE in SQLite or SELECT ... FOR UPDATE in Postgres).

## Utilization
utilizationPercent = booked hours in [from, to] / business hours in [from, to]

- Business hours are Mon-Fri 08:00-20:00.
- Only confirmed bookings are counted.
- Bookings that start before `from` or end after `to` only count the part inside the range.
- If there are no business hours in the range, utilization is 0.
