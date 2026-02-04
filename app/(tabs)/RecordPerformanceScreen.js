// screens/RecordPerformanceScreen.js
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Modal, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../config/firebase';
import { calculateSessionPerformance, calculateCalmnessIndex } from '../../utils/performanceUtils';
import { findMoodByKey } from './constants';
import { MoodSelector, RatingStars, ScaleSelector, Section } from './ui';

export default function RecordPerformanceScreen({ route, navigation }) {
  const { sessionId, club, uid, hrBefore, hrAfter, moodBefore } = route.params || {};
  
  // Session Performance Log
  const [confidenceBefore, setConfidenceBefore] = useState(null);
  const [confidenceAfter, setConfidenceAfter] = useState(null);
  const [focusScore, setFocusScore] = useState(null);
  
  // Calmness Index (heart rate data from PracticeScreen)
  const [hrBeforeInput, setHrBeforeInput] = useState(hrBefore?.toString() || '');
  const [hrAfterInput, setHrAfterInput] = useState(hrAfter?.toString() || '');
  const [moodAfter, setMoodAfter] = useState(null);
  
  // Club Performance Summary
  const [consistencyScore, setConsistencyScore] = useState(null);
  const [decisionClarity, setDecisionClarity] = useState(null);
  const [emotionalImprovement, setEmotionalImprovement] = useState(null);
  
  // Legacy rating (keeping for backward compatibility)
  const [rating, setRating] = useState(3);
  
  // Loading state
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('success'); // 'success' or 'error'

  const calculateAndSave = () => {
    // Calculate session performance
    const sessionPerformance = calculateSessionPerformance({
      confidenceBefore: confidenceBefore || 5,
      confidenceAfter: confidenceAfter || 5,
      focusScore: focusScore || 5,
    });

    // Convert mood keys to scores for calculations
    const moodBeforeScore = moodBefore ? (findMoodByKey(moodBefore)?.score || null) : null;
    const moodAfterScore = moodAfter ? (findMoodByKey(moodAfter)?.score || null) : null;

    // Calculate calmness index
    const calmnessData = calculateCalmnessIndex({
      hrBefore: parseInt(hrBeforeInput) || null,
      hrAfter: parseInt(hrAfterInput) || null,
      moodBefore: moodBeforeScore,
      moodAfter: moodAfterScore,
    });

    return {
      sessionPerformance,
      calmnessData,
    };
  };

  const saveSession = async () => {
    console.log('Save button clicked');
    console.log('Session ID:', sessionId);
    console.log('UID:', uid);
    console.log('Current values:', {
      confidenceBefore,
      confidenceAfter,
      focusScore,
      consistencyScore,
      decisionClarity,
      emotionalImprovement,
      hrBeforeInput,
      hrAfterInput,
      moodAfter,
    });
    
    if (isSaving) {
      console.log('Already saving, ignoring click');
      return;
    }
    
    if (!sessionId) {
      console.error('No sessionId provided');
      setModalMessage('Session ID is missing. Please start a new session.');
      setModalType('error');
      setShowModal(true);
      return;
    }
    
    if (!uid) {
      console.error('No uid provided');
      setModalMessage('User ID is missing. Please log in again.');
      setModalType('error');
      setShowModal(true);
      return;
    }
    
    // Validation
    if (confidenceBefore === null || confidenceAfter === null || focusScore === null) {
      setModalMessage('Please answer all session performance questions (confidence before, confidence after, and focus score).');
      setModalType('error');
      setShowModal(true);
      return;
    }
    
    if (consistencyScore === null || decisionClarity === null || emotionalImprovement === null) {
      setModalMessage('Please answer all club performance questions (consistency, decision clarity, and emotional improvement).');
      setModalType('error');
      setShowModal(true);
      return;
    }

    if (!hrBeforeInput || !hrAfterInput) {
      setModalMessage('Please enter heart rate before and after the session.');
      setModalType('error');
      setShowModal(true);
      return;
    }

    if (!moodAfter) {
      setModalMessage('Please select your mood after the session.');
      setModalType('error');
      setShowModal(true);
      return;
    }

    setIsSaving(true);
    try {
      console.log('Starting to save performance data...');
      const { sessionPerformance, calmnessData } = calculateAndSave();
      
      console.log('Updating session document:', sessionId);
      // Update the session document with all performance data
      await updateDoc(doc(db, `users/${uid}/sessions/${sessionId}`), {
        // Legacy fields
        rating,
        moodAfter,
        completedAt: serverTimestamp(),
        
        // Session Performance Log
        confidenceBefore,
        confidenceAfter,
        focusScore,
        confidenceShift: sessionPerformance.confidenceShift,
        overallSessionQuality: sessionPerformance.overallSessionQuality,
        
        // Calmness Index
        hrBefore: parseInt(hrBeforeInput),
        hrAfter: parseInt(hrAfterInput),
        moodBefore: moodBefore || null, // Keep as key for consistency
        moodAfter: moodAfter || null, // Keep as key for consistency
        hrChange: calmnessData?.hrChange || null,
        hrChangePercent: calmnessData?.hrChangePercent || null,
        calmnessPercent: calmnessData?.calmnessPercent || null,
        moodChange: calmnessData?.moodChange || null,
        
        // Club Performance Summary
        consistencyScore,
        decisionClarity,
        emotionalImprovement,
      });
      
      console.log('Performance data saved successfully');
      setIsSaving(false);
      setModalMessage('Performance data saved successfully!');
      setModalType('success');
      setShowModal(true);
    } catch (error) {
      console.error('Error saving session:', error);
      console.error('Error details:', error.message, error.code);
      setIsSaving(false);
      setModalMessage(`Failed to save session: ${error.message || 'Please try again.'}`);
      setModalType('error');
      setShowModal(true);
    }
  };

  const sessionPerformance = calculateSessionPerformance({
    confidenceBefore: confidenceBefore || 5,
    confidenceAfter: confidenceAfter || 5,
    focusScore: focusScore || 5,
  });

  // Convert mood keys to scores for display calculations
  const moodBeforeScore = moodBefore ? (findMoodByKey(moodBefore)?.score || null) : null;
  const moodAfterScore = moodAfter ? (findMoodByKey(moodAfter)?.score || null) : null;

  const calmnessData = calculateCalmnessIndex({
    hrBefore: parseInt(hrBeforeInput) || null,
    hrAfter: parseInt(hrAfterInput) || null,
    moodBefore: moodBeforeScore,
    moodAfter: moodAfterScore,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 8 }}>📊 Performance Tracker</Text>
        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
          Track your mental performance and progress
        </Text>

        {/* Session Performance Log */}
        <Section title="1️⃣ Session Performance Log">
          <Text style={{ fontSize: 14, color: '#374151', marginBottom: 12 }}>
            How confident did you feel before starting the session?
          </Text>
          <ScaleSelector
            value={confidenceBefore}
            onChange={setConfidenceBefore}
            min={1}
            max={10}
            label="Confidence Before (1 = Not confident, 10 = Very confident)"
          />

          <Text style={{ fontSize: 14, color: '#374151', marginTop: 16, marginBottom: 12 }}>
            How confident do you feel now?
          </Text>
          <ScaleSelector
            value={confidenceAfter}
            onChange={setConfidenceAfter}
            min={1}
            max={10}
            label="Confidence After (1 = Not confident, 10 = Very confident)"
          />

          <Text style={{ fontSize: 14, color: '#374151', marginTop: 16, marginBottom: 12 }}>
            How focused were you during the session?
          </Text>
          <ScaleSelector
            value={focusScore}
            onChange={setFocusScore}
            min={1}
            max={10}
            label="Focus Score (1 = Not focused, 10 = Very focused)"
          />

          {confidenceBefore !== null && confidenceAfter !== null && focusScore !== null && (
            <View style={{ marginTop: 16, padding: 12, backgroundColor: '#f0f9ff', borderRadius: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>Session Summary:</Text>
              <Text style={{ fontSize: 13, color: '#1e40af' }}>
                Confidence shifted by: {sessionPerformance.confidenceShift >= 0 ? '+' : ''}{sessionPerformance.confidenceShift}
              </Text>
              <Text style={{ fontSize: 13, color: '#1e40af' }}>
                Focus score: {focusScore}/10
              </Text>
              <Text style={{ fontSize: 13, color: '#1e40af', fontWeight: '600' }}>
                Overall session quality: {sessionPerformance.overallSessionQuality}/10
              </Text>
            </View>
          )}
        </Section>

        {/* Calmness Index */}
        <Section title="2️⃣ Calmness Index">
          <Text style={{ fontSize: 14, color: '#374151', marginBottom: 12 }}>
            Heart rate before breathing routine:
          </Text>
          <TextInput
            style={inputStyle}
            placeholder="Enter heart rate (bpm)"
            value={hrBeforeInput}
            onChangeText={setHrBeforeInput}
            keyboardType="numeric"
          />

          <Text style={{ fontSize: 14, color: '#374151', marginTop: 16, marginBottom: 12 }}>
            Heart rate after breathing routine:
          </Text>
          <TextInput
            style={inputStyle}
            placeholder="Enter heart rate (bpm)"
            value={hrAfterInput}
            onChangeText={setHrAfterInput}
            keyboardType="numeric"
          />

          <Text style={{ fontSize: 14, color: '#374151', marginTop: 16, marginBottom: 12 }}>
            Mood at the start:
          </Text>
          <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
            {moodBefore ? `Selected: ${moodBefore}` : 'Not recorded'}
          </Text>

          <Text style={{ fontSize: 14, color: '#374151', marginTop: 16, marginBottom: 12 }}>
            Mood after session:
          </Text>
          <MoodSelector value={moodAfter} onChange={setMoodAfter} />

          {calmnessData && (
            <View style={{ marginTop: 16, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>Calmness Results:</Text>
              <Text style={{ fontSize: 13, color: '#166534' }}>
                Change in heart rate: {calmnessData.hrChange >= 0 ? '+' : ''}{calmnessData.hrChange} bpm ({calmnessData.hrChangePercent >= 0 ? '+' : ''}{calmnessData.hrChangePercent}%)
              </Text>
              {calmnessData.moodChange !== 0 && (
                <Text style={{ fontSize: 13, color: '#166534' }}>
                  Change in emotional state: {calmnessData.moodChange >= 0 ? '+' : ''}{calmnessData.moodChange}
                </Text>
              )}
              <Text style={{ fontSize: 13, color: '#166534', fontWeight: '600' }}>
                Calmness percentage: {calmnessData.calmnessPercent}%
              </Text>
            </View>
          )}
        </Section>

        {/* Club Performance Summary */}
        <Section title={`3️⃣ Club Performance Summary: ${club?.name || 'Club'}`}>
          <Text style={{ fontSize: 14, color: '#374151', marginBottom: 12 }}>
            How consistent did you feel while using this club today?
          </Text>
          <ScaleSelector
            value={consistencyScore}
            onChange={setConsistencyScore}
            min={1}
            max={10}
            label="Consistency (1 = Very inconsistent, 10 = Very consistent)"
          />

          <Text style={{ fontSize: 14, color: '#374151', marginTop: 16, marginBottom: 12 }}>
            How clear were you in choosing this club?
          </Text>
          <ScaleSelector
            value={decisionClarity}
            onChange={setDecisionClarity}
            min={1}
            max={10}
            label="Decision Clarity (1 = Very unclear, 10 = Very clear)"
          />

          <Text style={{ fontSize: 14, color: '#374151', marginTop: 16, marginBottom: 12 }}>
            Did your emotional state improve after this module?
          </Text>
          <ScaleSelector
            value={emotionalImprovement}
            onChange={setEmotionalImprovement}
            min={1}
            max={10}
            label="Emotional Improvement (1 = No improvement, 10 = Significant improvement)"
          />
        </Section>

        {/* Legacy Rating (optional) */}
        <Section title="Overall Rating (Optional)">
          <Text style={{ fontSize: 14, color: '#374151', marginBottom: 8 }}>
            Rate your overall performance:
          </Text>
          <RatingStars value={rating} onChange={setRating} />
        </Section>

        <TouchableOpacity 
          style={[
            btn.primary, 
            { backgroundColor: isSaving ? '#9ca3af' : '#0d9488', marginTop: 8 },
            isSaving && { opacity: 0.6 }
          ]} 
          onPress={saveSession}
          disabled={isSaving}
        >
          <Text style={btn.text}>
            {isSaving ? 'Saving...' : 'Save Performance Data'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success/Error Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={[
            modalStyles.modalContainer,
            modalType === 'success' ? modalStyles.successModal : modalStyles.errorModal
          ]}>
            <Text style={modalStyles.modalTitle}>
              {modalType === 'success' ? '✅ Success' : '❌ Error'}
            </Text>
            <Text style={modalStyles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={[
                modalStyles.modalButton,
                modalType === 'success' ? modalStyles.successButton : modalStyles.errorButton
              ]}
              onPress={() => {
                setShowModal(false);
                if (modalType === 'success') {
                  console.log('Navigating back to Practice screen');
                  navigation.goBack();
                }
              }}
            >
              <Text style={modalStyles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const btn = {
  primary: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  text: { color: 'white', fontWeight: '700' },
};

const inputStyle = {
  backgroundColor: 'white',
  borderWidth: 1,
  borderColor: '#e5e7eb',
  borderRadius: 8,
  padding: 12,
  fontSize: 16,
  marginBottom: 8,
};

const modalStyles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  successModal: {
    borderTopWidth: 4,
    borderTopColor: '#10b981',
  },
  errorModal: {
    borderTopWidth: 4,
    borderTopColor: '#ef4444',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1f2937',
  },
  modalMessage: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 24,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  successButton: {
    backgroundColor: '#10b981',
  },
  errorButton: {
    backgroundColor: '#ef4444',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
};
