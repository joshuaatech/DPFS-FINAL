# ML Service - Disease Prediction

This is the ML service that handles all machine learning predictions. It contains all the heavy dependencies (scikit-learn, pandas, numpy) and should be deployed on Railway or Render.

## Files

- `app.py` - Main Flask application with ML logic
- `requirements.txt` - ML dependencies
- `Procfile` - For Railway/Render deployment
- `runtime.txt` - Python version

## Deployment

### Railway (Recommended)
1. Create new project on Railway
2. Set root directory to `ml_service`
3. Deploy from GitHub
4. Railway auto-detects Python and requirements.txt

### Render
1. Create new Web Service
2. Set root directory to `ml_service`
3. Build command: `pip install -r requirements.txt`
4. Start command: `python app.py`

## Environment Variables

- `PORT` - Port number (auto-assigned by platform)
- `MODEL_BASE_URL` - External model storage URL (optional)

## Endpoints

- `GET /health` - Health check
- `GET /api/symptoms` - Get all symptoms
- `POST /api/predict` - Make prediction

## Note

This service needs access to:
- `dataset/training_data.csv` (for symptoms list)
- `saved_model/*.joblib` (model files)

Make sure these are included in the deployment or use `MODEL_BASE_URL` for external storage.

