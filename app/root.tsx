import { ArrowLeft } from '@phosphor-icons/react'
import { cssBundleHref } from '@remix-run/css-bundle'
import {
  json,
  type LinksFunction,
  type LoaderArgs,
  redirect,
} from '@remix-run/node'
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useNavigate,
} from '@remix-run/react'
import { twMerge } from 'tailwind-merge'
import { authenticator } from './auth.server'
import { useHistoryStack } from './hooks/router'
import tailwindCssURL from './styles/tailwind.css'

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
  { rel: 'stylesheet', href: tailwindCssURL },
  { rel: 'stylesheet', href: '/general-sans.css' },
]

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request)
  if (!user && !request.url.includes('login')) return redirect('/login')
  return json({ user })
}

export default function App() {
  const historyStack = useHistoryStack()
  const data = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <div>
          <div
            className={twMerge(
              'relative flex items-center justify-between',
              historyStack.length ? 'mb-8' : '',
            )}
          >
            {historyStack.length || location.pathname !== '/'
              ? (
                <button
                  onClick={() => navigate('..')}
                  className='btn btn-primary'
                >
                  <ArrowLeft />
                  Go back
                </button>
              )
              : <div />}
            <h1 className='text-3xl font-bold absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
              Riders Panel
            </h1>
            {data.user
              ? (
                <Link
                  to='/logout'
                  className='btn btn-primary'
                >
                  Logout
                </Link>
              )
              : <div />}
          </div>
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
