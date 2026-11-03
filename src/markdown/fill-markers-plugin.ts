import type { HastPluginDefinition } from 'satteri';
import { splitFillMarkers } from '../domain/text/fill-markers';

/** Elements whose words are code, never a marker. */
const CODE_TAGS = new Set(['code', 'pre']);

/**
 * A Markdown page plugin (Sätteri, Astro's Markdown processor): turns every "[למילוי: ...]" and "[TO FILL: ...]" into a
 * box that begins with the word "To fill:" (the word carries the meaning; the dashes only point to it). The source text
 * keeps the marker, so `npm run launch:check` still fails while one is left (L11).
 */
export const fillMarkersPlugin: HastPluginDefinition = {
  name: 'fill-markers',
  text(node, ctx) {
    const parent = ctx.parent(node);
    if (parent.type === 'element' && CODE_TAGS.has(parent.tagName)) return;
    const segments = splitFillMarkers(node.value);
    if (!segments.some((segment) => segment.kind === 'fill')) return;
    ctx.replaceNode(
      node,
      segments.map((segment) =>
        segment.kind === 'text'
          ? { type: 'text', value: segment.value }
          : {
              type: 'element',
              tagName: 'span',
              properties: { className: ['to-fill'] },
              children: [
                {
                  type: 'element',
                  tagName: 'strong',
                  properties: {},
                  children: [{ type: 'text', value: segment.label }],
                },
                { type: 'text', value: segment.value ? ` ${segment.value}` : '' },
              ],
            },
      ),
    );
  },
};
