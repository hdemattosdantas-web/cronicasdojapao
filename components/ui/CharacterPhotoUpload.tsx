'use client'

import { useState, useRef } from 'react'

interface CharacterPhotoUploadProps {
  characterId: string
  currentPhoto?: string
  onPhotoUploaded: (photoUrl: string) => void
}

export default function CharacterPhotoUpload({ characterId, currentPhoto, onPhotoUploaded }: CharacterPhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentPhoto || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Apenas imagens JPEG, PNG ou WebP são permitidas')
        return
      }

      // Validar tamanho
      if (file.size > 5 * 1024 * 1024) {
        alert('Arquivo muito grande. Máximo 5MB')
        return
      }

      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Fazer upload
      uploadPhoto(file)
    }
  }

  const uploadPhoto = async (file: File) => {
    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('characterId', characterId)

      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        onPhotoUploaded(result.photoUrl)
        alert('Foto enviada com sucesso!')
      } else {
        alert('Erro ao enviar foto: ' + result.error)
        setPreview(currentPhoto || null)
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao enviar foto')
      setPreview(currentPhoto || null)
    } finally {
      setUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        {preview ? (
          <img
            src={preview}
            alt="Foto do personagem"
            className="w-32 h-32 rounded-full object-cover border-4 border-japan-gold"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-japan-black border-4 border-japan-gold flex items-center justify-center">
            <span className="text-japan-cream text-4xl">👤</span>
          </div>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="text-japan-cream">Enviando...</div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        onClick={handleClick}
        disabled={uploading}
        className="japan-button px-4 py-2 text-sm disabled:opacity-50"
      >
        {uploading ? 'Enviando...' : currentPhoto ? 'Trocar Foto' : 'Adicionar Foto'}
      </button>

      <div className="text-xs text-japan-cream opacity-70 text-center">
        <p>JPEG, PNG ou WebP</p>
        <p>Máximo 5MB</p>
      </div>
    </div>
  )
}
