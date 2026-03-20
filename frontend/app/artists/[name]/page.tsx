import { supabase } from '@/lib/supabase'
import ArtistClient from '@/components/ArtistClient'

interface Props {
  params: Promise<{ name: string }>
}

export default async function ArtistPage({ params }: Props) {
  const { name } = await params
  const decodedName = decodeURIComponent(name)

  const { data: artistData } = await supabase
    .from('artists')
    .select('*')
    .eq('name', decodedName)
    .single()

  if (!artistData) return <div style={{ color: '#E8D5A0', padding: '4rem' }}>아티스트를 찾을 수 없습니다.</div>

  const { data: albumLinks } = await supabase
    .from('album_artists')
    .select('album_id')
    .eq('artist_id', artistData.id)

  const albumIds = (albumLinks ?? []).map((r: { album_id: string }) => r.album_id)

  const albums = albumIds.length > 0
    ? (await supabase.from('albums').select('*').in('id', albumIds).order('release_date', { ascending: false })).data ?? []
    : []

  return <ArtistClient artist={artistData} albums={albums} />
}
