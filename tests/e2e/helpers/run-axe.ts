import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

/** WCAG 2.0, 2.1 and 2.2, levels A and AA: the target of docs/standards.md, section 8. */
const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * Runs axe over the page and returns each violation as one readable line: the rule, how serious, and where.
 * An empty list means axe found nothing; it never means the page is fully accessible (axe finds about a third of the
 * problems; the rest needs a person and a screen reader, stage 7).
 */
export async function axeViolations(page: Page): Promise<string[]> {
  const result = await new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze();
  return result.violations.map((violation) => {
    const where = violation.nodes.map((node) => node.target.join(' ')).join(' | ');
    return `${violation.id} (${violation.impact}): ${violation.help} -> ${where}`;
  });
}
