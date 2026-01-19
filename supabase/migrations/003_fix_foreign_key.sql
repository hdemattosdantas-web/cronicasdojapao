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
    COALESCE(raw_user_meta_data->>'username', email->>'email', 'user_' || left(id::text, 8)) as username,
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'username', email->>'email', 'Usuário') as full_name
FROM auth.users 
WHERE id NOT IN (SELECT id FROM profiles);

-- Atualizar trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', new.email::text),
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'username', new.email::text)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
