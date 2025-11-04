// screens/HomeScreen.js
import { onAuthStateChanged } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, SafeAreaView, ScrollView, Text } from 'react-native';
import { auth, db } from '../../config/firebase';
import { CLUBS } from './constants';
import { ClubCard, MoodSelector, Section } from './ui';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [mood, setMood] = useState(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const saveMoodCheckIn = async (m) => {
    console.log('Saving mood check-in:', m);
    setMood(m);
    if (!auth.currentUser) {
      console.log('No authenticated user');
      return;
    }
    const ref = doc(db, `users/${auth.currentUser.uid}/moodChecks/${Date.now()}`);
    const data = { moodKey: m, ts: serverTimestamp() };
    console.log('Saving to Firebase:', data);
    await setDoc(ref, data);
    console.log('Mood check-in saved successfully');
    Alert.alert('Saved', 'Mood check-in recorded!');
  };

  const startSession = async (club) => {
  if (!auth.currentUser) return;
  const sessionId = `${Date.now()}`;
  await setDoc(doc(db, `users/${auth.currentUser.uid}/sessions/${sessionId}`), {
    sessionId,
    startedAt: serverTimestamp(),
    clubId: club.id,
    clubName: club.name,
    moodBefore: mood || null,
    hrBefore: null,
    hrAfter: null,
    rating: null,
    moodAfter: null,
  });
  // ✅ Pass uid along
  // inside startSession
navigation.navigate("PracticeFlow", {
  screen: "Practice",
  params: { sessionId, club, uid: auth.currentUser.uid },
});

};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', marginBottom: 8 }}>
  👋 Welcome{user ? `, ${user.displayName || user.email}` : ''}!
</Text>

        <Section title="What's your mood today?">
          <MoodSelector value={mood} onChange={saveMoodCheckIn} />
        </Section>

        <Section title="Pick your club for today">
          <FlatList
            data={CLUBS}
            keyExtractor={(i) => i.id}
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }) => <ClubCard item={item} onPress={startSession} />}
          />
        </Section>

      </ScrollView>
    </SafeAreaView>
  );
}
