from flask import Blueprint, jsonify, request

from services import report_service

report_bp = Blueprint("reports", __name__)


@report_bp.get("/reports/room-utilization")
def room_utilization():
    report = report_service.room_utilization(request.args.get("from"), request.args.get("to"))
    return jsonify(report)
