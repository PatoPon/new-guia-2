import express from 'express'
import cors from 'cors'
import pool from './db.js'
import dotenv from 'dotenv'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { exec } from 'child_process';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const upload = multer({ dest: 'uploads/' });
const outputDir = path.join(__dirname, 'converted');

dotenv.config()

const app = express()
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));
app.use('/converted', express.static(path.resolve('converted')));
app.use(express.json({ limit: '50mb' }));       // aumenta o limite para 50MB
app.use(express.urlencoded({ limit: '50mb', extended: true }));

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

function limparPasta(pasta) {
    if (fs.existsSync(pasta)) {
      const arquivos = fs.readdirSync(pasta)
      for (const arquivo of arquivos) {
        const caminhoCompleto = path.join(pasta, arquivo)
        const stats = fs.statSync(caminhoCompleto)
        if (stats.isFile()) {
          fs.unlinkSync(caminhoCompleto)  // deleta arquivo
        } else if (stats.isDirectory()) {
          fs.rmSync(caminhoCompleto, { recursive: true, force: true }) // deleta pasta recursivamente
        }
      }
    }
  }

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Nenhum arquivo enviado.');
  }

  const arquivoDocx = req.file.path;
  const pastaDestino = path.resolve('converted');

  if (!fs.existsSync(pastaDestino)) {
    fs.mkdirSync(pastaDestino);
  }

  const comando = `soffice --headless --convert-to html:"HTML (StarWriter)" "${arquivoDocx}" --outdir "${pastaDestino}"`;

  exec(comando, (error, stdout, stderr) => {
    if (error) {
      console.error('Erro na conversão:', error);
      return res.status(500).send('Erro ao converter o arquivo.');
    }

    // Lista arquivos da pasta converted para pegar o nome gerado
    fs.readdir(pastaDestino, (err, files) => {
      if (err) {
        console.error('Erro lendo pasta converted:', err);
        return res.status(500).send('Erro ao acessar pasta converted.');
      }

      const nomeArquivoSemExt = path.parse(arquivoDocx).name;

      if (!nomeArquivoSemExt) {
        return res.status(500).send('Arquivo convertido não encontrado na pasta converted.');
      }

      const caminhoHtml = path.join(pastaDestino, `${nomeArquivoSemExt}.html`);

      // Lê o conteúdo do arquivo convertido
      fs.readFile(caminhoHtml, 'utf8', (err, data) => {
        if (err) {
          console.error('Erro ao ler o HTML convertido:', err);
          return res.status(500).send('Erro ao ler o arquivo convertido.');
        }

        // Reescreve os caminhos das imagens no HTML para o caminho público correto
        let servidor = process.env.SERVER_URL || 'http://103.199.187.204:3001';
        const dataComCaminhoCorrigido = data.replace(
          /src="([^"]+)"/g,
          (match, srcPath) => {
            if (!srcPath.startsWith('http') && !srcPath.startsWith('/')) {
              return `src="${servidor}/converted/${srcPath}"`;
            }
            console.log(`srcPath: ${srcPath}`);
            console.log('match:', match);
            // Se o srcPath já é um caminho absoluto ou relativo, não altera
            return match;
          }
        );

        res.send(dataComCaminhoCorrigido);
      });
    });
  });
});

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
    gabarito,
    tipo,
    serie,
    disciplina,
    tema
  } = req.body

  let realSerie;

  if (typeof serie === 'string' && /^\d+$/.test(serie.trim())) {
    realSerie = `${serie.trim()}° ANO`
  } else if (typeof serie === 'number') {
    realSerie = `${serie}° ANO`
  }


  if (!titulo || !enunciado || !tipo || !serie || !disciplina || !tema) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' })
  }

  if (tipo === 'objetiva') {
    if (!alternativas || !alternativa_correta) {
      return res.status(400).json({ error: 'Alternativas e alternativa correta são obrigatórias para questões objetivas' })
    }
  } else if (tipo === 'discursiva') {
    if (!gabarito) {
      return res.status(400).json({ error: 'Gabarito é obrigatório para questões discursivas' })
    }
  } else {
    return res.status(400).json({ error: 'Tipo de questão inválido' })
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO questions (titulo, enunciado, alternativas, alternativa_correta, gabarito, tipo, serie, disciplina, tema)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        enunciado,
        tipo === 'objetiva' ? JSON.stringify(alternativas) : null,
        tipo === 'objetiva' ? alternativa_correta : null,
        tipo === 'discursiva' ? gabarito : null,
        tipo,
        realSerie,
        disciplina,
        tema
      ]
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
    const [[{ maxOrdem }]] = await pool.query('SELECT MAX(ordem) as maxOrdem FROM series')
    const novaOrdem = (maxOrdem || 0) + 1

    const [result] = await pool.query(
      'INSERT INTO series (nome, ordem) VALUES (?, ?)',
      [nome.trim(), novaOrdem]
    )

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
    const [[serie]] = await pool.query('SELECT * FROM series WHERE id = ?', [id])
    if (!serie) {
      return res.status(404).json({ error: 'Série não encontrada' })
    }

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