'use client'

/**
 * FeatureGate — Conditional rendering based on feature flags.
 *
 * Usage:
 *   <FeatureGate flag="FF_GUEST_ORDERING">
 *     <CartButton />
 *   </FeatureGate>
 *
 *   <FeatureGate flag="FF_GUEST_ORDERING" fallback={<ComingSoonBadge />}>
 *     <CartButton />
 *   </FeatureGate>
 *
 * For server components, use isFeatureEnabled() directly.
 * This component is for client-side conditional rendering.
 *
 * Phase 00: Uses a static flags map. Phase 02+ will fetch flags from API.
 */

import { type ReactNode, createContext, useContext } from 'react'
import type { FeatureFlag } from '@/lib/feature-flags'

// ─── Context ──────────────────────────────────────────────────────────────────

type FlagsMap = Partial<Record<FeatureFlag, boolean>>

const FeatureFlagContext = createContext<FlagsMap>({})

/**
 * Provide feature flag values to the client component tree.
 * Typically placed in the root layout or a layout segment.
 *
 * @example
 *   // In layout.tsx (server component):
 *   const flags = getFlagsForClient({ plan: user.plan })
 *   return <FeatureFlagProvider flags={flags}>{children}</FeatureFlagProvider>
 */
export function FeatureFlagProvider({
  flags,
  children,
}: {
  flags: FlagsMap
  children: ReactNode
}) {
  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  )
}

/**
 * Hook to check a feature flag value from context.
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  const flags = useContext(FeatureFlagContext)
  return flags[flag] ?? false
}

// ─── Gate Component ───────────────────────────────────────────────────────────

interface FeatureGateProps {
  /** The feature flag to check */
  flag: FeatureFlag
  /** Content to render when the flag is enabled */
  children: ReactNode
  /** Optional content to render when the flag is disabled */
  fallback?: ReactNode
}

/**
 * Conditionally render children based on a feature flag.
 */
export function FeatureGate({ flag, children, fallback = null }: FeatureGateProps) {
  const isEnabled = useFeatureFlag(flag)
  return <>{isEnabled ? children : fallback}</>
}
