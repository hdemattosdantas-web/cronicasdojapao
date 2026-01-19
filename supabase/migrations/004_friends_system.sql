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

-- Tabela de mesas de jogo (para multiplayer)
CREATE TABLE IF NOT EXISTS game_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_private BOOLEAN DEFAULT false,
    max_players INTEGER DEFAULT 4,
    current_players INTEGER DEFAULT 0,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de participantes da mesa
CREATE TABLE IF NOT EXISTS table_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID REFERENCES game_tables(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(table_id, user_id)
);

-- Atualizar profiles para incluir status online
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Inserir localizações iniciais do mapa
INSERT INTO map_locations (name, region, x, y, description, is_accessible) VALUES
('Nagoya', 'owari', 200, 200, 'Principal cidade da região de Owari, centro de comércio e cultura.', true),
('Kōfu', 'kai', 600, 200, 'Cidade cercada por montanhas, conhecida por seus guerreiros.', true),
('Matsumoto', 'shinano', 300, 400, 'Cidade com famoso castelo negro, ponto estratégico no interior.', false),
('Gifu', 'mino', 500, 400, 'Cidade no vale, importante para agricultura e comércio.', false),
('Edo', 'musashi', 400, 300, 'Grande capital, centro político e econômico do Japão.', true),
('Kanazawa', 'echigo', 400, 500, 'Cidade no norte, conhecida por seu clima rigoroso.', false);

-- RLS para amigos
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
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

-- RLS para localizações (todos podem ver)
ALTER TABLE map_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view map locations" ON map_locations
    FOR SELECT USING (true);

-- RLS para mesas de jogo
ALTER TABLE game_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view public tables" ON game_tables
    FOR SELECT USING (NOT is_private OR host_id = auth.uid());

CREATE POLICY "Users can create tables" ON game_tables
    FOR INSERT WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts can update their tables" ON game_tables
    FOR UPDATE USING (host_id = auth.uid());

CREATE POLICY "Hosts can delete their tables" ON game_tables
    FOR DELETE USING (host_id = auth.uid());

-- RLS para participantes
ALTER TABLE table_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view table participants" ON table_participants
    FOR SELECT USING (
        table_id IN (
            SELECT id FROM game_tables 
            WHERE NOT is_private OR host_id = auth.uid()
        )
    );

CREATE POLICY "Users can join tables" ON table_participants
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Trigger para atualizar last_seen quando usuário faz login
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles 
    SET last_seen = NOW(), is_online = true 
    WHERE id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para definir offline quando usuário faz logout
CREATE OR REPLACE FUNCTION set_offline()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles 
    SET is_online = false 
    WHERE id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contagem de jogadores
CREATE OR REPLACE FUNCTION update_table_players()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE game_tables 
        SET current_players = (
            SELECT COUNT(*) FROM table_participants 
            WHERE table_id = NEW.table_id
        )
        WHERE id = NEW.table_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE game_tables 
        SET current_players = (
            SELECT COUNT(*) FROM table_participants 
            WHERE table_id = OLD.table_id
        )
        WHERE id = OLD.table_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_last_seen_trigger
    AFTER INSERT ON auth.sessions
    FOR EACH ROW EXECUTE FUNCTION update_last_seen();

-- Trigger para participantes
CREATE TRIGGER update_table_players_trigger
    AFTER INSERT OR DELETE ON table_participants
    FOR EACH ROW EXECUTE FUNCTION update_table_players();
