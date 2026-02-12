const API_ORIGIN = 'https://codequest-api.tralala798.workers.dev'

export const onRequest: PagesFunction = async ({ request }) => {
  const url = new URL(request.url)
  const target = new URL(url.pathname + url.search, API_ORIGIN)
  const headers = new Headers(request.headers)
  headers.set('Host', new URL(API_ORIGIN).host)

  return fetch(target.toString(), {
    method: request.method,
    headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
  })
}
