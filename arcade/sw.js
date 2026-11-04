"use strict";

const CACHE_NAME = "samworks-arcade-v2";
const APP_SHELL = [
    "./",
    "./index.html",
    "./games.html",
    "./Minecraft/minecraft-versions.html",
    "./Minecraft/servers/torch-smp.html",
    "./docs/terms-and-conditions.html",
    "./manifest.webmanifest",
    "./_static/css/index.css",
    "./_static/js/app.js",
    "./_static/js/games.js",
    "./_static/images/icon.svg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((key) => key.startsWith("samworks-arcade-") && key !== CACHE_NAME)
                .map((key) => caches.delete(key))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
    event.respondWith(
        fetch(request).then((response) => {
            if (response.ok) {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch((error) => {
                    console.error("The response could not be saved for offline use.", error);
                });
            }
            return response;
        }).catch(async () => {
            const cached = await caches.match(request);
            if (cached) return cached;
            if (request.mode === "navigate") return caches.match("./index.html");
            throw new Error(`No offline copy is available for ${request.url}`);
        })
    );
});
