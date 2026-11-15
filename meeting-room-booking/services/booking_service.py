import threading
from datetime import time, timedelta

from errors import conflict, not_found, validation_error
from repositories import booking_repository, idempotency_repository, room_repository
from services import time_utils
from services.time_utils import parse_time

booking_lock = threading.Lock()


def overlaps(start1, end1, start2, end2):
    return start1 < end2 and start2 < end1


def check_booking_rules(start, end):
    if start >= end:
        raise validation_error("startTime must be before endTime")
    if not timedelta(minutes=15) <= end - start <= timedelta(hours=4):
        raise validation_error("Booking duration must be between 15 minutes and 4 hours")
    if start.weekday() >= 5:
        raise validation_error("Bookings are only allowed Monday to Friday")
    if start.date() != end.date() or start.time() < time(8) or end.time() > time(20):
        raise validation_error("Bookings are only allowed between 08:00 and 20:00")


def create_booking(data, idempotency_key=None):
    if data.get("roomId") is None:
        raise validation_error("roomId is required")
    title = data.get("title")
    email = data.get("organizerEmail")
    if not isinstance(title, str) or not title.strip():
        raise validation_error("title is required")
    if not isinstance(email, str) or "@" not in email:
        raise validation_error("organizerEmail must be a valid email")
    start = parse_time(data.get("startTime"), "startTime")
    end = parse_time(data.get("endTime"), "endTime")
    check_booking_rules(start, end)

    try:
        room_id = int(data.get("roomId"))
    except (TypeError, ValueError):
        raise not_found("Room not found")

    with booking_lock:
        if idempotency_key:
            existing_id = idempotency_repository.get_booking_id(email, idempotency_key)
            if existing_id:
                return booking_repository.get(existing_id)

        if not room_repository.get(room_id):
            raise not_found("Room not found")

        for b in booking_repository.confirmed_for_room(room_id):
            if overlaps(start, end, parse_time(b["startTime"], ""), parse_time(b["endTime"], "")):
                raise conflict("Room is already booked for this time")

        booking_id = booking_repository.insert(room_id, title, email, start.isoformat(),
                                               end.isoformat(), idempotency_key)
    return booking_repository.get(booking_id)


def list_bookings(room_id=None, start=None, end=None, limit=10, offset=0):
    if limit < 1 or offset < 0:
        raise validation_error("limit must be >= 1 and offset must be >= 0")
    start = parse_time(start, "from").isoformat() if start else None
    end = parse_time(end, "to").isoformat() if end else None
    items, total = booking_repository.search(room_id, start, end, limit, offset)
    return {"items": items, "total": total, "limit": limit, "offset": offset}


def cancel_booking(booking_id):
    booking = booking_repository.get(booking_id)
    if not booking:
        raise not_found("Booking not found")
    if booking["status"] == "cancelled":
        return booking
    if time_utils.now() > parse_time(booking["startTime"], "") - timedelta(hours=1):
        raise validation_error("Bookings can only be cancelled up to 1 hour before startTime")
    booking_repository.set_cancelled(booking_id)
    return booking_repository.get(booking_id)
