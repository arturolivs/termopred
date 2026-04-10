'use client'

import { useState, useEffect } from 'react'
import { TermografiaRecord, TermografiaFormData, Fase } from '@/types'

const EMPTY_FORM: TermografiaFormData = {
  empresa: '', data: '', setor: '', tag: '',
  equipamento: '', termograma: '', descricao: '', foto: '', fase: '',
}

interface RecordFormProps {
  record?: TermografiaRecord | null
  onSave: (data: TermografiaFormData) => Promise<void>
  onClose: () => void
}

// Função para converter YYYY-MM-DD para DD-MM-YYYY
function convertToDDMMYYYY(dateString: string): string {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-')
  return `${day}-${month}-${year}`
}

// Função para converter DD-MM-YYYY para YYYY-MM-DD (para exibir no input date)
function convertToYYYYMMDD(dateString: string): string {
  if (!dateString) return ''
  if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
    const [day, month, year] = dateString.split('-')
    return `${year}-${month}-${day}`
  }
  return dateString
}

// Função para obter data atual no formato YYYY-MM-DD (para o input date)
function getCurrentDateYYYYMMDD(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = (today.getMonth() + 1).toString().padStart(2, '0')
  const day = today.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function RecordForm({ record, onSave, onClose }: RecordFormProps) {
  const [form, setForm] = useState<TermografiaFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [dateValue, setDateValue] = useState<string>('')

  useEffect(() => {
    if (record) {
      const { id, createdAt, updatedAt, ...rest } = record
      setForm(rest)
      if (rest.data) {
        setDateValue(convertToYYYYMMDD(rest.data))
      }
    } else {
      const currentDate = getCurrentDateYYYYMMDD()
      setDateValue(currentDate)
      setForm({ ...EMPTY_FORM, data: convertToDDMMYYYY(currentDate) })
    }
  }, [record])

  // Função auxiliar para atualizar campo com conversão para uppercase (exceto data e fase)
  const setField = (field: keyof TermografiaFormData, value: string) => {
    // Aplica uppercase para todos os campos de texto
    const upperFields: (keyof TermografiaFormData)[] = [
      'empresa', 'setor', 'tag', 'equipamento', 
      'termograma', 'foto', 'descricao'
    ]
    const finalValue = upperFields.includes(field) ? value.toUpperCase() : value
    setForm((prev) => ({ ...prev, [field]: finalValue }))
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const yyyymmdd = e.target.value
    setDateValue(yyyymmdd)
    setField('data', convertToDDMMYYYY(yyyymmdd))
  }

  const handleSubmit = async () => {
    if (!form.empresa.trim()) { alert('Informe o nome da empresa.'); return }
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const faseBtnClass = (f: Fase) => {
    const active = form.fase === f
    if (!active) return 'flex-1 py-1.5 border border-gray-200 rounded-md text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors'
    return 'flex-1 py-1.5 border border-green-400 rounded-md text-sm font-medium text-green-800 bg-green-100'
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl border border-gray-100 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium">{record ? 'Editar registro' : 'Novo registro'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1">×</button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3">
          {/* Empresa */}
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Empresa *</label>
            <input
              className="input"
              value={form.empresa}
              onChange={(e) => setField('empresa', e.target.value)}
              placeholder="Nome da empresa"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Data</label>
            <input
              type="date"
              className="input"
              value={dateValue}
              onChange={handleDateChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Setor</label>
            <input
              className="input"
              value={form.setor}
              onChange={(e) => setField('setor', e.target.value)}
              placeholder="Setor/área"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Tag</label>
            <input
              className="input"
              value={form.tag}
              onChange={(e) => setField('tag', e.target.value)}
              placeholder="TAG do ativo"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Equipamento</label>
            <input
              className="input"
              value={form.equipamento}
              onChange={(e) => setField('equipamento', e.target.value)}
              placeholder="Nome do equipamento"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Termograma</label>
            <input
              className="input"
              value={form.termograma}
              onChange={(e) => setField('termograma', e.target.value)}
              placeholder="Nº ou referência"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Referência da foto</label>
            <input
              className="input"
              value={form.foto}
              onChange={(e) => setField('foto', e.target.value)}
              placeholder="Ref. foto"
            />
          </div>

          {/* Fase */}
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Fase</label>
            <div className="flex gap-2">
              {(['R', 'S', 'T'] as Fase[]).map((f) => (
                <button
                  key={f}
                  className={faseBtnClass(f)}
                  onClick={() => setField('fase', form.fase === f ? '' : f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Descrição da falha</label>
            <textarea
              className="input resize-y min-h-[72px]"
              value={form.descricao}
              onChange={(e) => setField('descricao', e.target.value)}
              placeholder="Descreva a falha identificada..."
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end px-4 py-3 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary">
            {saving ? 'Salvando...' : 'Salvar registro'}
          </button>
        </div>
      </div>
    </div>
  )
}