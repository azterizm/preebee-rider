export type ApiFunctionResponse<T extends (...args: any) => any> =
  | Awaited<
    ReturnType<NonNullable<Awaited<ReturnType<T>>>['json']>
  >
  | null
