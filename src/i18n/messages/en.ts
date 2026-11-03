import type { Messages } from './types';

/**
 * Every text the site shows around its content, in English: approved by the user on 2026-10-31 (the owner's two logo
 * lines are our translation of his Hebrew). The legal pages in English stay drafts for a lawyer (src/content/legal/en).
 * The same keys as Hebrew; a missing or extra key fails the type check.
 * The English wording says "apartment", as the logo does, until the owner's choice of name is known.
 */
export const en: Messages = {
  language: { code: 'en', name: 'English', switchHint: 'Switch to English' },
  brand: {
    name: 'Moses Luxury Apartments',
    tagline: "Luxury apartments in the heart of Safed's Old City",
    slogan: 'A luxurious experience, tranquility and breathtaking views',
    description:
      "Moses Luxury Apartments: luxury apartments in the heart of Safed's Old City. Photos and details, and direct booking by WhatsApp or email.",
    logoAlt: 'Moses Luxury Apartments',
  },
  business: {
    legalName: '[TO FILL: registered business name]',
    businessNumber: '[TO FILL: business registration number]',
    address: '[TO FILL: address of the apartments]',
  },
  common: {
    skipToMain: 'Skip to the main content',
    sampleBanner: 'Site under construction: the apartments and photos here are samples only.',
    lastUpdated: 'Last updated',
    phone: 'Phone',
    email: 'Email',
    pageTitle: '{title} | {site}',
  },
  nav: {
    main: 'Main navigation',
    cabins: 'Apartments',
    contact: 'Contact',
    breadcrumb: 'Breadcrumb',
    allCabins: 'All apartments',
  },
  home: {
    hero: { alt: 'A drawn sample of stone houses in an old town at sunset (sample content)' },
    request: {
      heading: 'Booking request',
      unit: 'Which apartment',
      unitAny: 'Any apartment, I would like an offer',
      checkIn: 'Check-in date',
      checkOut: 'Check-out date',
      guests: 'Number of guests',
      guestsNone: 'Not chosen',
      previewLabel: 'The message that will open, where you add your dates:',
      problems: {
        'check-in-past': 'The check-in date has already passed.',
        'check-out-not-after': 'The check-out date must be after the check-in date.',
      },
    },
    cabinsHeading: 'The apartments',
    points: {
      place: {
        title: "In the heart of Safed's Old City",
        body: "The apartments are in the Old City of Safed, as the owner's logo says.",
      },
      direct: {
        title: 'Direct booking',
        body: 'Send a request by WhatsApp or email. The booking is made once we confirm it.',
      },
      third: {
        title: '[TO FILL: third point]',
        body: 'The owner will give something true and special about the apartments. Until then it stays empty.',
      },
    },
  },
  cabin: {
    guestsUpTo: 'Up to {count} guests',
    details: 'Details and booking',
    about: 'About the apartment',
    more: 'More apartments',
    jumpToRequest: 'Go to the booking request',
  },
  facts: {
    heading: 'Apartment details',
    guests: 'Guests',
    upTo: 'Up to {count}',
    bedrooms: 'Bedrooms',
    checkIn: 'Check-in',
    from: 'From {time}',
    checkOut: 'Check-out',
    until: 'Until {time}',
    featuresHeading: 'What the apartment has',
  },
  gallery: {
    heading: 'Photos of {name}',
    open: 'Enlarge photo {n} of {total}: {alt}',
    dialog: 'Photos of {name}',
    previous: 'Previous photo',
    next: 'Next photo',
    close: 'Close',
    all: 'All photos ({count})',
    position: '{n} of {total}',
  },
  booking: {
    whatsapp: 'Send a request on WhatsApp',
    whatsappHint: '{name} (opens WhatsApp)',
    email: 'Send a request by email',
    emailHint: '{name} (opens your mail app)',
    message: {
      intro: "Hello, I'd like to check availability and book {cabin}.",
      introAny: "Hello, I'd like to check availability and book.",
      datesPlaceholder: 'The dates that suit me: ',
      dates: 'Dates: {from} to {to} ({nights})',
      checkIn: 'Check-in: {from}',
      oneNight: '1 night',
      nights: '{count} nights',
      guests: 'Number of guests: {count}',
      subject: 'Booking request - {cabin}',
    },
  },
  notice: {
    before:
      'The buttons open WhatsApp or your mail app with a ready message, and it is sent only if you press "Send" there. It reaches us through the service you chose. Details in the ',
    privacyLink: 'privacy policy',
    between: ' and the ',
    cancellationLink: 'cancellation policy',
    after: '. Booking is from age {age}.',
  },
  contact: {
    heading: 'Contact',
    whatsapp: 'WhatsApp',
    whatsappHint: '(opens WhatsApp)',
    whatsappMessage: 'Hello, I have a question about {name}.',
  },
  footer: {
    legalHeading: 'Information and policies',
  },
  legal: {
    toc: 'On this page',
    draft: 'Draft.',
    coordinator: {
      heading: 'Accessibility coordinator',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      lastCheck: 'Date of the last check',
      toFill: 'To fill:',
    },
  },
  notFound: {
    title: 'Page not found',
    body: 'The link may be wrong or the page may have been removed.',
    back: 'Back to the home page',
  },
};
