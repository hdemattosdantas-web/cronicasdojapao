'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Character } from '@/types/character'

interface CharacterListProps {
  userId: string
  onSelectCharacter?: (character: any) => void
}

export default function CharacterList({ userId, onSelectCharacter }: CharacterListProps) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCharacters()
  }, [userId])

  const loadCharacters = async () => {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error
      setCharacters(data || [])
    } catch (error) {
      console.error('Erro ao carregar personagens:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character)
    if (onSelectCharacter) {
      onSelectCharacter(character)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-japan-cream">Carregando personagens...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-japan-gold">Seus Personagens</h3>
      
      {characters.length === 0 ? (
        <div className="text-center p-8 bg-japan-black rounded">
          <div className="text-japan-cream mb-4">
            Nenhum personagem encontrado. Crie seu primeiro personagem!
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {characters.map((character) => (
            <div
              key={character.id}
              onClick={() => handleSelectCharacter(character)}
              className={`p-4 bg-japan-black rounded cursor-pointer border transition-all ${
                selectedCharacter?.id === character.id
                  ? 'border-japan-gold'
                  : 'border-japan-cream hover:border-japan-gold'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-japan-gold">{character.name}</h4>
                  <div className="text-japan-cream text-sm">
                    Clã: {character.clan}
                  </div>
                  <div className="text-japan-cream text-sm">
                    Idade: {character.age || 'Desconhecida'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-japan-cream text-sm">
                    Saúde: {character.health}
                  </div>
                  <div className="text-japan-cream text-sm">
                    Honra: {character.honor}
                  </div>
                  <div className="text-japan-cream text-sm">
                    Ouro: {character.gold}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
