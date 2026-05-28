import { adminClient } from '@/lib/supabase/admin'

export async function getCached<T>(
  key: string
): Promise<T | null> {
  try {
    const { data, error } = await adminClient
      .from('api_cache')
      .select('value, expires_at')
      .eq('key', key)
      .single()

    if (error || !data) return null

    const isExpired = new Date(data.expires_at)
      < new Date()
    if (isExpired) return null

    return data.value as T
  } catch {
    return null
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  ttlHours: number = 24
): Promise<void> {
  try {
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + ttlHours)

    await adminClient
      .from('api_cache')
      .upsert({
        key,
        value: value as object,
        cached_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      }, { onConflict: 'key' })
  } catch (error) {
    console.error('Cache set error:', error)
  }
}

export async function deleteCached(
  key: string
): Promise<void> {
  try {
    await adminClient
      .from('api_cache')
      .delete()
      .eq('key', key)
  } catch (error) {
    console.error('Cache delete error:', error)
  }
}

export async function cleanExpiredCache(): Promise<void> {
  try {
    await adminClient
      .from('api_cache')
      .delete()
      .lt('expires_at', new Date().toISOString())
  } catch (error) {
    console.error('Cache cleanup error:', error)
  }
}
