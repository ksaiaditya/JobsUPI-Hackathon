import { useCallback, useState } from 'react'
import { apiRequest } from '../api/http'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (path, options) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiRequest(path, options)
      return data
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { request, loading, error }
}
