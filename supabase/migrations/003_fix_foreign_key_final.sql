-- Versão final corrigida - Copie e cole exatamente este código

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

-- Trigger para criar perfil automaticamente (já existe na 003)
-- Não vamos duplicar o trigger
