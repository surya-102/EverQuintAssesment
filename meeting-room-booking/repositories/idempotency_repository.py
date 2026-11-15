from contextlib import closing

from repositories.database import connect


def get_booking_id(email, key):
    with closing(connect()) as conn:
        row = conn.execute(
            "SELECT booking_id FROM idempotency_keys WHERE organizer_email = ? AND key = ?",
            (email, key)).fetchone()
        return row["booking_id"] if row else None
