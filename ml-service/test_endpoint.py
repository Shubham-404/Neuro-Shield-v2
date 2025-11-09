"""
Test script to test the /predict endpoint directly
Run this to debug prediction issues
"""
import requests
import json

def test_predict():
    """Test the prediction endpoint"""
    url = "http://localhost:8000/predict"
    
    # Sample data
    data = {
        "age": 65.0,
        "hypertension": 1,
        "heart_disease": 0,
        "avg_glucose_level": 95.0,
        "bmi": 28.5,
        "smoking_status": "formerly smoked"
    }
    
    print("Testing prediction endpoint...")
    print(f"URL: {url}")
    print(f"Data: {json.dumps(data, indent=2)}")
    print("\nSending request...")
    
    try:
        response = requests.post(url, json=data, timeout=30)
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Success!")
            print(f"Response: {json.dumps(result, indent=2)}")
        else:
            print(f"\n❌ Error!")
            print(f"Response: {response.text}")
            try:
                error_data = response.json()
                print(f"Error JSON: {json.dumps(error_data, indent=2)}")
            except:
                pass
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: ML service is not running on port 8000")
        print("Start it with: uvicorn main:app --host 0.0.0.0 --port 8000 --reload")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_predict()

