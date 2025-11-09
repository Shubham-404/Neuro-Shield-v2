# Prediction Troubleshooting Guide

## Common Errors and Fixes

### 1. "ML service is not available"

**Error:** `ML service is not available. Please ensure the ML service is running on port 8000.`

**Fix:**
```bash
# Start the ML service
cd ml-service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Check:**
- ML service is running: `curl http://localhost:8000/health`
- Should return: `{"status": "healthy", "model_loaded": true}`

---

### 2. "Model not loaded"

**Error:** `Model not loaded. Please ensure model.pkl file exists.`

**Fix:**
1. Place your `model.pkl` file in `ml-service/` directory
2. Or set environment variable: `MODEL_PATH=path/to/your/model.pkl`
3. Restart ML service

**Test model:**
```bash
cd ml-service
python test_model.py
```

---

### 3. "Missing required patient data"

**Error:** `Missing required patient data: age, avg_glucose_level, bmi`

**Fix:**
- Go to patient detail page
- Update patient information with required fields:
  - Age
  - Average Glucose Level
  - BMI
- Then try prediction again

---

### 4. "Connection refused" or "ECONNREFUSED"

**Error:** Connection to ML service fails

**Fix:**
1. Check ML service is running:
   ```bash
   # In ml-service directory
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

2. Check `.env` file in root directory:
   ```env
   ML_SERVICE_URL=http://localhost:8000
   ```

3. Verify port 8000 is not in use:
   ```bash
   # Windows
   netstat -ano | findstr :8000
   
   # Linux/Mac
   lsof -i :8000
   ```

---

### 5. "Invalid input values" or "NaN detected"

**Error:** Model receives invalid data

**Fix:**
- Ensure patient data has valid numeric values
- Check for null/undefined values in patient record
- Update patient information with valid data

---

### 6. "Model prediction failed"

**Error:** Model throws an error during prediction

**Possible causes:**
- Model expects different feature format
- Model file is corrupted
- Feature count mismatch

**Fix:**
1. Test model directly:
   ```bash
   cd ml-service
   python test_model.py
   ```

2. Check model input format in `main.py`:
   - Update `preprocess_input()` function
   - Adjust feature order to match your model

3. Check model type:
   - Ensure it's a scikit-learn compatible model
   - Or update loading code in `main.py`

---

### 7. "Prediction failed" (Generic)

**Steps to debug:**

1. **Check ML service logs:**
   - Look at terminal where ML service is running
   - Check for Python errors

2. **Check Node.js backend logs:**
   - Look at terminal where backend is running
   - Check for connection errors

3. **Test ML service directly:**
   ```bash
   curl -X POST http://localhost:8000/predict \
     -H "Content-Type: application/json" \
     -d '{
       "age": 65,
       "hypertension": 1,
       "heart_disease": 0,
       "avg_glucose_level": 95.0,
       "bmi": 28.5,
       "smoking_status": "formerly smoked"
     }'
   ```

4. **Check browser console:**
   - Open DevTools (F12)
   - Check Network tab for failed requests
   - Check Console for errors

---

## Quick Checklist

Before running prediction, ensure:

- [ ] ML service is running on port 8000
- [ ] Model file (`model.pkl`) exists in `ml-service/` directory
- [ ] Patient has required data: age, avg_glucose_level, bmi
- [ ] `.env` file has `ML_SERVICE_URL=http://localhost:8000`
- [ ] All dependencies installed (`pip install -r requirements.txt` in ml-service)

---

## Testing Steps

1. **Test ML service health:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Test model loading:**
   ```bash
   cd ml-service
   python test_model.py
   ```

3. **Test prediction endpoint:**
   ```bash
   curl -X POST http://localhost:8000/predict \
     -H "Content-Type: application/json" \
     -d '{"age":65,"hypertension":1,"heart_disease":0,"avg_glucose_level":95.0,"bmi":28.5,"smoking_status":"formerly smoked"}'
   ```

4. **Test through frontend:**
   - Login as doctor
   - Go to patient page
   - Ensure patient has required data
   - Click "Run Prediction"

---

## Still Having Issues?

1. Check all terminal outputs for error messages
2. Verify model file is not corrupted
3. Ensure Python version is 3.8+
4. Check all environment variables are set correctly
5. Review the error message in the browser toast notification

