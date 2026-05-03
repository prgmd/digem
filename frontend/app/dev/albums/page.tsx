import { Suspense } from 'react'
import AlbumsClient from '@/components/AlbumsClient'
import { MOCK_ALBUMS } from '../mockData'
import Loading from '@/app/albums/loading'

const availableYears = [
  'all',
  ...Array.from(new Set(MOCK_ALBUMS.map(a => new Date(a.release_date).getFullYear().toString())))
    .sort((a, b) => Number(b) - Number(a)),
]

export default function DevAlbumsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AlbumsClient
        albums={MOCK_ALBUMS}
        totalCount={MOCK_ALBUMS.length}
        availableYears={availableYears}
        monthFilter="all"
      />
    </Suspense>
  )
}
