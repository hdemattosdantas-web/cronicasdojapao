-- Sistema completo de personagens

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id,
    COALESCE(
      CASE 
        WHEN jsonb_typeof(raw_user_meta_data->'username') = 'string' 
        THEN raw_user_meta_data->>'username' 
        ELSE NULL 
      END,
      CASE 
        WHEN jsonb_typeof(raw_user_meta_data->'email') = 'string' 
        THEN raw_user_meta_data->>'email' 
        ELSE NULL 
      END,
      'user_' || left(id::text, 8)
    ),
    COALESCE(
      CASE 
        WHEN jsonb_typeof(raw_user_meta_data->'full_name') = 'string' 
        THEN raw_user_meta_data->>'full_name' 
        ELSE NULL 
      END,
      'Novo Usuário'
    )
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS para characters
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own characters" ON characters;
DROP POLICY IF EXISTS "Users can insert own characters" ON characters;
DROP POLICY IF EXISTS "Users can update own characters" ON characters;
DROP POLICY IF EXISTS "Users can delete own characters" ON characters;
CREATE POLICY "Users can view own characters" ON characters FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own characters" ON characters FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own characters" ON characters FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own characters" ON characters FOR DELETE USING (user_id = auth.uid());
