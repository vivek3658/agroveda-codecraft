function getValue(id) {
    const el = document.getElementById(id);
    return el ? Number(el.value) : 0;
}

// =========================
// MANUAL INPUT
// =========================
async function predict() {

    const data = {
        N: getValue("N"),
        P: getValue("P"),
        K: getValue("K"),
        temperature: getValue("temperature"),
        humidity: getValue("humidity"),
        rainfall: getValue("rainfall"),
        ph: getValue("ph")
    };

    // Check if user filled enough data
    let filled = Object.values(data).filter(v => v > 0).length;

    if (filled < 4) {
        document.getElementById("result").innerText =
            "⚠️ Please fill more details for better prediction!";
        return;
    }

    sendToAPI(data);
}

// =========================
// FILE UPLOAD
// =========================
async function uploadFile() {

    const file = document.getElementById("fileInput").files[0];

    if (!file) {
        alert("Please upload a file!");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData
    });

    const result = await res.json();

    if (result.success) {

        // Auto-fill form
        const data = result.extracted;

console.log("Extracted Data:", data);

// Fill ALL fields properly
document.getElementById("N").value = data.N ?? "";
document.getElementById("P").value = data.P ?? "";
document.getElementById("K").value = data.K ?? "";
document.getElementById("temperature").value = data.temperature ?? "";
document.getElementById("humidity").value = data.humidity ?? "";
document.getElementById("rainfall").value = data.rainfall ?? "";
document.getElementById("ph").value = data.ph ?? "";
        document.getElementById("N").value = data.N;
        document.getElementById("P").value = data.P;
        document.getElementById("K").value = data.K;
        document.getElementById("ph").value = data.ph;

        showResult(result);

    } else {
        document.getElementById("result").innerText = result.error;
    }
}

// =========================
// SEND TO BACKEND
// =========================
async function sendToAPI(data) {

    const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });

    const result = await res.json();
    showResult(result);
}

// =========================
// SHOW RESULT
// =========================
function showResult(result) {
    if (result.success) {
        let output = "🌾 Top Crop Recommendations:\n\n";
        result.top_3.forEach((item, i) => {
            output += `${i+1}. ${item.crop} (${(item.confidence * 100).toFixed(1)}%)\n`;
        });

        document.getElementById("result").innerText = output;
        
        // SHOW THE AI BUTTON
        document.getElementById("aiBtn").style.display = "block"; 

    } else {
        document.getElementById("result").innerText = result.error;
        // HIDE THE AI BUTTON IF ERROR
        document.getElementById("aiBtn").style.display = "none"; 
    }
}
function openDemo(type) {
    if (type === "image") {
        window.open("demo.png", "_blank");
    } else {
        window.open("demo.pdf", "_blank");
    }
}

// =========================
// OPEN CHATBOT WITH DATA
// =========================
function openChatbot() {
    // 1. Grab all input values
    const data = {
        N: getValue("N"),
        P: getValue("P"),
        K: getValue("K"),
        temperature: getValue("temperature"),
        humidity: getValue("humidity"),
        rainfall: getValue("rainfall"),
        ph: getValue("ph"),
        result: document.getElementById("result").innerText
    };

    // 2. Pack data into a URL string
    const encodedData = encodeURIComponent(JSON.stringify(data));
    
    // 3. Open Chatbot in new tab (Change 5173 if your chatbot uses a different port)
    window.location.href = `http://localhost:5174/?predict=${encodedData}`;
}

