import { EventType } from '@prisma/client'

// Mock de la lògica que tenim a src/lib/actions/sessions.ts per poder testejar-la sense DB
function calculateWorkedTime(events: { type: EventType, startedAt: Date, endedAt: Date | null }[], now: Date) {
  return events
    .filter((e) => e.type === EventType.WORK)
    .reduce((total, event) => {
      const end = event.endedAt || now
      return total + Math.floor((end.getTime() - event.startedAt.getTime()) / 1000)
    }, 0)
}

describe('Time Calculation Logic', () => {
  const now = new Date('2026-05-01T12:00:00Z')

  test('should calculate correct time for a single work event', () => {
    const events = [
      {
        type: EventType.WORK,
        startedAt: new Date('2026-05-01T10:00:00Z'),
        endedAt: new Date('2026-05-01T11:00:00Z'),
      }
    ]
    expect(calculateWorkedTime(events, now)).toBe(3600)
  })

  test('should calculate correct time for multiple work events with breaks', () => {
    const events = [
      {
        type: EventType.WORK,
        startedAt: new Date('2026-05-01T09:00:00Z'),
        endedAt: new Date('2026-05-01T10:00:00Z'),
      },
      {
        type: EventType.BREAK,
        startedAt: new Date('2026-05-01T10:00:00Z'),
        endedAt: new Date('2026-05-01T10:30:00Z'),
      },
      {
        type: EventType.WORK,
        startedAt: new Date('2026-05-01T10:30:00Z'),
        endedAt: new Date('2026-05-01T11:30:00Z'),
      }
    ]
    expect(calculateWorkedTime(events, now)).toBe(7200) // 1h + 1h
  })

  test('should handle ongoing work event using "now"', () => {
    const events = [
      {
        type: EventType.WORK,
        startedAt: new Date('2026-05-01T11:00:00Z'),
        endedAt: null,
      }
    ]
    expect(calculateWorkedTime(events, now)).toBe(3600) // 1h from 11:00 to 12:00
  })

  test('should ignore ongoing break events for work time calculation', () => {
    const events = [
      {
        type: EventType.WORK,
        startedAt: new Date('2026-05-01T09:00:00Z'),
        endedAt: new Date('2026-05-01T10:00:00Z'),
      },
      {
        type: EventType.BREAK,
        startedAt: new Date('2026-05-01T10:00:00Z'),
        endedAt: null,
      }
    ]
    expect(calculateWorkedTime(events, now)).toBe(3600)
  })
})
