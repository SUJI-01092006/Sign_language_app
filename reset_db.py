import os
import shutil
from app import app, db

# Remove old database
db_path = 'instance/signlanguage.db'
if os.path.exists(db_path):
    os.remove(db_path)
    print(f"Deleted old database: {db_path}")

# Create new database with updated schema
with app.app_context():
    db.create_all()
    print("Created new database with updated schema")
    print("Database reset complete!")
