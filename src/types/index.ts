export type Fase = 'R' | 'S' | 'T'

export interface TermografiaRecord {
  id: string
  empresa: string
  data: string
  setor: string
  tag: string
  equipamento: string
  termograma: string
  descricao: string
  foto: string
  fase: Fase | ''
  createdAt: string
  updatedAt: string
}

export type TermografiaFormData = Omit<TermografiaRecord, 'id' | 'createdAt' | 'updatedAt'>
