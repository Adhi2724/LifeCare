import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @typedef {Object} DiseaseData
 * @property {string} disease - Name of the disease
 * @property {string[]} symptoms - Array of associated symptoms
 * @property {string} specialist - Recommended medical specialist
 * @property {string[]} precautions - Recommended precautions
 * @property {string} severity - Severity level (mild/moderate/severe)
 * @property {boolean} emergency - Whether this is an emergency condition
 */

/**
 * @typedef {Object} MatchResult
 * @property {string} disease - Disease name
 * @property {number} confidence - Confidence score (0-1)
 * @property {string[]} matchedSymptoms - Symptoms that matched
 * @property {string[]} unmatchedSymptoms - Symptoms that didn't match
 * @property {number} weightedScore - Weighted score percentage
 * @property {string} specialist - Recommended specialist
 * @property {string[]} precautions - Recommended precautions
 * @property {string} severity - Disease severity
 * @property {boolean} emergency - Emergency flag
 * @property {string} explanation - Detailed explanation
 */

class SymptomAnalyzer {
  /** @type {DiseaseData[]} */
  dataset = [];

  // Updated symptom weight mapping - lower for generic, higher for specific
  symptomWeights = {
    // Generic symptoms (weight 1) - common across many diseases
    'fever': 1,
    'headache': 1,
    'fatigue': 1,
    'nausea': 1,
    'dizziness': 1,
    'weakness': 1,
    'chills': 1,
    'sweating': 1,
    'loss of appetite': 1,
    'insomnia': 1,
    'tiredness': 1,

    // Medium-specific symptoms (weight 2)
    'cough': 2,
    'sore throat': 2,
    'runny nose': 2,
    'sneezing': 2,
    'rash': 2,
    'itching': 2,
    'joint pain': 2,
    'muscle pain': 2,
    'body ache': 2,
    'vomiting': 2,
    'diarrhea': 2,
    'abdominal pain': 2,
    'back pain': 2,

    // Highly specific symptoms (weight 3)
    'chest pain': 3,
    'heart pain': 3,
    'severe chest pain': 3,
    'stomach pain': 3,
    'severe abdominal pain': 3,
    'blood in stool': 3,
    'blood in urine': 3,
    'urinary pain': 3,
    'frequent urination': 3,
    'burning urination': 3,
    'skin rash': 3,
    'severe rash': 3,

    // Critical symptoms (weight 4) - require immediate attention
    'shortness of breath': 4,
    'difficulty breathing': 4,
    'severe shortness of breath': 4,
    'breathing difficulty': 4,
    'unconsciousness': 4,
    'seizure': 4,
    'severe headache': 4,
    'migraine': 4,
    'blurred vision': 4,
    'loss of vision': 4,
    'chest tightness': 4,
    'heart palpitations': 4,
    'severe dizziness': 4,
    'fainting': 4,
    'loss of consciousness': 4
  };

  // Critical symptoms that trigger emergency warnings
  criticalSymptoms = [
    'chest pain', 'severe chest pain',
    'shortness of breath', 'difficulty breathing', 'severe shortness of breath',
    'unconsciousness', 'loss of consciousness',
    'seizure'
  ];

  // Disease-specific key symptoms (must match for disease to be considered)
  diseaseKeySymptoms = {
    'Urinary Tract Infection': ['urinary pain', 'frequent urination', 'burning urination', 'blood in urine'],
    'Pneumonia': ['cough', 'shortness of breath', 'difficulty breathing', 'chest pain'],
    'Bronchitis': ['cough', 'shortness of breath', 'difficulty breathing'],
    'COVID-19': ['cough', 'fever', 'shortness of breath', 'loss of taste', 'loss of smell'],
    'Hypertension': ['headache', 'dizziness', 'chest pain', 'shortness of breath'],
    'Diabetes': ['frequent urination', 'increased thirst', 'fatigue', 'blurred vision'],
    'Anemia': ['fatigue', 'weakness', 'dizziness', 'shortness of breath'],
    'Asthma': ['shortness of breath', 'difficulty breathing', 'chest tightness', 'cough'],
    'Migraine': ['severe headache', 'nausea', 'blurred vision'],
    'Gastroenteritis': ['diarrhea', 'vomiting', 'abdominal pain', 'nausea'],
    'Common Cold': ['runny nose', 'sore throat', 'cough', 'sneezing'],
    'Influenza (Flu)': ['fever', 'cough', 'body ache', 'fatigue']
  };

  // Symptom to category mapping for category identification
  symptomCategoryMap = {
    // Respiratory symptoms
    'cough': 'respiratory',
    'shortness of breath': 'respiratory',
    'difficulty breathing': 'respiratory',
    'chest pain': 'respiratory',
    'wheezing': 'respiratory',
    'chest tightness': 'respiratory',
    'persistent cough': 'respiratory',
    'coughing blood': 'respiratory',

    // Cardiac symptoms
    'heart pain': 'cardiac',
    'severe chest pain': 'cardiac',
    'left arm pain': 'cardiac',
    'jaw pain': 'cardiac',
    'palpitations': 'cardiac',

    // Musculoskeletal symptoms
    'joint pain': 'musculoskeletal',
    'muscle pain': 'musculoskeletal',
    'back pain': 'musculoskeletal',
    'neck pain': 'musculoskeletal',
    'ankle pain': 'musculoskeletal',
    'knee pain': 'musculoskeletal',
    'wrist pain': 'musculoskeletal',
    'shoulder pain': 'musculoskeletal',
    'body ache': 'musculoskeletal',

    // Neurological symptoms
    'severe headache': 'neurological',
    'migraine': 'neurological',
    'dizziness': 'neurological',
    'confusion': 'neurological',
    'sudden weakness': 'neurological',
    'sudden numbness': 'neurological',
    'facial drooping': 'neurological',
    'speech difficulty': 'neurological',
    'vision problems': 'neurological',
    'loss of consciousness': 'neurological',
    'seizure': 'neurological',

    // Gastrointestinal symptoms
    'abdominal pain': 'gastrointestinal',
    'stomach pain': 'gastrointestinal',
    'nausea': 'gastrointestinal',
    'vomiting': 'gastrointestinal',
    'diarrhea': 'gastrointestinal',
    'constipation': 'gastrointestinal',
    'bloating': 'gastrointestinal',

    // Urinary symptoms
    'frequent urination': 'urinary',
    'burning urination': 'urinary',
    'blood in urine': 'urinary',
    'lower abdominal pain': 'urinary',
    'flank pain': 'urinary',
    'severe flank pain': 'urinary',

    // Skin symptoms
    'skin rash': 'skin',
    'itching': 'skin',
    'skin redness': 'skin',
    'skin swelling': 'skin',
    'blisters': 'skin',

    // Endocrine symptoms
    'increased thirst': 'endocrine',
    'increased hunger': 'endocrine',
    'fatigue': 'endocrine',
    'weight gain': 'endocrine',
    'weight loss': 'endocrine',
    'cold intolerance': 'endocrine',

    // Infectious/General symptoms (fallback)
    'fever': 'infectious',
    'chills': 'infectious',
    'sweating': 'infectious',
    'fatigue': 'infectious',
    'headache': 'infectious',
    'sore throat': 'infectious',
    'runny nose': 'infectious'
  };

