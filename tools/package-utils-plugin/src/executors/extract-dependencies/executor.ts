import { createPackageJson, createLockFile, getLockFileName } from '@nx/js';
import { writeFileSync, copyFileSync, existsSync } from 'fs';
import { detectPackageManager, ExecutorContext, writeJsonFile } from '@nx/devkit';
import { ExtractDependenciesExecutorOptions } from './schema';
import { resolve } from 'path';

export default async function buildExecutor(
  options: ExtractDependenciesExecutorOptions,
  context: ExecutorContext,
) {
  const packageManager = detectPackageManager();

  if (!context.projectName) {
    return { success: false };
  }

  const packageJson = createPackageJson(context.projectName, context.projectGraph, {
    root: context.root,
    isProduction: true, // We want to strip any non-prod dependencies
  });

  const lockFile = createLockFile(packageJson, context.projectGraph, packageManager);
  const lockFileName = getLockFileName(packageManager);
  writeJsonFile(`${options.outputPath}/package.json`, packageJson);
  writeFileSync(`${options.outputPath}/${lockFileName}`, lockFile, {
    encoding: 'utf-8',
  });

  const readmeName = 'README.md';
  const readmeFile = resolve(context.cwd, options.cwd || '', readmeName);
  // Copy README.md if it exists
  if (existsSync(readmeFile)) {
    copyFileSync(readmeFile, `${options.outputPath}/${readmeName}`);
  }

  if (options.assets) {
    for (const asset of options.assets) {
      const input = resolve(context.cwd, options.cwd || '', asset.input);
      const output = resolve(options.outputPath, asset.output);
      if (existsSync(input)) {
        copyFileSync(input, output);
      }
    }
  }

  return { success: true };
}
