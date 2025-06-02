const { Editor } = require('@tiptap/core')
const StarterKit = require('@tiptap/starter-kit').default
const Image = require('@tiptap/extension-image').default
const Bold = require('@tiptap/extension-bold').default
const Italic = require('@tiptap/extension-italic').default
const Underline = require('@tiptap/extension-underline').default
const Strike = require('@tiptap/extension-strike').default
const Heading = require('@tiptap/extension-heading').default
const BulletList = require('@tiptap/extension-bullet-list').default
const OrderedList = require('@tiptap/extension-ordered-list').default
const ListItem = require('@tiptap/extension-list-item').default
const History = require('@tiptap/extension-history').default
const TextStyle = require('@tiptap/extension-text-style').default
const TextAlign = require('@tiptap/extension-text-align').default
const Color = require('@tiptap/extension-color').default
const Highlight = require('@tiptap/extension-highlight').default
const Table = require('@tiptap/extension-table').default
const TableRow = require('@tiptap/extension-table-row').default
const TableCell = require('@tiptap/extension-table-cell').default
const TableHeader = require('@tiptap/extension-table-header').default

const RectangleShape = require('./Rectangle')

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...TableCell.config.addAttributes(), // pega todos os atributos originais
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          return {
            style: attributes.style || null,
          }
        },
      },
    }
  },
})

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent(),
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          return {
            style: attributes.style,
          }
        },
      },
    }
  },
})

const CustomParagraph = require('@tiptap/extension-paragraph').default.extend({
  addAttributes() {
    return {
      ...this.parent?.addAttributes?.(),
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          return {
            style: attributes.style,
          }
        },
      },
    }
  },
})


// Cria o editor com as extensões para formatação estilo Word
const editor = new Editor({
  element: document.querySelector('#editor'),
  extensions: [
    StarterKit.configure({
      paragraph: false,
      history: false,
      heading: false,
      bold: false,
      italic: false,
      strike: false,
      listItem: false,
      bulletList: false,
      orderedList: false,
    }),
    RectangleShape,
    CustomImage,
    Bold,
    Italic,
    Underline,
    Strike,
    Heading.configure({ levels: [1, 2] }),
    BulletList,
    OrderedList,
    ListItem,
    History,
    TextStyle,
    Color,
    Highlight,
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    CustomTableCell,
    CustomParagraph,
    TextAlign.configure({
        types: ['heading', 'paragraph', 'listItem', 'customParagraph'], // aplique para os tipos desejados
    }),
  ],
  content: '<p> </p>',
  editorProps: {
    attributes: {
      class: 'ProseMirror',
      spellcheck: 'true',
      tabindex: '0',
      style: 'white-space pre-wrap'
    },
    transformPastedHTML: html => html
  }
})

// Função para atualizar o estado dos botões da toolbar
function updateToolbar() {
  const buttons = [
    { id: 'boldBtn', command: () => editor.isActive('bold') },
    { id: 'italicBtn', command: () => editor.isActive('italic') },
    { id: 'underlineBtn', command: () => editor.isActive('underline') },
    { id: 'strikeBtn', command: () => editor.isActive('strike') },
    { id: 'bulletListBtn', command: () => editor.isActive('bulletList') },
    { id: 'orderedListBtn', command: () => editor.isActive('orderedList') },
    { id: 'heading1Btn', command: () => editor.isActive('heading', { level: 1 }) },
    { id: 'heading2Btn', command: () => editor.isActive('heading', { level: 2 }) },
  ]

  buttons.forEach(({ id, command }) => {
    const btn = document.getElementById(id)
    if (command()) {
      btn.classList.add('is-active')
    } else {
      btn.classList.remove('is-active')
    }
  })
}

editor.on('update', updateToolbar)
editor.on('selectionUpdate', updateToolbar)

document.getElementById('boldBtn').addEventListener('click', () => {
  editor.chain().focus().toggleBold().run()
})
document.getElementById('italicBtn').addEventListener('click', () => {
  editor.chain().focus().toggleItalic().run()
})
document.getElementById('underlineBtn').addEventListener('click', () => {
  editor.chain().focus().toggleUnderline().run()
})
document.getElementById('strikeBtn').addEventListener('click', () => {
  editor.chain().focus().toggleStrike().run()
})
document.getElementById('bulletListBtn').addEventListener('click', () => {
  editor.chain().focus().toggleBulletList().run()
})
document.getElementById('orderedListBtn').addEventListener('click', () => {
  editor.chain().focus().toggleOrderedList().run()
})
document.getElementById('heading1Btn').addEventListener('click', () => {
  editor.chain().focus().toggleHeading({ level: 1 }).run()
})
document.getElementById('heading2Btn').addEventListener('click', () => {
  editor.chain().focus().toggleHeading({ level: 2 }).run()
})
document.getElementById('undoBtn').addEventListener('click', () => {
  editor.chain().focus().undo().run()
})
document.getElementById('redoBtn').addEventListener('click', () => {
  editor.chain().focus().redo().run()
})

