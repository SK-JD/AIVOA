"""Create the target PostgreSQL database if it doesn't exist yet.

Connects to the server's maintenance `postgres` database using the credentials in
`DATABASE_URL` and issues `CREATE DATABASE` for the target db when missing. Idempotent.
Run via:  python -m app.database.create_db
"""
import sys

import psycopg2
from psycopg2 import sql
from sqlalchemy.engine import make_url

from app.config import settings


def create_database() -> None:
    url = make_url(settings.database_url)
    dbname = url.database
    conn_kwargs = {
        "host": url.host or "localhost",
        "port": url.port or 5432,
        "user": url.username,
        "password": url.password,
        "dbname": "postgres",
    }
    try:
        conn = psycopg2.connect(**conn_kwargs)
    except psycopg2.OperationalError as exc:
        print(f"ERROR: cannot connect to PostgreSQL server: {exc}", file=sys.stderr)
        print("Check the credentials/host in backend/.env (DATABASE_URL).", file=sys.stderr)
        sys.exit(1)

    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (dbname,))
            if cur.fetchone():
                print(f"Database '{dbname}' already exists.")
            else:
                cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(dbname)))
                print(f"Created database '{dbname}'.")
    finally:
        conn.close()


if __name__ == "__main__":
    create_database()
