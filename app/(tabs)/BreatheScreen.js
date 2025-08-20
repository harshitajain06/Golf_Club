// screens/BreatheScreen.js (standalone breathing, optional quick log)
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Section, BreathingBubble, HeartRateMock } from './ui';
import { auth, db } from '../../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function BreatheScreen() {
  const [running, setRunning] = useState(false);
  const [hr, setHr] = useState(null);

  const quickLog = async () => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const id = `${Date.now()}`;
    await setDoc(doc(db, `users/${uid}/sessions/${id}`), {
      sessionId: id,
      startedAt: serverTimestamp(),
      completedAt: serverTimestamp(),
      type: 'breathing',
      clubId: null,
      clubName: null,
      hrBefore: hr ?? null,
      hrAfter: hr ?? null,
      rating: null,
      moodBefore: null,
      moodAfter: null,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '800' }}>🌬️ Breathing Exercise</Text>
        <Section title="Live">
          <BreathingBubble running={running} />
          <HeartRateMock running={running} onSample={setHr} />
          <Text style={{ textAlign: 'center', marginTop: 12 }}>❤️ Live HR: {hr ? `${hr} bpm` : '—'}</Text>
          <TouchableOpacity style={btn.primary} onPress={() => setRunning(!running)}>
            <Text style={btn.text}>{running ? 'Stop' : 'Start'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[btn.primary, { backgroundColor: '#0d9488' }]} onPress={quickLog}>
            <Text style={btn.text}>Quick Log</Text>
          </TouchableOpacity>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const btn = {
  primary: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  text: { color: 'white', fontWeight: '700' },
};
