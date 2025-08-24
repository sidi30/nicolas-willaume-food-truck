import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Truck, loadTrucks, saveTrucks, genId } from '../../utils/adminStore';

const COLORS = {
  bg: '#fcfaf8',
  text: '#1b130d',
  muted: '#9a6c4c',
  primary: '#ee7c2b',
  border: '#f3ece7',
};

type Draft = { name: string; city?: string; note?: string; active: boolean; lat?: string; lng?: string };

export default function AdminTrucks() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState<Draft>({ name: '', city: '', note: '', active: true, lat: '', lng: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>({ name: '', city: '', note: '', active: true, lat: '', lng: '' });

  useEffect(() => {
    setTrucks(loadTrucks());
  }, []);

  const persist = (next: Truck[]) => {
    setTrucks(next);
    saveTrucks(next);
  };

  const list = useMemo(() => {
    return trucks
      .filter((t) => (t.name + ' ' + (t.city || '') + ' ' + (t.note || '')).toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [trucks, q]);

  const add = () => {
    if (!draft.name.trim()) return;
    const latNum = draft.lat && draft.lat.trim() !== '' ? parseFloat(draft.lat) : undefined;
    const lngNum = draft.lng && draft.lng.trim() !== '' ? parseFloat(draft.lng) : undefined;
    const t: Truck = {
      id: genId('T'),
      name: draft.name.trim(),
      city: draft.city?.trim() || undefined,
      note: draft.note?.trim() || undefined,
      active: draft.active,
      lat: Number.isFinite(latNum as number) ? latNum : undefined,
      lng: Number.isFinite(lngNum as number) ? lngNum : undefined,
    };
    persist([t, ...trucks]);
    setDraft({ name: '', city: '', note: '', active: true, lat: '', lng: '' });
  };

  const startEdit = (t: Truck) => {
    setEditing(t.id);
    setEditDraft({ name: t.name, city: t.city || '', note: t.note || '', active: !!t.active, lat: t.lat?.toString() || '', lng: t.lng?.toString() || '' });
  };

  const save = () => {
    if (!editing) return;
    const latNum = editDraft.lat && editDraft.lat.trim() !== '' ? parseFloat(editDraft.lat) : undefined;
    const lngNum = editDraft.lng && editDraft.lng.trim() !== '' ? parseFloat(editDraft.lng) : undefined;
    const next = trucks.map((t) => (
      t.id === editing
        ? {
            ...t,
            name: editDraft.name,
            city: editDraft.city || undefined,
            note: editDraft.note || undefined,
            active: editDraft.active,
            lat: Number.isFinite(latNum as number) ? latNum : undefined,
            lng: Number.isFinite(lngNum as number) ? lngNum : undefined,
          }
        : t
    ));
    persist(next);
    setEditing(null);
  };

  const remove = (id: string) => {
    persist(trucks.filter((t) => t.id !== id));
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Food Trucks</Text>

      <View style={styles.card}>
        <Text style={styles.section}>Ajouter un food truck</Text>
        <View style={styles.formRow}>
          <TextInput placeholder="Nom" placeholderTextColor={COLORS.muted} value={draft.name} onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))} style={[styles.input, { flex: 1 }]} />
          <TextInput placeholder="Ville" placeholderTextColor={COLORS.muted} value={draft.city} onChangeText={(v) => setDraft((d) => ({ ...d, city: v }))} style={[styles.input, { width: 140 }]} />
          <TextInput placeholder="Lat" placeholderTextColor={COLORS.muted} keyboardType="numeric" value={draft.lat} onChangeText={(v) => setDraft((d) => ({ ...d, lat: v }))} style={[styles.input, { width: 110 }]} />
          <TextInput placeholder="Lng" placeholderTextColor={COLORS.muted} keyboardType="numeric" value={draft.lng} onChangeText={(v) => setDraft((d) => ({ ...d, lng: v }))} style={[styles.input, { width: 110 }]} />
          <Pressable style={[styles.secondaryBtn, draft.active && { borderColor: COLORS.primary }]} onPress={() => setDraft((d) => ({ ...d, active: !d.active }))}>
            <Text style={[styles.secondaryText, { color: draft.active ? COLORS.primary : COLORS.text }]}>{draft.active ? 'Actif' : 'Inactif'}</Text>
          </Pressable>
        </View>
        <TextInput placeholder="Note (optionnel)" placeholderTextColor={COLORS.muted} value={draft.note} onChangeText={(v) => setDraft((d) => ({ ...d, note: v }))} style={[styles.input, { marginTop: 8 }]} />
        <Pressable onPress={add} style={[styles.primaryBtn, { alignSelf: 'flex-start', marginTop: 10 }]}>
          <Text style={styles.btnText}>Ajouter</Text>
        </Pressable>
      </View>

      <View style={styles.toolbar}>
        <TextInput placeholder="Rechercher..." placeholderTextColor={COLORS.muted} value={q} onChangeText={setQ} style={[styles.input, { flex: 1 }]} />
      </View>

      {list.map((t) => (
        <View key={t.id} style={styles.card}>
          {editing === t.id ? (
            <>
              <View style={styles.formRow}>
                <TextInput value={editDraft.name} onChangeText={(v) => setEditDraft((d) => ({ ...d, name: v }))} style={[styles.input, { flex: 1 }]} />
                <TextInput value={editDraft.city} onChangeText={(v) => setEditDraft((d) => ({ ...d, city: v }))} style={[styles.input, { width: 140 }]} />
                <TextInput placeholder="Lat" keyboardType="numeric" value={editDraft.lat} onChangeText={(v) => setEditDraft((d) => ({ ...d, lat: v }))} style={[styles.input, { width: 110 }]} />
                <TextInput placeholder="Lng" keyboardType="numeric" value={editDraft.lng} onChangeText={(v) => setEditDraft((d) => ({ ...d, lng: v }))} style={[styles.input, { width: 110 }]} />
                <Pressable style={[styles.secondaryBtn, editDraft.active && { borderColor: COLORS.primary }]} onPress={() => setEditDraft((d) => ({ ...d, active: !d.active }))}>
                  <Text style={[styles.secondaryText, { color: editDraft.active ? COLORS.primary : COLORS.text }]}>{editDraft.active ? 'Actif' : 'Inactif'}</Text>
                </Pressable>
              </View>
              <TextInput value={editDraft.note} onChangeText={(v) => setEditDraft((d) => ({ ...d, note: v }))} style={[styles.input, { marginTop: 8 }]} />
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <Pressable style={styles.primaryBtn} onPress={save}><Text style={styles.btnText}>Enregistrer</Text></Pressable>
                <Pressable style={[styles.secondaryBtn, { marginLeft: 8 }]} onPress={() => setEditing(null)}><Text style={styles.secondaryText}>Annuler</Text></Pressable>
              </View>
            </>
          ) : (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{t.name} <Text style={styles.muted}>· {t.city || '—'}</Text></Text>
                {!!t.note && <Text style={styles.desc}>{t.note}</Text>}
              </View>
              <Text style={[styles.badge, t.active ? styles.badgeActive : styles.badgeInactive]}>{t.active ? 'Actif' : 'Inactif'}</Text>
              <View style={{ flexDirection: 'row', marginLeft: 12 }}>
                <Pressable style={styles.secondaryBtn} onPress={() => startEdit(t)}><Text style={styles.secondaryText}>Modifier</Text></Pressable>
                <Pressable style={[styles.secondaryBtn, { marginLeft: 8, borderColor: '#b00020' }]} onPress={() => remove(t.id)}><Text style={[styles.secondaryText, { color: '#b00020' }]}>Supprimer</Text></Pressable>
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
  badge: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 },
  badgeActive: { borderColor: COLORS.primary, color: COLORS.primary, fontWeight: '800' },
  badgeInactive: { borderColor: COLORS.muted, color: COLORS.muted, fontWeight: '800' },
});
