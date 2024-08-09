import { Rider } from '@prisma/client'
import bcrypt from 'bcrypt'
import { FormStrategy } from 'remix-auth-form'
import { Authenticator } from 'remix-auth'
import { sessionStorage } from './session.server'
import { getRiderByUsernameOrEmail } from './models/rider.server'
import invariant from 'tiny-invariant'

export const authenticator = new Authenticator<Rider>(sessionStorage, {
  sessionErrorKey: 'preebee_error',
})

authenticator.use(
  new FormStrategy(async ({ form }) => {
    let input = form.get('input') //email | username
    let password = form.get('password')

    invariant(typeof input === 'string', 'Invalid input')
    invariant(typeof password === 'string', 'Invalid input')

    let rider = await getRiderByUsernameOrEmail(input.trim())
    invariant(rider !== null && rider.passwordHash !== null, 'Rider not found.')

    const passwordMatches = await bcrypt.compare(password, rider.passwordHash)
    invariant(passwordMatches, 'Invalid password.')
    return rider
  }),
  'user-pass',
)
