-- Tabela de caminhos secretos disponíveis (criar PRIMEIRO)
CREATE TABLE IF NOT EXISTS secret_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('yokai', 'kami', 'onmyoji', 'tsukumogami')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir caminhos secretos básicos
INSERT INTO secret_paths (name, description, type) VALUES
('Caçador de Yōkai', 'Você começa a ver padrões que outros não percebem. Rastros que se movem de forma antinatural, sombras que não correspondem a nada.', 'yokai'),
('Sacerdote de Kami', 'Os espíritos da natureza começam a responder suas preces. Você pode aprender a se comunicar com entidades que outros temem.', 'kami'),
('Onmyōji', 'Você percebe que as emoções afetam o mundo espiritual. Através da disciplina, pode aprender a manipular essa energia.', 'onmyoji'),
('Monge Tsukumogami', 'Você descobre que os espíritos podem ser contidos, acalmados e até liberados. Um caminho perigoso que exige grande disciplina.', 'tsukumogami');

-- Tabela para caminhos secretos descobertos (criar DEPOIS)
CREATE TABLE IF NOT EXISTS character_secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    secret_path_id UUID REFERENCES secret_paths(id) ON DELETE CASCADE,
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(character_id, secret_path_id)
);

-- Atualizar characters para incluir caminho secreto
ALTER TABLE characters ADD COLUMN IF NOT EXISTS secret_path UUID REFERENCES secret_paths(id);

-- RLS para character_secrets
ALTER TABLE character_secrets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their secrets" ON character_secrets
    FOR SELECT USING (
        character_id = auth.uid()
    );

CREATE POLICY "Users can insert their secrets" ON character_secrets
    FOR INSERT WITH CHECK (
        character_id = auth.uid()
    );

-- RLS para secret_paths
ALTER TABLE secret_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view secret paths" ON secret_paths
    FOR SELECT USING (true);
