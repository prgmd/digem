export interface Article {
  id: number
  title: string
  title_ko?: string
  author: string
  source: string
  source_url?: string
  thumbnail_url?: string
  thumbnail_credit?: string
  published_at: string
  content_en?: string
  content_ko?: string
}

export interface Album {
  id: string
  title: string
  artist: string
  artwork_url: string
  release_date: string
  region?: string
  album_type?: string
  is_featured?: boolean
}

export interface Artist {
  id: string
  name: string
  name_ko?: string
}
