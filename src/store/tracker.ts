import { create } from 'zustand'
import { createSeed } from '../data/seed'
import { todayIso } from '../domain/dates'
import {
  type Application,
  type Opportunity,
  type Achievement,
  type PublicProfile,
  type Capstone,
  type Competency,
  type QuickstartItem,
  type Resource,
  type RoadmapWeek,
  type Settings,
  type TrackerData,
  type WeeklyReview,
} from '../domain/schema'

export const STORAGE_KEY = 'tondi-legacy-v1'

interface TrackerState {
  data: TrackerData
  updateCompetency: (id: string, patch: Partial<Competency>) => void
  updateWeek: (week: number, patch: Partial<RoadmapWeek>) => void
  updateResource: (id: string, patch: Partial<Resource>) => void
  upsertResource: (record: Resource) => void
  removeResource: (id: string) => void
  updateCapstone: (id: string, patch: Partial<Capstone>) => void
  updateQuickstart: (id: string, patch: Partial<QuickstartItem>) => void
  updateReview: (week: number, patch: Partial<WeeklyReview>) => void
  updateSettings: (patch: Partial<Settings>) => void
  upsertOpportunity: (record: Opportunity) => void
  removeOpportunity: (id: string) => void
  upsertAchievement: (record: Achievement) => void
  removeAchievement: (id: string) => void
  updatePublicProfile: (patch: Partial<PublicProfile>) => void
  mergeImported: (opportunities: Opportunity[], achievements: Achievement[], mode: 'skip' | 'update') => void
  addApplication: (app: Omit<Application, 'id'>) => string
  updateApplication: (id: string, patch: Partial<Application>) => void
  removeApplication: (id: string) => void
  replaceAll: (data: TrackerData) => void
  reset: () => void
}

function patchWhere<T>(list: T[], match: (item: T) => boolean, patch: Partial<T>): T[] {
  return list.map((item) => (match(item) ? { ...item, ...patch } : item))
}

/** Stamp a completion date the first time an item becomes "Selesai"; clear it when re-opened. */
function withDoneDate<T extends { status: string; doneDate: string | null }>(
  prev: T,
  patch: Partial<T>,
): Partial<T> {
  if (!patch.status || patch.status === prev.status) return patch
  if (patch.status === 'Selesai' && !prev.doneDate) return { ...patch, doneDate: todayIso() }
  if (patch.status !== 'Selesai') return { ...patch, doneDate: null }
  return patch
}

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const useTracker = create<TrackerState>()(
  (set) => {
      const setData = (fn: (d: TrackerData) => Partial<TrackerData>) =>
        set((s) => ({ data: { ...s.data, ...fn(s.data) } }))

      return {
        data: createSeed(),
        updateCompetency: (id, patch) =>
          setData((d) => ({ competencies: patchWhere(d.competencies, (c) => c.id === id, patch) })),
        updateWeek: (week, patch) =>
          setData((d) => ({
            roadmap: d.roadmap.map((w) => (w.week === week ? { ...w, ...withDoneDate(w, patch) } : w)),
          })),
        updateResource: (id, patch) =>
          setData((d) => ({resources: d.resources.map((r) => (r.id === id ? { ...r, ...withDoneDate(r, patch) } : r))})),
        upsertResource: record=>setData(d=>({resources:[record,...d.resources.filter(r=>r.id!==record.id)]})),
        removeResource: id=>setData(d=>({resources:d.resources.filter(r=>r.id!==id)})),
        updateCapstone: (id, patch) =>
          setData((d) => ({ capstones: patchWhere(d.capstones, (c) => c.id === id, patch) })),
        updateQuickstart: (id, patch) =>
          setData((d) => ({ quickstart: patchWhere(d.quickstart, (q) => q.id === id, patch) })),
        updateReview: (week, patch) =>
          setData((d) => ({ weeklyReviews: patchWhere(d.weeklyReviews, (r) => r.week === week, patch) })),
        updateSettings: (patch) => setData((d) => ({ settings: { ...d.settings, ...patch } })),
        upsertOpportunity: (record) => setData((d) => ({ opportunities: [record, ...d.opportunities.filter(x => x.id !== record.id)] })),
        removeOpportunity: (id) => setData((d) => ({ opportunities: d.opportunities.filter(x => x.id !== id) })),
        upsertAchievement: (record) => setData((d) => ({ achievements: [record, ...d.achievements.filter(x => x.id !== record.id)] })),
        removeAchievement: (id) => setData((d) => ({ achievements: d.achievements.filter(x => x.id !== id) })),
        updatePublicProfile: (patch) => setData((d) => ({publicProfile: {...d.publicProfile, ...patch}})),
        mergeImported: (opportunities, achievements, mode) => setData(d => ({
          opportunities: mode === 'update' ? [...opportunities, ...d.opportunities.filter(x => !opportunities.some(n => n.id === x.id))] : [...d.opportunities, ...opportunities.filter(x => !d.opportunities.some(o => o.id === x.id))],
          achievements: mode === 'update' ? [...achievements, ...d.achievements.filter(x => !achievements.some(n => n.id === x.id))] : [...d.achievements, ...achievements.filter(x => !d.achievements.some(o => o.id === x.id))],
        })),
        addApplication: (app) => {
          const id = newId()
          setData((d) => ({ applications: [{ ...app, id }, ...d.applications] }))
          return id
        },
        updateApplication: (id, patch) =>
          setData((d) => ({ applications: patchWhere(d.applications, (a) => a.id === id, patch) })),
        removeApplication: (id) =>
          setData((d) => ({ applications: d.applications.filter((a) => a.id !== id) })),
        replaceAll: (data) => set({ data }),
        reset: () => set({ data: createSeed() }),
      }
    },

)
