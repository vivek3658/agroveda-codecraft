import json
import os
import sys
from model_service import get_prediction, parse_file, validate_input


def fail(message):
    print(json.dumps({"success": False, "error": message}))
    sys.exit(1)

def main():
    if len(sys.argv) < 3:
        fail("Usage: soil_cli.py predict-json <json> | predict-file <path>")

    command = sys.argv[1]
    payload = sys.argv[2]

    if command == "predict-json":
        data = json.loads(payload)
        try:
            validate_input(data)
        except ValueError as error:
            fail(str(error))
        result = {
            "success": True,
            "extracted": data,
            "top_3": get_prediction(data),
        }
        print(json.dumps(result))
        return

    if command == "predict-file":
        try:
            extracted, raw_text = parse_file(payload, os.environ.get("TESSERACT_CMD"))
        except (ValueError, RuntimeError) as error:
            fail(str(error))
        result = {
            "success": True,
            "extracted": extracted,
            "top_3": get_prediction(extracted),
            "raw_text": raw_text,
        }
        print(json.dumps(result))
        return

    fail("Unknown command")


if __name__ == "__main__":
    main()
