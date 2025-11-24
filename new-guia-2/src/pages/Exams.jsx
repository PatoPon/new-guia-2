import { useEffect, useState } from 'react'
import sampleQuestions from '../data/sampleQuestions'

const Exams = () => {
  const [selectedQuestions, setSelectedQuestions] = useState([])

  useEffect(() => {
    setSelectedQuestions(sampleQuestions.slice(0, 3))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Prova Gerada</h1>
      <div className="space-y-6">
        {selectedQuestions.map((q, index) => (
          <div key={q.id} className="border p-4 rounded bg-white shadow">
            <p className="font-semibold">{index + 1}. {q.text}</p>
            <ul className="list-disc ml-6 mt-2">
              {q.options.map((opt, idx) => (
                <li key={idx}>{opt}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Exams