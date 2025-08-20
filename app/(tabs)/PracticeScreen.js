// screens/PracticeScreen.js
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Section, BreathingBubble, HeartRateMock } from './ui';
import { db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function PracticeScreen({ route, navigation }) {
  const { sessionId, club, uid } = route.params || {};
  const [running, setRunning] = useState(false);
  const [hrBefore, setHrBefore] = useState(null);
  const [currentHR, setCurrentHR] = useState(null);

  // Capture first stable HR as hrBefore when running
  useEffect(() => {
    if (running && !hrBefore && currentHR) setHrBefore(currentHR);
  }, [running, currentHR]);

  const saveHRAndContinue = async () => {
    if (!sessionId) return;
    try {
      await updateDoc(doc(db, `users/${uid}/sessions/${sessionId}`), {
        hrBefore: hrBefore ?? currentHR ?? null,
      });
    } catch {}
    navigation.navigate('RecordPerformance', { sessionId, club, uid });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 8 }}>🎯 Your Practice with the {club?.name}</Text>

        <Section title="📘 Tutorial">
          <Text>
            {club?.desc}. Visualize, align, and breathe: inhale 4s, hold 4s, exhale 6s.
            Repeat 5 cycles, maintain relaxed grip pressure.
          </Text>
        </Section>

        <Section title="🌬️ Breathing + Live HR (before)">
          <BreathingBubble running={running} />
          <HeartRateMock running={running} onSample={setCurrentHR} />
          <Text style={{ textAlign: 'center', marginTop: 12, fontSize: 16 }}>
            ❤️ Live HR: {currentHR ? `${currentHR} bpm` : '—'}
          </Text>
          <TouchableOpacity style={btn.primary} onPress={() => setRunning(!running)}>
            <Text style={btn.text}>{running ? 'Stop' : 'Start'}</Text>
          </TouchableOpacity>
        </Section>

        <TouchableOpacity style={[btn.primary, { backgroundColor: '#0d9488' }]} onPress={saveHRAndContinue}>
          <Text style={btn.text}>Next: Record Performance</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const btn = {
  primary: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  text: { color: 'white', fontWeight: '700' },
};
