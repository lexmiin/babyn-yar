#!/usr/bin/env node

// Run with: node scripts/test-history-map-routes.mjs
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(
  new URL('../apps/gov/package.json', import.meta.url)
)
const ts = require('typescript')

for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => {
    const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX
      }
    })
    module._compile(outputText, filename)
  }
}

const {
  OCCUPATION_SCENES
} = require('./src/components/history-map/occupation.ts')
const { createElement } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const {
  MapImagesContext
} = require('./src/components/history-map/MapImage.tsx')
const FeatureMapScene =
  require('./src/components/history-map/FeatureMapScene.tsx').default

function drawings(node) {
  if (Array.isArray(node)) return node.flatMap(drawings)
  if (!node?.props) return []
  if (typeof node.type === 'function') return drawings(node.type(node.props))
  if (node.props.transition) return [node.props]
  return drawings(node.props.children)
}

for (const scene of OCCUPATION_SCENES) {
  // Exercise the real scene-to-route call, including the timing prop.
  renderToStaticMarkup(
    createElement(
      MapImagesContext.Provider,
      {
        value: {
          occupation: {
            src: '/map.webp',
            srcSet: '/map.webp 894w',
            width: 894,
            height: 783
          }
        }
      },
      createElement(FeatureMapScene, {
        period: scene.period,
        scene: scene.data
      })
    )
  )

  for (const route of scene.data.routes) {
    const timing = {
      segments: route.timing.segments.map(({ delay, duration }) => ({
        delay: delay + 1,
        duration: duration + 1
      })),
      arrowheads: route.timing.arrowheads.map(delay => delay + 1)
    }
    const props = { timing, shouldReduceMotion: false }
    const normal = drawings(route.Component(props))
    assert.deepEqual(
      normal.map(({ transition }) => [transition.delay, transition.duration]),
      [
        ...timing.segments.map(({ delay, duration }) => [delay, duration]),
        ...timing.arrowheads.map(delay => [delay, 0.16])
      ]
    )
    const reduced = drawings(
      route.Component({ ...props, shouldReduceMotion: true })
    )
    assert(
      reduced.every(
        ({ transition }) => transition.delay === 0 && transition.duration === 0
      )
    )
    assert(
      reduced.every(
        ({ initial }) => (initial.pathLength ?? initial.opacity) === 1
      )
    )

    for (const field of ['segments', 'arrowheads']) {
      for (const values of [
        timing[field].slice(1),
        [...timing[field], timing[field][0]]
      ]) {
        assert.throws(
          () =>
            route.Component({
              ...props,
              timing: { ...timing, [field]: values }
            }),
          /timing must match route topology/
        )
      }
    }
  }
}

console.log(
  'History map routes: scene wiring, authored timing, reduced motion, and topology mismatch checks passed.'
)
