import { useState, useEffect } from 'react'
import QuestionCard from '../components/Questioncard.jsx'
import ConfirmModal from '../components/ConfirmPop.jsx'

const Questions = () => {
  const [questions, setQuestions] = useState([])
  const [selected, setSelected] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/questions')
        const data = await res.json()
        setQuestions(data)
      } catch (error) {
        console.error('Erro ao buscar questões:', error)
      }
    }

    fetchQuestions()
  }, [])

  const toggleSelection = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id])
  }

  const handleDelete = (id) => {
    setModalOpen(true)
    setQuestionToDelete(id)
  }

  const confirmDelete = async () => {
    try {
      await fetch(`http://localhost:3001/api/questions/${questionToDelete}`, {
        method: 'DELETE'
      })
      setQuestions(prev => prev.filter(q => q.id !== questionToDelete))
    } catch (error) {
      console.error('Erro ao deletar questão:', error)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Questões</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questions.map(q => (
          <QuestionCard
            key={q.id}
            question={q}
            selected={selected.includes(q.id)}
            onSelect={() => toggleSelection(q.id)}
            onDelete={() => handleDelete(q.id)}
          />
        ))}
      </div>
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

export default Questions