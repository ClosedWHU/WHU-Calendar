export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: [number, number, number]
  end: [number, number, number]
  busyStatus?: 'FREE' | 'BUSY'
}

export interface Semester {
  name: string
  prefix: string
  start: [number, number, number]
  weeks: number
}

export interface CalendarData {
  name: string
  uidPrefix: string
  events: CalendarEvent[]
  semesters: Semester[]
}
