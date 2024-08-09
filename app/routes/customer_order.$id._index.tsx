import { useHookstate } from '@hookstate/core'
import { CheckCircle, Spinner, XCircle } from '@phosphor-icons/react'
import { json, LoaderArgs, redirect } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import classNames from 'classnames'
import { useRef } from 'react'
import { getOrderById } from '~/models/order.server'
import { ConfirmationDialog } from '~/types/collection'
import { toDataURL } from '~/utils/api'
import { getRelativeTime } from '~/utils/date'

export async function loader({ params }: LoaderArgs) {
  if (!params.id) return redirect('/')
  const order = await getOrderById(params.id)
  if (!order) return redirect('/')
  return json({
    order,
  })
}
export default function CustomerOrder() {
  const data = useLoaderData<typeof loader>()
  console.log(data)
  const showConfirmation = useHookstate(ConfirmationDialog.None)
  const reason = useHookstate('')
  const fetcher = useFetcher()
  const dialogRef = useRef<HTMLDialogElement>(null)
  function onSubmit() {}
  return (
    <div>
      <div className='grid grid-cols-4 gap-4 mt-8'>
        <div className='col-span-4 lg:col-span-1'>
          <h1 className='text-4xl font-bold'>Order</h1>
          <p>
            <b>Since</b> {getRelativeTime(new Date(data.order?.createdAt!))}
          </p>
          {data.order.packageStatus === 'Coming' && (
            <p>
              <b>Rider responded</b>{' '}
              {getRelativeTime(new Date(data.order?.updatedAt!))}
            </p>
          )}

          <div className='mt-4'>
            <h1 className='text-xl font-bold'>Seller</h1>
            <p>
              <b>Name</b> {data.order.user?.name}
            </p>
            <p>
              <b>Address</b> {data.order.user?.address}
            </p>
            <p
              className={classNames(
                data.order.packageStatus !== 'Pending' ? 'mt-2' : '',
              )}
            >
              <b>Status</b>{' '}
              <span
                className={classNames(
                  data.order.packageStatus !== 'Pending'
                    ? 'bg-blue-600 text-white p-2 rounded-lg'
                    : '',
                )}
              >
                {data.order.packageStatus}
              </span>
            </p>
          </div>
        </div>

          {data.order.packageStatus === 'Failed' &&
              data.order.reason
            ? (
              <div className='mt-4'>
                <h1 className='text-xl font-bold'>Fail reason</h1>
                <p>
                  {data.order.reason}
                </p>
              </div>
            )
            : null}

        <div className='col-span-4 lg:col-span-3 flex items-center gap-8 flex-wrap'>
          {data.order.productsOrdered.map((
            r,
          ) => (
            <div
              key={r.id}
              className={classNames(
                'card shadow-xl cursor-pointer select-none',
                'bg-base-100',
              )}
            >
              <figure>
                <img
                  className='w-40 object-contain object-center'
                  src={toDataURL(r.product.mainImage.data as any, r.product.mainImage.type)}
                  alt={r.product.title}
                />
              </figure>

              <div className='card-body'>
                <h2 className='card-title'>{r.product.title}</h2>
                {r.quantity > 0 && (
                  <p className='card-text'>x{r.quantity}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-8'>
        {data.order.packageStatus === 'Pending'
          ? (
            <button
              className='btn btn-info'
              onClick={() =>
                showConfirmation.set(ConfirmationDialog.MarkActive)}
            >
              Mark active
            </button>
          )
          : data.order.packageStatus === 'Coming'
          ? (
            <>
              <button
                className='btn btn-success'
                onClick={() => showConfirmation.set(ConfirmationDialog.Done)}
              >
                Done <CheckCircle size={24} />
              </button>
              <button
                className='btn btn-error'
                onClick={() => showConfirmation.set(ConfirmationDialog.Failed)}
              >
                Failed <XCircle size={24} />
              </button>
            </>
          )
          : null}
      </div>

      <dialog ref={dialogRef} id='confirmation_dialog' className='modal'>
        <div className='modal-box'>
          <h3 className='font-bold text-lg'>
            {['Mark Active', 'Done', 'Failed'][showConfirmation.get() - 1]}
          </h3>
          <p className='py-4'>
            {[
              (
                <>
                  <p className='font-semibold'>
                    Are you sure that you can visit this address as soon as
                    possible?
                  </p>
                  <p>{data.order.user?.address}</p>
                </>
              ),
              'Are you sure this order is done and you delivered all items as mentioned in the list?',
              'Are you sure this order failed? If yes, please mention the reason below.',
            ][showConfirmation.get() - 1]}
          </p>
          {showConfirmation.get() === ConfirmationDialog.Failed && (
            <div className='form-control'>
              <textarea
                value={reason.get()}
                onChange={(e) => reason.set(e.target.value)}
                className='textarea h-24 textarea-bordered textarea-accent'
                placeholder='Reason'
              >
              </textarea>
            </div>
          )}
          <div className='modal-action'>
            <button
              disabled={fetcher.state !== 'idle'}
              onClick={onSubmit}
              className='btn btn-primary'
            >
              {fetcher.state !== 'idle'
                ? (
                  <span>
                    Loading...
                    <Spinner className='animate-spin' />
                  </span>
                )
                : showConfirmation.get() === ConfirmationDialog.Failed
                ? 'Submit'
                : 'Yes'}
            </button>
            <button
              onClick={() => showConfirmation.set(ConfirmationDialog.None)}
              className='btn'
              disabled={fetcher.state !== 'idle'}
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
