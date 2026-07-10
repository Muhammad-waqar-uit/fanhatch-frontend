import { env } from '@/config/env'
import { apiClient } from '@/shared/api/client'

export interface UploadResult {
  url: string
  key: string
}

export const IMAGE_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
export const MAX_IMAGE_MB = 10

/**
 * Upload an image to `POST /media` → { url, key }. In mock mode returns a local
 * object URL so previews work with no backend. The backend optimizes + stores
 * (local disk in dev, S3 in prod, chosen by STORAGE_DRIVER).
 */
export async function uploadImage(file: File, folder = 'misc'): Promise<UploadResult> {
  if (env.useMocks) {
    return { url: URL.createObjectURL(file), key: `mock/${file.name}` }
  }
  const form = new FormData()
  form.append('file', file)
  form.append('folder', folder)
  return apiClient.post('/media', form) as unknown as Promise<UploadResult>
}
