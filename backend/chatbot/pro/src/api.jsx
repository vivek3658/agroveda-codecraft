import { createClient } from '@supabase/supabase-js';

// CONNECT TO YOUR FERTILIZER DATABASE
const supabase = createClient(
  'https://imzhlbaeqyafazlbosds.supabase.co', 
  'sb_publishable_5vsIIJYriV7Xr6jWqU9Xiw_terMz-Zv' 
);

const API_KEY = import.meta.env.VITE_GEMINI_KEY;

// ==========================================
// 1. SOIL PHOTO/PDF ANALYZER (UNCHANGED)
// ==========================================
export const analyzeSoil = async (mimeType, base64Data, fileName, language) => {
  try {
    const fileType = mimeType.startsWith("image") ? "image" : "PDF document";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [
              { inlineData: { mimeType, data: base64Data } },
              { text: `You are AgroVeda, an expert agricultural soil scientist. Analyze this ${fileType} named "${fileName}".

ABSOLUTE RESPONSE RULES:
- Your VERY FIRST character MUST be an emoji — NEVER start with a regular word
- NEVER write: "Here is...", "Based on...", "Sure...", "I can help...", "Looking at...", "This image shows..."
- NO introduction. NO conclusion. NO pleasantries. NO meta-commentary.
- Reply ONLY in ${language}
- Use simple farmer-friendly language
- Use emojis for section headings only
- Bullet points: MAX 2 lines each

FERTILIZER DOSAGE RULES (CRITICAL):
- Give exact fertilizer names + quantities in BOTH "per acre" AND "per 100 sq ft"
- If nutrient is LOW → specific fix with quantity (e.g., "Urea: 25 kg/acre, 5 kg/100 sq ft")
- If nutrient is HIGH → warn "Do NOT add [fertilizer]" + how to reduce it
- N low → Urea or Ammonium Sulfate
- P low → DAP or SSP
- K low → MOP (Muriate of Potash)
- pH low → Agricultural Lime
- pH high → Elemental Sulfur or Gypsum
- Salts high → Gypsum + heavy watering
- Organic matter low → FYM or Compost

FORMAT (follow exactly):
🌿 **Soil Type:** (one line)

---

✅ **What's Good:**
- (points)

---

⚠️ **What's Bad:**
- (points with specific numbers)

---

🧪 **Fertilizer Dosage:**
- (for EACH bad item: exact fertilizer + per acre + per 100 sq ft)

---

💡 **Tips:**
- (2-3 practical tips)

---

📷 **Need Better Photo?**
(one line)

If file has NO soil info say: "❌ This does not contain soil information. Please upload a soil photo or report." in ${language}.` },
            ],
          }],
        }),
      }
    );
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Could not read response. Try again.";
  } catch (error) {
    console.error("API Error:", error);
    return "Error connecting to service. Check internet and try again.";
  }
};

// ==========================================
// 2. TEXT CHAT AI (CONNECTED TO YOUR DATABASE)
// ==========================================
export const sendToAI = async (message, language) => {
  try {
    // 1. Fetch products from your fertilizer store
    const { data: products } = await supabase.from('products').select('*');
    let storeContext = "";

    // 2. Match products based on what user typed
    if (products && products.length > 0) {
      const keywords = message.toLowerCase().split(/\s+/);
      const matched = products.filter(p => {
        const text = `${p.product_name} ${p.brand} ${p.fertilizer_type} ${p.npk_ratio} ${p.target_crops}`.toLowerCase();
        return keywords.some(kw => text.includes(kw));
      }).slice(0, 5); // Get top 5 matches

      // 3. If we found matching products, force the AI to recommend them
      if (matched.length > 0) {
        storeContext = `

🏪 PRODUCTS AVAILABLE IN OUR STORE RIGHT NOW:
 ${matched.map(p => `- ${p.product_name} (Brand: ${p.brand || 'N/A'}, Type: ${p.fertilizer_type || 'N/A'}, NPK: ${p.npk_ratio || 'N/A'}, Price: ₹${p.price}, Weight: ${p.net_weight || 'N/A'})`).join('\n')}

⚠️ STRICT INSTRUCTION: If the user is asking to buy fertilizer or for recommendations, YOU MUST suggest from the store list above. Use their EXACT prices and brands. Do not make up fake products.`;
      }
    }

    // 4. Send to Gemini with store data
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: `You are AgroVeda AI — an expert soil scientist and fertilizer advisor.

RULES:
1. First character MUST be an emoji.
2. NO introductions like "Here is...". Start directly with the answer.
3. Reply ONLY in ${language}.
4. Keep bullet points MAX 2 lines.
 ${storeContext}

Farmer's question: ${message}`,
            }],
          }],
        }),
      }
    );
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
  } catch (error) {
    console.error("API Error:", error);
    return "Error connecting to service.";
  }
};