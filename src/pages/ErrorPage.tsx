import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { Seo } from '../components/Seo'

export default function ErrorPage() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  if (error && !notFound) console.error(error)
  return (
    <main id="main">
      <div className="container">
        <Seo title={notFound ? 'Page not found' : 'Something went wrong'} noindex />
        <div className="card empty" style={{ marginTop: 48 }}>
          <h1>{notFound ? 'Page not found' : 'Something went wrong'}</h1>
          <p className="muted">
            {notFound
              ? 'The page you are looking for does not exist or has moved.'
              : 'An unexpected error occurred. Your tracker data is safe in this browser.'}
          </p>
          <Link className="btn btn-primary" to="/">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
