from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pytesseract
from PIL import Image
import pdfplumber
import re
import os
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r"C:\Users\praja\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"
app = Flask(__name__)
CORS(app)

# =========================
# LOAD MODEL
# =========================
model = joblib.load("label_model.pkl")

# =========================
# VALIDATION RANGES
# =========================
RANGES = {
    "N": (0, 150),
    "P": (0, 150),
    "K": (0, 250),
    "temperature": (0, 50),
    "humidity": (0, 100),
    "rainfall": (0, 3000),
    "ph": (0, 14)
}

# =========================
# TEXT → DATA EXTRACTOR
# =========================
import re

def extract_values(text):
    data = {}

    print("RAW TEXT:\n", text)

    # Extract ALL numbers (including decimals)
    numbers = re.findall(r"\d+\.?\d*", text)

    print("NUMBERS FOUND:", numbers)

    # Convert to float
    numbers = [float(n) for n in numbers]

    # Remove unwanted small numbers like 1 (from "Test Case 1")
    numbers = [n for n in numbers if n > 2]

    print("FILTERED NUMBERS:", numbers)

    # Must have at least 7 values
    if len(numbers) >= 7:
        data = {
            "N": numbers[0],
            "P": numbers[1],
            "K": numbers[2],
            "temperature": numbers[3],
            "humidity": numbers[4],
            "rainfall": numbers[5],
            "ph": numbers[6] / 10 if numbers[6] > 14 else numbers[6]
        }

    print("FINAL EXTRACTED:", data)
    return data




def get_prediction(data):

    input_data = [[
        data["N"],
        data["P"],
        data["K"],
        data["temperature"],
        data["humidity"],
        data["rainfall"],
        data["ph"]
    ]]

    probs = model.predict_proba(input_data)[0]
    classes = model.classes_

    results = sorted(zip(classes, probs), key=lambda x: x[1], reverse=True)

    top3 = [
        {"crop": crop, "confidence": round(float(prob), 2)}
        for crop, prob in results[:3]
    ]

    return top3

# =========================
# MANUAL PREDICT API
# =========================
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        # Check missing
        for field in RANGES:
            if field not in data:
                return jsonify({"success": False, "error": f"{field} missing"})

        # Validate
        for field, (min_val, max_val) in RANGES.items():
            value = data[field]
            if not isinstance(value, (int, float)):
                return jsonify({"success": False, "error": f"{field} must be number"})
            if not (min_val <= value <= max_val):
                return jsonify({"success": False, "error": f"{field} must be {min_val}-{max_val}"})

        top3 = get_prediction(data)

        return jsonify({
            "success": True,
            "top_3": top3
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

# =========================
# FILE UPLOAD API (MAIN FEATURE 🚀)
# =========================
@app.route("/upload", methods=["POST"])
def upload():
    try:
        if "file" not in request.files:
            return jsonify({"success": False, "error": "No file uploaded"})

        file = request.files["file"]
        filename = file.filename.lower()

        text = ""

        # =========================
        # IMAGE PROCESSING
        # =========================
        if filename.endswith((".png", ".jpg", ".jpeg")):
            image = Image.open(file)
            text = pytesseract.image_to_string(image)

        # =========================
        # PDF PROCESSING
        # =========================
        elif filename.endswith(".pdf"):
            with pdfplumber.open(file) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""

        else:
            return jsonify({"success": False, "error": "Unsupported file type"})

        print("Extracted Text:", text)

        # =========================
        # EXTRACT VALUES
        # =========================
        extracted = extract_values(text)

        if len(extracted) < 2:
            return jsonify({
                "success": False,
                "error": "⚠️ Not enough data found in file. Please enter manually."
            })

        # Fill missing values with default (optional)
        for key in RANGES:
            if key not in extracted:
                extracted[key] = 0

        # =========================
        # PREDICT
        # =========================
        top3 = get_prediction(extracted)

        return jsonify({
            "success": True,
            "extracted": extracted,
            "top_3": top3
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

# =========================
# HEALTH CHECK
# =========================
@app.route("/health")
def health():
    return jsonify({"status": "OK"})

# =========================
# RUN SERVER
# =========================
if __name__ == "__main__":
    app.run(debug=True)