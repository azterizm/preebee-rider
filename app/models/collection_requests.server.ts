import { PackageStatus } from '@prisma/client'
import { redis } from '~/config/db'
import { prisma } from '~/db.server'

export async function getAllCollectionRequests() {
  return prisma.collectionRequest.findMany({
    where: {
      status: 'Pending',
      riderId: null,
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      seller: {
        select: {
          name: true,
          id: true,
          address: true,
          phone: true,
        },
      },
      products: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getActiveCollectionRequestsByRiderId(riderId: string) {
  return prisma.collectionRequest.findMany({
    where: {
      riderId,
      status: {
        in: ['Coming', 'Pending'],
      },
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      seller: {
        select: {
          name: true,
          id: true,
          address: true,
          phone: true,
        },
      },
      products: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getCollectionRequestById(id: string) {
  return prisma.collectionRequest.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      reason: true,
      seller: {
        select: {
          name: true,
          id: true,
          address: true,
          phone: true,
        },
      },
      products: {
        select: {
          id: true,
          title: true,
          stockSpecified: true,
          mainImage: true,
        },
      },
    },
  })
}

export async function assignRiderIdToCollectionRequestById(
  id: string,
  riderId: string,
) {
  return prisma.collectionRequest.update({
    where: {
      id,
    },
    data: {
      riderId,
      status: 'Coming',
    },
  })
}

export async function markCollectionRequestStatusById(
  id: string,
  status: PackageStatus,
  reason?: string,
) {
  const collectionRequest = await prisma.collectionRequest.update({
    where: {
      id,
    },
    data: {
      status,
      reason,
    },
    include: {
      products: true,
      seller: {
        select: {
          id: true,
        },
      },
    },
  })

  await redis.sadd(
    `alerts:${collectionRequest.seller.id}`,
    'collection_request',
  )

  await Promise.all(
    collectionRequest.products.map(async (p) => {
      await prisma.product.update({
        where: { id: p.id },
        data: {
          status: status === 'Done'
            ? 'Available'
            : p.stockAcquired > 0
            ? 'Available'
            : 'EmptyStock',
          stockAcquired: status === 'Done' ? p.stockSpecified : undefined,
          stockSpecified: status === 'Done' ? 0 : p.stockSpecified,
        },
      })

      if (
        collectionRequest.riderId
      ) {
        await prisma.productCollected.create({
          data: {
            collectionRequestId: id,
            riderId: collectionRequest.riderId,
            productId: p.id,
            quantity: p.stockSpecified,
          },
        })
      }
    }),
  )

  return collectionRequest
}

export async function getCollectionRequestsByRiderIdAndStatus(
  riderId: string,
  status: PackageStatus,
) {
  return prisma.collectionRequest.findMany({
    where: {
      riderId,
      status,
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      seller: {
        select: {
          name: true,
          id: true,
          address: true,
          phone: true,
        },
      },
      products: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}