  // Category-specific fallback advice and precautions
  categoryFallbackAdvice = {
    'respiratory': {
      advice: 'For respiratory symptoms like cough or breathing difficulty, consider humidified air, stay warm, avoid irritants like smoke, and monitor your breathing rate. Seek medical attention if breathing becomes very difficult.',
      specialist: 'Pulmonologist',
      precautions: [
        'Use a humidifier and breathe warm, moist air',
        'Stay hydrated and rest',
        'Avoid smoke and other airway irritants',
        'Monitor breathing and oxygen levels',
        'Seek medical care if symptoms worsen'
      ]
    },
    'cardiac': {
      advice: 'For chest pain or heart-related symptoms, stop all activity, sit or lie down in a comfortable position, and call emergency services immediately. Do not attempt to drive yourself.',
      specialist: 'Cardiologist',
      precautions: [
        'Rest and avoid strenuous exertion',
        'Monitor blood pressure and heart rate if possible',
        'Avoid caffeine and stimulants',
        'Take prescribed heart medications as directed',
        'Seek emergency care for severe chest pain or dizziness'
      ]
    },
    'musculoskeletal': {
      advice: 'For joint or muscle pain, rest the affected area, apply ice or heat as appropriate, elevate if swollen, and consider over-the-counter pain relief. Avoid strenuous activity until symptoms improve.',
      specialist: 'Orthopedic Surgeon',
      precautions: [
        'Rest the affected area and avoid heavy lifting',
        'Apply ice or heat to reduce swelling and pain',
        'Use compression or supportive braces if needed',
        'Avoid activities that worsen pain',
        'Take over-the-counter pain relief if appropriate'
      ]
    },
    'neurological': {
      advice: 'For severe headaches, dizziness, or neurological symptoms, rest in a quiet dark room, stay hydrated, and avoid driving or operating machinery. Seek medical attention if symptoms are severe or sudden.',
      specialist: 'Neurologist',
      precautions: [
        'Rest in a quiet, dimly lit environment',
        'Avoid driving or operating machinery',
        'Stay hydrated and avoid stress',
        'Track symptom onset and duration',
        'Seek urgent care for sudden weakness or vision changes'
      ]
    },
    'gastrointestinal': {
      advice: 'For stomach or digestive symptoms, stay hydrated with clear fluids, eat bland foods if possible, rest, and monitor for signs of dehydration. Seek medical attention if vomiting persists or you cannot keep fluids down.',
      specialist: 'Gastroenterologist',
      precautions: [
        'Drink clear fluids and stay hydrated',
        'Eat bland foods like toast, rice, and bananas',
        'Avoid spicy, oily, or heavy meals',
        'Rest and avoid strenuous activity',
        'Seek care if vomiting or diarrhea persists'
      ]
    },
    'urinary': {
      advice: 'For urinary symptoms like frequent or painful urination, drink plenty of water, avoid caffeine and alcohol, practice good hygiene, and consider over-the-counter urinary pain relief. See a doctor if symptoms persist.',
      specialist: 'Urologist',
      precautions: [
        'Drink plenty of water',
        'Avoid caffeine and alcohol',
        'Practice good genital hygiene',
        'Urinate frequently to flush bacteria',
        'Seek medical advice if pain or blood in urine occurs'
      ]
    },
    'skin': {
      advice: 'For skin conditions like rashes or itching, keep the area clean and dry, avoid scratching, use gentle moisturizers, and consider over-the-counter hydrocortisone cream. Consult a dermatologist for persistent symptoms.',
      specialist: 'Dermatologist',
      precautions: [
        'Keep the area clean and dry',
        'Avoid scratching or irritating the skin',
        'Use gentle, fragrance-free moisturizers',
        'Avoid harsh soaps and hot water',
        'Seek dermatologist care for worsening rash'
      ]
    },
    'endocrine': {
      advice: 'For symptoms suggesting hormonal issues like excessive thirst or fatigue, maintain a healthy diet, exercise regularly, and schedule regular check-ups. Consult an endocrinologist for proper evaluation.',
      specialist: 'Endocrinologist',
      precautions: [
        'Maintain a balanced diet and stay hydrated',
        'Follow prescribed hormonal medications',
        'Monitor symptoms and report changes',
        'Keep regular medical appointments',
        'Avoid skipping medication doses'
      ]
    },
    'infectious': {
      advice: 'For general symptoms like fever or fatigue, rest, stay hydrated, monitor your temperature, and consider over-the-counter medications. Isolate if you suspect contagious illness and seek medical attention if symptoms worsen.',
      specialist: 'General Practitioner',
      precautions: [
        'Rest and stay hydrated',
        'Take over-the-counter fever reducers if needed',
        'Isolate to avoid spreading infection',
        'Monitor your temperature regularly',
        'Seek medical care if symptoms worsen'
      ]
    }
  };

  // Specialist mapping based on strongest symptom
  symptomSpecialists = {
    'chest pain': 'Cardiologist',
    'heart pain': 'Cardiologist',
    'severe chest pain': 'Cardiologist',
    'heart palpitations': 'Cardiologist',
    'shortness of breath': 'Pulmonologist',
    'difficulty breathing': 'Pulmonologist',
    'severe shortness of breath': 'Pulmonologist',
    'breathing difficulty': 'Pulmonologist',
    'chest tightness': 'Pulmonologist',
    'cough': 'Pulmonologist',
    'abdominal pain': 'Gastroenterologist',
    'stomach pain': 'Gastroenterologist',
    'severe abdominal pain': 'Gastroenterologist',
    'diarrhea': 'Gastroenterologist',
    'vomiting': 'Gastroenterologist',
    'urinary pain': 'Urologist',
    'frequent urination': 'Urologist',
    'burning urination': 'Urologist',
    'blood in urine': 'Urologist',
    'back pain': 'Orthopedist',
    'joint pain': 'Rheumatologist',
    'muscle pain': 'Rheumatologist',
    'severe headache': 'Neurologist',
    'migraine': 'Neurologist',
    'blurred vision': 'Ophthalmologist',
    'loss of vision': 'Ophthalmologist',
    'rash': 'Dermatologist',
    'skin rash': 'Dermatologist',
    'severe rash': 'Dermatologist',
    'itching': 'Dermatologist'
  };

