-- Sistema de localizações e eventos do Japão Sengoku

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

-- Tabela de eventos
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    location_id UUID REFERENCES map_locations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de eventos de personagem
CREATE TABLE IF NOT EXISTS character_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    participated BOOLEAN DEFAULT false,
    outcome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir localizações iniciais do Japão Sengoku
INSERT INTO map_locations (name, region, x, y, description, is_accessible) VALUES
('Quiosque de Ferreiro', 'Owari', 100, 150, 'Uma pequena ferraria onde o ferreiro local trabalha dia e noite. O som do martelo ecoa pela vila.', true),
('Templo Budista', 'Kai', 200, 100, 'Um templo sereno nos montes. Monges em meditação, incenso queimando, sinos tocando ao vento.', true),
('Posto de Mensageiros', 'Shinano', 150, 200, 'Estação onde mensageiros trocam correspondências e notícias entre províncias.', true),
('Mercado Local', 'Mino', 250, 180, 'Mercado movimentado com comerciantes vendendo arroz, tecidos e ferramentas.', true),
('Ponto de Encontro de Ronin', 'Musashi', 180, 120, 'Local onde samurais sem mestre se encontram para buscar trabalho ou companhia.', true),
('Arrozal Camponês', 'Echigo', 120, 250, 'Vastos campos de arroz onde camponeses trabalham duro sob o sol.', true),
('Casa de Chá', 'Owari', 80, 100, 'Uma casa de chá tradicional onde viajantes descansam e compartilham histórias.', true),
('Estalagem', 'Kai', 220, 160, 'Estalagem simples onde viajantes podem passar a noite por um preço justo.', true),
('Ponte de Madeira', 'Shinano', 170, 220, 'Ponte antiga sobre um rio claro. Local de encontros secretos à noite.', true),
('Santuário Xintoísta', 'Mino', 280, 140, 'Pequeno santuário dedicado a kami locais. Ofertas de arroz e saquê.', true);

-- Inserir eventos iniciais
INSERT INTO events (title, description, location_id, event_type) VALUES
('Festival da Colheita', 'Os aldeões celebram a colheita do arroz com música, dança e comida.', 
 (SELECT id FROM map_locations WHERE name = 'Mercado Local'), 'festival'),
('Chegada de Viajantes', 'Um grupo de viajantes chegou à vila trazendo notícias de outras províncias.', 
 (SELECT id FROM map_locations WHERE name = 'Estalagem'), 'social'),
('Tempestade Aproximando', 'Nuvens escuras se formam no horizonte. Uma tempestade está chegando.', 
 (SELECT id FROM map_locations WHERE name = 'Ponte de Madeira'), 'weather'),
('Cerimônia no Templo', 'Os monges realizam uma cerimônia matinal de oração e meditação.', 
 (SELECT id FROM map_locations WHERE name = 'Templo Budista'), 'religious'),
('Disputa de Mercadores', 'Comerciantes discutem preços no mercado. A tensão está no ar.', 
 (SELECT id FROM map_locations WHERE name = 'Mercado Local'), 'conflict'),
('Treinamento de Samurai', 'Um ronin pratica seus golpes com a espada ao amanhecer.', 
 (SELECT id FROM map_locations WHERE name = 'Ponto de Encontro de Ronin'), 'training'),
('Doença na Vila', 'Vários aldeões estão doentes com uma febre misteriosa.', 
 (SELECT id FROM map_locations WHERE name = 'Arrozal Camponês'), 'health'),
('Encontro Secreto', 'Figuras misteriosas se encontram na casa de chá após o anoitecer.', 
 (SELECT id FROM map_locations WHERE name = 'Casa de Chá'), 'mystery'),
('Oferenda no Santuário', 'Um aldeão faz uma oferenda especial no santuário xintoísta.', 
 (SELECT id FROM map_locations WHERE name = 'Santuário Xintoísta'), 'religious'),
('Mensagem Urgente', 'Um mensageiro chega com uma mensagem urgente para o líder local.', 
 (SELECT id FROM map_locations WHERE name = 'Posto de Mensageiros'), 'mission');

-- RLS para map_locations
ALTER TABLE map_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos podem ver localizações" ON map_locations FOR SELECT USING (true);
CREATE POLICY "Apenas admin pode gerenciar localizações" ON map_locations FOR ALL USING (false);

-- RLS para events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos podem ver eventos" ON events FOR SELECT USING (true);
CREATE POLICY "Apenas admin pode gerenciar eventos" ON events FOR ALL USING (false);

-- RLS para character_events
ALTER TABLE character_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver seus próprios eventos" ON character_events FOR SELECT USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
);
CREATE POLICY "Usuários podem gerenciar seus eventos" ON character_events FOR ALL USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_map_locations_region ON map_locations(region);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(location_id);
CREATE INDEX IF NOT EXISTS idx_character_events_character ON character_events(character_id);
CREATE INDEX IF NOT EXISTS idx_character_events_event ON character_events(event_id);
