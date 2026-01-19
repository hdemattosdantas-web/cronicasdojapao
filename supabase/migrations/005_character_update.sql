-- Atualizar tabela characters para incluir novos campos
ALTER TABLE characters ADD COLUMN IF NOT EXISTS profession TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS travel_reason TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS current_location TEXT DEFAULT 'Vila de origem';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS honor INTEGER DEFAULT 50;

-- Remover campo age desnecessário (personagens começam sempre jovens)
-- ALTER TABLE characters DROP COLUMN IF EXISTS age;

-- Atualizar personagens existentes
UPDATE characters 
SET 
  profession = 'campones',
  current_location = 'Vila de origem',
  honor = 50
WHERE profession IS NULL OR current_location IS NULL OR honor IS NULL;
