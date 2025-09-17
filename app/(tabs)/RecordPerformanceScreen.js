// screens/RecordPerformanceScreen.js
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity } from 'react-native';
import { db } from '../../config/firebase';
import { MoodSelector, RatingStars, Section } from './ui';

export default function RecordPerformanceScreen({ route, navigation }) {
  const { sessionId, club, uid } = route.params || {};
  const [rating, setRating] = useState(3);
  const [moodAfter, setMoodAfter] = useState(null);

  const saveSession = async () => {
    if (!sessionId) return;
    
    try {
      // Update the session document with rating and mood
      await updateDoc(doc(db, `users/${uid}/sessions/${sessionId}`), {
        rating,
        moodAfter,
        completedAt: serverTimestamp(),
      });
      
      navigation.navigate('Stats');
    } catch (error) {
      console.error('Error saving session:', error);
      Alert.alert('Error', 'Failed to save session. Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 8 }}>📝 How did the session go?</Text>

        <Section title={`Club: ${club?.name}`}>
          <Text>Rate your performance:</Text>
          <RatingStars value={rating} onChange={setRating} />
        </Section>

        <Section title="Post-session mood">
          <MoodSelector value={moodAfter} onChange={setMoodAfter} />
        </Section>



        <TouchableOpacity style={[btn.primary, { backgroundColor: '#0d9488' }]} onPress={saveSession}>
          <Text style={btn.text}>Save Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const btn = {
  primary: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  text: { color: 'white', fontWeight: '700' },
};
