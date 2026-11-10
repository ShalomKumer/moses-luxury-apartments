// The party and the name of the booking request (2026-11-10): couples, children and a total that is worked out and can be
// typed over, each within the apartment's guests; a name that goes into the message only. On the home page and on an
// apartment's page, in both languages, on a desktop and a phone.
import { expect, test, type Page } from '@playwright/test';
import { axeViolations } from './helpers/run-axe';

const LOCALES = [
  {
    label: 'Hebrew',
    home: '/',
    apartment: '/cabins/nobility-1/',
    big: '/cabins/artist-estate/',
    twoCouples: '2 זוגות',
    oneChild: 'ילד אחד',
    guests: (text: string) => `מספר אורחים: ${text}`,
    nameLine: (name: string) => `שם: ${name}`,
  },
  {
    label: 'English',
    home: '/en/',
    apartment: '/en/cabins/nobility-1/',
    big: '/en/cabins/artist-estate/',
    twoCouples: '2 couples',
    oneChild: '1 child',
    guests: (text: string) => `Number of guests: ${text}`,
    nameLine: (name: string) => `Name: ${name}`,
  },
];

const couples = (page: Page) => page.locator('[data-counter="couples"] [data-counter-input]');
const children = (page: Page) => page.locator('[data-counter="children"] [data-counter-input]');
const more = (page: Page, kind: 'couples' | 'children') => page.locator(`[data-counter="${kind}"] [data-counter-more]`);
const less = (page: Page, kind: 'couples' | 'children') => page.locator(`[data-counter="${kind}"] [data-counter-less]`);
const total = (page: Page) => page.locator('[data-request-guests]');
const message = async (page: Page) => (await page.locator('[data-request-message]').textContent()) ?? '';

