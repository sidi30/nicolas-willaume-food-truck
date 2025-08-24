import React, { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View, ScrollView } from 'react-native';
import { useApp } from '../../context/AppContext';

// Dynamic import of recharts on web to avoid native bundling
// Types are provided by the package itself

type RCMod = {
  ResponsiveContainer: any;
  LineChart: any; Line: any; BarChart: any; Bar: any; PieChart: any; Pie: any; Cell: any;
  XAxis: any; YAxis: any; Tooltip: any; Legend: any; CartesianGrid: any;
};

const COLORS = {
  bg: '#fcfaf8',
  text: '#1b130d',
  muted: '#9a6c4c',
  primary: '#ee7c2b',
  border: '#f3ece7',
  cardBg: '#ffffff',
};

function toLocalYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toLocalYM(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function isSameLocalDay(iso: string, base = new Date()) {
  const d = new Date(iso);
  return (
    d.getFullYear() === base.getFullYear() &&
    d.getMonth() === base.getMonth() &&
    d.getDate() === base.getDate()
  );
}

function daysBack(n: number) {
  const arr: Date[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(start);
    d.setDate(start.getDate() - i);
    arr.push(d);
  }
  return arr;
}

function monthsBack(n: number) {
  const arr: Date[] = [];
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(start);
    d.setMonth(start.getMonth() - i);
    arr.push(d);
  }
  return arr;
}