  // Minimum thresholds
  MIN_SYMPTOM_MATCH = 2; // At least 2 symptoms must match
  MIN_MATCH_RATIO = 0.5; // Or 50% of disease symptoms must match
  MIN_WEIGHTED_SCORE = 0.4; // 40% minimum weighted score
  MIN_FALLBACK_SCORE = 0.2; // 20% minimum for fallback matches
  MAX_RESULTS = 5; // Maximum results to return

  constructor() {
    this.loadDataset();
  }

  /**
   * Load medical dataset from JSON file
   */
  loadDataset() {
    try {
      const datasetPath = path.join(__dirname, '../data/medical-dataset.json');
      const data = fs.readFileSync(datasetPath, 'utf8');
      this.dataset = JSON.parse(data);
      console.log(`✅ Loaded ${this.dataset.length} disease records`);
    } catch (error) {
      console.error('❌ Error loading medical dataset:', error);
      throw new Error('Failed to load medical dataset');
    }
  }

  /**
   * Normalize symptoms by converting to lowercase and removing duplicates
   * @param {string[]} symptoms - Array of symptom strings
   * @returns {string[]} Normalized symptoms array
   */
  normalizeSymptoms(symptoms) {
    return [...new Set(
      symptoms
        .map(s => s.toLowerCase().trim())
        .filter(s => s.length > 0)
    )];
  }

  /**
   * Get weight for a symptom (default to 1 if not specified)
   * @param {string} symptom - Symptom name
   * @param {DiseaseData} diseaseData - Optional disease data for specific weights
   * @returns {number} Weight (1-4)
   */
  getSymptomWeight(symptom, diseaseData = null) {
    // First check disease-specific weights if available
    if (diseaseData && diseaseData.symptom_weights) {
      const weight = diseaseData.symptom_weights[symptom.toLowerCase()];
      if (weight) return weight;
    }

    // Fallback to general symptom weights
    return this.symptomWeights[symptom.toLowerCase()] || 1;
  }

  /**
   * Check if disease should be considered based on key symptoms
   * @param {string} diseaseName - Name of the disease
   * @param {string[]} userSymptoms - User's reported symptoms
   * @returns {boolean} Whether disease passes key symptom filter
   */
  passesKeySymptomFilter(diseaseName, userSymptoms) {
    const keySymptoms = this.diseaseKeySymptoms[diseaseName];
    if (!keySymptoms) return true; // No specific requirements, allow the disease

    // Check if at least one key symptom is present in user symptoms
    return keySymptoms.some(keySymptom =>
      userSymptoms.some(userSymptom =>
        this.symptomsMatch(userSymptom, keySymptom)
      )
    );
  }

  /**
   * Check if two symptoms match (flexible matching)
   * @param {string} symptom1 - First symptom
   * @param {string} symptom2 - Second symptom
   * @returns {boolean} Whether symptoms match
   */
  symptomsMatch(symptom1, symptom2) {
    const s1 = symptom1.toLowerCase();
    const s2 = symptom2.toLowerCase();

    // Exact match
    if (s1 === s2) return true;

    // One contains the other
    if (s1.includes(s2) || s2.includes(s1)) return true;

    // Check for synonyms/related terms
    const synonyms = {
      'heart pain': ['chest pain', 'cardiac pain'],
      'chest pain': ['heart pain', 'cardiac pain'],
      'heart attack': ['myocardial infarction', 'cardiac arrest'],
      'breathing difficulty': ['shortness of breath', 'difficulty breathing'],
      'shortness of breath': ['breathing difficulty', 'difficulty breathing'],
      'stomach pain': ['abdominal pain'],
      'abdominal pain': ['stomach pain'],
      'back pain': ['lower back pain', 'upper back pain'],
      'joint pain': ['arthritis pain'],
      'muscle pain': ['body ache'],
      'body ache': ['muscle pain'],
      'burning urination': ['painful urination'],
      'frequent urination': ['urinary frequency'],
      'blood in urine': ['hematuria'],
      'blood in stool': ['rectal bleeding'],
      'severe headache': ['migraine', 'throbbing headache'],
      'migraine': ['severe headache'],
      'blurred vision': ['vision problems'],
      'loss of taste': ['ageusia'],
      'loss of smell': ['anosmia']
    };

    // Check if symptoms are synonyms
    if (synonyms[s1] && synonyms[s1].includes(s2)) return true;
    if (synonyms[s2] && synonyms[s2].includes(s1)) return true;

    return false;
  }

  /**
   * Check if disease meets multi-symptom matching requirements
   * @param {string[]} matchedSymptoms - Symptoms that matched
   * @param {string[]} userSymptoms - All user symptoms
   * @param {string[]} diseaseSymptoms - All disease symptoms
   * @returns {boolean} Whether disease meets matching criteria
   */
  meetsMatchingCriteria(matchedSymptoms, userSymptoms, diseaseSymptoms) {
    const matchCount = matchedSymptoms.length;
    const userCount = userSymptoms.length;
    const diseaseCount = diseaseSymptoms.length;

    // Must have at least 2 symptoms match OR 50% match ratio
    const hasMinSymptoms = matchCount >= this.MIN_SYMPTOM_MATCH;
    const hasMinRatio = matchCount / diseaseCount >= this.MIN_MATCH_RATIO;

    return hasMinSymptoms || hasMinRatio;
  }

  /**
   * Calculate weighted score: matched symptom weights / total disease symptom weights
   * @param {string[]} matchedSymptoms - Symptoms that matched
   * @param {string[]} diseaseSymptoms - All disease symptoms
   * @param {DiseaseData} diseaseData - Disease data for specific weights
   * @returns {number} Weighted score (0-1)
   */
  calculateWeightedScore(matchedSymptoms, diseaseSymptoms, diseaseData) {
    if (matchedSymptoms.length === 0 || diseaseSymptoms.length === 0) {
      return 0;
    }

    // Sum weights of matched symptoms
    const matchedWeightSum = matchedSymptoms.reduce((sum, symptom) =>
      sum + this.getSymptomWeight(symptom, diseaseData), 0
    );

    // Sum weights of all disease symptoms
    const diseaseWeightSum = diseaseSymptoms.reduce((sum, symptom) =>
      sum + this.getSymptomWeight(symptom, diseaseData), 0
    );

    return diseaseWeightSum > 0 ? matchedWeightSum / diseaseWeightSum : 0;
  }

