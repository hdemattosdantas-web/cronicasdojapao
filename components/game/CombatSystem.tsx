'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Enemy {
  id: string
  name: string
  difficulty: number
  rewards: {
    experience: number
    gold: number
  }
}

interface CombatSystemProps {
  characterId: string
  onCombatEnd: (winner: 'player' | 'npc', injured: boolean, gainedExperience: boolean) => void
}

export default function CombatSystem({ characterId, onCombatEnd }: CombatSystemProps) {
  const [inCombat, setInCombat] = useState(false)
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null)
  const [combatLog, setCombatLog] = useState<string[]>([])

  const enemies: Enemy[] = [
    {
      id: '1',
      name: 'Ladrão Desesperado',
      difficulty: 1,
      rewards: { experience: 10, gold: 5 }
    },
    {
      id: '2',
      name: 'Guarda Corrupto',
      difficulty: 2,
      rewards: { experience: 20, gold: 15 }
    },
    {
      id: '3',
      name: 'Samurai Ronin',
      difficulty: 3,
      rewards: { experience: 35, gold: 25 }
    }
  ]

  const startCombat = (enemy: Enemy) => {
    setInCombat(true)
    setCurrentEnemy(enemy)
    setCombatLog([`Um ${enemy.name} apareceu!`])
  }

  const endCombat = (winner: 'player' | 'npc', injured: boolean, gainedExperience: boolean) => {
    setInCombat(false)
    setCurrentEnemy(null)
    setCombatLog([])
    onCombatEnd(winner, injured, gainedExperience)
  }

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    
    if (inCombat && currentEnemy) {
      timer = setTimeout(() => {
        // Simular resultado baseado em dificuldade
        const playerWinChance = 0.6 - (currentEnemy.difficulty * 0.05)
        const playerWins = Math.random() < playerWinChance
        const playerInjured = playerWins && Math.random() > 0.5
        const gainsExperience = playerWins && currentEnemy.rewards.experience > 0
        
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

  if (!inCombat) {
    return (
      <div className="p-4 bg-japan-black rounded">
        <h3 className="text-lg font-bold mb-4 text-japan-gold">Encontros Possíveis</h3>
        <div className="space-y-2">
          {enemies.map((enemy) => (
            <div key={enemy.id} className="flex justify-between items-center p-2 border border-japan-gold rounded">
              <div>
                <div className="font-bold text-japan-cream">{enemy.name}</div>
                <div className="text-xs text-japan-cream opacity-70">
                  Dificuldade: {'⭐'.repeat(enemy.difficulty)}
                </div>
              </div>
              <button
                onClick={() => startCombat(enemy)}
                className="japan-button px-3 py-2 text-sm"
              >
                ⚔️ Enfrentar
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-japan-black rounded">
      <h3 className="text-lg font-bold mb-4 text-japan-red">Combate!</h3>
      
      {currentEnemy && (
        <div className="mb-4">
          <div className="text-japan-cream font-bold">{currentEnemy.name}</div>
          <div className="text-xs text-japan-cream opacity-70">
            Dificuldade: {'⭐'.repeat(currentEnemy.difficulty)}
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="text-japan-cream text-sm">O combate está em andamento...</div>
        <div className="text-japan-cream text-xs opacity-70 mt-1">
          A resolução levará alguns segundos.
        </div>
      </div>

      {combatLog.length > 0 && (
        <div className="border-t border-japan-gold pt-2">
          <div className="text-xs text-japan-cream opacity-70">Registro:</div>
          {combatLog.map((log, index) => (
            <div key={index} className="text-xs text-japan-cream">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
