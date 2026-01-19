'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Character } from '@/types/character'
import GameInterface from './GameInterface'

export default function CharacterList({ userId }: { userId: string }) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCharacters()
  }, [userId])

  const loadCharacters = async () => {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar personagens:', error)
    } else {
      setCharacters(data || [])
    }
    setLoading(false)
  }

  const handleCharacterUpdate = (updatedCharacter: Character) => {
    setCharacters(prev => 
      prev.map(char => char.id === updatedCharacter.id ? updatedCharacter : char)
    )
    setSelectedCharacter(updatedCharacter)
  }

  const deleteCharacter = async (characterId: string) => {
    if (!confirm('Tem certeza que deseja deletar este personagem?')) return

    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', characterId)

    if (error) {
      alert('Erro ao deletar personagem: ' + error.message)
    } else {
      setCharacters(prev => prev.filter(char => char.id !== characterId))
      if (selectedCharacter?.id === characterId) {
        setSelectedCharacter(null)
      }
    }
  }

  if (loading) {
    return <div className="text-japan-cream">Carregando personagens...</div>
  }

  if (selectedCharacter) {
    return (
      <div>
        <button
          onClick={() => setSelectedCharacter(null)}
          className="japan-button mb-4"
        >
          ← Voltar para Personagens
        </button>
        <GameInterface 
          character={selectedCharacter} 
          onCharacterUpdate={handleCharacterUpdate}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-japan-red">Seus Personagens</h2>
      
      {characters.length === 0 ? (
        <div className="japan-border p-8 bg-japan-black text-center">
          <p className="text-japan-cream mb-4">
            Você ainda não tem personagens criados.
          </p>
          <p className="text-japan-cream">
            Volte para a página inicial e crie seu primeiro personagem!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {characters.map((character) => (
            <div key={character.id} className="japan-border p-6 bg-japan-black">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-japan-gold mb-2">
                    {character.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-japan-cream">
                    <div>
                      <span className="text-japan-gold">Idade:</span> {character.age} anos
                    </div>
                    <div>
                      <span className="text-japan-gold">Clã:</span> {character.clan}
                    </div>
                    <div>
                      <span className="text-japan-gold">Status:</span> {character.is_alive ? 'Vivo' : 'Morto'}
                    </div>
                    <div>
                      <span className="text-japan-gold">Honra:</span> {character.honor}
                    </div>
                  </div>
                  
                  {!character.is_alive && (
                    <div className="mt-2 text-sm text-japan-red">
                      Causa da morte: {character.death_reason || 'Desconhecida'}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCharacter(character)}
                    className="japan-button px-4 py-2"
                  >
                    {character.is_alive ? 'Jogar' : 'Ver História'}
                  </button>
                  <button
                    onClick={() => deleteCharacter(character.id)}
                    className="px-4 py-2 border border-japan-red text-japan-red hover:bg-japan-red hover:text-japan-cream transition-colors"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
