-- Criação das tabelas para o RPG Crônicas do Japão

-- Tabela de perfis de usuários (extensão da auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de personagens
CREATE TABLE IF NOT EXISTS characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL DEFAULT 16,
  clan TEXT NOT NULL DEFAULT 'oda',
  
  -- Atributos principais
  health INTEGER NOT NULL DEFAULT 100,
  honor INTEGER NOT NULL DEFAULT 50,
  gold INTEGER NOT NULL DEFAULT 10,
  
  -- Atributos físicos e mentais
  strength INTEGER NOT NULL DEFAULT 10,
  agility INTEGER NOT NULL DEFAULT 10,
  intelligence INTEGER NOT NULL DEFAULT 10,
  charisma INTEGER NOT NULL DEFAULT 10,
  
  -- Status sociais
  marital_status TEXT NOT NULL DEFAULT 'single' CHECK (marital_status IN ('single', 'married', 'widowed')),
  spouse_id UUID REFERENCES characters(id),
  children_count INTEGER NOT NULL DEFAULT 0,
  
  -- Sistema de vida e tempo
  birth_year INTEGER NOT NULL DEFAULT 1467,
  current_year INTEGER NOT NULL DEFAULT 1467,
  is_alive BOOLEAN NOT NULL DEFAULT true,
  death_reason TEXT,
  
  -- Localização
  province TEXT NOT NULL DEFAULT 'owari',
  location TEXT NOT NULL DEFAULT 'aldeia',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamentos entre personagens
CREATE TABLE IF NOT EXISTS character_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  related_character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('parent', 'child', 'spouse', 'sibling')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(character_id, related_character_id, relationship_type)
);

-- Tabela de eventos do jogo
CREATE TABLE IF NOT EXISTS game_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  choices JSONB,
  consequences JSONB,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de decisões
CREATE TABLE IF NOT EXISTS character_decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  event_id UUID REFERENCES game_events(id) ON DELETE CASCADE,
  choice_index INTEGER NOT NULL,
  consequence TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criação de índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_clan ON characters(clan);
CREATE INDEX IF NOT EXISTS idx_characters_is_alive ON characters(is_alive);
CREATE INDEX IF NOT EXISTS idx_character_relationships_character_id ON character_relationships(character_id);
CREATE INDEX IF NOT EXISTS idx_game_events_character_id ON game_events(character_id);
CREATE INDEX IF NOT EXISTS idx_game_events_year ON game_events(year);

-- RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_decisions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own characters" ON characters;
DROP POLICY IF EXISTS "Users can insert own characters" ON characters;
DROP POLICY IF EXISTS "Users can update own characters" ON characters;
DROP POLICY IF EXISTS "Users can delete own characters" ON characters;
CREATE POLICY "Users can view own characters" ON characters FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own characters" ON characters FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own characters" ON characters FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own characters" ON characters FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own relationships" ON character_relationships FOR SELECT USING (
  EXISTS (SELECT 1 FROM characters WHERE id = character_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view own events" ON game_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM characters WHERE id = character_id AND user_id = auth.uid())
);

CREATE POLICY "Users can insert own events" ON game_events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM characters WHERE id = character_id AND user_id = auth.uid())
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
