// screens/RecordPerformanceScreen.js
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Section, RatingStars, MoodSelector, BreathingBubble, HeartRateMock } from './ui';
import { db } from '../../config/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function RecordPerformanceScreen({ route, navigation }) {
  const { sessionId, club, uid } = route.params || {};
  const [rating, setRating] = useState(3);
  const [moodAfter, setMoodAfter] = useState(null);
  const [recording, setRecording] = useState(false);
  const [hrAfter, setHrAfter] = useState(null);

  const saveSession = async () => {
    if (!sessionId) return;
    await updateDoc(doc(db, `users/${uid}/sessions/${sessionId}`), {
      rating,
      moodAfter,
      hrAfter: hrAfter ?? null,
      completedAt: serverTimestamp(),
    });
    navigation.navigate('Stats');
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

        <Section title="❤️ Heart Rate (after)">
          <Text>Tap start and wait a few seconds to capture average.</Text>
          <BreathingBubble running={recording} />
          <HeartRateMock running={recording} onSample={setHrAfter} />
          <Text style={{ textAlign: 'center', marginTop: 12, fontSize: 16 }}>
            HR After: {hrAfter ? `${hrAfter} bpm` : '—'}
          </Text>
          <TouchableOpacity style={btn.primary} onPress={() => setRecording(!recording)}>
            <Text style={btn.text}>{recording ? 'Stop' : 'Start'}</Text>
          </TouchableOpacity>
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
