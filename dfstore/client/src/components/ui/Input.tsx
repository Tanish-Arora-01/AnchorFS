import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
      )}
    </div>
  )
}