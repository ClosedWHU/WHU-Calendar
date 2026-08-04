import { createEvents, type EventAttributes } from 'ics';
import dataBundle from '../data.json';
import { uidGenerateFactory } from '../../src/utils.js';

interface CalendarData {
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

const convertToICSDate = (date: Date): [number, number, number] => {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
}

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export async function onRequest(context: any) {
  const { request, params } = context;
  
  // range should be like "2012-2020.ics"
  const rangeParam = params.range as string;
  if (!rangeParam || !rangeParam.endsWith('.ics')) {
    return new Response('Not Found', { status: 404 });
  }

  const rangeStr = rangeParam.replace('.ics', '');
  // Extract start and end year. Format: "YYYY-YYYY"
  const parts = rangeStr.split('-');
  if (parts.length !== 2) {
    return new Response('Invalid range format. Use YYYY-YYYY.ics', { status: 400 });
  }

  const startYear = parseInt(parts[0], 10);
  const endYear = parseInt(parts[1], 10);
  
  if (isNaN(startYear) || isNaN(endYear) || startYear >= endYear) {
    return new Response('Invalid years', { status: 400 });
  }

  const allEvents: EventAttributes[] = [];
  const allData = dataBundle as unknown as Record<string, CalendarData>;

  // Loop through all available keys in dataBundle and filter by range
  for (const yearKey of Object.keys(allData).sort()) {
    // yearKey format: "YYYY-YYYY"
    const [y1, y2] = yearKey.split('-').map(Number);
    
    // Condition to include: The academic year must be fully contained in or overlap the requested range
    // Since range is "2012-2020" and yearKey is "2012-2013", y1 >= 2012 and y2 <= 2020
    if (y1 >= startYear && y2 <= endYear) {
      const data = allData[yearKey];
      const uidGenerator = uidGenerateFactory(data.uidPrefix);
      
      // Process static events
      for (const e of data.events) {
        allEvents.push({
          uid: uidGenerator(e.id),
          title: e.title,
          description: e.description || '',
          start: e.start as [number, number, number],
          end: e.end as [number, number, number],
          busyStatus: e.busyStatus || 'FREE',
        });
      }

      // Process semesters
      for (const s of data.semesters) {
        const startDate = new Date(s.start[0], s.start[1] - 1, s.start[2]);
        for (let i = 0; i < s.weeks; i++) {
          const weekStart = addDays(startDate, i * 7);
          const weekEnd = addDays(startDate, (i + 1) * 7);
          
          allEvents.push({
            uid: uidGenerator(`${s.prefix}-week-${i + 1}`),
            title: `[${s.prefix.slice(-1)}] 第 ${i + 1} 周`,
            start: convertToICSDate(weekStart),
            end: convertToICSDate(weekEnd),
            busyStatus: 'FREE',
          });
        }
      }
    }
  }

  if (allEvents.length === 0) {
    return new Response('No data found for the requested range', { status: 404 });
  }

  return new Promise((resolve) => {
    createEvents(allEvents, (error: Error | undefined, value: string | undefined) => {
      if (error || !value) {
        resolve(new Response('Error generating ICS', { status: 500 }));
      } else {
        resolve(new Response(value, {
          headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': `attachment; filename="whu-calendar-${rangeStr}.ics"`
          }
        }));
      }
    });
  });
}
