import type { CalendarData, CalendarEvent, Semester } from './types.js'
import allYearsRaw from './_browser-data.js'

export type { CalendarData, CalendarEvent, Semester }

const allYears = allYearsRaw as unknown as CalendarData[]

export function loadAllYears(): CalendarData[] {
  return allYears
}

function startDate(s: Semester): Date {
  return new Date(s.start[0], s.start[1] - 1, s.start[2])
}

function eventStart(e: CalendarEvent): Date {
  return new Date(e.start[0], e.start[1] - 1, e.start[2])
}

function eventEnd(e: CalendarEvent): Date {
  return new Date(e.end[0], e.end[1] - 1, e.end[2])
}

export function getSemesterForDate(date: Date): Semester | undefined {
  const sorted = allYears.flatMap(y => y.semesters)
    .sort((a, b) => startDate(b).getTime() - startDate(a).getTime())

  for (const sem of sorted) {
    const end = new Date(startDate(sem))
    end.setDate(end.getDate() + sem.weeks * 7)
    if (date >= startDate(sem) && date < end) {
      return sem
    }
  }
  return undefined
}

export function getSemester(year: number, semester: number): Semester | undefined {
  const academicYear = `${year}-${year + 1}`
  const yr = allYears.find(y => y.name === academicYear)
  if (!yr) return undefined
  return yr.semesters.find(s => {
    const m = /term-(\d+)/.exec(s.prefix)
    return m ? parseInt(m[1], 10) === semester : false
  })
}
