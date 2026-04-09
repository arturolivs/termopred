import { TermografiaRecord, TermografiaFormData } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'registro_termografia'

// ─── Storage Adapter Interface ──────────────────────────────────────────────
// Troque a implementação abaixo para migrar para IndexedDB, Supabase, etc.
// sem alterar nada no resto da aplicação.
export interface StorageAdapter {
  getAll(): Promise<TermografiaRecord[]>
  getById(id: string): Promise<TermografiaRecord | null>
  create(data: TermografiaFormData): Promise<TermografiaRecord>
  update(id: string, data: TermografiaFormData): Promise<TermografiaRecord>
  delete(id: string): Promise<void>
}

// ─── LocalStorage Adapter ───────────────────────────────────────────────────
class LocalStorageAdapter implements StorageAdapter {
  private readAll(): TermografiaRecord[] {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  }

  private writeAll(records: TermografiaRecord[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }

  async getAll(): Promise<TermografiaRecord[]> {
    return this.readAll().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  async getById(id: string): Promise<TermografiaRecord | null> {
    return this.readAll().find((r) => r.id === id) ?? null
  }

  async create(data: TermografiaFormData): Promise<TermografiaRecord> {
    const records = this.readAll()
    const now = new Date().toISOString()
    const record: TermografiaRecord = {
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    }
    this.writeAll([...records, record])
    return record
  }

  async update(id: string, data: TermografiaFormData): Promise<TermografiaRecord> {
    const records = this.readAll()
    const existing = records.find((r) => r.id === id)
    if (!existing) throw new Error(`Record ${id} not found`)
    const updated: TermografiaRecord = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    }
    this.writeAll(records.map((r) => (r.id === id ? updated : r)))
    return updated
  }

  async delete(id: string): Promise<void> {
    this.writeAll(this.readAll().filter((r) => r.id !== id))
  }
}

// ─── Singleton export ────────────────────────────────────────────────────────
// Para trocar o adapter, basta substituir: new SupabaseAdapter() por exemplo
export const storageAdapter: StorageAdapter = new LocalStorageAdapter()

// ─── Storage info helper ─────────────────────────────────────────────────────
export function getStorageInfo(): { sizeKb: string; count: number } {
  if (typeof window === 'undefined') return { sizeKb: '0', count: 0 }
  const raw = localStorage.getItem(STORAGE_KEY) || ''
  const sizeKb = (new Blob([raw]).size / 1024).toFixed(1)
  const count = (() => { try { return JSON.parse(raw).length } catch { return 0 } })()
  return { sizeKb, count }
}
