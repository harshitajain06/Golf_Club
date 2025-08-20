// screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { Section, MoodSelector, ClubCard } from './ui';
import { CLUBS } from './constants';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [mood, setMood] = useState(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const saveMoodCheckIn = async (m) => {
    setMood(m);
    if (!auth.currentUser) return;
    const ref = doc(db, `users/${auth.currentUser.uid}/moodChecks/${Date.now()}`);
    await setDoc(ref, { moodKey: m, ts: serverTimestamp() });
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
      hrBefore: null, // will be filled in during breathing
      hrAfter: null,
      rating: null,
      moodAfter: null,
    });
    navigation.navigate('Practice', { sessionId, club });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', marginBottom: 8 }}>👋 Welcome!</Text>

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

        {user && (
          <TouchableOpacity style={{ backgroundColor: '#ef4444', padding: 12, borderRadius: 12, marginTop: 8, alignItems: 'center' }} onPress={() => signOut(auth)}>
            <Text style={{ color: 'white', fontWeight: '700' }}>Logout</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
