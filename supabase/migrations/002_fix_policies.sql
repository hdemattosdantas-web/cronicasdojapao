-- Remover políticas existentes para recriá-las corretamente
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own characters" ON characters;
DROP POLICY IF EXISTS "Users can insert own characters" ON characters;
DROP POLICY IF EXISTS "Users can update own characters" ON characters;
DROP POLICY IF EXISTS "Users can view own relationships" ON character_relationships;
DROP POLICY IF EXISTS "Users can view own events" ON game_events;
DROP POLICY IF EXISTS "Users can insert own events" ON game_events;

-- Recriar políticas de segurança
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own characters" ON characters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own characters" ON characters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own characters" ON characters FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own relationships" ON character_relationships FOR SELECT USING (
  EXISTS (SELECT 1 FROM characters WHERE id = character_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view own events" ON game_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM characters WHERE id = character_id AND user_id = auth.uid())
);

CREATE POLICY "Users can insert own events" ON game_events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM characters WHERE id = character_id AND user_id = auth.uid())
);
