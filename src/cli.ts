#!/usr/bin/env node

import { Command } from 'commander';
import { processFile } from './processor';
import { LangConfig } from './types';
import * as fs from 'fs/promises';
import * as path from 'path';

const program = new Command();

program
  .name('tailwind-class-sorter')
  .description('Sort Tailwind CSS classes in files')
  .version('2.0.0');

program
  .argument('<file>', 'File to process')
  .option('-c, --config <path>', 'Path to config file with langConfig')
  .option('--no-duplicates', 'Do not remove duplicate classes')
  .option('--prepend-custom', 'Place custom classes before Tailwind classes')
  .option('--prefix <prefix>', 'Custom Tailwind prefix (e.g., "tw-")', '')
  .action(async (file: string, options: any) => {
    try {
      // Check if file exists first
      await fs.access(file);

      let langConfig: LangConfig = 'class="([^"]+)"'; // Default HTML

      // Load config file if specified
      if (options.config) {
        try {
          const configPath = path.resolve(options.config);
          const configContent = await fs.readFile(configPath, 'utf-8');
          const config = JSON.parse(configContent);
          langConfig = config.langConfig || langConfig;
        } catch (error) {
          console.error(`Error loading config file: ${error instanceof Error ? error.message : error}`);
          process.exit(1);
        }
      }

      // Determine language config from file extension
      const ext = path.extname(file);
      if (ext === '.haml') {
        langConfig = '\\.([\\._a-zA-Z0-9\\-]+)';
      } else if (ext === '.jsx' || ext === '.tsx') {
        langConfig = 'className="([^"]+)"';
      }

      const processingOptions = {
        shouldRemoveDuplicates: options.duplicates !== false, // Fix: handle --no-duplicates correctly
        shouldPrependCustomClasses: options.prependCustom,
        customTailwindPrefix: options.prefix || ''
      };

      await processFile(file, langConfig, processingOptions);
      console.log(`✓ Processed ${file}`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
      process.exit(1);
    }
  });

program.parse();
