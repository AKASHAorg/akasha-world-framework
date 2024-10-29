export interface ExtractDependenciesExecutorOptions {
  outputPath: string;
  cwd?: string;
  assets?: { input: string; output: string }[];
}
