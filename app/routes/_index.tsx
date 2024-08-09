import { useHookstate } from '@hookstate/core'
import { Package, User as UserIcon } from '@phosphor-icons/react'
import {
  CollectionRequest,
  Order,
  Product,
  ProductOrdered,
  Seller,
  User,
} from '@prisma/client'
import { ActionArgs, json, type V2_MetaFunction } from '@remix-run/node'
import { useFetcher, useSearchParams } from '@remix-run/react'
import classNames from 'classnames'
import { serialize } from 'object-to-formdata'
import { useEffect, useMemo } from 'react'
import { authenticator } from '~/auth.server'
import {
  getActiveCollectionRequestsByRiderId,
  getAllCollectionRequests,
  getCollectionRequestsByRiderIdAndStatus,
} from '~/models/collection_requests.server'
import {
  getAllOrders,
  getAssignedOrdersByRiderId,
  getAssignedOrdersByRiderIdAndStatus,
} from '~/models/order.server'
import ListItem from '~/styles/components/ListItem'

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'Riders Panel | Preebee' },
    { name: 'description', content: 'Preebee' },
  ]
}

export default function Index() {
  const fetcher = useFetcher<
    ApiResponse
  >()

  console.log('fetcher', fetcher)

  const [searchParams] = useSearchParams()
  const activeList = useHookstate<ActiveList>(
    isNaN(Number(searchParams.get('tab')))
      ? ActiveList.CollectionRequests
      : Number(searchParams.get('tab')),
  )
  const isSelfTab = useMemo(
    () =>
      activeList.get() !== ActiveList.Done ||
      activeList.get() !== ActiveList.Failed,
    [activeList],
  )

  useEffect(() => {
    fetcher.submit(serialize({ tab: activeList.get() }), { method: 'post' })
  }, [activeList])

  return (
    <div className='text-lg font-bold text-blue-600'>
      <div className='join flex justify-center mt-8'>
        <button
          onClick={() => activeList.set(ActiveList.CollectionRequests)}
          className={classNames(
            'join-item btn btn-primary',
            activeList.get() === ActiveList.CollectionRequests
              ? 'btn-active'
              : '',
          )}
        >
          <Package />
          Collection Requests
        </button>
        <button
          onClick={() => activeList.set(ActiveList.CustomerOrders)}
          className={classNames(
            'join-item btn btn-primary',
            activeList.get() === ActiveList.CustomerOrders ? 'btn-active' : '',
          )}
        >
          <UserIcon />
          Customer Orders
        </button>
        <button
          onClick={() => activeList.set(ActiveList.Done)}
          className={classNames(
            'join-item btn',
            activeList.get() === ActiveList.Done ? 'btn-success' : '',
          )}
        >
          Done
        </button>
        <button
          onClick={() => activeList.set(ActiveList.Failed)}
          className={classNames(
            'join-item btn',
            activeList.get() === ActiveList.Failed ? 'btn-error' : '',
          )}
        >
          Failed
        </button>
      </div>

      {fetcher.state !== 'idle'
        ? <p className='text-center mt-16'>Loading...</p>
        : !fetcher.data
        ? <p className='text-center mt-16'>No data.</p>
        : null}

      {fetcher.data && 'activeCustomerOrders' in fetcher.data &&
          fetcher.data.activeCustomerOrders.length
        ? (
          <div className='bg-base-100 p-4 rounded-lg my-8'>
            <h1 className='text-4xl font-bold'>Active</h1>
            <div className='flex items-center gap-8 flex-wrap mt-8 justify-start'>
              {fetcher.data?.activeCustomerOrders.map((
                r,
              ) => (
                <ListItem
                  name={r.user.name || 'Unknown'}
                  to={`/customer_order/${r.id}`}
                  createdAt={r.createdAt}
                  address={r.user.address || ''}
                  productsLength={r.productsOrdered.length}
                />
              ))}
            </div>
          </div>
        )
        : null}

      {fetcher.data && 'activeCollectionRequests' in fetcher.data &&
          fetcher.data?.activeCollectionRequests?.length
        ? (
          <div className='bg-base-100 p-4 rounded-lg my-8'>
            <h1 className='text-4xl font-bold'>Active</h1>
            <div className='flex items-center gap-8 flex-wrap mt-8 justify-start'>
              {fetcher.data?.activeCollectionRequests.map((
                collectionRequest,
              ) => (
                <ListItem
                  name={collectionRequest.seller.name || ''}
                  to={`/collection_request/${collectionRequest.id}`}
                  updatedAt={collectionRequest.updatedAt}
                  createdAt={collectionRequest.createdAt}
                  address={collectionRequest.seller.address || ''}
                  productsLength={collectionRequest.products?.length}
                />
              ))}
            </div>
          </div>
        )
        : null}

      {fetcher.data && 'collectionRequests' in fetcher.data &&
          fetcher.data?.collectionRequests?.length
        ? (
          <div
            className={classNames(
              'rounded-lg my-8',
              !isSelfTab && 'bg-base-100 p-4',
            )}
          >
            {!isSelfTab && <h1 className='text-4xl font-bold'>New</h1>}
            <div className='flex items-center gap-8 flex-wrap mt-8 justify-start'>
              {fetcher.data?.collectionRequests?.map((collectionRequest) => (
                <ListItem
                  name={collectionRequest.seller.name || ''}
                  to={`/collection_request/${collectionRequest.id}`}
                  createdAt={collectionRequest.createdAt}
                  address={collectionRequest.seller.address || ''}
                  productsLength={collectionRequest.products?.length}
                />
              ))}
            </div>
          </div>
        )
        : null}

      {fetcher.data && 'customerOrders' in fetcher.data &&
          fetcher.data.customerOrders.length
        ? (
          <div
            className={classNames(
              'rounded-lg my-8',
              !isSelfTab && 'bg-base-100 p-4',
            )}
          >
            {!isSelfTab && <h1 className='text-4xl font-bold'>New</h1>}
            <div className='flex items-center gap-8 flex-wrap mt-8 justify-start'>
              {fetcher.data?.customerOrders?.map((r) => (
                <ListItem
                  name={r.user.name || 'Unknown'}
                  to={`/customer_order/${r.id}`}
                  createdAt={r.createdAt}
                  address={r.user.address || ''}
                  productsLength={r.productsOrdered.length}
                />
              ))}
            </div>
          </div>
        )
        : null}
    </div>
  )
}