document.getElementById('alignLeftBtn').addEventListener('click', () => {
  editor.chain().focus().setTextAlign('left').run()
})

document.getElementById('alignCenterBtn').addEventListener('click', () => {
  editor.chain().focus().setTextAlign('center').run()
})

document.getElementById('alignRightBtn').addEventListener('click', () => {
  editor.chain().focus().setTextAlign('right').run()
})
document.getElementById('alignJustifyBtn').addEventListener('click', () => {
  editor.chain().focus().setTextAlign('justify').run()
})
document.getElementById('insertRectangleBtn').addEventListener('click', () => {
  editor.chain().focus().insertContent({
    type: 'rectangleShape',
  }).run()
})

const fieldsetAlternativas = document.getElementById('fieldsetAlternativas')
const btnAddAlternativa = document.getElementById('btnAddAlternativa')
const selectAlternativaCorreta = document.getElementById('selectAlternativaCorreta')

let alternativas = []
let alternativaCorreta = ''

function renderAlternativas() {
  fieldsetAlternativas.innerHTML = `
    <legend class="font-semibold mb-2">Alternativas:</legend>
  `

  alternativas.forEach((texto, idx) => {
    const alternativaDiv = document.createElement('div')
    alternativaDiv.className = 'flex items-center gap-2 mb-2'

    let html = `
      <span>${String.fromCharCode(65 + idx)})</span>
      <input
        type="text"
        value="${texto}"
        data-idx="${idx}"
        class="flex-grow p-2 border rounded"
      />
    `
    if (alternativas.length > 2) {
      html += `
        <button
          type="button"
          class="text-red-600 hover:underline"
          data-remove="${idx}"
        >
          Remover
        </button>
      `
    }

    alternativaDiv.innerHTML = html
    fieldsetAlternativas.appendChild(alternativaDiv)
  })

  updateSelectAlternativas()

  document.querySelectorAll('input[data-idx]').forEach(input => {
    input.addEventListener('input', e => {
      const i = parseInt(e.target.dataset.idx)
      alternativas[i] = e.target.value
      updateSelectAlternativas()
    })
  })

  document.querySelectorAll('button[data-remove]').forEach(button => {
    button.addEventListener('click', e => {
      if (alternativas.length <= 2) return
      const i = parseInt(e.target.dataset.remove)
      alternativas.splice(i, 1)

      if (alternativaCorreta === String.fromCharCode(65 + i)) {
        alternativaCorreta = ''
      }

      renderAlternativas()
    })
  })
}

function updateSelectAlternativas() {
  selectAlternativaCorreta.innerHTML = '<option value="" disabled>Selecione</option>'

  alternativas.forEach((texto, idx) => {
    const letra = String.fromCharCode(65 + idx)
    const option = document.createElement('option')
    option.value = letra
    option.textContent = `${letra}) ${texto}`
    if (letra === alternativaCorreta) option.selected = true
    selectAlternativaCorreta.appendChild(option)
  })
}

function initAlternativas() {
  alternativas = ['', '']
  renderAlternativas()
}

selectAlternativaCorreta.addEventListener('change', e => {
  alternativaCorreta = selectAlternativaCorreta.value
})

btnAddAlternativa.addEventListener('click', () => {
  alternativas.push('')
  renderAlternativas()
})

initAlternativas()

let listaSeries = [];
let listaDisciplinas = [];
let listaTemas = [];

async function carregarDados() {
  try {
    const [resSeries, resDisciplinas, resTemas] = await Promise.all([
      fetch('http://localhost:3001/api/series'),
      fetch('http://localhost:3001/api/disciplinas'),
      fetch('http://localhost:3001/api/temas')
    ]);

    listaSeries = await resSeries.json();
    listaDisciplinas = await resDisciplinas.json();
    listaTemas = await resTemas.json();

    preencherSelect('selectSerie', listaSeries);

  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
}

function preencherSelect(id, dados) {
  const select = document.getElementById(id);
  select.querySelectorAll('option:not(:first-child)').forEach(o => o.remove());

  dados.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.nome;
    opt.textContent = item.nome;
    select.appendChild(opt);
  });

  select.disabled = dados.length === 0;
}

function atualizarDisciplinas() {
  const disciplinasFiltradas = listaDisciplinas;

  preencherSelect('selectDisciplina', disciplinasFiltradas);
  document.getElementById('selectTema').innerHTML = `<option value="" disabled selected>Selecione o tema</option>`;
  document.getElementById('selectTema').disabled = true;
}

