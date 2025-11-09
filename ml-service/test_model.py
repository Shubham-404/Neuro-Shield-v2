"""
Test script to verify model loading and prediction
Run this to test if your model file works correctly
"""
import pickle
import os
import numpy as np

def test_model():
    """Test model loading and prediction"""
    model_path = os.getenv("MODEL_PATH", "model.pkl")
    
    # Try to find model
    possible_paths = [
        model_path,
        f"models/{model_path}",
        f"../{model_path}",
        f"./ml-service/{model_path}",
    ]
    
    model_file = None
    for path in possible_paths:
        if os.path.exists(path):
            model_file = path
            break
    
    if not model_file:
        print(f"❌ Model file not found. Tried: {possible_paths}")
        return False
    
    print(f"✅ Found model at: {model_file}")
    
    try:
        # Load model
        print("Loading model...")
        with open(model_file, 'rb') as f:
            model = pickle.load(f)
        print("✅ Model loaded successfully!")
        
        # Check model type
        print(f"Model type: {type(model)}")
        print(f"Has predict method: {hasattr(model, 'predict')}")
        print(f"Has predict_proba method: {hasattr(model, 'predict_proba')}")
        print(f"Has feature_importances_: {hasattr(model, 'feature_importances_')}")
        
        # Test prediction with sample data
        print("\nTesting prediction with sample data...")
        sample_features = np.array([[
            65.0,  # age
            1,     # hypertension
            0,     # heart_disease
            95.0,  # avg_glucose_level
            28.5,  # bmi
            1      # smoking_status (formerly smoked)
        ]])
        
        prediction = model.predict(sample_features)[0]
        print(f"✅ Prediction: {prediction}")
        
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(sample_features)[0]
            print(f"✅ Probabilities: {probabilities}")
        else:
            print("⚠️  Model does not support predict_proba")
        
        if hasattr(model, 'feature_importances_'):
            print(f"✅ Feature importances: {model.feature_importances_}")
        
        print("\n✅ All tests passed! Model is ready to use.")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_model()