export async function action({ request }: ActionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  })

  const body = await request.formData()
  const tab = body.get('tab')
  const activeList = isNaN(Number(tab))
    ? ActiveList.CollectionRequests
    : Number(tab)

  if (activeList === ActiveList.CollectionRequests) {
    const collectionRequests = await getAllCollectionRequests()
    const activeCollectionRequests = await getActiveCollectionRequestsByRiderId(
      user.id,
    )
    return json({
      collectionRequests,
      activeCollectionRequests,
    })
  }

  if (activeList === ActiveList.CustomerOrders) {
    const orders = await getAllOrders()
    const active = await getAssignedOrdersByRiderId(user.id)
    return json({
      customerOrders: orders,
      activeCustomerOrders: active,
    })
  }

  if (activeList === ActiveList.Done) {
    const collectionRequests = await getCollectionRequestsByRiderIdAndStatus(
      user.id,
      'Done',
    )
    const customerOrders = await getAssignedOrdersByRiderIdAndStatus(
      user.id,
      'Done',
    )
    return json({
      collectionRequests,
      customerOrders,
    })
  }

  if (activeList === ActiveList.Failed) {
    const collectionRequests = await getCollectionRequestsByRiderIdAndStatus(
      user.id,
      'Failed',
    )
    const customerOrders = await getAssignedOrdersByRiderIdAndStatus(
      user.id,
      'Failed',
    )
    return json({
      collectionRequests,
      customerOrders,
    })
  }

  return null
}

type ApiResponse = {
  collectionRequests:
    (CollectionRequest & { seller: Seller; products: Product[] })[]
  activeCollectionRequests:
    (CollectionRequest & { seller: Seller; products: Product[] })[]
  customerOrders: (Order & { user: User; productsOrdered: ProductOrdered[] })[]
  activeCustomerOrders:
    (Order & { user: User; productsOrdered: ProductOrdered[] })[]
} | null

enum ActiveList {
  CollectionRequests,
  CustomerOrders,
  Done,
  Failed,
}
