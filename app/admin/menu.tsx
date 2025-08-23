import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useApp, Product } from '../../context/AppContext';
import { formatEuro } from '../../utils/schedule';

const COLORS = {
  bg: '#fcfaf8',
  text: '#1b130d',
  muted: '#9a6c4c',
  primary: '#ee7c2b',
  border: '#f3ece7',
};

type Draft = { title: string; price: string; category: string; desc?: string };

export default function AdminMenu() {
  const { products, addProduct, updateProduct, removeProduct } = useApp();
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState<Draft>({ title: '', price: '', category: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>({ title: '', price: '', category: '', desc: '' });

  const list = useMemo(() => {
    const sorted = [...products].sort((a, b) => (a.category || '').localeCompare(b.category || '') || a.title.localeCompare(b.title));
    return sorted.filter((p) => (p.title + ' ' + (p.desc || '') + ' ' + (p.category || '')).toLowerCase().includes(q.toLowerCase()));
  }, [products, q]);

  const submit = () => {
    if (!draft.title || !draft.price) return;
    const price = parseFloat(draft.price);
    if (isNaN(price)) return;
    addProduct({ title: draft.title, price, category: draft.category || 'Autres', desc: draft.desc });
    setDraft({ title: '', price: '', category: '', desc: '' });
  };

  const startEdit = (p: Product) => {
    setEditing(p.id);
    setEditDraft({ title: p.title, price: String(p.price), category: p.category || '', desc: p.desc });
  };

  const saveEdit = () => {
    if (!editing) return;
    const price = parseFloat(editDraft.price);
    if (isNaN(price)) return;
    updateProduct(editing, { title: editDraft.title, price, category: editDraft.category || 'Autres', desc: editDraft.desc });
    setEditing(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Menu & Burgers</Text>

      <View style={styles.card}>
        <Text style={styles.section}>Ajouter un produit</Text>
        <View style={styles.formRow}>
          <TextInput placeholder="Titre" placeholderTextColor={COLORS.muted} value={draft.title} onChangeText={(v) => setDraft((d) => ({ ...d, title: v }))} style={styles.input} />
          <TextInput placeholder="Prix" keyboardType="decimal-pad" placeholderTextColor={COLORS.muted} value={draft.price} onChangeText={(v) => setDraft((d) => ({ ...d, price: v }))} style={[styles.input, { width: 120 }]} />
          <TextInput placeholder="Catégorie" placeholderTextColor={COLORS.muted} value={draft.category} onChangeText={(v) => setDraft((d) => ({ ...d, category: v }))} style={[styles.input, { width: 160 }]} />
        </View>
        <TextInput placeholder="Description (optionnel)" placeholderTextColor={COLORS.muted} value={draft.desc} onChangeText={(v) => setDraft((d) => ({ ...d, desc: v }))} style={[styles.input, { marginTop: 8 }]} />
        <Pressable style={[styles.primaryBtn, { alignSelf: 'flex-start', marginTop: 10 }]} onPress={submit}><Text style={styles.btnText}>Ajouter</Text></Pressable>
      </View>

      <View style={styles.toolbar}>
        <TextInput placeholder="Rechercher..." placeholderTextColor={COLORS.muted} value={q} onChangeText={setQ} style={[styles.input, { flex: 1 }]} />
      </View>

      {list.map((p) => (
        <View key={p.id} style={styles.card}>
          {editing === p.id ? (
            <>
              <View style={styles.formRow}>
                <TextInput value={editDraft.title} onChangeText={(v) => setEditDraft((d) => ({ ...d, title: v }))} style={styles.input} />
                <TextInput value={editDraft.price} onChangeText={(v) => setEditDraft((d) => ({ ...d, price: v }))} style={[styles.input, { width: 120 }]} />
                <TextInput value={editDraft.category} onChangeText={(v) => setEditDraft((d) => ({ ...d, category: v }))} style={[styles.input, { width: 160 }]} />
              </View>
              <TextInput value={editDraft.desc} onChangeText={(v) => setEditDraft((d) => ({ ...d, desc: v }))} style={[styles.input, { marginTop: 8 }]} />
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <Pressable style={styles.primaryBtn} onPress={saveEdit}><Text style={styles.btnText}>Enregistrer</Text></Pressable>
                <Pressable style={[styles.secondaryBtn, { marginLeft: 8 }]} onPress={() => setEditing(null)}><Text style={styles.secondaryText}>Annuler</Text></Pressable>
              </View>
            </>
          ) : (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{p.title} <Text style={styles.muted}>· {p.category || 'Autres'}</Text></Text>
                {!!p.desc && <Text style={styles.desc}>{p.desc}</Text>}
              </View>
              <Text style={styles.price}>{formatEuro(p.price)}</Text>
              <View style={{ flexDirection: 'row', marginLeft: 12 }}>
                <Pressable style={styles.secondaryBtn} onPress={() => startEdit(p)}><Text style={styles.secondaryText}>Modifier</Text></Pressable>
                <Pressable style={[styles.secondaryBtn, { marginLeft: 8, borderColor: '#b00020' }]} onPress={() => removeProduct(p.id)}><Text style={[styles.secondaryText, { color: '#b00020' }]}>Supprimer</Text></Pressable>
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
  price: { color: COLORS.text, fontWeight: '800' },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
  btnText: { color: COLORS.bg, fontWeight: '800' },
  secondaryBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
  secondaryText: { color: COLORS.text, fontWeight: '800' },
  muted: { color: COLORS.muted },
});
