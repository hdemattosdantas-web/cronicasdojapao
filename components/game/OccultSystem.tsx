'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface OccultSystemProps {
  characterId: string
  onOccultEvent?: (result: OccultResult) => void
}

interface OccultResult {
  type: 'encounter' | 'ritual' | 'discovery' | 'corruption'
  description: string
  perceptionGained: boolean
  spiritualResistanceGained: boolean
  socialImpact: string
}

interface OccultEvent {
  id: string
  name: string
  description: string
  type: 'encounter' | 'ritual' | 'discovery' | 'corruption'
  trigger: 'location' | 'time' | 'action' | 'social'
  difficulty: number // 1-10
  effects: {
    perception: boolean
    spiritual: boolean
    social: boolean
    corruption: boolean
  }
}

export default function OccultSystem({ characterId, onOccultEvent }: OccultSystemProps) {
  const [occultEvents, setOccultEvents] = useState<OccultEvent[]>([])
  const [eventLog, setEventLog] = useState<string[]>([])
  const [perceptionLevel, setPerceptionLevel] = useState(0)
  const [spiritualResistance, setSpiritualResistance] = useState(0)

  // Eventos ocultos que surgem naturalmente
  const naturalOccultEvents: OccultEvent[] = [
    {
      id: 'strange_sounds_1',
      name: 'Sons Estranhos',
      description: 'Durante a noite, você ouve sussurros que não parecem humanos. Vêm de direções impossíveis.',
      type: 'encounter',
      trigger: 'time',
      difficulty: 2,
      effects: { perception: true, spiritual: false, social: false, corruption: false }
    },
    {
      id: 'missing_object_1',
      name: 'Objeto Desaparecido',
      description: 'Um objeto pessoal desaparece misteriosamente de seu quarto. Ninguém viu nada.',
      type: 'discovery',
      trigger: 'location',
      difficulty: 1,
      effects: { perception: true, spiritual: false, social: false, corruption: false }
    },
    {
      id: 'whispers_1',
      name: 'Sussurros Incompreensíveis',
      description: 'Em momentos de silêncio, você ouve sussurros em uma língua que não reconhece.',
      type: 'encounter',
      trigger: 'social',
      difficulty: 3,
      effects: { perception: true, spiritual: true, social: false, corruption: false }
    },
    {
      id: 'shadow_movement_1',
      name: 'Sombras que se Movem',
      description: 'Sua sombra se move independentemente de você. Às vezes, ela assume formas que não deveriam.',
      type: 'corruption',
      trigger: 'action',
      difficulty: 4,
      effects: { perception: false, spiritual: false, social: false, corruption: true }
    }
  ]

  useEffect(() => {
    // Simular eventos baseados em percepção
    const checkForEvents = () => {
      const chance = Math.random()
      if (chance < 0.1) { // 10% chance
        const event = naturalOccultEvents[Math.floor(Math.random() * naturalOccultEvents.length)]
        handleOccultEvent(event)
      }
    }

    const interval = setInterval(checkForEvents, 15000) // Check a cada 15 segundos
    return () => clearInterval(interval)
  }, [])

  const handleOccultEvent = (event: OccultEvent) => {
    let newLog = `🌑 ${event.name}: ${event.description}`
    
    setEventLog(prev => [...prev, newLog])
    setOccultEvents(prev => [...prev, event])
    
    // Atualizar atributos ocultos baseado no evento
    if (event.effects.perception) {
      setPerceptionLevel(prev => prev + 1)
      newLog += ` 🧭 Sua percepção aumentou!`
    }
    
    if (event.effects.spiritual) {
      setSpiritualResistance(prev => prev + 1)
      newLog += ` ✝️ Sua resistência espiritual aumentou!`
    }
    
    if (event.effects.corruption) {
      newLog += ` 😨 Você sente algo errado acontecendo...`
    }
    
    setEventLog(prev => [...prev, newLog])
    
    if (onOccultEvent) {
      onOccultEvent({
        type: event.type,
        description: newLog,
        perceptionGained: event.effects.perception,
        spiritualResistanceGained: event.effects.spiritual,
        socialImpact: event.effects.corruption ? 'medo' : 'curiosidade'
      })
    }
  }

  const investigateEvent = (eventId: string) => {
    const event = occultEvents.find(e => e.id === eventId)
    if (!event) return
    
    let newLog = `🔍 Você investiga ${event.name}...`
    
    // Simular investigação baseada em dificuldade
    const successChance = 0.7 - (event.difficulty * 0.05)
    const success = Math.random() < successChance
    
    if (success) {
      newLog += ` Descobriu: ${event.description.substring(0, 50)}...`
      if (event.effects.perception) {
        setPerceptionLevel(prev => prev + 2)
        newLog += ` 🧭 Percepção aumentou significativamente!`
      }
    } else {
      newLog += ` Não conseguiu entender completamente. Algo escapa de sua compreensão.`
    }
    
    setEventLog(prev => [...prev, newLog])
  }

  if (eventLog.length > 0 || occultEvents.length > 0) {
    return (
      <div className="character-status p-6">
        <h3 className="text-xl font-bold mb-4 text-japan-red">🌑 O Oculto</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-japan-black rounded">
            <div className="text-japan-cream font-bold mb-2">🧭 Percepção Espiritual</div>
            <div className="text-2xl text-japan-gold">Nível {perceptionLevel}</div>
            <div className="text-xs text-japan-cream opacity-60">
              {perceptionLevel === 0 && 'Você não nota nada incomum'}
              {perceptionLevel > 0 && perceptionLevel <= 3 && 'Você começa a notar padrões estranhos'}
              {perceptionLevel > 3 && perceptionLevel <= 6 && 'Você reconhece fenômenos sobrenaturais'}
              {perceptionLevel > 6 && 'Você entende a natureza do oculto'}
            </div>
          </div>
          
          <div className="p-3 bg-japan-black rounded">
            <div className="text-japan-cream font-bold mb-2">✝️ Resistência Espiritual</div>
            <div className="text-2xl text-japan-gold">Nível {spiritualResistance}</div>
            <div className="text-xs text-japan-cream opacity-60">
              {spiritualResistance === 0 && 'Vulnerável a influências'}
              {spiritualResistance > 0 && spiritualResistance <= 3 && 'Resiste a influências fracas'}
              {spiritualResistance > 3 && spiritualResistance <= 6 && 'Resiste a influências moderadas'}
              {spiritualResistance > 6 && 'Resistente a influências fortes'}
            </div>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          {eventLog.map((log, index) => (
            <div key={index} className="text-japan-cream text-sm p-2 bg-japan-black rounded">
              {log}
            </div>
          ))}
        </div>
        
        <div className="text-sm text-japan-cream opacity-70">
          <p>🌑 <strong>O oculto se revela gradualmente</strong></p>
          <p>🧭 <strong>Cada evento aumenta sua percepção</strong></p>
          <p>✝️ <strong>Resistência espiritual protege sua mente</strong></p>
          <p>⚠️ <strong>Nem tudo deve ser enfrentado diretamente</strong></p>
        </div>
      </div>
    )
  }

  return (
    <div className="character-status p-6">
      <h3 className="text-xl font-bold mb-4 text-japan-red">🌑 O Oculto</h3>
      
      <div className="text-sm text-japan-cream opacity-70 mb-4">
        <p>🌑 <strong>O mundo guarda segredos que se revelam aos poucos</strong></p>
        <p>👁️ <strong>Você começa sem perceber nada incomum</strong></p>
        <p>⏰ <strong>O tempo e as escolhas revelarão o oculto</strong></p>
      </div>
      
      <div className="space-y-3">
        {occultEvents.map(event => (
          <div key={event.id} className="p-3 bg-japan-black rounded">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-japan-cream font-bold">
                  {event.name}
                </div>
                <div className="text-japan-cream text-sm opacity-80">
                  {event.description}
                </div>
                <div className="text-japan-cream text-xs mt-1">
                  Dificuldade: {'⭐'.repeat(Math.ceil(event.difficulty / 2))}
                </div>
              </div>
              <button
                onClick={() => investigateEvent(event.id)}
                className="japan-button px-3 py-2 text-sm"
              >
                🔍 Investigar
              </button>
            </div>
        ))}
      </div>
      
      <div className="text-sm text-japan-cream opacity-70 mt-4">
        <p>🌑 <strong>O conhecimento oculto é perigoso</strong></p>
        <p>🧠 <strong>Pode afetar sua sanidade</strong></p>
        <p>⚖️ <strong>Alguns segredos melhoram permanecer ocultos</strong></p>
      </div>
    </div>
  )
}
