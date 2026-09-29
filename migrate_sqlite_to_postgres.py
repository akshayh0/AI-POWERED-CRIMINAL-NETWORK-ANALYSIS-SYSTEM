import sqlite3
import psycopg2
from psycopg2 import sql

# ============================================================
# CONFIGURATION
# ============================================================

SQLITE_DB = r"C:\AICrimeAnalytics-main\crime_intelligence.db"

PG_HOST = "localhost"
PG_PORT = 5432
PG_DATABASE = "crime_intelligence"
PG_USER = "postgres"

# PUT YOUR POSTGRES PASSWORD HERE
PG_PASSWORD = "PASSWORD"


# ============================================================
# SQLITE CONNECTION
# ============================================================

print("Connecting to SQLite...")

sqlite_conn = sqlite3.connect(SQLITE_DB)
sqlite_conn.row_factory = sqlite3.Row
sqlite_cursor = sqlite_conn.cursor()

tables = sqlite_cursor.execute("""
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    AND name NOT LIKE 'sqlite_%'
    ORDER BY name
""").fetchall()

table_names = [row["name"] for row in tables]

print(f"Found {len(table_names)} tables.")


# ============================================================
# POSTGRES CONNECTION
# ============================================================

print("Connecting to PostgreSQL...")

pg_conn = psycopg2.connect(
    host=PG_HOST,
    port=PG_PORT,
    database=PG_DATABASE,
    user=PG_USER,
    password=PG_PASSWORD
)

pg_conn.autocommit = False
pg_cursor = pg_conn.cursor()

print("PostgreSQL connected successfully.")


# ============================================================
# TYPE CONVERSION
# ============================================================

def sqlite_to_postgres_type(sqlite_type):

    t = (sqlite_type or "").upper()

    if "INT" in t:
        return "INTEGER"

    if "CHAR" in t or "CLOB" in t or "TEXT" in t:
        return "TEXT"

    if "REAL" in t or "DOUBLE" in t or "FLOAT" in t:
        return "DOUBLE PRECISION"

    if "DECIMAL" in t or "NUMERIC" in t:
        return "NUMERIC"

    if "DATE" in t:
        return "DATE"

    if "TIME" in t:
        return "TIMESTAMP"

    if "BOOL" in t:
        return "BOOLEAN"

    if "BLOB" in t:
        return "BYTEA"

    return "TEXT"


# ============================================================
# REMOVE PREVIOUS PARTIAL MIGRATION
# ============================================================

print("\nRemoving previous partial migration...")

for table_name in table_names:

    drop_sql = sql.SQL(
        'DROP TABLE IF EXISTS {} CASCADE'
    ).format(
        sql.Identifier(table_name)
    )

    pg_cursor.execute(drop_sql)

pg_conn.commit()

print("Previous partial tables removed.")


# ============================================================
# CREATE TABLES
# ============================================================

print("\nCreating PostgreSQL tables...")

for table_name in table_names:

    columns = sqlite_cursor.execute(
        f'PRAGMA table_info("{table_name}")'
    ).fetchall()

    definitions = []

    # Find all primary-key columns
    primary_key_columns = [
        column["name"]
        for column in columns
        if column["pk"] > 0
    ]

    for column in columns:

        column_name = column["name"]
        sqlite_type = column["type"]
        not_null = column["notnull"]

        pg_type = sqlite_to_postgres_type(sqlite_type)

        definition = (
            f'"{column_name}" {pg_type}'
        )

        # Do NOT put PRIMARY KEY here.
        # We add it once below, including composite keys.

        if not_null and column["pk"] == 0:
            definition += " NOT NULL"

        definitions.append(definition)

    # Add primary key correctly
    if primary_key_columns:

        pk_sql = ", ".join(
            f'"{column}"'
            for column in primary_key_columns
        )

        definitions.append(
            f"PRIMARY KEY ({pk_sql})"
        )

    create_sql = f'''
        CREATE TABLE "{table_name}" (
            {", ".join(definitions)}
        )
    '''

    pg_cursor.execute(create_sql)

    if len(primary_key_columns) > 1:
        print(
            f"Created: {table_name} "
            f"(composite PK: {', '.join(primary_key_columns)})"
        )
    else:
        print(f"Created: {table_name}")

pg_conn.commit()


# ============================================================
# INSERT DATA
# ============================================================

print("\nMigrating data...")
print("=" * 60)

for table_name in table_names:

    rows = sqlite_cursor.execute(
        f'SELECT * FROM "{table_name}"'
    ).fetchall()

    if not rows:
        print(f"{table_name}: 0 rows")
        continue

    columns = sqlite_cursor.execute(
        f'PRAGMA table_info("{table_name}")'
    ).fetchall()

    column_names = [
        column["name"]
        for column in columns
    ]

    column_sql = ", ".join(
        f'"{column}"'
        for column in column_names
    )

    placeholders = ", ".join(
        ["%s"] * len(column_names)
    )

    insert_sql = f'''
        INSERT INTO "{table_name}"
        ({column_sql})
        VALUES ({placeholders})
        ON CONFLICT DO NOTHING
    '''

    inserted = 0

        # Get SQLite column types
    column_types = {
        column["name"]: (column["type"] or "").upper()
        for column in columns
    }

    for row in rows:

        values = []

        for column in column_names:

            value = row[column]
            sqlite_type = column_types[column]

            # Convert SQLite 0/1 values to PostgreSQL BOOLEAN
            if "BOOL" in sqlite_type and value is not None:
                value = bool(value)

            values.append(value)

        pg_cursor.execute(
            insert_sql,
            values
        )

        inserted += 1

    pg_conn.commit()

    print(
        f"{table_name}: {inserted} rows migrated"
    )


# ============================================================
# VERIFICATION
# ============================================================

print("\n")
print("=" * 60)
print("MIGRATION VERIFICATION")
print("=" * 60)

total_rows = 0

for table_name in table_names:

    pg_cursor.execute(
        sql.SQL(
            'SELECT COUNT(*) FROM {}'
        ).format(
            sql.Identifier(table_name)
        )
    )

    count = pg_cursor.fetchone()[0]

    total_rows += count

    print(
        f"{table_name}: {count}"
    )

print("=" * 60)
print(f"TOTAL ROWS MIGRATED: {total_rows}")
print("=" * 60)


# ============================================================
# CLOSE CONNECTIONS
# ============================================================

pg_cursor.close()
pg_conn.close()

sqlite_cursor.close()
sqlite_conn.close()

print("\nMIGRATION COMPLETED SUCCESSFULLY!")