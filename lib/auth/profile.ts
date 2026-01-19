import { supabase } from '@/lib/supabase'

export async function ensureUserProfile(user: any) {
  if (!user) return null

  // Verificar se o perfil já existe
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (existingProfile) {
    return existingProfile
  }

  // Criar perfil se não existir
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'user_' + user.id.slice(0, 8),
      full_name: user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Usuário',
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar perfil:', error)
    return null
  }

  return newProfile
}
