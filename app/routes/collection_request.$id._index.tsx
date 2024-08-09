import { useHookstate } from '@hookstate/core'
import { Spinner, XCircle } from '@phosphor-icons/react'
import { CheckCircle } from '@phosphor-icons/react/dist/ssr'
import { ActionArgs, json, LoaderArgs, redirect } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import classNames from 'classnames'
import { serialize } from 'object-to-formdata'
import { useEffect, useRef } from 'react'
import { authenticator } from '~/auth.server'
import {
  assignRiderIdToCollectionRequestById,
  getCollectionRequestById,
  markCollectionRequestStatusById,
} from '~/models/collection_requests.server'
import { collectedIdsState } from '~/state/collection'
import { ConfirmationDialog } from '~/types/collection'
import { toDataURL } from '~/utils/api'
import { getRelativeTime } from '~/utils/date'

export async function loader({ params }: LoaderArgs) {
  if (!params.id) return redirect('/')
  const collectionRequest = await getCollectionRequestById(params.id)
  if (!collectionRequest) return redirect('/')
  return json({
    collectionRequest,
  })
}

export default function CollectionRequest() {
  const data = useLoaderData<typeof loader>()
  const reason = useHookstate('')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const collectionIds = useHookstate(collectedIdsState)
  const showConfirmation = useHookstate(ConfirmationDialog.None)
  const fetcher = useFetcher()
  useEffect(() => {
    if (showConfirmation.get() === ConfirmationDialog.None) {
      return dialogRef.current?.close()
    }
    dialogRef.current?.showModal()
  }, [showConfirmation])
  async function onSubmit() {
    if (
      showConfirmation.get() === ConfirmationDialog.None ||
      showConfirmation.get() === ConfirmationDialog.Failed && !reason.get() ||
      fetcher.state !== 'idle'
    ) return
    fetcher.submit(
      serialize({ reason: reason.get(), mark: showConfirmation.get() }),
      { method: 'post' },
    )
    showConfirmation.set(ConfirmationDialog.None)
    reason.set('')
  }
  return (
    <div>
      <div className='grid grid-cols-4 gap-4 mt-8'>
        <div className='col-span-4 lg:col-span-1'>
          <h1 className='text-4xl font-bold'>Collection Request</h1>
          <p>
            <b>Requested</b>{' '}
            {getRelativeTime(new Date(data.collectionRequest?.createdAt!))}
          </p>
          {data.collectionRequest.status === 'Coming' && (
            <p>
              <b>Rider responded</b>{' '}
              {getRelativeTime(new Date(data.collectionRequest?.updatedAt!))}
            </p>
          )}

          <div className='mt-4'>
            <h1 className='text-xl font-bold'>Seller</h1>
            <p>
              <b>Name</b> {data.collectionRequest.seller.name}
            </p>
            <p>
              <b>Address</b> {data.collectionRequest.seller.address}
            </p>
            <p>
              <b>Phone</b> {data.collectionRequest.seller.phone}
            </p>
            <p
              className={classNames(
                data.collectionRequest.status !== 'Pending' ? 'mt-2' : '',
              )}
            >
              <b>Status</b>{' '}
              <span
                className={classNames(
                  data.collectionRequest.status !== 'Pending'
                    ? 'bg-blue-600 text-white p-2 rounded-lg'
                    : '',
                )}
              >
                {data.collectionRequest.status}
              </span>
            </p>
          </div>
          {data.collectionRequest.status === 'Failed' &&
              data.collectionRequest.reason
            ? (
              <div className='mt-4'>
                <h1 className='text-xl font-bold'>Fail reason</h1>
                <p>
                  {data.collectionRequest.reason}
                </p>
              </div>
            )
            : null}
        </div>
        <div className='col-span-4 lg:col-span-3 flex items-center gap-8 flex-wrap'>
          {data.collectionRequest.products.map((
            r,
          ) => (
            <div
              key={r.id}
              onClick={() =>
                collectionIds.set((e) =>
                  e.includes(r.id) ? e.filter((i) => i !== r.id) : [...e, r.id]
                )}
              className={classNames(
                'card shadow-xl cursor-pointer select-none',
                collectionIds.get().includes(r.id)
                  ? 'bg-dark-muted text-white'
                  : 'bg-base-100',
              )}
            >
              <figure>
                <img
                  className='w-40 object-contain object-center'
                  src={toDataURL(r.mainImage.data as any, r.mainImage.type)}
                  alt={r.title}
                />
              </figure>

              <div className='card-body'>
                <h2 className='card-title'>{r.title}</h2>
                {r.stockSpecified > 0 && (
                  <p className='card-text'>x{r.stockSpecified}</p>
                )}
                {collectionIds.get().includes(r.id) && (
                  <CheckCircle
                    size={24}
                    className='absolute bottom-2 right-2'
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-8'>
        {data.collectionRequest.status === 'Pending'
          ? (
            <button
              className='btn btn-info'
              onClick={() =>
                showConfirmation.set(ConfirmationDialog.MarkActive)}
            >
              Mark active
            </button>
          )
          : data.collectionRequest.status === 'Coming'
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
                  <p>{data.collectionRequest.seller.address}</p>
                </>
              ),
              'Are you sure this collection is done and you recieved all items as mentioned in the list?',
              'Are you sure this collection failed? If yes, please mention the reason below.',
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

export async function action({ request, params }: ActionArgs) {
  const user = await authenticator.isAuthenticated(request)
  if (!user) return redirect('/login')
  const body = await request.formData()
  const mark = Number(body.get('mark'))
  const reason = body.get('reason')
  if (!params.id || isNaN(mark) || mark === ConfirmationDialog.None) {
    return redirect('/')
  }
  if (mark === ConfirmationDialog.Failed && !reason) {
    console.error('Reason can\'t be empty')
    return redirect('/')
  }

  if (mark === ConfirmationDialog.MarkActive) {
    await assignRiderIdToCollectionRequestById(params.id, user.id)
    return null
  }

  await markCollectionRequestStatusById(
    params.id,
    mark === ConfirmationDialog.Done ? 'Done' : 'Failed',
    (reason || '') as string,
  )

  return redirect('/?tab=0')
}


