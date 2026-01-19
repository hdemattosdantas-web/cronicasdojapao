'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface MapLocation {
  id: string
  name: string
  region: string
  x: number
  y: number
  description: string
  is_accessible: boolean
}

interface Character {
  id: string
  name: string
  current_location: string
  region: string
}

export default function GameMap({ characterId }: { characterId: string }) {
  const [character, setCharacter] = useState<Character | null>(null)
  const [locations, setLocations] = useState<MapLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCharacter()
    fetchLocations()
  }, [characterId])

  const fetchCharacter = async () => {
    const { data, error } = await supabase
      .from('characters')
      .select('id, name, current_location, region')
      .eq('id', characterId)
      .single()

    if (data && !error) {
      setCharacter(data)
    }
    setLoading(false)
  }

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('map_locations')
      .select('*')
      .order('region', { ascending: true })

    if (data && !error) {
      setLocations(data)
    }
  }

  const travelToLocation = async (location: MapLocation) => {
    if (!character || !location.is_accessible) {
      alert('Localização não acessível no momento')
      return
    }

    // Verificar se pode viajar (mesma região ou desbloqueado)
    if (location.region !== character.region && location.region !== 'musashi') {
      alert('Você precisa desbloquear esta região primeiro')
      return
    }

    const { error } = await supabase
      .from('characters')
      .update({ 
        current_location: location.name,
        region: location.region 
      })
      .eq('id', characterId)

    if (error) {
      alert('Erro ao viajar: ' + error.message)
    } else {
      setCharacter(prev => prev ? { ...prev, current_location: location.name, region: location.region } : null)
      setSelectedLocation(location)
      alert(`Você viajou para ${location.name}!`)
    }
  }

  const getRegionColor = (region: string) => {
    const colors: { [key: string]: string } = {
      'owari': '#8B0000',     // Vermelho escuro
      'kai': '#2F4F2F',      // Verde escuro
      'shinano': '#4B0082',   // Índigo
      'mino': '#DAA520',      // Dourado
      'musashi': '#DC143C',   // Vermelho
      'echigo': '#4682B4'     // Aço
    }
    return colors[region] || '#666666'
  }

  if (loading) {
    return <div className="text-japan-cream">Carregando mapa...</div>
  }

  return (
    <div className="space-y-6">
      {/* Mapa Visual */}
      <div className="character-status p-6">
        <h3 className="text-2xl font-bold mb-4 text-japan-gold">🗺️ Mapa do Japão Sengoku</h3>
        
        {/* Posição Atual */}
        {character && (
          <div className="mb-4 p-3 bg-japan-black rounded">
            <div className="text-japan-cream">
              <span className="font-bold">📍 Posição Atual:</span> {character.current_location}
            </div>
            <div className="text-japan-cream opacity-60 text-sm">
              Região: {character.region}
            </div>
          </div>
        )}

        {/* Mapa Simples */}
        <div className="relative bg-japan-black rounded p-4" style={{ minHeight: '400px' }}>
          <svg width="100%" height="400" viewBox="0 0 800 600" className="w-full">
            {/* Regiões */}
            {locations.map(location => {
              const isCurrentLocation = character?.current_location === location.name
              const isAccessible = location.is_accessible
              
              return (
                <g key={location.id}>
                  {/* Círculo da localização */}
                  <circle
                    cx={location.x}
                    cy={location.y}
                    r={isCurrentLocation ? 12 : 8}
                    fill={getRegionColor(location.region)}
                    stroke={isCurrentLocation ? '#FFD700' : '#333'}
                    strokeWidth={isCurrentLocation ? 3 : 1}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => isAccessible && setSelectedLocation(location)}
                  />
                  
                  {/* Nome da localização */}
                  <text
                    x={location.x}
                    y={location.y - 15}
                    textAnchor="middle"
                    fill={isCurrentLocation ? '#FFD700' : '#F5F5DC'}
                    fontSize="12"
                    className="pointer-events-none"
                  >
                    {location.name}
                  </text>
                  
                  {/* Indicador de acesso */}
                  {!isAccessible && (
                    <text
                      x={location.x}
                      y={location.y + 20}
                      textAnchor="middle"
                      fill="#666"
                      fontSize="10"
                      className="pointer-events-none"
                    >
                      🔒
                    </text>
                  )}
                </g>
              )
            })}
            
            {/* Linha de conexão entre regiões principais */}
            <line
              x1="400" y1="300" // Centro (Musashi)
              x2="200" y2="200" // Owari
              stroke="#444"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
            <line
              x1="400" y1="300" // Centro (Musashi)
              x2="600" y2="200" // Kai
              stroke="#444"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
            <line
              x1="400" y1="300" // Centro (Musashi)
              x2="300" y2="400" // Shinano
              stroke="#444"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
            <line
              x1="400" y1="300" // Centro (Musashi)
              x2="500" y2="400" // Mino
              stroke="#444"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
            <line
              x1="400" y1="300" // Centro (Musashi)
              x2="400" y2="500" // Echigo
              stroke="#444"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          </svg>
        </div>
      </div>

      {/* Detalhes da Localização Selecionada */}
      {selectedLocation && (
        <div className="character-status p-4">
          <h4 className="text-xl font-bold mb-3 text-japan-gold">{selectedLocation.name}</h4>
          <p className="text-japan-cream mb-3">{selectedLocation.description}</p>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-japan-cream">Região: {selectedLocation.region}</span>
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: getRegionColor(selectedLocation.region) }}
            ></div>
          </div>
          
          {character?.current_location !== selectedLocation.name && (
            <button
              onClick={() => travelToLocation(selectedLocation)}
              disabled={!selectedLocation.is_accessible}
              className="japan-button w-full"
            >
              {selectedLocation.is_accessible ? '🚶 Viajar para este local' : '🔒 Localização bloqueada'}
            </button>
          )}
          
          {character?.current_location === selectedLocation.name && (
            <div className="text-japan-gold text-center font-bold">
              📍 Você está aqui
            </div>
          )}
        </div>
      )}

      {/* Lista de Localizações */}
      <div className="character-status p-4">
        <h4 className="text-xl font-bold mb-3 text-japan-gold">📍 Localizações</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {locations.map(location => {
            const isCurrentLocation = character?.current_location === location.name
            
            return (
              <div
                key={location.id}
                className={`p-2 rounded cursor-pointer transition-all ${
                  isCurrentLocation 
                    ? 'bg-japan-gold text-japan-black' 
                    : 'bg-japan-black text-japan-cream hover:bg-japan-red'
                }`}
                onClick={() => setSelectedLocation(location)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {location.name} {isCurrentLocation && '📍'}
                  </span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getRegionColor(location.region) }}
                    ></div>
                    {!location.is_accessible && <span>🔒</span>}
                  </div>
                </div>
                <div className="text-sm opacity-70">
                  {location.region}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
