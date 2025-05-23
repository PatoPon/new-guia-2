import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'

export const SortableItem = ({
  disciplina,
  temas,
  onRemoverDisciplina,
  onRemoverTema,
  onAdicionarTema,
  valorNovoTema,
  setValorNovoTema,
  onTemaOrderChange,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: disciplina.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const handleTemaDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = temas.findIndex((t) => t.id === active.id)
    const newIndex = temas.findIndex((t) => t.id === over.id)
    const novaOrdem = arrayMove(temas, oldIndex, newIndex)

    onTemaOrderChange(disciplina.id, novaOrdem)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onAdicionarTema(disciplina.id)
    }
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white rounded shadow p-4 mb-4 list-none"
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <button
            {...listeners}
            className="cursor-move text-gray-400 hover:text-gray-600"
          >
            <GripVertical size={20} />
          </button>
          <h3 className="text-lg font-semibold">{disciplina.nome}</h3>
        </div>
        <button
          onClick={() => onRemoverDisciplina(disciplina.id)}
          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleTemaDragEnd}
      >
        <SortableContext
          items={temas.map((tema) => tema.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="list-disc list-inside space-y-1 pl-4">
            {temas.map((tema) => (
              <TemaItem
                key={tema.id}
                tema={tema}
                disciplinaId={disciplina.id}
                onRemoverTema={onRemoverTema}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <div className="flex gap-2 mt-2">
        <input
          value={valorNovoTema}
          onChange={(e) => setValorNovoTema(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Novo tema"
          className="border p-1 rounded w-full"
        />
        <button
          onClick={() => onAdicionarTema(disciplina.id)}
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        >
          Adicionar tema
        </button>
      </div>
    </li>
  )
}

const TemaItem = ({ tema, disciplinaId, onRemoverTema }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: tema.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex justify-between items-center bg-gray-100 px-2 py-1 rounded"
    >
      <div className="flex items-center gap-2">
        <button
          {...listeners}
          className="cursor-move text-gray-400 hover:text-gray-600"
        >
          <GripVertical size={16} />
        </button>
        <span>{tema.nome}</span>
      </div>
      <button
        onClick={() => onRemoverTema(disciplinaId, tema.id)}
        className="text-sm text-red-500 hover:text-red-700"
      >
        Remover
      </button>
    </li>
  )
}

export default SortableItem