import type { Page } from 'puppeteer';

import path from 'path';

function windowFigmaWaiter(isLoop = true) {
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
            setTimeout(reject, 10_000);
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

    await page.evaluate(() => windowFigmaWaiter(false));

    await page.setDefaultNavigationTimeout(0);
}

async function waitAuthFile(page: Page, figmaFileId: string) {
    await page.setDefaultNavigationTimeout(0);

    await goToFile(page, figmaFileId);

    await page.addScriptTag({ content: `${windowFigmaWaiter}` });

    await page.evaluate(() => windowFigmaWaiter());

    await page.setDefaultNavigationTimeout(30_000);
}

async function duplicateFile(page: Page, figmaFileId: string) {
    await goToFile(page, figmaFileId);

    await page.addScriptTag({ content: `var figmaFileId = "${figmaFileId}";` });

    const { meta } = await page.evaluate(async () => {
        const rawResponse = await fetch(`https://www.figma.com/api/multiplayer/${figmaFileId}/copy`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return rawResponse.json();
    });

    return meta.key;
}

async function deleteFile(page: Page, figmaFileId: string) {
    await goToFile(page, figmaFileId);

    await page.addScriptTag({ content: `var figmaFileId = "${figmaFileId}";` });

    await page.evaluate(async () => {
        await fetch('https://www.figma.com/api/files_batch', {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: [
                    { key: figmaFileId }
                ],
                trashed: true
            })
        });
    });
}

async function getCollectionsFile(page: Page, figmaFileId: string) {
    await goToFile(page, figmaFileId);

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
                    resolve(payload);
                } catch (error) {
                    reject(error);
                }
            }, reject);
        });
    });
}

export {
    deleteFile,
    waitAuthFile,
    checkAuthFile,
    duplicateFile,
    getCollectionsFile
};

