#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { format, resolveConfig } from 'prettier'

const HELP = `Usage:
  node scripts/generate-history-map-routes.mjs \\
    --input <svg-directory> \\
    --config <routes.json> \\
    --output <components.tsx>

The topology config selects, splits, and reverses geometry from Illustrator
route SVGs. The generated components use Framer Motion for visible strokes and
arrowheads, while pointer hit targets remain ordinary SVG polylines.
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

  if (!options.input || !options.config || !options.output) {
    throw new Error(`--input, --config, and --output are required.\n\n${HELP}`)
  }

  return {
    input: resolve(options.input),
    config: resolve(options.config),
    output: resolve(options.output)
  }
}

function attributes(element) {
  return Object.fromEntries(
    [...element.matchAll(/([\w-]+)="([^"]*)"/g)].map(match => [
      match[1],
      match[2]
    ])
  )
}

function extractGeometry(svg) {
  const polylines = [...svg.matchAll(/<polyline\b[^>]*>/g)].map(match => {
    const coordinates = attributes(match[0])
      .points.trim()
      .split(/[\s,]+/)
    if (coordinates.length % 2 !== 0) {
      throw new Error('Polyline contains an unmatched coordinate.')
    }

    return Array.from(
      { length: coordinates.length / 2 },
      (_, index) => `${coordinates[index * 2]} ${coordinates[index * 2 + 1]}`
    )
  })
  const lines = [...svg.matchAll(/<line\b[^>]*>/g)].map(match => {
    const line = attributes(match[0])
    return [`${line.x1} ${line.y1}`, `${line.x2} ${line.y2}`]
  })
  const paths = [...svg.matchAll(/<path\b[^>]*>/g)].map(
    match => attributes(match[0]).d
  )

  return { polylines, lines, paths }
}

function segmentPoints(geometry, segment, source) {
  const collection =
    segment.type === 'polyline' ? geometry.polylines : geometry.lines
  const original = collection[segment.index]
  if (!original) {
    throw new Error(
      `${source}: missing ${segment.type} at index ${segment.index}`
    )
  }

  let points = segment.points
    ? segment.points.map(index => {
        if (!original[index]) {
          throw new Error(
            `${source}: ${segment.type} ${segment.index} has no point ${index}`
          )
        }
        return original[index]
      })
    : [...original]

  if (segment.reverse) points = points.reverse()
  return points.join(' ')
}

function routeComponent(route, geometry) {
  const segments = route.segments.map(segment => ({
    ...segment,
    points: segmentPoints(geometry, segment, route.source)
  }))
  const arrowheads = route.arrowheads.map(arrowhead => {
    const path = geometry.paths[arrowhead.path]
    if (!path) {
      throw new Error(
        `${route.source}: missing arrowhead path at index ${arrowhead.path}`
      )
    }
    return { ...arrowhead, path }
  })

  return `
    /** Generated from ${route.source} using the explicit route topology config. */
    export function ${route.component}({ shouldReduceMotion, ...props }: HistoryMapRouteProps) {
      return (
        <svg viewBox={VIEW_BOX} {...props}>
          <g aria-hidden="true" pointerEvents="none">
            ${segments
              .map(
                segment => `<RouteSegment
                  points=${JSON.stringify(segment.points)}
                  color=${JSON.stringify(route.color)}
                  delay={${segment.delay}}
                  duration={${segment.duration}}
                  shouldReduceMotion={shouldReduceMotion}
                />`
              )
              .join('\n')}
            ${arrowheads
              .map(
                arrowhead => `<Arrowhead
                  path=${JSON.stringify(arrowhead.path)}
                  color=${JSON.stringify(route.color)}
                  delay={${arrowhead.delay}}
                  shouldReduceMotion={shouldReduceMotion}
                />`
              )
              .join('\n')}
          </g>
          <g fill="none" stroke="transparent" strokeWidth="24" pointerEvents="stroke">
            ${segments
              .map(
                segment =>
                  `<polyline points=${JSON.stringify(segment.points)} />`
              )
              .join('\n')}
          </g>
        </svg>
      )
    }
  `
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const config = JSON.parse(await readFile(options.config, 'utf8'))
  const components = []

  for (const route of config.routes) {
    const svg = await readFile(resolve(options.input, route.source), 'utf8')
    components.push(routeComponent(route, extractGeometry(svg)))
  }

  const prettierOptions = (await resolveConfig(resolve('package.json'))) ?? {}
  const generated = await format(
    `/**
     * Generated by scripts/generate-history-map-routes.mjs.
     * Do not edit; update the source SVG or topology config and regenerate.
     */
    import { motion } from 'framer-motion'
    import type { SVGProps } from 'react'

    const VIEW_BOX = '0 0 894.14 783.2'
    const ROUTE_EASE = [0.4, 0, 0.2, 1] as const

    export type HistoryMapRouteProps = SVGProps<SVGSVGElement> & {
      shouldReduceMotion: boolean
    }

    function drawTransition(shouldReduceMotion: boolean, delay: number, duration: number) {
      return {
        duration: shouldReduceMotion ? 0 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: ROUTE_EASE
      }
    }

    function RouteSegment({ points, color, delay, duration, shouldReduceMotion }: {
      points: string
      color: string
      delay: number
      duration: number
      shouldReduceMotion: boolean
    }) {
      return (
        <motion.polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="6.88"
          strokeMiterlimit="10"
          initial={{ pathLength: shouldReduceMotion ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={drawTransition(shouldReduceMotion, delay, duration)}
        />
      )
    }

    function Arrowhead({ path, color, delay, shouldReduceMotion }: {
      path: string
      color: string
      delay: number
      shouldReduceMotion: boolean
    }) {
      return (
        <motion.path
          d={path}
          fill={color}
          initial={{ opacity: shouldReduceMotion ? 1 : 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={drawTransition(shouldReduceMotion, delay, 0.16)}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      )
    }

    ${components.join('\n')}
    `,
    { ...prettierOptions, filepath: options.output }
  )

  await mkdir(dirname(options.output), { recursive: true })
  await writeFile(options.output, generated)
  process.stdout.write(
    `Generated ${components.length} motion SVG components in ${options.output}\n`
  )
}

main().catch(error => {
  process.stderr.write(`${error.stack ?? error.message}\n`)
  process.exitCode = 1
})
