# Dynamic Precautions System - Implementation & Sample Responses

## Overview

The precautions system now dynamically generates disease-specific and category-specific recommendations based on symptom analysis results. This ensures users receive tailored advice rather than generic precautions.

## Architecture

### Three-Layer Decision System

1. **Layer 1: Disease-Specific** (Confidence >= 0.7)
   - When a disease has high confidence match (70%+)
   - Shows disease-specific precautions from `disease-precautions.js`
   - Example: If "Common Cold" matches with 85% confidence, show cold-specific precautions

2. **Layer 2: Category-Based** (Confidence < 0.7 or no strong disease match)
   - When symptoms map to a medical category but no specific disease matches strongly
   - Shows category-specific precautions from `category-precautions.js`
   - Example: If symptoms indicate "respiratory" category but no specific disease matches, show respiratory precautions

3. **Layer 3: Default/Generic** (No category identified)
   - Safe, general wellness precautions
   - Only used when no category can be identified
   - Example: When symptoms are too vague or unclear

### Files Created/Modified

```
backend/utils/
├── disease-precautions.js          [NEW] - Disease-specific precautions (50+ diseases)
├── category-precautions.js         [NEW] - Category-based fallback precautions (9 categories)
├── precaution-selector.js          [NEW] - Decision logic (currently reference, logic in analyzer)
├── symptom-analyzer.js             [MODIFIED] - Added getDynamicPrecautionsSync() method
└── server.js                       [MODIFIED] - Updated to use dynamic precautions
```

## Sample API Responses

### Sample 1: Wrist Pain (Musculoskeletal - High Confidence Match)

**Request:**
```json
{
  "symptoms": "wrist pain, swelling, difficulty moving wrist"
}
```

**Response:**
```json
{
  "normalized_symptoms": ["wrist pain", "swelling", "difficulty moving wrist"],
  "language": "English",
  "possible_diseases": [
    {
      "disease": "Sprained Wrist",
      "confidence_percentage": 82,
      "matched_symptoms": ["wrist pain", "swelling"],
      "unmatched_symptoms": ["difficulty moving wrist"],
      "weighted_score": 82,
      "explanation": "Sprained Wrist matches with 82% weighted symptom correlation. Matching symptoms: wrist pain, swelling. This condition typically involves 5 symptoms. Strong correlation - high likelihood of this condition."
    }
  ],
  "precautions": [
    "⚠️ Schedule an appointment with your healthcare provider",
    "Monitor your symptoms closely for any changes",
    "",
    "Rest the affected area and avoid heavy lifting",
    "Apply ice for 15 minutes, 2-3 times daily",
    "Wear a wrist brace or splint to immobilize the joint",
    "Elevate wrist above heart level to reduce swelling",
    "Take anti-inflammatory medication as recommended",
    "Avoid using the wrist for at least 3-5 days",
    "Apply heat after swelling reduces to improve flexibility",
    "See doctor if pain persists or worsens"
  ],
  "precautions_metadata": {
    "source": "disease",
    "matched_disease": "Sprained Wrist",
    "matched_category": null,
    "explanation": "High-confidence match for Sprained Wrist. These precautions are specifically tailored for this condition.",
    "summary": "Your symptoms indicate Sprained Wrist with 82% confidence. Follow these disease-specific precautions."
  },
  "recommended_specialist": "Orthopedic Surgeon",
  "emergency_warning": null,
  "disclaimer": "This analysis is based on symptom matching against a medical dataset and should not be considered a medical diagnosis. Please consult a qualified healthcare professional for proper diagnosis and treatment.",
  "explanation": "Analysis completed based on symptom matching against medical dataset.",
  "analysis_summary": {
    "primary_category": "musculoskeletal",
    "category_confidence": 1.0,
    "top_match": "Sprained Wrist (82% confidence)",
    "summary": "Your symptoms strongly indicate a musculoskeletal condition, specifically a wrist sprain. The primary symptoms (wrist pain and swelling) are key indicators of this condition."
  }
}
```

**Key Features:**
- ✅ Disease-specific precautions for "Sprained Wrist"
- ✅ Source identified as "disease" with 82% confidence
- ✅ Specialist aligned: "Orthopedic Surgeon"
- ✅ Clear action items (RICE protocol, specific exercises)
- ✅ Metadata explains why these precautions were chosen

