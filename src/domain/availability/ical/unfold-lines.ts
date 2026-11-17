/** Joins iCal's folded lines (a continuation starts with a space or tab) into whole lines. */
export function unfoldLines(text: string): string[] {
  const physical = text.split(/\r\n|\n|\r/);
  const lines: string[] = [];
  for (const line of physical) {
    const isContinuation = (line.startsWith(' ') || line.startsWith('\t')) && lines.length > 0;
    if (isContinuation) lines[lines.length - 1] += line.slice(1);
    else if (line.length > 0) lines.push(line);
  }
  return lines;
}
