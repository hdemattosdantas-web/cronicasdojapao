'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AuthButton from '@/components/auth/AuthButton'
import CharacterList from '@/components/game/CharacterList'
import FriendsList from '@/components/friends/FriendsList'
import GameMap from '@/components/game/GameMap'
import CustomButton from '@/components/ui/CustomButton'
import { ensureUserProfile } from '@/lib/auth/profile'

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [characterName, setCharacterName] = useState('')
  const [characterAge, setCharacterAge] = useState(18)
  const [characterProfession, setCharacterProfession] = useState('ferreiro')
  const [characterClan, setCharacterClan] = useState('owari')
  const [characterReason, setCharacterReason] = useState('')
  const [showCharacters, setShowCharacters] = useState(false)
  const [showFriends, setShowFriends] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null)

  // Função para calcular stats baseados na idade e profissão
  const calculateStats = (age: number, profession: string) => {
    const baseStats = {
      strength: 10,
      agility: 10,
      intelligence: 10,
      charisma: 10
    }
    
    // Influência da idade
    if (age < 25) {
      baseStats.agility += 2
      baseStats.strength += 1
    } else if (age < 40) {
      baseStats.strength += 3
      baseStats.charisma += 1
    } else if (age < 55) {
      baseStats.intelligence += 2
      baseStats.charisma += 2
    } else {
      baseStats.intelligence += 3
      baseStats.charisma += 1
    }
    
    // Influência da profissão
    switch (profession) {
      case 'ferreiro':
        baseStats.strength += 2
        baseStats.intelligence += 1
        break
      case 'campones':
        baseStats.strength += 1
        baseStats.agility += 1
        break
      case 'mensageiro':
        baseStats.agility += 3
        baseStats.charisma += 1
        break
      case 'monge_novico':
        baseStats.intelligence += 2
        baseStats.charisma += 1
        break
      case 'ronin':
        baseStats.strength += 2
        baseStats.agility += 2
        baseStats.charisma -= 1
        break
      case 'artesao':
        baseStats.intelligence += 2
        baseStats.agility += 1
        break
      case 'comerciante':
        baseStats.charisma += 3
        baseStats.intelligence += 1
        break
    }
    
    // Garantir valores mínimos e máximos
    return {
      strength: Math.max(5, Math.min(20, baseStats.strength)),
      agility: Math.max(5, Math.min(20, baseStats.agility)),
      intelligence: Math.max(5, Math.min(20, baseStats.intelligence)),
      charisma: Math.max(5, Math.min(20, baseStats.charisma))
    }
  }

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
        age: 16, // Idade fixa para humanos comuns
        clan: characterClan, // Origem/província
        profession: characterAge, // Profissão atual
        travel_reason: characterReason, // Motivo da viagem
        current_location: 'Vila de origem', // Localização inicial
        is_alive: true,
        honor: 50, // Valor neutro para humanos comuns
        created_at: new Date().toISOString()
      })

    if (error) {
      alert('Erro ao criar personagem: ' + error.message)
    } else {
      alert('Personagem criado com sucesso!')
      // Resetar formulário
      setCharacterName('')
      setCharacterAge(18)
      setCharacterProfession('ferreiro')
      setCharacterClan('owari')
      setCharacterReason('')
      // Ir para lista de personagens
      setShowCharacters(true)
      setGameStarted(false)
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
              <CustomButton
                onClick={() => {
                  console.log('Botão Entrar clicado');
                  setGameStarted(true);
                }}
                className="text-2xl px-16 py-8 w-full font-bold"
              >
                🚪 Entrar
              </CustomButton>
              
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

  if (showFriends) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <div className="japan-card p-6 mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-japan-red">
                👥 Amigos
              </h1>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowFriends(false)}
                  className="japan-button"
                >
                  Voltar
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
          <FriendsList userId={user.id} />
        </div>
      </div>
    )
  }

  if (showMap && selectedCharacter) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <div className="japan-card p-6 mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-japan-red">
                🗺️ Mapa - {selectedCharacter.name}
              </h1>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowMap(false)}
                  className="japan-button"
                >
                  Voltar
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
          <GameMap characterId={selectedCharacter.id} />
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
                  <label className="block text-sm font-medium mb-2">Idade (18+ anos):</label>
                  <input 
                    type="number"
                    min="18"
                    max="80"
                    value={characterAge}
                    onChange={(e) => setCharacterAge(parseInt(e.target.value) || 18)}
                    className="w-full p-2 japan-input text-japan-cream"
                    placeholder="18"
                  />
                  <div className="text-xs text-japan-cream opacity-70 mt-1">
                    A idade influencia seus atributos físicos e mentais
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Origem (Província):</label>
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

                <div>
                  <label className="block text-sm font-medium mb-2">Profissão:</label>
                  <select 
                    value={characterProfession}
                    onChange={(e) => setCharacterProfession(e.target.value)}
                    className="w-full p-2 japan-input text-japan-cream"
                  >
                    <option value="ferreiro">Ferreiro</option>
                    <option value="campones">Camponês</option>
                    <option value="mensageiro">Mensageiro</option>
                    <option value="monge_novico">Monge Noviço</option>
                    <option value="ronin">Ronin</option>
                    <option value="artesao">Artesão</option>
                    <option value="comerciante">Comerciante</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Motivo da Viagem:</label>
                  <textarea 
                    value={characterReason}
                    onChange={(e) => setCharacterReason(e.target.value)}
                    className="w-full p-2 japan-input text-japan-cream h-24"
                    placeholder="Por que você deixou sua terra natal? O que te traz a esta jornada?"
                  />
                  <div className="text-xs text-japan-cream opacity-70 mt-1">
                    Sua história define quem você é e influencia suas habilidades
                  </div>
                </div>

                {/* Preview de Stats */}
                <div className="p-3 bg-japan-black rounded">
                  <h3 className="text-sm font-bold mb-2 text-japan-gold">Atributos Previstos:</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-japan-cream">
                    <div>Força: {calculateStats(characterAge, characterProfession).strength}</div>
                    <div>Agilidade: {calculateStats(characterAge, characterProfession).agility}</div>
                    <div>Inteligência: {calculateStats(characterAge, characterProfession).intelligence}</div>
                    <div>Carisma: {calculateStats(characterAge, characterProfession).charisma}</div>
                  </div>
                </div>

                <button
                  onClick={createCharacter}
                  className="japan-button w-full py-3 text-lg font-bold"
                  disabled={!characterName || !characterClan || !characterProfession || !characterReason}
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

  if (showCharacters) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <div className="japan-card p-6 mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-japan-red">
                Crônicas do Japão
              </h1>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowFriends(true)}
                  className="japan-button"
                >
                  👥 Amigos
                </button>
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
          <CharacterList 
            userId={user.id} 
            onSelectCharacter={(character) => {
              setSelectedCharacter(character)
              setShowMap(true)
            }}
          />
        </div>
      </div>
    )
  }
}