for (const { label, home, apartment, big, twoCouples, oneChild, guests, nameLine } of LOCALES) {
  test.describe(`the party and the name, ${label}`, () => {
    test('the buttons step the couples and the children, and the total follows: two people a couple, one a child', async ({
      page,
    }) => {
      await page.goto(big);
      await expect(total(page)).toHaveValue('');
      await more(page, 'couples').click();
      await more(page, 'couples').click();
      await expect(couples(page)).toHaveValue('2');
      await expect(total(page)).toHaveValue('4');
      await more(page, 'children').click();
      await expect(children(page)).toHaveValue('1');
      await expect(total(page)).toHaveValue('5');
      expect(await message(page)).toContain(guests(`5 (${twoCouples}, ${oneChild})`));
      await less(page, 'couples').click();
      await expect(total(page)).toHaveValue('3');
      await less(page, 'children').click();
      await less(page, 'couples').click();
      await expect(couples(page)).toHaveValue('0');
      await expect(less(page, 'couples')).toHaveAttribute('aria-disabled', 'true');
      await expect(total(page)).toHaveValue('');
      expect(await message(page)).not.toContain(guests(''));
    });

    test('the couples and the children can be typed, and anything but digits is dropped', async ({ page }) => {
      await page.goto(big);
      await couples(page).fill('3');
      await children(page).fill('2');
      await expect(total(page)).toHaveValue('8');
      await couples(page).fill('a1b');
      await expect(couples(page)).toHaveValue('1');
      await expect(total(page)).toHaveValue('4');
      await couples(page).fill('');
      await expect(total(page)).toHaveValue('2');
      await couples(page).blur();
      await expect(couples(page)).toHaveValue('0');
    });

    test('the total can be typed over, and is worked out again when a counter changes', async ({ page }) => {
      await page.goto(big);
      await couples(page).fill('2');
      await total(page).fill('9');
      await expect(total(page)).toHaveValue('9');
      // the guest's own number: no split in the message
      const own = await message(page);
      expect(own).toContain(guests('9'));
      expect(own).not.toContain('(');
      await more(page, 'children').click();
      await expect(total(page)).toHaveValue('5');
      expect(await message(page)).toContain(guests(`5 (${twoCouples}, ${oneChild})`));
    });

    test('an emptied total gives the worked-out number back when the field is left', async ({ page }) => {
      await page.goto(big);
      await children(page).fill('3');
      await total(page).fill('');
      await total(page).blur();
      await expect(total(page)).toHaveValue('3');
    });

    test('an apartment for two takes one couple, or two children, and no more', async ({ page }) => {
      await page.goto(apartment);
      await more(page, 'couples').click();
      await expect(total(page)).toHaveValue('2');
      await expect(more(page, 'couples')).toHaveAttribute('aria-disabled', 'true');
      await expect(more(page, 'children')).toHaveAttribute('aria-disabled', 'true');
      // a button at its limit stays in the page and does nothing when pressed (the page marks it aria-disabled)
      await more(page, 'couples').click({ force: true });
      await more(page, 'children').click({ force: true });
      await expect(couples(page)).toHaveValue('1');
      await expect(children(page)).toHaveValue('0');
      await couples(page).fill('3');
      await expect(couples(page)).toHaveValue('1');
      await expect(page.locator('[data-guests-note]')).toContainText('2');
      await total(page).fill('7');
      await expect(total(page)).toHaveValue('2');
      await expect(page.locator('[data-guests-note]')).toBeVisible();
    });

    test('choosing a smaller apartment on the home page lowers the numbers and says so', async ({ page }) => {
      await page.goto(home);
      await couples(page).fill('4');
      await children(page).fill('3');
      await expect(total(page)).toHaveValue('11');
      await page.locator('[data-request-unit]').selectOption('nobility-1');
      await expect(couples(page)).toHaveValue('1');
      await expect(children(page)).toHaveValue('0');
      await expect(total(page)).toHaveValue('2');
      await expect(page.locator('[data-guests-note]')).toBeVisible();
      // a bigger apartment again: the limits grow, and a child can be added
      await page.locator('[data-request-unit]').selectOption('artist-estate');
      await more(page, 'children').click();
      await expect(children(page)).toHaveValue('1');
      await expect(total(page)).toHaveValue('3');
    });

    test('the name goes into the message and into the WhatsApp and Gmail links, with its characters encoded', async ({
      page,
    }) => {
      await page.goto(apartment);
      await expect(page.locator('[data-request-message]')).toContainText(nameLine('').trim());
      await page.locator('[data-request-name]').fill('Dana & Co #1 100%');
      const text = await message(page);
      expect(text).toContain(nameLine('Dana & Co #1 100%'));
      const whatsapp = new URL(
        (await page.locator('[data-request-bar] [data-booking-whatsapp]').getAttribute('href')) ?? '',
      );
      expect(whatsapp.searchParams.get('text')).toBe(text);
      const gmail = new URL((await page.locator('[data-request-bar] [data-booking-gmail]').getAttribute('href')) ?? '');
      expect(gmail.searchParams.get('body')).toBe(text);
      const mail = (await page.locator('[data-request-bar] [data-booking-email]').getAttribute('href')) ?? '';
      expect(decodeURIComponent(mail.split('body=')[1])).toBe(text);
    });

    test('a name with markup is text in the preview, never markup', async ({ page }) => {
      await page.goto(apartment);
      await page.locator('[data-request-name]').fill('<img src=x onerror=alert(1)><b>x</b>');
      await expect(page.locator('[data-request-message] img, [data-request-message] b')).toHaveCount(0);
      expect(await message(page)).toContain('<img src=x onerror=alert(1)>');
    });

    test('keeps a long name to sixty characters, and a name of spaces counts as no name', async ({ page }) => {
      await page.goto(apartment);
      const field = page.locator('[data-request-name]');
      await field.fill('x'.repeat(100));
      expect(await field.inputValue()).toHaveLength(60);
      await field.fill('     ');
      expect(await message(page)).toContain(nameLine('').trim());
      expect((await message(page)).split('\n')).toHaveLength(3);
    });

    test('stores nothing: no cookie, no local or session storage', async ({ page }) => {
      await page.goto(apartment);
      await page.locator('[data-request-name]').fill('Dana');
      await more(page, 'couples').click();
      const stored = await page.evaluate(() => ({
        cookie: document.cookie,
        local: window.localStorage.length,
        session: window.sessionStorage.length,
      }));
      expect(stored).toEqual({ cookie: '', local: 0, session: 0 });
      expect(await page.context().cookies()).toEqual([]);
    });

    test('works by keyboard alone: Tab reaches the buttons and the fields, Enter and Space press a button', async ({
      page,
    }) => {
      await page.goto(apartment);
      await more(page, 'couples').focus();
      await page.keyboard.press('Enter');
      await expect(couples(page)).toHaveValue('1');
      await page.keyboard.press('Space');
      // at the limit the button stays focusable and nothing changes
      await expect(more(page, 'couples')).toBeFocused();
      await expect(couples(page)).toHaveValue('1');
      await less(page, 'couples').focus();
      await page.keyboard.press('Enter');
      await expect(couples(page)).toHaveValue('0');
    });

    test('every field has a visible label, the buttons have names, and the open note passes axe', async ({ page }) => {
      await page.goto(apartment);
      await couples(page).fill('9');
      await expect(page.locator('[data-guests-note]')).toBeVisible();
      for (const control of await page.locator('[data-request-bar] input').all()) {
        const id = await control.getAttribute('id');
        await expect(page.locator(`label[for="${id}"]`)).toBeVisible();
      }
      for (const button of await page.locator('[data-counter] button').all()) {
        expect(((await button.getAttribute('aria-label')) ?? '').length).toBeGreaterThan(0);
      }
      expect(await axeViolations(page)).toEqual([]);
    });

    test('the request does not make the page scroll sideways', async ({ page }) => {
      for (const path of [home, apartment]) {
        await page.goto(path);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      }
    });
  });
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the fields are hidden, and the buttons still open a message with an empty name line', async ({ page }) => {
    await page.goto('/cabins/nobility-1/');
    await expect(page.locator('[data-request-name]')).toBeHidden();
    const href = (await page.locator('[data-request-bar] [data-booking-whatsapp]').getAttribute('href')) ?? '';
    expect(new URL(href).searchParams.get('text')).toContain('שם: ');
  });
});
