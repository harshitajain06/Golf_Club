// screens/PracticeScreen.js
import { collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import VideoPlayer from '../../components/VideoPlayer';
import { db } from '../../config/firebase';
import { saveHeartRateData } from '../../utils/heartRateUtils';
import { Section } from './ui';

// Breathing exercise data based on the image
const BREATHING_EXERCISES = {
  'Driver': { inhale: 4, hold: 2, exhale: 6, pause: 0, cycles: 3 },
  '3 Wood': { inhale: 4, hold: 2, exhale: 6, pause: 0, cycles: 3 },
  '5 Wood': { inhale: 4, hold: 2, exhale: 5, pause: 0, cycles: 3 },
  '3 Hybrid': { inhale: 3, hold: 2, exhale: 5, pause: 1, cycles: 3 },
  '5 Hybrid': { inhale: 4, hold: 0, exhale: 5, pause: 1, cycles: 3 },
  '3 Iron': { inhale: 4, hold: 2, exhale: 5, pause: 1, cycles: 3 },
  '4 Iron': { inhale: 4, hold: 2, exhale: 5, pause: 0, cycles: 3 },
  '5 Iron': { inhale: 4, hold: 1, exhale: 5, pause: 1, cycles: 3 },
  '6 Iron': { inhale: 4, hold: 2, exhale: 4, pause: 0, cycles: 3 },
  '7 Iron': { inhale: 4, hold: 2, exhale: 4, pause: 0, cycles: 3 },
  '8 Iron': { inhale: 4, hold: 2, exhale: 5, pause: 0, cycles: 3 },
  '9 Iron': { inhale: 3, hold: 2, exhale: 5, pause: 0, cycles: 3 },
  'Pitching Wedge': { inhale: 4, hold: 2, exhale: 5, pause: 0, cycles: 3 },
  'Sand Wedge': { inhale: 4, hold: 2, exhale: 6, pause: 0, cycles: 3 },
  'Putter': { inhale: 2, hold: 0, exhale: 2, pause: 3, cycles: 3 },
};

export default function PracticeScreen({ route, navigation }) {
  console.log('PracticeScreen route.params:', route.params);
  const { sessionId, club, uid } = route.params || {};
  console.log('Extracted params - sessionId:', sessionId, 'club:', club, 'uid:', uid);
  const [hrBefore, setHrBefore] = useState('');
  const [hrAfter, setHrAfter] = useState('');
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  
  // Tutorial videos state
  const [tutorialVideos, setTutorialVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  // Confirmation modal state
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  
  // Timer states
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('ready');
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [phaseStartTime, setPhaseStartTime] = useState(0);
  const [completedPhases, setCompletedPhases] = useState([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const currentPhaseRef = useRef('ready');
  const currentCycleRef = useRef(1);
  
  const exerciseData = BREATHING_EXERCISES[club?.name] || BREATHING_EXERCISES['Driver'];

  // Fetch tutorial videos from Firebase
  const fetchTutorialVideos = async () => {
    try {
      setLoadingVideos(true);
      const tutorialsRef = collection(db, 'tutorials');
      const q = query(tutorialsRef, where('clubType', '==', club?.name || 'Driver'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const videos = [];
      querySnapshot.forEach((doc) => {
        videos.push({ id: doc.id, ...doc.data() });
      });
      
      setTutorialVideos(videos);
    } catch (error) {
      console.error('Error fetching tutorial videos:', error);
      Alert.alert('Error', 'Failed to load tutorial videos. Please try again.');
    } finally {
      setLoadingVideos(false);
    }
  };

  // Load tutorial videos on component mount
  useEffect(() => {
    fetchTutorialVideos();
  }, [club?.name]);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            nextPhase();
            return 0;
          }
          return prev - 1;
        });
        
        // Update total elapsed time
        if (startTimeRef.current) {
          setTotalTimeElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning]);

  const nextPhase = () => {
    // Prevent multiple simultaneous calls
    if (isTransitioningRef.current) {
      console.log('nextPhase already in progress, skipping');
      return;
    }
    
    isTransitioningRef.current = true;
    console.log('nextPhase called - current phase:', currentPhaseRef.current, 'cycle:', currentCycleRef.current);
    
    // Record completed phase
    const phaseDuration = exerciseData[currentPhaseRef.current];
    setCompletedPhases(prev => [...prev, {
      phase: currentPhaseRef.current,
      cycle: currentCycleRef.current,
      duration: phaseDuration,
      completedAt: new Date().toLocaleTimeString()
    }]);
    
    // Simple phase progression logic
    let nextPhaseName = '';
    let nextDuration = 0;
    
    switch (currentPhaseRef.current) {
      case 'inhale':
        nextPhaseName = 'hold';
        nextDuration = exerciseData.hold;
        break;
      case 'hold':
        nextPhaseName = 'exhale';
        nextDuration = exerciseData.exhale;
        break;
      case 'exhale':
        nextPhaseName = 'pause';
        nextDuration = exerciseData.pause;
        break;
      case 'pause':
        // Cycle completed, move to next cycle or finish
        completeCycle();
        isTransitioningRef.current = false;
        return;
      default:
        console.log('Unknown phase:', currentPhaseRef.current);
        isTransitioningRef.current = false;
        return;
    }
    
    console.log('Moving from', currentPhaseRef.current, 'to', nextPhaseName, 'with duration:', nextDuration);
    
    // If next phase has 0 duration, skip it and move to the next one
    if (nextDuration === 0) {
      console.log('Skipping phase with 0 duration:', nextPhaseName);
      // Skip to the phase after this one
      let skipToPhase = '';
      let skipToDuration = 0;
      
      switch (nextPhaseName) {
        case 'hold':
          skipToPhase = 'exhale';
          skipToDuration = exerciseData.exhale;
          break;
        case 'exhale':
          skipToPhase = 'pause';
          skipToDuration = exerciseData.pause;
          break;
        case 'pause':
          // Skip pause, complete cycle
          completeCycle();
          isTransitioningRef.current = false;
          return;
      }
      
      if (skipToPhase) {
        console.log('Skipping to phase:', skipToPhase, 'with duration:', skipToDuration);
        currentPhaseRef.current = skipToPhase;
        setCurrentPhase(skipToPhase);
        setTimeLeft(skipToDuration);
        setPhaseProgress(0);
        setPhaseStartTime(Date.now());
      }
      isTransitioningRef.current = false;
      return;
    }
    
    // Set the next phase
    currentPhaseRef.current = nextPhaseName;
    setCurrentPhase(nextPhaseName);
    setTimeLeft(nextDuration);
    setPhaseProgress(0);
    setPhaseStartTime(Date.now());
    
    // Reset the transition flag after a short delay
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 100);
  };

  const completeCycle = () => {
    if (currentCycleRef.current < exerciseData.cycles) {
      // Move to next cycle - start with inhale again
      currentCycleRef.current += 1;
      currentPhaseRef.current = 'inhale';
      setCurrentCycle(currentCycleRef.current);
      setCurrentPhase('inhale');
      setTimeLeft(exerciseData.inhale);
      setPhaseProgress(0);
      setPhaseStartTime(Date.now());
    } else {
      // All 3 cycles completed - stop timer and show modal
      setIsTimerRunning(false);
      currentPhaseRef.current = 'completed';
      setCurrentPhase('completed');
      setTimeLeft(0);
      setPhaseProgress(100);
      setShowCompletionModal(true);
    }
  };

  const startTimer = () => {
    isTransitioningRef.current = false;
    currentPhaseRef.current = 'inhale';
    currentCycleRef.current = 1;
    setCurrentPhase('inhale');
    setTimeLeft(exerciseData.inhale);
    setCurrentCycle(1);
    setPhaseProgress(0);
    setTotalTimeElapsed(0);
    setCompletedPhases([]);
    setPhaseStartTime(Date.now());
    startTimeRef.current = Date.now();
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    currentPhaseRef.current = 'ready';
    currentCycleRef.current = 1;
    setCurrentPhase('ready');
    setTimeLeft(0);
    setCurrentCycle(1);
    setPhaseProgress(0);
    setTotalTimeElapsed(0);
    setCompletedPhases([]);
    startTimeRef.current = null;
  };

  const resetTimer = () => {
    stopTimer();
  };

  const closeCompletionModal = () => {
    setShowCompletionModal(false);
  };

  const restartExercise = () => {
    setShowCompletionModal(false);
    startTimer();
  };

  // Video handling functions
  const openVideo = (video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  // Confirmation modal functions
  const showCompleteSessionConfirmation = () => {
    if (!hrBefore || !hrAfter) {
      Alert.alert('Heart Rate Required', 'Please enter both heart rate values to continue.');
      return;
    }
    setShowConfirmationModal(true);
  };

  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
  };

  // Update phase progress
  useEffect(() => {
    if (isTimerRunning && currentPhase !== 'ready' && currentPhase !== 'completed') {
      const totalTime = exerciseData[currentPhase];
      const progress = ((totalTime - timeLeft) / totalTime) * 100;
      setPhaseProgress(progress);
    }
  }, [timeLeft, currentPhase, isTimerRunning, exerciseData]);

  // Calculate overall exercise progress
  const calculateOverallProgress = () => {
    if (currentPhase === 'ready') return 0;
    if (currentPhase === 'completed') return 100;
    
    // Calculate total time for all cycles
    const phases = ['inhale', 'hold', 'exhale', 'pause'].filter(phase => exerciseData[phase] > 0);
    const timePerCycle = phases.reduce((total, phase) => total + exerciseData[phase], 0);
    const totalExerciseTime = timePerCycle * exerciseData.cycles;
    
    // Calculate completed time
    const completedCycles = currentCycleRef.current - 1;
    const completedCyclesTime = completedCycles * timePerCycle;
    
    // Calculate current cycle progress
    const currentPhaseIndex = phases.indexOf(currentPhase);
    let currentCycleTime = 0;
    for (let i = 0; i < currentPhaseIndex; i++) {
      currentCycleTime += exerciseData[phases[i]];
    }
    currentCycleTime += exerciseData[currentPhase] - timeLeft;
    
    const totalCompletedTime = completedCyclesTime + currentCycleTime;
    return Math.min((totalCompletedTime / totalExerciseTime) * 100, 100);
  };

  const completeExercise = () => {
    if (!hrBefore) {
      Alert.alert('Heart Rate Required', 'Please enter your heart rate before exercise.');
      return;
    }
    setExerciseCompleted(true);
  };

  const saveSessionAndContinue = async () => {
    console.log('saveSessionAndContinue called');
    console.log('sessionId:', sessionId);
    console.log('uid:', uid);
    console.log('hrBefore:', hrBefore);
    console.log('hrAfter:', hrAfter);
    
    // Generate sessionId if missing (fallback for when navigation params aren't passed correctly)
    const currentSessionId = sessionId || `${Date.now()}`;
    console.log('Using sessionId:', currentSessionId);
    
    if (!uid) {
      console.log('No uid, returning');
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      return;
    }
    
    // Close confirmation modal
    setShowConfirmationModal(false);

    const hrBeforeValue = parseInt(hrBefore);
    const hrAfterValue = parseInt(hrAfter);

    if (isNaN(hrBeforeValue) || isNaN(hrAfterValue)) {
      Alert.alert('Invalid Input', 'Please enter valid heart rate numbers.');
      return;
    }

    try {
      console.log('Starting to save session data...');
      
      // Create or update the session document
      const sessionRef = doc(db, `users/${uid}/sessions/${currentSessionId}`);
      
      // First, try to create/update the session document with all the data
      await setDoc(sessionRef, {
        sessionId: currentSessionId,
        startedAt: serverTimestamp(),
        completedAt: serverTimestamp(),
        clubId: club?.id || null,
        clubName: club?.name || 'Unknown Club',
        moodBefore: null,
        hrBefore: hrBeforeValue,
        hrAfter: hrAfterValue,
        rating: null,
        moodAfter: null,
      }, { merge: true }); // merge: true will update existing fields or create if doesn't exist
      
      console.log('Session document created/updated successfully');
      
      // Save heart rate data using the utility function
      await saveHeartRateData(uid, currentSessionId, {
        hrBefore: hrBeforeValue,
        hrAfter: hrAfterValue,
        inputMethod: 'manual',
      });
      
      console.log('Heart rate data saved successfully');

      Alert.alert('Success', 'Session completed successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Stats') }
      ]);
    } catch (error) {
      console.error('Error saving heart rate data:', error);
      Alert.alert('Error', 'Failed to save session data. Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 8 }}>🎯 Your Practice with the {club?.name || 'Golf Club'}</Text>

        <Section title="📘 Tutorial Videos">
          <Text style={{ fontSize: 16, marginBottom: 16, color: '#374151' }}>
            {club?.desc || 'Practice with your golf club'}. Visualize, align, and breathe: inhale 4s, hold 4s, exhale 6s.
            Repeat 5 cycles, maintain relaxed grip pressure.
          </Text>
          
          {loadingVideos ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={{ marginTop: 8, color: '#6b7280' }}>Loading tutorial videos...</Text>
            </View>
          ) : tutorialVideos.length > 0 ? (
            <View>
              {tutorialVideos.map((video, index) => (
                <TouchableOpacity
                  key={video.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3
                  }}
                  onPress={() => openVideo(video)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 60,
                      height: 60,
                      backgroundColor: '#f3f4f6',
                      borderRadius: 8,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12
                    }}>
                      <Text style={{ fontSize: 24 }}>🎥</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 4 }}>
                        {video.title || `Tutorial ${index + 1}`}
                      </Text>
                      <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
                        {video.description || 'Learn proper technique and breathing'}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                        Duration: {video.duration || 'N/A'} • {video.difficulty || 'Beginner'}
                      </Text>
                    </View>
                    <View style={{
                      width: 32,
                      height: 32,
                      backgroundColor: '#2563eb',
                      borderRadius: 16,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Text style={{ color: 'white', fontSize: 16 }}>▶</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={{
              backgroundColor: '#f9fafb',
              borderRadius: 8,
              padding: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#e5e7eb'
            }}>
              <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
                No tutorial videos available for {club?.name || 'this club'} yet.
              </Text>
              <Text style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 4 }}>
                Check back later for new content!
              </Text>
            </View>
          )}
        </Section>

        <Section title="🫁 Breathing Exercise Timer">
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, textAlign: 'center' }}>
              {club?.name || 'Golf Club'} Breathing Pattern
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 16 }}>
              Inhale: {exerciseData.inhale}s | Hold: {exerciseData.hold}s | Exhale: {exerciseData.exhale}s
              {exerciseData.pause > 0 && ` | Pause: ${exerciseData.pause}s`}
            </Text>
            
            {/* Total Time Display */}
            {(isTimerRunning || currentPhase === 'completed') && (
              <View style={{ 
                backgroundColor: '#f0f9ff', 
                paddingHorizontal: 16, 
                paddingVertical: 8, 
                borderRadius: 20, 
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#0ea5e9'
              }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#0c4a6e', textAlign: 'center' }}>
                  Total Time: {Math.floor(totalTimeElapsed / 60)}:{(totalTimeElapsed % 60).toString().padStart(2, '0')}
                </Text>
              </View>
            )}
            
            {/* Timer Display */}
            <View style={{ 
              width: 200, 
              height: 200, 
              borderRadius: 100, 
              backgroundColor: '#f3f4f6', 
              justifyContent: 'center', 
              alignItems: 'center',
              marginBottom: 16,
              borderWidth: 4,
              borderColor: currentPhase === 'inhale' ? '#10b981' : 
                          currentPhase === 'hold' ? '#f59e0b' : 
                          currentPhase === 'exhale' ? '#3b82f6' : 
                          currentPhase === 'pause' ? '#8b5cf6' : '#e5e7eb',
              shadowColor: currentPhase === 'inhale' ? '#10b981' : 
                          currentPhase === 'hold' ? '#f59e0b' : 
                          currentPhase === 'exhale' ? '#3b82f6' : 
                          currentPhase === 'pause' ? '#8b5cf6' : '#e5e7eb',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8
            }}>
              <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#1f2937' }}>
                {timeLeft}
              </Text>
              <Text style={{ fontSize: 16, color: '#6b7280', textTransform: 'capitalize', marginTop: 4 }}>
                {currentPhase === 'ready' ? 'Ready' : 
                 currentPhase === 'completed' ? 'Complete!' : currentPhase}
              </Text>
            </View>

            {/* Cycle Progress Visualization */}
            {currentPhase !== 'ready' && (
              <View style={{ width: '100%', marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', textAlign: 'center', marginBottom: 8 }}>
                  Cycle {currentCycle} of {exerciseData.cycles}
                </Text>
                
                {/* Phase Sequence Indicator */}
                {isTimerRunning && currentPhase !== 'completed' && (
                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
                    {['inhale', 'hold', 'exhale', 'pause'].map((phase, index) => (
                      <View key={phase} style={{ alignItems: 'center', marginHorizontal: 8, opacity: exerciseData[phase] === 0 ? 0.3 : 1 }}>
                        <View style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: phase === currentPhase ? 
                            (phase === 'inhale' ? '#10b981' : 
                             phase === 'hold' ? '#f59e0b' : 
                             phase === 'exhale' ? '#3b82f6' : '#8b5cf6') :
                            '#e5e7eb',
                          marginBottom: 4
                        }} />
                        <Text style={{ 
                          fontSize: 10, 
                          color: phase === currentPhase ? '#374151' : '#9ca3af',
                          textTransform: 'capitalize',
                          fontWeight: phase === currentPhase ? '600' : '400'
                        }}>
                          {phase}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {/* Cycle Dots - Exactly 3 cycles as per image */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
                  {Array.from({ length: 3 }, (_, index) => (
                    <View
                      key={index}
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: index < currentCycle - 1 ? '#10b981' : 
                                       index === currentCycle - 1 ? (isTimerRunning ? '#3b82f6' : '#10b981') : '#e5e7eb',
                        marginHorizontal: 4,
                        borderWidth: 2,
                        borderColor: index === currentCycle - 1 && isTimerRunning ? '#1d4ed8' : 'transparent'
                      }}
                    />
                  ))}
                </View>

                {/* Overall Progress Bar */}
                {currentPhase !== 'ready' && currentPhase !== 'completed' && (
                  <View style={{ width: '100%', marginBottom: 8 }}>
                    <View style={{ 
                      height: 8, 
                      backgroundColor: '#e5e7eb', 
                      borderRadius: 4,
                      overflow: 'hidden'
                    }}>
                      <View style={{ 
                        height: '100%', 
                        width: `${calculateOverallProgress()}%`,
                        backgroundColor: '#10b981',
                        borderRadius: 4,
                        transition: 'width 0.3s ease'
                      }} />
                    </View>
                    <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 4 }}>
                      {Math.round(calculateOverallProgress())}% complete
                    </Text>
                  </View>
                )}

                {/* Phase Progress Bar */}
                {isTimerRunning && currentPhase !== 'completed' && (
                  <View style={{ width: '100%', marginBottom: 8 }}>
                    <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginBottom: 4 }}>
                      Current Phase: {Math.round(phaseProgress)}% complete
                    </Text>
                    <View style={{ 
                      height: 4, 
                      backgroundColor: '#f3f4f6', 
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}>
                      <View style={{ 
                        height: '100%', 
                        width: `${phaseProgress}%`,
                        backgroundColor: currentPhase === 'inhale' ? '#10b981' : 
                                       currentPhase === 'hold' ? '#f59e0b' : 
                                       currentPhase === 'exhale' ? '#3b82f6' : '#8b5cf6',
                        borderRadius: 2
                      }} />
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Phase Breakdown */}
            {currentPhase === 'completed' && completedPhases.length > 0 && (
              <View style={{ width: '100%', marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, textAlign: 'center' }}>
                  Exercise Summary
                </Text>
                <View style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
                  <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
                    Completed {completedPhases.length} phases across {exerciseData.cycles} cycles
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 4 }}>
                    Total Duration: {Math.floor(totalTimeElapsed / 60)}:{(totalTimeElapsed % 60).toString().padStart(2, '0')}
                  </Text>
                </View>
              </View>
            )}

            {/* Control Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {!isTimerRunning && currentPhase === 'ready' && (
                <TouchableOpacity style={[btn.primary, { backgroundColor: '#10b981' }]} onPress={startTimer}>
                  <Text style={btn.text}>Start Exercise</Text>
                </TouchableOpacity>
              )}
              
              {isTimerRunning && (
                <TouchableOpacity style={[btn.secondary, { backgroundColor: '#ef4444' }]} onPress={stopTimer}>
                  <Text style={[btn.text, { color: 'white' }]}>Stop</Text>
                </TouchableOpacity>
              )}
              
              {currentPhase === 'completed' && (
                <TouchableOpacity style={[btn.primary, { backgroundColor: '#8b5cf6' }]} onPress={startTimer}>
                  <Text style={btn.text}>Start Again</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Section>

        <Section title="❤️ Heart Rate Before Exercise">
          <Text style={{ fontSize: 16, marginBottom: 8, color: '#374151' }}>
            Enter your heart rate before starting the exercise:
          </Text>
          <TextInput
            style={inputStyle}
            placeholder="Enter heart rate (bpm)"
            value={hrBefore}
            onChangeText={setHrBefore}
            keyboardType="numeric"
            maxLength={3}
            editable={!exerciseCompleted}
          />
          <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            Current: {hrBefore ? `${hrBefore} bpm` : 'Not entered'}
          </Text>
          
          {!exerciseCompleted && (
            <TouchableOpacity style={btn.primary} onPress={completeExercise}>
              <Text style={btn.text}>Start Exercise</Text>
            </TouchableOpacity>
          )}
        </Section>

        {exerciseCompleted && (
          <Section title="❤️ Heart Rate After Exercise">
            <Text style={{ fontSize: 16, marginBottom: 8, color: '#374151' }}>
              Enter your heart rate after completing the exercise:
            </Text>
            <TextInput
              style={inputStyle}
              placeholder="Enter heart rate (bpm)"
              value={hrAfter}
              onChangeText={setHrAfter}
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
              Current: {hrAfter ? `${hrAfter} bpm` : 'Not entered'}
            </Text>
            
            {hrBefore && hrAfter && (
              <View style={{ marginTop: 12, padding: 12, backgroundColor: '#f0f9ff', borderRadius: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e40af', textAlign: 'center' }}>
                  Heart Rate Difference: {parseInt(hrAfter) - parseInt(hrBefore) > 0 ? '+' : ''}{parseInt(hrAfter) - parseInt(hrBefore)} bpm
                </Text>
              </View>
            )}
          </Section>
        )}

        {exerciseCompleted && (
          <TouchableOpacity style={[btn.primary, { backgroundColor: '#0d9488' }]} onPress={showCompleteSessionConfirmation}>
            <Text style={btn.text}>Complete Session</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Exercise Completion Modal */}
      <Modal
        visible={showCompletionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeCompletionModal}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10
          }}>
            {/* Success Icon */}
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#10b981',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <Text style={{ fontSize: 40, color: 'white' }}>✓</Text>
            </View>

            {/* Title */}
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#1f2937',
              textAlign: 'center',
              marginBottom: 12
            }}>
              Exercise Completed! 🎉
            </Text>

            {/* Subtitle */}
            <Text style={{
              fontSize: 16,
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: 24
            }}>
              Great job completing your {club?.name || 'Golf Club'} breathing exercise!
            </Text>

            {/* Exercise Summary */}
            <View style={{
              backgroundColor: '#f8fafc',
              borderRadius: 12,
              padding: 16,
              width: '100%',
              marginBottom: 24
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#374151',
                textAlign: 'center',
                marginBottom: 12
              }}>
                Exercise Summary
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>Total Duration:</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                  {Math.floor(totalTimeElapsed / 60)}:{(totalTimeElapsed % 60).toString().padStart(2, '0')}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>Cycles Completed:</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                  {exerciseData.cycles} of {exerciseData.cycles}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>Phases Completed:</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                  {completedPhases.length}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>Club Used:</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                  {club?.name || 'Golf Club'}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
                onPress={closeCompletionModal}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Close
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#10b981',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
                onPress={restartExercise}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: 'white'
                }}>
                  Start Again
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Video Modal */}
      <Modal
        visible={showVideoModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeVideoModal}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            width: '100%',
            maxWidth: 400,
            maxHeight: '80%',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#e5e7eb'
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#1f2937',
                flex: 1
              }}>
                {selectedVideo?.title || 'Tutorial Video'}
              </Text>
              <TouchableOpacity
                onPress={closeVideoModal}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#f3f4f6',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Text style={{ fontSize: 18, color: '#6b7280' }}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Video Player */}
            {selectedVideo && (
              <VideoPlayer
                videoUrl={selectedVideo.videoUrl}
                fallbackVideoUrl={selectedVideo.fallbackVideoUrl}
                style={{ height: 250 }}
                showControls={true}
                autoPlay={false}
              />
            )}

            {/* Video Info */}
            {selectedVideo && (
              <View style={{ padding: 16 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: 8
                }}>
                  {selectedVideo.title || 'Tutorial Video'}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#6b7280',
                  marginBottom: 8
                }}>
                  {selectedVideo.description || 'Learn proper technique and breathing for this golf club.'}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                    Duration: {selectedVideo.duration || 'N/A'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                    Difficulty: {selectedVideo.difficulty || 'Beginner'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeConfirmationModal}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10
          }}>
            {/* Icon */}
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#fef3c7',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <Text style={{ fontSize: 40 }}>⚠️</Text>
            </View>

            {/* Title */}
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#1f2937',
              textAlign: 'center',
              marginBottom: 12
            }}>
              Complete Session?
            </Text>

            {/* Message */}
            <Text style={{
              fontSize: 16,
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: 24,
              lineHeight: 24
            }}>
              Are you sure you want to complete this practice session? This will save your heart rate data and end the current session.
            </Text>

            {/* Session Summary */}
            <View style={{
              backgroundColor: '#f8fafc',
              borderRadius: 12,
              padding: 16,
              width: '100%',
              marginBottom: 24,
              borderWidth: 1,
              borderColor: '#e2e8f0'
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#374151',
                textAlign: 'center',
                marginBottom: 12
              }}>
                Session Summary
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>Club:</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                  {club?.name || 'Golf Club'}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>Heart Rate Before:</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                  {hrBefore} bpm
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>Heart Rate After:</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                  {hrAfter} bpm
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
                onPress={closeConfirmationModal}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#0d9488',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
                onPress={saveSessionAndContinue}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: 'white'
                }}>
                  Complete Session
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const btn = {
  primary: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  secondary: { backgroundColor: '#f1f5f9', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  text: { color: 'white', fontWeight: '700' },
  secondaryText: { color: '#475569', fontWeight: '600' },
};

const inputStyle = {
  borderWidth: 1,
  borderColor: '#d1d5db',
  borderRadius: 8,
  padding: 12,
  fontSize: 16,
  backgroundColor: 'white',
  marginBottom: 8,
};
