'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthButton() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || email.split('@')[0],
              full_name: fullName || username || email.split('@')[0]
            }
          }
        })
        if (error) throw error
        alert('Verifique seu email para confirmar o cadastro!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="japan-border p-4 bg-japan-black">
      <form onSubmit={handleAuth} className="space-y-4">
        <h3 className="text-lg font-bold text-japan-red">
          {isSignUp ? 'Criar Conta' : 'Entrar'}
        </h3>
        
        {isSignUp && (
          <>
            <input
              type="text"
              placeholder="Nome de usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 japan-input text-japan-cream"
              required={isSignUp}
            />
            <input
              type="text"
              placeholder="Nome completo (opcional)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 japan-input text-japan-cream"
            />
          </>
        )}
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 japan-input text-japan-cream"
          required
        />
        
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 japan-input text-japan-cream"
          required
        />
        
        <button
          type="submit"
          disabled={loading}
          className="japan-button w-full"
        >
          {loading ? 'Carregando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
        </button>
        
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-sm text-japan-cream hover:text-japan-gold transition-colors"
        >
          {isSignUp ? 'Já tem uma conta? Entre' : 'Não tem uma conta? Cadastre-se'}
        </button>
      </form>
    </div>
  )
}
