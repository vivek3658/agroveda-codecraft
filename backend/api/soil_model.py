import os
import tempfile
from pathlib import Path

from flask import Flask, jsonify, request

from data.model.soil.backend.model_service import get_prediction, parse_file, validate_input

app = Flask(__name__)


@app.route("/")
@app.route("/api/internal/soil-model")
def health():
    return jsonify({"success": True, "message": "Soil model function is running"})


@app.route("/", methods=["POST"])
@app.route("/api/internal/soil-model", methods=["POST"])
def predict():
    mode = request.form.get("mode")

    if request.is_json:
        mode = (request.json or {}).get("mode")

    try:
        if mode == "predict-json":
            payload = (request.json or {}).get("payload") or {}
            validate_input(payload)
            return jsonify({
                "success": True,
                "extracted": payload,
                "top_3": get_prediction(payload),
            })

        if mode == "predict-file":
            upload = request.files.get("file")
            if not upload:
                return jsonify({"success": False, "error": "File is required"}), 400

            suffix = Path(upload.filename or "").suffix or ".bin"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                upload.save(tmp.name)
                tmp_path = tmp.name

            try:
                extracted, raw_text = parse_file(tmp_path, os.environ.get("TESSERACT_CMD"))
            finally:
                Path(tmp_path).unlink(missing_ok=True)

            return jsonify({
                "success": True,
                "extracted": extracted,
                "top_3": get_prediction(extracted),
                "raw_text": raw_text,
            })

        return jsonify({"success": False, "error": "Unknown mode"}), 400
    except (ValueError, RuntimeError) as error:
        return jsonify({"success": False, "error": str(error)}), 400
