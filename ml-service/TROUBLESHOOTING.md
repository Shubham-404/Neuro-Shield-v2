# ML Service Troubleshooting Guide

## 500 Internal Server Error on /predict

If you're getting a 500 error, follow these steps:

### 1. Check if the ML service is running
```bash
curl http://localhost:8000/health
```
Should return: `{"status": "healthy", "model_loaded": true}`

### 2. Check if model is loaded
```bash
curl http://localhost:8000/
```
Should show `"model_loaded": true`

### 3. Check model information
```bash
curl http://localhost:8000/model-info
```
This will show:
- Model type
- Number of features expected
- Feature names (if available)
- Whether it supports predict_proba

### 4. Check ML service logs
Look at the terminal where you started the ML service. The enhanced logging will show:
- Input data received
- Preprocessed features
- Prediction results
- Any errors with full traceback

### 5. Common Issues and Fixes

#### Issue: Model expects different number of features
**Symptom**: Error like "X has 6 features, but Model expects 10 features"

**Fix**: Your model was trained with different features. Check the model-info endpoint to see how many features it expects, then update `preprocess_input()` in `main.py` to match.

#### Issue: Model expects different feature order
**Symptom**: Prediction works but gives wrong results

**Fix**: The order of features in the array must match the training data. Check your model's `feature_names_in_` attribute and reorder the features array accordingly.

#### Issue: Model expects scaled/normalized features
**Symptom**: Predictions are incorrect

**Fix**: If your model was trained with StandardScaler or other preprocessing, you need to apply the same transformation. You may need to save the scaler with the model and load it.

#### Issue: Model file is corrupted
**Symptom**: Error loading model or pickle errors

**Fix**: 
1. Verify the model.pkl file exists and is not corrupted
2. Try loading it in Python:
   ```python
   import pickle
   with open('model.pkl', 'rb') as f:
       model = pickle.load(f)
   print(type(model))
   print(dir(model))
   ```

### 6. Test the endpoint directly
Use the test script:
```bash
cd ml-service
python test_endpoint.py
```

Or use curl:
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 65.0,
    "hypertension": 1,
    "heart_disease": 0,
    "avg_glucose_level": 95.0,
    "bmi": 28.5,
    "smoking_status": "formerly smoked"
  }'
```

### 7. Check the actual error
The enhanced logging will show the exact error. Look for:
- `Model prediction error:` - The model.predict() call failed
- `Error getting probability:` - The predict_proba() call failed
- `Prediction error:` - General error in the prediction flow

### 8. Model Feature Requirements

The current implementation expects 6 features in this order:
1. age (float)
2. hypertension (0 or 1)
3. heart_disease (0 or 1)
4. avg_glucose_level (float)
5. bmi (float)
6. smoking_status (0, 1, or 2 - mapped from string)

If your model expects different features, update the `preprocess_input()` function.

### 9. Debugging Steps

1. **Check model type**: Look at the logs when the model loads - it should show the model type
2. **Test with known data**: Use the test_endpoint.py script with sample data
3. **Inspect model**: Use the /model-info endpoint to see what the model expects
4. **Check feature count**: Ensure the number of features matches
5. **Check feature order**: Ensure the order matches training data
6. **Check data types**: Ensure all values are numeric (no strings except smoking_status mapping)

### 10. Getting Help

If the issue persists:
1. Check the ML service terminal logs (they now have detailed error messages)
2. Run `python test_endpoint.py` and share the output
3. Check `/model-info` endpoint response
4. Share the exact error message from the logs

