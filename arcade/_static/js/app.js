"use strict";

const appRoot = new URL("../../", document.currentScript.src);
if ("serviceWorker" in navigator && window.isSecureContext) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register(new URL("sw.js", appRoot)).catch((error) => {
            console.error("The offline app could not be registered.", error);
        });
    });
}

let installPrompt;
const installButton = document.getElementById("installButton");
window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    if (installButton) installButton.hidden = false;
});

if (installButton) {
    installButton.addEventListener("click", async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        await installPrompt.userChoice;
        installPrompt = null;
        installButton.hidden = true;
    });
}

window.addEventListener("appinstalled", () => {
    if (installButton) installButton.hidden = true;
});
