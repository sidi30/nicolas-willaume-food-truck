import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { AdminUser, loadUsers, saveUsers, genId } from '../../utils/adminStore';

const COLORS = {
  bg: '#fcfaf8',
  text: '#1b130d',
  muted: '#9a6c4c',
  primary: '#ee7c2b',
  border: '#f3ece7',
};

type Draft = { name: string; phone?: string; email?: string; role: 'admin' | 'staff' };

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState<Draft>({ name: '', role: 'staff', phone: '', email: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>({ name: '', role: 'staff', phone: '', email: '' });

  useEffect(() => {
    setUsers(loadUsers());
  }, []);

  const persist = (next: AdminUser[]) => {
    setUsers(next);
    saveUsers(next);
  };

  const list = useMemo(() => {
    return users
      .filter((u) => (u.name + ' ' + (u.email || '') + ' ' + (u.phone || '')).toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, q]);

  const add = () => {
    if (!draft.name.trim()) return;
    const u: AdminUser = { id: genId('U'), name: draft.name.trim(), phone: draft.phone?.trim() || undefined, email: draft.email?.trim() || undefined, role: draft.role };
    persist([u, ...users]);
    setDraft({ name: '', role: 'staff', phone: '', email: '' });
  };

  const startEdit = (u: AdminUser) => {
    setEditing(u.id);
    setEditDraft({ name: u.name, role: u.role || 'staff', phone: u.phone || '', email: u.email || '' });
  };

  const save = () => {
    if (!editing) return;
    const next = users.map((u) => (u.id === editing ? { ...u, name: editDraft.name, phone: editDraft.phone || undefined, email: editDraft.email || undefined, role: editDraft.role } : u));
    persist(next);
    setEditing(null);
  };

  const remove = (id: string) => {
    persist(users.filter((u) => u.id !== id));
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Utilisateurs</Text>

      <View style={styles.card}>
        <Text style={styles.section}>Ajouter un utilisateur</Text>
        <View style={styles.formRow}>
          <TextInput placeholder="Nom" placeholderTextColor={COLORS.muted} value={draft.name} onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))} style={[styles.input, { flex: 1 }]} />
          <TextInput placeholder="Téléphone" placeholderTextColor={COLORS.muted} value={draft.phone} onChangeText={(v) => setDraft((d) => ({ ...d, phone: v }))} style={[styles.input, { width: 160 }]} />
          <TextInput placeholder="Email" placeholderTextColor={COLORS.muted} value={draft.email} onChangeText={(v) => setDraft((d) => ({ ...d, email: v }))} style={[styles.input, { width: 200 }]} />
          <TextInput placeholder="Rôle (admin/staff)" placeholderTextColor={COLORS.muted} value={draft.role} onChangeText={(v) => setDraft((d) => ({ ...d, role: v === 'admin' ? 'admin' : 'staff' }))} style={[styles.input, { width: 140 }]} />
        </View>
        <Pressable onPress={add} style={[styles.primaryBtn, { alignSelf: 'flex-start', marginTop: 10 }]}>
          <Text style={styles.btnText}>Ajouter</Text>
        </Pressable>
      </View>

      <View style={styles.toolbar}>
        <TextInput placeholder="Rechercher..." placeholderTextColor={COLORS.muted} value={q} onChangeText={setQ} style={[styles.input, { flex: 1 }]} />
      </View>

      {list.map((u) => (
        <View key={u.id} style={styles.card}>
          {editing === u.id ? (
            <>
              <View style={styles.formRow}>
                <TextInput value={editDraft.name} onChangeText={(v) => setEditDraft((d) => ({ ...d, name: v }))} style={[styles.input, { flex: 1 }]} />
                <TextInput value={editDraft.phone} onChangeText={(v) => setEditDraft((d) => ({ ...d, phone: v }))} style={[styles.input, { width: 160 }]} />
                <TextInput value={editDraft.email} onChangeText={(v) => setEditDraft((d) => ({ ...d, email: v }))} style={[styles.input, { width: 200 }]} />
                <TextInput value={editDraft.role} onChangeText={(v) => setEditDraft((d) => ({ ...d, role: v === 'admin' ? 'admin' : 'staff' }))} style={[styles.input, { width: 140 }]} />
              </View>
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <Pressable style={styles.primaryBtn} onPress={save}><Text style={styles.btnText}>Enregistrer</Text></Pressable>
                <Pressable style={[styles.secondaryBtn, { marginLeft: 8 }]} onPress={() => setEditing(null)}><Text style={styles.secondaryText}>Annuler</Text></Pressable>
              </View>
            </>
          ) : (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{u.name} <Text style={styles.muted}>· {u.role || 'staff'}</Text></Text>
                <Text style={styles.desc}>{u.phone || '—'} · {u.email || '—'}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginLeft: 12 }}>
                <Pressable style={styles.secondaryBtn} onPress={() => startEdit(u)}><Text style={styles.secondaryText}>Modifier</Text></Pressable>
                <Pressable style={[styles.secondaryBtn, { marginLeft: 8, borderColor: '#b00020' }]} onPress={() => remove(u.id)}><Text style={[styles.secondaryText, { color: '#b00020' }]}>Supprimer</Text></Pressable>
              </View>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '800' },
  section: { color: COLORS.text, fontWeight: '800', marginBottom: 8 },
  card: { backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, padding: 12, marginTop: 12 },
  formRow: { flexDirection: 'row' },
  input: { backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, color: COLORS.text, marginRight: 8 },
  toolbar: { marginTop: 12, marginBottom: 4, flexDirection: 'row' },
  row: { flexDirection: 'row', alignItems: 'center' },
  itemTitle: { color: COLORS.text, fontWeight: '800' },
  desc: { color: COLORS.muted, marginTop: 4 },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
  btnText: { color: COLORS.bg, fontWeight: '800' },
  secondaryBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
  secondaryText: { color: COLORS.text, fontWeight: '800' },
  muted: { color: COLORS.muted },
});
