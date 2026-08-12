import {
  useEffect,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent
} from 'react'
import type { HistoryMapTerritory } from './layers'

export function useTerritorySelection(
  territories: readonly HistoryMapTerritory[],
  selectionScope: number
) {
  const [selection, setSelection] = useState<{
    scope: number
    territoryIndex: number | null
  }>({ scope: selectionScope, territoryIndex: null })
  const activeTerritoryIndex =
    selection.scope === selectionScope ? selection.territoryIndex : null

  useEffect(() => {
    setSelection(current =>
      current.scope === selectionScope && current.territoryIndex === null
        ? current
        : { scope: selectionScope, territoryIndex: null }
    )
  }, [selectionScope])

  function toggleTerritory(index: number) {
    setSelection(current => ({
      scope: selectionScope,
      territoryIndex:
        current.scope === selectionScope && current.territoryIndex === index
          ? null
          : index
    }))
  }

  function focusTerritory(
    event: PointerEvent<SVGSVGElement> | MouseEvent<SVGSVGElement>
  ) {
    event.currentTarget.focus({ preventScroll: true })
  }

  function getTerritoryControlProps(index: number) {
    const isActive = activeTerritoryIndex === index
    const label = territories[index].label

    return {
      focusable: 'false' as const,
      role: 'button' as const,
      tabIndex: 0,
      'aria-label': `${isActive ? 'Сховати' : 'Показати'} підпис: ${label}`,
      'aria-pressed': isActive,
      onPointerDown: focusTerritory,
      onClick(event: MouseEvent<SVGSVGElement>) {
        focusTerritory(event)
        toggleTerritory(index)
      },
      onKeyDown(event: KeyboardEvent<SVGSVGElement>) {
        if (event.key !== 'Enter' && event.key !== ' ') return

        event.preventDefault()
        toggleTerritory(index)
      }
    }
  }

  return {
    activeTerritory:
      activeTerritoryIndex === null ? null : territories[activeTerritoryIndex],
    activeTerritoryIndex,
    getTerritoryControlProps
  }
}
