/** Groups whole iCal lines into one list of lines per VEVENT, dropping everything outside events. */
export function extractEventBlocks(lines: string[]): string[][] {
  const blocks: string[][] = [];
  let current: string[] | null = null;
  for (const line of lines) {
    const upper = line.toUpperCase();
    if (upper === 'BEGIN:VEVENT') current = [];
    else if (upper === 'END:VEVENT' && current) {
      blocks.push(current);
      current = null;
    } else if (current) current.push(line);
  }
  return blocks;
}
