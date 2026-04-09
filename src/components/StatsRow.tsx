import { TermografiaRecord } from '@/types'

interface StatsRowProps {
  records: TermografiaRecord[]
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-3">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-medium ${accent ? 'text-brand' : 'text-gray-900'}`}>
        {value}
      </div>
    </div>
  )
}

export default function StatsRow({ records }: StatsRowProps) {
  return (
    <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50 border-b border-gray-100">
      <StatCard label="Total" value={records.length} />
      <StatCard label="Fase R" value={records.filter((r) => r.fase === 'R').length} accent />
      <StatCard label="Fase S" value={records.filter((r) => r.fase === 'S').length} accent />
      <StatCard label="Fase T" value={records.filter((r) => r.fase === 'T').length} accent />
    </div>
  )
}
