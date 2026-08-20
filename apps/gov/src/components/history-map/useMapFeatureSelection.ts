import { useState, type FocusEvent, type KeyboardEvent } from 'react'
import type { HistoryMapFeature } from './layers'

type SelectableMapFeature = Pick<HistoryMapFeature, 'id' | 'label'>

export function useMapFeatureSelection<T extends SelectableMapFeature>(
  features: readonly T[],
  detailsId?: string
) {
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null)
  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(null)
  const [focusedFeatureId, setFocusedFeatureId] = useState<string | null>(null)
  const labelFeatureId = focusedFeatureId ?? hoveredFeatureId

  function toggleFeature(id: string) {
    setActiveFeatureId(current => (current === id ? null : id))
  }

  function getFeatureControlProps(feature: SelectableMapFeature) {
    const isActive = activeFeatureId === feature.id

    return {
      role: 'button' as const,
      tabIndex: 0,
      'aria-label': `Інформація про об’єкт: ${feature.label}`,
      'aria-pressed': isActive,
      ...(detailsId ? { 'aria-controls': detailsId } : {}),
      onMouseEnter() {
        setHoveredFeatureId(feature.id)
      },
      onMouseLeave() {
        setHoveredFeatureId(current =>
          current === feature.id ? null : current
        )
      },
      onFocus(event: FocusEvent<SVGSVGElement>) {
        if (event.currentTarget.matches(':focus-visible')) {
          setFocusedFeatureId(feature.id)
        }
      },
      onBlur() {
        setFocusedFeatureId(current =>
          current === feature.id ? null : current
        )
      },
      onClick() {
        toggleFeature(feature.id)
      },
      onKeyDown(event: KeyboardEvent<SVGSVGElement>) {
        if (event.key !== 'Enter' && event.key !== ' ') return

        event.preventDefault()
        if (!event.repeat) {
          setFocusedFeatureId(feature.id)
          toggleFeature(feature.id)
        }
      }
    }
  }

  return {
    activeFeature:
      features.find(feature => feature.id === activeFeatureId) ?? null,
    activeFeatureId,
    labelFeature:
      features.find(feature => feature.id === labelFeatureId) ?? null,
    getFeatureControlProps
  }
}
