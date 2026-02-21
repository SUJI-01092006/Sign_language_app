from app import app, db
from sqlalchemy import text

with app.app_context():
    try:
        # Add parent_phone column to user table
        with db.engine.connect() as conn:
            conn.execute(text('ALTER TABLE user ADD COLUMN parent_phone VARCHAR(20)'))
            conn.commit()
        print("Successfully added parent_phone column to user table")
    except Exception as e:
        if "duplicate column name" in str(e).lower():
            print("parent_phone column already exists")
        else:
            print(f"Error: {e}")
