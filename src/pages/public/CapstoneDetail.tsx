import { Navigate } from 'react-router'
/** Legacy capstone routes no longer publish drafts masquerading as portfolio projects. */
export default function CapstoneDetail(){return <Navigate to="/portfolio" replace/>}
