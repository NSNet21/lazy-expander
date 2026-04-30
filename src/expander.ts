import expand from 'brace-expansion';

export function normalize(pattern: string): string {
  return pattern.replace(/\{([^}]+)\}/g, (_, inner) =>
    '{' + inner.split(',').map((s: string) => s.trim()).join(',') + '}'
  );
}

export function expandPattern(pattern: string): string[] {
  return expand(normalize(pattern)).filter(s => s.length > 0);
}

// Returns the start character if valid (0-9, a-z, A-Z), else null
export function detectStartChar(input: string): string | null {
  const ch = input.trim()[0];
  if (ch && /^[0-9a-zA-Z]$/.test(ch)) return ch;
  return null;
}

export function applyNumbering(items: string[], startChar: string): string[] {
  return items.map((item, i) => {
    const label = /^[0-9]$/.test(startChar)
      ? String(parseInt(startChar) + i)
      : String.fromCharCode(startChar.charCodeAt(0) + i);
    return `${label}. ${item}`;
  });
}
