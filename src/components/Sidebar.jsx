import { NavLink } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="w-48 bg-white bg-opacity-80 backdrop-blur-sm shadow-lg hidden md:block">
      <div className="p-4 sticky top-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">AQUA</h1>
          <h2 className="text-xl font-bold text-gray-800">ALIGNED</h2>
          <div className="mt-2 h-24 overflow-hidden rounded-lg">
          </div>
        </div>
        
        <nav className="mt-8 space-y-2">
          <NavLink 
            to="/dashboard" 
            className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
            end
          >
            <div className="w-8 h-8 rounded-full border-2 border-gray-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <span>Home</span>
          </NavLink>
          
          <NavLink 
            to="/logs" 
            className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <div className="w-8 h-8 rounded-full border-2 border-gray-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
            <span>Logs</span>
          </NavLink>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar