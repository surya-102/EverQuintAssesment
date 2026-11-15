from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException

from controllers.booking_controller import booking_bp
from controllers.report_controller import report_bp
from controllers.room_controller import room_bp
from errors import ApiError
from repositories import database


def create_app():
    app = Flask(__name__)
    database.init_db()

    app.register_blueprint(room_bp)
    app.register_blueprint(booking_bp)
    app.register_blueprint(report_bp)

    @app.errorhandler(ApiError)
    def handle_api_error(e):
        return jsonify({"error": e.error, "message": e.message}), e.status

    @app.errorhandler(HTTPException)
    def handle_http_error(e):
        return jsonify({"error": e.name, "message": e.description}), e.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(e):
        return jsonify({"error": "InternalError", "message": "Something went wrong"}), 500

    return app


if __name__ == "__main__":
    create_app().run(port=5000)
