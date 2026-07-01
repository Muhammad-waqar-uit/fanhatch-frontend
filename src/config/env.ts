/** Runtime config, read from NEXT_PUBLIC_* env (see .env.example). */
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3000',
  // When true, features serve mock data so the app runs with no backend.
  useMocks: (process.env.NEXT_PUBLIC_USE_MOCKS ?? 'true') !== 'false',
}
