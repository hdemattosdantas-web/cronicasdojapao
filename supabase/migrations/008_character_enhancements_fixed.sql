-- Sistema aprimorado de personagens com idade, fotos e múltiplos personagens

-- Adicionar colunas para sistema aprimorado (sem duplicar as que já existem)
ALTER TABLE characters ADD COLUMN IF NOT EXISTS age INTEGER DEFAULT 18 CHECK (age >= 18);
ALTER TABLE characters ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS birth_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE characters ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Adicionar colunas de profissão e motivo de viagem (se não existirem)
ALTER TABLE characters ADD COLUMN IF NOT EXISTS profession TEXT DEFAULT 'campones';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS travel_reason TEXT;

-- Tabela para uploads de fotos de personagens
CREATE TABLE IF NOT EXISTS character_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    photo_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para calcular stats baseados na idade e profissão
CREATE OR REPLACE FUNCTION calculate_character_stats(
    character_age INTEGER,
    character_profession TEXT
) RETURNS JSONB AS $$
DECLARE
    base_strength INTEGER := 10;
    base_agility INTEGER := 10;
    base_intelligence INTEGER := 10;
    base_charisma INTEGER := 10;
    result JSONB;
BEGIN
    -- Influência da idade
    IF character_age < 25 THEN
        base_agility := base_agility + 2;
        base_strength := base_strength + 1;
    ELSIF character_age < 40 THEN
        base_strength := base_strength + 3;
        base_charisma := base_charisma + 1;
    ELSIF character_age < 55 THEN
        base_intelligence := base_intelligence + 2;
        base_charisma := base_charisma + 2;
    ELSE
        base_intelligence := base_intelligence + 3;
        base_charisma := base_charisma + 1;
    END IF;
    
    -- Influência da profissão
    CASE character_profession
        WHEN 'ferreiro' THEN
            base_strength := base_strength + 2;
            base_intelligence := base_intelligence + 1;
        WHEN 'campones' THEN
            base_strength := base_strength + 1;
            base_agility := base_agility + 1;
        WHEN 'mensageiro' THEN
            base_agility := base_agility + 3;
            base_charisma := base_charisma + 1;
        WHEN 'monge_novico' THEN
            base_intelligence := base_intelligence + 2;
            base_charisma := base_charisma + 1;
        WHEN 'ronin' THEN
            base_strength := base_strength + 2;
            base_agility := base_agility + 2;
            base_charisma := base_charisma - 1;
        WHEN 'artesao' THEN
            base_intelligence := base_intelligence + 2;
            base_agility := base_agility + 1;
        WHEN 'comerciante' THEN
            base_charisma := base_charisma + 3;
            base_intelligence := base_intelligence + 1;
    END CASE;
    
    -- Garantir valores mínimos e máximos
    base_strength := GREATEST(5, LEAST(20, base_strength));
    base_agility := GREATEST(5, LEAST(20, base_agility));
    base_intelligence := GREATEST(5, LEAST(20, base_intelligence));
    base_charisma := GREATEST(5, LEAST(20, base_charisma));
    
    result := jsonb_build_object(
        'strength', base_strength,
        'agility', base_agility,
        'intelligence', base_intelligence,
        'charisma', base_charisma
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar stats automaticamente quando idade ou profissão mudar
CREATE OR REPLACE FUNCTION update_character_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular novos stats
    UPDATE characters SET
        strength = (calculate_character_stats(NEW.age, NEW.profession) ->> 'strength')::INTEGER,
        agility = (calculate_character_stats(NEW.age, NEW.profession) ->> 'agility')::INTEGER,
        intelligence = (calculate_character_stats(NEW.age, NEW.profession) ->> 'intelligence')::INTEGER,
        charisma = (calculate_character_stats(NEW.age, NEW.profession) ->> 'charisma')::INTEGER
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_update_character_stats ON characters;
CREATE TRIGGER trigger_update_character_stats
    AFTER INSERT OR UPDATE OF age, profession
    ON characters
    FOR EACH ROW
    EXECUTE FUNCTION update_character_stats();

-- RLS para character_photos
ALTER TABLE character_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their character photos" ON character_photos
    FOR SELECT USING (
        character_id IN (
            SELECT id FROM characters WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their character photos" ON character_photos
    FOR INSERT WITH CHECK (
        character_id IN (
            SELECT id FROM characters WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their character photos" ON character_photos
    FOR UPDATE USING (
        character_id IN (
            SELECT id FROM characters WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their character photos" ON character_photos
    FOR DELETE USING (
        character_id IN (
            SELECT id FROM characters WHERE user_id = auth.uid()
        )
    );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_character_photos_character ON character_photos(character_id);
CREATE INDEX IF NOT EXISTS idx_characters_user_active ON characters(user_id, is_active);
