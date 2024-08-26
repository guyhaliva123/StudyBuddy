from factory import create_app
import logging
# app from new repo.
logging.basicConfig(level=logging.INFO)

app = create_app()

if __name__ == "__main__":
    app.run(debug=True ,host="0.0.0.0", port=5000)