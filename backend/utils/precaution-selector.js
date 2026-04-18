/**
 * Dynamic Precaution Selection Logic
 * 
 * Determines which precautions to show based on:
 * 1. Strong disease match -> use disease-specific precautions
 * 2. Weak/no disease match -> use category-based precautions
 * 3. Fallback -> use generic precautions
 * 
 * This ensures precautions are always relevant to the user's symptoms
 */

import { getPrecautionsForDisease, hasDiseasePrecautions } from './disease-precautions.js';
import {
  getCategoryPrecautionsArray,
  getSpecialistForCategory,
  getCategoryPrecautions
} from './category-precautions.js';

/**
 * Represents the result of precaution selection
 * @typedef {Object} PrecautionSelectionResult
 * @property {string[]} precautions - Array of recommended precautions
 * @property {string} specialist - Recommended specialist
 * @property {string} source - Where precautions came from: 'disease', 'category', or 'default'
 * @property {string} matchedDisease - The disease precautions are based on (if source is 'disease')
 * @property {string} matchedCategory - The category precautions are based on (if source is 'category')
 * @property {string} explanation - Explanation of why these precautions were selected
 */

/**
 * Select the best precautions based on analysis results
 * 
 * Strategy:
 * 1. If strong disease match (confidence >= 0.7): use disease-specific precautions
 * 2. If moderate disease match (0.4-0.7): blend disease + category precautions
 * 3. If weak match or no match: use category-based precautions
 * 4. If no category can be identified: use default precautions
 * 
 * @param {Object} analysisResults - Results from symptom analysis
 * @param {Array} analysisResults.possibleDiseases - Array of matched diseases with confidence scores
 * @param {string} primaryCategory - Identified symptom category
 * @param {Array} normalizedSymptoms - User's normalized symptoms
 * @returns {PrecautionSelectionResult} Selected precautions and metadata
 */
export function selectPrecautions(analysisResults = [], primaryCategory = 'default', normalizedSymptoms = []) {
  // CASE 1: Strong disease match (confidence >= 0.7)
  if (analysisResults.length > 0) {
    const topMatch = analysisResults[0];
    const confidence = topMatch.weightedScore || topMatch.confidence_percentage || 0;

    if (confidence >= 0.7) {
      const diseaseName = topMatch.disease || topMatch.disease_name;
      const diseasePrec = getPrecautionsForDisease(diseaseName);

      if (diseasePrec.length > 0) {
        return {
          precautions: diseasePrec,
          specialist: topMatch.specialist || 'General Practitioner',
          source: 'disease',
          matchedDisease: diseaseName,
          confidence: confidence,
          explanation: `High-confidence match for ${diseaseName}. These precautions are specifically tailored for this condition.`
        };
      }
    }

    // CASE 2: Moderate disease match (0.4-0.7) - blend disease and category
    if (confidence >= 0.4 && confidence < 0.7) {
      const diseaseName = topMatch.disease || topMatch.disease_name;
      const diseasePrec = getPrecautionsForDisease(diseaseName);

      // If disease has precautions, use them; otherwise fall back to category
      if (diseasePrec.length > 0) {
        return {
          precautions: diseasePrec,
          specialist: topMatch.specialist || 'General Practitioner',
          source: 'disease',
          matchedDisease: diseaseName,
          confidence: confidence,
          explanation: `Moderate-confidence match for ${diseaseName}. These precautions apply to your condition but professional evaluation is recommended.`
        };
      }
    }
  }

  // CASE 3: Weak match or no match - use category-based precautions
  if (primaryCategory && primaryCategory !== 'default' && primaryCategory !== 'unknown') {
    const categoryPrec = getCategoryPrecautionsArray(primaryCategory);
    const categoryData = getCategoryPrecautions(primaryCategory);

    if (categoryPrec.length > 0) {
      // Align specialist with category
      const alignedSpecialist = getAlignedSpecialist(primaryCategory, analysisResults);

      return {
        precautions: categoryPrec,
        specialist: alignedSpecialist,
        source: 'category',
        matchedCategory: primaryCategory,
        explanation: `Based on your ${primaryCategory} symptoms, these precautions focus on managing this category of condition.`
      };
    }
  }

  // CASE 4: Fallback - use generic safe precautions
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
    source: 'default',
    explanation: 'These are general wellness precautions. A healthcare professional should evaluate your specific symptoms for proper diagnosis.'
  };
}

