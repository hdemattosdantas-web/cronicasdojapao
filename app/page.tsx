'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AuthButton from '@/components/auth/AuthButton'
import CharacterList from '@/components/game/CharacterList'
import { ensureUserProfile } from '@/lib/auth/profile'

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [characterName, setCharacterName] = useState('')
  const [characterAge, setCharacterAge] = useState('16')
  const [characterClan, setCharacterClan] = useState('oda')
  const [showCharacters, setShowCharacters] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Garantir que o perfil do usuário exista
      if (user) {
        await ensureUserProfile(user)
      }
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      
      // Garantir perfil quando usuário fizer login
      if (session?.user) {
        await ensureUserProfile(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const createCharacter = async () => {
    if (!user || !characterName.trim()) return

    // Garantir que o perfil exista antes de criar personagem
    await ensureUserProfile(user)

    const { error } = await supabase
      .from('characters')
      .insert({
        user_id: user.id,
        name: characterName,
        age: parseInt(characterAge),
        clan: characterClan,
      })

    if (error) {
      alert('Erro ao criar personagem: ' + error.message)
    } else {
      alert('Personagem criado com sucesso!')
      setCharacterName('')
      setShowCharacters(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-japan-cream">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="max-w-5xl w-full relative z-10">
          <div className="japan-card p-12 text-center">
            {/* Cabeçalho principal */}
            <div className="mb-8">
              <h1 className="text-6xl font-bold mb-4 japan-title">
                🏯 Crônicas do Japão
              </h1>
              <div className="samurai-divider"></div>
            </div>

            {/* Narrativa imersiva */}
            <div className="text-scene mb-16 max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-8 text-japan-gold">
                🌑 Um Japão esquecido observa você.
              </h2>
              <p className="text-xl mb-6 leading-relaxed">
                Nem todos os horrores vivem nos contos.
                Alguns caminham pelas estradas, se escondem nos templos
                e observam aqueles que ainda não despertaram.
              </p>
              <p className="text-xl mb-6 leading-relaxed">
                Crônicas do Japão é um RPG narrativo ambientado no período Sengoku,
                onde a vida cotidiana, o folclore e o sobrenatural se encontram em silêncio.
              </p>
              <p className="text-xl mb-8 leading-relaxed">
                Você começa como uma pessoa comum — camponês, mercador, monge, soldado — 
                sem saber que o mundo guarda algo além do visível.
                Conforme sua história se desenvolve, suas escolhas moldam seu corpo, sua mente e sua percepção do oculto…
                até o dia em que você não pode mais fingir que não vê.
              </p>
              <p className="text-2xl font-bold text-japan-gold">
                ⚔️ Escreva sua história. Viva. Desperte.
              </p>
            </div>

            {/* Seção informativa central */}
            <div className="character-status p-8 mb-16">
              <h3 className="text-2xl font-bold mb-6 text-japan-red">🕯️ O Que Aguarda</h3>
                
              <div className="mb-6">
                <h4 className="text-xl font-bold mb-3 text-japan-gold">🧭 Evolução Silenciosa</h4>
                <p className="text-base leading-relaxed text-japan-cream">
                  Nada acontece de uma vez. Cada decisão, rotina ou erro molda seu corpo, sua mente 
                  e aquilo que você será capaz de perceber.
                </p>
              </div>
                
              <div className="mb-6">
                <h4 className="text-xl font-bold mb-3 text-japan-gold">👤 Vidas Comuns</h4>
                <p className="text-base leading-relaxed text-japan-cream">
                  Você começa invisível para o mundo. Um rosto entre muitos. 
                  Nenhum destino escrito. Nenhuma proteção divina.
                </p>
              </div>
                
              <div>
                <h4 className="text-xl font-bold mb-3 text-japan-gold">⏳ O Peso do Tempo</h4>
                <p className="text-base leading-relaxed text-japan-cream">
                  Os anos passam. O corpo muda. Relações surgem e se desfazem.
                  Você pode deixar filhos, histórias... ou marcas que nunca desaparecem.
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="space-y-6 max-w-md mx-auto">
              <button 
                onClick={() => setGameStarted(true)}
                className="japan-button text-2xl px-16 py-8 w-full font-bold"
              >
                🚪 Entrar
              </button>
              
              <div className="samurai-divider"></div>
              
              <div className="text-base text-japan-cream opacity-80">
                🎌 Sistema de RPG de Vida • Japão Sengoku • Progressão Orgânica
              </div>
              <div className="text-sm text-japan-cream opacity-60">
                🌟 "O mundo não gira ao seu redor"
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showCharacters) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <div className="japan-border p-6 bg-japan-black mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-japan-red">
                Crônicas do Japão
              </h1>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCharacters(false)}
                  className="japan-button"
                >
                  Novo Personagem
                </button>
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="text-sm text-japan-cream hover:text-japan-gold transition-colors"
                >
                  Sair ({user.email})
                </button>
              </div>
            </div>
          </div>
          <CharacterList userId={user.id} />
        </div>
      </div>
    )
  }

  if (gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="japan-card p-8 bg-japan-black">
            <h1 className="text-3xl font-bold text-center mb-8 text-japan-red">
              Crônicas do Japão
            </h1>
            
            <div className="text-scene mb-8">
              <p className="mb-4">
                Ano de 1467. O Japão está mergulhado na Era Sengoku - o Período dos Estados em Guerra. 
                A vida cotidiana, o folclore e o sobrenatural se encontram em silêncio.
              </p>
              <p className="mb-4">
                Bem-vindo, {user?.email || 'viajante'}! Sua jornada está prestes a começar...
              </p>
            </div>

            <div className="character-status">
              <h2 className="text-xl font-bold mb-4 text-japan-gold">Criação de Personagem</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome:</label>
                  <input 
                    type="text" 
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    className="w-full p-2 japan-input text-japan-cream"
                    placeholder="Digite seu nome..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Idade:</label>
                  <select 
                    value={characterAge}
                    onChange={(e) => setCharacterAge(e.target.value)}
                    className="w-full p-2 japan-input text-japan-cream"
                  >
                    <option value="16">16 anos</option>
                    <option value="18">18 anos</option>
                    <option value="20">20 anos</option>
                    <option value="25">25 anos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Origem:</label>
                  <select 
                    value={characterClan}
                    onChange={(e) => setCharacterClan(e.target.value)}
                    className="w-full p-2 japan-input text-japan-cream"
                  >
                    <option value="owari">Owari - Planícies Centrais</option>
                    <option value="kai">Kai - Montanhas</option>
                    <option value="shinano">Shinano - Interior</option>
                    <option value="mino">Mino - Vale</option>
                    <option value="musashi">Musashi - Capital</option>
                    <option value="echigo">Echigo - Norte</option>
                  </select>
                </div>
                <button 
                  onClick={createCharacter}
                  className="japan-button w-full"
                >
                  Criar Personagem
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="japan-border p-8 bg-japan-black text-center">
          <h1 className="text-5xl font-bold mb-4 text-japan-red">
            🏯 Crônicas do Japão
          </h1>
          <p className="text-xl mb-8 text-japan-cream">
            RPG de Vida • Japão Sengoku
          </p>
          <div className="text-scene mb-8">
            <p className="mb-4">
              Bem-vindo ao Japão feudal, onde samurais, honra e destino se encontram.
            </p>
            <p>
              Viva uma vida completa no período mais turbulento da história japonesa.
            </p>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => setGameStarted(true)}
              className="japan-button text-lg px-8 py-4 w-full"
            >
              🚪 Começar Aventura
            </button>
            <button 
              onClick={() => setShowCharacters(true)}
              className="japan-button text-lg px-8 py-4 w-full"
            >
              👥 Meus Personagens
            </button>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="w-full text-sm text-japan-cream hover:text-japan-gold transition-colors"
            >
              Sair ({user.email})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
