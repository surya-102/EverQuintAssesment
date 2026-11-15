from datetime import datetime, time, timedelta

from errors import validation_error
from repositories import booking_repository, room_repository
from services.time_utils import overlap_hours, parse_time


def business_hours(start, end):
    total = 0
    day = start.date()
    while day <= end.date():
        if day.weekday() < 5:
            total += overlap_hours(datetime.combine(day, time(8)), datetime.combine(day, time(20)), start, end)
        day += timedelta(days=1)
    return total


def room_utilization(start, end):
    if not start or not end:
        raise validation_error("from and to are required")
    start = parse_time(start, "from")
    end = parse_time(end, "to")
    if start >= end:
        raise validation_error("from must be before to")

    available = business_hours(start, end)
    bookings = booking_repository.confirmed_between(start.isoformat(), end.isoformat())
    report = []
    for room in room_repository.get_all():
        booked = 0
        for b in bookings:
            if b["roomId"] == room["id"]:
                booked += overlap_hours(parse_time(b["startTime"], ""), parse_time(b["endTime"], ""), start, end)
        report.append({
            "roomId": room["id"],
            "roomName": room["name"],
            "totalBookingHours": round(booked, 2),
            "utilizationPercent": round(booked / available, 4) if available else 0,
        })
    return report
