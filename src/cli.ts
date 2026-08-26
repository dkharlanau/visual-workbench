#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { Command } from 'commander';
import { buildSemanticGraph, listVisualViews, projectVisualView, renderMarkdown, summarizeGraph } from './index.js';
import { parseVisualMarkdown, VisualWorkbenchError } from './parser.js';
import { VisualViewError } from './views.js';

type RenderFormat = 'svg' | 'html';

function resolveFormat(value?: string, output?: string): RenderFormat {
  const inferred = output && extname(output).toLowerCase() === '.html' ? 'html' : 'svg';
  const format = value ?? inferred;
  if (format !== 'svg' && format !== 'html') throw new VisualWorkbenchError(`Unsupported format: ${format}. Use svg or html.`);
  return format;
}

const program = new Command();
program.name('visual-workbench').description('Turn semantic Markdown metadata into business-ready visuals.').version('0.1.0');

program.command('render')
  .description('Render a Visual Workbench Markdown file to SVG or HTML.')
  .argument('<input>', 'Markdown source file')
  .option('-o, --output <file>', 'Output file')
  .option('-f, --format <format>', 'svg or html')
  .option('-v, --view <id>', 'Named view to render')
  .action(async (input: string, options: { output?: string; format?: string; view?: string }) => {
    const inputPath = resolve(input);
    const markdown = await readFile(inputPath, 'utf8');
    const format = resolveFormat(options.format, options.output);
    const suffix = options.view ? `.${options.view}` : '';
    const outputPath = resolve(options.output ?? inputPath.replace(/\.md$/i, `${suffix}.${format}`));
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, await renderMarkdown(markdown, format, options.view), 'utf8');
    console.log(`Rendered ${outputPath}`);
  });

program.command('render-views')
  .description('Render every named view in a Visual Workbench Markdown file.')
  .argument('<input>', 'Markdown source file')
  .option('-d, --output-dir <dir>', 'Output directory', '.artifacts/views')
  .option('-f, --format <format>', 'svg or html', 'svg')
  .action(async (input: string, options: { outputDir: string; format: string }) => {
    const inputPath = resolve(input);
    const markdown = await readFile(inputPath, 'utf8');
    const parsed = parseVisualMarkdown(markdown);
    const views = listVisualViews(parsed.visual);
    if (views.length === 0) throw new VisualViewError('This model has no named views.');
    const format = resolveFormat(options.format);
    const outputDir = resolve(options.outputDir);
    const stem = basename(inputPath, extname(inputPath));
    await mkdir(outputDir, { recursive: true });
    for (const view of views) {
      const outputPath = join(outputDir, `${stem}.${view.id}.${format}`);
      await writeFile(outputPath, await renderMarkdown(markdown, format, view.id), 'utf8');
      console.log(`Rendered ${outputPath}`);
    }
  });

program.command('validate')
  .description('Validate Visual Workbench metadata and graph relationships.')
  .argument('<input>', 'Markdown source file')
  .action(async (input: string) => {
    const markdown = await readFile(resolve(input), 'utf8');
    const parsed = parseVisualMarkdown(markdown);
    const summary = summarizeGraph(buildSemanticGraph(parsed.visual));
    console.log(`OK: ${parsed.visual.title} · ${summary.nodes} nodes · ${summary.edges} edges · ${parsed.visual.views.length} views`);
  });

program.command('inspect')
  .description('Print the semantic graph summary for a model or named view.')
  .argument('<input>', 'Markdown source file')
  .option('-v, --view <id>', 'Named view to inspect')
  .action(async (input: string, options: { view?: string }) => {
    const markdown = await readFile(resolve(input), 'utf8');
    const parsed = parseVisualMarkdown(markdown);
    const visual = projectVisualView(parsed.visual, options.view);
    const summary = summarizeGraph(buildSemanticGraph(visual));
    console.log(JSON.stringify({ title: visual.title, kind: visual.kind, view: options.view ?? null, ...summary }, null, 2));
  });

program.command('views')
  .description('List named views declared by a visual model.')
  .argument('<input>', 'Markdown source file')
  .action(async (input: string) => {
    const markdown = await readFile(resolve(input), 'utf8');
    const parsed = parseVisualMarkdown(markdown);
    const views = listVisualViews(parsed.visual);
    if (views.length === 0) {
      console.log('No named views.');
      return;
    }
    views.forEach((view) => console.log(`${view.id}\t${view.focus}\t${view.kind}\t${view.title}`));
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  if (error instanceof VisualWorkbenchError || error instanceof VisualViewError) {
    console.error(error.message);
    error.details.forEach((detail) => console.error(`- ${detail}`));
  } else {
    console.error(error instanceof Error ? error.message : String(error));
  }
  process.exitCode = 1;
});
