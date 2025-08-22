export type MaterialRecord = {
  id: string;
  title: string;
  category: 'commentary' | 'divine-promises' | 'supernatural' | 'general' | 'prophetic' | 'ministry' | 'acts-model' | 'authority';
  content: string;
  module_number: number;
  keywords?: string[];
  created_date: string;
};

const STORAGE_KEY = 'sc_materials_v1';

function loadAll(): MaterialRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(list: MaterialRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export const Material = {
  async list(): Promise<MaterialRecord[]> {
    return loadAll();
  },
  async create(data: Omit<MaterialRecord, 'id' | 'created_date'>): Promise<MaterialRecord> {
    const list = loadAll();
    const record: MaterialRecord = { id: crypto.randomUUID(), created_date: new Date().toISOString(), ...data } as MaterialRecord;
    list.unshift(record);
    saveAll(list);
    return record;
  },
  async delete(id: string): Promise<void> {
    const list = loadAll().filter(m => m.id !== id);
    saveAll(list);
  },
};