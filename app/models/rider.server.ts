import { prisma } from '~/db.server'

export function getRiderById(id: string) {
  return prisma.rider.findFirst({ where: { id } })
}

export function getRiderByUsernameOrEmail(input: string) {
  return prisma.rider.findFirst({
    where: { OR: [{ username: input }, { email: input }] },
  })
}
