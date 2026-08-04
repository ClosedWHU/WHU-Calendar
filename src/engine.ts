/// <reference path="../node_modules/ics/index.d.ts" />
import { createEvents, type EventAttributes } from 'ics'
import { writeFileSync, readFileSync, readdirSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { uidGenerateFactory } from './utils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
const dataDir = join(projectRoot, 'data')
const distDir = join(projectRoot, 'dist')
const funcDir = join(projectRoot, 'functions')

if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true })
}
if (!existsSync(funcDir)) {
  mkdirSync(funcDir, { recursive: true })
}

import type { CalendarData } from './types.js'

// Extension methods for Date (same as utils.ts but local for ease of use in generator)
const convertToICSDate = (date: Date): [number, number, number] => {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
}

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

async function generate() {
  const dataFiles = readdirSync(dataDir).filter(f => f.endsWith('.json'))
  const allEvents: EventAttributes[] = []
  const years: string[] = []
  
  // To store everything for the CF Worker
  const allDataBundle: Record<string, CalendarData> = {}

  for (const file of dataFiles) {
    const data: CalendarData = JSON.parse(readFileSync(join(dataDir, file), 'utf-8'))
    const uidGenerator = uidGenerateFactory(data.uidPrefix)
    const calendarEvents: EventAttributes[] = []
    
    // store in bundle
    allDataBundle[data.name] = data

    // 1. Process static events
    for (const e of data.events) {
      calendarEvents.push({
        uid: uidGenerator(e.id),
        title: e.title,
        description: e.description || '',
        start: e.start,
        end: e.end,
        busyStatus: e.busyStatus || 'FREE',
      })
    }

    // 2. Process semesters (dynamic weeks)
    for (const s of data.semesters) {
      const startDate = new Date(s.start[0], s.start[1] - 1, s.start[2])
      for (let i = 0; i < s.weeks; i++) {
        const weekStart = addDays(startDate, i * 7)
        const weekEnd = addDays(startDate, (i + 1) * 7)
        
        calendarEvents.push({
          uid: uidGenerator(`${s.prefix}-week-${i + 1}`),
          title: `[${s.prefix.slice(-1)}] 第 ${i + 1} 周`,
          start: convertToICSDate(weekStart),
          end: convertToICSDate(weekEnd),
          busyStatus: 'FREE',
        })
      }
    }

    // Generate individual ics (static generation is preserved)
    createEvents(calendarEvents, (error: Error | undefined, value: string | undefined) => {
      if (!error && value) {
        writeFileSync(join(distDir, `${data.name}.ics`), value)
        console.log(`✅ Generated ${data.name}.ics`)
      }
    })

    allEvents.push(...calendarEvents)
    years.push(data.name)
  }

  // Generate all.ics
  createEvents(allEvents, (error: Error | undefined, value: string | undefined) => {
    if (!error && value) {
      writeFileSync(join(distDir, 'all.ics'), value)
      console.log(`✅ Generated all.ics`)
    }
  })

  // Generate years.json for frontend
  writeFileSync(
    join(distDir, 'years.json'),
    JSON.stringify({ years: years.sort(), lastUpdated: new Date().toISOString() }, null, 2)
  )
  console.log(`✅ Generated years.json`)

  // Output the data bundle for CF Worker API
  writeFileSync(
    join(funcDir, 'data.json'),
    JSON.stringify(allDataBundle)
  )
  console.log(`✅ Generated functions/data.json`)
}

generate().catch(console.error)

