import { createSeed } from '../data/seed'
import { render,screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter,RouterProvider } from 'react-router'
import { describe,expect,it,beforeEach,vi,afterEach } from 'vitest'
import { routes } from '../router'
import { useTracker } from '../store/tracker'
function renderAt(path:string){ const router=createMemoryRouter(routes,{initialEntries:[path]});render(<RouterProvider router={router}/>);return router }
beforeEach(()=>{
 useTracker.getState().reset();
 vi.stubGlobal('fetch',vi.fn(async(input:string)=>{
  const url=String(input);
  const result=url.includes('session')?{authenticated:true,configured:true}:url.includes('tracker')?{data:createSeed(),version:1}:{format:'tondi/public-v1',publicProfile:{name:'',headline:'',location:'',summary:'',availability:'',email:'',linkedin:'',github:'',institution:'',degree:'',educationPeriod:'',languages:[]},achievements:[]};
  return {ok:true,status:200,json:async()=>result};
 }));
})
afterEach(()=>vi.unstubAllGlobals())
describe('published surface',()=>{
  it('does not present placeholder achievements as real work',async()=>{renderAt('/');expect(await screen.findByRole('heading',{name:'Professional portfolio'})).toBeInTheDocument();expect(screen.getByText(/No verified achievements have been published/)).toBeInTheDocument()})
  it('renders the public CV route',async()=>{renderAt('/cv');expect(await screen.findByRole('heading',{name:'Curriculum Vitae'})).toBeInTheDocument()})
  it('renders a 404 for unknown paths',async()=>{renderAt('/not-here');expect(await screen.findByRole('heading',{name:'Page not found'})).toBeInTheDocument()})
})
describe('owner workspace',()=>{
  it('shows evidence-driven dashboard instead of self-scoring',async()=>{renderAt('/app');expect(await screen.findByRole('heading',{name:'Beranda Tondi'})).toBeInTheDocument();expect(screen.getByText(/Bangun bukti, bukan skor diri/)).toBeInTheDocument()})
  it('opens an empty opportunity form',async()=>{renderAt('/app/peluang');await userEvent.click(await screen.findByRole('button',{name:/Tambah satuan/}));expect(screen.getByRole('heading',{name:'Kesempatan baru'})).toBeInTheDocument()})
  it('supports the original application go/no-go workflow',async()=>{renderAt('/app/lamaran');await userEvent.click(await screen.findByRole('button',{name:'+ Tambah peluang'}));await userEvent.type(screen.getByLabelText('Organisasi *'),'GIZ');await userEvent.type(screen.getByLabelText('Judul lowongan *'),'Trainee Project Assistant');await userEvent.click(screen.getByRole('button',{name:'Simpan'}));expect(await screen.findByRole('heading',{name:'Trainee Project Assistant'})).toBeInTheDocument()})
})
