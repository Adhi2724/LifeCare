/**
 * Category-based precautions for fallback scenarios
 * When no strong disease match is found, these precautions are used based on symptom category
 * This ensures users still get tailored advice even without a specific diagnosis
 */

export const categoryPrecautions = {
  'respiratory': {
    precautions: [
      'Use a humidifier to keep air moist and ease breathing',
      'Stay hydrated by drinking warm fluids like tea or broth',
      'Avoid smoke, pollution, and other airway irritants',
      'Rest and avoid strenuous physical activity',
      'Elevate your head while sleeping to help breathing',
      'Monitor your breathing rate and symptoms',
      'Avoid cold air exposure when possible',
      'Seek medical attention if breathing becomes very difficult'
    ],
    specialist: 'Pulmonologist or General Practitioner',
    advice: 'For respiratory symptoms, focus on keeping airways open and moist, resting, and monitoring any changes in your breathing pattern.'
  },

  'cardiac': {
    precautions: [
      'Stop all physical activity immediately',
      'Rest in a comfortable position - sitting or lying down',
      'Monitor your heart rate and blood pressure if possible',
      'Avoid caffeine and stimulants',
      'Do not drive or operate machinery',
      'Stay calm and try to breathe slowly',
      'Take prescribed heart medications as directed',
      'Seek emergency care if symptoms worsen or persist'
    ],
    specialist: 'Cardiologist or Emergency Department',
    advice: 'For heart-related symptoms, cessation of activity and immediate medical evaluation are critical. Do not delay seeking professional help.'
  },

  'musculoskeletal': {
    precautions: [
      'Rest the affected area - avoid heavy lifting or strain',
      'Apply ice to reduce swelling and pain (15-20 min intervals)',
      'Use compression wraps or braces for support',
      'Elevate the affected area above heart level if possible',
      'Take over-the-counter pain relief as needed',
      'Avoid activities that worsen the pain',
      'Use heating pad after acute swelling subsides',
      'Consider physical therapy if pain persists'
    ],
    specialist: 'Orthopedic Surgeon or Physical Therapist',
    advice: 'For joint and muscle pain, the RICE protocol (Rest, Ice, Compression, Elevation) is highly effective. Avoid re-injury by limiting activities.'
  },

  'neurological': {
    precautions: [
      'Rest in a quiet, dark environment away from stimulation',
      'Avoid driving or operating machinery',
      'Stay well-hydrated',
      'Avoid sudden movements - move slowly and carefully',
      'Track symptom onset, duration, and any triggers',
      'Do not ignore sudden weakness or vision changes',
      'Reduce stress and practice relaxation techniques',
      'Seek urgent medical attention for sudden severe symptoms'
    ],
    specialist: 'Neurologist or Emergency Department',
    advice: 'For neurological symptoms, avoid triggers like stress and sudden movements. Seek immediate care for sudden onset or worsening symptoms.'
  },

  'gastrointestinal': {
    precautions: [
      'Drink clear fluids regularly to stay hydrated',
      'Eat bland foods like toast, rice, crackers, and bananas',
      'Avoid dairy, fatty, oily, and spicy meals',
      'Avoid alcohol and caffeine temporarily',
      'Rest and minimize physical activity',
      'Monitor for signs of dehydration',
      'Use ginger tea or peppermint for symptom relief',
      'Seek medical attention if symptoms persist beyond 2-3 days'
    ],
    specialist: 'Gastroenterologist or General Practitioner',
    advice: 'For stomach and digestive issues, prioritize hydration and bland foods. Gradually reintroduce normal diet as symptoms improve.'
  },

  'urinary': {
    precautions: [
      'Drink plenty of water throughout the day',
      'Urinate frequently to help flush the urinary tract',
      'Apply heat pad to lower abdomen for comfort',
      'Avoid caffeine and alcohol',
      'Practice good hygiene - wipe front to back',
      'Wear breathable cotton underwear',
      'Take prescribed antibiotics if given',
      'Avoid sexual activity until evaluated by doctor'
    ],
    specialist: 'Urologist or General Practitioner',
    advice: 'For urinary symptoms, staying hydrated and frequent urination help flush bacteria. Seek medical evaluation for proper diagnosis.'
  },

  'skin': {
    precautions: [
      'Keep the affected area clean and dry',
      'Avoid scratching or irritating the skin',
      'Use gentle, fragrance-free moisturizers',
      'Avoid harsh soaps and very hot water',
      'Wear soft, breathable fabrics like cotton',
      'Avoid known skin irritants and allergens',
      'Apply cool compress to reduce itching',
      'Seek dermatologist care if worsening or spreading'
    ],
    specialist: 'Dermatologist or General Practitioner',
    advice: 'For skin conditions, gentle care and avoiding irritants are essential. Keep the area clean but not overly dry.'
  },

  'endocrine': {
    precautions: [
      'Maintain a balanced, healthy diet',
      'Stay well-hydrated with water',
      'Follow prescribed medications exactly as directed',
      'Monitor symptoms regularly',
      'Keep regular appointments with your healthcare provider',
      'Maintain healthy body weight through balanced diet and exercise',
      'Manage stress through relaxation techniques',
      'Avoid skipping meals or medication doses'
    ],
    specialist: 'Endocrinologist or General Practitioner',
    advice: 'For hormonal or metabolic symptoms, medication adherence and lifestyle management are crucial for long-term health.'
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
    specialist: 'Infectious Disease Specialist or General Practitioner',
    advice: 'For general infectious symptoms, rest and hydration are key. Isolation helps prevent spreading to others.'
  },

  'default': {
    precautions: [
      'Rest and allow your body to recover',
      'Stay well-hydrated - drink water throughout the day',
      'Monitor your symptoms and any changes',
      'Take over-the-counter pain relievers if needed',
      'Avoid strenuous activity until you feel better',
      'Maintain good hygiene and wash hands frequently',
      'Keep your environment clean and comfortable',
      'Consult a healthcare professional for proper diagnosis'
    ],
    specialist: 'General Practitioner',
    advice: 'While your symptoms are being evaluated, rest and hydration are fundamental. Professional medical evaluation is recommended.'
  }
};

/**
 * Get precautions for a specific symptom category
 * @param {string} category - The symptom category
 * @returns {Object} Object with precautions array, specialist, and advice
 */
export function getCategoryPrecautions(category) {
  return categoryPrecautions[category] || categoryPrecautions['default'];
}

/**
 * Get category-specific precautions as an array
 * @param {string} category - The symptom category
 * @returns {string[]} Array of precautions
 */
export function getCategoryPrecautionsArray(category) {
  const categoryData = getCategoryPrecautions(category);
  return categoryData.precautions;
}

/**
 * Get specialist for a specific category
 * @param {string} category - The symptom category
 * @returns {string} Specialist name
 */
export function getSpecialistForCategory(category) {
  const categoryData = getCategoryPrecautions(category);
  return categoryData.specialist;
}

/**
 * Get advice text for a specific category
 * @param {string} category - The symptom category
 * @returns {string} Advice text
 */
export function getAdviceForCategory(category) {
  const categoryData = getCategoryPrecautions(category);
  return categoryData.advice;
}

/**
 * Check if category exists
 * @param {string} category - The symptom category
 * @returns {boolean} True if category exists
 */
export function hasCategory(category) {
  return category in categoryPrecautions;
}
