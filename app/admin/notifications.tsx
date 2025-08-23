import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { notify } from '../../utils/notifier';

const COLORS = {
  bg: '#fcfaf8',
  text: '#1b130d',
  muted: '#9a6c4c',
  primary: '#ee7c2b',
  border: '#f3ece7',
};

export default function AdminNotifications() {
  const [title, setTitle] = useState('Message test');
  const [body, setBody] = useState("Ceci est un test de notification web.");

  const send = () => {
    notify(title.trim() || 'Notification', body.trim() || undefined);
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Notifications</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Titre</Text>
        <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="Titre" placeholderTextColor={COLORS.muted} />
        <Text style={[styles.label, { marginTop: 10 }]}>Message (optionnel)</Text>
        <TextInput value={body} onChangeText={setBody} style={[styles.input, { height: 90 }]} placeholder="Message" placeholderTextColor={COLORS.muted} multiline />
        <Pressable onPress={send} style={[styles.primaryBtn, { alignSelf: 'flex-start', marginTop: 12 }]}>
          <Text style={styles.btnText}>Envoyer une notification</Text>
        </Pressable>
        <Text style={styles.hint}>Sur le web, le navigateur peut demander la permission d'afficher des notifications.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '800' },
  label: { color: COLORS.text, fontWeight: '800' },
  input: { backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, color: COLORS.text, marginTop: 6 },
  card: { backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, padding: 12, marginTop: 12 },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
  btnText: { color: COLORS.bg, fontWeight: '800' },
  hint: { color: COLORS.muted, marginTop: 8 },
});
