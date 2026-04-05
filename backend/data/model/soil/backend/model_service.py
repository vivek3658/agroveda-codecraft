import os
import re
import shutil
import urllib.error
import urllib.request
from pathlib import Path

import json
import joblib
import pdfplumber
import pytesseract
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "label_model.pkl"

model = joblib.load(MODEL_PATH)

RANGES = {
    "N": (0, 150),
    "P": (0, 150),
    "K": (0, 250),
    "temperature": (0, 50),
    "humidity": (0, 100),
    "rainfall": (0, 3000),
    "ph": (0, 14),
}


def configure_tesseract(explicit_cmd=None):
    candidates = []

    if explicit_cmd:
        candidates.append(str(explicit_cmd).strip().strip('"'))

    path_cmd = shutil.which("tesseract")
    if path_cmd:
        candidates.append(path_cmd)

    candidates.extend(
        [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            r"C:\Users\vivek\AppData\Local\Programs\Tesseract-OCR\tesseract.exe",
        ]
    )

    for candidate in candidates:
        if candidate and Path(candidate).exists():
            pytesseract.pytesseract.tesseract_cmd = candidate
            return candidate

    return None


def extract_text_with_ocr_space(file_path):
    api_key = os.environ.get("OCR_SPACE_API_KEY", "").strip()
    endpoint = os.environ.get("OCR_SPACE_ENDPOINT", "https://api.ocr.space/parse/image").strip()

    if not api_key:
        raise RuntimeError(
            "Image OCR is unavailable in this deployment. Set OCR_SPACE_API_KEY in Vercel to enable image OCR fallback."
        )

    boundary = "----AgroVedaOcrBoundary"
    filename = Path(file_path).name
    mime_type = Image.open(file_path).get_format_mimetype() or "application/octet-stream"
    file_bytes = Path(file_path).read_bytes()

    parts = [
        f"--{boundary}\r\n".encode(),
        b'Content-Disposition: form-data; name="language"\r\n\r\neng\r\n',
        f"--{boundary}\r\n".encode(),
        b'Content-Disposition: form-data; name="isOverlayRequired"\r\n\r\nfalse\r\n',
        f"--{boundary}\r\n".encode(),
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'.encode(),
        f"Content-Type: {mime_type}\r\n\r\n".encode(),
        file_bytes,
        b"\r\n",
        f"--{boundary}--\r\n".encode(),
    ]
    body = b"".join(parts)

    request = urllib.request.Request(
        endpoint,
        data=body,
        headers={
            "apikey": api_key,
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        details = error.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"OCR API request failed: {details or error.reason}") from error
    except urllib.error.URLError as error:
        raise RuntimeError(f"OCR API request failed: {error.reason}") from error

    if payload.get("IsErroredOnProcessing"):
        message = "; ".join(payload.get("ErrorMessage") or []) or "OCR processing failed"
        raise RuntimeError(message)

    parsed_results = payload.get("ParsedResults") or []
    text = "\n".join((item.get("ParsedText") or "").strip() for item in parsed_results).strip()
    if not text:
        raise RuntimeError("OCR API returned no readable text from the image.")

    return text


def extract_values(text):
    numbers = re.findall(r"\d+\.?\d*", text or "")
    numbers = [float(n) for n in numbers]
    numbers = [n for n in numbers if n > 2]

    if len(numbers) < 7:
        return {}

    return {
        "N": numbers[0],
        "P": numbers[1],
        "K": numbers[2],
        "temperature": numbers[3],
        "humidity": numbers[4],
        "rainfall": numbers[5],
        "ph": numbers[6] / 10 if numbers[6] > 14 else numbers[6],
    }


def validate_input(data):
    for field, (min_val, max_val) in RANGES.items():
        if field not in data:
            raise ValueError(f"{field} missing")

        value = data[field]
        if not isinstance(value, (int, float)):
            raise ValueError(f"{field} must be number")

        if not (min_val <= value <= max_val):
            raise ValueError(f"{field} must be between {min_val} and {max_val}")


def get_prediction(data):
    input_data = [[
        data["N"],
        data["P"],
        data["K"],
        data["temperature"],
        data["humidity"],
        data["rainfall"],
        data["ph"],
    ]]
    probs = model.predict_proba(input_data)[0]
    classes = model.classes_
    results = sorted(zip(classes, probs), key=lambda x: x[1], reverse=True)

    return [
        {"crop": crop, "confidence": round(float(prob), 4)}
        for crop, prob in results[:3]
    ]


def parse_file(file_path, tesseract_cmd=None):
    file_path = Path(file_path)
    if not file_path.exists():
        raise ValueError("Uploaded file not found")

    suffix = file_path.suffix.lower()
    text = ""

    if suffix in [".png", ".jpg", ".jpeg"]:
        configured_tesseract = configure_tesseract(tesseract_cmd)
        if configured_tesseract:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
        else:
            text = extract_text_with_ocr_space(file_path)
    elif suffix == ".pdf":
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
    else:
        raise ValueError("Unsupported file type")

    extracted = extract_values(text)
    if len(extracted) < 2:
        raise ValueError("Not enough data found in file. Please enter manually.")

    for key in RANGES:
        extracted.setdefault(key, 0)

    return extracted, text
