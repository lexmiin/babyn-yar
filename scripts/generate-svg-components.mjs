#!/usr/bin/env node

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, resolve } from 'node:path'
import process from 'node:process'
import { transform } from '@svgr/core'
import jsx from '@svgr/plugin-jsx'
import svgo from '@svgr/plugin-svgo'
import { format, resolveConfig } from 'prettier'

const HELP = `Usage:
  node scripts/generate-svg-components.mjs \\
    --input <svg-directory> \\
    --output <components.tsx> \\
    --layer <positive-integer>

The generator creates one named React component per *_neut.svg. Source names
are converted to semantic exports, for example:

  BY_Bratske_neut.svg      -> Layer1Bratske

SVG IDs and class names are prefixed per component so multiple generated
components can safely share one document. Territory fills can be themed with
--territory-fill, --territory-fill-opacity, and --territory-fill-duration.
`

function parseArguments(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(HELP)
    process.exit(0)
  }

  const options = {}

  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]

    if (!flag?.startsWith('--') || value === undefined) {
      throw new Error(`Invalid argument near "${flag ?? ''}".\n\n${HELP}`)
    }

    options[flag.slice(2)] = value
  }

  if (!options.input || !options.output || !options.layer) {
    throw new Error(`--input, --output, and --layer are required.\n\n${HELP}`)
  }

  const layer = Number(options.layer)

  if (!Number.isSafeInteger(layer) || layer < 1) {
    throw new Error('--layer must be a positive integer.')
  }

  return {
    input: resolve(options.input),
    output: resolve(options.output),
    layer
  }
}

function toPascalCase(value) {
  const words = value.match(/[\p{L}\p{N}]+/gu) ?? []

  return words
    .map(word => `${word[0].toLocaleUpperCase('en-US')}${word.slice(1)}`)
    .join('')
}

function componentNameFor(sourceName, layer) {
  const stem = basename(sourceName, extname(sourceName))
    .replace(/^BY_/i, '')
    .replace(/_neut$/i, '')
  const subject = toPascalCase(stem)

  if (!subject) {
    throw new Error(`Cannot derive a component name from "${sourceName}".`)
  }

  return `Layer${layer}${subject}`
}

function stripGeneratedImports(source) {
  return source
    .split('\n')
    .filter(line => !line.startsWith('import type '))
    .join('\n')
    .trim()
}

function makeTerritoryFillThemeable(svg, sourceName) {
  const rules = [...svg.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(
    ([, selectors, declarations]) => ({
      classes: [...selectors.matchAll(/\.(cls-[\w-]+)/g)].map(
        ([, className]) => className
      ),
      declarations
    })
  )
  const fillClasses = new Set(
    rules
      .filter(({ declarations }) => /fill:\s*#fff\s*;?/i.test(declarations))
      .flatMap(({ classes }) => classes)
  )
  const opacityByClass = new Map()

  for (const { classes, declarations } of rules) {
    const opacity = declarations.match(
      /opacity:\s*(\.?\d+(?:\.\d+)?)\s*;?/i
    )?.[1]

    if (opacity) {
      for (const className of classes) opacityByClass.set(className, opacity)
    }
  }

  const themedClass =
    [...fillClasses].find(className => opacityByClass.has(className)) ??
    [...fillClasses][0]
  const property = themedClass ? 'fill' : 'stroke'
  const fallbackClass = rules
    .filter(({ declarations }) => /stroke:\s*#fff\s*;?/i.test(declarations))
    .flatMap(({ classes }) => classes)[0]
  const targetClass = themedClass ?? fallbackClass

  if (!targetClass) {
    throw new Error(
      `Cannot find a neutral white fill or stroke in "${sourceName}".`
    )
  }

  const classAttribute = `class="${targetClass}"`
  const neutralOpacity = opacityByClass.get(targetClass) ?? '1'
  const themedAttribute = `${classAttribute} style="${property}:var(--territory-fill,#fff);opacity:var(--territory-fill-opacity,${neutralOpacity});pointer-events:visiblePainted;transition:${property} var(--territory-fill-duration,180ms) ease,opacity var(--territory-fill-duration,180ms) ease"`

  if (!svg.includes(classAttribute)) {
    throw new Error(
      `Cannot find an element using the neutral fill class in "${sourceName}".`
    )
  }

  return svg.replaceAll(classAttribute, themedAttribute)
}

async function generateComponent(svg, sourceName, componentName) {
  const sourceLabel = sourceName.replaceAll('*/', '* /')
  const component = await transform(
    makeTerritoryFillThemeable(svg, sourceName),
    {
      dimensions: false,
      expandProps: 'end',
      exportType: 'named',
      jsxRuntime: 'automatic',
      namedExport: componentName,
      plugins: [svgo, jsx],
      prettier: false,
      svgoConfig: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false
              }
            }
          },
          {
            name: 'prefixIds',
            params: {
              prefix: componentName
            }
          }
        ]
      },
      typescript: true
    },
    { componentName }
  )

  return `/** Generated from ${sourceLabel}. */\n${stripGeneratedImports(component)}`
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const entries = await readdir(options.input, { withFileTypes: true })
  const sourceNames = entries
    .filter(entry => entry.isFile() && /_neut\.svg$/i.test(entry.name))
    .map(entry => entry.name)
    .sort((left, right) => left.localeCompare(right, 'en'))

  if (sourceNames.length === 0) {
    throw new Error(`No *_neut.svg files found in ${options.input}`)
  }

  const components = []
  const componentNames = new Set()

  for (const sourceName of sourceNames) {
    const componentName = componentNameFor(sourceName, options.layer)

    if (componentNames.has(componentName)) {
      throw new Error(
        `Multiple SVG files resolve to the component name "${componentName}".`
      )
    }

    componentNames.add(componentName)
    const svg = await readFile(resolve(options.input, sourceName), 'utf8')
    components.push(await generateComponent(svg, sourceName, componentName))
  }

  const prettierOptions = (await resolveConfig(resolve('package.json'))) ?? {}
  const generated = await format(
    `/**
     * This file is generated by scripts/generate-svg-components.mjs.
     * Do not edit it by hand; update the source SVGs and run the generator.
     */
    import type { SVGProps } from 'react'

    ${components.join('\n\n')}
    `,
    { ...prettierOptions, filepath: options.output }
  )

  await mkdir(dirname(options.output), { recursive: true })
  await writeFile(options.output, generated)
  process.stdout.write(
    `Generated ${components.length} React components in ${options.output}\n`
  )
}

main().catch(error => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`
  )
  process.exitCode = 1
})
