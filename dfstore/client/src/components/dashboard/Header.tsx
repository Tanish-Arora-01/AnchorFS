import React from 'react'
import { Search, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme()

  return (

    
    <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800/50 px-6 py-4 shadow-sm dark:shadow-slate-900/50">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 shadow-inner dark:shadow-slate-900/50"
            />
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="ml-4 p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}