  /**
   * Calculate overall symptom strength for adaptive threshold
   * @param {string[]} symptoms - Normalized user symptoms
   * @returns {number} Symptom strength score (0-1)
   */
  calculateSymptomStrength(symptoms) {
    if (symptoms.length === 0) return 0;

    const totalWeight = symptoms.reduce((sum, symptom) => sum + this.getSymptomWeight(symptom), 0);
    const averageWeight = totalWeight / symptoms.length;

    // Normalize to 0-1 scale (weights are 1-4)
    return Math.min(averageWeight / 4, 1);
  }

  /**
   * Get adaptive threshold based on symptom strength
   * @param {number} symptomStrength - Symptom strength score (0-1)
   * @returns {number} Adaptive threshold for disease matching
   */
  getAdaptiveThreshold(symptomStrength) {
    // For strong symptoms (high strength), require higher confidence
    // For weak symptoms (low strength), accept lower confidence
    if (symptomStrength >= 0.8) return 0.6; // Strong symptoms need 60% match
    if (symptomStrength >= 0.6) return 0.5; // Medium-strong symptoms need 50% match
    if (symptomStrength >= 0.4) return 0.4; // Medium symptoms need 40% match
    return 0.3; // Weak symptoms only need 30% match
  }

  /**
   * Identify the most likely symptom category from user symptoms
   * @param {string[]} userSymptoms - Normalized user symptoms
   * @returns {string} Primary category or 'infectious' as fallback
   */
  identifySymptomCategory(userSymptoms) {
    const categoryScores = {};

    // Count category occurrences
    for (const symptom of userSymptoms) {
      const category = this.symptomCategoryMap[symptom.toLowerCase()];
      if (category) {
        categoryScores[category] = (categoryScores[category] || 0) + 1;
      }
    }

    // Return category with highest score, or 'infectious' as fallback
    if (Object.keys(categoryScores).length === 0) {
      return 'infectious';
    }

    return Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  /**
   * Get diseases filtered by category
   * @param {string} category - Category to filter by
   * @returns {DiseaseData[]} Filtered diseases
   */
  getDiseasesByCategory(category) {
    return this.dataset.filter(disease => disease.category === category);
  }

  /**
   * Get related categories for a primary category
   * @param {string} primaryCategory - Primary symptom category
   * @returns {string[]} Array of related categories
   */
  getRelatedCategories(primaryCategory) {
    const relatedCategoriesMap = {
      'respiratory': ['infectious', 'cardiac'],
      'cardiac': ['respiratory'],
      'musculoskeletal': ['neurological'],
      'neurological': ['cardiac'],
      'gastrointestinal': ['infectious'],
      'urinary': ['gastrointestinal'],
      'skin': ['infectious'],
      'endocrine': ['gastrointestinal'],
      'infectious': ['respiratory', 'gastrointestinal', 'skin']
    };

    return relatedCategoriesMap[primaryCategory] || [];
  }

  /**
   * Get specialist based on category and matched symptoms
   * @param {string} category - Disease category
   * @param {string[]} matchedSymptoms - Symptoms that matched
   * @param {string} defaultSpecialist - Default specialist from disease data
   * @returns {string} Recommended specialist
   */
  getSpecialistFromCategoryAndSymptoms(category, matchedSymptoms, defaultSpecialist) {
    // Category-based specialist mapping
    const categorySpecialists = {
      'respiratory': 'Pulmonologist',
      'cardiac': 'Cardiologist',
      'musculoskeletal': 'Orthopedic Surgeon',
      'neurological': 'Neurologist',
      'gastrointestinal': 'Gastroenterologist',
      'urinary': 'Urologist',
      'skin': 'Dermatologist',
      'endocrine': 'Endocrinologist',
      'infectious': 'Infectious Disease Specialist'
    };

    // Return category-based specialist, or fall back to symptom-based or default
    return categorySpecialists[category] ||
           this.getSpecialistFromSymptoms(matchedSymptoms, defaultSpecialist) ||
           defaultSpecialist;
  }

  /**
   * Generate detailed analysis summary for explainability
   * @param {string[]} userSymptoms - Original user symptoms
   * @param {MatchResult[]} results - Analysis results
   * @param {string} primaryCategory - Identified symptom category
   * @returns {object} Analysis summary object
   */
  generateAnalysisSummary(userSymptoms, results, primaryCategory) {
    const normalizedSymptoms = this.normalizeSymptoms(userSymptoms);

    if (results.length === 0) {
      // No matches case
      const diseasesEvaluated = this.dataset.map(d => ({
        name: d.disease_name || d.disease,
        category: d.category,
        reason: this.getRejectionReason(normalizedSymptoms, d)
      }));

      return {
        detected_symptoms: normalizedSymptoms,
        detected_category: primaryCategory,
        diseases_evaluated: diseasesEvaluated,
        confidence_interpretation: 'No strong matches found',
        analysis_type: 'no_match',
        summary: `Evaluated ${diseasesEvaluated.length} diseases across all categories. No diseases met the minimum matching criteria or confidence threshold.`
      };
    } else {
      // Matches found case
      const topResult = results[0];
      const confidenceLevel = this.getConfidenceLevel(topResult.confidence);

      return {
        detected_symptoms: normalizedSymptoms,
        detected_category: primaryCategory,
        matched_diseases: results.map(result => ({
          name: result.disease,
          confidence_percentage: result.weightedScore,
          confidence_level: this.getConfidenceLevel(result.confidence),
          matched_symptoms: result.matchedSymptoms,
          missing_symptoms: result.unmatchedSymptoms,
          category: result.category,
          ranking_reason: this.getRankingReason(result, results.indexOf(result) + 1)
        })),
        confidence_interpretation: confidenceLevel,
        analysis_type: 'match_found',
        summary: `Found ${results.length} potential matches. Top match: ${topResult.disease} (${topResult.weightedScore}% confidence - ${confidenceLevel}).`
      };
    }
  }

  /**
   * Generate category-specific fallback advice when no diseases match
   * @param {string} category - Symptom category
   * @returns {object} Object with advice and specialist properties
   */
  generateCategoryFallbackAdvice(category) {
    const fallback = this.categoryFallbackAdvice[category];
    if (fallback) {
      return {
        advice: fallback.advice,
        specialist: fallback.specialist
      };
    }

    // Default fallback for unknown categories
    return {
      advice: 'Monitor your symptoms closely and consult a healthcare professional if they persist or worsen. Maintain good hygiene, stay hydrated, and rest as needed.',
      specialist: 'General Practitioner'
    };
  }

  /**
   * Get confidence level interpretation
   * @param {number} confidence - Confidence score (0-1)
   * @returns {string} Confidence level description
   */
  getConfidenceLevel(confidence) {
    if (confidence >= 0.7) return 'Strong match (>70% confidence)';
    if (confidence >= 0.4) return 'Moderate match (40-70% confidence)';
    return 'Weak match (<40% confidence)';
  }

  /**
   * Get reason why a disease was rejected
   * @param {string[]} userSymptoms - Normalized user symptoms
   * @param {object} diseaseData - Disease data object
   * @returns {string} Rejection reason
   */
  getRejectionReason(userSymptoms, diseaseData) {
    const mandatorySymptoms = diseaseData.mandatory_symptoms || [];
    const optionalSymptoms = diseaseData.optional_symptoms || diseaseData.symptoms || [];
    const allDiseaseSymptoms = [...mandatorySymptoms, ...optionalSymptoms];
    const normalizedDiseaseSymptoms = this.normalizeSymptoms(allDiseaseSymptoms);

    // Check mandatory symptoms
    if (mandatorySymptoms.length > 0) {
      const hasMandatory = mandatorySymptoms.some(mandatory =>
        userSymptoms.some(userSymptom => this.symptomsMatch(userSymptom, mandatory))
      );
      if (!hasMandatory) {
        return `Missing mandatory symptoms: ${mandatorySymptoms.join(', ')}`;
      }
    }

    // Check minimum matching criteria
    const matchedSymptoms = userSymptoms.filter(userSymptom =>
      normalizedDiseaseSymptoms.some(diseaseSymptom => this.symptomsMatch(userSymptom, diseaseSymptom))
    );

    if (!this.meetsMatchingCriteria(matchedSymptoms, userSymptoms, normalizedDiseaseSymptoms)) {
      return `Insufficient symptom overlap: ${matchedSymptoms.length}/${userSymptoms.length} symptoms matched, ${normalizedDiseaseSymptoms.length} total disease symptoms`;
    }

    // Calculate weighted score
    const weightedScore = this.calculateWeightedScore(matchedSymptoms, normalizedDiseaseSymptoms, diseaseData);
    const symptomStrength = this.calculateSymptomStrength(userSymptoms);
    const adaptiveThreshold = this.getAdaptiveThreshold(symptomStrength);

    if (weightedScore < adaptiveThreshold) {
      return `Low weighted score: ${Math.round(weightedScore * 100)}% (threshold: ${Math.round(adaptiveThreshold * 100)}%)`;
    }

    return 'Unknown reason';
  }

  /**
   * Get ranking reason for a result
   * @param {MatchResult} result - Result object
   * @param {number} rank - Position in results (1-based)
   * @returns {string} Ranking explanation
   */
  getRankingReason(result, rank) {
    const reasons = [];

    if (rank === 1) {
      reasons.push('Highest weighted score among evaluated diseases');
    } else {
      reasons.push(`Ranked #${rank} by weighted score`);
    }

    reasons.push(`${result.matchedSymptoms.length} out of ${result.matchedSymptoms.length + result.unmatchedSymptoms.length} symptoms matched`);

    if (result.category) {
      reasons.push(`Disease category: ${result.category}`);
    }

    return reasons.join('; ');
  }

  /**
   * Get specialist based on strongest matching symptom
   * @param {string[]} matchedSymptoms - Symptoms that matched
   * @param {string} defaultSpecialist - Default specialist from disease data
   * @returns {string} Recommended specialist
   */
  getSpecialistFromSymptoms(matchedSymptoms, defaultSpecialist) {
    if (matchedSymptoms.length === 0) return defaultSpecialist;

    // Find symptom with highest weight among matched symptoms
    let strongestSymptom = matchedSymptoms[0];
    let highestWeight = this.getSymptomWeight(strongestSymptom);

    for (const symptom of matchedSymptoms) {
      const weight = this.getSymptomWeight(symptom);
      if (weight > highestWeight) {
        highestWeight = weight;
        strongestSymptom = symptom;
      }
    }

    // Return specialist for strongest symptom, or default if not found
    return this.symptomSpecialists[strongestSymptom.toLowerCase()] || defaultSpecialist;
  }

  /**
   * Check if emergency warning should be triggered based on critical symptoms
   * @param {string[]} userSymptoms - User's reported symptoms
   * @returns {string|null} Emergency warning message or null
   */
  getCriticalSymptomsWarning(userSymptoms) {
    const criticalKeywords = [
      'chest pain', 'severe chest pain',
      'shortness of breath', 'difficulty breathing', 'severe shortness of breath',
      'unconsciousness', 'loss of consciousness',
      'seizure'
    ];

    // Check for exact matches or very specific critical symptoms
    const hasCritical = userSymptoms.some(userSymptom => {
      const normalizedUser = userSymptom.toLowerCase().trim();
      return criticalKeywords.some(critical =>
        normalizedUser === critical.toLowerCase() ||
        normalizedUser.includes('severe') && critical.includes('severe') ||
        normalizedUser === 'seizure' ||
        normalizedUser === 'unconsciousness'
      );
    });

    if (hasCritical) {
      return 'EMERGENCY: Critical symptoms detected (chest pain, breathing difficulty, or loss of consciousness). Please seek immediate medical attention at the nearest emergency room or call emergency services. Do not delay seeking medical care.';
    }

    return null;
  }

  /**
   * Get recommended specialist based on matched symptoms
   * @param {MatchResult[]} results - Analysis results
   * @returns {string} Recommended specialist
   */
  getRecommendedSpecialist(results) {
    if (results.length === 0) return 'General Practitioner';

    // Use the specialist from the top result
    return results[0].specialist;
  }

  /**
   * Get precautions from top matching diseases
   * @param {MatchResult[]} results - Analysis results
   * @returns {string[]} Combined precautions
   */
  getPrecautions(results) {
    const precautions = new Set();

    // Get precautions from top 3 results
    results.slice(0, 3).forEach(result => {
      result.precautions.forEach(precaution => precautions.add(precaution));
    });

    return Array.from(precautions);
  }

  /**
   * Generate detailed explanation for disease match
   * @param {string[]} matchedSymptoms - Symptoms that matched
   * @param {string[]} unmatchedSymptoms - Symptoms that didn't match
   * @param {number} weightedScore - Weighted score percentage
   * @param {string} diseaseName - Name of the disease
   * @param {string[]} diseaseSymptoms - All disease symptoms
   * @returns {string} Detailed explanation
   */
  generateDetailedExplanation(matchedSymptoms, unmatchedSymptoms, weightedScore, diseaseName, diseaseSymptoms) {
    const matchedCount = matchedSymptoms.length;
    const unmatchedCount = unmatchedSymptoms.length;
    const scorePercent = Math.round(weightedScore * 100);

    let explanation = `${diseaseName} matches with ${scorePercent}% weighted symptom correlation. `;

    if (matchedSymptoms.length > 0) {
      explanation += `Matching symptoms: ${matchedSymptoms.join(', ')}. `;
    }

    if (unmatchedSymptoms.length > 0) {
      explanation += `Symptoms not matching this condition: ${unmatchedSymptoms.join(', ')}. `;
    }

    explanation += `This condition typically involves ${diseaseSymptoms.length} symptoms. `;

    if (weightedScore >= 0.8) {
      explanation += 'Strong correlation - high likelihood of this condition.';
    } else if (weightedScore >= 0.6) {
      explanation += 'Moderate correlation - further evaluation recommended.';
    } else if (weightedScore >= 0.4) {
      explanation += 'Weak correlation - consider additional symptoms or testing.';
    }

    return explanation;
  }

  /**
   * Analyze user symptoms against the medical dataset using category-based matching
   * @param {string[]} userSymptoms - Array of user-reported symptoms
   * @returns {MatchResult[]} Array of matching results sorted by weighted score
   */
  analyzeSymptoms(userSymptoms) {
    const normalizedUserSymptoms = this.normalizeSymptoms(userSymptoms);

    if (normalizedUserSymptoms.length === 0) {
      throw new Error('No valid symptoms provided');
    }

    // Step 1: Identify primary symptom category
    const primaryCategory = this.identifySymptomCategory(normalizedUserSymptoms);

    // Step 2: Get diseases from primary category and related categories
    const primaryDiseases = this.getDiseasesByCategory(primaryCategory);
    const relatedCategories = this.getRelatedCategories(primaryCategory);
    const relatedDiseases = relatedCategories.flatMap(cat => this.getDiseasesByCategory(cat));

    // Combine primary and related diseases, prioritizing primary
    const relevantDiseases = [...primaryDiseases, ...relatedDiseases];

    // If no diseases in relevant categories, fall back to all diseases
    const diseasesToCheck = relevantDiseases.length > 0 ? relevantDiseases : this.dataset;

    const results = [];
    const allResults = []; // Store all results for fallback

    // Step 3: Calculate symptom strength for adaptive threshold
    const symptomStrength = this.calculateSymptomStrength(normalizedUserSymptoms);
    const adaptiveThreshold = this.getAdaptiveThreshold(symptomStrength);

    // Step 4: Analyze against relevant diseases
    for (const diseaseData of diseasesToCheck) {
      // Handle both old and new dataset structures
      const mandatorySymptoms = diseaseData.mandatory_symptoms || [];
      const optionalSymptoms = diseaseData.optional_symptoms || diseaseData.symptoms || [];
      const allDiseaseSymptoms = [...mandatorySymptoms, ...optionalSymptoms];

      const normalizedDiseaseSymptoms = this.normalizeSymptoms(allDiseaseSymptoms);

      // Step 4a: Check mandatory symptoms (if specified)
      if (mandatorySymptoms.length > 0) {
        const hasMandatorySymptoms = mandatorySymptoms.some(mandatory =>
          normalizedUserSymptoms.some(userSymptom =>
            this.symptomsMatch(userSymptom, mandatory)
          )
        );

        if (!hasMandatorySymptoms) {
          continue; // Skip diseases that don't have required mandatory symptoms
        }
      }

      // Step 4b: Find matched and unmatched symptoms using flexible matching
      const matchedSymptoms = [];
      const unmatchedSymptoms = [];

      for (const userSymptom of normalizedUserSymptoms) {
        const isMatched = normalizedDiseaseSymptoms.some(diseaseSymptom =>
          this.symptomsMatch(userSymptom, diseaseSymptom)
        );

        if (isMatched) {
          matchedSymptoms.push(userSymptom);
        } else {
          unmatchedSymptoms.push(userSymptom);
        }
      }

      // Step 4c: Check multi-symptom matching criteria
      if (!this.meetsMatchingCriteria(matchedSymptoms, normalizedUserSymptoms, normalizedDiseaseSymptoms)) {
        continue; // Skip diseases that don't meet minimum matching requirements
      }

      // Step 4d: Calculate weighted score using disease-specific weights
      const weightedScore = this.calculateWeightedScore(matchedSymptoms, normalizedDiseaseSymptoms, diseaseData);

      // Step 4e: Get specialist based on category and strongest symptom
      const specialist = this.getSpecialistFromCategoryAndSymptoms(diseaseData.category, matchedSymptoms, diseaseData.specialist);

      // Step 4f: Generate explanation
      const explanation = this.generateDetailedExplanation(
        matchedSymptoms,
        unmatchedSymptoms,
        weightedScore,
        diseaseData.disease_name || diseaseData.disease,
        normalizedDiseaseSymptoms
      );

      const result = {
        disease: diseaseData.disease_name || diseaseData.disease,
        confidence: weightedScore,
        matchedSymptoms,
        unmatchedSymptoms,
        weightedScore: Math.round(weightedScore * 100),
        specialist,
        precautions: diseaseData.precautions,
        severity: diseaseData.severity,
        emergency: diseaseData.emergency || false,
        explanation,
        category: diseaseData.category
      };

      allResults.push(result); // Store all results for fallback

      // Step 4g: Apply adaptive threshold filtering
      if (weightedScore >= adaptiveThreshold) {
        results.push(result);
      }
    }

    // Step 5: Apply fallback logic if no results pass threshold
    if (results.length === 0 && allResults.length > 0) {
      // Sort all results by score and take top 2
      const fallbackResults = allResults
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 2)
        .map(result => ({
          ...result,
          explanation: result.explanation + ' (Low confidence prediction - consider additional symptoms or professional medical evaluation)',
          weightedScore: Math.max(result.weightedScore, 20) // Ensure minimum 20% display
        }));

      results.push(...fallbackResults);
    }

    // Step 6: Return results sorted by confidence
    return results
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.MAX_RESULTS);
  }

  /**
   * Get emergency warning if any matched diseases are emergencies
   * @param {MatchResult[]} results - Analysis results
   * @returns {string|null} Emergency warning message or null
   */
  getEmergencyWarning(results) {
    const emergencyDiseases = results.filter(result => result.emergency);

    if (emergencyDiseases.length === 0) {
      return null;
    }

    const highestEmergency = emergencyDiseases[0];
    const emergencyNames = emergencyDiseases.map(d => d.disease).join(', ');

    return `POTENTIAL EMERGENCY: Your symptoms may indicate ${emergencyNames}. ` +
           `${highestEmergency.disease} has a ${Math.round(highestEmergency.confidence * 100)}% ` +
           `confidence match. Please seek immediate medical attention at the nearest emergency room ` +
           `or call emergency services. Do not delay seeking medical care.`;
  }

  /**
   * Get recommended specialist based on highest confidence match
   * @param {MatchResult[]} results - Analysis results
   * @returns {string} Recommended specialist
   */
  getRecommendedSpecialist(results) {
    if (results.length === 0) {
      return 'General Practitioner';
    }

    // Return specialist from highest confidence match
    return results[0].specialist;
  }

  /**
   * Get precautions from highest confidence match
   * @param {MatchResult[]} results - Analysis results
   * @returns {string[]} Array of precautions
   */
  getPrecautions(results) {
    if (results.length === 0) {
      return [
        'Consult a healthcare professional for proper diagnosis',
        'Monitor your symptoms closely',
        'Stay hydrated and rest',
        'Seek medical attention if symptoms worsen'
      ];
    }

    return results[0].precautions;
  }

  /**
   * Get dynamic, context-aware precautions based on analysis results
   * Uses disease-specific precautions if strong match, otherwise category-based
   * 
   * @param {MatchResult[]} results - Analysis results with disease matches
   * @param {string} primaryCategory - Identified symptom category
   * @param {string[]} normalizedSymptoms - User's normalized symptoms
   * @param {string} severity - Severity level (mild/moderate/severe/critical)
   * @returns {Object} Dynamic precautions object with metadata
   */
  getDynamicPrecautions(results = [], primaryCategory = 'default', normalizedSymptoms = [], severity = 'moderate') {
    // Import dynamic precaution selector
    import('./precaution-selector.js').then(module => {
      const { selectPrecautions, formatPrecautionsForResponse, generatePrecautionSummary } = module;
      
      const selectionResult = selectPrecautions(results, primaryCategory, normalizedSymptoms);
      const formatted = formatPrecautionsForResponse(selectionResult, severity);
      const summary = generatePrecautionSummary(
        normalizedSymptoms,
        selectionResult.source,
        selectionResult.matchedDisease,
        selectionResult.matchedCategory
      );

      return {
        ...formatted,
        summary
      };
    }).catch(err => {
      console.error('Error importing precaution selector:', err);
      return this.getPrecautionsFallback(results, primaryCategory, normalizedSymptoms);
    });
  }

  /**
   * Get dynamic precautions synchronously (for use when async is not preferred)
   * Uses disease-specific precautions if strong match, otherwise category-based
   * 
   * @param {MatchResult[]} results - Analysis results with disease matches
   * @param {string} primaryCategory - Identified symptom category
   * @param {string[]} normalizedSymptoms - User's normalized symptoms
   * @param {string} severity - Severity level
   * @returns {Object} Dynamic precautions object
   */
  getDynamicPrecautionsSync(results = [], primaryCategory = 'default', normalizedSymptoms = [], severity = 'moderate') {
    // CASE 1: Strong disease match (confidence >= 0.7)
    if (results.length > 0) {
      const topMatch = results[0];
      const confidence = topMatch.weightedScore / 100 || topMatch.confidence || 0;

      if (confidence >= 0.7) {
        // High confidence - use disease's precautions with severity enhancement
        const basePrecautions = topMatch.precautions || [];
        const enhanced = this.enhancePrecautionsWithSeverity(basePrecautions, severity);

        return {
          precautions: enhanced,
          specialist: topMatch.specialist || 'General Practitioner',
          precaution_source: 'disease',
          matched_disease: topMatch.disease,
          matched_category: null,
          confidence: confidence,
          explanation: `High-confidence match for ${topMatch.disease}. These precautions are specifically tailored for this condition.`,
          summary: `Your symptoms indicate ${topMatch.disease} with ${Math.round(confidence * 100)}% confidence. Follow these disease-specific precautions.`
        };
      }

      // CASE 2: Moderate match (0.4-0.7) - still use disease precautions if available
      if (confidence >= 0.4 && confidence < 0.7) {
        const basePrecautions = topMatch.precautions || [];
        if (basePrecautions.length > 0) {
          const enhanced = this.enhancePrecautionsWithSeverity(basePrecautions, severity);

          return {
            precautions: enhanced,
            specialist: topMatch.specialist || 'General Practitioner',
            precaution_source: 'disease',
            matched_disease: topMatch.disease,
            matched_category: null,
            confidence: confidence,
            explanation: `Moderate-confidence match for ${topMatch.disease}. These precautions apply to your condition but professional evaluation is recommended.`,
            summary: `Your symptoms may indicate ${topMatch.disease}. These precautions are tailored for this condition. See a healthcare provider for confirmation.`
          };
        }
      }
    }

    // CASE 3: Use category-based precautions if available
    if (primaryCategory && primaryCategory !== 'default' && primaryCategory !== 'unknown') {
      const categoryPrec = this.getCategoryPrecautions(primaryCategory);

      if (categoryPrec && categoryPrec.precautions && categoryPrec.precautions.length > 0) {
        const enhanced = this.enhancePrecautionsWithSeverity(categoryPrec.precautions, severity);
        const alignedSpecialist = this.getAlignedSpecialistForCategory(primaryCategory, results);

        return {
          precautions: enhanced,
          specialist: alignedSpecialist,
          precaution_source: 'category',
          matched_disease: null,
          matched_category: primaryCategory,
          explanation: `Based on your ${primaryCategory} symptoms, these precautions focus on managing this category of condition.`,
          summary: `Your symptoms appear to be ${primaryCategory} in nature. Follow these category-based precautions and see a healthcare provider.`
        };
      }
    }

    // CASE 4: Fallback to default precautions
    return this.getPrecautionsFallback(results, primaryCategory, normalizedSymptoms);
  }

  /**
   * Get fallback precautions for when no matches found
   * @param {MatchResult[]} results - Analysis results
   * @param {string} primaryCategory - Primary category
   * @param {string[]} normalizedSymptoms - User's symptoms
   * @returns {Object} Fallback precautions
   */
  getPrecautionsFallback(results = [], primaryCategory = 'default', normalizedSymptoms = []) {
    const defaultPrecautions = [
      'Rest and allow your body to recover',
      'Stay well-hydrated - drink water throughout the day',
      'Monitor your symptoms and any changes',
      'Take over-the-counter pain relievers if appropriate',
      'Avoid strenuous activity until you feel better',
      'Maintain good hygiene and wash hands frequently',
      'Keep your environment clean and comfortable',
      'Consult a healthcare professional for proper diagnosis and treatment'
    ];

    return {
      precautions: defaultPrecautions,
      specialist: 'General Practitioner',
      precaution_source: 'default',
      matched_disease: null,
      matched_category: primaryCategory,
      explanation: 'These are general wellness precautions. A healthcare professional should evaluate your specific symptoms for proper diagnosis.',
      summary: 'No strong matches found in our database. These general precautions are recommended while you seek professional medical evaluation.'
    };
  }

  /**
   * Enhance precautions with severity-based recommendations
   * @param {string[]} basePrecautions - Base precautions
   * @param {string} severity - Severity level
   * @returns {string[]} Enhanced precautions
   */
  enhancePrecautionsWithSeverity(basePrecautions = [], severity = 'mild') {
    // Combine severity-specific prefix with base precautions
    const precautions = [...basePrecautions];

    const severityPrefix = {
      'critical': [
        '⚠️ CRITICAL: Seek emergency medical attention immediately',
        'Call emergency services or go to nearest emergency room',
        'Do not drive yourself - call an ambulance'
      ],
      'severe': [
        '⚠️ SEVERE: Seek immediate medical attention',
        'Schedule an urgent appointment with your healthcare provider today',
        'Do not delay - medical evaluation is important'
      ],
      'moderate': [
        '⚠️ Schedule an appointment with your healthcare provider',
        'Monitor your symptoms closely for any changes'
      ],
      'mild': [
        'Monitor your symptoms for improvement'
      ]
    };

    const prefix = severityPrefix[severity] || severityPrefix['mild'];

    // Merge, clean (trim, remove empty/null/undefined), dedupe and limit
    const merged = [...prefix, ...precautions]
      .map(p => (typeof p === 'string' ? p.trim() : ''))
      .filter(p => p && p.length > 0);

    // Deduplicate while preserving order
    const seen = new Set();
    const deduped = [];
    for (const p of merged) {
      if (!seen.has(p)) {
        seen.add(p);
        deduped.push(p);
      }
    }

    // Limit to reasonable number
    const MAX_PRECAUTIONS = 12;
    return deduped.slice(0, MAX_PRECAUTIONS);
  }

  /**
   * Clean a precautions array (backend-side safety)
   * Removes null/undefined/whitespace-only entries, trims, dedupes and limits length
   * @param {Array} arr - precautions array
   * @param {number} max - maximum number of items to keep
   * @returns {string[]} Cleaned precautions array
   */
  cleanPrecautionsArray(arr = [], max = 12) {
    if (!Array.isArray(arr)) return [];
    const cleaned = arr
      .map(p => (typeof p === 'string' ? p.trim() : ''))
      .filter(p => p && p.length > 0);

    const seen = new Set();
    const deduped = [];
    for (const p of cleaned) {
      if (!seen.has(p)) {
        seen.add(p);
        deduped.push(p);
      }
      if (deduped.length >= max) break;
    }

    return deduped;
  }

  /**
   * Get category-based precautions mapping
   * @param {string} category - Symptom category
   * @returns {Object} Category precautions object
   */
  getCategoryPrecautions(category) {
    const categoryPrecautions = {
      'respiratory': {
        precautions: [
          'Use a humidifier to keep air moist and ease breathing',
          'Stay hydrated by drinking warm fluids like tea or broth',
          'Avoid smoke, pollution, and other airway irritants',
          'Rest and avoid strenuous physical activity',
          'Elevate your head while sleeping to help breathing',
          'Monitor your breathing rate and symptoms',
          'Avoid cold air exposure when possible',
          'Seek medical attention if breathing becomes difficult'
        ],
        specialist: 'Pulmonologist or General Practitioner'
      },
      'cardiac': {
        precautions: [
          'Stop all physical activity immediately',
          'Rest in a comfortable position',
          'Monitor your heart rate and blood pressure',
          'Avoid caffeine and stimulants',
          'Do not drive or operate machinery',
          'Stay calm and breathe slowly and deeply',
          'Take prescribed heart medications as directed',
          'Seek emergency care if symptoms persist'
        ],
        specialist: 'Cardiologist or Emergency Department'
      },
      'musculoskeletal': {
        precautions: [
          'Rest the affected area - avoid heavy lifting',
          'Apply ice to reduce swelling (15-20 min intervals)',
          'Use compression wraps or braces for support',
          'Elevate the affected area above heart level',
          'Take over-the-counter pain relief as needed',
          'Avoid activities that worsen the pain',
          'Apply heat after acute swelling subsides',
          'Consider physical therapy if pain persists'
        ],
        specialist: 'Orthopedic Surgeon or Physical Therapist'
      },
      'gastrointestinal': {
        precautions: [
          'Drink clear fluids regularly to stay hydrated',
          'Eat bland foods like toast, rice, and bananas',
          'Avoid dairy, fatty, oily, and spicy meals',
          'Avoid alcohol and caffeine temporarily',
          'Rest and minimize physical activity',
          'Monitor for signs of dehydration',
          'Use ginger tea or peppermint for relief',
          'Seek medical attention if symptoms persist'
        ],
        specialist: 'Gastroenterologist or General Practitioner'
      },
      'neurological': {
        precautions: [
          'Rest in a quiet, dark environment',
          'Avoid driving or operating machinery',
          'Stay well-hydrated',
          'Avoid sudden movements',
          'Track symptom onset and triggers',
          'Do not ignore sudden weakness or vision changes',
          'Practice relaxation techniques',
          'Seek urgent care for sudden severe symptoms'
        ],
        specialist: 'Neurologist or General Practitioner'
      },
      'urinary': {
        precautions: [
          'Drink plenty of water throughout the day',
          'Urinate frequently to flush the urinary tract',
          'Apply heat pad to lower abdomen for comfort',
          'Avoid caffeine and alcohol',
          'Practice good hygiene',
          'Wear breathable cotton underwear',
          'Take prescribed antibiotics if given',
          'Avoid sexual activity until evaluated'
        ],
        specialist: 'Urologist or General Practitioner'
      },
      'skin': {
        precautions: [
          'Keep the affected area clean and dry',
          'Avoid scratching or irritating the skin',
          'Use gentle, fragrance-free moisturizers',
          'Avoid harsh soaps and very hot water',
          'Wear soft, breathable fabrics',
          'Avoid known skin irritants',
          'Apply cool compress to reduce itching',
          'Seek dermatologist care if worsening'
        ],
        specialist: 'Dermatologist or General Practitioner'
      },
      'infectious': {
        precautions: [
          'Rest and allow your body to recover',
          'Stay hydrated with water and electrolyte solutions',
          'Monitor your temperature regularly',
          'Take fever reducers if temperature is high',
          'Isolate from others to prevent spreading',
          'Cover mouth when coughing or sneezing',
          'Wash hands frequently and thoroughly',
          'Seek medical attention if symptoms worsen'
        ],
        specialist: 'Infectious Disease Specialist or General Practitioner'
      }
    };

    return categoryPrecautions[category] || categoryPrecautions['infectious'];
  }

  /**
   * Get specialist aligned with category
   * @param {string} category - Symptom category
   * @param {MatchResult[]} results - Analysis results
   * @returns {string} Recommended specialist
   */
  getAlignedSpecialistForCategory(category, results = []) {
    const categorySpec = this.getCategoryPrecautions(category);
    return categorySpec.specialist || 'General Practitioner';
  }
}

export default SymptomAnalyzer;