// Name of the cache
const CACHE_NAME = 'cache';
// Caching duration of the items, one week here
const CACHING_DURATION = 7 * 24 * 3600;
// Verbose logging or not
const DEBUG = true;

globalThis.addEventListener('fetch', (event) => {
	const { request } = event;

	// ...

	event.respondWith(
		globalThis.caches.open(`${CACHE_NAME}-tiles`).then((cache) =>
			cache.match(request).then((response) => {
				// If there is a match from the cache
				if (response) {
					DEBUG &&
						console.log(`SW: serving ${request.url} from cache.`);
					const expirationDate = Date.parse(
						response.headers.get('sw-cache-expires')
					);
					const now = new Date();
					// Check it is not already expired and return from the
					// cache
					if (expirationDate > now) {
						return response;
					}
				}

				// Otherwise, let's fetch it from the network
				DEBUG &&
					console.log(
						`SW: no match in cache for ${request.url}, using network.`
					);
				// Note: We HAVE to use fetch(request.url) here to ensure we
				// have a CORS-compliant request. Otherwise, we could get back
				// an opaque response which we cannot inspect
				// (https://developer.mozilla.org/en-US/docs/Web/API/Response/type).
				return fetch(request.url).then((liveResponse) => {
					// Compute expires date from caching duration
					const expires = new Date();
					expires.setSeconds(expires.getSeconds() + CACHING_DURATION);
					// Recreate a Response object from scratch to put
					// it in the cache, with the extra header for
					// managing cache expiration.
					const cachedResponseFields = {
						status: liveResponse.status,
						statusText: liveResponse.statusText,
						headers: { 'SW-Cache-Expires': expires.toUTCString() },
					};
					liveResponse.headers.forEach((v, k) => {
						cachedResponseFields.headers[k] = v;
					});
					// We will consume body of the live response, so
					// clone it before to be able to return it
					// afterwards.
					const returnedResponse = liveResponse.clone();
					return liveResponse.blob().then((body) => {
						DEBUG &&
							console.log(
								`SW: caching tiles ${
									request.url
								} until ${expires.toUTCString()}.`
							);
						// Put the duplicated Response in the cache
						cache.put(
							request,
							new Response(body, cachedResponseFields)
						);
						// Return the live response from the network
						return returnedResponse;
					});
				});
			})
		)
	);
});
