import psycopg2

# Database connection parameters
params = {
    'dbname': 'optics_tenant',
    'user': 'taha1',  # Using postgres user to grant permissions
    'password': '3112',  # Adjust this if your postgres password is different
    'host': 'localhost',
    'port': '5432'
}

try:
    # Connect to the database as postgres user
    conn = psycopg2.connect(**params)
    conn.autocommit = True  # Enable autocommit for DDL operations
    cursor = conn.cursor()
    
    # Grant all privileges on public schema to taha1
    cursor.execute("GRANT ALL PRIVILEGES ON SCHEMA public TO taha1;")
    cursor.execute("GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO taha1;")
    cursor.execute("GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO taha1;")
    
    print("Database permissions granted successfully")
    
except Exception as e:
    print(f"Error: {e}")
finally:
    if conn:
        cursor.close()
        conn.close()


# run code
# python scripts/setup_db.py
