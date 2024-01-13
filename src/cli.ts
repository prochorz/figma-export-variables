import ora from 'ora';
import sade from 'sade';
import fs from 'node:fs';
import path from 'node:path';

import { FileExport } from './file-export';
import * as pkg from '../package.json';

const prog = sade('figma-export-variables');

const spinner = ora();

prog.version(pkg.version);

prog
    .command('use-config [configFile]', undefined)
    .describe('Export using a configuration file.')
    .example('use-config')
    .example('use-config ./.figma-export-variables.js')
    .action(
        async (configFile = '.figmaexporvariablestrc.js') => {
            const fileExport = new FileExport();
            const configPath = path.resolve(configFile);
            const { files = [] } = (fs.existsSync(configPath) ? require(configPath) : {});
            const firstFileId = files[0]?.id;

            spinner.info('Run puppeteer');

            // STEP 1
            spinner.start('Create Browser');
 
            await fileExport.create()
                .then(() => spinner.succeed())
                .catch(() => spinner.fail());

            // STEP 2
            spinner.indent = 2;
            spinner.start('Check Login');

            await fileExport.checkAuth(firstFileId)
                .catch(() => {
                    spinner.warn('Need Manual Login');
                    return fileExport.manualLogin(firstFileId);
                })
                .then(() => spinner.succeed())
                .catch(() => spinner.fail('Fail with Login'));
 
            // STEP 3
            try {
                for(const file of files) { 
                    spinner.indent = 0;
                    spinner.start('Export file ' + file.id);
    
                    const collections = await fileExport.exportFile(file.id);
    
                    spinner.succeed();
    
                    for(const [index, output] of file.outputters.entries()) {
                        spinner.indent = 2;
                        
                        spinner.start('Output function ' + index);
         
                        await output(collections);
        
                        spinner.succeed();
                    }
                }

                spinner.info('Done');
            } catch (error: any) {
                spinner.fail(error?.message);
            }

            await fileExport.destroy();
        }
    );

prog.parse(process.argv);
