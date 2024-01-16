import type { Page } from 'puppeteer';

import path from 'node:path';

function windowFigmaWaiter(isLoop?: boolean) {
    return new Promise((resolve, reject) => {
        const callback = () => {
            setTimeout(() => {
                if ((window as any)?.figma) {
                    resolve(true);
                } else {
                    callback();
                }
            }, 1000);
        }
        callback();

        if (!isLoop) {
            setTimeout(reject, 5000);
        }
    });
}

async function goToFile(page: Page, figmaFileId: string) {
    const fileUrl = `https://www.figma.com/file/${figmaFileId}`;
    const currentUrl = await page.url();

    if (!currentUrl.startsWith(fileUrl)) {
        await page.goto(fileUrl);
        await page.waitForNavigation();
    }
}

async function checkAuthFile(page: Page, figmaFileId: string) {
    await page.setDefaultNavigationTimeout(5000);

    await goToFile(page, figmaFileId);

    await page.addScriptTag({ content: `${windowFigmaWaiter}` });

    await page.evaluate(() => windowFigmaWaiter());

    await page.setDefaultNavigationTimeout(0);
}

async function waitAuthFile(page: Page, figmaFileId: string) {
    await page.setDefaultNavigationTimeout(0);

    await goToFile(page, figmaFileId);

    await page.addScriptTag({ content: `${windowFigmaWaiter}` });

    await page.evaluate(() => windowFigmaWaiter(true));

    await page.setDefaultNavigationTimeout(30_000);
}

async function getCollectionsFile(page: Page, figmaFileId: string) {
    await goToFile(page, figmaFileId);

    await page.addScriptTag({ content: `var copyFileKey = "${figmaFileId}";` });
    await page.addScriptTag({ content: `${windowFigmaWaiter}` });

    await page.evaluate(async () => {
        const rawResponse = await fetch('https://requirejs.org/docs/release/2.3.6/minified/require.js');
        const response = await rawResponse.text();

        const script = document.createElement("script");
        script.innerHTML = response;

        document.head.appendChild(script);
    });

    await page.addScriptTag({ path: path.resolve(__dirname, '../figma-variables2json.js') });

    return page.evaluate(async () => {
        await windowFigmaWaiter();

        return new Promise((resolve, reject) => {
            (window.require as any)(['index'], ({ getFormatedVariables }: any) => {
                try {
                    const payload = getFormatedVariables();
                    console.log(payload, resolve);
                    resolve(payload);
                } catch (error) {
                    reject(error);
                }
            }, reject);
        });
    });
}

export {
    waitAuthFile,
    checkAuthFile,
    getCollectionsFile
};

