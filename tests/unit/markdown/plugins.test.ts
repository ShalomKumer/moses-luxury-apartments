import { describe, expect, it, vi } from 'vitest';
import { fillMarkersPlugin } from '../../../src/markdown/fill-markers-plugin';
import { pageStructurePlugin } from '../../../src/markdown/page-structure-plugin';

/** A stand-in for the plugin context that records the changes a plugin asks for. */
function fakeContext(parentTag = 'p', text = '') {
  return {
    parent: vi.fn(() => ({ type: 'element', tagName: parentTag })),
    replaceNode: vi.fn(),
    setProperty: vi.fn(),
    prependChild: vi.fn(),
    wrapNode: vi.fn(),
    textContent: vi.fn(() => text),
  };
}

// the plugins are typed by Sätteri; the tests pass only the parts they use
type Anything = never;
const asAny = <T>(value: unknown) => value as T;

function runText(value: string, parentTag = 'p') {
  const ctx = fakeContext(parentTag);
  (fillMarkersPlugin.text as (node: Anything, ctx: Anything) => void)(asAny({ type: 'text', value }), asAny(ctx));
  return ctx;
}

describe('fillMarkersPlugin', () => {
  it('replaces a text holding a marker with plain pieces and a box that begins with "To fill:"', () => {
    const ctx = runText('before [TO FILL: the amount] after');
    expect(ctx.replaceNode).toHaveBeenCalledOnce();
    const pieces = ctx.replaceNode.mock.calls[0][1] as {
      type: string;
      tagName?: string;
      properties?: unknown;
      children?: { value?: string }[];
    }[];
    expect(pieces).toHaveLength(3);
    expect(pieces[0]).toEqual({ type: 'text', value: 'before ' });
    expect(pieces[1].tagName).toBe('span');
    expect(pieces[1].properties).toEqual({ className: ['to-fill'] });
    expect(pieces[1].children?.map((c) => c.value ?? '')).toEqual(['', ' the amount']);
    expect(pieces[2]).toEqual({ type: 'text', value: ' after' });
  });

  it('labels a Hebrew marker in Hebrew', () => {
    const ctx = runText('[למילוי: סכום]');
    const pieces = ctx.replaceNode.mock.calls[0][1] as { children: { children?: { value: string }[] }[] }[];
    expect(pieces[0].children[0].children?.[0].value).toBe('למילוי:');
  });

  it('leaves a text with no marker alone', () => {
    expect(runText('plain words').replaceNode).not.toHaveBeenCalled();
  });

  it('leaves a bracket that is never closed alone', () => {
    expect(runText('[TO FILL: forgot').replaceNode).not.toHaveBeenCalled();
  });

  it('leaves code alone', () => {
    expect(runText('[TO FILL: x]', 'code').replaceNode).not.toHaveBeenCalled();
    expect(runText('[TO FILL: x]', 'pre').replaceNode).not.toHaveBeenCalled();
  });
});

describe('pageStructurePlugin', () => {
  type Visit = (node: Anything, ctx: Anything) => void;
  const visitOf = () => {
    const plugin = pageStructurePlugin();
    const element = plugin.element as { filter: string[]; visit: Visit };
    return element.visit;
  };
  const heading = { type: 'element', tagName: 'h2' };
  const table = { type: 'element', tagName: 'table' };

  it('only asks to see section headings and tables', () => {
    const element = pageStructurePlugin().element as { filter: string[] };
    expect(element.filter).toEqual(['h2', 'table']);
  });

  it('makes a section heading a target focus can move to', () => {
    const ctx = fakeContext('root', 'Fees');
    visitOf()(asAny(heading), asAny(ctx));
    expect(ctx.setProperty).toHaveBeenCalledWith(heading, 'tabIndex', -1);
  });

  it('wraps a table in a focusable named region and captions it with its section', () => {
    const visit = visitOf();
    visit(asAny(heading), asAny(fakeContext('root', '  Fees  ')));
    const ctx = fakeContext();
    visit(asAny(table), asAny(ctx));
    expect(ctx.prependChild.mock.calls[0][1]).toMatchObject({ tagName: 'caption', children: [{ value: 'Fees' }] });
    expect(ctx.wrapNode.mock.calls[0][1]).toMatchObject({
      tagName: 'div',
      properties: { className: ['table-scroll'], tabIndex: 0, role: 'region', ariaLabel: 'Fees' },
    });
  });

  it('wraps a table that has no section above it, with no caption and no name', () => {
    const ctx = fakeContext();
    visitOf()(asAny(table), asAny(ctx));
    expect(ctx.prependChild).not.toHaveBeenCalled();
    expect((ctx.wrapNode.mock.calls[0][1] as { properties: object }).properties).not.toHaveProperty('ariaLabel');
  });

  it('starts every page with no section, so one page does not name another page’s table', () => {
    const first = visitOf();
    first(asAny(heading), asAny(fakeContext('root', 'Fees')));
    const second = visitOf();
    const ctx = fakeContext();
    second(asAny(table), asAny(ctx));
    expect(ctx.prependChild).not.toHaveBeenCalled();
  });
});
