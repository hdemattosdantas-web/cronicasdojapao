'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface CreatureEncountersProps {
  characterId: string
  onEncounter?: (encounter: CreatureEncounter) => void
}

interface CreatureEncounter {
  id: string
  type: 'substitute' | 'contact_entity' | 'ghoul'
  description: string
  trigger: 'location' | 'time' | 'action' | 'social'
  severity: 'subtle' | 'moderate' | 'severe'
  effects: {
    spiritual: boolean
    psychological: boolean
    physical: boolean
    permanent: boolean
  }
  resolution?: {
    type: 'survive' | 'escape' | 'transform' | 'corrupt'
    description: string
  }
}

export default function CreatureEncounters({ characterId, onEncounter }: CreatureEncountersProps) {
  const [activeEncounters, setActiveEncounters] = useState<CreatureEncounter[]>([])
  const [encounterLog, setEncounterLog] = useState<string[]>([])
  const [investigationLevel, setInvestigationLevel] = useState(0)

  // Encontros baseados nos novos tipos de criaturas
  const creatureTypes = {
    substitute: {
      name: 'Utsuro Mono (Ser Vazio)',
      description: 'Algo está errado. Uma pessoa que você conhecia voltou, mas não voltou de verdade.',
      trigger: 'social',
      effects: { spiritual: false, psychological: true, physical: false, permanent: false },
      encounters: [
        {
          id: 'substitute_1',
          description: 'Seu vizinho Takashi voltou da guerra, mas seus olhos não piscam. Ele não sente dor, não dorme e observa demais.',
          severity: 'subtle',
          effects: { spiritual: false, psychological: true, physical: false, permanent: false }
        },
        {
          id: 'substitute_2',
          description: 'A criança que brincava perto do rio agora evita o reflexo na água. Ela ri, mas o riso não tem alegria.',
          severity: 'moderate',
          effects: { spiritual: false, psychological: true, physical: false, permanent: false }
        }
      ]
    },
    contact_entity: {
      name: 'Ikai no Mono (Coisas do Outro Lado)',
      description: 'Em lugares liminares, a realidade se quebra. Coisas que não deveriam existir aparecem.',
      trigger: 'location',
      effects: { spiritual: true, psychological: true, physical: true, permanent: false },
      encounters: [
        {
          id: 'contact_1',
          description: 'Na floresta abandonada, você vê árvores que crescem em espirais. O vento sussurra nomes que você nunca ouviu.',
          severity: 'moderate',
          effects: { spiritual: true, psychological: true, physical: false, permanent: false }
        },
        {
          id: 'contact_2',
          description: 'A ponte antiga parece mover-se quando ninguém olha. Às vezes, sombras passam por onde não há nada.',
          severity: 'severe',
          effects: { spiritual: true, psychological: true, physical: true, permanent: true }
        }
      ]
    },
    ghoul: {
      name: 'Ketsubutsu (Coisas de Sangue)',
      description: 'Humanos que sobreviveram ao impossível, mas pagaram um preço terrível.',
      trigger: 'action',
      effects: { spiritual: true, psychological: true, physical: true, permanent: true },
      encounters: [
        {
          id: 'ghoul_1',
          description: 'O velho que morria de fome na montanha voltou. Mas ele não precisa mais de comida, e seus olhos brilham na escuridão.',
          severity: 'severe',
          effects: { spiritual: true, psychological: true, physical: true, permanent: true }
        }
      ]
    }
  }

  useEffect(() => {
    // Simular encontros baseados em localização e tempo
    const checkForEncounters = () => {
      const chance = Math.random()
      if (chance < 0.05) { // 5% chance
        const types = Object.keys(creatureTypes) as Array<keyof typeof creatureTypes>
        const selectedType = types[Math.floor(Math.random() * types.length)]
        const encounters = creatureTypes[selectedType].encounters
        const selectedEncounter = encounters[Math.floor(Math.random() * encounters.length)]
        
        handleEncounter({
          ...selectedEncounter,
          type: selectedType,
          name: creatureTypes[selectedType].name,
          description: creatureTypes[selectedType].description
        })
      }
    }

    const interval = setInterval(checkForEncounters, 20000) // Check a cada 20 segundos
    return () => clearInterval(interval)
  }, [])

  const handleEncounter = (encounter: CreatureEncounter) => {
    setActiveEncounters(prev => [...prev, encounter])
    setEncounterLog(prev => [...prev, `🌑 Encontro: ${encounter.name}`])
    
    if (onEncounter) {
      onEncounter(encounter)
    }
  }

  const investigateEncounter = (encounterId: string) => {
    setInvestigationLevel(prev => {
      if (prev >= 100) {
        resolveEncounter(encounterId)
        return 100
      }
      return prev + 10
    })
  }

  const resolveEncounter = (encounterId: string) => {
    const encounter = activeEncounters.find(e => e.id === encounterId)
    if (!encounter) return

    let resolution: CreatureEncounter['resolution']
    
    // Resoluções baseadas no tipo de criatura
    switch (encounter.type) {
      case 'substitute':
        resolution = {
          type: 'survive',
          description: 'Você percebe a verdade, mas decide não interferir. Alguns segredos melhor permanecer ocultos.'
        }
        break
        
      case 'contact_entity':
        resolution = {
          type: 'escape',
          description: 'Você foge da área anômala. Sua percepção do mundo mudou para sempre.'
        }
        break
        
      case 'ghoul':
        resolution = {
          type: 'corrupt',
          description: 'O contato deixa uma marca em você. Algo dentro mudou, e nunca mais será o mesmo.'
        }
        break
    }

    setEncounterLog(prev => [...prev, `✅ Resolução: ${resolution.description}`])
    
    // Remover encontro ativo
    setActiveEncounters(prev => prev.filter(e => e.id !== encounterId))
    setInvestigationLevel(0)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'subtle': return 'text-japan-cream'
      case 'moderate': return 'text-yellow-400'
      case 'severe': return 'text-japan-red'
      default: return 'text-japan-cream'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'subtle': return '👁️'
      case 'moderate': return '⚠️'
      case 'severe': return '🩸'
      default: return '🌑'
    }
  }

  return (
    <div className="character-status p-6">
      <h3 className="text-xl font-bold mb-4 text-japan-red">🌑 Encontros Anômalos</h3>
      
      <div className="text-sm text-japan-cream opacity-70 mb-4">
        <p>🌑 <strong>Algo errado no mundo</strong></p>
        <p>👁️ <strong>Ninguém entende completamente</strong></p>
        <p>⚠️ <strong>Contato pode mudar você para sempre</strong></p>
      </div>
      
      {/* Encontros Ativos */}
      {activeEncounters.length > 0 && (
        <div className="space-y-3 mb-4">
          <h4 className="text-lg font-bold mb-2 text-japan-gold">Encontros Ativos</h4>
          {activeEncounters.map(encounter => (
            <div key={encounter.id} className="p-3 bg-japan-black rounded">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className={`font-bold ${getSeverityColor(encounter.severity)}`}>
                    {getSeverityIcon(encounter.severity)} {encounter.name}
                  </div>
                  <div className="text-japan-cream text-sm opacity-80">
                    {encounter.description}
                  </div>
                </div>
                <div className="text-xs text-japan-cream">
                  Severidade: {encounter.severity}
                </div>
              </div>
              
              {investigationLevel < 100 && (
                <div className="space-y-2">
                  <div className="text-japan-cream text-sm">
                    Progresso da Investigação: {investigationLevel}%
                  </div>
                  <div className="w-full bg-japan-black rounded">
                    <div 
                      className="h-2 bg-japan-red rounded"
                      style={{ width: `${investigationLevel}%` }}
                    ></div>
                  </div>
                  <button
                    onClick={() => investigateEncounter(encounter.id)}
                    className="japan-button px-3 py-2 text-sm"
                  >
                    🔍 Investigar
                  </button>
                </div>
              )}
              
              {investigationLevel >= 100 && (
                <button
                  onClick={() => resolveEncounter(encounter.id)}
                  className="japan-button px-3 py-2 text-sm bg-japan-gold"
                >
                  ✅ Resolver
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Log de Encontros */}
      {encounterLog.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="text-lg font-bold mb-2 text-japan-gold">Histórico de Encontros</h4>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {encounterLog.map((log, index) => (
              <div key={index} className="text-japan-cream text-sm p-2 bg-japan-black rounded">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-sm text-japan-cream opacity-70">
        <p>🌑 <strong>Criaturas não são monstros de caça</strong></p>
        <p>👁️ <strong>Ninguém as chama pelo nome oficial</strong></p>
        <p>⚠️ <strong>Podem nunca ser descobertas completamente</strong></p>
        <p>📖 <strong>Criam histórias longas e misteriosas</strong></p>
      </div>
    </div>
  )
}
