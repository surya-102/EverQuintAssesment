from flask import Blueprint, jsonify, request

from controllers.helpers import int_arg
from services import room_service

room_bp = Blueprint("rooms", __name__)


@room_bp.post("/rooms")
def create_room():
    room = room_service.create_room(request.get_json(silent=True) or {})
    return jsonify(room), 201


@room_bp.get("/rooms")
def list_rooms():
    rooms = room_service.list_rooms(int_arg("minCapacity"), request.args.get("amenity"))
    return jsonify(rooms)
