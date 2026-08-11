import HistoryMapLayout from './HistoryMapLayout'
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

const TERRITORIES = [
  'Єврейське кладовище',
  'Караїмське кладовище',
  'Магометанське кладовище',
  'Кирилівське кладовище',
  'Військове кладовище',
  'Братське кладовище',
  'Маріавітське кладовище',
  'Кладовище євангельських християн',
  'Лук’янівське кладовище'
] as const

const TERRITORY_COMPONENTS = [
  Layer1Bratske,
  Layer1Envang,
  Layer1Jew,
  Layer1Karamske,
  Layer1Kirill,
  Layer1Luk,
  Layer1Magomet,
  Layer1Maria,
  Layer1Voisko
]

function LayerOneMap() {
  return (
    <>
      <img
        src="/assets/base_map.png"
        alt="Історична топографічна карта території Бабиного Яру"
        className="absolute inset-0 h-full w-full object-contain select-none"
        draggable={false}
      />
      {TERRITORY_COMPONENTS.map((Territory, index) => (
        <Territory
          key={TERRITORIES[index]}
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute inset-0 h-full w-full [--territory-fill-opacity:.3] [--territory-fill:#fff] hover:[--territory-fill-opacity:.48] hover:[--territory-fill:#941f37]"
        />
      ))}
    </>
  )
}

export default function LayerOne() {
  return (
    <HistoryMapLayout
      title="Бабин Яр до 1941 року"
      map={<LayerOneMap />}
      mapAspectRatio="894.14 / 783.2"
      mapSource="Топографічний план м. Києва станом на 1924 рік, 1:2100 (зменшений)"
      territoryLabel="Території кладовищ:"
      territories={TERRITORIES}
    >
      <div className="space-y-5">
        <p>
          Історія походження назви «Бабин Яр» точно не відома. Існує, зокрема,
          міська легенда, не підтверджена іншими джерелами, про жінку-шинкарку з
          Сирця з дуже «важким» характером, яка заповіла своє майно
          Домініканському монастирю.
        </p>
        <p>
          Історію Бабиного Яру та прилеглих до нього територій найчастіше
          починають з 1139 року, коли князі Ольговичі заснували Кирилівський
          монастир. У 1240 році місцевість Сирець згадана у грамоті князя Данила
          Галицького, який передав ці землі Києво-Печерській лаврі.
        </p>
        <p>
          З 1661 року Сирець та навколишня територія були включені до передмістя
          Києва. У період Гетьманщини патроном Кирилівського монастиря став Іван
          Мазепа. Він активно жертвував гроші для реновації та реставрації
          монастиря.
        </p>
        <p>
          Під час втілення політики секуляризації Катериною Другою Кирилівський
          монастир було перетворено на Києво-Кирилівську лікарню. Біля цієї
          лікарні було відведено місця для поховання померлих пацієнтів, а з
          1871 року на території Кирилівського гаю — територію для повноцінного
          кладовища.
        </p>
      </div>
    </HistoryMapLayout>
  )
}
