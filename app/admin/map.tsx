import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useApp } from '../../context/AppContext';
import { loadTrucks, Truck } from '../../utils/adminStore';
import { getOpenHoursForCity, generateSlots, getStepMin, formatEuro } from '../../utils/schedule';

type RLMod = { MapContainer: any; TileLayer: any; Marker: any; Popup: any };

const COLORS = {
  bg: '#fcfaf8',
  text: '#1b130d',
  muted: '#9a6c4c',
  primary: '#ee7c2b',
  border: '#f3ece7',
};

type TruckStats = {
  inProgress: number; // En attente + Acceptée
  processed: number;  // Prête + Terminée
  revenue: number;    // total €
};

function isSameLocalDay(iso: string, base = new Date()) {
  const d = new Date(iso);
  return (
    d.getFullYear() === base.getFullYear() &&
    d.getMonth() === base.getMonth() &&
    d.getDate() === base.getDate()
  );
}

export default function AdminMap() {
  const { orders } = useApp();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [ready, setReady] = useState(false);
  const [rl, setRl] = useState<RLMod | null>(null);
  const [icons, setIcons] = useState<{ green: any; orange: any; grey: any; greenDiv: any; orangeDiv: any; greyDiv: any } | null>(null);

  useEffect(() => {
    setTrucks(loadTrucks());
    if (Platform.OS === 'web') {
      (async () => {
        const leaflet = await import('leaflet');
        const L: any = (leaflet as any).default ?? leaflet;
        // Fix default marker icons on web
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
        // Custom colored icons for status (PNG)
        const SHADOW = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png';
        const makeIcon = (color: 'green' | 'orange' | 'grey') => new L.Icon({
          iconRetinaUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
          iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
          shadowUrl: SHADOW,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
        // Emoji-based DivIcons (no external images)
        const makeDivIcon = (borderColor: string) => L.divIcon({
          className: '',
          html: `
            <div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:14px;background:#fff;border:3px solid ${borderColor};box-shadow:0 1px 4px rgba(0,0,0,0.3)">
              <span style="font-size:16px;line-height:1">🚚</span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -28],
        });
        setIcons({
          green: makeIcon('green'),
          orange: makeIcon('orange'),
          grey: makeIcon('grey'),
          greenDiv: makeDivIcon('#16a34a'),
          orangeDiv: makeDivIcon('#f59e0b'),
          greyDiv: makeDivIcon('#9ca3af'),
        });
        const mod = await import('react-leaflet');
        setRl({ MapContainer: mod.MapContainer, TileLayer: mod.TileLayer, Marker: mod.Marker, Popup: mod.Popup });
        setReady(true);
      })();
    }
  }, []);

  const trucksWithCoords = useMemo(
    () => trucks.filter(t => typeof t.lat === 'number' && typeof t.lng === 'number'),
    [trucks]
  );

  const center = useMemo<[number, number]>(() => {
    if (trucksWithCoords.length > 0) {
      const t0 = trucksWithCoords[0];
      return [t0.lat as number, t0.lng as number];
    }
    // Vaucluse fallback (Avignon)
    return [43.9493, 4.8055];
  }, [trucksWithCoords]);

  const todayStatsByCity: Record<string, TruckStats> = useMemo(() => {
    const acc: Record<string, TruckStats> = {};
    for (const o of orders) {
      if (!isSameLocalDay(o.date)) continue;
      const city = o.city || '—';
      if (!acc[city]) acc[city] = { inProgress: 0, processed: 0, revenue: 0 };
      if (o.status === 'En attente' || o.status === 'Acceptée') acc[city].inProgress += 1;
      if (o.status === 'Prête' || o.status === 'Terminée') acc[city].processed += 1;
      acc[city].revenue += o.total;
    }
    return acc;
  }, [orders]);

  const totals = useMemo(() => {
    return Object.values(todayStatsByCity).reduce(
      (s, v) => ({ inProgress: s.inProgress + v.inProgress, processed: s.processed + v.processed, revenue: s.revenue + v.revenue }),
      { inProgress: 0, processed: 0, revenue: 0 }
    );
  }, [todayStatsByCity]);

  const bestSellerByCity: Record<string, { title: string; qty: number } | null> = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    for (const o of orders) {
      if (!isSameLocalDay(o.date)) continue;
      const city = o.city || '—';
      if (!map[city]) map[city] = {};
      for (const it of o.items) {
        const title = it.product.title;
        map[city][title] = (map[city][title] || 0) + it.qty;
      }
    }
    const out: Record<string, { title: string; qty: number } | null> = {};
    for (const city of Object.keys(map)) {
      let top: { title: string; qty: number } | null = null;
      for (const [title, qty] of Object.entries(map[city])) {
        if (!top || qty > top.qty) top = { title, qty };
      }
      out[city] = top;
    }
    return out;
  }, [orders]);

  function openInfo(city?: string) {
    const hours = getOpenHoursForCity(city || null, new Date());
    const toMin = (hhmm: string) => {
      const [h, m] = hhmm.split(':').map(Number);
      return h * 60 + m;
    };
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    if (!hours) return { openNow: false, hours: null as any, nextSlot: null as string | null };
    const startMin = toMin(hours.start);
    const endMin = toMin(hours.end);
    const openNow = nowMin >= startMin && nowMin <= endMin;
    let nextSlot: string | null = null;
    const slots = generateSlots(new Date(), hours, getStepMin());
    for (const s of slots) {
      if (toMin(s) > nowMin) { nextSlot = s; break; }
    }
    return { openNow, hours, nextSlot };
  }

  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.fill, { alignItems: 'center', justifyContent: 'center' }]}> 
        <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700', textAlign: 'center', padding: 16 }}>
          La carte est disponible sur le web.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {ready && rl && (
          <rl.MapContainer center={center} zoom={12} scrollWheelZoom style={styles.map}>
            <rl.TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            {trucksWithCoords.map((t) => {
              const stats = todayStatsByCity[t.city || '—'] || { inProgress: 0, processed: 0, revenue: 0 };
              const oi = openInfo(t.city);
              // Prefer DivIcons pictos; fallback to PNG if needed
              const icon = icons ? (!t.active ? icons.greyDiv : (oi.openNow ? icons.greenDiv : icons.orangeDiv)) : undefined;
              return (
                <rl.Marker key={t.id} position={[t.lat as number, t.lng as number]} icon={icon}>
                  <rl.Popup>
                    <View style={{ minWidth: 220 }}>
                      <Text style={{ fontWeight: '800', marginBottom: 4, color: COLORS.text }}>{t.name}</Text>
                      <Text style={{ color: '#666', marginBottom: 6 }}>📍 {t.city || '—'} · {t.active ? 'Actif' : 'Inactif'}</Text>
                      {oi.hours ? (
                        <Text style={{ color: oi.openNow ? '#16a34a' : '#9a6c4c', marginBottom: 4 }}>
                          {oi.openNow ? '🟢 Ouvert' : '🔴 Fermé'} · 🕘 {oi.hours.start}–{oi.hours.end}
                        </Text>
                      ) : (
                        <Text style={{ color: '#9a6c4c', marginBottom: 4 }}>🔴 Fermé aujourd'hui</Text>
                      )}
                      {oi.nextSlot && (
                        <Text style={{ color: '#666', marginBottom: 6 }}>⏭ Prochain créneau: <Text style={{ fontWeight: '800', color: COLORS.text }}>{oi.nextSlot}</Text></Text>
                      )}
                      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                        <Text>📦 En cours: <Text style={{ fontWeight: '800' }}>{stats.inProgress}</Text></Text>
                        <Text style={{ marginLeft: 8 }}>✅ Traitées: <Text style={{ fontWeight: '800' }}>{stats.processed}</Text></Text>
                      </View>
                      <Text>💶 CA (jour): <Text style={{ fontWeight: '800' }}>{formatEuro(stats.revenue)}</Text></Text>
                      {(() => {
                        const count = stats.inProgress + stats.processed;
                        if (count > 0) {
                          const avg = stats.revenue / count;
                          return (
                            <Text style={{ marginTop: 2 }}>🧮 Panier moyen: <Text style={{ fontWeight: '800' }}>{formatEuro(avg)}</Text></Text>
                          );
                        }
                        return null;
                      })()}
                      {bestSellerByCity[t.city || '—'] && (
                        <Text style={{ marginTop: 4 }}>🥇 Best-seller: <Text style={{ fontWeight: '800' }}>{bestSellerByCity[t.city || '—']!.title}</Text> × {bestSellerByCity[t.city || '—']!.qty}</Text>
                      )}
                      {!!t.note && <Text style={{ color: '#666', marginTop: 6 }}>{t.note}</Text>}
                      {typeof window !== 'undefined' && t.lat != null && t.lng != null && (
                        <Text
                          style={{ color: '#3f8cff', marginTop: 6, textDecorationLine: 'underline' }}
                          onPress={() => window.open(`https://www.google.com/maps?q=${t.lat},${t.lng}`, '_blank')}
                        >
                          🧭 Itinéraire
                        </Text>
                      )}
                      {typeof window !== 'undefined' && (
                        <Text
                          style={{ color: '#3f8cff', marginTop: 4, textDecorationLine: 'underline' }}
                          onPress={() => window.open('/admin/stats', '_blank')}
                        >
                          📊 Voir les statistiques
                        </Text>
                      )}
                    </View>
                  </rl.Popup>
                </rl.Marker>
              );
            })}
          </rl.MapContainer>
        )}
        {!ready && (
          <View style={[styles.fill, { alignItems: 'center', justifyContent: 'center' }]}> 
            <Text style={{ color: COLORS.muted }}>Chargement de la carte…</Text>
          </View>
        )}
      </View>
      <View style={styles.right}>
        <Text style={styles.title}>Vue d'ensemble (aujourd'hui)</Text>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Commandes en cours</Text>
          <Text style={styles.kpiValue}>{totals.inProgress}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Commandes traitées</Text>
          <Text style={styles.kpiValue}>{totals.processed}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>CA (jour)</Text>
          <Text style={styles.kpiValue}>{totals.revenue.toFixed(2)} €</Text>
        </View>

        <Text style={[styles.section, { marginTop: 12 }]}>Par ville (jour)</Text>
        {Object.keys(todayStatsByCity).length === 0 ? (
          <Text style={{ color: COLORS.muted }}>Aucune donnée aujourd'hui.</Text>
        ) : (
          Object.entries(todayStatsByCity).map(([city, s]) => (
            <View key={city} style={styles.row}>
              <Text style={{ color: COLORS.text, fontWeight: '700', flex: 1 }}>{city}</Text>
              <Text style={{ color: COLORS.muted, marginRight: 8 }}>En cours: {s.inProgress}</Text>
              <Text style={{ color: COLORS.muted, marginRight: 8 }}>Traitées: {s.processed}</Text>
              <Text style={{ color: COLORS.text, fontWeight: '800' }}>{s.revenue.toFixed(2)} €</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.bg },
  left: { flex: 1, padding: 20 },
  right: { width: 340, borderLeftWidth: 1, borderLeftColor: COLORS.border, padding: 16, backgroundColor: '#fff' },
  map: { width: '100%', height: 550, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  kpiCard: { backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  kpiLabel: { color: COLORS.muted, fontWeight: '700' },
  kpiValue: { color: COLORS.text, fontWeight: '800', fontSize: 18, marginTop: 4 },
  section: { color: COLORS.text, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
});
