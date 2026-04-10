'use client'

import { useState, useEffect, useCallback } from 'react'
import { TermografiaRecord, TermografiaFormData } from '@/types'
import { storageAdapter, getStorageInfo } from '@/services/storage'

interface UseTermografiaReturn {
  records: TermografiaRecord[]
  filtered: TermografiaRecord[]
  loading: boolean
  searchTerm: string
  storageInfo: { sizeKb: string; count: number }
  setSearchTerm: (v: string) => void
  createRecord: (data: TermografiaFormData) => Promise<void>
  updateRecord: (id: string, data: TermografiaFormData) => Promise<void>
  deleteRecord: (id: string) => Promise<void>
  importRecords: (newRecords: TermografiaRecord[]) => Promise<void>
  refresh: () => Promise<void>
}

export function useTermografia(): UseTermografiaReturn {
  const [records, setRecords] = useState<TermografiaRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [storageInfo, setStorageInfo] = useState({ sizeKb: '0', count: 0 })

  const refresh = useCallback(async () => {
    setLoading(true)
    const data = await storageAdapter.getAll()
    setRecords(data)
    setStorageInfo(getStorageInfo())
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const filtered = records.filter((r) => {
    if (!searchTerm.trim()) return true
    const t = searchTerm.toLowerCase()
    return [r.empresa, r.setor, r.tag, r.equipamento, r.termograma, r.descricao, r.fase, r.foto]
      .some((v) => (v || '').toLowerCase().includes(t))
  })

  const createRecord = async (data: TermografiaFormData) => {
    await storageAdapter.create(data)
    await refresh()
  }

  const updateRecord = async (id: string, data: TermografiaFormData) => {
    await storageAdapter.update(id, data)
    await refresh()
  }

  const deleteRecord = async (id: string) => {
    await storageAdapter.delete(id)
    await refresh()
  }

  const importRecords = async (newRecords: TermografiaRecord[]) => {
    // Se o storageAdapter tiver um método createMany, use-o.
    // Caso contrário, faça um loop com create.
    // Aqui assumimos que o adapter tem createMany (mais eficiente)
    if ((storageAdapter as any).createMany) {
      await (storageAdapter as any).createMany(newRecords)
    } else {
      // Fallback: criar um por um
      for (const rec of newRecords) {
        await storageAdapter.create(rec)
      }
    }
    await refresh()
  }

  return {
    records,
    filtered,
    loading,
    searchTerm,
    storageInfo,
    setSearchTerm,
    createRecord,
    updateRecord,
    deleteRecord,
    importRecords,
    refresh,
  }
}