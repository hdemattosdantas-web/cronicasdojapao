-- Tabela para encontros com criaturas
CREATE TABLE IF NOT EXISTS creature_encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    creature_type TEXT NOT NULL CHECK (creature_type IN ('substitute', 'contact_entity', 'ghoul')),
    encounter_id TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('subtle', 'moderate', 'severe')),
    trigger TEXT NOT NULL CHECK (trigger IN ('location', 'time', 'action', 'social')),
    effects JSONB NOT NULL,
    resolution JSONB,
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Tabela para traços permanentes de encontros
CREATE TABLE IF NOT EXISTS character_traits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    trait_type TEXT NOT NULL CHECK (trait_type IN ('spiritual_perception', 'psychological_mark', 'physical_corruption', 'entity_contact')),
    trait_value TEXT NOT NULL,
    description TEXT,
    permanent BOOLEAN DEFAULT true,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(character_id, trait_type)
);

-- Atualizar characters para incluir traços especiais
ALTER TABLE characters ADD COLUMN IF NOT EXISTS special_traits JSONB DEFAULT '[]'::jsonb;

-- RLS para creature_encounters
ALTER TABLE creature_encounters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their encounters" ON creature_encounters
    FOR SELECT USING (
        character_id = auth.uid()
    );

CREATE POLICY "Users can insert their encounters" ON creature_encounters
    FOR INSERT WITH CHECK (
        character_id = auth.uid()
    );

CREATE POLICY "Users can update their encounters" ON creature_encounters
    FOR UPDATE USING (
        character_id = auth.uid()
    );

-- RLS para character_traits
ALTER TABLE character_traits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their traits" ON character_traits
    FOR SELECT USING (
        character_id = auth.uid()
    );

CREATE POLICY "Users can insert their traits" ON character_traits
    FOR INSERT WITH CHECK (
        character_id = auth.uid()
    );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_creature_encounters_character ON creature_encounters(character_id);
CREATE INDEX IF NOT EXISTS idx_creature_encounters_type ON creature_encounters(creature_type);
CREATE INDEX IF NOT EXISTS idx_character_traits_character ON character_traits(character_id);
CREATE INDEX IF NOT EXISTS idx_character_traits_type ON character_traits(trait_type);
