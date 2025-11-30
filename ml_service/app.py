"""
ML Service - Handles all ML predictions
Deploy this on Railway/Render (500MB limit, free tier)
"""
import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from joblib import load

app = Flask(__name__)
CORS(app)

# Add parent directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Global variables for caching
ALL_SYMPTOMS = []
model_cache = {}

# Available models
AVAILABLE_MODELS = {
    'Decision Tree': 'decision_tree',
    'Random Forest': 'random_forest',
    'AdaBoost': 'adaboost'
}


def load_symptoms():
    """Load all symptom names from the training dataset"""
    global ALL_SYMPTOMS
    try:
        possible_paths = [
            os.path.join(parent_dir, 'dataset', 'training_data.csv'),
            './dataset/training_data.csv',
            '/var/task/dataset/training_data.csv',
            os.path.join(os.path.dirname(__file__), '..', 'dataset', 'training_data.csv'),
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                df = pd.read_csv(path)
                symptoms = [col for col in df.columns if col != 'prognosis' and not col.startswith('Unnamed')]
                ALL_SYMPTOMS = symptoms
                return symptoms
        
        return []
    except Exception as e:
        print(f"Warning: Could not load symptoms from dataset: {e}")
        return []


def load_model(model_name):
    """Load model with caching"""
    if model_name not in model_cache:
        import urllib.request
        import tempfile
        
        # Try local paths first
        possible_paths = [
            os.path.join(parent_dir, 'saved_model', f'{model_name}.joblib'),
            f"./saved_model/{model_name}.joblib",
            f'/var/task/saved_model/{model_name}.joblib',
            os.path.join(os.path.dirname(__file__), '..', 'saved_model', f'{model_name}.joblib'),
        ]
        
        for model_path in possible_paths:
            if os.path.exists(model_path):
                try:
                    model_cache[model_name] = load(model_path)
                    return model_cache[model_name], None
                except Exception as e:
                    return None, f"Error loading model: {str(e)}"
        
        # Try external URL if available
        base_url = os.environ.get('MODEL_BASE_URL', '')
        if base_url:
            model_url = f"{base_url.rstrip('/')}/{model_name}.joblib"
            try:
                print(f"Downloading model from: {model_url}")
                with tempfile.NamedTemporaryFile(delete=False, suffix='.joblib') as tmp_file:
                    urllib.request.urlretrieve(model_url, tmp_file.name)
                    model_cache[model_name] = load(tmp_file.name)
                    os.unlink(tmp_file.name)
                    return model_cache[model_name], None
            except Exception as e:
                return None, f"Error downloading model: {str(e)}"
        
        return None, f"Model file not found: {model_name}.joblib"
    
    return model_cache[model_name], None


# Initialize symptoms on startup
if not ALL_SYMPTOMS:
    load_symptoms()


@app.route('/', methods=['GET'])
def serve_frontend():
    """Serve the frontend HTML file"""
    try:
        frontend_path = os.path.join(parent_dir, 'public', 'index.html')
        if os.path.exists(frontend_path):
            with open(frontend_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
                response = app.make_response(html_content)
                response.headers['Content-Type'] = 'text/html'
                return response
        else:
            return jsonify({
                'status': 'ok',
                'message': 'ML Service is running',
                'available_models': list(AVAILABLE_MODELS.keys()),
                'note': 'Frontend not found. API endpoints available at /api/*'
            })
    except Exception as e:
        return jsonify({
            'status': 'ok',
            'message': 'ML Service is running',
            'available_models': list(AVAILABLE_MODELS.keys()),
            'error': f'Could not load frontend: {str(e)}'
        })


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'ML Service is running',
        'available_models': list(AVAILABLE_MODELS.keys()),
        'symptoms_loaded': len(ALL_SYMPTOMS) > 0
    })


@app.route('/api/symptoms', methods=['GET'])
def get_symptoms():
    """Get all available symptoms"""
    query = request.args.get('query', '').lower().strip()
    
    if not ALL_SYMPTOMS:
        load_symptoms()
    
    if not query:
        return jsonify({'symptoms': ALL_SYMPTOMS})
    
    # Filter symptoms that match the query
    suggestions = [s for s in ALL_SYMPTOMS if query in s.lower()]
    suggestions = sorted(suggestions, key=lambda x: (not x.lower().startswith(query), x.lower()))
    
    return jsonify({'symptoms': suggestions[:10]})


@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict disease based on symptoms"""
    try:
        data = request.get_json()
        selected_symptoms = data.get('symptoms', [])
        model_choice = data.get('model', 'Decision Tree')
        
        if not selected_symptoms:
            return jsonify({
                'error': 'Please select at least one symptom to get a prediction.'
            }), 400
        
        # Get model name
        model_name = AVAILABLE_MODELS.get(model_choice)
        if not model_name:
            return jsonify({'error': 'Invalid model selection.'}), 400
        
        # Load model
        model, error = load_model(model_name)
        if error:
            return jsonify({'error': error}), 500
        
        # Ensure symptoms are loaded
        if not ALL_SYMPTOMS:
            load_symptoms()
        
        # Create symptoms dictionary (all 0 initially)
        symptoms_dict = {symptom: 0 for symptom in ALL_SYMPTOMS}
        
        # Set selected symptoms to 1
        for symptom in selected_symptoms:
            if symptom in symptoms_dict:
                symptoms_dict[symptom] = 1
        
        # Create DataFrame
        df_test = pd.DataFrame(columns=ALL_SYMPTOMS)
        df_test.loc[0] = np.array([symptoms_dict[s] for s in ALL_SYMPTOMS])
        
        # Make prediction
        prediction = model.predict(df_test)
        disease = prediction[0]
        
        # Get prediction probabilities if available
        top_predictions = []
        try:
            probabilities = model.predict_proba(df_test)[0]
            classes = model.classes_
            top_predictions = sorted(
                zip(classes, probabilities), 
                key=lambda x: x[1], 
                reverse=True
            )[:5]
            top_predictions = [{'disease': d, 'probability': float(p)} for d, p in top_predictions]
        except:
            pass
        
        return jsonify({
            'predicted_disease': disease,
            'top_predictions': top_predictions,
            'model_used': model_choice
        })
        
    except Exception as e:
        return jsonify({'error': f'Error making prediction: {str(e)}'}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting ML Service on port {port}...")
    print(f"Frontend available at: http://localhost:{port}")
    print(f"API available at: http://localhost:{port}/api/")
    app.run(debug=True, host='0.0.0.0', port=port)

