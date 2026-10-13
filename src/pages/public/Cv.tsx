import { Seo } from '../../components/Seo'
import { usePublicView } from '../../domain/public-view'
import { publicCvAchievements,describeMetric } from '../../domain/records'

export default function Cv(){const {publicProfile:p,achievements}=usePublicView();const records=publicCvAchievements(achievements)
  const groups={experience:records.filter(x=>['employment','internship','volunteering'].includes(x.provenance)),projects:records.filter(x=>!['employment','internship','volunteering','course','exam','competition'].includes(x.provenance)),credentials:records.filter(x=>['course','exam','competition'].includes(x.provenance))}
  const render=(items:typeof records)=><>{items.map(a=><div className="cv-entry" key={a.id}><div className="cv-entry-head"><strong>{a.title} — {a.organization}</strong><span className="subtle">{a.startDate||''} {a.endDate?'– '+a.endDate:''}</span></div><div className="subtle">{a.provenance} · {a.resultStatus}{a.role?' · '+a.role:''}</div>{a.contribution&&<p>{a.contribution}</p>}{a.outcome&&<p>{a.outcome}</p>}{a.cvMetrics.length>0&&<ul>{a.cvMetrics.map(m=><li key={m.id}>{m.label}: {describeMetric(m)} <span className="subtle">({m.claimScope})</span>{m.method&&<small className="subtle"> · Metode: {m.method}</small>}{m.evidenceIds.map(id=>a.publicEvidences.filter(e=>e.id===id).map(e=><a key={e.id} href={e.url} target="_blank" rel="noopener noreferrer"> · Verifikasi: {e.label} ↗</a>))}</li>)}</ul>}<div className="row">{a.publicEvidences.map(e=><a key={e.id} href={e.url} rel="noopener noreferrer" target="_blank">{e.label} ↗</a>)}</div></div>)}</>
  return <div className="cv"><Seo title="CV" description={`Evidence-backed CV of ${p.name||'portfolio owner'}`}/><div className="row no-print" style={{justifyContent:'flex-end',marginBottom:12}}><button className="btn btn-sm" onClick={()=>window.print()}>Print / Save PDF</button></div><div className="card"><header><h1>{p.name||'Curriculum Vitae'}</h1><div className="muted">{p.headline}</div><div className="subtle">{[p.location,p.email,p.linkedin,p.github].filter(Boolean).join(' · ')}</div></header>
  {p.summary&&<section className="cv-section"><h2>Profile</h2><p>{p.summary}</p></section>}
  {groups.experience.length>0&&<section className="cv-section"><h2>Professional & volunteer experience</h2>{render(groups.experience)}</section>}
  {groups.projects.length>0&&<section className="cv-section"><h2>Projects & research</h2>{render(groups.projects)}</section>}
  {groups.credentials.length>0&&<section className="cv-section"><h2>Credentials, exams & competitions</h2>{render(groups.credentials)}</section>}
  {(p.institution||p.degree)&&<section className="cv-section"><h2>Education</h2><div className="cv-entry"><div className="cv-entry-head"><strong>{p.institution}</strong><span>{p.educationPeriod}</span></div><p>{p.degree}</p></div></section>}
  {p.languages.length>0&&<section className="cv-section"><h2>Languages</h2><p>{p.languages.map(l=>`${l.name}${l.evidence?' — '+l.evidence:''}`).join(' · ')}</p></section>}
  {records.length===0&&<p className="subtle">No verified public achievements have been published yet.</p>}
  </div></div>
}
