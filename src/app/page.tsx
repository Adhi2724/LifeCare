'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PossibleDisease {
  disease: string
  confidence_percentage: number
  matched_symptoms: string[]
  unmatched_symptoms: string[]
  weighted_score: number
  explanation: string
}

interface AnalysisResult {
  normalized_symptoms: string[]
  language: string
  possible_diseases: PossibleDisease[]
  precautions: string[]
  recommended_specialist: string
  emergency_warning: string | null
  disclaimer: string
  general_advice?: string
  analysis_summary?: any
}

export default function Home() {
  const [symptoms, setSymptoms] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [detectedLanguage, setDetectedLanguage] = useState('English')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const tamilRegex = /[\u0B80-\u0BFF]/
    if (tamilRegex.test(symptoms)) {
      setDetectedLanguage('Tamil')
    } else {
      setDetectedLanguage('English')
    }
  }, [symptoms])

  const router = useRouter()

  const clearAnalysisState = () => {
    setResults(null)
  }

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      clearAnalysisState()
      setError('Please enter at least one symptom')
      return
    }

    clearAnalysisState()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/analyze-symptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: symptoms.trim() }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      clearAnalysisState()
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to analyze symptoms. Please check if the backend server is running on http://localhost:5000'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setSymptoms('')
    setDetectedLanguage('English')
    setIsLoading(false)
    setError('')
    clearAnalysisState()
    setIsRecording(false)
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  const symptomChips = symptoms
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  const safePrecautions =
    results?.precautions?.filter(
      (item) => typeof item === 'string' && item.trim() !== ''
    ) || []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Main Modules Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Main Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Medi Remind Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4 text-center">💊</div>
              <h3 className="text-xl font-semibold text-green-600 mb-2 text-center">
                Medi Remind
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Track medicines, set reminder times, and detect missed doses
              </p>
              <button
                type="button"
                onClick={() => router.push('/medi-remind')}
                className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Open Medi Remind
              </button>
            </div>

            {/* AI Symptom Checker Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4 text-center">🩺</div>
              <h3 className="text-xl font-semibold text-blue-600 mb-2 text-center">
                AI Symptom Checker
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Analyze symptoms and predict possible diseases
              </p>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Open Symptom Checker
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-blue-600 text-center mb-2">
            AI Symptom Checker
          </h1>
          <p className="text-gray-600 text-center">
            Enter your symptoms in Tamil or English using text or voice
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4">
            <p className="text-red-700 font-medium">❌ {error}</p>
          </div>
        )}

        {/* Symptom Input */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            Enter Symptoms
          </h2>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder={`Example: fever, cough, headache\nஉதாரணம்: காய்ச்சல், இருமல், தலைவலி`}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Voice Input */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            Voice Input
          </h2>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={toggleRecording}
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <span className="mr-2">🎤</span>
              {isRecording ? 'Stop Voice Input' : 'Start Voice Input'}
            </button>
          </div>
        </div>

        {/* Language Detection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Detected Language: {detectedLanguage}
          </span>
        </div>

        {/* Symptom Chips */}
        {symptomChips.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">
              Symptoms Preview
            </h2>
            <div className="flex flex-wrap gap-2">
              {symptomChips.map((chip, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isLoading}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && <span className="inline-block animate-spin">⏳</span>}
              {isLoading ? 'Analyzing symptoms...' : 'Analyze Symptoms'}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-3">
              <span className="text-4xl animate-spin">⏳</span>
            </div>
            <p className="text-blue-700 font-medium text-lg">
              Analyzing symptoms...
            </p>
            <p className="text-blue-600 text-sm mt-2">
              Please wait while we process your symptoms
            </p>
          </div>
        )}

        {/* Results Section */}
        {results && !isLoading && (
          <div className="space-y-6">
            {/* Normalized Symptoms */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-blue-600 mb-4">
                Normalized Symptoms
              </h2>
              <div className="flex flex-wrap gap-2">
                {results.normalized_symptoms.map((symptom, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            {/* Language Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-700">
                <span className="font-semibold">Language Detected:</span>{' '}
                {results.language}
              </p>
            </div>

            {/* Possible Diseases */}
            {results.possible_diseases.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-blue-600 mb-4">
                  Possible Diseases
                </h2>
                <div className="space-y-4">
                  {results.possible_diseases.map((disease, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-500 pl-4 py-4 bg-gray-50 rounded"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {disease.disease}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {disease.explanation}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {disease.confidence_percentage}%
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Weighted Score
                          </p>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${disease.confidence_percentage}%` }}
                        />
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {disease.matched_symptoms.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-green-700">
                              ✅ Matched Symptoms:
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {disease.matched_symptoms.map((symptom, idx) => (
                                <span
                                  key={idx}
                                  className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
                                >
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {disease.unmatched_symptoms.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-red-700">
                              ❌ Unmatched Symptoms:
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {disease.unmatched_symptoms.map((symptom, idx) => (
                                <span
                                  key={idx}
                                  className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs"
                                >
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General Advice */}
            {results.possible_diseases.length === 0 && results.general_advice && (
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-blue-600 mb-4">
                  General Health Advice
                </h2>
                <p className="text-blue-800">{results.general_advice}</p>
              </div>
            )}

            {/* Precautions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-blue-600 mb-4">
                Recommended Precautions
              </h2>
              <ul className="space-y-2">
                {safePrecautions.map((precaution, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-lg mt-0.5">
                      ✓
                    </span>
                    <span className="text-gray-700">{precaution}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Specialist */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-blue-600 mb-4">
                Recommended Specialist
              </h2>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-blue-900 font-semibold text-lg">
                  {results.recommended_specialist}
                </p>
              </div>
            </div>

            {/* Emergency Warning */}
            {results.emergency_warning && (
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-red-700 mb-2">
                  ⚠️ Emergency Warning
                </h2>
                <p className="text-red-700">{results.emergency_warning}</p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800 font-medium">
                ⚠️ Disclaimer: {results.disclaimer}
              </p>
            </div>
          </div>
        )}

        {/* General Disclaimer */}
        {!results && !isLoading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800 font-medium">
              ⚠️ This is only an AI-based suggestion, not a confirmed diagnosis.
              Please consult a doctor.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}