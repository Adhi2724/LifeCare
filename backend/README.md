# Dataset-Driven AI Symptom Checker Backend

Express.js REST API backend for an intelligent, dataset-driven AI Symptom Checker suitable for IEEE research publications.

## 🔬 Research Features

### **Algorithm Overview**
- **Dataset-driven matching**: Uses structured medical dataset instead of rule-based logic
- **Multi-metric similarity scoring**: Combines Jaccard similarity and overlap coefficient
- **Explainable AI**: Provides detailed explanations for each diagnosis match
- **Confidence scoring**: Weighted algorithm considering symptom overlap, coverage, and severity

### **Scoring Algorithm**
```
Confidence Score = (Jaccard × 0.4) + (Overlap × 0.3) + (Coverage × 0.2) + (Severity × 0.1)

Where:
- Jaccard Similarity = |A ∩ B| / |A ∪ B|
- Overlap Coefficient = |A ∩ B| / min(|A|, |B|)
- Coverage = Matched Symptoms / User Symptoms
- Severity = Adjustment based on condition severity
```

## 📊 Dataset Structure

### **Medical Dataset Fields**
```json
{
  "disease": "Disease Name",
  "symptoms": ["symptom1", "symptom2", "symptom3"],
  "specialist": "Medical Specialist",
  "precautions": ["precaution1", "precaution2"],
  "severity": "mild|moderate|severe",
  "emergency": true|false
}
```

### **Current Dataset**
- **15 diseases** with comprehensive symptom mappings
- **Emergency detection** for critical conditions
- **Multi-specialty coverage**: Pulmonology, Cardiology, Neurology, etc.

## 🚀 Features

- ✅ Language detection (Tamil/English)
- ✅ Symptom normalization and deduplication
- ✅ Dataset-driven disease matching
- ✅ Confidence scoring with explainable results
- ✅ Emergency condition detection
- ✅ Specialist recommendations
- ✅ CORS enabled for frontend communication
- ✅ Modular, research-friendly architecture

## 📋 API Endpoints

### Health Check
- **GET** `/health`
- Returns: Server status and dataset information

### Analyze Symptoms
- **POST** `/api/analyze-symptoms`
- **Request Body:**
  ```json
  {
    "symptoms": "fever, cough, headache"
  }
  ```
- **Response:**
  ```json
  {
    "normalizedSymptoms": ["fever", "cough", "headache"],
    "language": "English",
    "possibleDiseases": [
      {
        "name": "Influenza",
        "confidence": 0.85,
        "explanation": "Matched 3 out of 3 reported symptoms...",
        "severity": "moderate"
      }
    ],
    "precautions": [...],
    "recommendedSpecialist": "General Practitioner",
    "emergencyWarning": null,
    "disclaimer": "...",
    "explanation": "Analysis completed using symptom-disease matching algorithm..."
  }
  ```

### Dataset Information
- **GET** `/api/dataset-info`
- Returns: Dataset statistics for research purposes

## 🏗️ Architecture

```
backend/
├── server.js              # Main Express server
├── utils/
│   └── symptom-analyzer.js # Core analysis algorithm
├── data/
│   └── medical-dataset.json # Structured medical dataset
├── package.json           # Dependencies
└── README.md             # This file
```

## 🔧 Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Start production server:**
   ```bash
   npm start
   ```

## 🧪 Testing

### **Health Check:**
```bash
curl http://localhost:5000/health
```

### **Dataset Info:**
```bash
curl http://localhost:5000/api/dataset-info
```

### **Symptom Analysis:**
```bash
curl -X POST http://localhost:5000/api/analyze-symptoms \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "fever, cough, headache"}'
```

## 📈 Research Applications

### **Suitable for IEEE Papers on:**
- **Medical AI Systems**
- **Symptom Analysis Algorithms**
- **Healthcare Decision Support**
- **Explainable AI in Medicine**
- **Dataset-driven Medical Diagnosis**

### **Key Research Contributions:**
1. **Novel Scoring Algorithm**: Multi-metric confidence calculation
2. **Explainable Results**: Detailed matching explanations
3. **Emergency Detection**: Critical condition identification
4. **Multi-language Support**: Tamil and English symptom processing
5. **Modular Architecture**: Research-friendly code structure

## 📚 Dependencies
- **express**: Web framework
- **cors**: Cross-Origin Resource Sharing middleware

## 🔍 Algorithm Details

### **Symptom Matching Process:**
1. **Input Processing**: Parse and normalize user symptoms
2. **Dataset Comparison**: Compare against all diseases in dataset
3. **Similarity Calculation**: Jaccard + Overlap coefficient analysis
4. **Confidence Scoring**: Weighted multi-factor algorithm
5. **Ranking**: Sort by confidence, return top 5 matches
6. **Explanation Generation**: Create detailed reasoning text

### **Emergency Detection:**
- Identifies conditions marked as `emergency: true`
- Provides immediate warning for critical symptoms
- Prioritizes urgent medical attention

## 🎯 Future Research Directions

- **Machine Learning Integration**: Neural networks for pattern recognition
- **Expanded Dataset**: More diseases and symptoms
- **User Feedback Loop**: Continuous learning from medical outcomes
- **Multi-modal Input**: Voice, image, and text analysis
- **Real-time Monitoring**: Continuous symptom tracking
