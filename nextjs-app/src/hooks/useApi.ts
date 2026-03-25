/**
 * TapMenu Armenia — Generic API hook
 *
 * Lightweight fetch wrapper with:
 * - Type-safe responses
 * - Loading / error states
 * - Abort on unmount
 * - Retry support
 * - Automatic JSON parsing
 *
 * Phase 02: Foundation for all dashboard data hooks.
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiState<T> {
  data: T | null
  error: string | null
  isLoading: boolean
}

export interface ApiOptions {
  /** Skip initial fetch (for mutations-only) */
  skip?: boolean
  /** Dependencies that trigger a refetch when changed */
  deps?: unknown[]
}

interface MutateOptions {
  method?: 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useApi<T>(url: string | null, options: ApiOptions = {}) {
  const { skip = false, deps = [] } = options
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    isLoading: !skip && !!url,
  })
  const abortRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    if (!url) return

    // Abort previous request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      const json = await res.json()
      if (!controller.signal.aborted) {
        setState({ data: json, error: null, isLoading: false })
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      if (!controller.signal.aborted) {
        setState(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Unknown error',
          isLoading: false,
        }))
      }
    }
  }, [url])

  // Initial + dependency-triggered fetch
  useEffect(() => {
    if (!skip && url) {
      fetchData()
    }
    return () => { abortRef.current?.abort() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, skip, ...deps])

  // ── Mutation helper ────────────────────────────────────────────────────────

  const mutate = useCallback(
    async <R = T>(
      mutateUrl: string,
      { method = 'POST', body }: MutateOptions = {}
    ): Promise<{ data: R | null; error: string | null }> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      try {
        const res = await fetch(mutateUrl, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          const errMsg = json.error || `HTTP ${res.status}`
          setState(prev => ({ ...prev, isLoading: false, error: errMsg }))
          return { data: null, error: errMsg }
        }
        setState(prev => ({ ...prev, isLoading: false }))
        return { data: json as R, error: null }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error'
        setState(prev => ({ ...prev, isLoading: false, error: errMsg }))
        return { data: null, error: errMsg }
      }
    },
    []
  )

  return {
    ...state,
    refetch: fetchData,
    mutate,
  }
}

// ─── Shortcut: mutation-only hook (no initial fetch) ─────────────────────────

export function useMutation<T = unknown>() {
  return useApi<T>(null, { skip: true })
}
