export type AdminUser = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role?: 'admin' | 'staff';
};

export type Truck = {
  id: string;
  name: string;
  city?: string;
  active?: boolean;
  note?: string;
};

const USERS_KEY = 'wft_admin_users';
const TRUCKS_KEY = 'wft_admin_trucks';

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

export function loadUsers(): AdminUser[] {
  try {
    if (!canUseStorage()) return [];
    const raw = window.localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as AdminUser[]) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: AdminUser[]) {
  try {
    if (!canUseStorage()) return;
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
}

export function loadTrucks(): Truck[] {
  try {
    if (!canUseStorage()) return [];
    const raw = window.localStorage.getItem(TRUCKS_KEY);
    return raw ? (JSON.parse(raw) as Truck[]) : [];
  } catch {
    return [];
  }
}

export function saveTrucks(trucks: Truck[]) {
  try {
    if (!canUseStorage()) return;
    window.localStorage.setItem(TRUCKS_KEY, JSON.stringify(trucks));
  } catch {}
}

export function genId(prefix: string) {
  return prefix + Math.floor(Math.random() * 100000).toString();
}
