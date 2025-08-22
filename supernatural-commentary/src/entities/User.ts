export type UserRecord = {
  id: string;
  email: string;
  subscription_plan: 'free' | 'basic' | 'standard' | 'pro';
  usage_count: number;
  last_activity?: string;
  created_date: string;
  payment_status?: 'active' | 'past_due' | 'canceled';
  subscription_end?: string;
};

const STORAGE_KEY = 'sc_users_v1';
const SESSION_KEY = 'sc_current_user_email_v1';

function loadAll(): UserRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(list: UserRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function ensureSeedUser(): void {
  const list = loadAll();
  if (list.length === 0) {
    const seed: UserRecord = {
      id: crypto.randomUUID(),
      email: 'guest@example.com',
      subscription_plan: 'free',
      usage_count: 0,
      created_date: new Date().toISOString(),
    };
    saveAll([seed]);
    sessionStorage.setItem(SESSION_KEY, seed.email);
  }
}

export const User = {
  async me(): Promise<UserRecord | null> {
    ensureSeedUser();
    const currentEmail = sessionStorage.getItem(SESSION_KEY);
    const list = loadAll();
    const user = list.find(u => u.email === currentEmail) || null;
    return user;
  },

  async login(): Promise<void> {
    ensureSeedUser();
    const list = loadAll();
    const user = list[0];
    sessionStorage.setItem(SESSION_KEY, user.email);
  },

  async logout(): Promise<void> {
    sessionStorage.removeItem(SESSION_KEY);
  },

  async updateMyUserData(patch: Partial<UserRecord>): Promise<void> {
    const current = await this.me();
    if (!current) return;
    const list = loadAll();
    const idx = list.findIndex(u => u.id === current.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...patch } as UserRecord;
      saveAll(list);
    }
  },

  async list(): Promise<UserRecord[]> {
    ensureSeedUser();
    return loadAll();
  },
};