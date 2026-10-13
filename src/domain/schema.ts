import { z } from 'zod'

/**
 * Single source of truth for the tracker data model.
 * Every type in the app is inferred from these schemas, and every JSON import is validated against them,
 * so a corrupted or hand-edited backup can never silently break the app.
 */

export const SCHEMA_VERSION = 1

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
const optionalDate = isoDate.nullable()
const score = z.number().int().min(1).max(5)

export const PRIORITIES = ['Kritis', 'Tinggi', 'Menengah'] as const
export const COMPETENCY_STATUSES = ['Belum diuji', 'Diuji', 'Divalidasi'] as const
/** Playbook rule: work without external review stays at "Review", never "Selesai". */
export const WORK_STATUSES = ['Belum mulai', 'Berjalan', 'Review', 'Selesai'] as const
export const RESOURCE_STATUSES = ['Belum dibuka', 'Berjalan', 'Selesai', 'Dilewati'] as const
export const APPLICATION_STATUSES = [
  'Dipantau',
  'Disiapkan',
  'Dikirim',
  'Tes/Interview',
  'Ditolak',
  'Diterima',
  'Batal',
] as const
export const ELIGIBILITY = ['Y', 'N', '?'] as const

export const competencySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  domain: z.string(),
  priority: z.enum(PRIORITIES),
  /** Baseline score from an objective test (1–5). null = not yet tested — never guess. */
  baseline: score.nullable(),
  /** Latest tested score (1–5). */
  current: score.nullable(),
  target: score,
  evidence: z.string(),
  resourceIds: z.array(z.string()),
  status: z.enum(COMPETENCY_STATUSES),
  targetWeek: z.number().int().min(1).max(24),
  /** How the score was obtained (test, reviewer, artefact). Required by the playbook for honest scoring. */
  testMethod: z.string(),
  lastTested: optionalDate,
})

export const roadmapWeekSchema = z.object({
  week: z.number().int().min(1).max(24),
  start: isoDate,
  focus: z.string(),
  tasks: z.string(),
  evidence: z.string(),
  resourceIds: z.array(z.string()),
  status: z.enum(WORK_STATUSES),
  doneDate: optionalDate,
  /** Weekly evidence review score 0–4. */
  qaScore: z.number().int().min(0).max(4).nullable(),
  qaNote: z.string(),
  evidenceLink: z.string(),
})

