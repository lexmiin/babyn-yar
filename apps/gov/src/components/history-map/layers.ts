import type { ComponentType, SVGProps } from 'react'
import {
  Layer1Bratske,
  Layer1Envang,
  Layer1Jew,
  Layer1Karamske,
  Layer1Kirill,
  Layer1Luk,
  Layer1Magomet,
  Layer1Maria,
  Layer1Voisko
} from './generated/Layer1Svgs'

export type HistoryMapTerritory = {
  label: string
  Component: ComponentType<SVGProps<SVGSVGElement>>
}

export const LAYER_ONE_TERRITORIES: readonly HistoryMapTerritory[] = [
  { label: 'Єврейське кладовище', Component: Layer1Jew },
  { label: 'Караїмське кладовище', Component: Layer1Karamske },
  { label: 'Магометанське кладовище', Component: Layer1Magomet },
  { label: 'Кирилівське кладовище', Component: Layer1Kirill },
  { label: 'Військове кладовище', Component: Layer1Voisko },
  { label: 'Братське кладовище', Component: Layer1Bratske },
  { label: 'Маріавітське кладовище', Component: Layer1Maria },
  {
    label: 'Кладовище євангельських християн',
    Component: Layer1Envang
  },
  { label: 'Лук’янівське кладовище', Component: Layer1Luk }
]
