import sqlite3
from contextlib import closing

DB_PATH = "booking.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS rooms (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT NOT NULL UNIQUE COLLATE NOCASE,
    capacity  INTEGER NOT NULL,
    floor     INTEGER NOT NULL,
    amenities TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS bookings (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id         INTEGER NOT NULL,
    title           TEXT NOT NULL,
    organizer_email TEXT NOT NULL,
    start_time      TEXT NOT NULL,
    end_time        TEXT NOT NULL,
    status          TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS idempotency_keys (
    organizer_email TEXT NOT NULL,
    key             TEXT NOT NULL,
    booking_id      INTEGER NOT NULL,
    PRIMARY KEY (organizer_email, key)
);
"""


def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with closing(connect()) as conn:
        conn.executescript(SCHEMA)
