import sys
import os

# Add the backend directory to the Python path so Vercel can find the modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import the Flask app instance
from backend.app import app
