import { supabase } from '@/lib/supabase'
import AlbumsClient, { Album } from '@/components/AlbumsClient'

export default async function AlbumsPage() {
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .order('release_date', { ascending: false })

  const albums: Album[] = error || !data ? [] : data

  return <AlbumsClient albums={albums} />
}
