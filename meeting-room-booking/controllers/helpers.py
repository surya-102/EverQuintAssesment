from flask import request

from errors import validation_error


def int_arg(name, default=None):
    value = request.args.get(name)
    if value is None:
        return default
    try:
        return int(value)
    except ValueError:
        raise validation_error(f"{name} must be an integer")
