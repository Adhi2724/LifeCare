/**
 * Disease-specific precautions mapping
 * Each disease has tailored precautions based on medical best practices
 * This enables dynamic, specific precaution recommendations
 */

export const diseasePrecautions = {
  // INFECTIOUS DISEASES
  'Common Cold': [
    'Rest and stay hydrated - drink water, warm tea, or broth',
    'Gargle with warm salt water to soothe sore throat',
    'Use saline nasal drops or sprays to relieve congestion',
    'Take vitamin C supplements or eat citrus fruits',
    'Avoid smoking and secondhand smoke',
    'Cover mouth when coughing or sneezing',
    'Wash hands frequently to prevent spread',
    'Avoid close contact with others for 5-7 days'
  ],

  'Influenza (Flu)': [
    'Get plenty of rest - allow your body to recover',
    'Stay hydrated - drink water, warm fluids, or electrolyte drinks',
    'Take antiviral medications if prescribed by doctor',
    'Use fever reducers like acetaminophen or ibuprofen as needed',
    'Isolate from others to prevent spreading the infection',
    'Avoid going to work or school for at least 5 days',
    'Monitor your temperature regularly',
    'Contact doctor if symptoms worsen or last beyond 7 days'
  ],

  'COVID-19': [
    'Isolate immediately from others for at least 5 days',
    'Monitor symptoms closely and track temperature daily',
    'Seek medical attention if experiencing breathing difficulties',
    'Wear an N95 mask when around others',
    'Maintain social distance of 6 feet from others',
    'Get tested immediately to confirm diagnosis',
    'Take prescribed antivirals within first 5 days if eligible',
    'Stay hydrated and rest in a well-ventilated area',
    'Seek emergency care if severe shortness of breath develops'
  ],

  'Bronchitis': [
    'Rest your body and avoid strenuous activity',
    'Stay hydrated - drink warm liquids like tea or broth',
    'Use a humidifier to keep air moist and ease coughing',
    'Use cough drops or lozenges to soothe throat irritation',
    'Avoid smoke, pollution, and other airway irritants',
    'Take over-the-counter cough suppressants if needed',
    'Elevate head while sleeping to ease congestion',
    'See doctor if cough persists beyond 3 weeks'
  ],

  'Pneumonia': [
    'Seek immediate medical attention - may require hospitalization',
    'Rest in bed with head elevated to aid breathing',
    'Take all prescribed antibiotics even if you feel better',
    'Stay hydrated - drink plenty of water and warm fluids',
    'Use a humidifier to keep air moist and ease coughing',
    'Monitor oxygen levels if you have an oximeter',
    'Avoid smoking and secondhand smoke exposure',
    'Follow up with doctor after completing treatment',
    'Call emergency if experiencing severe shortness of breath'
  ],

  // RESPIRATORY DISEASES
  'Asthma Attack': [
    'Use rescue inhaler (albuterol) immediately',
    'Sit upright to help breathing - avoid lying flat',
    'Try to stay calm and breathe slowly and deeply',
    'Remove potential triggers if identified',
    'Call emergency services if symptoms don\'t improve in 15 minutes',
    'Never drive yourself if having severe difficulty breathing',
    'Keep rescue inhaler with you at all times',
    'See doctor to review your asthma action plan',
    'Consider getting flu and pneumonia vaccines'
  ],

  // CARDIAC DISEASES
  'Heart Attack': [
    'CALL EMERGENCY SERVICES IMMEDIATELY - do not delay',
    'Chew aspirin (if not allergic) while waiting for help',
    'Stay calm and stop all physical activity',
    'Sit or lie down in a comfortable position',
    'Do not attempt to drive yourself to hospital',
    'Have someone stay with you until help arrives',
    'Loosen tight clothing to aid breathing',
    'Be prepared to describe symptoms to emergency responders'
  ],

  'Hypertension Crisis': [
    'Seek immediate medical attention - go to emergency room',
    'Do not ignore symptoms - this is a medical emergency',
    'Sit down and try to stay calm',
    'Monitor blood pressure if you have a monitor available',
    'Take prescribed blood pressure medications as directed',
    'Avoid physical exertion until evaluated by doctor',
    'Call emergency if severe headache persists or worsens',
    'After emergency care, follow all doctor\'s recommendations'
  ],

  // MUSCULOSKELETAL DISEASES
  'Arthritis': [
    'Rest the affected joints regularly throughout the day',
    'Apply ice packs for 15 minutes to reduce swelling',
    'Use heat therapy (warm compress) to ease stiffness',
    'Take anti-inflammatory medications as recommended',
    'Maintain a healthy weight to reduce joint stress',
    'Practice gentle exercises within your pain tolerance',
    'Use joint support aids like braces or wraps',
    'Eat foods rich in omega-3 fatty acids'
  ],

  'Sprained Ankle': [
    'RICE protocol: Rest, Ice, Compression, Elevation',
    'Rest the ankle completely - avoid weight-bearing',
    'Apply ice pack for 15-20 minutes, 3-4 times daily for first 48 hours',
    'Wrap ankle with compression bandage to reduce swelling',
    'Elevate foot above heart level when sitting or sleeping',
    'Use crutches or walking aid to avoid putting weight on ankle',
    'Wear ankle brace or supportive shoes',
    'See doctor if severe pain, inability to walk, or no improvement in 3 days'
  ],

  'Lower Back Pain': [
    'Apply ice pack for first 24-48 hours, then heat after',
    'Rest on firm, supportive mattress - avoid overly soft surfaces',
    'Maintain proper posture when sitting and standing',
    'Take over-the-counter pain relievers as needed',
    'Do gentle stretching exercises to ease muscle tension',
    'Avoid heavy lifting and sudden movements',
    'Use lumbar support pillow when sitting',
    'Consider physical therapy if pain persists'
  ],

  'Wrist Pain': [
    'Rest wrist - avoid repetitive movements and heavy lifting',
    'Wear a wrist brace or splint to immobilize the joint',
    'Apply ice for 15 minutes, 2-3 times daily',
    'Elevate wrist above heart level to reduce swelling',
    'Take anti-inflammatory medication as recommended',
    'Avoid using the wrist for at least 3-5 days',
    'Apply heat after swelling reduces to improve flexibility',
    'See doctor if pain persists or worsens'
  ],

  // NEUROLOGICAL DISEASES
  'Migraine': [
    'Rest in a dark, quiet room away from light and noise',
    'Apply cold compress to forehead or warm compress to neck',
    'Take prescribed migraine medication at first sign',
    'Stay hydrated - dehydration can trigger migraines',
    'Avoid triggers like certain foods, caffeine, or stress',
    'Try relaxation techniques like deep breathing',
    'Sleep in a cool, dark environment',
    'Keep a migraine diary to identify patterns'
  ],

  'Stroke': [
    'CALL EMERGENCY SERVICES IMMEDIATELY - time is critical',
    'Note the exact time symptoms started',
    'Do not give the person food or drink',
    'Do not attempt to transport to hospital yourself',
    'Keep the person calm and reassured',
    'Place person on side if unconscious',
    'Do not leave person alone',
    'Be ready to perform CPR if needed until help arrives'
  ],

  // GASTROINTESTINAL DISEASES
  'Gastroenteritis': [
    'Stay hydrated - drink small sips of clear fluids frequently',
    'Use oral rehydration solutions (ORS) to replace electrolytes',
    'Eat bland foods like toast, rice, crackers, and bananas',
    'Avoid solid foods until vomiting subsides',
    'Avoid dairy, fatty, and spicy foods for several days',
    'Rest and avoid strenuous activity',
    'Monitor for signs of severe dehydration',
    'Seek medical attention if symptoms persist beyond 3 days'
  ],

  'Stomach Pain': [
    'Rest and avoid eating heavy or spicy meals',
    'Drink clear fluids like water, broth, or herbal tea',
    'Apply heating pad to stomach area for comfort',
    'Try bland foods like toast, rice, or crackers',
    'Avoid dairy, fatty, oily, and spicy foods',
    'Take antacid medication if recommended',
    'Avoid alcohol and caffeine',
    'See doctor if pain persists beyond 24 hours or worsens'
  ],

  'Ulcer': [
    'Take prescribed antacid medications regularly',
    'Eat frequent small meals rather than large ones',
    'Avoid spicy, acidic, and fatty foods',
    'Limit caffeine and avoid alcohol',
    'Do not skip meals - this increases stomach acid',
    'Reduce stress through relaxation techniques',
    'Avoid NSAIDs like ibuprofen - use acetaminophen instead',
    'Follow up with doctor to monitor healing'
  ],

  // URINARY DISEASES
  'Urinary Tract Infection (UTI)': [
    'Drink plenty of water throughout the day',
    'Take antibiotics as prescribed - complete full course',
    'Use over-the-counter urinary pain relief if needed',
    'Urinate frequently to flush bacteria',
    'Apply heat pad to lower abdomen for comfort',
    'Avoid caffeine and alcohol during treatment',
    'Practice good hygiene - wipe front to back after toilet',
    'Wear breathable cotton underwear'
  ],

  // ENDOCRINE DISEASES
  'Diabetes': [
    'Monitor blood glucose levels regularly',
    'Follow prescribed medication or insulin schedule strictly',
    'Maintain a balanced diet with controlled carbohydrates',
    'Engage in regular physical activity as recommended',
    'Keep regular appointments with endocrinologist',
    'Check feet daily for cuts or sores',
    'Maintain healthy weight',
    'Stay hydrated and limit sugary drinks'
  ],

  'Hypertension': [
    'Take blood pressure medications as prescribed',
    'Reduce salt intake in diet - avoid processed foods',
    'Monitor blood pressure regularly at home',
    'Exercise regularly for at least 30 minutes daily',
    'Maintain healthy weight',
    'Reduce stress through relaxation or meditation',
    'Limit alcohol consumption',
    'Follow a DASH diet with vegetables and lean proteins'
  ],

  // SKIN DISEASES
  'Eczema': [
    'Moisturize skin daily with fragrance-free creams',
    'Use lukewarm water for bathing - avoid hot water',
    'Use gentle, fragrance-free soaps',
    'Avoid scratching - trim nails and wear soft gloves if needed',
    'Apply prescribed topical medications as directed',
    'Identify and avoid triggers that worsen eczema',
    'Use a humidifier in dry environments',
    'Wear soft, breathable fabrics like cotton'
  ],

  'Psoriasis': [
    'Keep skin moisturized with thick creams or ointments',
    'Avoid triggers like stress, cold weather, and irritants',
    'Use prescribed topical treatments as directed',
    'Avoid scratching - this worsens the condition',
    'Get moderate sun exposure if recommended by doctor',
    'Use gentle, fragrance-free skin products',
    'Maintain healthy weight and reduce stress',
    'Follow up with dermatologist for treatment evaluation'
  ],

  // BLOOD DISEASES
  'Anemia': [
    'Take iron supplements or prescribed medications regularly',
    'Eat iron-rich foods like lean meat, beans, and leafy greens',
    'Combine iron-rich foods with vitamin C for better absorption',
    'Rest frequently and avoid strenuous activity',
    'Stay hydrated and maintain balanced nutrition',
    'Keep regular follow-up appointments',
    'Have blood counts monitored periodically',
    'Report any worsening shortness of breath or dizziness'
  ],

  // ALLERGY-RELATED
  'Allergic Reaction': [
    'Remove yourself from allergen exposure immediately',
    'Take antihistamine medication as recommended',
    'For mild reactions, apply cool compress to affected area',
    'For moderate reactions, seek medical attention',
    'For severe reactions (difficulty breathing), call emergency',
    'Wear medical alert bracelet if you have severe allergies',
    'Carry epinephrine auto-injector if prescribed',
    'Keep allergy medication readily available'
  ],

  'Hay Fever': [
    'Stay indoors with windows closed during high pollen counts',
    'Take antihistamines as needed - start early in season',
    'Use saline nasal sprays to clear congestion',
    'Rinse hair and change clothes after being outdoors',
    'Shower before bed to remove pollen',
    'Use air purifier with HEPA filter indoors',
    'Avoid hanging laundry outside during pollen season',
    'Consider nasal corticosteroid spray for better control'
  ]
};

/**
 * Get precautions for a specific disease
 * @param {string} diseaseName - The name of the disease
 * @returns {string[]} Array of precautions, or empty array if disease not found
 */
export function getPrecautionsForDisease(diseaseName) {
  return diseasePrecautions[diseaseName] || [];
}

/**
 * Check if disease-specific precautions exist
 * @param {string} diseaseName - The name of the disease
 * @returns {boolean} True if disease has specific precautions
 */
export function hasDiseasePrecautions(diseaseName) {
  return diseaseName in diseasePrecautions;
}
