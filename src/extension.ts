import * as vscode from 'vscode';
import { expandPattern, detectStartChar, applyNumbering } from './expander';

const SEPARATORS = [
  { label: 'Comma',     description: '", "',  value: ', '  },
  { label: 'Pipe',      description: '" | "', value: ' | ' },
  { label: 'Semicolon', description: '"; "',  value: '; '  },
  { label: 'Slash',     description: '" / "', value: ' / ' },
  { label: 'Tab',       description: '"\\t"', value: '\t'  },
  { label: 'Custom...', description: 'Type your own', value: null as string | null },
];

const NUMBERING_OPTIONS = [
  { label: '0 to X', description: '0. item  1. item  2. item…', value: '0' },
  { label: '1 to X', description: '1. item  2. item  3. item…', value: '1' },
  { label: 'a to x', description: 'a. item  b. item  c. item…', value: 'a' },
  { label: 'A to X', description: 'A. item  B. item  C. item…', value: 'A' },
];

type PatternResult =
  | { pattern: string; mode: 'selection'; editor: vscode.TextEditor; selection: vscode.Selection }
  | { pattern: string; mode: 'input' };

async function getPattern(): Promise<PatternResult | undefined> {
  const editor = vscode.window.activeTextEditor;
  if (editor && !editor.selection.isEmpty) {
    return {
      pattern: editor.document.getText(editor.selection),
      mode: 'selection',
      editor,
      selection: editor.selection,
    };
  }
  const pattern = await vscode.window.showInputBox({
    prompt: 'Enter brace pattern',
    placeHolder: '*:{text-sm,font-bold,text-gray-500}',
  });
  if (!pattern) return undefined;
  return { pattern, mode: 'input' };
}

async function chooseSeparator(): Promise<string | undefined> {
  const pick = await vscode.window.showQuickPick(SEPARATORS, {
    placeHolder: 'Choose a separator',
  });
  if (!pick) return undefined;
  if (pick.value !== null) return pick.value;
  return vscode.window.showInputBox({
    prompt: 'Enter custom separator',
    placeHolder: ', ',
  });
}

async function applyOutput(output: string, result: PatternResult): Promise<void> {
  if (result.mode === 'selection') {
    await result.editor.edit(eb => eb.replace(result.selection, output));
  } else {
    await vscode.env.clipboard.writeText(output);
    vscode.window.showInformationMessage('Lazy Expander: Copied to clipboard!');
  }
}

async function cmdInline(): Promise<void> {
  const result = await getPattern();
  if (!result) return;
  const items = expandPattern(result.pattern);
  if (!items.length) return;
  await applyOutput(items.join(' '), result);
}

async function cmdInlineWithSeparator(): Promise<void> {
  const result = await getPattern();
  if (!result) return;
  const sep = await chooseSeparator();
  if (sep === undefined) return;
  const items = expandPattern(result.pattern);
  if (!items.length) return;
  await applyOutput(items.join(sep), result);
}

async function cmdMultipleLines(): Promise<void> {
  const result = await getPattern();
  if (!result) return;
  const items = expandPattern(result.pattern);
  if (!items.length) return;
  await applyOutput(items.join('\n'), result);
}

async function cmdMultipleLinesNumbered(): Promise<void> {
  const result = await getPattern();
  if (!result) return;
  const pick = await vscode.window.showQuickPick(NUMBERING_OPTIONS, {
    placeHolder: 'Choose numbering style',
  });
  if (!pick) return;
  const startChar = detectStartChar(pick.value);
  if (!startChar) return;
  const items = expandPattern(result.pattern);
  if (!items.length) return;
  await applyOutput(applyNumbering(items, startChar).join('\n'), result);
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('lazyExpander.inline',                cmdInline),
    vscode.commands.registerCommand('lazyExpander.inlineWithSeparator',   cmdInlineWithSeparator),
    vscode.commands.registerCommand('lazyExpander.multipleLines',         cmdMultipleLines),
    vscode.commands.registerCommand('lazyExpander.multipleLinesNumbered', cmdMultipleLinesNumbered),
  );
}

export function deactivate(): void {}
