#!/usr/bin/env node

import { Command } from 'commander';
import { processFile } from './processor';
import { LangConfig } from './types';
import * as fs from 'fs/promises';
import * as path from 'path';

const program = new Command();

program
  .name('tailwind-sort')
  .description('Sort Tailwind CSS classes in files')
  .version('2.0.0');

program
  .argument('<files...>', 'Files to process')
  .option('-c, --config <path>', 'Path to config file with langConfig')
  .option('--no-duplicates', 'Do not remove duplicate classes')
  .option('--prepend-custom', 'Place custom classes before Tailwind classes')
  .option('--prefix <prefix>', 'Custom Tailwind prefix (e.g., "tw-")', '')
  .action(async (files: string[], options: any) => {
    let baseLangConfig: LangConfig | undefined;

    // Load config file if specified
    if (options.config) {
      try {
        const configPath = path.resolve(options.config);
        const configContent = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(configContent);
        baseLangConfig = config.langConfig;
      } catch (error) {
        console.error(`Error loading config file: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
      }
    }

    const processingOptions = {
      shouldRemoveDuplicates: options.duplicates !== false,
      shouldPrependCustomClasses: options.prependCustom,
      customTailwindPrefix: options.prefix || ''
    };

    for (const file of files) {
      try {
        // Check if file exists first
        await fs.access(file);

        let langConfig: LangConfig = baseLangConfig || 'class="([^"]+)"'; // Default HTML or from config

        // Determine language config from file extension (extension-based override)
        const ext = path.extname(file);
        if (ext === '.haml') {
          langConfig = '\\.([\\._a-zA-Z0-9\\-]+)';
        } else if (ext === '.jsx' || ext === '.tsx') {
          langConfig = 'className="([^"]+)"';
        }

        await processFile(file, langConfig, processingOptions);
        console.log(`✓ Processed ${file}`);
      } catch (error) {
        console.error(`Error processing ${file}:`, error instanceof Error ? error.message : error);
      }
    }
  });

program.parse();
