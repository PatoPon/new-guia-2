import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'

export const SortableItem = ({
  disciplina,
  temas,
  onRemoverDisciplina,
  onRemoverTema,
  onAdicionarTema,
  valorNovoTema,
  setValorNovoTema,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: disciplina.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li ref={setNodeRef} style={style} {...attributes} className="bg-white rounded shadow p-4 mb-4 list-none">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <button {...listeners} className="cursor-move text-gray-400 hover:text-gray-600">
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

      <ul className="list-disc list-inside space-y-1 pl-4">
        {temas.map((tema) => (
          <li key={tema.id} className="flex justify-between items-center">
            <span>{tema.nome}</span>
            <button
              onClick={() => onRemoverTema(disciplina.id, tema.id)}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 mt-2">
        <input
          value={valorNovoTema}
          onChange={(e) => setValorNovoTema(e.target.value)}
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

export default SortableItem