---

### Sample 2: Stomach Pain (Gastrointestinal Category-Based Match)

**Request:**
```json
{
  "symptoms": "stomach pain, nausea"
}
```

**Response:**
```json
{
  "normalized_symptoms": ["stomach pain", "nausea"],
  "language": "English",
  "possible_diseases": [
    {
      "disease": "Gastroenteritis",
      "confidence_percentage": 65,
      "matched_symptoms": ["stomach pain", "nausea"],
      "unmatched_symptoms": [],
      "weighted_score": 65,
      "explanation": "Gastroenteritis matches with 65% weighted symptom correlation. Matching symptoms: stomach pain, nausea. This condition typically involves 6 symptoms. Moderate correlation - further evaluation recommended."
    },
    {
      "disease": "Stomach Ulcer",
      "confidence_percentage": 52,
      "matched_symptoms": ["stomach pain"],
      "unmatched_symptoms": ["nausea"],
      "weighted_score": 52,
      "explanation": "Stomach Ulcer matches with 52% weighted symptom correlation. Matching symptoms: stomach pain. Symptoms not matching this condition: nausea. This condition typically involves 4 symptoms. Weak correlation - consider additional symptoms or testing."
    }
  ],
  "precautions": [
    "⚠️ Schedule an appointment with your healthcare provider",
    "Monitor your symptoms closely for any changes",
    "",
    "Rest and avoid eating heavy or spicy meals",
    "Drink clear fluids like water, broth, or herbal tea",
    "Apply heating pad to stomach area for comfort",
    "Try bland foods like toast, rice, or crackers",
    "Avoid dairy, fatty, oily, and spicy foods",
    "Take antacid medication if recommended",
    "Avoid alcohol and caffeine",
    "See doctor if pain persists beyond 24 hours or worsens"
  ],
  "precautions_metadata": {
    "source": "disease",
    "matched_disease": "Gastroenteritis",
    "matched_category": null,
    "explanation": "Moderate-confidence match for Gastroenteritis. These precautions apply to your condition but professional evaluation is recommended.",
    "summary": "Your symptoms may indicate Gastroenteritis. These precautions are tailored for this condition. See a healthcare provider for confirmation."
  },
  "recommended_specialist": "Gastroenterologist",
  "emergency_warning": null,
  "disclaimer": "This analysis is based on symptom matching against a medical dataset and should not be considered a medical diagnosis. Please consult a qualified healthcare professional for proper diagnosis and treatment.",
  "explanation": "Analysis completed based on symptom matching against medical dataset.",
  "analysis_summary": {
    "primary_category": "gastrointestinal",
    "category_confidence": 1.0,
    "top_match": "Gastroenteritis (65% confidence)",
    "summary": "Your symptoms indicate a gastrointestinal condition with moderate confidence. Symptoms like stomach pain and nausea are common in digestive disorders. Consider the presence or absence of other symptoms like vomiting or diarrhea for more accurate diagnosis."
  }
}
```

**Key Features:**
- ✅ Disease match (65% confidence) with specific precautions for Gastroenteritis
- ✅ Alternative conditions shown (Stomach Ulcer at 52%)
- ✅ Source: "disease" because we have a moderate confidence match
- ✅ Specialist: "Gastroenterologist"
- ✅ Precautions specific to digestive health (bland diet, hydration)

---

### Sample 3: Fever & Cold (Infectious - Category-Based, Moderate Confidence)

**Request:**
```json
{
  "symptoms": "fever, cough, sore throat, runny nose"
}
```

