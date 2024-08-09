import { hookstate } from '@hookstate/core'

export const collectedIdsState = hookstate<string[]>([])
