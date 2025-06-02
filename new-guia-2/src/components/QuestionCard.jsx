const QuestionCard = ({ question, selected, onSelect, onDelete }) => {
  // Parseia as alternativas que estão em string para array
  let alternativasArray = [];

  try {
    const parsed = JSON.parse(question?.alternativas ?? '[]');
    alternativasArray = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    alternativasArray = [];
  }

  return (
    <div className={`p-4 border rounded shadow-sm ${selected ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-xl">{question.titulo}</h3>
        <button
          onClick={() => onDelete(question.id)}
          className="text-red-500 hover:text-red-700 font-bold"
        >
          X
        </button>
      </div>
      <p className="font-medium">Enunciado:</p>
      <div
        className="[&_img]:block [&_img]:max-w-full [&_img]:h-auto"
        dangerouslySetInnerHTML={{ __html: question.enunciado }}
      />
      <ul className="text-sm list-disc mt-2 text-gray-700">
        <ul className="list-none p-0 m-0 text-sm mt-2 text-gray-700">
          <ul className="list-none p-0 m-0 text-sm mt-2 text-gray-700">
            {alternativasArray.length > 0 ? (
              alternativasArray.map((opt, idx) => (
                <li
                  key={idx}
                  className={`flex items-start gap-2 ${opt === question.alternativa_correta ? 'text-green-600 font-semibold' : ''}`}
                >
                  <span className="font-bold">{String.fromCharCode(65 + idx)})</span>
                  <span>{opt}</span>
                  {opt === question.alternativa_correta && (
                    <span className="-ml-0.5 -mt-0.5 text-green-600 font-bold">✔</span>
                  )}
                </li>
              ))
            ) : question.gabarito ? (
              <li>
                <span className="font-bold text-green-600">Gabarito:</span>{' '}
                <span className="text-gray-700">{question.gabarito}</span>
              </li>
            ) : (
              <li>Sem opções disponíveis</li>
            )}
          </ul>
          <li className="mt-2">
            <span className="font-bold">Série:</span> {question.serie}
          </li>
          <li>
            <span className="font-bold">Disciplina:</span> {question.disciplina}
          </li>
          <li>
            <span className="font-bold">Tema:</span> {question.tema}
          </li>
        </ul>
      </ul>
      <button onClick={onSelect} className="mt-4 text-sm text-blue-600 hover:underline">
        {selected ? 'Remover da prova' : 'Adicionar à prova'}
      </button>
    </div>
  )
}

export default QuestionCard
