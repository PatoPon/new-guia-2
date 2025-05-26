import { useState, useEffect } from 'react'

const Series = () => {
  const [series, setSeries] = useState([])
  const [novaSerie, setNovaSerie] = useState('')

  useEffect(() => {
    fetch('http://localhost:3001/api/series')
      .then(res => res.json())
      .then(setSeries)
  }, [])

  const handleAdicionarSerie = async () => {
    if (!novaSerie.trim()) return
    await fetch('http://localhost:3001/api/series', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: novaSerie })
    })
    setNovaSerie('')
    const res = await fetch('http://localhost:3001/api/series')
    const data = await res.json()
    setSeries(data)
  }

  const handleRemoverSerie = async (id) => {
    const confirm = window.confirm('Deseja remover esta série?')
    if (!confirm) return

    await fetch(`http://localhost:3001/api/series/${id}`, {
      method: 'DELETE'
    })
    // Atualiza lista localmente sem precisar buscar novamente
    setSeries(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cadastrar Séries</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleAdicionarSerie()
        }}
        className="flex gap-2 mb-4"
      >
        <input
          value={novaSerie}
          onChange={(e) => setNovaSerie(e.target.value)}
          placeholder="Ex: 5º ano"
          className="border p-2 rounded w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Adicionar
        </button>
      </form>

      <ul className="mt-4 list-disc pl-5">
        {series.map((s) => (
          <li key={s.id} className="flex justify-between items-center mb-1">
            <span>{s.nome}</span>
            <button
              onClick={() => handleRemoverSerie(s.id)}
              className="text-red-500 hover:text-red-700 ml-4"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Series