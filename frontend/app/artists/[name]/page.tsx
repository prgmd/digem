import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import ArtistClient from '@/components/ArtistClient'
import CategoryHeader from '@/components/CategoryHeader'

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

  if (!artistData) {
    return (
      <div className="page-shell">
        <CategoryHeader currentCategory="albums" />
        <div className="terminal-screen">
          <div className="terminal-block">
            <div>&gt; no artist on file: {decodedName}</div>
          </div>
          <Link href="/albums" className="bracket-btn">albums</Link>
        </div>
      </div>
    )
  }

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
