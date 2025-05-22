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
  const [temasFiltrados, setTemasFiltrados] = useState([])
  const [successMsg, setSuccessMsg] = useState(null)

  // Novos estados para listas
  const [listaSeries, setListaSeries] = useState([])
  const [listaDisciplinas, setListaDisciplinas] = useState([])
  const [listaTemas, setListaTemas] = useState([])

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

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [resSeries, resDisciplinas, resTemas] = await Promise.all([
          fetch('http://localhost:3001/api/series'),
          fetch('http://localhost:3001/api/disciplinas'),
          fetch('http://localhost:3001/api/temas')
        ])

        const [dataSeries, dataDisciplinas, dataTemas] = await Promise.all([
          resSeries.json(),
          resDisciplinas.json(),
          resTemas.json()
        ])

        setListaSeries(dataSeries)
        setListaDisciplinas(dataDisciplinas)
        setListaTemas(dataTemas)
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      }
    }

    fetchDados()
  }, [])

  useEffect(() => {
    if (!disciplina) {
      setTemasFiltrados([])
      return
    }

    const temasRelacionados = listaTemas.filter(t => t.disciplina_id === listaDisciplinas.find(d => d.nome === disciplina)?.id)
    setTemasFiltrados(temasRelacionados)
  }, [disciplina, listaTemas])


  const handleAlternativaChange = (index, value) => {
    const novasAlternativas = [...alternativas]
    novasAlternativas[index] = value
    setAlternativas(novasAlternativas)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    if (!titulo || !enunciado || alternativas.some(a => !a) || !alternativaCorreta) {
      setError('Preencha todos os campos corretamente')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('http://localhost:3001/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          enunciado,
          alternativas: JSON.stringify(alternativas),
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
        <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full p-2 border rounded" />
      </label>

      <label className="block mb-2">
        Enunciado:
        <textarea value={enunciado} onChange={e => setEnunciado(e.target.value)} className="w-full p-2 border rounded" />
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
            />
          </div>
        ))}
      </fieldset>

      <label className="block mb-4">
        Alternativa Correta:
        <select value={alternativaCorreta} onChange={e => setAlternativaCorreta(e.target.value)} className="w-full p-2 border rounded">
          <option value="">Selecione</option>
          {alternativas.map((alt, idx) => (
            <option key={idx} value={alt}>
              {String.fromCharCode(65 + idx)}) {alt}
            </option>
          ))}
        </select>
      </label>

      <label className="block mb-2">
        Série:
        <select value={serie} onChange={e => setSerie(e.target.value)} className="w-full p-2 border rounded">
          <option value="">Selecione a série</option>
          {listaSeries.map(s => (
            <option key={s.id} value={s.nome}>{s.nome}</option>
          ))}
        </select>
      </label>

      <label className="block mb-2">
        Disciplina:
        <select value={disciplina} onChange={e => setDisciplina(e.target.value)} className="w-full p-2 border rounded">
          <option value="">Selecione a disciplina</option>
          {listaDisciplinas.map(d => (
            <option key={d.id} value={d.nome}>{d.nome}</option>
          ))}
        </select>
      </label>

      <label className="block mb-4">
        Tema:
        <select value={tema} onChange={e => setTema(e.target.value)} className="w-full p-2 border rounded">
          <option value="">Selecione o tema</option>
          {temasFiltrados.map(t => (
            <option key={t.id} value={t.nome}>{t.nome}</option>
          ))}
        </select>
      </label>

      {error && <p className="text-red-600 mb-2">{error}</p>}
      {successMsg && <p className="text-green-600 mb-2">{successMsg}</p>}

      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Salvando...' : 'Salvar Questão'}
      </button>
    </form>
  )
}

export default CreateQuestion
