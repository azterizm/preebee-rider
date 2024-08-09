import { PackageStatus } from '@prisma/client'
import { prisma } from '~/db.server'

export async function getAllOrders() {
  return prisma.order.findMany({
    where: {
      packageStatus: 'Pending',
      paymentStatus: 'Done',
      riderId: null,
      user: {
        blocked: {
          not: true,
        },
      },
    },
    select: {
      id: true,
      packageStatus: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
        },
      },
      productsOrdered: { select: { id: true } },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    }
  })
}

export async function getAssignedOrdersByRiderId(id: string) {
  return prisma.order.findMany({
    where: {
      riderId: id,
      user: {
        blocked: {
          not: true,
        },
      },
    },
    select: {
      id: true,
      packageStatus: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
        },
      },
      productsOrdered: { select: { id: true } },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    }
  })
}

export async function getAssignedOrdersByRiderIdAndStatus(
  id: string,
  status: PackageStatus,
) {
  return prisma.order.findMany({
    where: {
      riderId: id,
      packageStatus: status,
      user: { blocked: { not: true } },
    },
    select: {
      id: true,
      packageStatus: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
        },
      },
      productsOrdered: { select: { id: true } },
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      packageStatus: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
        },
      },
      productsOrdered: {
        select: {
          id: true,
          quantity: true,
          product: {
            select: {
              id: true,
              title: true,
              mainImage: true,
            },
          },
        },
      },
      reason: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}
