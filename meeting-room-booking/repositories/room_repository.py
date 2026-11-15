import json
from contextlib import closing

from repositories.database import connect


def to_dict(row):
    return {"id": row["id"], "name": row["name"], "capacity": row["capacity"],
            "floor": row["floor"], "amenities": json.loads(row["amenities"])}


def insert(name, capacity, floor, amenities):
    with closing(connect()) as conn, conn:
        cur = conn.execute(
            "INSERT INTO rooms (name, capacity, floor, amenities) VALUES (?, ?, ?, ?)",
            (name, capacity, floor, json.dumps(amenities)))
        return cur.lastrowid


def get(room_id):
    with closing(connect()) as conn:
        row = conn.execute("SELECT * FROM rooms WHERE id = ?", (room_id,)).fetchone()
        return to_dict(row) if row else None


def get_all():
    with closing(connect()) as conn:
        return [to_dict(r) for r in conn.execute("SELECT * FROM rooms ORDER BY id")]
