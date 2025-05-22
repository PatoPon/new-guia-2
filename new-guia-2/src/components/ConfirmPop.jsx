const ConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
        <h2 className="text-lg font-bold mb-4">Confirmar exclusão</h2>
        <p className="mb-6">Tem certeza que deseja deletar esta questão?</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 text-white"
          >
            Deletar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal