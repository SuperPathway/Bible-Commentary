export type ContactMessageRecord = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_date: string;
};

const STORAGE_KEY = 'sc_contact_messages_v1';

function loadAll(): ContactMessageRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(list: ContactMessageRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export const ContactMessage = {
  async list(): Promise<ContactMessageRecord[]> {
    return loadAll();
  },
  async create(data: Omit<ContactMessageRecord, 'id' | 'status' | 'created_date'>): Promise<ContactMessageRecord> {
    const list = loadAll();
    const record: ContactMessageRecord = {
      id: crypto.randomUUID(),
      status: 'new',
      created_date: new Date().toISOString(),
      ...data,
    } as ContactMessageRecord;
    list.unshift(record);
    saveAll(list);
    return record;
  },
  async update(id: string, patch: Partial<ContactMessageRecord>): Promise<void> {
    const list = loadAll();
    const idx = list.findIndex(m => m.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...patch } as ContactMessageRecord;
      saveAll(list);
    }
  },
};