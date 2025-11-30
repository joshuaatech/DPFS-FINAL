# Disease Prediction from Symptoms

AI-powered disease prediction system using machine learning algorithms to predict diseases from symptoms.

## 🚀 Quick Start

### Deploy to Cloudflare Workers (Recommended)

1. **Deploy ML Service** to Railway or Render (see `ml_service/README.md`)
2. **Deploy Cloudflare Worker** (see `QUICK_START_CLOUDFLARE.md`)
3. **Deploy Frontend** to Cloudflare Pages or any static host

See `CLOUDFLARE_DEPLOYMENT.md` for complete instructions.

## 📁 Project Structure

```
DPFS/
├── cloudflare-worker/      # Cloudflare Worker API (JavaScript)
├── ml_service/             # ML Service (Python, deploy to Railway/Render)
├── public/                 # Frontend (HTML/CSS/JS)
├── dataset/                # Training data
├── saved_model/            # Trained ML models
└── main.py                 # Training script
```

## 🏗️ Architecture

```
User → Cloudflare Worker → ML Service (Railway/Render) → Response
```

- **Cloudflare Worker**: Lightweight API proxy (no size limits)
- **ML Service**: Handles all ML predictions (Railway/Render)
- **Frontend**: Static HTML/CSS/JS (Cloudflare Pages or any host)

## 🤖 ML Algorithms

1. Decision Tree
2. Random Forest
3. AdaBoost
4. Naive Bayes
5. Gradient Boosting

## 📊 Dataset

The dataset contains 132 symptoms and disease prognosis.

Source: [Kaggle - Disease Prediction Dataset](https://www.kaggle.com/kaushil268/disease-prediction-using-machine-learning)

## 🛠️ Local Development

### Train Models

```bash
python main.py
```

### Run ML Service Locally

```bash
cd ml_service
python app.py
```

### Run Cloudflare Worker Locally

```bash
cd cloudflare-worker
wrangler dev
```

## 📚 Documentation

- `CLOUDFLARE_DEPLOYMENT.md` - Complete Cloudflare deployment guide
- `QUICK_START_CLOUDFLARE.md` - 5-minute quick start
- `ml_service/README.md` - ML service documentation
- `cloudflare-worker/README.md` - Worker documentation

## ⚠️ Medical Disclaimer

This tool is for educational purposes only. Always consult a qualified medical professional for actual health concerns and diagnosis.

## 📝 License

MIT License
