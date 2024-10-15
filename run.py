from backend.app import create_app
from flask_cors import CORS

app = create_app()
CORS(app, resources={r"/*": {"origins": "*"}})

if __name__ == '__main__':
    # Use the IP address of your computer and a port accessible to your phone
    app.run(host="0.0.0.0", debug=True)
