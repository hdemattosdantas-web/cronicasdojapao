export interface Character {
  id: string
  user_id: string
  name: string
  age: number
  clan: string
  health: number
  honor: number
  gold: number
  created_at: string
  updated_at: string
  
  // Atributos físicos
  strength: number
  agility: number
  intelligence: number
  charisma: number
  
  // Status sociais
  marital_status: 'single' | 'married' | 'widowed'
  spouse_id?: string
  children_count: number
  
  // Sistema de vida
  birth_year: number
  current_year: number
  is_alive: boolean
  death_reason?: string
  
  // Localização
  province: string
  location: string
}

export interface CharacterRelationship {
  id: string
  character_id: string
  related_character_id: string
  relationship_type: 'parent' | 'child' | 'spouse' | 'sibling'
  created_at: string
}

export interface GameEvent {
  id: string
  character_id: string
  event_type: string
  title: string
  description: string
  choices: string[]
  consequences: string[]
  year: number
  created_at: string
}
