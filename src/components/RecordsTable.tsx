import { TermografiaRecord } from '@/types'
import FaseBadge from './FaseBadge'
import * as XLSX from 'xlsx'
import { useState } from 'react'

interface RecordsTableProps {
  records: TermografiaRecord[]      // registros filtrados (para exibição)
  allRecords?: TermografiaRecord[]  // registros completos (para exportação)
  total: number
  searchTerm: string
  onSearchChange: (v: string) => void
  onView: (r: TermografiaRecord) => void
  onEdit: (r: TermografiaRecord) => void
  onDelete: (r: TermografiaRecord) => void
  onImport?: (newRecords: TermografiaRecord[]) => void
}

const EXPECTED_COLUMNS = [
  'Fase', 'Empresa', 'Data', 'Setor', 'Tag',
  'Equipamento', 'Termograma', 'Falha', 'Foto'
]

export default function RecordsTable({
  records,
  allRecords,
  total,
  searchTerm,
  onSearchChange,
  onView,
  onEdit,
  onDelete,
  onImport,
}: RecordsTableProps) {
  const [importing, setImporting] = useState(false)

  const isDuplicate = (newRecord: Partial<TermografiaRecord>): boolean => {
    return records.some(existing =>
      existing.empresa === newRecord.empresa &&
      existing.data === newRecord.data &&
      existing.setor === newRecord.setor &&
      existing.tag === newRecord.tag &&
      existing.equipamento === newRecord.equipamento
    )
  }

  const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const mapRowToRecord = (row: any): TermografiaRecord => {
    const now = new Date().toISOString()
    return {
      id: generateId(),
      fase: row.Fase || '',
      empresa: row.Empresa || '',
      data: row.Data || '',
      setor: row.Setor || '',
      tag: row.Tag || '',
      equipamento: row.Equipamento || '',
      termograma: row.Termograma || '',
      descricao: row.Falha || '',
      foto: row.Foto || '',
      createdAt: now,
      updatedAt: now,
    }
  }

  const validateColumns = (headers: string[]): boolean => {
    const normalizedHeaders = headers.map(h => h?.trim())
    return EXPECTED_COLUMNS.every(col => normalizedHeaders.includes(col))
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (fileExt !== 'xls' && fileExt !== 'xlsx') {
      alert('Formato inválido! Por favor, selecione um arquivo .xls ou .xlsx')
      event.target.value = ''
      return
    }

    setImporting(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet) as any[]

        if (jsonData.length === 0) {
          alert('O arquivo está vazio.')
          setImporting(false)
          event.target.value = ''
          return
        }

        const headers = Object.keys(jsonData[0])
        if (!validateColumns(headers)) {
          alert(`Colunas inválidas! O arquivo deve conter exatamente as colunas:\n${EXPECTED_COLUMNS.join(', ')}\n\nEncontradas: ${headers.join(', ')}`)
          setImporting(false)
          event.target.value = ''
          return
        }

        const newRecords: TermografiaRecord[] = []
        const duplicates: string[] = []

        for (const row of jsonData) {
          if (!row.Empresa && !row.Tag) continue

          const newRecord = mapRowToRecord(row)

          if (isDuplicate(newRecord)) {
            duplicates.push(`${newRecord.empresa} - ${newRecord.tag} (${newRecord.data})`)
          } else {
            newRecords.push(newRecord)
          }
        }

        if (newRecords.length === 0) {
          alert('Nenhum registro novo para importar. Todos os registros do arquivo já existem no sistema.')
        } else {
          let message = `${newRecords.length} registro(s) importado(s) com sucesso!`
          if (duplicates.length > 0) {
            message += `\n\n${duplicates.length} registro(s) ignorado(s) por duplicidade:\n${duplicates.slice(0, 5).join('\n')}${duplicates.length > 5 ? `\n... e mais ${duplicates.length - 5}` : ''}`
          }
          alert(message)

          if (onImport) {
            onImport(newRecords)
          } else {
            console.warn('onImport callback não definido. Registros não foram salvos.')
          }
        }
      } catch (error) {
        console.error('Erro ao importar:', error)
        alert('Erro ao processar o arquivo. Verifique se o formato está correto.')
      } finally {
        setImporting(false)
        event.target.value = ''
      }
    }

    reader.onerror = () => {
      alert('Erro ao ler o arquivo.')
      setImporting(false)
      event.target.value = ''
    }

    reader.readAsArrayBuffer(file)
  }

  const exportToExcel = () => {
    const dataToExport = allRecords ?? records
    if (dataToExport.length === 0) {
      alert('Nenhum registro para exportar.')
      return
    }

    const data = dataToExport.map((r) => ({
      Fase: r.fase || '',
      Empresa: r.empresa || '',
      Data: r.data || '',
      Setor: r.setor || '',
      Tag: r.tag || '',
      Equipamento: r.equipamento || '',
      Termograma: r.termograma || '',
      Falha: r.descricao || '',
      Foto: r.foto || '',
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Registros')
    XLSX.writeFile(wb, `termografia_${new Date().toISOString().slice(0, 19)}.xlsx`)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700">
          {records.length === total ? `${total} registros` : `${records.length} de ${total} registros`}
        </span>
        <div className="flex gap-2">
          <label className={`cursor-pointer bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-blue-100 transition-colors ${importing ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {importing ? '⏳ Importando...' : '📂 Importar Excel'}
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
            />
          </label>

          <button
            onClick={exportToExcel}
            className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-green-100 transition-colors"
          >
            📎 Exportar Excel
          </button>

          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5 text-sm text-gray-800 w-48 focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Fase', 'Empresa', 'Data', 'Setor', 'Tag', 'Equipamento', 'Termograma', 'Falha', ''].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2"><FaseBadge fase={r.fase} /></td>
                <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">{r.empresa}</td>
                <td className="px-3 py-2 text-gray-400 whitespace-nowrap">{r.data || '—'}</td>
                <td className="px-3 py-2 text-gray-600">{r.setor || '—'}</td>
                <td className="px-3 py-2">
                  {r.tag ? <span className="bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 text-gray-500">{r.tag}</span> : '—'}
                </td>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{r.equipamento || '—'}</td>
                <td className="px-3 py-2 text-gray-400">{r.termograma || '—'}</td>
                <td className="px-3 py-2 text-gray-400 max-w-[160px] truncate">{r.descricao || '—'}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button onClick={() => onView(r)} className="btn-xs">Ver</button>
                    <button onClick={() => onEdit(r)} className="btn-xs">Editar</button>
                    <button onClick={() => onDelete(r)} className="btn-xs text-red-600 border-red-200 bg-red-50 hover:bg-red-100">Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {records.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-300">
            Nenhum registro encontrado. Clique em "+ Novo registro" para começar.
          </div>
        )}
      </div>
    </div>
  )
}