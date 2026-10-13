import { describe,it,expect } from 'vitest'
import { parseImport, normalizePackage } from './ingest'
const opportunity={id:'event-1',type:'event',title:'Sample event',organizer:'Example Institute',sourceUrl:'https://example.org/events/1'}
describe('batch import',()=>{
  it('supports a single opportunity and supplies defaults',()=>{const r=parseImport(JSON.stringify(opportunity),{opportunities:[],achievements:[]});expect(r.ok).toBe(true);if(r.ok)expect(r.package.opportunities[0]?.deadline).toBeNull()})
  it('rejects malformed source URL',()=>{const r=parseImport(JSON.stringify({...opportunity,sourceUrl:'javascript:alert(1)'}),{opportunities:[],achievements:[]});expect(r.ok).toBe(false)})
  it('deduplicates same ID or organizer/title',()=>{const body={format:'tondi/import-v1',opportunities:[opportunity,{...opportunity,id:'event-2'}],achievements:[]};const r=parseImport(JSON.stringify(body),{opportunities:[],achievements:[]});expect(r.ok).toBe(true);if(r.ok){expect(r.duplicates).toBe(1);expect(normalizePackage(r.package).opportunities).toHaveLength(1)}})
  it('does not overwrite existing on preview',()=>{const r=parseImport(JSON.stringify(opportunity),{opportunities:[opportunity as never],achievements:[]});expect(r.ok).toBe(true);if(r.ok)expect(r.conflicts).toBe(1)})
  it('rejects payload exceeding item cap',()=>{const data={format:'tondi/import-v1',opportunities:Array.from({length:1501},(_,i)=>({...opportunity,id:String(i)})),achievements:[]};expect(parseImport(JSON.stringify(data),{opportunities:[],achievements:[]}).ok).toBe(false)})
})
