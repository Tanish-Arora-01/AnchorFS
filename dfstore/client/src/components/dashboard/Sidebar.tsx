import React from 'react'
import { Cloud, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth()

  return (
  <div className="w-64 bg-gradient-to-b from-slate-900 to-indigo-950 h-screen flex flex-col shadow-lg rounded-tr-xl rounded-br-xl overflow-hidden">
      {/* Large Profile Avatar and Username with settings */}
      <div className="p-6 border-b border-slate-800/50 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center shadow-xl shadow-indigo-950/50">
              <User className="w-10 h-10 text-white/90" />
            </div>
            <div className="absolute -right-2 -bottom-2 bg-slate-800 rounded-full p-1 shadow-xl shadow-slate-950/50 border border-slate-700/50">
              <Settings className="w-4 h-4 text-slate-200" />
            </div>
          </div>
          <div>
            <h3 className="text-white/90 font-bold text-lg">
              {user?.email?.split('@')[0] || 'User'}
            </h3>
            <p className="text-indigo-300/80 text-xs">Premium Member</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div>
          <a className="flex items-center space-x-3 px-3 py-3 text-white/80 hover:text-white bg-slate-800/0 hover:bg-slate-800/50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
            <Cloud className="w-5 h-5 text-indigo-400" />
            <span className="font-medium">My Cloud</span>
          </a>
        </div>
      </nav>

      {/* Logout and Email */}
      <div className="p-4 border-t border-slate-800/50">
        <div className="mb-3 text-slate-300/80 text-xs truncate text-center">
          {user?.email}
        </div>
        <button
          onClick={signOut}
          className="flex items-center justify-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white bg-slate-800/0 hover:bg-slate-800/50 rounded-lg transition-all w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  )
}