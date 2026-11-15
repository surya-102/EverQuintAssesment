class ApiError(Exception):
    def __init__(self, status, error, message):
        self.status = status
        self.error = error
        self.message = message


def validation_error(message):
    return ApiError(400, "ValidationError", message)


def not_found(message):
    return ApiError(404, "NotFound", message)


def conflict(message):
    return ApiError(409, "Conflict", message)
