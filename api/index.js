import express from 'express'
import cors from 'cors'
import pool from './db.js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/questions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM questions LIMIT 100')
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar questões' })
  }
})

app.post('/api/questions', async (req, res) => {
  const {
    titulo,
    enunciado,
    alternativas,
    alternativa_correta,
    serie,
    disciplina,
    tema
  } = req.body

  if (
    !titulo || !enunciado || !alternativas || !alternativa_correta ||
    !serie || !disciplina || !tema
  ) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO questions (titulo, enunciado, alternativas, alternativa_correta, serie, disciplina, tema)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [titulo, enunciado, alternativas, alternativa_correta, serie, disciplina, tema]
    )

    res.status(201).json({ id: result.insertId, message: 'Questão criada com sucesso' })
  } catch (err) {
    console.error('Erro ao inserir questão:', err)
    res.status(500).json({ error: 'Erro ao criar questão' })
  }
})

app.delete('/api/questions/:id', async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await pool.query('DELETE FROM questions WHERE id = ?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Questão não encontrada' })
    }
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao deletar questão' })
  }
})

app.get('/api/disciplinas', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM disciplinas')
  res.json(rows)
})

app.get('/api/temas', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM temas')
  res.json(rows)
})

app.post('/api/disciplinas', async (req, res) => {
  const { nome } = req.body
  await pool.query('INSERT INTO disciplinas (nome) VALUES (?)', [nome])
  res.status(201).json({ message: "Created discipline" })
})

app.delete('/api/disciplinas/:id', async (req, res) => {
  const { id } = req.params

  try {
    const [discRows] = await pool.query('SELECT nome FROM disciplinas WHERE id = ?', [id])
    if (discRows.length === 0) {
      return res.status(404).json({ error: "Disciplina não encontrada" })
    }
    const nomeDisciplina = discRows[0].nome

    const [questoes] = await pool.query(
      'SELECT COUNT(*) AS total FROM questions WHERE disciplina = ?',
      [nomeDisciplina]
    )

    if (questoes[0].total > 0) {
      return res.status(400).json({ error: "Não é possível deletar: existem questões com esta disciplina." })
    }

    await pool.query('DELETE FROM disciplinas WHERE id = ?', [id])
    res.status(204).send()
  } catch (err) {
    console.error('Erro ao deletar disciplina:', err)
    res.status(500).json({ error: "Erro ao deletar disciplina" })
  }
})

app.post('/api/temas', async (req, res) => {
  const { nome, disciplina_id, serie_id } = req.body

  if (!nome || !disciplina_id || !serie_id) {
    return res.status(400).json({ error: "nome, disciplina_id e serie_id são obrigatórios" })
  }

  try {
    await pool.query(
      'INSERT INTO temas (nome, disciplina_id, serie_id) VALUES (?, ?, ?)',
      [nome, disciplina_id, serie_id]
    )
    res.status(201).json({ message: "Tema criado com sucesso" })
  } catch (err) {
    console.error('Erro ao adicionar tema:', err)
    res.status(500).json({ error: "Erro ao adicionar tema" })
  }
})

app.put('/api/temas/:id', async (req, res) => {
  const { id } = req.params
  const { nome } = req.body

  try {
    const [temaRows] = await pool.query('SELECT nome FROM temas WHERE id = ?', [id])
    if (temaRows.length === 0) {
      return res.status(404).json({ message: "Tema não encontrado" })
    }
    const nomeAntigo = temaRows[0].nome

    const result = await pool.query(
      'UPDATE temas SET nome = ? WHERE id = ?',
      [nome, id]
    )

    await pool.query(
      'UPDATE questions SET tema = ? WHERE tema = ?',
      [nome, nomeAntigo]
    )

    res.status(200).json({ message: "Tema e questões atualizados com sucesso" })
  } catch (error) {
    console.error('Erro ao atualizar tema:', error)
    res.status(500).json({ message: "Erro ao atualizar tema" })
  }
})

app.get('/api/temas/:disciplinaId', async (req, res) => {
  const { disciplinaId } = req.params
  const [rows] = await pool.query('SELECT * FROM temas WHERE disciplina_id = ?', [disciplinaId])
  res.json(rows)
})

app.delete('/api/temas/:id', async (req, res) => {
  const { id } = req.params

  try {
    const [temaRows] = await pool.query('SELECT nome FROM temas WHERE id = ?', [id])
    if (temaRows.length === 0) {
      return res.status(404).json({ error: "Tema não encontrado" })
    }
    const nomeTema = temaRows[0].nome

    const [questoes] = await pool.query(
      'SELECT COUNT(*) as total FROM questions WHERE tema = ?',
      [nomeTema]
    )

    if (questoes[0].total > 0) {
      return res.status(400).json({ error: "Não é possível deletar: existem questões com este tema." })
    }

    await pool.query('DELETE FROM temas WHERE id = ?', [id])
    res.status(204).send()
  } catch (err) {
    console.error('Erro ao deletar tema:', err)
    res.status(500).json({ error: "Erro ao deletar tema" })
  }
})

app.get('/api/series', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM series ORDER BY ordem ASC')
  res.json(rows)
})

app.post('/api/series/ordenar', async (req, res) => {
  const novaOrdem = req.body

  try {
    for (let i = 0; i < novaOrdem.length; i++) {
      const { id } = novaOrdem[i]
      await pool.query('UPDATE series SET ordem = ? WHERE id = ?', [i + 1, id])
    }
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/series', async (req, res) => {
  const { nome } = req.body
  if (!nome || nome.trim() === '') {
    return res.status(400).json({ error: 'Nome da série é obrigatório' })
  }

  try {
    // Para adicionar no final, buscamos o maior valor de ordem atual:
    const [[{ maxOrdem }]] = await pool.query('SELECT MAX(ordem) as maxOrdem FROM series')
    const novaOrdem = (maxOrdem || 0) + 1

    const [result] = await pool.query(
      'INSERT INTO series (nome, ordem) VALUES (?, ?)',
      [nome.trim(), novaOrdem]
    )

    // Retorna a série criada com id e ordem
    res.status(201).json({
      id: result.insertId,
      nome: nome.trim(),
      ordem: novaOrdem,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/series/:id', async (req, res) => {
  const { id } = req.params

  try {
    // Verifica se a série existe
    const [[serie]] = await pool.query('SELECT * FROM series WHERE id = ?', [id])
    if (!serie) {
      return res.status(404).json({ error: 'Série não encontrada' })
    }

    // Deleta a série
    await pool.query('DELETE FROM series WHERE id = ?', [id])

    res.status(200).json({ message: 'Série removida com sucesso' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})