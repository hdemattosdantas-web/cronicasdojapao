# Ordem de Execução das Migrations - Crônicas do Japão

## ✅ Arquivos Corrigidos e Criados:

### 1. 001_create_tables.sql ✅
- Tabelas básicas (profiles, characters)
- Estrutura inicial do jogo
- Atributos básicos de personagem

### 2. 002_fix_policies.sql ✅
- RLS policies para segurança
- Configuração de acesso
- Políticas de visualização

### 3. 003_character_system.sql ✅ (NOVO)
- Sistema completo de personagens
- Função handle_new_user()
- Triggers automáticos
- RLS para characters e profiles

### 4. 004_friends_system.sql ✅
- Sistema de amigos
- Solicitações de amizade
- RLS para sistema social

### 5. 005_locations_events.sql ✅ (NOVO)
- Mapa do Japão Sengoku
- 10 localizações temáticas
- Sistema de eventos
- RLS para localizações

### 6. 006_secret_society.sql ✅
- Sociedades secretas
- Caminhos ocultos
- Sistema de progressão

### 7. 007_creature_encounters.sql ✅
- Criaturas anômalas
- Sistema de encontros
- Traços permanentes

### 8. 008_character_enhancements_fixed.sql ✅ (NOVO)
- Sistema de idade (18+)
- Upload de fotos
- Stats automáticos
- Múltiplos personagens

## 🚀 Ordem de Execução:

1. `001_create_tables.sql`
2. `002_fix_policies.sql`
3. `003_character_system.sql`
4. `004_friends_system.sql`
5. `005_locations_events.sql`
6. `006_secret_society.sql`
7. `007_creature_encounters.sql`
8. `008_character_enhancements_fixed.sql`

## ⚠️ Arquivos Antigos a Ignorar:

- `003_fix_foreign_key.sql` ❌ (substituído pelo 003)
- `005_character_update.sql` ❌ (substituído pelo 005)
- `008_character_enhancements.sql` ❌ (substituído pelo 008_fixed)

## 🎮 Features Após Execução:

- ✅ Sistema completo de personagens
- ✅ Idade influenciando stats (18+)
- ✅ Upload de fotos para avatares
- ✅ Múltiplos personagens por usuário
- ✅ Sistema de amigos e solicitações
- ✅ Mapa interativo do Japão
- ✅ Eventos dinâmicos
- ✅ Sociedades secretas
- ✅ Criaturas anômalas
- ✅ Sistema de combate
- ✅ Multiplayer real-time

## 🗄️ Tabelas Criadas:

- profiles
- characters
- friends
- friend_requests
- map_locations
- events
- character_events
- secret_paths
- character_secrets
- creature_encounters
- character_traits
- character_photos

## 🔐 Segurança:

- RLS configurado em todas as tabelas
- Acesso apenas para dados do usuário
- Proteção contra acessos indevidos
