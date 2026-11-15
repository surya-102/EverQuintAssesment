from flask import Blueprint, jsonify, request

from controllers.helpers import int_arg
from services import booking_service

booking_bp = Blueprint("bookings", __name__)


@booking_bp.post("/bookings")
def create_booking():
    booking = booking_service.create_booking(request.get_json(silent=True) or {},
                                             request.headers.get("Idempotency-Key"))
    return jsonify(booking), 201


@booking_bp.get("/bookings")
def list_bookings():
    result = booking_service.list_bookings(int_arg("roomId"), request.args.get("from"),
                                           request.args.get("to"), int_arg("limit", 10),
                                           int_arg("offset", 0))
    return jsonify(result)


@booking_bp.post("/bookings/<int:booking_id>/cancel")
def cancel_booking(booking_id):
    return jsonify(booking_service.cancel_booking(booking_id))
