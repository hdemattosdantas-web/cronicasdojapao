'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface CombatSystemProps {
  characterId: string
  onCombatEnd?: (result: CombatResult) => void
}

interface CombatResult {
  winner: 'player' | 'npc' | 'flee'
  playerInjured: boolean
  playerGainedExperience: boolean
  description: string
}

interface Enemy {
  id: string
  name: string
  type: 'thug' | 'guard' | 'rival' | 'spirit'
  description: string
  difficulty: number // 1-10
  rewards: {
    experience: boolean
    injury: boolean
    social: boolean
  }
}

export default function CombatSystem({ characterId, onCombatEnd }: CombatSystemProps) {
  const [inCombat, setInCombat] = useState(false)
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null)
  const [combatLog, setCombatLog] = useState<string[]>([])

  // Inimigos humanos comuns (não sobrenaturais)
  const commonEnemies: Enemy[] = [
    {
      id: 'thug_1',
      name: 'Bandido Local',
      type: 'thug',
      description: 'Um homem armado com olhar desesperado. Provavelmente precisa de dinheiro.',
      difficulty: 2,
      rewards: { experience: true, injury: true, social: false }
    },
    {
      id: 'guard_1',
      name: 'Guarda da Cidade',
      type: 'guard',
      description: 'Um homem uniformizado, apenas fazendo seu trabalho. Não parece querer problemas.',
      difficulty: 3,
      rewards: { experience: true, injury: false, social: true }
    },
    {
      id: 'rival_1',
      name: 'Ferreiro Concorrente',
      type: 'rival',
      description: 'Um artesão da vila vizinha. Olha você com hostilidade profissional.',
      difficulty: 4,
      rewards: { experience: true, injury: true, social: false }
    }
  ]

  const startCombat = (enemy: Enemy) => {
    setInCombat(true)
    setCurrentEnemy(enemy)
    setCombatLog([`⚔️ Combate iniciado contra ${enemy.name}!`, enemy.description])
  }

  const performAction = (action: 'attack' | 'flee' | 'defend') => {
    if (!currentEnemy) return

    let newLog = ''
    
    switch (action) {
      case 'attack':
        const playerSuccess = Math.random() > 0.4 // 60% chance base
        if (playerSuccess) {
          newLog = `🗡️ Você atacou ${currentEnemy.name} e acertou!`
          if (Math.random() > 0.7) {
            newLog += ` ${currentEnemy.name} parece ferido!`
          }
        } else {
          newLog = `❌ Você atacou ${currentEnemy.name} mas errou o golpe!`
          if (Math.random() > 0.6) {
            newLog += ` 🩸 Você sofreu um corte superficial!`
          }
        }
        break
        
      case 'defend':
        newLog = `🛡️ Você assume posição defensiva contra ${currentEnemy.name}.`
        if (Math.random() > 0.5) {
          newLog += ` Bloqueou o ataque inimigo!`
        }
        break
        
      case 'flee':
        const fleeSuccess = Math.random() > 0.3 // 70% chance base
        if (fleeSuccess) {
          newLog = `🏃 Você conseguiu fugir de ${currentEnemy.name}!`
          endCombat('flee', false, false)
        } else {
          newLog = `❌ ${currentEnemy.name} bloqueou sua fuga!`
        }
        break
    }
    
    setCombatLog(prev => [...prev, newLog])
  }

  const endCombat = (winner: CombatResult['winner'], injured: boolean, gainedExp: boolean) => {
    let description = ''
    
    if (winner === 'flee') {
      description = 'Você fugiu do combate. Escapou com vida, mas sem honra.'
    } else if (winner === 'player') {
      description = `Você derrotou ${currentEnemy?.name}!`
      if (injured) {
        description += ' Sofreu ferimentos na batalha.'
      }
      if (gainedExp) {
        description += ' Aprendeu algo com essa experiência.'
      }
    } else {
      description = `Você foi derrotado por ${currentEnemy?.name}!`
      if (injured) {
        description += ' Ficou ferido e precisou de ajuda.'
      }
    }
    
    setInCombat(false)
    setCurrentEnemy(null)
    
    if (onCombatEnd) {
      onCombatEnd({
        winner,
        playerInjured: injured,
        playerGainedExperience: gainedExp,
        description
      })
    }
  }

  // Simular combate automático para teste
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    
    if (inCombat && currentEnemy) {
      timer = setTimeout(() => {
        // Simular resultado baseado em dificuldade
        const playerWinChance = 0.6 - (currentEnemy.difficulty * 0.05)
        const playerWins = Math.random() < playerWinChance
        const playerInjured = playerWins && Math.random() > 0.5
        const gainsExperience = playerWins && currentEnemy.rewards.experience
        
        endCombat(
          playerWins ? 'player' : 'npc',
          playerInjured,
          gainsExperience
        )
      }, 3000)
    }
    
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [inCombat, currentEnemy])

  if (inCombat) {
    return (
      <div className="character-status p-6">
        <h3 className="text-xl font-bold mb-4 text-japan-red">⚔️ Combate</h3>
        
        {currentEnemy && (
          <div className="mb-4 p-3 bg-japan-black rounded">
            <div className="text-japan-cream font-bold mb-2">
              Inimigo: {currentEnemy.name}
            </div>
            <div className="text-japan-cream text-sm opacity-80">
              {currentEnemy.description}
            </div>
            <div className="text-japan-cream text-sm mt-2">
              Dificuldade: {'⭐'.repeat(Math.ceil(currentEnemy.difficulty / 2))}
            </div>
          </div>
        )}
        
        <div className="space-y-2 mb-4">
          {combatLog.map((log, index) => (
            <div key={index} className="text-japan-cream text-sm p-2 bg-japan-black rounded">
              {log}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => performAction('attack')}
            className="japan-button px-3 py-2 text-sm"
            disabled={!inCombat}
          >
            🗡️ Atacar
          </button>
          <button
            onClick={() => performAction('defend')}
            className="japan-button px-3 py-2 text-sm"
            disabled={!inCombat}
          >
            🛡️ Defender
          </button>
          <button
            onClick={() => performAction('flee')}
            className="japan-button px-3 py-2 text-sm"
            disabled={!inCombat}
          >
            🏃 Fugir
          </button>
        </div>
        
        <div className="text-sm text-japan-cream opacity-70 mt-4">
          <p>⚠️ <strong>Combate é perigoso e consequente</strong></p>
          <p>🩸 <strong>Ferimentos podem ser duradouros</strong></p>
          <p>🏃 <strong>Fugir é sempre válido</strong></p>
        </div>
      </div>
    )
  }

  return (
    <div className="character-status p-6">
      <h3 className="text-xl font-bold mb-4 text-japan-red">⚔️ Encontros</h3>
      
      <div className="text-sm text-japan-cream opacity-70 mb-4">
        <p>👥 <strong>Conflitos são comuns no Japão Sengoku</strong></p>
        <p>⚔️ <strong>Evite combate quando possível</strong></p>
        <p>🏃 <strong>Fugir preserva sua vida</strong></p>
      </div>
      
      <div className="space-y-3">
          {commonEnemies.map(enemy => (
            <div key={enemy.id} className="p-3 bg-japan-black rounded">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-japan-cream font-bold">
                    {enemy.name}
                  </div>
                  <div className="text-japan-cream text-sm opacity-80">
                    {enemy.description}
                  </div>
                  <div className="text-japan-cream text-xs mt-1">
                    Dificuldade: {'⭐'.repeat(Math.ceil(enemy.difficulty / 2))}
                  </div>
                </div>
                <button
                  onClick={() => startCombat(enemy)}
                  className="japan-button px-3 py-2 text-sm"
                >
                  ⚔️ Enfrentar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default CombatSystem
