from contextlib import closing

from repositories.database import connect


def to_dict(row):
    return {"id": row["id"], "roomId": row["room_id"], "title": row["title"],
            "organizerEmail": row["organizer_email"], "startTime": row["start_time"],
            "endTime": row["end_time"], "status": row["status"]}


def insert(room_id, title, email, start, end, idempotency_key=None):
    # booking and key are saved in the same transaction
    with closing(connect()) as conn, conn:
        cur = conn.execute(
            "INSERT INTO bookings (room_id, title, organizer_email, start_time, end_time, status) "
            "VALUES (?, ?, ?, ?, ?, 'confirmed')",
            (room_id, title, email, start, end))
        booking_id = cur.lastrowid
        if idempotency_key:
            conn.execute(
                "INSERT INTO idempotency_keys (organizer_email, key, booking_id) VALUES (?, ?, ?)",
                (email, idempotency_key, booking_id))
        return booking_id


def get(booking_id):
    with closing(connect()) as conn:
        row = conn.execute("SELECT * FROM bookings WHERE id = ?", (booking_id,)).fetchone()
        return to_dict(row) if row else None


def confirmed_for_room(room_id):
    with closing(connect()) as conn:
        rows = conn.execute(
            "SELECT * FROM bookings WHERE room_id = ? AND status = 'confirmed'", (room_id,))
        return [to_dict(r) for r in rows]


def confirmed_between(start, end):
    with closing(connect()) as conn:
        rows = conn.execute(
            "SELECT * FROM bookings WHERE status = 'confirmed' AND start_time < ? AND end_time > ?",
            (end, start))
        return [to_dict(r) for r in rows]


def search(room_id, start, end, limit, offset):
    where, params = "WHERE 1=1", []
    if room_id is not None:
        where += " AND room_id = ?"
        params.append(room_id)
    if start:
        where += " AND end_time > ?"
        params.append(start)
    if end:
        where += " AND start_time < ?"
        params.append(end)
    with closing(connect()) as conn:
        total = conn.execute(f"SELECT COUNT(*) FROM bookings {where}", params).fetchone()[0]
        rows = conn.execute(f"SELECT * FROM bookings {where} ORDER BY start_time LIMIT ? OFFSET ?",
                            params + [limit, offset])
        return [to_dict(r) for r in rows], total


def set_cancelled(booking_id):
    with closing(connect()) as conn, conn:
        conn.execute("UPDATE bookings SET status = 'cancelled' WHERE id = ?", (booking_id,))
