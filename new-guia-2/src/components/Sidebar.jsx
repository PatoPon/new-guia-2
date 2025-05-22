import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const { pathname } = useLocation()

  return (
    <aside className="w-64 bg-white shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Gerenciador</h2>
      <nav className="flex flex-col space-y-2">
        <Link to="/criar-questao" className={`p-2 rounded ${pathname === '/criar-questao' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
          Criar questão
        </Link>
        <Link to="/" className={`p-2 rounded ${pathname === '/' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
          Questões
        </Link>
        <Link to="/disciplinas-e-temas" className={`p-2 rounded ${pathname === '/disciplinas-e-temas' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
          Disciplinas e Temas
        </Link>
        <Link to="/provas" className={`p-2 rounded ${pathname === '/exams' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
          Provas
        </Link>
        <Link to="/series" className={`p-2 rounded ${pathname === '/series' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
          Séries
        </Link>
      </nav>
    </aside>
  )
}

export default Sidebar