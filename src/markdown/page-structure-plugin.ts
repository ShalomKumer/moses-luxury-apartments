import type { HastPluginDefinition } from 'satteri';

/**
 * A Markdown page plugin (Sätteri): makes each section heading a target that keyboard focus can move to (a link in the
 * table of contents lands on it, 2.4.3), and wraps each table in a scrollable region that a keyboard can reach and that
 * is named, with a caption, by the section above it (1.4.10, 2.1.1). It is a factory so each page starts with no section.
 */
export const pageStructurePlugin = (): HastPluginDefinition => {
  let section = '';
  return {
    name: 'page-structure',
    element: {
      filter: ['h2', 'table'],
      visit(node, ctx) {
        if (node.tagName === 'h2') {
          section = ctx.textContent(node).trim();
          ctx.setProperty(node, 'tabIndex', -1);
          return;
        }
        if (section) {
          ctx.prependChild(node, {
            type: 'element',
            tagName: 'caption',
            properties: { className: ['visually-hidden'] },
            children: [{ type: 'text', value: section }],
          });
        }
        ctx.wrapNode(node, {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['table-scroll'],
            tabIndex: 0,
            role: 'region',
            ...(section && { ariaLabel: section }),
          },
          children: [],
        });
      },
    },
  };
};
