'use client'
import LoadError from '@/components/LoadError'

export default function ArticlesError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <LoadError section="articles" error={error} reset={reset} />
}
