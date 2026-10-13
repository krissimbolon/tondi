import { beforeEach, describe, expect, it } from 'vitest'
import { createSeed } from '../data/seed'
import { todayIso } from '../domain/dates'
import { useTracker } from './tracker'

beforeEach(() => useTracker.getState().reset())

describe('tracker store', () => {
  it('stamps doneDate when a week becomes Selesai and clears it when re-opened', () => {
    const { updateWeek } = useTracker.getState()
    updateWeek(1, { status: 'Selesai' })
    expect(useTracker.getState().data.roadmap[0]?.doneDate).toBe(todayIso())
    updateWeek(1, { status: 'Review' })
    expect(useTracker.getState().data.roadmap[0]?.doneDate).toBeNull()
  })

  it('adds, updates and removes applications', () => {
    const s = useTracker.getState()
    const id = s.addApplication({
      foundDate: '2026-10-13',
      org: 'UNDP',
      title: 'Programme Associate',
      url: '',
      eligibility: '?',
      deadline: null,
      status: 'Dipantau',
      match: null,
      fatalGap: '',
      nextAction: '',
      cvVersion: '',
      goNoGo: {
        eligible: false,
        available: false,
        criteriaMatched: false,
        packageReady: false,
        mandatoryMet: false,
      },
    })
    useTracker.getState().updateApplication(id, { status: 'Dikirim' })
    expect(useTracker.getState().data.applications[0]?.status).toBe('Dikirim')
    useTracker.getState().removeApplication(id)
    expect(useTracker.getState().data.applications).toHaveLength(0)
  })

  it('does not save sensitive tracker data to localStorage', () => {
    useTracker.getState().updateSettings({ ownerName: 'Tondi' })
    expect(localStorage.getItem('tondi')).toBeNull()
  })
})
