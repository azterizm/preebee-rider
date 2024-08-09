import { Link } from '@remix-run/react'
import { getRelativeTime } from '~/utils/date'

interface Props {
  to: string
  createdAt: string | Date
  updatedAt?: string | Date
  address: string
  productsLength: number
  name?: string
}
export default function ListItem(props: Props) {
  return (
    <Link
      to={props.to}
      className='card shadow-xl bg-secondary/20'
    >
      <div className='card-body'>
        <h2 className='text-sm'>
          {props.updatedAt ? 'Applied ' : ''}
          {getRelativeTime(props.createdAt)}
        </h2>
        {props.updatedAt
          ? (
            <h2 className='text-sm'>
              Requested {getRelativeTime(props.updatedAt)}
            </h2>
          )
          : null}
        <p className='card-text text-md '>
          <p>
            {props.name}
          </p>
          <p>
            {props.address}
          </p>
        </p>
        <p className='card-text text-primary'>
          x{props.productsLength} product{props.productsLength > 1 ? 's' : ''}
        </p>
      </div>
    </Link>
  )
}
