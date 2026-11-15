from datetime import datetime

import pytest

from app import create_app
from errors import ApiError
from repositories import database
from services import time_utils
from services.booking_service import check_booking_rules, overlaps

# 7 Jan 2030 is a Monday
MON_10 = datetime(2030, 1, 7, 10, 0)
MON_11 = datetime(2030, 1, 7, 11, 0)


@pytest.fixture
def client(tmp_path):
    database.DB_PATH = str(tmp_path / "test.db")
    return create_app().test_client()


def make_room(client, name="Room A"):
    return client.post("/rooms", json={"name": name, "capacity": 5, "floor": 1, "amenities": ["tv"]}).get_json()


def book(client, room_id, start="2030-01-07T10:00:00", end="2030-01-07T11:00:00", key=None):
    headers = {"Idempotency-Key": key} if key else {}
    body = {"roomId": room_id, "title": "Meeting", "organizerEmail": "a@x.com",
            "startTime": start, "endTime": end}
    return client.post("/bookings", json=body, headers=headers)


def test_overlap():
    assert overlaps(MON_10, MON_11, datetime(2030, 1, 7, 10, 30), datetime(2030, 1, 7, 11, 30))
    assert not overlaps(MON_10, MON_11, MON_11, datetime(2030, 1, 7, 12, 0))


def test_duration():
    check_booking_rules(MON_10, datetime(2030, 1, 7, 10, 15))
    with pytest.raises(ApiError):
        check_booking_rules(MON_10, datetime(2030, 1, 7, 10, 10))
    with pytest.raises(ApiError):
        check_booking_rules(MON_10, datetime(2030, 1, 7, 14, 30))


def test_working_hours():
    with pytest.raises(ApiError):
        check_booking_rules(datetime(2030, 1, 7, 7, 30), datetime(2030, 1, 7, 8, 30))
    with pytest.raises(ApiError):
        check_booking_rules(datetime(2030, 1, 7, 19, 30), datetime(2030, 1, 7, 20, 30))
    with pytest.raises(ApiError):
        check_booking_rules(datetime(2030, 1, 5, 10), datetime(2030, 1, 5, 11))  # saturday


def test_create_and_list_rooms(client):
    room = make_room(client, "Room A")
    assert room["id"] == 1
    assert client.post("/rooms", json={"name": "ROOM A", "capacity": 3, "floor": 1}).status_code == 409
    assert client.post("/rooms", json={"name": "B", "capacity": 0, "floor": 1}).status_code == 400
    assert len(client.get("/rooms?minCapacity=5&amenity=TV").get_json()) == 1
    assert client.get("/rooms?minCapacity=6").get_json() == []


def test_errors_are_json(client):
    resp = client.get("/no-such-url")
    assert resp.status_code == 404
    assert set(resp.get_json()) == {"error", "message"}


def test_create_booking(client):
    room = make_room(client)
    resp = book(client, room["id"])
    assert resp.status_code == 201
    assert resp.get_json()["status"] == "confirmed"


def test_create_booking_conflict(client):
    room = make_room(client)
    book(client, room["id"])
    resp = book(client, room["id"], start="2030-01-07T10:30:00", end="2030-01-07T11:30:00")
    assert resp.status_code == 409
    assert resp.get_json()["error"] == "Conflict"


def test_unknown_room_and_bad_times(client):
    assert book(client, 999).status_code == 404
    room = make_room(client)
    resp = book(client, room["id"], start="2030-01-07T11:00:00", end="2030-01-07T10:00:00")
    assert resp.status_code == 400
    assert resp.get_json() == {"error": "ValidationError", "message": "startTime must be before endTime"}


def test_idempotency(client):
    room = make_room(client)
    first = book(client, room["id"], key="abc")
    second = book(client, room["id"], key="abc")
    assert first.get_json()["id"] == second.get_json()["id"]
    assert client.get("/bookings").get_json()["total"] == 1


def test_cancel(client, monkeypatch):
    room = make_room(client)
    booking = book(client, room["id"]).get_json()

    monkeypatch.setattr(time_utils, "now", lambda: datetime(2030, 1, 7, 9, 30))
    assert client.post(f"/bookings/{booking['id']}/cancel").status_code == 400

    monkeypatch.setattr(time_utils, "now", lambda: datetime(2030, 1, 7, 8, 0))
    resp = client.post(f"/bookings/{booking['id']}/cancel")
    assert resp.get_json()["status"] == "cancelled"

    assert book(client, room["id"]).status_code == 201


def test_utilization_no_bookings(client):
    make_room(client)
    report = client.get("/reports/room-utilization?from=2030-01-07T08:00:00&to=2030-01-07T20:00:00").get_json()
    assert report[0]["totalBookingHours"] == 0
    assert report[0]["utilizationPercent"] == 0


def test_utilization_partial_overlap(client):
    room = make_room(client)
    book(client, room["id"], start="2030-01-07T09:00:00", end="2030-01-07T11:00:00")
    book(client, room["id"], start="2030-01-07T15:00:00", end="2030-01-07T17:00:00")
    # 10:00-16:00 is 6 hours, 1 hour of each booking falls inside it
    report = client.get("/reports/room-utilization?from=2030-01-07T10:00:00&to=2030-01-07T16:00:00").get_json()
    assert report[0]["totalBookingHours"] == 2
    assert report[0]["utilizationPercent"] == round(2 / 6, 4)
