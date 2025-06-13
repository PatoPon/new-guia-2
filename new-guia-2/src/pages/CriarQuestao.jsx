import { useState, useEffect } from 'react'
import ConfirmModal from '../components/ConfirmPop'
import WordEditor from '../components/WordEditor'

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
  const [alternativas, setAlternativas] = useState(savedData?.alternativas || ['', ''])
  const [alternativaCorreta, setAlternativaCorreta] = useState(savedData?.alternativaCorreta || '')
  const [serie, setSerie] = useState(savedData?.serie || '')
  const [disciplina, setDisciplina] = useState(savedData?.disciplina || '')
  const [tema, setTema] = useState(savedData?.tema || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [temasFiltrados, setTemasFiltrados] = useState([])
  const [successMsg, setSuccessMsg] = useState(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  const handleConfirmLimpar = () => {
    setTitulo('')
    setEnunciado('')
    setAlternativas(['', ''])
    setAlternativaCorreta('')
    setSerie('')
    setDisciplina('')
    setTema('')
    localStorage.removeItem(storageKey)
    setIsConfirmModalOpen(false)
  }


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
          fetch('http://103.199.187.204:3001/api/series'),
          fetch('http://103.199.187.204:3001/api/disciplinas'),
          fetch('http://103.199.187.204:3001/api/temas')
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
    if (!disciplina || !serie) {
      setTemasFiltrados([])
      return
    }

    const disciplinaSelecionada = listaDisciplinas.find(d => d.nome === disciplina)
    const serieSelecionada = listaSeries.find(s => s.nome === serie)

    const temasFiltrados = listaTemas.filter(t => 
      t.serie_id === serieSelecionada?.id &&
      t.disciplina_id === disciplinaSelecionada?.id
    )

    setTemasFiltrados(temasFiltrados)
  }, [disciplina, serie, listaTemas])


  const handleAlternativaChange = (index, value) => {
    const novasAlternativas = [...alternativas]
    novasAlternativas[index] = value
    if (!novasAlternativas.includes(alternativaCorreta)) {
      setAlternativaCorreta('')
    }
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
      const res = await fetch('http://103.199.187.204:3001/api/questions', {
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
      setAlternativas(['', ''])
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

        Enunciado:
        <WordEditor />

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
            {alternativas.length > 2 && (
              <button
                type="button"
                onClick={() => {
                  const novas = alternativas.filter((_, i) => i !== idx)
                  setAlternativas(novas)
                }}
                className="text-red-600 hover:underline"
              >
                Remover
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setAlternativas([...alternativas, ''])}
          className="mt-2 text-blue-600 underline"
        >
          + Adicionar alternativa
        </button>
      </fieldset>

      <label className="block mb-4">
        Alternativa Correta:
        <select value={alternativaCorreta} onChange={e => setAlternativaCorreta(e.target.value)} className="w-full p-2 border rounded">
          <option value="" disabled>Selecione</option>
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
          <option value="" disabled>Selecione a série</option>
          {listaSeries.map(s => (
            <option key={s.id} value={s.nome}>{s.nome}</option>
          ))}
        </select>
      </label>

      <label className="block mb-2">
        Disciplina:
        <select value={disciplina} onChange={e => setDisciplina(e.target.value)} className="w-full p-2 border rounded">
          <option value="" disabled>Selecione a disciplina</option>
          {listaDisciplinas.map(d => (
            <option key={d.id} value={d.nome}>{d.nome}</option>
          ))}
        </select>
      </label>

      <label className="block mb-4">
        Tema:
        <select value={tema} onChange={e => setTema(e.target.value)} className="w-full p-2 border rounded">
          <option value="" disabled>Selecione o tema</option>
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

      <button
        type="button"
        onClick={() => setIsConfirmModalOpen(true)}
        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 ml-2"
      >
        Limpar
      </button>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmLimpar}
        title="Limpar Formulário"
        desc="Você tem certeza que deseja limpar o formulário?"
      />
    </form>
  )
}

export default CreateQuestion
