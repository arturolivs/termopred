# TermoPred — Sistema de Registros Termográficos

CRUD completo em Next.js 14 (App Router) + TypeScript + Tailwind CSS.
Armazenamento em `localStorage` com arquitetura de adapter para migração futura.

---

## Pré-requisitos

- Node.js >= 18.17
- npm >= 9

---

## Criação do projeto do zero (passos)

Se preferir criar um projeto fresh em vez de clonar este:

```bash
# 1. Criar projeto Next.js com TypeScript + Tailwind + App Router
npx create-next-app@latest TermoPred \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd TermoPred

# 2. Instalar dependência extra (uuid)
npm install uuid
npm install -D @types/uuid
```

Depois substitua os arquivos em `src/` pelos deste projeto.

---

## Instalação (a partir deste repositório)

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

---

## Build para produção

```bash
npm run build
npm run start
```

---

## Estrutura do projeto

```
src/
├── app/
│   ├── layout.tsx          # Root layout + metadados
│   ├── page.tsx            # Página principal (orquestrador)
│   └── globals.css         # Tailwind + classes utilitárias
│
├── components/
│   ├── FaseBadge.tsx       # Badge de fase R/S/T
│   ├── RecordForm.tsx      # Modal de criação/edição
│   ├── RecordView.tsx      # Modal de visualização
│   ├── RecordsTable.tsx    # Tabela com busca
│   └── StatsRow.tsx        # Cards de estatísticas
│
├── hooks/
│   └── useTermografia.ts   # Estado + operações CRUD
│
├── services/
│   └── storage.ts          # Adapter de armazenamento
│
└── types/
    └── index.ts            # Tipos TypeScript
```

---

## Migrar para outro banco de dados

Toda a persistência está isolada em `src/services/storage.ts`.
Para trocar o storage, implemente a interface `StorageAdapter`:

```typescript
export interface StorageAdapter {
  getAll(): Promise<TermografiaRecord[]>
  getById(id: string): Promise<TermografiaRecord | null>
  create(data: TermografiaFormData): Promise<TermografiaRecord>
  update(id: string, data: TermografiaFormData): Promise<TermografiaRecord>
  delete(id: string): Promise<void>
}
```

### Exemplo: Supabase

```bash
npm install @supabase/supabase-js
```

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

class SupabaseAdapter implements StorageAdapter {
  async getAll() {
    const { data } = await supabase.from('termografia').select('*').order('created_at', { ascending: false })
    return data ?? []
  }
  async create(data: TermografiaFormData) {
    const { data: record } = await supabase.from('termografia').insert(data).select().single()
    return record
  }
  // ... etc
}

export const storageAdapter: StorageAdapter = new SupabaseAdapter()
```

### Exemplo: IndexedDB via Dexie.js

```bash
npm install dexie
```

```typescript
import Dexie from 'dexie'

const db = new Dexie('TermoPred')
db.version(1).stores({ records: '++id, empresa, fase, data' })

class DexieAdapter implements StorageAdapter {
  async getAll() { return db.table('records').orderBy('createdAt').reverse().toArray() }
  // ...
}
```

---

## SQL para Supabase (tabela)

```sql
create table termografia (
  id          uuid primary key default gen_random_uuid(),
  empresa     text not null,
  data        date,
  setor       text,
  tag         text,
  equipamento text,
  termograma  text,
  descricao   text,
  foto        text,
  fase        text check (fase in ('R','S','T','')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
```
