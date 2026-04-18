import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import twilio from 'twilio';
import SymptomAnalyzer from './utils/symptom-analyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

let analyzer;
try {
  analyzer = new SymptomAnalyzer();
} catch (error) {
  console.error('Failed to initialize SymptomAnalyzer:', error);
  process.exit(1);
}

// Initialize Twilio client
let twilioClient = null;
const hasTwilioConfig =
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_WHATSAPP_FROM &&
  process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid_here' &&
  process.env.TWILIO_AUTH_TOKEN !== 'your_twilio_auth_token_here' &&
  process.env.TWILIO_WHATSAPP_FROM !== 'whatsapp:+14155238886';

if (hasTwilioConfig) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Twilio client:', error.message);
  }
} else {
  console.log('⚠️ Twilio credentials not configured - WhatsApp sending will be skipped');
}

// Middleware
app.use(cors());
app.use(express.json());

// Reminder storage
const REMINDERS_FILE = path.join(__dirname, 'reminders.json');

// Helpers
function loadReminders() {
  try {
    if (fs.existsSync(REMINDERS_FILE)) {
      const data = fs.readFileSync(REMINDERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading reminders:', error);
  }
  return [];
}

function saveReminders(reminders) {
  try {
    fs.writeFileSync(REMINDERS_FILE, JSON.stringify(reminders, null, 2));
  } catch (error) {
    console.error('Error saving reminders:', error);
  }
}

function detectLanguage(text) {
  const tamilRegex = /[\u0B80-\u0BFF]/;
  return tamilRegex.test(text) ? 'Tamil' : 'English';
}

function normalizePhoneNumber(to) {
  if (!to || typeof to !== 'string') return null;

  let formatted = to.trim();

  if (formatted.startsWith('whatsapp:')) {
    formatted = formatted.replace('whatsapp:', '');
  }

  // Keep leading +, remove other non-digits
  formatted = formatted.startsWith('+')
    ? `+${formatted.slice(1).replace(/\D/g, '')}`
    : formatted.replace(/\D/g, '');

  if (!formatted) return null;

  // Assume India if no + prefix
  if (!formatted.startsWith('+')) {
    if (formatted.length === 10) {
      formatted = `+91${formatted}`;
    } else {
      formatted = `+${formatted}`;
    }
  }

  return formatted;
}

async function sendWhatsAppMessage(to, message) {
  if (!twilioClient) {
    console.log('⚠️ Twilio client not initialized - skipping WhatsApp message');
    return { success: false, error: 'Twilio not configured' };
  }

  const formattedTo = normalizePhoneNumber(to);
  if (!formattedTo) {
    return { success: false, error: 'Invalid phone number' };
  }

  try {
    const response = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${formattedTo}`,
      body: message
    });

    console.log(`✅ WhatsApp message sent successfully to ${formattedTo}: ${response.sid}`);
    return { success: true, sid: response.sid };
  } catch (error) {
    console.error(`❌ Failed to send WhatsApp message to ${formattedTo}:`, error.message);
    if (error.code) {
      console.error(`Twilio error code: ${error.code}`);
    }
    return { success: false, error: error.message };
  }
}

// Initialize reminders
let reminders = loadReminders();

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running'
  });
});

app.post('/api/analyze-symptoms', (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid input. Please provide symptoms as a non-empty string.'
      });
    }

    const language = detectLanguage(symptoms);

    const symptomArray = symptoms
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (symptomArray.length === 0) {
      return res.status(400).json({
        error: 'No valid symptoms detected. Please enter symptoms separated by commas.'
      });
    }

    const analysisResults = analyzer.analyzeSymptoms(symptomArray);

    if (analysisResults.length === 0) {
      const primaryCategory = analyzer.identifySymptomCategory(symptomArray);
      const fallbackAdvice = analyzer.generateCategoryFallbackAdvice(primaryCategory);
      const analysisSummary = analyzer.generateAnalysisSummary(
        symptomArray,
        analysisResults,
        primaryCategory
      );

      const dynamicPrecautions = analyzer.getDynamicPrecautionsSync(
        [],
        primaryCategory,
        analyzer.normalizeSymptoms(symptomArray),
        'moderate'
      );

      return res.json({
        normalized_symptoms: analyzer.normalizeSymptoms(symptomArray),
        language,
        possible_diseases: [],
        precautions: dynamicPrecautions.precautions,
        precautions_metadata: {
          source: dynamicPrecautions.precaution_source,
          matched_disease: null,
          matched_category: dynamicPrecautions.matched_category,
          explanation: dynamicPrecautions.explanation,
          summary: dynamicPrecautions.summary
        },
        recommended_specialist: dynamicPrecautions.specialist,
        emergency_warning: analyzer.getCriticalSymptomsWarning(symptomArray),
        disclaimer:
          'No strong matches found in our database. This could indicate a mild condition or symptoms that require professional medical evaluation.',
        explanation: `Based on your symptoms, this appears to be a ${primaryCategory} concern. ${fallbackAdvice.advice}`,
        general_advice: fallbackAdvice.advice,
        primary_category: primaryCategory,
        analysis_summary: analysisSummary
      });
    }

    const hasLowConfidence = analysisResults.some((result) =>
      result.explanation.includes('Low confidence prediction')
    );

    const emergencyWarning = analyzer.getCriticalSymptomsWarning(symptomArray);

    const possibleDiseases = analysisResults.map((result) => ({
      disease: result.disease,
      confidence_percentage: result.weightedScore,
      matched_symptoms: result.matchedSymptoms,
      unmatched_symptoms: result.unmatchedSymptoms,
      weighted_score: result.weightedScore,
      explanation: result.explanation
    }));

    const recommendedSpecialist = analyzer.getRecommendedSpecialist(analysisResults);
    const primaryCategory = analyzer.identifySymptomCategory(symptomArray);
    const severity =
      analysisResults.length > 0
        ? analysisResults[0].severity || 'moderate'
        : 'moderate';

    const dynamicPrecautions = analyzer.getDynamicPrecautionsSync(
      analysisResults,
      primaryCategory,
      analyzer.normalizeSymptoms(symptomArray),
      severity
    );

    const analysisSummary = analyzer.generateAnalysisSummary(
      symptomArray,
      analysisResults,
      primaryCategory
    );

    res.json({
      normalized_symptoms: analyzer.normalizeSymptoms(symptomArray),
      language,
      possible_diseases: possibleDiseases,
      precautions: dynamicPrecautions.precautions,
      precautions_metadata: {
        source: dynamicPrecautions.precaution_source,
        matched_disease: dynamicPrecautions.matched_disease,
        matched_category: dynamicPrecautions.matched_category,
        explanation: dynamicPrecautions.explanation,
        summary: dynamicPrecautions.summary
      },
      recommended_specialist: recommendedSpecialist,
      emergency_warning: emergencyWarning,
      disclaimer: hasLowConfidence
        ? 'Low confidence predictions shown. Please consult a healthcare professional for accurate diagnosis.'
        : 'This analysis is based on symptom matching against a medical dataset and should not be considered a medical diagnosis. Please consult a qualified healthcare professional for proper diagnosis and treatment.',
      explanation: hasLowConfidence
        ? 'These are low confidence predictions based on partial symptom matches. Additional symptoms or professional evaluation may be needed for accurate diagnosis.'
        : 'Analysis completed based on symptom matching against medical dataset.',
      analysis_summary: analysisSummary
    });
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    res.status(500).json({
      error: 'Internal server error while analyzing symptoms',
      message: error.message
    });
  }
});

app.get('/api/dataset-info', (req, res) => {
  res.json({
    totalDiseases: analyzer.dataset?.length || 0,
    lastUpdated: new Date().toISOString(),
    description: 'Medical symptom-disease dataset for AI-powered symptom analysis'
  });
});

// Reminder routes
app.post('/api/reminders', (req, res) => {
  try {
    const { medicineName, time, whatsappNumber } = req.body;

    if (!medicineName || !time) {
      return res.status(400).json({ error: 'Medicine name and time are required' });
    }

    const normalizedWhatsappNumber = whatsappNumber
      ? normalizePhoneNumber(whatsappNumber)
      : null;

    const newReminder = {
      id: Date.now().toString(),
      medicineName: medicineName.trim(),
      time,
      whatsappNumber: normalizedWhatsappNumber,
      status: 'upcoming',
      lastTriggeredAt: null,
      sent: false,
      lastSentMinuteKey: null,
      createdAt: new Date().toISOString()
    };

    reminders.push(newReminder);
    saveReminders(reminders);

    res.status(201).json(newReminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

app.get('/api/reminders', (req, res) => {
  res.json(reminders);
});

app.patch('/api/reminders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, snoozeMinutes } = req.body;

    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    if (status === 'taken') {
      reminder.status = 'taken';
      reminder.lastTriggeredAt = new Date().toISOString();
    } else if (status === 'dismissed') {
      reminder.status = 'upcoming';
      reminder.lastTriggeredAt = null;
      reminder.sent = false;
      reminder.lastSentMinuteKey = null;
    } else if (status === 'snoozed' && snoozeMinutes) {
      const [hours, minutes] = reminder.time.split(':').map(Number);
      const snoozeTime = new Date();
      snoozeTime.setHours(hours, minutes, 0, 0);
      snoozeTime.setMinutes(snoozeTime.getMinutes() + Number(snoozeMinutes));

      reminder.time = snoozeTime.toTimeString().slice(0, 5);
      reminder.status = 'upcoming';
      reminder.lastTriggeredAt = null;
      reminder.sent = false;
      reminder.lastSentMinuteKey = null;
    } else if (status) {
      reminder.status = status;
    }

    saveReminders(reminders);
    res.json(reminder);
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

app.delete('/api/reminders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = reminders.findIndex((r) => r.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    reminders.splice(index, 1);
    saveReminders(reminders);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

// Scheduler
async function checkReminders() {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM
  const currentMinuteKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${currentTime}`;

  let hasChanges = false;

  for (const reminder of reminders) {
    // Due reminder trigger
    if (reminder.status === 'upcoming' && reminder.time === currentTime) {
      console.log(`⏰ Reminder due: ${reminder.medicineName} at ${reminder.time}`);

      reminder.status = 'due';
      reminder.lastTriggeredAt = now.toISOString();
      hasChanges = true;

      if (
        reminder.whatsappNumber &&
        (!reminder.sent || reminder.lastSentMinuteKey !== currentMinuteKey)
      ) {
        const message = `Time to take your medicine: ${reminder.medicineName}`;
        const whatsappResult = await sendWhatsAppMessage(
          reminder.whatsappNumber,
          message
        );

        if (whatsappResult.success) {
          reminder.sent = true;
          reminder.lastSentMinuteKey = currentMinuteKey;
          hasChanges = true;
        } else {
          console.error(
            `❌ WhatsApp send failed for reminder ${reminder.id}: ${whatsappResult.error}`
          );
        }
      } else if (!reminder.whatsappNumber) {
        console.log(`ℹ️ No WhatsApp number for reminder ${reminder.id}`);
      }
    }

    // Missed dose after 5 minutes
    if (reminder.status === 'due' && reminder.lastTriggeredAt) {
      const triggeredTime = new Date(reminder.lastTriggeredAt);
      const minutesSinceTriggered = (now - triggeredTime) / (1000 * 60);

      if (minutesSinceTriggered > 5) {
        reminder.status = 'missed';
        hasChanges = true;
        console.log(`⚠️ Reminder missed: ${reminder.medicineName}`);
      }
    }
  }

  if (hasChanges) {
    saveReminders(reminders);
  }
}

// Run immediately, then every minute
checkReminders();
setInterval(checkReminders, 60000);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err?.message || 'Unexpected server error'
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Dataset-driven AI Symptom Checker Backend');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`📊 Medical dataset loaded with ${analyzer.dataset?.length || 0} disease records`);
  console.log(`🔍 API endpoint: POST http://localhost:${PORT}/api/analyze-symptoms`);
  console.log(`❤️ Health check: GET http://localhost:${PORT}/health`);
  console.log(`📋 Dataset info: GET http://localhost:${PORT}/api/dataset-info`);
  console.log(`💊 Reminder API: GET/POST http://localhost:${PORT}/api/reminders`);
});