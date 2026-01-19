'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Character } from '@/types/character'
import { GameTime, AgeEvent, Choice } from '@/lib/game/time'

interface GameInterfaceProps {
  character: Character
  onCharacterUpdate: (character: Character) => void
}

export default function GameInterface({ character, onCharacterUpdate }: GameInterfaceProps) {
  const [currentTime, setCurrentTime] = useState(GameTime.getCurrentTime(character))
  const [currentEvent, setCurrentEvent] = useState<AgeEvent | null>(null)
  const [gameLog, setGameLog] = useState<string[]>([])

  useEffect(() => {
    // Verificar eventos por idade
    const ageEvents = GameTime.getAgeEvents(character.age)
    const pendingEvent = ageEvents.find(event => {
      // Aqui poderíamos verificar se o evento já foi processado
      return true // Por enquanto, mostra todos os eventos da idade atual
    })

    if (pendingEvent) {
      setCurrentEvent(pendingEvent)
    }
  }, [character.age])

  const handleChoice = async (choice: Choice) => {
    if (!currentEvent) return

    // Aplicar efeitos da escolha
    const updatedCharacter = {
      ...character,
      health: Math.max(0, Math.min(100, character.health + (choice.effects.health || 0))),
      honor: Math.max(0, Math.min(100, character.honor + (choice.effects.honor || 0))),
      gold: Math.max(0, character.gold + (choice.effects.gold || 0)),
      strength: Math.max(1, character.strength + (choice.effects.strength || 0)),
      agility: Math.max(1, character.agility + (choice.effects.agility || 0)),
      intelligence: Math.max(1, character.intelligence + (choice.effects.intelligence || 0)),
      charisma: Math.max(1, character.charisma + (choice.effects.charisma || 0)),
    }

    // Salvar no banco de dados
    const { error } = await supabase
      .from('characters')
      .update(updatedCharacter)
      .eq('id', character.id)

    if (error) {
      alert('Erro ao salvar: ' + error.message)
      return
    }

    // Adicionar ao log do jogo
    setGameLog(prev => [
      `${currentTime.currentYear} - ${currentEvent.title}`,
      `Sua escolha: ${choice.text}`,
      choice.consequence,
      '',
      ...prev
    ])

    // Salvar evento no histórico
    await supabase
      .from('game_events')
      .insert({
        character_id: character.id,
        event_type: 'age_event',
        title: currentEvent.title,
        description: currentEvent.description,
        choices: currentEvent.choices.map(c => c.text),
        consequences: [choice.consequence],
        year: currentTime.currentYear
      })

    // Verificar morte
    const deathCheck = GameTime.checkDeath(updatedCharacter)
    if (deathCheck.isDead) {
      const finalCharacter = {
        ...updatedCharacter,
        is_alive: false,
        death_reason: deathCheck.reason
      }

      await supabase
        .from('characters')
        .update(finalCharacter)
        .eq('id', character.id)

      onCharacterUpdate(finalCharacter)
      alert(`Seu personagem morreu de ${deathCheck.reason} aos ${updatedCharacter.age} anos.`)
      return
    }

    onCharacterUpdate(updatedCharacter)
    setCurrentEvent(null)

    // Avançar tempo (1 ano)
    const nextYear = GameTime.advanceTime(updatedCharacter, 12)
    setCurrentTime(GameTime.getCurrentTime(nextYear))
  }

  const advanceTime = async () => {
    const nextYear = GameTime.advanceTime(character, 12)
    
    const { error } = await supabase
      .from('characters')
      .update(nextYear)
      .eq('id', character.id)

    if (error) {
      alert('Erro ao avançar tempo: ' + error.message)
      return
    }

    onCharacterUpdate(nextYear)
    setCurrentTime(GameTime.getCurrentTime(nextYear))

    // Verificar novos eventos
    const ageEvents = GameTime.getAgeEvents(nextYear.age)
    const newEvent = ageEvents.find(event => event.age === nextYear.age)
    
    if (newEvent) {
      setCurrentEvent(newEvent)
    }
  }

  if (!character.is_alive) {
    return (
      <div className="japan-border p-8 bg-japan-black">
        <h2 className="text-2xl font-bold text-center mb-6 text-japan-red">
          Fim da Jornada
        </h2>
        <div className="text-center text-scene">
          <p className="mb-4">
            Seu personagem {character.name} viveu uma vida completa no período Sengoku.
          </p>
          <p className="mb-4">
            Morreu aos {character.age} anos de {character.death_reason || 'causas naturais'}.
          </p>
          <p className="text-japan-gold">
            Honra final: {character.honor} | Ouro acumulado: {character.gold}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status do Personagem */}
      <div className="character-status p-6">
        <h3 className="text-xl font-bold mb-4 text-japan-gold">{character.name}</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="text-japan-cream">Profissão:</div>
            <div className="text-japan-gold font-bold">{character.profession || 'Ferreiro'}</div>
          </div>
          <div>
            <div className="text-japan-cream">Origem:</div>
            <div className="text-japan-gold font-bold">{character.clan}</div>
          </div>
          <div>
            <div className="text-japan-cream">Localização:</div>
            <div className="text-japan-gold font-bold">{character.current_location}</div>
          </div>
          <div>
            <div className="text-japan-cream">Status:</div>
            <div className="text-japan-gold font-bold">
              {character.is_alive ? 'Vivo' : 'Morto'}
            </div>
          <div>Inteligência: {character.intelligence}</div>
          <div>Carisma: {character.charisma}</div>
        </div>
      </div>

      {/* Evento Atual */}
      {currentEvent && (
        <div className="japan-border p-6 bg-japan-black">
          <h3 className="text-xl font-bold mb-4 text-japan-red">
            {currentEvent.title}
          </h3>
          <p className="text-scene mb-6">
            {currentEvent.description}
          </p>
          <div className="space-y-3">
            {currentEvent.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoice(choice)}
                className="japan-button w-full text-left p-4"
              >
                {choice.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controles do Jogo */}
      {!currentEvent && (
        <div className="japan-border p-6 bg-japan-black text-center">
          <p className="text-scene mb-4">
            O tempo passa calmamente no Japão feudal...
          </p>
          <button
            onClick={advanceTime}
            className="japan-button px-8 py-3"
          >
            Avançar 1 Ano
          </button>
        </div>
      )}

      {/* Log do Jogo */}
      {gameLog.length > 0 && (
        <div className="japan-border p-4 bg-japan-black">
          <h4 className="text-sm font-bold mb-2 text-japan-gold">Histórico</h4>
          <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
            {gameLog.map((log, index) => (
              <div key={index} className="text-japan-cream opacity-80">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
