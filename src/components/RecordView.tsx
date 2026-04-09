import { TermografiaRecord } from '@/types'
import FaseBadge from './FaseBadge'

interface RecordViewProps {
  record: TermografiaRecord
  onClose: () => void
  onEdit: () => void
}

function Field({ label, value, full }: { label: string; value?: string; full?: boolean }) {
  return (
    <div className={`flex flex-col gap-0.5 ${full ? 'col-span-2' : ''}`}>
      <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</div>
      <div className="text-sm text-gray-800">{value || '—'}</div>
    </div>
  )
}

export default function RecordView({ record, onClose, onEdit }: RecordViewProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl border border-gray-100 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium">Detalhes do registro</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1">×</button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-4">
          <Field label="Empresa" value={record.empresa} />
          <Field label="Data" value={record.data} />
          <Field label="Setor" value={record.setor} />
          <Field label="Tag" value={record.tag} />
          <Field label="Equipamento" value={record.equipamento} />
          <Field label="Termograma" value={record.termograma} />
          <Field label="Referência da foto" value={record.foto} />
          <div className="flex flex-col gap-0.5">
            <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Fase</div>
            <FaseBadge fase={record.fase} />
          </div>
          <Field label="Descrição da falha" value={record.descricao} full />
        </div>

        <div className="flex gap-2 justify-end px-4 py-3 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary">Fechar</button>
          <button onClick={onEdit} className="btn-primary">Editar</button>
        </div>
      </div>
    </div>
  )
}
