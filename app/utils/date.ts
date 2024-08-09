import RelativeTime from '@yaireo/relative-time'

export function getRelativeTime(date: Date|string) {
  const relativeTime = new RelativeTime({ locale: 'en' })
  return relativeTime.from(new Date(date))
}
