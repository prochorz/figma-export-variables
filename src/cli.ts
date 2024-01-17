import ora from 'ora';
import sade from 'sade';
import fs from 'node:fs';
import path from 'node:path';

import { FileExport } from './file-export';
import * as pkg from '../package.json';

const prog = sade('figma-export-variables');

const spinner = ora();

prog.version(pkg.version)
    .option('-i, --interactive', 'Run puppeteer GUI ', false)
    .example('use-config --interactive')
;

prog
    .command('use-config [configFile]', undefined)
    .describe('Export using a configuration file.')
    .example('use-config')
    .example('use-config ./.figma-export-variables.js')
    .action(
        async (configFile = '.figmaexportvariablestrc.js', opts) => {
            const fileExport = new FileExport(opts);
            const configPath = path.resolve(configFile);
            const { commands = [] } = (fs.existsSync(configPath) ? require(configPath) : {});
            const files = commands.filter(([key]: any) => key === 'variables').map(([_, item]: any) => item);
            const firstFileId = files[0]?.fileId;

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

                    spinner.info('File ' + file.fileId);
                    
                    spinner.indent = 2;
                    spinner.start('Export');

                    let collections;

                    await fileExport.exportFile(file.fileId)
                        .catch(error => {
                            spinner.fail('Export failed with error: ' + error?.message);

                            spinner.start('Export try with duplicate file');

                            return fileExport.exportByDuplicateFile(file.fileId);
                        })
                        .then(response => {
                            collections = response;
                            spinner.succeed()
                        });
        
                    for(const [index, output] of file.outputters.entries()) {
                        spinner.indent = 4;
                        spinner.start('Output function ' + index);
        
                        await output(collections);
        
                        spinner.succeed();
                    }
                }
            } catch (error: any) {
                spinner.fail('Export failed with error: ' + error?.message);
            }

            spinner.info('Finish');

            await fileExport.destroy();
        }
    );

prog.parse(process.argv);
