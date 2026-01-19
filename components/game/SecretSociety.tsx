'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface SecretSocietyProps {
  characterId: string
  onSecretDiscovered?: (secret: SecretPath) => void
}

interface SecretPath {
  id: string
  name: string
  description: string
  type: 'yokai' | 'kami' | 'onmyoji' | 'tsukumogami'
  requirements: {
    perception: number
    spiritual: number
    social: number
    honor: number
    location?: string
    time?: string
  }
  rewards: {
    path: string
    abilities: string[]
    knowledge: string[]
  }
}

export default function SecretSociety({ characterId, onSecretDiscovered }: SecretSocietyProps) {
  const [discoveredSecrets, setDiscoveredSecrets] = useState<SecretPath[]>([])
  const [currentSecret, setCurrentSecret] = useState<SecretPath | null>(null)
  const [investigationProgress, setInvestigationProgress] = useState(0)

  // Caminhos secretos disponíveis
  const secretPaths: SecretPath[] = [
    {
      id: 'yokai_hunter_path',
      name: 'Caçador de Yōkai',
      description: 'Você começa a ver padrões que outros não percebem. Rastros que se movem de forma antinatural, sombras que não correspondem a nada.',
      type: 'yokai',
      requirements: { perception: 3, spiritual: 2, social: 1, honor: 10, location: 'forest_night', time: 'night' },
      rewards: {
        path: 'yokai_hunter',
        abilities: ['Rastrear Criaturas', 'Sentir Presença Sobrenatural', 'Armas Especiais'],
        knowledge: ['Fraqueza Yōkai', 'Tipos de Criaturas', 'Fraquezas Espirituais']
      }
    },
    {
      id: 'kami_shrine_path',
      name: 'Sacerdote de Kami',
      description: 'Os espíritos da natureza começam a responder suas preces. Você pode aprender a se comunicar com entidades que outros temem.',
      type: 'kami',
      requirements: { perception: 2, spiritual: 5, social: 3, honor: 15, location: 'shrine', time: 'dawn' },
      rewards: {
        path: 'kami_shrine',
        abilities: ['Comunicação Espiritual', 'Rituais Purificadores', 'Proteção Divina'],
        knowledge: ['Nomes de Espíritos', 'História Sagrada', 'Fraquezas Espirituais']
      }
    },
    {
      id: 'onmyoji_path',
      name: 'Onmyōji',
      description: 'Você percebe que as emoções afetam o mundo espiritual. Através da disciplina, pode aprender a manipular essa energia.',
      type: 'onmyoji',
      requirements: { perception: 4, spiritual: 3, social: 2, honor: 20, location: 'temple', time: 'meditation' },
      rewards: {
        path: 'onmyoji',
        abilities: ['Controle Emocional', 'Leitura de Auras', 'Técnicas de Meditação'],
        knowledge: ['Teoria Onmyōdō', 'Equilíbrio Espiritual', 'História das Emoções']
      }
    },
    {
      id: 'tsukumogami_path',
      name: 'Monge Tsukumogami',
      description: 'Você descobre que os espíritos podem ser contidos, acalmados e até liberados. Um caminho perigoso que exige grande disciplina.',
      type: 'tsukumogami',
      requirements: { perception: 5, spiritual: 7, social: 1, honor: 25, location: 'isolated_temple', time: 'midnight' },
      rewards: {
        path: 'tsukumogami',
        abilities: ['Contenção Espiritual', 'Selamento de Espíritos', 'Rituais Complexos'],
        knowledge: ['Selo Espiritual', 'Nomes de Demônios', 'História dos Tsukumogami']
      }
    }
  ]

  useEffect(() => {
    // Verificar se o personagem já descobriu algum caminho
    checkDiscoveredSecrets()
  }, [characterId])

  const checkDiscoveredSecrets = async () => {
    const { data, error } = await supabase
      .from('character_secrets')
      .select('*')
      .eq('character_id', characterId)

    if (data && !error) {
      setDiscoveredSecrets(data)
    }
  }

  const investigateSecret = (secret: SecretPath) => {
    setCurrentSecret(secret)
    setInvestigationProgress(0)
  }

  const progressInvestigation = () => {
    setInvestigationProgress(prev => {
      if (prev >= 100) {
        // Descobrir o caminho secreto
        discoverSecretPath(currentSecret!)
        return 100
      }
      return prev + 10
    })
  }

  const discoverSecretPath = async (secret: SecretPath) => {
    // Salvar no banco de dados
    const { error } = await supabase
      .from('character_secrets')
      .insert({
        character_id: characterId,
        secret_path_id: secret.id,
        discovered_at: new Date().toISOString()
      })

    if (error) {
      alert('Erro ao descobrir caminho: ' + error.message)
    } else {
      // Adicionar aos descobertos
      setDiscoveredSecrets(prev => [...prev, secret])
      
      // Marcar como caminho atual
      const { error: updateError } = await supabase
        .from('characters')
        .update({ 
          secret_path: secret.id 
        })
        .eq('id', characterId)

      if (updateError) {
        alert('Erro ao atualizar caminho: ' + updateError.message)
      }

      alert(`Você descobriu o caminho: ${secret.name}!`)
      setCurrentSecret(null)
      setInvestigationProgress(0)
      
      if (onSecretDiscovered) {
        onSecretDiscovered(secret)
      }
    }
  }

  const canAccessPath = (secret: SecretPath) => {
    if (!currentSecret) return false
    
    const characterStats = {
      perception: 3, // Base para personagem comum
      spiritual: 2,
      social: 1,
      honor: 10
    }
    
    return Object.entries(secret.requirements).every(([key, value]) => {
      if (key === 'location' || key === 'time') {
        // Verificar se está no local/horário certo
        return true // Simplificado para o exemplo
      }
      
      return characterStats[key as keyof typeof characterStats] >= value
    })
  }

  if (currentSecret) {
    return (
      <div className="character-status p-6">
        <h3 className="text-xl font-bold mb-4 text-japan-red">🌑 Caminho Secreto: {currentSecret.name}</h3>
        
        <div className="mb-4 p-3 bg-japan-black rounded">
          <div className="text-japan-cream text-sm mb-3">
            {currentSecret.description}
          </div>
          
          <div className="text-japan-cream text-sm">
            <strong>Requisitos:</strong>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-japan-cream">
            {Object.entries(currentSecret.requirements).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <div className="text-japan-cream text-sm mb-2">
              Progresso da Investigação: {investigationProgress}%
            </div>
            <div className="w-full bg-japan-black rounded">
              <div 
                className="h-2 bg-japan-red rounded"
                style={{ width: `${investigationProgress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={progressInvestigation}
              className="japan-button px-3 py-2 text-sm flex-1"
              disabled={investigationProgress >= 100}
            >
              🔍 Investigar
            </button>
            <button
              onClick={() => setCurrentSecret(null)}
              className="japan-button px-3 py-2 text-sm flex-1"
            >
              ❌ Abandonar
            </button>
          </div>
        </div>
        
        <div className="text-sm text-japan-cream opacity-70 mt-4">
          <p>⚠️ <strong>Investigar caminhos secretos é perigoso</strong></p>
          <p>🌑 <strong>Pode atrair atenção indesejada</strong></p>
          <p>⏰ <strong>Requer tempo e dedicação</strong></p>
        </div>
      </div>
    )
  }

  return (
    <div className="character-status p-6">
      <h3 className="text-xl font-bold mb-4 text-japan-red">🌑 Sociedades Secretas</h3>
      
      <div className="text-sm text-japan-cream opacity-70 mb-4">
        <p>🌑 <strong>O mundo tem caminhos que poucos veem</strong></p>
        <p>👁️ <strong>Você começa sem perceber nada incomum</strong></p>
        <p>⏰ <strong>O tempo e as escolhas revelarão o oculto</strong></p>
      </div>
      
      <div className="space-y-3">
        {secretPaths.map(secret => {
          const isDiscovered = discoveredSecrets.some(s => s.id === secret.id)
          const isAccessible = canAccessPath(secret)
          
          return (
            <div key={secret.id} className="p-3 bg-japan-black rounded">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-japan-cream font-bold">
                    {secret.name}
                    {isDiscovered && ' ✅'}
                  </div>
                  <div className="text-japan-cream text-sm opacity-80">
                    {secret.description}
                  </div>
                  <div className="text-japan-cream text-xs mt-1">
                    Tipo: {secret.type}
                  </div>
                </div>
                <div className="flex gap-2">
                  {isAccessible && (
                    <button
                      onClick={() => investigateSecret(secret)}
                      className="japan-button px-3 py-2 text-sm"
                    >
                      🔍 Investigar
                    </button>
                  )}
                  {isDiscovered && (
                    <button
                      onClick={() => setCurrentSecret(secret)}
                      className="japan-button px-3 py-2 text-sm bg-japan-gold"
                    >
                      🌑 Seguir
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="text-sm text-japan-cream opacity-70 mt-4">
        <p>🌑 <strong>Cada caminho é uma forma de vida diferente</strong></p>
        <p>⚠️ <strong>Escolhas definem quem você se torna</strong></p>
        <p>🎭 <strong>Nenhuma classe é visível no início</strong></p>
      </div>
    </div>
  )
}
