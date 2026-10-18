// Class names stay literal so Tailwind can find them.

export type TerritoryFill = 'faint' | 'solid' | 'flood'

const RESTING_FILL_CLASSES = {
  faint: '[--territory-fill-opacity:.3] [--territory-fill:#fff]',
  solid: '[--territory-fill-opacity:1] [--territory-fill:#fff]',
  flood: '[--territory-fill-opacity:.6] [--territory-fill:#ec2125]'
} as const satisfies Record<TerritoryFill, string>

const ACTIVE_FILL = '[--territory-fill-opacity:.48] [--territory-fill:#941f37]'
const HOVER_FILL =
  'hover:[--territory-fill-opacity:.48] hover:[--territory-fill:#941f37]'

export const FOCUS_FILL =
  'focus-visible:[--territory-fill-opacity:.48] focus-visible:[--territory-fill:#941f37]'
export const FOCUS_GLOW = 'focus-visible:drop-shadow-[0_0_5px_#fff]'

/** Territory fill for a selectable area: the highlight when active, else its resting fill. */
export function territoryFillClass(
  isActive: boolean,
  fill: TerritoryFill = 'faint'
) {
  return isActive ? ACTIVE_FILL : `${RESTING_FILL_CLASSES[fill]} ${HOVER_FILL}`
}

/** White glow for selectable lines and icons, which have no territory fill. */
export function glowClass(isActive: boolean) {
  return isActive ? 'drop-shadow-[0_0_5px_rgba(255,255,255,.95)]' : FOCUS_GLOW
}
