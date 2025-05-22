import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Questions from './pages/Questions'
import Exams from './pages/Exams'
import CreateQuestion from './pages/CriarQuestao'
import DisciplinasETemas from './pages/DisciplinasTemas'
import Series from './pages/Series'

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Questions />} />
            <Route path="/criar-questao" element={<CreateQuestion />} />
            <Route path="/disciplinas-e-temas" element={<DisciplinasETemas />} />
            <Route path="/provas" element={<Exams />} />
            <Route path="/series" element={<Series />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App