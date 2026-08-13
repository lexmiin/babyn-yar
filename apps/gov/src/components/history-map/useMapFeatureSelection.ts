import { useEffect, useState, type KeyboardEvent } from 'react'
import type { HistoryMapFeature } from './layers'

type SelectableMapFeature = Pick<HistoryMapFeature, 'id' | 'label'>

export function useMapFeatureSelection<T extends SelectableMapFeature>(
  features: readonly T[],
  selectionScope: number
) {
  const [selection, setSelection] = useState<{
    scope: number
    featureIndex: number | null
  }>({ scope: selectionScope, featureIndex: null })
  const activeFeatureIndex =
    selection.scope === selectionScope ? selection.featureIndex : null

  useEffect(() => {
    setSelection(current =>
      current.scope === selectionScope && current.featureIndex === null
        ? current
        : { scope: selectionScope, featureIndex: null }
    )
  }, [selectionScope])

  function toggleFeature(index: number) {
    setSelection(current => ({
      scope: selectionScope,
      featureIndex:
        current.scope === selectionScope && current.featureIndex === index
          ? null
          : index
    }))
  }

  function getFeatureControlProps(index: number) {
    const isActive = activeFeatureIndex === index
    const label = features[index].label

    return {
      focusable: 'false' as const,
      role: 'button' as const,
      tabIndex: 0,
      'aria-label': `${isActive ? 'Сховати' : 'Показати'} підпис: ${label}`,
      'aria-pressed': isActive,
      onClick() {
        toggleFeature(index)
      },
      onKeyDown(event: KeyboardEvent<SVGSVGElement>) {
        if (event.key !== 'Enter' && event.key !== ' ') return

        event.preventDefault()
        toggleFeature(index)
      }
    }
  }

  return {
    activeFeature:
      activeFeatureIndex === null ? null : features[activeFeatureIndex],
    activeFeatureIndex,
    getFeatureControlProps
  }
}
