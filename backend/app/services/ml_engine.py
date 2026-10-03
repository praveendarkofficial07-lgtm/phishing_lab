import csv
import logging
from pathlib import Path
from typing import Dict, Any, List, Tuple
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from backend.app.config import MODEL_PATH, VECTORIZER_PATH, DATASET_PATH

logger = logging.getLogger(__name__)

class MLEngine:
    def __init__(self):
        self.model: LogisticRegression | None = None
        self.vectorizer: TfidfVectorizer | None = None
        self.metrics: Dict[str, Any] = {}
        self.is_loaded: bool = False
        self._initialize()

    def _initialize(self):
        try:
            if MODEL_PATH.exists() and VECTORIZER_PATH.exists():
                self.load_model()
            elif DATASET_PATH.exists():
                logger.info("Saved model not found. Training model from dataset...")
                self.train_model()
            else:
                logger.warning("Neither model nor dataset found. Skipping ML initialization.")
        except Exception as e:
            logger.error(f"Error during ML engine initialization: {e}")

    def train_model(self) -> Dict[str, Any]:
        if not DATASET_PATH.exists():
            raise FileNotFoundError(f"Training dataset not found at {DATASET_PATH}")

        df = pd.read_csv(DATASET_PATH)
        df["text"] = df["text"].fillna("")
        # Map labels: phishing -> 1, legitimate -> 0
        df["target"] = df["label"].map({"phishing": 1, "legitimate": 0})

        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=2500,
            sublinear_tf=True,
            stop_words="english"
        )
        X = vectorizer.fit_transform(df["text"])
        y = df["target"].values

        # 5-fold cross validation for real academic evaluation metrics
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        model_cv = LogisticRegression(C=2.0, class_weight="balanced", max_iter=500, solver="lbfgs")
        scoring = ["accuracy", "precision", "recall", "f1"]
        cv_results = cross_validate(model_cv, X, y, cv=cv, scoring=scoring)

        # Fit final production model on full dataset
        final_model = LogisticRegression(C=2.0, class_weight="balanced", max_iter=500, solver="lbfgs", random_state=42)
        final_model.fit(X, y)

        # Save artifacts
        MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(final_model, MODEL_PATH)
        joblib.dump(vectorizer, VECTORIZER_PATH)

        self.model = final_model
        self.vectorizer = vectorizer
        self.is_loaded = True

        self.metrics = {
            "model_type": "TF-IDF + Logistic Regression",
            "sample_count": len(df),
            "phishing_samples": int((df["target"] == 1).sum()),
            "legitimate_samples": int((df["target"] == 0).sum()),
            "accuracy": round(float(cv_results["test_accuracy"].mean()), 4),
            "precision": round(float(cv_results["test_precision"].mean()), 4),
            "recall": round(float(cv_results["test_recall"].mean()), 4),
            "f1_score": round(float(cv_results["test_f1"].mean()), 4),
            "vocabulary_size": len(vectorizer.vocabulary_),
            "status": "Trained & Active"
        }

        logger.info(f"Model successfully trained. CV Accuracy: {self.metrics['accuracy']:.2%}")
        return self.metrics

    def load_model(self):
        self.model = joblib.load(MODEL_PATH)
        self.vectorizer = joblib.load(VECTORIZER_PATH)
        self.is_loaded = True
        self.metrics = {
            "model_type": "TF-IDF + Logistic Regression",
            "vocabulary_size": len(self.vectorizer.vocabulary_),
            "status": "Loaded from Disk"
        }
        logger.info("ML model and vectorizer loaded successfully from disk.")

    def predict(self, text: str) -> Dict[str, Any]:
        if not self.is_loaded or self.model is None or self.vectorizer is None:
            # Fallback if model hasn't been initialized yet
            return {
                "phishing_probability": 0.5,
                "legitimate_probability": 0.5,
                "verdict": "Indeterminate",
                "model_version": "Heuristic fallback (Model uninitialized)",
                "feature_importances": []
            }

        cleaned_text = (text or "").strip()
        if not cleaned_text:
            return {
                "phishing_probability": 0.05,
                "legitimate_probability": 0.95,
                "verdict": "Legitimate",
                "model_version": "TF-IDF + Logistic Regression v1.0",
                "feature_importances": []
            }

        X_vec = self.vectorizer.transform([cleaned_text])
        probs = self.model.predict_proba(X_vec)[0]  # [prob_0, prob_1]
        legit_prob = float(probs[0])
        phish_prob = float(probs[1])

        # Extract top contributing features (words/n-grams) from the input
        feature_names = self.vectorizer.get_feature_names_out()
        coefficients = self.model.coef_[0]
        row_vec = X_vec.toarray()[0]

        contributions = []
        for idx in row_vec.nonzero()[0]:
            word = feature_names[idx]
            tfidf_val = row_vec[idx]
            weight = coefficients[idx]
            impact = tfidf_val * weight
            contributions.append({
                "feature": word,
                "impact": round(float(impact), 4),
                "phishing_correlated": bool(weight > 0)
            })

        # Sort by highest phishing contribution
        contributions.sort(key=lambda x: x["impact"], reverse=True)
        top_features = contributions[:6]

        verdict = "Phishing" if phish_prob >= 0.5 else "Legitimate"

        return {
            "phishing_probability": round(phish_prob, 4),
            "legitimate_probability": round(legit_prob, 4),
            "verdict": verdict,
            "model_version": "TF-IDF + Logistic Regression v1.0",
            "feature_importances": top_features
        }

# Singleton instance
ml_service = MLEngine()