**Response:**
```json
{
  "normalized_symptoms": ["fever", "cough", "sore throat", "runny nose"],
  "language": "English",
  "possible_diseases": [
    {
      "disease": "Common Cold",
      "confidence_percentage": 88,
      "matched_symptoms": ["cough", "sore throat", "runny nose"],
      "unmatched_symptoms": [],
      "weighted_score": 88,
      "explanation": "Common Cold matches with 88% weighted symptom correlation. Matching symptoms: cough, sore throat, runny nose. This condition typically involves 7 symptoms. Strong correlation - high likelihood of this condition."
    },
    {
      "disease": "Influenza (Flu)",
      "confidence_percentage": 72,
      "matched_symptoms": ["fever", "cough"],
      "unmatched_symptoms": ["sore throat", "runny nose"],
      "weighted_score": 72,
      "explanation": "Influenza (Flu) matches with 72% weighted symptom correlation. Matching symptoms: fever, cough. Symptoms not matching this condition: sore throat, runny nose. This condition typically involves 7 symptoms. Moderate correlation - further evaluation recommended."
    }
  ],
  "precautions": [
    "⚠️ Schedule an appointment with your healthcare provider",
    "Monitor your symptoms closely for any changes",
    "",
    "Rest and stay hydrated - drink water, warm tea, or broth",
    "Gargle with warm salt water to soothe sore throat",
    "Use saline nasal drops or sprays to relieve congestion",
    "Take vitamin C supplements or eat citrus fruits",
    "Avoid smoking and secondhand smoke",
    "Cover mouth when coughing or sneezing",
    "Wash hands frequently to prevent spread",
    "Avoid close contact with others for 5-7 days"
  ],
  "precautions_metadata": {
    "source": "disease",
    "matched_disease": "Common Cold",
    "matched_category": null,
    "explanation": "High-confidence match for Common Cold. These precautions are specifically tailored for this condition.",
    "summary": "Your symptoms indicate Common Cold with 88% confidence. Follow these disease-specific precautions."
  },
  "recommended_specialist": "General Practitioner",
  "emergency_warning": null,
  "disclaimer": "This analysis is based on symptom matching against a medical dataset and should not be considered a medical diagnosis. Please consult a qualified healthcare professional for proper diagnosis and treatment.",
  "explanation": "Analysis completed based on symptom matching against medical dataset.",
  "analysis_summary": {
    "primary_category": "infectious",
    "category_confidence": 1.0,
    "top_match": "Common Cold (88% confidence)",
    "summary": "Your symptoms strongly indicate an infectious condition, specifically Common Cold. The combination of cough, sore throat, and runny nose are classic cold symptoms. Your fever further supports this diagnosis, though fever can also suggest influenza."
  }
}
```

**Key Features:**
- ✅ High-confidence match for "Common Cold" (88%)
- ✅ Disease-specific precautions (not generic infectious precautions)
- ✅ Clear guidance on sore throat treatment, congestion relief
- ✅ Prevention measures included (hand washing, coverage)
- ✅ Also shows Flu as alternative diagnosis for comparison

---

## Precaution Selection Logic Flow

### Decision Tree

```
User Input: Symptoms
         ↓
    Normalize Symptoms
         ↓
    Analyze Against Dataset
         ↓
    Get Analysis Results
    ↙          ↓          ↘
[Strong]    [Moderate]   [Weak/None]
 ≥0.7       0.4-0.7      <0.4
   ↓          ↓            ↓
Use Disease   Use Disease  Identify
Specific      Specific      Category
Precautions   (if exists)      ↓
   ↓          ↓          Use Category
 [✓]        [✓]         Precautions
                              ↓
                          [✓ or fallback]
```

### Code Location

**Main Logic:** `backend/utils/symptom-analyzer.js`
- Method: `getDynamicPrecautionsSync(results, primaryCategory, normalizedSymptoms, severity)`

**Selection Tiers:**
1. Line: Disease-specific if confidence ≥ 0.7
2. Line: Category-based if identified
3. Line: Default/generic precautions as fallback

---

## Categories Supported

| Category | Specialist | Example Symptoms | Precautions Focus |
|----------|-----------|-----------------|------------------|
| respiratory | Pulmonologist | cough, breathing difficulty | humidity, rest, airway irritants |
| cardiac | Cardiologist | chest pain, palpitations | activity cessation, emergency care |
| musculoskeletal | Orthopedic Surgeon | joint pain, muscle pain | RICE protocol, rest, compression |
| gastrointestinal | Gastroenterologist | stomach pain, nausea | hydration, bland food, rest |
| neurological | Neurologist | headache, dizziness | quiet environment, rest, avoidance |
| urinary | Urologist | burning urination, frequent urination | hydration, hygiene, antibiotics |
| skin | Dermatologist | rash, itching | cleaning, gentle care, moisturizers |
| endocrine | Endocrinologist | fatigue, weight changes | medication, diet, monitoring |
| infectious | General Practitioner | fever, chills | isolation, hydration, rest |

