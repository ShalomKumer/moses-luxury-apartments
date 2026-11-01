/** Fills the {name} slots of a text with values; a slot with no value is left as written, so a mistake shows. */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (slot, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : slot,
  );
}