/**
 * Get aligned specialist based on category and disease results
 * Ensures specialist recommendations are consistent with symptom category
 * 
 * @param {string} category - Primary symptom category
 * @param {Array} analysisResults - Analysis results with disease information
 * @returns {string} Recommended specialist aligned with category
 */
export function getAlignedSpecialist(category, analysisResults = []) {
  const categorySpecialistMap = {
    'respiratory': 'Pulmonologist or General Practitioner',
    'cardiac': 'Cardiologist or General Practitioner',
    'musculoskeletal': 'Orthopedic Surgeon or Physical Therapist',
    'neurological': 'Neurologist or General Practitioner',
    'gastrointestinal': 'Gastroenterologist or General Practitioner',
    'urinary': 'Urologist or General Practitioner',
    'skin': 'Dermatologist or General Practitioner',
    'endocrine': 'Endocrinologist or General Practitioner',
    'infectious': 'Infectious Disease Specialist or General Practitioner'
  };

  // If analysis results have a specialist, consider it
  if (analysisResults.length > 0 && analysisResults[0].specialist) {
    const suggestedSpecialist = analysisResults[0].specialist;
    const categorySpecialist = categorySpecialistMap[category] || 'General Practitioner';

    // Return category specialist if it's a better match
    return categorySpecialist;
  }

  return categorySpecialistMap[category] || 'General Practitioner';
}

/**
 * Enhance precautions by adding severity-based recommendations
 * 
 * @param {string[]} basePrecautions - Base precautions array
 * @param {string} severity - Disease severity: 'mild', 'moderate', 'severe', 'critical'
 * @returns {string[]} Enhanced precautions with severity considerations
 */
export function enhancePrecautionsWithSeverity(basePrecautions = [], severity = 'mild') {
  const precautions = [...basePrecautions];

  const severityAdditions = {
    'critical': [
      'SEEK EMERGENCY MEDICAL ATTENTION IMMEDIATELY',
      'Call emergency services or go to nearest emergency room',
      'Do not drive yourself - call an ambulance'
    ],
    'severe': [
      'Seek immediate medical attention',
      'Schedule an urgent appointment with your healthcare provider',
      'Do not delay - medical evaluation is important'
    ],
    'moderate': [
      'Schedule an appointment with your healthcare provider',
      'Monitor your symptoms closely for any changes'
    ],
    'mild': [
      'Monitor your symptoms for improvement',
      'Contact your healthcare provider if symptoms persist'
    ]
  };

  const additions = severityAdditions[severity] || severityAdditions['mild'];
  return [...additions, ...precautions];
}

/**
 * Format precautions for API response
 * 
 * @param {PrecautionSelectionResult} selectionResult - Result from selectPrecautions
 * @param {string} severity - Optional severity level
 * @returns {Object} Formatted precautions object for API response
 */
export function formatPrecautionsForResponse(selectionResult, severity = 'moderate') {
  const finalPrecautions = enhancePrecautionsWithSeverity(
    selectionResult.precautions,
    severity
  );

  return {
    precautions: finalPrecautions,
    specialist: selectionResult.specialist,
    precaution_source: selectionResult.source,
    matched_disease: selectionResult.matchedDisease || null,
    matched_category: selectionResult.matchedCategory || null,
    explanation: selectionResult.explanation
  };
}

/**
 * Generate a precaution summary explaining why these precautions were chosen
 * 
 * @param {string[]} symptoms - User's symptoms
 * @param {string} source - Where precautions came from ('disease', 'category', 'default')
 * @param {string} matchedDisease - Matched disease name (if applicable)
 * @param {string} matchedCategory - Matched category (if applicable)
 * @returns {string} Summary explanation
 */
export function generatePrecautionSummary(symptoms, source, matchedDisease = null, matchedCategory = null) {
  const symptomList = symptoms.slice(0, 3).join(', ');
  const moreCount = symptoms.length > 3 ? ` and ${symptoms.length - 3} more` : '';

  if (source === 'disease' && matchedDisease) {
    return `Your symptoms (${symptomList}${moreCount}) strongly suggest ${matchedDisease}. These precautions are specifically designed for this condition.`;
  }

  if (source === 'category' && matchedCategory) {
    return `Your symptoms (${symptomList}${moreCount}) indicate a ${matchedCategory} condition. These precautions focus on managing ${matchedCategory} symptoms.`;
  }

  return `Based on your symptoms (${symptomList}${moreCount}), we recommend following these general wellness precautions while seeking professional medical evaluation.`;
}
