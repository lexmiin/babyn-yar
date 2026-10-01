import { BEFORE_1941_SCENES } from './before1941'
import { OCCUPATION_SCENES } from './occupation'
import { POSTWAR_SCENES } from './postwar'
import { PRESENT_DAY_SCENES } from './presentDay'
import type { HistoryMapScene } from './sceneTypes'

export const HISTORY_MAP_SCENES: readonly HistoryMapScene[] = [
  ...BEFORE_1941_SCENES,
  ...OCCUPATION_SCENES,
  ...POSTWAR_SCENES,
  ...PRESENT_DAY_SCENES
]