function atualizarTemas() {
  const serie = document.getElementById('selectSerie').value;
  const disciplina = document.getElementById('selectDisciplina').value;

  let serieId, disciplinaId;

  if (listaSeries) {
    const serieObj = listaSeries.find(s => s.nome === serie);
    serieId = serieObj?.id;
  }

  if (listaDisciplinas) {
    const disciplinaObj = listaDisciplinas.find(d => d.nome === disciplina);
    disciplinaId = disciplinaObj?.id;
  }

  if (serieId && disciplinaId) {
    const temasFiltrados = listaTemas.filter(t => t.serie_id === serieId && t.disciplina_id === disciplinaId);
    preencherSelect('selectTema', temasFiltrados);
  }
}

document.getElementById('selectSerie').addEventListener('change', atualizarDisciplinas);
document.getElementById('selectDisciplina').addEventListener('change', atualizarTemas);

window.addEventListener('DOMContentLoaded', carregarDados);

const btnDiscursiva = document.getElementById('mudarDiscursiva');
const btnObjetiva = document.getElementById('mudarObjetiva');
const containerObjetiva = document.getElementById('containerObjetiva');
const containerDiscursiva = document.getElementById('containerDiscursiva');

let tipoQuestao = 'objetiva';

btnDiscursiva.addEventListener('click', () => {
  tipoQuestao = 'discursiva';
  containerObjetiva.classList.add('hidden');
  containerDiscursiva.classList.remove('hidden');
  fieldsetAlternativas.classList.add('hidden');
  btnAddAlternativa.classList.add('hidden');
});

btnObjetiva.addEventListener('click', () => {
  tipoQuestao = 'objetiva';
  containerObjetiva.classList.remove('hidden');
  containerDiscursiva.classList.add('hidden');
  fieldsetAlternativas.classList.remove('hidden');
  btnAddAlternativa.classList.remove('hidden');
});

btnEnviar.addEventListener('click', async () => {
  const titulo = document.getElementById('inputTitulo').value.trim();
  const enunciado = document.getElementById('editor').innerHTML.trim();
  const serie = selectSerie.value;
  const disciplina = selectDisciplina.value;
  const tema = selectTema.value;

  if (!titulo) return alert('Preencha o título');
  if (!enunciado) return alert('Preencha o enunciado');
  if ((alternativas.length < 2 || alternativas.some(a => !a.trim())) && tipoQuestao === "objetiva" ) return alert('Preencha ao menos 2 alternativas válidas');
  if (!alternativaCorreta && tipoQuestao === "objetiva") return alert('Selecione a alternativa correta');
  if (!serie || !disciplina || !tema) return alert('Selecione série, disciplina e tema');

  let bodyToSend = {
    titulo,
    enunciado,
    serie,
    disciplina,
    tema,
    tipo: tipoQuestao,
  };

  if (tipoQuestao === 'objetiva') {
    if (alternativas.length < 2 || alternativas.some(a => !a.trim())) {
      return alert('Preencha ao menos 2 alternativas válidas');
    }
    if (!alternativaCorreta) {
      return alert('Selecione a alternativa correta');
    }

    bodyToSend.alternativas = JSON.stringify(alternativas);
    bodyToSend.alternativa_correta = alternativaCorreta;
  } else if (tipoQuestao === 'discursiva') {
    const gabarito = document.getElementById('gabaritoDiscursiva').value.trim();
    if (!gabarito) return alert('Preencha o gabarito da questão discursiva');
    bodyToSend.gabarito = gabarito;
  }

  try {
    const res = await fetch('http://localhost:3001/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyToSend),
    });

    const data = await res.json();
    if (res.ok) {
      alert('Questão criada com sucesso! ID: ' + data.id);
    } else {
      alert('Erro: ' + data.error);
    }
  } catch (error) {
    alert('Erro ao enviar a questão.');
    console.error(error);
  }
});

editor.view.dom.addEventListener('paste', (event) => {
  const clipboardData = event.clipboardData || window.clipboardData
  const htmlData = clipboardData.getData('text/html')

  if (htmlData) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlData, 'text/html')
    const imgs = doc.querySelectorAll('img')

    if (imgs.length) {
      event.preventDefault()
      imgs.forEach(img => {
        const src = img.src
        const style = img.getAttribute('style') || ''

        if (src) {
          editor.chain().focus().insertContent({
            type: 'image',
            attrs: {
              src,
              style,
            },
          }).run()
        }
      })
      return
    }
  }
})

const form = document.getElementById('uploadForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const res = await fetch('http://localhost:3001/upload', {
      method: 'POST',
      body: formData
    });

    const html = await res.text();
    document.getElementById('preview').textContent = "Questão enviada!";
});