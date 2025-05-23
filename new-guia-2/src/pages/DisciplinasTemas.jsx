import { useEffect, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { v4 as uuidv4 } from 'uuid'
import SortableItem from '../components/SortableItem'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

const DisciplinasETemas = () => {
  const [disciplinas, setDisciplinas] = useState([])
  const [temasPorDisciplina, setTemasPorDisciplina] = useState({})
  const [novaDisciplina, setNovaDisciplina] = useState('')
  const [novosTemas, setNovosTemas] = useState({})

  const carregarDisciplinasETemas = async () => {
    const resDisciplinas = await fetch('http://localhost:3001/api/disciplinas')
    const dataDisciplinas = await resDisciplinas.json()
    const ordemSalva = JSON.parse(localStorage.getItem('ordemDisciplinas'))

    if (ordemSalva?.length) {
      dataDisciplinas.sort((a, b) => ordemSalva.indexOf(a.id) - ordemSalva.indexOf(b.id))
    }

    setDisciplinas(dataDisciplinas)

    const promises = dataDisciplinas.map(d =>
      fetch(`http://localhost:3001/api/temas/${d.id}`).then(res => res.json())
    )
    const temasArrays = await Promise.all(promises)

    const temasData = {}
    dataDisciplinas.forEach((d, i) => {
      temasData[d.id] = temasArrays[i]
    })

    setTemasPorDisciplina(temasData)
  }

  useEffect(() => {
    carregarDisciplinasETemas()
  }, [])

  const handleAdicionarDisciplina = async () => {
    if (!novaDisciplina.trim()) return
    const res = await fetch('http://localhost:3001/api/disciplinas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: uuidv4(), nome: novaDisciplina }),
    })
    const nova = await res.json()
    setDisciplinas([...disciplinas, nova])
    localStorage.setItem('ordemDisciplinas', JSON.stringify([...disciplinas.map(d => d.id), nova.id]))
    setNovaDisciplina('')
    carregarDisciplinasETemas()
  }

  const handleRemoverDisciplina = async (id) => {
    const confirm = window.confirm('Deseja remover esta disciplina e seus temas?')
    if (!confirm) return
    await fetch(`http://localhost:3001/api/disciplinas/${id}`, { method: 'DELETE' })
    setDisciplinas(prev => {
      const novas = prev.filter(d => d.id !== id)
      localStorage.setItem('ordemDisciplinas', JSON.stringify(novas.map(d => d.id)))
      return novas
    })
    const temp = { ...temasPorDisciplina }
    delete temp[id]
    setTemasPorDisciplina(temp)
    carregarDisciplinasETemas()
  }

  const handleAdicionarTema = async (disciplinaId) => {
    const nome = novosTemas[disciplinaId]?.trim()
    if (!nome) return

    const res = await fetch('http://localhost:3001/api/temas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, disciplina_id: disciplinaId }),
    })
    const novo = await res.json()

    setTemasPorDisciplina(prev => ({
      ...prev,
      [disciplinaId]: [...(prev[disciplinaId] || []), novo],
    }))
    setNovosTemas({ ...novosTemas, [disciplinaId]: '' })
    carregarDisciplinasETemas()
  }

  const handleRemoverTema = async (disciplinaId, temaId) => {
    const confirm = window.confirm('Deseja remover este tema?')
    if (!confirm) return

    await fetch(`http://localhost:3001/api/temas/${temaId}`, { method: 'DELETE' })
    setTemasPorDisciplina(prev => ({
      ...prev,
      [disciplinaId]: prev[disciplinaId].filter(t => t.id !== temaId),
    }))
    carregarDisciplinasETemas()
  }

  // Sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = disciplinas.findIndex(d => d.id === active.id)
      const newIndex = disciplinas.findIndex(d => d.id === over.id)
      const newOrder = arrayMove(disciplinas, oldIndex, newIndex)
      setDisciplinas(newOrder)
      localStorage.setItem('ordemDisciplinas', JSON.stringify(newOrder.map(d => d.id)))
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Disciplinas e Temas</h1>

      <div className="mb-6 flex gap-2">
      <input
        value={novaDisciplina}
        onChange={(e) => setNovaDisciplina(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleAdicionarDisciplina()
          }
        }}
        placeholder="Nova disciplina"
        className="border p-2 rounded w-full"
      />
      <button
        onClick={handleAdicionarDisciplina}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Adicionar
      </button>
    </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={disciplinas.map(d => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {disciplinas.map((disciplina) => (
            <SortableItem
              key={disciplina.id}
              disciplina={disciplina}
              temas={temasPorDisciplina[disciplina.id] || []}
              onRemoverDisciplina={handleRemoverDisciplina}
              onRemoverTema={handleRemoverTema}
              onAdicionarTema={handleAdicionarTema}
              valorNovoTema={novosTemas[disciplina.id] || ''}
              setValorNovoTema={(v) => setNovosTemas({ ...novosTemas, [disciplina.id]: v })}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default DisciplinasETemas
