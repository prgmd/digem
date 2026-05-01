import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import AlbumsClient, { Album } from '@/components/AlbumsClient'
import Loading from './loading'

export default async function AlbumsPage() {
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .order('release_date', { ascending: false })

  if (error) throw error

  const albums: Album[] = data ?? []

  return (
    <Suspense fallback={<Loading />}>
      <AlbumsClient albums={albums} />
    </Suspense>
  )
}
