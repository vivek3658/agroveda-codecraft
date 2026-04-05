import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load dataset
df = pd.read_csv("kaggle_dataset.csv")

print("Original Data:", df.shape)

# =========================
# CLEAN DATA (REALISTIC)
# =========================

# Remove unrealistic patterns
df = df[~((df["label"] == "banana") & (df["rainfall"] < 200))]
df = df[~((df["label"] == "rice") & (df["rainfall"] < 300))]
df = df[~((df["label"] == "apple") & (df["temperature"] > 30))]

print("Cleaned Data:", df.shape)

# =========================
# FEATURES
# =========================
X = df[["N","P","K","temperature","humidity","rainfall","ph"]]
y = df["label"]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# =========================
# MODEL
# =========================
model = RandomForestClassifier(
    n_estimators=300,
    random_state=42
)

# Train
model.fit(X_train, y_train)

# Save model
joblib.dump(model, "label_model.pkl")

print("✅ Model trained and saved")


