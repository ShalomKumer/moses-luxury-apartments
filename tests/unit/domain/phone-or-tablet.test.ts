import { describe, expect, it } from 'vitest';
import { isPhoneOrTablet } from '@domain/booking/phone-or-tablet';

const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const IPAD =
  'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';
const ANDROID_PHONE =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';
const ANDROID_TABLET =
  'Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';
const WINDOWS =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const LINUX = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const CHROMEOS =
  'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

describe('isPhoneOrTablet', () => {
  it('is true for an iPhone, an iPad and an Android phone or tablet, where a mailto link opens the mail app', () => {
    for (const userAgent of [IPHONE, IPAD, ANDROID_PHONE, ANDROID_TABLET]) {
      expect(isPhoneOrTablet({ userAgent, maxTouchPoints: 5 })).toBe(true);
    }
  });

  it('is true for an iPad that says it is a Mac (iPadOS), told apart from a Mac by its touch screen', () => {
    expect(isPhoneOrTablet({ userAgent: MAC, maxTouchPoints: 5 })).toBe(true);
  });

  it('is false for a computer, even one with a touch screen: it has no mail app set up as often as a browser signed in to Gmail', () => {
    expect(isPhoneOrTablet({ userAgent: MAC, maxTouchPoints: 0 })).toBe(false);
    expect(isPhoneOrTablet({ userAgent: WINDOWS, maxTouchPoints: 0 })).toBe(false);
    expect(isPhoneOrTablet({ userAgent: WINDOWS, maxTouchPoints: 10 })).toBe(false);
    expect(isPhoneOrTablet({ userAgent: LINUX, maxTouchPoints: 10 })).toBe(false);
    expect(isPhoneOrTablet({ userAgent: CHROMEOS, maxTouchPoints: 10 })).toBe(false);
  });

  it('is false when the browser says nothing, so the link opens Gmail in a tab rather than nothing at all', () => {
    expect(isPhoneOrTablet({ userAgent: '', maxTouchPoints: 0 })).toBe(false);
    expect(isPhoneOrTablet({ userAgent: '', maxTouchPoints: 5 })).toBe(false);
  });
});
