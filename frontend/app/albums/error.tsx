'use client'
import LoadError from '@/components/LoadError'

export default function AlbumsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <LoadError section="albums" error={error} reset={reset} />
}
