export type CommentaryRecord = {
  id: string;
  passage: string;
  response: string;
  user_plan: 'free' | 'basic' | 'standard' | 'pro';
  module_used?: string;
  timestamp: string;
  created_date: string;
};

const STORAGE_KEY = 'sc_commentaries_v1';

function loadAll(): CommentaryRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(list: CommentaryRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export const Commentary = {
  async list(): Promise<CommentaryRecord[]> {
    return loadAll();
  },
  async create(data: Omit<CommentaryRecord, 'id' | 'created_date'>): Promise<CommentaryRecord> {
    const list = loadAll();
    const record: CommentaryRecord = { id: crypto.randomUUID(), created_date: new Date().toISOString(), ...data } as CommentaryRecord;
    list.unshift(record);
    saveAll(list);
    return record;
  },
};