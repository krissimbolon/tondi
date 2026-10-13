import { describe,it,expect } from 'vitest'
import { achievementSchema } from './schema'
import { describeMetric, publicCvAchievements, proofSummary } from './records'
const record=achievementSchema.parse({id:'r1',title:'Observed process improvement',organization:'Sample institution',provenance:'academic',resultStatus:'completed',publiclyVisible:true,contribution:'Compiled evidence with the team',evidences:[{id:'ev1',label:'Report',url:'https://example.org/report',type:'report',visibility:'public'}],metrics:[{id:'m1',label:'Processing time',kind:'before_after',unit:'minutes',baseline:40,result:25,method:'Same workload, before and after intervention',evidenceIds:['ev1'],claimScope:'team',allowedInCv:true}]})
describe('verifiable metric renderer',()=>{
  it('computes observed delta, not invented percentage',()=>{expect(describeMetric(record.metrics[0]!)).toContain('37.5% decrease')})
  it('requires public evidence and explicit approval',()=>{expect(publicCvAchievements([record])[0]?.cvMetrics).toHaveLength(1);expect(publicCvAchievements([{...record,publiclyVisible:false}])).toHaveLength(0);expect(publicCvAchievements([{...record,provenance:'simulation'}])[0]?.cvMetrics).toHaveLength(0)})
  it('ignores private proof in public CV',()=>{const a={...record,evidences:record.evidences.map(e=>({...e,visibility:'private' as const}))};expect(proofSummary([a]).metricCount).toBe(0)})
})