export default function AdminStats() {
  const { orders } = useApp();
  const [rc, setRc] = useState<RCMod | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      import('recharts').then((mod: any) => {
        setRc({
          ResponsiveContainer: mod.ResponsiveContainer,
          LineChart: mod.LineChart,
          Line: mod.Line,
          BarChart: mod.BarChart,
          Bar: mod.Bar,
          PieChart: mod.PieChart,
          Pie: mod.Pie,
          Cell: mod.Cell,
          XAxis: mod.XAxis,
          YAxis: mod.YAxis,
          Tooltip: mod.Tooltip,
          Legend: mod.Legend,
          CartesianGrid: mod.CartesianGrid,
        });
      });
    }
  }, []);

  // KPIs
  const today = useMemo(() => {
    const revenue = orders.filter((o) => isSameLocalDay(o.date)).reduce((s, o) => s + o.total, 0);
    const count = orders.filter((o) => isSameLocalDay(o.date)).length;
    return { revenue, count };
  }, [orders]);

  const last7Days = useMemo(() => {
    const dates = daysBack(7).map(toLocalYMD);
    const map: Record<string, { revenue: number; count: number }> = {};
    dates.forEach((d) => (map[d] = { revenue: 0, count: 0 }));
    for (const o of orders) {
      const d = toLocalYMD(new Date(o.date));
      if (map[d]) {
        map[d].revenue += o.total;
        map[d].count += 1;
      }
    }
    const total = Object.values(map).reduce((s, v) => s + v.revenue, 0);
    const count = Object.values(map).reduce((s, v) => s + v.count, 0);
    return { total, count, series: dates.map((d) => ({ date: d.slice(5), revenue: map[d].revenue, orders: map[d].count })) };
  }, [orders]);

  const last30Days = useMemo(() => {
    const dates = daysBack(30).map(toLocalYMD);
    const map: Record<string, { revenue: number; count: number }> = {};
    dates.forEach((d) => (map[d] = { revenue: 0, count: 0 }));
    for (const o of orders) {
      const d = toLocalYMD(new Date(o.date));
      if (map[d]) {
        map[d].revenue += o.total;
        map[d].count += 1;
      }
    }
    return dates.map((d) => ({ date: d.slice(5), revenue: map[d].revenue, orders: map[d].count }));
  }, [orders]);

  const last12Months = useMemo(() => {
    const months = monthsBack(12).map(toLocalYM);
    const map: Record<string, { revenue: number; count: number }> = {};
    months.forEach((m) => (map[m] = { revenue: 0, count: 0 }));
    for (const o of orders) {
      const ym = toLocalYM(new Date(o.date));
      if (map[ym]) {
        map[ym].revenue += o.total;
        map[ym].count += 1;
      }
    }
    return months.map((m) => ({ month: m, revenue: map[m].revenue, orders: map[m].count }));
  }, [orders]);

  const byCity = useMemo(() => {
    const acc: Record<string, { revenue: number; count: number }> = {};
    for (const o of orders) {
      const city = o.city || '—';
      if (!acc[city]) acc[city] = { revenue: 0, count: 0 };
      acc[city].revenue += o.total;
      acc[city].count += 1;
    }
    const entries = Object.entries(acc).map(([city, v]) => ({ city, ...v }));
    entries.sort((a, b) => b.revenue - a.revenue);
    return entries.slice(0, 8);
  }, [orders]);

  const byStatus = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const o of orders) acc[o.status] = (acc[o.status] || 0) + 1;
    const colors = ['#ee7c2b', '#3f8cff', '#22c55e', '#ef4444', '#a855f7', '#f59e0b'];
    return Object.entries(acc).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [orders]);

  // Alerts
  const alerts = useMemo(() => {
    const items: string[] = [];
    const avg7 = last7Days.total / 7;
    if (last7Days.series.length > 0) {
      const todayRevenue = last7Days.series[last7Days.series.length - 1].revenue;
      if (avg7 > 0 && todayRevenue < 0.5 * avg7) items.push('Baisse significative du CA aujourd\'hui par rapport à la moyenne 7j');
      if (avg7 > 0 && todayRevenue > 1.5 * avg7) items.push('Pic de CA aujourd\'hui par rapport à la moyenne 7j');
    }
    return items;
  }, [last7Days]);

  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.fill, { alignItems: 'center', justifyContent: 'center' }]}> 
        <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700', textAlign: 'center', padding: 16 }}>
          Les statistiques sont disponibles sur le web.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.pageTitle}>Statistiques & Tendances</Text>

        {/* KPI Cards */}
        <View style={styles.rowWrap}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Ventes (aujourd'hui)</Text>
            <Text style={styles.kpiValue}>{today.count}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>CA (aujourd'hui)</Text>
            <Text style={styles.kpiValue}>{today.revenue.toFixed(2)} €</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Ventes (7 jours)</Text>
            <Text style={styles.kpiValue}>{last7Days.count}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>CA (7 jours)</Text>
            <Text style={styles.kpiValue}>{last7Days.total.toFixed(2)} €</Text>
          </View>
        </View>

        {/* Charts Row 1: 30-day trends */}
        {rc && (
          <View style={styles.rowWrap}>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Tendance CA (30 jours)</Text>
              <rc.ResponsiveContainer width="100%" height={240}>
                <rc.LineChart data={last30Days} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <rc.CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                  <rc.XAxis dataKey="date" />
                  <rc.YAxis />
                  <rc.Tooltip />
                  <rc.Legend />
                  <rc.Line type="monotone" dataKey="revenue" name="CA" stroke="#ee7c2b" strokeWidth={2} dot={false} />
                </rc.LineChart>
              </rc.ResponsiveContainer>
            </View>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Commandes (30 jours)</Text>
              <rc.ResponsiveContainer width="100%" height={240}>
                <rc.BarChart data={last30Days} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <rc.CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                  <rc.XAxis dataKey="date" />
                  <rc.YAxis />
                  <rc.Tooltip />
                  <rc.Legend />
                  <rc.Bar dataKey="orders" name="Commandes" fill="#3f8cff" />
                </rc.BarChart>
              </rc.ResponsiveContainer>
            </View>
          </View>
        )}

        {/* Charts Row 2: By City and Status */}
        {rc && (
          <View style={styles.rowWrap}>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Top villes par CA</Text>
              <rc.ResponsiveContainer width="100%" height={260}>
                <rc.BarChart data={byCity} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <rc.CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                  <rc.XAxis type="number" />
                  <rc.YAxis type="category" dataKey="city" width={90} />
                  <rc.Tooltip />
                  <rc.Legend />
                  <rc.Bar dataKey="revenue" name="CA" fill="#ee7c2b" />
                </rc.BarChart>
              </rc.ResponsiveContainer>
            </View>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Répartition par statut</Text>
              <rc.ResponsiveContainer width="100%" height={260}>
                <rc.PieChart>
                  <rc.Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                    {byStatus.map((entry, index) => (
                      <rc.Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </rc.Pie>
                  <rc.Tooltip />
                  <rc.Legend />
                </rc.PieChart>
              </rc.ResponsiveContainer>
            </View>
          </View>
        )}

        {/* Alerts */}
        <View style={styles.alertsCard}>
          <Text style={styles.chartTitle}>Alertes</Text>
          {alerts.length === 0 ? (
            <Text style={{ color: COLORS.muted }}>Aucune alerte.</Text>
          ) : (
            alerts.map((a, i) => (
              <Text key={i} style={{ color: COLORS.text, marginTop: 6 }}>• {a}</Text>
            ))
          )}
        </View>

        {/* Monthly overview */}
        {rc && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Vue mensuelle (12 mois)</Text>
            <rc.ResponsiveContainer width="100%" height={260}>
              <rc.BarChart data={last12Months} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <rc.CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <rc.XAxis dataKey="month" />
                <rc.YAxis />
                <rc.Tooltip />
                <rc.Legend />
                <rc.Bar dataKey="revenue" name="CA" fill="#ee7c2b" />
              </rc.BarChart>
            </rc.ResponsiveContainer>
          </View>
        )}

        {Platform.OS === 'web' && !rc && (
          <View style={[styles.fill, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}> 
            <Text style={{ color: COLORS.muted }}>Chargement des graphiques…</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, backgroundColor: COLORS.bg },
  pageTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginBottom: 12 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kpiCard: { backgroundColor: COLORS.cardBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, width: 220 },
  kpiLabel: { color: COLORS.muted, fontWeight: '700' },
  kpiValue: { color: COLORS.text, fontWeight: '800', fontSize: 18, marginTop: 4 },
  chartCard: { backgroundColor: COLORS.cardBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, flex: 1, minWidth: 320, marginTop: 12 },
  alertsCard: { backgroundColor: COLORS.cardBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, marginTop: 12 },
  chartTitle: { color: COLORS.text, fontWeight: '800', marginBottom: 8 },
});
