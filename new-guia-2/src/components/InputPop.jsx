import { useState } from "react"

const InputModal = ({ isOpen, onClose, onSubmit, placeholder = "Digite aqui...", defaultValue = "" }) => {
  const [inputValue, setInputValue] = useState(defaultValue)

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSubmit(inputValue)
      onClose()
    }
  }

  const handleSave = () => {
    onSubmit(inputValue)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
        <h2 className="text-lg font-bold mb-4">Editar Tema</h2>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 text-white"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

export default InputModal