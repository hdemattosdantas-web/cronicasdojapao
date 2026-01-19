'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Friend {
  id: string
  username: string
  full_name: string
  is_online: boolean
  last_seen: string
}

interface FriendRequest {
  id: string
  sender_id: string
  receiver_id: string
  sender_username: string
  created_at: string
}

export default function FriendsList({ userId }: { userId: string }) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [newFriendEmail, setNewFriendEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFriends()
    fetchFriendRequests()

    // Real-time subscription para status online
    const friendsSubscription = supabase
      .channel('friends_status')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          setFriends(prev => prev.map(friend => 
            friend.id === payload.new.id 
              ? { ...friend, is_online: payload.new.is_online }
              : friend
          ))
        }
      )
      .subscribe()

    return () => {
      friendsSubscription.unsubscribe()
    }
  }, [userId])

  const fetchFriends = async () => {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        friend_id,
        profiles!friend_id (
          id,
          username,
          full_name,
          is_online,
          last_seen
        )
      `)
      .eq('user_id', userId)

    if (data && !error) {
      const validProfiles = data
        .map(item => item.profiles)
        .filter((profile): profile is NonNullable<typeof profile> => profile !== null)
        .map((profile): Friend => {
          const p = profile as any
          return {
            id: p.id,
            username: p.username,
            full_name: p.full_name,
            is_online: p.is_online,
            last_seen: p.last_seen
          }
        })
      setFriends(validProfiles)
    }
    setLoading(false)
  }

  const fetchFriendRequests = async () => {
    const { data, error } = await supabase
      .from('friend_requests')
      .select(`
        id,
        sender_id,
        sender_username,
        created_at
      `)
      .eq('receiver_id', userId)
      .eq('status', 'pending')

    if (data && !error) {
      const validRequests = data.map((request): FriendRequest => ({
        id: request.id,
        sender_id: request.sender_id,
        receiver_id: userId, // Adicionando receiver_id que estava faltando
        sender_username: request.sender_username,
        created_at: request.created_at
      }))
      setFriendRequests(validRequests)
    }
  }

  const sendFriendRequest = async () => {
    if (!newFriendEmail.trim()) return

    // Primeiro, encontrar o usuário pelo email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('email', newFriendEmail.trim())
      .single()

    if (userError || !userData) {
      alert('Usuário não encontrado')
      return
    }

    // Verificar se já são amigos
    const { data: existingFriend } = await supabase
      .from('friends')
      .select('id')
      .or(`(user_id.eq.${userId},friend_id.eq.${userData.id}),(user_id.eq.${userData.id},friend_id.eq.${userId})`)
      .single()

    if (existingFriend) {
      alert('Vocês já são amigos')
      return
    }

    // Enviar solicitação
    const { error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: userId,
        receiver_id: userData.id,
        sender_username: (await supabase.from('profiles').select('username').eq('id', userId).single()).data?.username
      })

    if (error) {
      alert('Erro ao enviar solicitação: ' + error.message)
    } else {
      alert('Solicitação enviada!')
      setNewFriendEmail('')
    }
  }

  const acceptFriendRequest = async (requestId: string, senderId: string) => {
    // Adicionar à tabela de amigos
    const { error: friendError } = await supabase
      .from('friends')
      .insert([
        { user_id: userId, friend_id: senderId },
        { user_id: senderId, friend_id: userId }
      ])

    if (friendError) {
      alert('Erro ao aceitar solicitação: ' + friendError.message)
      return
    }

    // Atualizar status da solicitação
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId)

    if (error) {
      alert('Erro ao atualizar solicitação: ' + error.message)
    } else {
      setFriendRequests(prev => prev.filter(req => req.id !== requestId))
      fetchFriends()
    }
  }

  const rejectFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId)

    if (error) {
      alert('Erro ao rejeitar solicitação: ' + error.message)
    } else {
      setFriendRequests(prev => prev.filter(req => req.id !== requestId))
    }
  }

  const inviteToGame = async (friendId: string) => {
    // Aqui você implementaria a lógica de convite para mesa
    alert(`Convite enviado para o amigo! (ID: ${friendId})`)
  }

  if (loading) {
    return <div className="text-japan-cream">Carregando amigos...</div>
  }

  return (
    <div className="space-y-6">
      {/* Adicionar Amigo */}
      <div className="character-status p-4">
        <h3 className="text-xl font-bold mb-4 text-japan-gold">👥 Adicionar Amigo</h3>
        <div className="flex gap-2">
          <input
            type="email"
            value={newFriendEmail}
            onChange={(e) => setNewFriendEmail(e.target.value)}
            placeholder="Email do amigo"
            className="flex-1 p-2 japan-input text-japan-cream"
          />
          <button
            onClick={sendFriendRequest}
            className="japan-button px-4 py-2"
          >
            Enviar
          </button>
        </div>
      </div>

      {/* Solicitações Pendentes */}
      {friendRequests.length > 0 && (
        <div className="character-status p-4">
          <h3 className="text-xl font-bold mb-4 text-japan-gold">📨 Solicitações</h3>
          <div className="space-y-2">
            {friendRequests.map(request => (
              <div key={request.id} className="flex items-center justify-between p-2 bg-japan-black rounded">
                <span className="text-japan-cream">{request.sender_username}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptFriendRequest(request.id, request.sender_id)}
                    className="japan-button px-3 py-1 text-sm"
                  >
                    Aceitar
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(request.id)}
                    className="japan-button px-3 py-1 text-sm"
                  >
                    Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Amigos */}
      <div className="character-status p-4">
        <h3 className="text-xl font-bold mb-4 text-japan-gold">👥 Amigos</h3>
        {friends.length === 0 ? (
          <p className="text-japan-cream opacity-60">Nenhum amigo adicionado ainda</p>
        ) : (
          <div className="space-y-2">
            {friends.map(friend => (
              <div key={friend.id} className="flex items-center justify-between p-3 bg-japan-black rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${friend.is_online ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <div>
                    <div className="text-japan-cream font-medium">{friend.username}</div>
                    <div className="text-japan-cream opacity-60 text-sm">
                      {friend.is_online ? 'Online' : `Offline: ${new Date(friend.last_seen).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {friend.is_online && (
                    <button
                      onClick={() => inviteToGame(friend.id)}
                      className="japan-button px-3 py-1 text-sm"
                    >
                      🎌 Convidar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
