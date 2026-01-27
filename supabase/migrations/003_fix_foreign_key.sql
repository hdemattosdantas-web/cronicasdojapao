-- Remover constraint de chave estrangeira temporariamente
ALTER TABLE characters DROP CONSTRAINT IF EXISTS characters_user_id_fkey;

-- Recriar constraint com ON DELETE CASCADE
ALTER TABLE characters 
ADD CONSTRAINT characters_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Limpar dados inconsistentes
DELETE FROM characters WHERE user_id NOT IN (SELECT id FROM profiles);

-- Criar perfis para usuários existentes na auth.users
INSERT INTO profiles (id, username, full_name)
SELECT 
    id,
    COALESCE(
        CASE 
            WHEN jsonb_typeof(raw_user_meta_data->'username') = 'string' 
            THEN raw_user_meta_data->>'username' 
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
FROM auth.users 
WHERE id NOT IN (SELECT id FROM profiles);

-- Atualizar trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id,
    COALESCE(
        CASE 
            WHEN jsonb_typeof(new.raw_user_meta_data->'username') = 'string' 
            THEN new.raw_user_meta_data->>'username' 
            ELSE NULL 
        END,
        'user_' || left(new.id::text, 8)
    ),
    COALESCE(
        CASE 
            WHEN jsonb_typeof(new.raw_user_meta_data->'full_name') = 'string' 
            THEN new.raw_user_meta_data->>'full_name' 
            ELSE NULL 
        END,
        'Novo Usuário'
    )
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente (já existe na 003)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
