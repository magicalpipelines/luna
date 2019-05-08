importScripts(
	'https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js'
)

workbox.routing.registerRoute(
	/.*\.(?:js|css)/,
	workbox.strategies.cacheFirst({
		cacheName: 'luna'
	})
)