export const resourceSchema = z.object({
  id: z.string().min(1),
  domain: z.string(),
  name: z.string(),
  why: z.string(),
  url: z.union([z.literal(''), z.string().url().refine(v => /^https?:\/\//.test(v))]),
  cost: z.string(),
  when: z.string(),
  usedIn: z.string(),
  status: z.enum(RESOURCE_STATUSES),
  doneDate: optionalDate,
})

export const capstoneSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  track: z.string(),
  period: z.string(),
  outputs: z.string(),
  gate: z.string(),
  status: z.enum(WORK_STATUSES),
  provenance: z.string(),
  evidenceLinks: z.array(z.object({ label: z.string(), url: z.string() })),
  notes: z.string(),
})

export const benchmarkSchema = z.object({
  org: z.string(),
  position: z.string(),
  deadline: optionalDate,
  location: z.string(),
  formalReq: z.string(),
  competencies: z.string(),
  skillIds: z.array(z.string()),
  statusNote: z.string(),
  url: z.string(),
})

/** Go/No-Go rule A–E from the playbook (section VII). */
export const goNoGoSchema = z.object({
  eligible: z.boolean(),
  available: z.boolean(),
  criteriaMatched: z.boolean(),
  packageReady: z.boolean(),
  mandatoryMet: z.boolean(),
})

export const applicationSchema = z.object({
  id: z.string().min(1),
  foundDate: isoDate,
  org: z.string().min(1),
  title: z.string().min(1),
  url: z.string(),
  eligibility: z.enum(ELIGIBILITY),
  deadline: optionalDate,
  status: z.enum(APPLICATION_STATUSES),
  match: z.number().int().min(0).max(100).nullable(),
  fatalGap: z.string(),
  nextAction: z.string(),
  cvVersion: z.string(),
  goNoGo: goNoGoSchema,
})

export const quickstartSchema = z.object({
  id: z.string(),
  date: isoDate,
  action: z.string(),
  outcome: z.string(),
  status: z.enum(WORK_STATUSES),
  link: z.string(),
  note: z.string(),
})

export const weeklyReviewSchema = z.object({
  week: z.number().int().min(1).max(24),
  date: isoDate,
  hours: z.number().min(0).max(168).nullable(),
  newEvidence: z.string(),
  skillsTested: z.string(),
  englishSessions: z.number().int().min(0).nullable(),
  applications: z.string(),
  blockers: z.string(),
  nextActions: z.string(),
})

export const settingsSchema = z.object({
  startDate: isoDate,
  ownerName: z.string(),
})

/** V2 evidence-first extensions: additive, so legacy backups remain importable. */
export const OPPORTUNITY_TYPES = ['pelatihan', 'lomba', 'ujian', 'tes', 'kompetisi', 'challenge', 'event', 'beasiswa', 'internship', 'job', 'project', 'volunteer', 'fellowship', 'lainnya'] as const
export const OPPORTUNITY_STATES = ['discovered', 'open', 'applied', 'accepted', 'participating', 'completed', 'closed', 'archived'] as const
export const opportunitySchema = z.object({
  id: z.string().min(1).max(120),
  type: z.enum(OPPORTUNITY_TYPES),
  title: z.string().min(1).max(300),
  organizer: z.string().min(1).max(220),
  description: z.string().max(4000).default(''),
  sourceUrl: z.string().url().refine(v => /^https?:\/\//.test(v)),
  registrationUrl: z.union([z.literal(''), z.string().url().refine(v => /^https?:\/\//.test(v))]).default(''),
  deadline: optionalDate.default(null),
  startDate: optionalDate.default(null),
  endDate: optionalDate.default(null),
  mode: z.enum(['offline', 'online', 'hybrid', 'unspecified']).default('unspecified'),
  location: z.string().max(260).default(''),
  cost: z.string().max(140).default(''),
  eligibility: z.string().max(1200).default(''),
  tags: z.array(z.string().min(1).max(80)).max(24).default([]),
  status: z.enum(OPPORTUNITY_STATES).default('discovered'),
  sourceKind: z.enum(['official', 'partner', 'media', 'unverified']).default('unverified'),
  verifiedAt: optionalDate.default(null),
  notes: z.string().max(4000).default(''),
})

export const PROVENANCE_TYPES = ['employment', 'internship', 'volunteering', 'academic', 'competition', 'course', 'exam', 'project', 'simulation', 'other'] as const
export const evidenceSchema = z.object({
  id: z.string().min(1).max(120),
  label: z.string().min(1).max(180),
  url: z.string().url().refine(v => /^https?:\/\//.test(v)),
  type: z.enum(['certificate','score_report','ranking','repository','report','dashboard','publication','reference','other']),
  visibility: z.enum(['public','private']).default('private'),
  issuer: z.string().max(220).default(''),
})

/** Quantities are raw measurements; the CV may only display publicly evidenced ones. */
export const metricSchema = z.object({
  id: z.string().min(1).max(120),
  label: z.string().min(1).max(180),
  kind: z.enum(['before_after','absolute','rank','score']),
  unit: z.string().min(1).max(80),
  baseline: z.number().finite().nonnegative().nullable().default(null),
  result: z.number().finite().nonnegative(),
  sampleSize: z.number().int().positive().nullable().default(null),
  method: z.string().min(1).max(1300),
  evidenceIds: z.array(z.string()).min(1).max(10),
  claimScope: z.enum(['team','individual']).default('team'),
  allowedInCv: z.boolean().default(false),
}).superRefine((value,ctx)=>{
  if(value.kind==='before_after' && value.baseline===null) ctx.addIssue({code:'custom',path:['baseline'],message:'Baseline wajib untuk perbandingan sebelum–sesudah'})
})
export const achievementSchema = z.object({
  id: z.string().min(1).max(120),
  opportunityId: z.string().default(''),
  title: z.string().min(1).max(300),
  organization: z.string().min(1).max(220),
  provenance: z.enum(PROVENANCE_TYPES),
  outcome: z.string().max(1800).default(''),
  contribution: z.string().max(1800).default(''),
  role: z.string().max(220).default(''),
  startDate: optionalDate.default(null),
  endDate: optionalDate.default(null),
  resultStatus: z.enum(['participated','completed','awarded','published','verified']).default('participated'),
  skillTags: z.array(z.string().max(80)).max(30).default([]),
  evidences: z.array(evidenceSchema).max(40).default([]),
  metrics: z.array(metricSchema).max(30).default([]),
  publiclyVisible: z.boolean().default(false),
})

export const publicProfileSchema = z.object({
  name: z.string().max(160).default(''),
  headline: z.string().max(220).default(''),
  location: z.string().max(160).default(''),
  summary: z.string().max(2400).default(''),
  availability: z.string().max(220).default(''),
  email: z.string().max(240).default(''),
  linkedin: z.union([z.literal(''), z.string().url().refine(v => /^https?:\/\//.test(v))]).default(''),
  github: z.union([z.literal(''), z.string().url().refine(v => /^https?:\/\//.test(v))]).default(''),
  institution: z.string().max(220).default(''),
  degree: z.string().max(220).default(''),
  educationPeriod: z.string().max(120).default(''),
  languages: z.array(z.object({name:z.string(),evidence:z.string()})).default([]),
}).prefault({})

export const trackerDataSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  settings: settingsSchema,
  competencies: z.array(competencySchema),
  roadmap: z.array(roadmapWeekSchema),
  resources: z.array(resourceSchema),
  capstones: z.array(capstoneSchema),
  benchmark: z.array(benchmarkSchema),
  applications: z.array(applicationSchema),
  quickstart: z.array(quickstartSchema),
  weeklyReviews: z.array(weeklyReviewSchema),
  opportunities: z.array(opportunitySchema).default([]),
  achievements: z.array(achievementSchema).default([]),
  publicProfile: publicProfileSchema,
})

export type Priority = (typeof PRIORITIES)[number]
export type CompetencyStatus = (typeof COMPETENCY_STATUSES)[number]
export type WorkStatus = (typeof WORK_STATUSES)[number]
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number]
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]
export type Competency = z.infer<typeof competencySchema>
export type RoadmapWeek = z.infer<typeof roadmapWeekSchema>
export type Resource = z.infer<typeof resourceSchema>
export type Capstone = z.infer<typeof capstoneSchema>
export type Benchmark = z.infer<typeof benchmarkSchema>
export type GoNoGo = z.infer<typeof goNoGoSchema>
export type Application = z.infer<typeof applicationSchema>
export type QuickstartItem = z.infer<typeof quickstartSchema>
export type WeeklyReview = z.infer<typeof weeklyReviewSchema>
export type Settings = z.infer<typeof settingsSchema>
export type TrackerData = z.infer<typeof trackerDataSchema>

export type Opportunity = z.infer<typeof opportunitySchema>
export type Achievement = z.infer<typeof achievementSchema>
export type PublicProfile = z.infer<typeof publicProfileSchema>
export type Metric = z.infer<typeof metricSchema>
