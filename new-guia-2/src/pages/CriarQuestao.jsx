import { useState, useEffect } from 'react'

const storageKey = 'createQuestionFormData'

const CreateQuestion = () => {
  const loadFromStorage = () => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
    return null
  }
    
  const savedData = loadFromStorage()

  const [titulo, setTitulo] = useState(savedData?.titulo || '')
  const [enunciado, setEnunciado] = useState(savedData?.enunciado || '')
  const [alternativas, setAlternativas] = useState(savedData?.alternativas || ['', '', '', ''])
  const [alternativaCorreta, setAlternativaCorreta] = useState(savedData?.alternativaCorreta || '')
  const [serie, setSerie] = useState(savedData?.serie || '')
  const [disciplina, setDisciplina] = useState(savedData?.disciplina || '')
  const [tema, setTema] = useState(savedData?.tema || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const handleAlternativaChange = (index, value) => {
    const novasAlternativas = [...alternativas]
    novasAlternativas[index] = value
    setAlternativas(novasAlternativas)
  }

  useEffect(() => {
    const dataToSave = {
      titulo,
      enunciado,
      alternativas,
      alternativaCorreta,
      serie,
      disciplina,
      tema
    }
    localStorage.setItem(storageKey, JSON.stringify(dataToSave))
  }, [titulo, enunciado, alternativas, alternativaCorreta, serie, disciplina, tema])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    // Validação simples
    if (!titulo || !enunciado || alternativas.some(a => !a) || !alternativaCorreta) {
      setError('Preencha todos os campos corretamente')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('http://localhost:3001/api/questions',
         {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titulo,
          enunciado,
          alternativas: JSON.stringify(alternativas), // pois no seu banco é string JSON
          alternativa_correta: alternativaCorreta,
          serie,
          disciplina,
          tema
        })
      })

      if (!res.ok) throw new Error('Erro ao criar questão')

      localStorage.removeItem(storageKey)
      setSuccessMsg('Questão criada com sucesso!')
      setTitulo('')
      setEnunciado('')
      setAlternativas(['', '', '', ''])
      setAlternativaCorreta('')
      setSerie('')
      setDisciplina('')
      setTema('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">Criar Questão</h2>

      <label className="block mb-2">
        Título:
        <input
          type="text"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </label>

      <label className="block mb-2">
        Enunciado:
        <textarea
          value={enunciado}
          onChange={e => setEnunciado(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </label>

      <fieldset className="mb-4">
        <legend className="font-semibold mb-2">Alternativas:</legend>
        {alternativas.map((alt, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <span>{String.fromCharCode(65 + idx)})</span>
            <input
              type="text"
              value={alt}
              onChange={e => handleAlternativaChange(idx, e.target.value)}
              className="flex-grow p-2 border rounded"
              required
            />
          </div>
        ))}
      </fieldset>

      <label className="block mb-4">
        Alternativa Correta:
        <select
          value={alternativaCorreta}
          onChange={e => setAlternativaCorreta(e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Selecione a alternativa correta</option>
          {alternativas.map((alt, idx) => (
            <option key={idx} value={alt}>
              {String.fromCharCode(65 + idx)}) {alt}
            </option>
          ))}
        </select>
      </label>

      <label className="block mb-2">
        Série:
        <input
          type="text"
          value={serie}
          onChange={e => setSerie(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </label>

      <label className="block mb-2">
        Disciplina:
        <input
          type="text"
          value={disciplina}
          onChange={e => setDisciplina(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </label>

      <label className="block mb-4">
        Tema:
        <input
          type="text"
          value={tema}
          onChange={e => setTema(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </label>

      {error && <p className="text-red-600 mb-2">{error}</p>}
      {successMsg && <p className="text-green-600 mb-2">{successMsg}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Salvando...' : 'Salvar Questão'}
      </button>
    </form>
  )
}

export default CreateQuestion