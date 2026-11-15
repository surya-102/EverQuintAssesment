# Meeting Room Booking Service

Backend assignment: a REST API for meeting rooms and bookings, built with **Python + Flask + SQLite**.

Features: create and list rooms, create bookings with business-rule validation, list bookings with
pagination, idempotent booking creation, cancellation with a 1-hour cut-off, and a room utilization report.

Design notes (data model, overlaps, idempotency, concurrency, utilization formula) are in [DESIGN.md](DESIGN.md).

## Requirements
- Python 3.10 or newer

## Setup

Run these inside the `meeting-room-booking` folder.

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

## Run the server

```bash
python app.py
```

The API runs at **http://127.0.0.1:5000**. Data is saved in `booking.db` (created automatically).

## Run the tests

```bash
pytest -v
```

## Endpoints

| Method | URL | Description |
|---|---|---|
| POST | `/rooms` | Create a room |
| GET | `/rooms?minCapacity=&amenity=` | List rooms, optional filters |
| POST | `/bookings` | Create a booking (optional `Idempotency-Key` header) |
| GET | `/bookings?roomId=&from=&to=&limit=&offset=` | List bookings with pagination |
| POST | `/bookings/{id}/cancel` | Cancel a booking |
| GET | `/reports/room-utilization?from=&to=` | Utilization per room |

Errors always look like:
```json
{ "error": "ValidationError", "message": "startTime must be before endTime" }
```
400 = validation error, 404 = room/booking not found, 409 = overlapping booking or duplicate room name.

## Try it

Create a room:
```bash
curl -X POST http://127.0.0.1:5000/rooms -H "Content-Type: application/json" -d "{\"name\": \"Everest\", \"capacity\": 10, \"floor\": 2, \"amenities\": [\"tv\"]}"
```

Create a booking (times are UTC, Mon-Fri 08:00-20:00, 15 min to 4 hours):
```bash
curl -X POST http://127.0.0.1:5000/bookings -H "Content-Type: application/json" -H "Idempotency-Key: abc-123" -d "{\"roomId\": 1, \"title\": \"Standup\", \"organizerEmail\": \"a@example.com\", \"startTime\": \"2030-01-07T10:00:00Z\", \"endTime\": \"2030-01-07T10:30:00Z\"}"
```

List bookings, cancel one, and get the report:
```bash
curl "http://127.0.0.1:5000/bookings?limit=10&offset=0"
curl -X POST http://127.0.0.1:5000/bookings/1/cancel
curl "http://127.0.0.1:5000/reports/room-utilization?from=2030-01-07T00:00:00Z&to=2030-01-12T00:00:00Z"
```

## Project structure

```
app.py          creates the app, registers routes and error handlers
errors.py       error types (400 / 404 / 409)
controllers/    routes: read the request, call a service, return JSON
services/       validation and business rules
repositories/   SQLite queries
test_app.py     unit + integration tests
```
