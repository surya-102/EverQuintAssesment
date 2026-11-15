from datetime import datetime, timezone

from errors import validation_error


def now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def parse_time(value, field):
    # everything is stored in UTC, times without an offset are taken as UTC
    try:
        dt = datetime.fromisoformat(value)
    except (TypeError, ValueError):
        raise validation_error(f"{field} must be a valid ISO-8601 datetime")
    if dt.tzinfo:
        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt.replace(microsecond=0)


def overlap_hours(start1, end1, start2, end2):
    seconds = (min(end1, end2) - max(start1, start2)).total_seconds()
    return max(seconds, 0) / 3600
