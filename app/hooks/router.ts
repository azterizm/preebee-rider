import { useLocation, useNavigationType } from '@remix-run/react'
import { useEffect, useState } from 'react'

export function useHistoryStack() {
  const [stack, setStack] = useState<string[]>([])
  const { pathname } = useLocation()
  const type = useNavigationType()
  useEffect(() => {
    if (type === 'POP') {
      setStack(stack.slice(0, stack.length - 1))
    } else if (type === 'PUSH') {
      setStack([...stack, pathname].filter((r) => !r.includes('login')))
    } else {
      setStack(
        [...stack.slice(0, stack.length - 1), pathname].filter((r) =>
          !r.includes('login')
        ),
      )
    }
  }, [pathname, type])

  return stack
}
