/**
 * Opens every fold of the apartments (`details.more`) when the address asks for all of them: `#all-cabins`, which the "All
 * apartments" link of an apartment's page uses. The address names an empty anchor placed at the start of the list
 * (`HomePage.astro`), so the page stands at the list whatever happens here; without JavaScript the list simply arrives
 * closed. It reads the address and changes nothing stored. The plain `#cabins` address leaves the fold as it is.
 */
const ALL_APARTMENTS = '#all-cabins';

/** Opens the folds now if the address asks, and again whenever the address changes to ask. */
export function openFoldsOnRequest(): void {
  const open = (): void => {
    if (location.hash !== ALL_APARTMENTS) return;
    for (const fold of document.querySelectorAll<HTMLDetailsElement>('details.more')) fold.open = true;
  };
  open();
  window.addEventListener('hashchange', open);
}
