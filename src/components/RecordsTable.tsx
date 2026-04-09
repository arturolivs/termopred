import { TermografiaRecord } from '@/types'
import FaseBadge from './FaseBadge'
import * as XLSX from 'xlsx'

interface RecordsTableProps {
  records: TermografiaRecord[]
  total: number
  searchTerm: string
  onSearchChange: (v: string) => void
  onView: (r: TermografiaRecord) => void
  onEdit: (r: TermografiaRecord) => void
  onDelete: (r: TermografiaRecord) => void
}

export default function RecordsTable({
  records, total, searchTerm, onSearchChange, onView, onEdit, onDelete,
}: RecordsTableProps) {
  const exportToExcel = () => {
    if (records.length === 0) {
      alert('Nenhum registro para exportar.')
      return
    }

    // Mapear campos para as colunas desejadas
    const data = records.map((r) => ({
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
    
    // Gerar arquivo e fazer download
    XLSX.writeFile(wb, `termografia_${new Date().toISOString().slice(0,19)}.xlsx`)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700">
          {records.length === total ? `${total} registros` : `${records.length} de ${total} registros`}
        </span>
        <div className="flex gap-2">
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

      {/* Table (restante do código permanece igual) */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Fase','Empresa','Data','Setor','Tag','Equipamento','Termograma','Falha',''].map((h) => (
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
            Nenhum registro encontrado. Clique em &quot;+ Novo registro&quot; para começar.
          </div>
        )}
      </div>
    </div>
  )
}