import { Link } from 'react-router'
import { Seo } from '../../components/Seo'
import { usePublicView } from '../../domain/public-view'
import { publicCvAchievements } from '../../domain/records'

export default function Home(){
  const {publicProfile:p,achievements}=usePublicView()
  const records=publicCvAchievements(achievements)
  return <><Seo title="About" description={p.summary||'Evidence-first career portfolio'} /><section className="hero">
    <div className="hero-eyebrow">{p.headline||'Evidence-first career portfolio'}</div><h1>{p.name||'Professional portfolio'}</h1>
    {p.summary?<p className="lead">{p.summary}</p>:<p className="lead">Verified projects, professional experience, and measurable results will appear here after publication.</p>}
    {p.location&&<p className="subtle">{p.location}</p>}{p.availability&&<p>{p.availability}</p>}
    <div className="row"><Link className="btn btn-primary" to="/portfolio">Portfolio</Link><Link className="btn" to="/cv">CV</Link>{p.email&&<a className="btn" href={`mailto:${p.email}`}>Email</a>}{p.linkedin&&<a className="btn" href={p.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}{p.github&&<a className="btn" href={p.github} target="_blank" rel="noopener noreferrer">GitHub</a>}</div>
  </section><section><div className="page-head"><div><h2>Evidence-backed outcomes</h2><p>Records are published only when provenance and public evidence are provided.</p></div></div>{records.length?<div className="grid grid-2">{records.slice(0,4).map(a=><div className="card" key={a.id}><span className="badge badge-info">{a.provenance}</span><h3>{a.title}</h3><p className="subtle">{a.organization}</p><p>{a.contribution||a.outcome}</p><Link to="/portfolio">View evidence →</Link></div>)}</div>:<div className="card"><p>No verified achievements have been published yet. The public portfolio does not display drafts or fictitious claims.</p></div>}</section>
  </>
}
