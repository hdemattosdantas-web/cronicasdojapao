-- Sistema de amigos simplificado e corrigido

-- Tabela de amigos
CREATE TABLE IF NOT EXISTS friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- Tabela de solicitações de amizade
CREATE TABLE IF NOT EXISTS friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_username TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

-- Tabela de localizações no mapa
CREATE TABLE IF NOT EXISTS map_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    description TEXT,
    is_accessible BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Atualizar profiles para incluir status online
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Inserir localizações iniciais do mapa
INSERT INTO map_locations (name, region, x, y, description, is_accessible) VALUES
('Nagoya', 'owari', 200, 200, 'Principal cidade da região de Owari, centro de comércio e cultura.', true),
('Kōfu', 'kai', 600, 200, 'Cidade cercada por montanhas, conhecida por seus guerreiros.', true),
('Matsumoto', 'shinano', 300, 400, 'Cidade com famoso castelo negro, ponto estratégico no interior.', false),
('Gifu', 'mino', 500, 400, 'Cidade no vale, importante para agricultura e comércio.', false),
('Edo', 'musashi', 400, 300, 'Grande capital, centro político e econômico do Japão.', true),
('Kanazawa', 'echigo', 400, 500, 'Cidade no norte, conhecida por seu clima rigoroso.', false)
ON CONFLICT DO NOTHING;

-- RLS para amigos
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their friends" ON friends;
DROP POLICY IF EXISTS "Users can insert their friends" ON friends;
CREATE POLICY "Users can view their friends" ON friends
    FOR SELECT USING (
        user_id = auth.uid() OR friend_id = auth.uid()
    );

CREATE POLICY "Users can insert their friends" ON friends
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

-- RLS para solicitações de amizade
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can send friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can update received requests" ON friend_requests;
CREATE POLICY "Users can view their friend requests" ON friend_requests
    FOR SELECT USING (
        sender_id = auth.uid() OR receiver_id = auth.uid()
    );

CREATE POLICY "Users can send friend requests" ON friend_requests
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
    );

CREATE POLICY "Users can update received requests" ON friend_requests
    FOR UPDATE USING (
        receiver_id = auth.uid()
    );

-- RLS para localizações
ALTER TABLE map_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone can view map locations" ON map_locations;
CREATE POLICY "Everyone can view map locations" ON map_locations
    FOR SELECT USING (true);

-- RLS para profiles (adicionar políticas online)
DROP POLICY IF EXISTS "Users can update online status" ON profiles;
CREATE POLICY "Users can update online status" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_friends_user ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_map_locations_region ON map_locations(region);
