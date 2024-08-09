import { ActionArgs, json, LoaderArgs } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { authenticator } from '~/auth.server'
import { getSession } from '~/session.server'

export async function loader({ request }: LoaderArgs) {
  await authenticator.isAuthenticated(request, { successRedirect: '/' })
  let session = await getSession(request)
  let error = session.get(authenticator.sessionErrorKey)
  return json({ error })
}

export default function Login() {
  const data = useLoaderData<typeof loader>()
  return (
    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
      <h1 className='font-bold text-3xl text-center'>Rider Dashboard</h1>

      <p className='font-bold text-lg text-center mt-4 mb-8'>Login</p>

      <Form
        method='post'
        className='flex flex-col justify-center items-center gap-4'
      >
        <input
          name='input'
          placeholder='Email or username'
          type='text'
          className='input input-bordered'
          required
        />
        <input
          name='password'
          required
          placeholder='Password'
          type='password'
          className='input input-bordered'
        />
        <button className='btn btn-primary'>Submit</button>
        {data.error?.message && (
          <p className='text-lg font-medium text-error'>{data.error.message}</p>
        )}
      </Form>
    </div>
  )
}

export async function action({ request }: ActionArgs) {
  return await authenticator.authenticate('user-pass', request, {
    successRedirect: '/',
    failureRedirect: '/login',
  })
}
