import psycopg2
from psycopg2 import sql

# Admin connection (Postgres superuser)
admin_params = {
    'dbname': 'postgres',
    'user': 'postgres',  # يجب أن يكون user لديه صلاحيات إنشاء قواعد
    'password': '3112',
    'host': 'localhost',
    'port': '5432'
}

# Database name and user to grant privileges to
target_db = 'optics_tenant'
target_user = 'taha1'

try:
    # Connect to default postgres DB to check or create the target DB
    conn = psycopg2.connect(**admin_params)
    conn.autocommit = True
    cursor = conn.cursor()

    # Check if database exists
    cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (target_db,))
    exists = cursor.fetchone()

    if not exists:
        cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(target_db)))
        print(f"✅ Database '{target_db}' created successfully.")
    else:
        print(f"ℹ️ Database '{target_db}' already exists.")

    cursor.close()
    conn.close()

    # Connect to the target DB now to grant privileges
    db_conn = psycopg2.connect(
        dbname=target_db,
        user='postgres',
        password='3112',
        host='localhost',
        port='5432'
    )
    db_conn.autocommit = True
    db_cursor = db_conn.cursor()

    # Grant all privileges on schema public, tables, sequences
    db_cursor.execute(f"GRANT ALL PRIVILEGES ON SCHEMA public TO {target_user};")
    db_cursor.execute(f"GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO {target_user};")
    db_cursor.execute(f"GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO {target_user};")
    db_cursor.execute(f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO {target_user};")
    db_cursor.execute(f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO {target_user};")

    print(f"✅ All privileges granted to user '{target_user}' on '{target_db}' and schema 'public'.")

except Exception as e:
    print(f"❌ Error: {e}")
finally:
    if 'db_cursor' in locals():
        db_cursor.close()
    if 'db_conn' in locals():
        db_conn.close()
