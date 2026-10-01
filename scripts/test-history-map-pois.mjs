#!/usr/bin/env node
// Run with: node scripts/test-history-map-pois.mjs
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(
  new URL('../apps/gov/package.json', import.meta.url)
)
const ts = require('typescript')
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS }
  })
  module._compile(outputText, filename)
}
const { selectPoi } = require('./src/components/history-map/poiSelection.ts')
const {
  LAYER_FOUR_POI_POSITIONS,
  LAYER_FOUR_POI_VIEW_BOX: box
} = require('./src/components/history-map/generated/Layer4PoiPositions.ts')
const pois = LAYER_FOUR_POI_POSITIONS
const menorah = pois.find(poi => poi.id === '06')
const synagogue = pois.find(poi => poi.id === '19')

for (const width of [330, 600, 1000]) {
  const map = {
    left: 75,
    top: 140,
    width,
    height: (width * box.height) / box.width
  }
  const point = poi => ({
    type: 'mouse',
    x: map.left + (poi.center[0] * map.width) / box.width,
    y: map.top + (poi.center[1] * map.height) / box.height
  })
  // Simulate the topmost overlapping trigger receiving the click instead of 06.
  const mouse = selectPoi(synagogue, pois, map, point(menorah))
  assert.equal(mouse.selectedPoi.id, '06')
  assert.equal(mouse.choices.length, 1)
  for (const poi of pois) {
    assert.equal(selectPoi(poi, pois, map, point(poi)).selectedPoi.id, poi.id)
  }
  const touch = selectPoi(synagogue, pois, map, {
    ...point(menorah),
    type: 'touch'
  })
  assert.equal(touch.selectedPoi, null)
  assert(touch.choices.some(poi => poi.id === '06'))
  assert(touch.choices.some(poi => poi.id === '19'))
  assert.equal(selectPoi(menorah, pois, map, null).selectedPoi.id, '06')
  const isolated = pois.find(poi => poi.id === '11')
  assert.equal(
    selectPoi(isolated, pois, map, { ...point(isolated), type: 'touch' })
      .selectedPoi.id,
    '11'
  )
}
console.log(
  'POIs: precise mouse clicks, overlapping touch choices, isolated taps and keyboard selection passed.'
)
