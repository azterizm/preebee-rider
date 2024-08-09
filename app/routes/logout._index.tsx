import { LoaderArgs } from '@remix-run/node'
import { authenticator } from '~/auth.server'

export async function loader({ request }: LoaderArgs) {
  return await authenticator.logout(request, { redirectTo: '/login' })
}
