export interface CalendarData {
  name: string
  uidPrefix: string
  events: {
    id: string
    title: string
    description?: string
    start: [number, number, number]
    end: [number, number, number]
    busyStatus?: 'FREE' | 'BUSY'
  }[]
  semesters: {
    name: string
    prefix: string
    start: [number, number, number]
    weeks: number
  }[]
}
