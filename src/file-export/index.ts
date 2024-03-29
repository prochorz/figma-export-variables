import type {
    Page,
    Browser,
    BrowserLaunchArgumentOptions
} from 'puppeteer';

import puppeteer from 'puppeteer';

import {
    deleteFile,
    waitAuthFile,
    duplicateFile,
    checkAuthFile,
    getCollectionsFile
} from './figma-file';

const userDataDir = 'node_modules/.figma-cache';

export class FileExport {
    private page!: Page;
    private browser!: Browser;

    private headless: BrowserLaunchArgumentOptions['headless'] = 'new';

    constructor(options: any) {
        this.headless = options.interactive ? false : this.headless;
    }

    async create(headless?: BrowserLaunchArgumentOptions['headless']) {
        if (this.browser) {
            await this.browser.close();
        }

        const config = {
            headless: headless || this.headless,
            userDataDir
        };

        this.browser = await puppeteer.launch(config);

        this.page = await this.browser.newPage();
    }

    async checkAuth(figmaFileId: string) {
        await checkAuthFile(this.page, figmaFileId);
    }

    async manualLogin(figmaFileId: string) {
        await this.create(false);

        await waitAuthFile(this.page, figmaFileId);
    }

    async exportFile(figmaFileId: string) {
        return await getCollectionsFile(this.page, figmaFileId);
    }

    async exportByDuplicateFile(figmaFileId: string) {
        const figmaFileIdDuplicate = await duplicateFile(this.page, figmaFileId);

        let collections
    
        try {
            collections = await getCollectionsFile(this.page, figmaFileIdDuplicate);
        } catch (error: any) {
            throw new Error(error.message);
        } finally {
            await deleteFile(this.page, figmaFileIdDuplicate);
        }

        return collections;
    }

    async destroy() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}
