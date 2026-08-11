import HistoryMapLayer from './HistoryMapLayer'
import { LAYER_ONE_TERRITORIES } from './layers'

export default function LayerThree() {
  return (
    <HistoryMapLayer
      title="Бабин Яр у 1943–1961 роках"
      baseMapSrc="/assets/base_map.png"
      mapAlt="Тимчасова карта третього історичного шару Бабиного Яру"
      mapAspectRatio="894.14 / 783.2"
      mapSource="Тимчасово використано топографічний план першого шару"
      territoryLabel="Об’єкти третього шару:"
      territories={LAYER_ONE_TERRITORIES}
    >
      <p>
        Це тимчасовий третій шар для перевірки переходу через кілька історичних
        періодів. Він повторно використовує карту та SVG першого шару.
      </p>
      <p>
        Фінальні зображення, об’єкти й історичний текст буде додано після
        отримання матеріалів для цього періоду.
      </p>
    </HistoryMapLayer>
  )
}
