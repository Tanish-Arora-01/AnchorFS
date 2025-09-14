import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useAuth } from '../../contexts/AuthContext'

interface AuthFormProps {
  mode: 'signin' | 'signup'
  onToggleMode: () => void
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (mode === 'signin') {
      const { error } = await signIn(email, password)
      if (error) setError(typeof error === 'object' && error && 'message' in error ? (error as any).message : String(error))
    } else {
      const { error, needsVerification } = await signUp(email, password)
      if (error) {
        setError(typeof error === 'object' && error && 'message' in error ? (error as any).message : String(error))
      } else if (needsVerification) {
        setInfo('Account created! Please check your email and confirm your address to complete registration.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-500 dark:to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.002 4.002 0 003 15z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {mode === 'signin' ? 'Sign in to your cloud storage' : 'Get started with your cloud storage'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-xs text-blue-600 dark:text-blue-400 focus:outline-none"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {mode === 'signup' && (
              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-xs text-blue-600 dark:text-blue-400 focus:outline-none"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {info && (
              <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-md text-sm">
                {info}
              </div>
            )}

            <Button
              type="submit"
              className="w-full hover:shadow-lg dark:hover:shadow-indigo-500/20"
              disabled={loading}
            >
              {loading ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={onToggleMode}
                className="ml-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}