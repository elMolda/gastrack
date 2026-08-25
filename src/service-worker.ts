/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE = `gastrack-${version}`;
const ASSETS = new Set(
	[...build, ...files].filter(
		(path) => path !== '/_headers' && path !== '/_redirects' && !path.endsWith('.DS_Store')
	)
);
const OFFLINE_URL = '/offline.html';

function isSkippable(request: Request, url: URL) {
	if (request.method !== 'GET') return true;
	if (url.origin !== sw.location.origin) return true;
	if (url.pathname.startsWith('/api/')) return true;
	if (url.pathname === '/service-worker.js') return true;
	return false;
}

async function cacheFirst(request: Request) {
	const cache = await caches.open(CACHE);
	const cached = await cache.match(request);
	if (cached) return cached;

	const response = await fetch(request);
	if (response.ok) {
		cache.put(request, response.clone());
	}
	return response;
}

async function networkFirst(request: Request, fallbackUrl?: string) {
	const cache = await caches.open(CACHE);
	try {
		const response = await fetch(request);
		if (response.ok && !response.headers.get('cache-control')?.includes('no-store')) {
			cache.put(request, response.clone());
		}
		return response;
	} catch (error) {
		const cached = await cache.match(request);
		if (cached) return cached;
		if (fallbackUrl) {
			const offline = await cache.match(fallbackUrl);
			if (offline) return offline;
		}
		throw error;
	}
}

sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll([...ASSETS]))
			.then(() => sw.skipWaiting())
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			for (const key of keys) {
				if (key !== CACHE) await caches.delete(key);
			}
			await sw.clients.claim();
		})
	);
});

sw.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);
	if (isSkippable(event.request, url)) return;

	if (event.request.mode === 'navigate') {
		event.respondWith(networkFirst(event.request, OFFLINE_URL));
		return;
	}

	if (ASSETS.has(url.pathname)) {
		event.respondWith(cacheFirst(event.request));
		return;
	}

	event.respondWith(networkFirst(event.request));
});
