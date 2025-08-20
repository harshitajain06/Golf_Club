// components/ui.js
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MOODS } from './constants';

export const Section = ({ title, children, style }) => (
  <View style={[styles.section, style]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={{ marginTop: 8 }}>{children}</View>
  </View>
);

export const MoodSelector = ({ value, onChange }) => (
  <View style={styles.moodRow}>
    {MOODS.map(m => (
      <TouchableOpacity key={m.key} style={[styles.moodBtn, value === m.key && styles.moodBtnActive]} onPress={() => onChange(m.key)}>
        <Text style={styles.moodEmoji}>{m.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

export const ClubCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.clubCard} onPress={() => onPress(item)}>
    <MaterialCommunityIcons name="golf" size={24} />
    <Text style={styles.clubName}>🏌️ {item.name}</Text>
    <Text style={styles.clubDesc}>{item.desc}</Text>
  </TouchableOpacity>
);

export const RatingStars = ({ value, onChange }) => (
  <View style={{ flexDirection: 'row' }}>
    {[1,2,3,4,5].map(n => (
      <TouchableOpacity key={n} onPress={() => onChange(n)}>
        <Ionicons name={n <= value ? 'star' : 'star-outline'} size={28} style={{ marginHorizontal: 2 }} />
      </TouchableOpacity>
    ))}
  </View>
);

export const BreathingBubble = ({ running }) => {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!running) { scale.stopAnimation(); scale.setValue(1); return; }
    let active = true;
    const loop = () => {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.4, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]).start(() => active && loop());
    };
    loop();
    return () => { active = false; scale.stopAnimation(); };
  }, [running]);
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[styles.breatheCircle, { transform: [{ scale }] }]} />
      <Text style={{ marginTop: 12, fontSize: 16 }}>{running ? 'Breathe… In / Hold / Out' : 'Tap start to begin'}</Text>
    </View>
  );
};

// Simple HR mock generator: emits 68–105 bpm via onSample callback every second
export const HeartRateMock = ({ running, onSample }) => {
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const bpm = Math.round(68 + Math.random() * 37);
      onSample?.(bpm);
    }, 1000);
    return () => clearInterval(t);
  }, [running]);
  return null;
};

const styles = StyleSheet.create({
  section: { backgroundColor: 'white', borderRadius: 16, padding: 12, marginVertical: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: { backgroundColor: '#e2e8f0', padding: 10, borderRadius: 12, flex: 1, alignItems: 'center', marginHorizontal: 4 },
  moodBtnActive: { backgroundColor: '#c7d2fe' },
  moodEmoji: { fontSize: 24 },
  clubCard: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 16, minHeight: 110, justifyContent: 'center', alignItems: 'flex-start', gap: 6 },
  clubName: { fontSize: 16, fontWeight: '700' },
  clubDesc: { fontSize: 13, color: '#475569' },
  breatheCircle: { width: 140, height: 140, borderRadius: 999, backgroundColor: '#bfdbfe' },
});