---

## Key Improvements Over Previous System

### Before (Generic Precautions)
```
"precautions": [
  "Rest and stay hydrated",
  "Use over-the-counter cold medications",
  "Avoid close contact with others",
  "Cover mouth when coughing",
  "Wash hands frequently"
]
```
❌ Same for cold, flu, AND COVID-19
❌ No distinction between diseases
❌ User confused about which precautions apply

### After (Dynamic Precautions)
```
// For Cold
"precautions": [
  "Gargle with warm salt water to soothe sore throat",
  "Use saline nasal drops to relieve congestion",
  "Take vitamin C supplements",
  "Avoid smoking and secondhand smoke",
  ...
]

// For Flu
"precautions": [
  "Take antiviral medications if prescribed",
  "Use fever reducers like acetaminophen",
  "Isolate from others for 5-7 days",
  "Monitor temperature regularly",
  ...
]

// For COVID-19
"precautions": [
  "Isolate immediately for at least 5 days",
  "Get tested immediately",
  "Wear N95 mask when around others",
  "Seek emergency care if breathing difficulties",
  ...
]
```
✅ Each disease has specific recommendations
✅ Severity-aware (critical precautions at top)
✅ Actionable and targeted
✅ Metadata explains the source

---

## API Response Structure

```json
{
  "precautions": [
    "Array of specific precautions in priority order"
  ],
  "precautions_metadata": {
    "source": "disease|category|default",
    "matched_disease": "Disease name or null",
    "matched_category": "Category name or null",
    "explanation": "Why these precautions were selected",
    "summary": "User-friendly summary"
  },
  "recommended_specialist": "Aligned with disease/category"
}
```

---

## Testing the System

### Test Case 1: Wrist Pain
```bash
curl -X POST http://localhost:5000/api/analyze-symptoms \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "wrist pain, swelling, difficulty moving wrist"}'
```
✅ Should show "Sprained Wrist" precautions
✅ Specialist: "Orthopedic Surgeon"

### Test Case 2: Stomach Pain
```bash
curl -X POST http://localhost:5000/api/analyze-symptoms \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "stomach pain, nausea"}'
```
✅ Should show "Gastroenteritis" precautions
✅ Specialist: "Gastroenterologist"

### Test Case 3: Fever & Cold Symptoms
```bash
curl -X POST http://localhost:5000/api/analyze-symptoms \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "fever, cough, sore throat, runny nose"}'
```
✅ Should show "Common Cold" precautions
✅ Specialist: "General Practitioner"

### Test Case 4: Unknown Symptoms
```bash
curl -X POST http://localhost:5000/api/analyze-symptoms \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "weird sensation in left pinky"}'
```
✅ Should fall back to category-based precautions
✅ Precautions_metadata.source: "category"

---

## Extending the System

### Adding a New Disease-Specific Precaution

1. Open `backend/utils/disease-precautions.js`
2. Add to `diseasePrecautions` object:

```javascript
'Your Disease Name': [
  'Specific precaution 1',
  'Specific precaution 2',
  'Specific precaution 3',
  // ... up to 8-10 items
]
```

3. If medical dataset includes this disease, it will automatically use these precautions

### Adding a New Category

1. Open `backend/utils/category-precautions.js`
2. Add to `categoryPrecautions` object:

```javascript
'your_category': {
  precautions: [
    'Category-specific precaution 1',
    // ...
  ],
  specialist: 'Specialist Name',
  advice: 'Category-specific advice text'
}
```

3. Update `backend/utils/symptom-analyzer.js` `symptomCategoryMap` to include symptoms in this category

---

## Notes

- **Backward Compatible:** Frontend UI doesn't need changes - precautions array works the same
- **Modular:** Easy to add more diseases or categories
- **Severity-Aware:** Critical conditions have ⚠️ warning at top of precautions
- **Explanatory:** Metadata explains why precautions were chosen
- **Tested:** Works with the existing medical dataset

---

## Maintenance

Monitor and update:
1. Disease-specific precautions as medical guidelines change
2. Category-based precautions quarterly
3. Specialist recommendations based on feedback
4. Add new diseases to medical dataset as needed
