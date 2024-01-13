import type {
    Page,
    Browser
} from 'puppeteer';

import puppeteer from 'puppeteer';

import {
    deleteFile,
    waitAuthFile,
    checkAuthFile,
    duplicateFile,
    getCollectionsFile
} from './figma-file';

const userDataDir = '.cache';

export class FileExport {
    private page!: Page;
    private browser!: Browser;

    async create(headless: any = 'new') {
        if (this.browser) {
            await this.browser.close();
        }

        this.browser = await puppeteer.launch({ headless, userDataDir });

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
        const figmaFileIdDuplicate = await duplicateFile(this.page, figmaFileId);

        let collections;
    
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
