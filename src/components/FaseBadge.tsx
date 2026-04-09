import { Fase } from '@/types'

const styles: Record<string, string> = {
  R: 'bg-red-100 text-red-800',
  S: 'bg-yellow-100 text-yellow-800',
  T: '',
  '': 'bg-gray-100 text-gray-500',
}

export default function FaseBadge({ fase }: { fase: Fase | '' }) {
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-medium ${fase ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500 '}`}>
      {fase || '—'}
    </span>
  )
}
