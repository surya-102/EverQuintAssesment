import sqlite3

from errors import conflict, validation_error
from repositories import room_repository


def create_room(data):
    name = data.get("name")
    capacity = data.get("capacity")
    floor = data.get("floor")
    amenities = data.get("amenities", [])

    if not isinstance(name, str) or not name.strip():
        raise validation_error("name is required")
    if type(capacity) is not int or capacity < 1:
        raise validation_error("capacity must be a positive integer")
    if type(floor) is not int:
        raise validation_error("floor must be an integer")
    if not isinstance(amenities, list) or not all(isinstance(a, str) for a in amenities):
        raise validation_error("amenities must be a list of strings")

    try:
        room_id = room_repository.insert(name.strip(), capacity, floor, amenities)
    except sqlite3.IntegrityError:
        raise conflict(f"Room name '{name}' already exists")
    return room_repository.get(room_id)


def list_rooms(min_capacity=None, amenity=None):
    rooms = room_repository.get_all()
    if min_capacity is not None:
        rooms = [r for r in rooms if r["capacity"] >= min_capacity]
    if amenity:
        rooms = [r for r in rooms if amenity.lower() in [a.lower() for a in r["amenities"]]]
    return rooms
