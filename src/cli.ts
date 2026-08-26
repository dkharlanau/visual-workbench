#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import { Command } from 'commander';
import { buildSemanticGraph, renderMarkdown, summarizeGraph } from './index.js';
import { parseVisualMarkdown, VisualWorkbenchError } from './parser.js';

const program = new Command();
program.name('visual-workbench').description('Turn semantic Markdown metadata into business-ready visuals.').version('0.1.0');

program.command('render')
  .description('Render a Visual Workbench Markdown file to SVG or HTML.')
  .argument('<input>', 'Markdown source file')
  .option('-o, --output <file>', 'Output file')
  .option('-f, --format <format>', 'svg or html')
  .action(async (input: string, options: { output?: string; format?: string }) => {
    const inputPath = resolve(input);
    const markdown = await readFile(inputPath, 'utf8');
    const inferred = options.output && extname(options.output).toLowerCase() === '.html' ? 'html' : 'svg';
    const format = (options.format ?? inferred) as 'svg' | 'html';
    if (format !== 'svg' && format !== 'html') throw new VisualWorkbenchError(`Unsupported format: ${format}. Use svg or html.`);
    const outputPath = resolve(options.output ?? inputPath.replace(/\.md$/i, `.${format}`));
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, await renderMarkdown(markdown, format), 'utf8');
    console.log(`Rendered ${outputPath}`);
  });

program.command('validate')
  .description('Validate Visual Workbench metadata and graph relationships.')
  .argument('<input>', 'Markdown source file')
  .action(async (input: string) => {
    const markdown = await readFile(resolve(input), 'utf8');
    const parsed = parseVisualMarkdown(markdown);
    const summary = summarizeGraph(buildSemanticGraph(parsed.visual));
    console.log(`OK: ${parsed.visual.title} · ${summary.nodes} nodes · ${summary.edges} edges`);
  });

program.command('inspect')
  .description('Print the semantic graph summary for a visual model.')
  .argument('<input>', 'Markdown source file')
  .action(async (input: string) => {
    const markdown = await readFile(resolve(input), 'utf8');
    const parsed = parseVisualMarkdown(markdown);
    const summary = summarizeGraph(buildSemanticGraph(parsed.visual));
    console.log(JSON.stringify({ title: parsed.visual.title, kind: parsed.visual.kind, ...summary }, null, 2));
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  if (error instanceof VisualWorkbenchError) {
    console.error(error.message);
    error.details.forEach((detail) => console.error(`- ${detail}`));
  } else {
    console.error(error instanceof Error ? error.message : String(error));
  }
  process.exitCode = 1;
});
