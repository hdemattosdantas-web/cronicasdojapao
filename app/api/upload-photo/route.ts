import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const characterId = formData.get('characterId') as string

    if (!file || !characterId) {
      return NextResponse.json({ error: 'Arquivo e ID do personagem são obrigatórios' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Apenas imagens JPEG, PNG ou WebP são permitidas' }, { status: 400 })
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 })
    }

    // Criar diretório de uploads se não existir
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'characters')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Diretório já existe
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split('.').pop()
    const fileName = `${randomUUID()}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Salvar arquivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // URL pública
    const photoUrl = `/uploads/characters/${fileName}`

    // Salvar no banco de dados
    const { error } = await supabase
      .from('character_photos')
      .insert({
        character_id: characterId,
        photo_url: photoUrl,
        photo_name: file.name,
        file_size: file.size,
        mime_type: file.type
      })

    if (error) {
      return NextResponse.json({ error: 'Erro ao salvar no banco de dados' }, { status: 500 })
    }

    // Atualizar personagem com a foto
    await supabase
      .from('characters')
      .update({ photo_url: photoUrl })
      .eq('id', characterId)

    return NextResponse.json({ 
      success: true, 
      photoUrl,
      message: 'Foto enviada com sucesso'
    })

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
