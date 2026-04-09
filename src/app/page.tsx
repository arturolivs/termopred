'use client'

import { useState } from 'react'
import { TermografiaRecord } from '@/types'
import { useTermografia } from '@/hooks/useTermografia'
import StatsRow from '@/components/StatsRow'
import RecordsTable from '@/components/RecordsTable'
import RecordForm from '@/components/RecordForm'
import RecordView from '@/components/RecordView'

type Modal = { type: 'none' } | { type: 'create' } | { type: 'edit'; record: TermografiaRecord } | { type: 'view'; record: TermografiaRecord }

export default function Home() {
  const {
    records, filtered, loading, searchTerm, storageInfo,
    setSearchTerm, createRecord, updateRecord, deleteRecord,
  } = useTermografia()

  const [modal, setModal] = useState<Modal>({ type: 'none' })

  const handleDelete = async (r: TermografiaRecord) => {
    if (!confirm(`Excluir registro de "${r.empresa}"?`)) return
    await deleteRecord(r.id)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2C8 2 6 6 6 9c0 3.5 2.5 6 6 6s6-2.5 6-6c0-3-2-7-6-7z"/>
              <path d="M12 15v7M9 20h6"/>
              <circle cx="12" cy="9" r="2" fill="white" stroke="none"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">TermoPred</div>
            <div className="text-xs text-gray-400">Sistema de registros termográficos</div>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setModal({ type: 'create' })}>
          + Novo registro
        </button>
      </header>

      {/* Stats */}
      <StatsRow records={records} />

      {/* Main */}
      <main className="flex-1 p-5">
        {loading ? (
          <div className="text-sm text-gray-300 py-16 text-center">Carregando registros...</div>
        ) : (
          <RecordsTable
            records={filtered}
            total={records.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onView={(r) => setModal({ type: 'view', record: r })}
            onEdit={(r) => setModal({ type: 'edit', record: r })}
            onDelete={handleDelete}
          />
        )}
      </main>

      {/* Storage bar */}
      <footer className="flex items-center gap-2 px-5 py-2 border-t border-gray-100 bg-gray-50">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
        <span className="text-xs text-gray-300">
          localStorage ativo — {storageInfo.count} registros · {storageInfo.sizeKb} KB
        </span>
      </footer>

      {/* Modals */}
      {modal.type === 'create' && (
        <RecordForm onSave={createRecord} onClose={() => setModal({ type: 'none' })} />
      )}
      {modal.type === 'edit' && (
        <RecordForm
          record={modal.record}
          onSave={(data) => updateRecord(modal.record.id, data)}
          onClose={() => setModal({ type: 'none' })}
        />
      )}
      {modal.type === 'view' && (
        <RecordView
          record={modal.record}
          onClose={() => setModal({ type: 'none' })}
          onEdit={() => setModal({ type: 'edit', record: modal.record })}
        />
      )}
    </div>
  )
}
