/**
 * Every text the site shows around its content, in Hebrew. `en.ts` has the same keys: a key missing there fails the
 * type check. Texts the owner wrote himself (the logo's two lines) are marked.
 */
export const he = {
  language: { code: 'he', name: 'עברית', switchHint: 'מעבר לעברית' },
  brand: {
    name: 'דירת מוזס',
    /** The logo's own line (the owner's words). */
    tagline: 'דירות יוקרה בלב העיר העתיקה צפת',
    /** The logo's own line (the owner's words). */
    slogan: 'חוויה של יוקרה, שלווה ונוף עוצר נשימה',
    description: 'דירת מוזס: דירות יוקרה בלב העיר העתיקה צפת. תמונות ופרטים, והזמנה ישירה בוואטסאפ או במייל.',
    logoAlt: 'דירת מוזס, Moses Luxury Apartments',
  },
  business: {
    legalName: '[למילוי: השם הרשום של העסק]',
    businessNumber: '[למילוי: מספר עוסק או ח.פ.]',
    address: '[למילוי: כתובת המתחם]',
  },
  common: {
    skipToMain: 'דילוג לתוכן הראשי',
    sampleBanner: 'אתר בבנייה: הדירות והתמונות כאן הם לדוגמה בלבד.',
    lastUpdated: 'עודכן לאחרונה',
    phone: 'טלפון',
    email: 'מייל',
    pageTitle: '{title} | {site}',
  },
  nav: {
    main: 'ניווט ראשי',
    cabins: 'הדירות',
    contact: 'יצירת קשר',
    breadcrumb: 'פירורי לחם',
    allCabins: 'כל הדירות',
  },
  home: {
    hero: { alt: 'איור לדוגמה של בתי אבן בעיר עתיקה בשקיעה (תוכן לדוגמה)' },
    request: {
      heading: 'בקשת הזמנה',
      unit: 'איזו דירה',
      unitAny: 'כל דירה, אשמח להצעה',
      checkIn: 'תאריך כניסה',
      checkOut: 'תאריך יציאה',
      guests: 'מספר אורחים',
      guestsNone: 'לא נבחר',
      previewLabel: 'ההודעה שתיפתח, ואתם משלימים בה את התאריכים:',
      problems: {
        'check-in-past': 'תאריך הכניסה כבר עבר.',
        'check-out-not-after': 'תאריך היציאה צריך להיות אחרי תאריך הכניסה.',
      },
    },
    cabinsHeading: 'הדירות',
    points: {
      place: {
        title: 'בלב העיר העתיקה צפת',
        body: 'הדירות נמצאות בעיר העתיקה של צפת, כפי שכתוב בלוגו של הבעלים.',
      },
      direct: {
        title: 'הזמנה ישירה',
        body: 'שולחים בקשה בוואטסאפ או במייל, וההזמנה נקבעת לאחר אישור שלנו.',
      },
      third: {
        title: '[למילוי: נקודה שלישית]',
        body: 'הבעלים ימסור משהו נכון ומיוחד בדירות. עד אז נשארת ריקה.',
      },
    },
  },
  cabin: {
    guestsUpTo: 'עד {count} אורחים',
    details: 'לפרטים והזמנה',
  },
  facts: {
    heading: 'פרטי הצימר',
    guests: 'אורחים',
    upTo: 'עד {count}',
    bedrooms: 'חדרי שינה',
    checkIn: 'כניסה',
    from: 'מהשעה {time}',
    checkOut: 'יציאה',
    until: 'עד השעה {time}',
    featuresHeading: 'מה יש בצימר',
  },
  gallery: {
    heading: 'תמונות של {name}',
    open: 'הגדלת תמונה {n} מתוך {total}: {alt}',
    dialog: 'תמונות של {name}',
    previous: 'התמונה הקודמת',
    next: 'התמונה הבאה',
    close: 'סגירה',
    position: '{n} מתוך {total}',
  },
  booking: {
    heading: 'הזמנה',
    intro: 'שלחו לנו בוואטסאפ או במייל את התאריכים שמתאימים לכם, ונחזור עם תשובה.',
    guests: 'מספר אורחים',
    guestsNone: 'לא נבחר',
    whatsapp: 'שליחת בקשה בוואטסאפ',
    whatsappHint: '{name} (נפתח בוואטסאפ)',
    email: 'שליחת בקשה במייל',
    emailHint: '{name} (נפתח בתוכנת המייל)',
    message: {
      intro: 'שלום, אשמח לבדוק זמינות והזמנה ב{cabin}.',
      introAny: 'שלום, אשמח לבדוק זמינות והזמנה.',
      datesPlaceholder: 'התאריכים שמתאימים לי: ',
      dates: 'תאריכים: {from} עד {to} ({nights})',
      checkIn: 'תאריך כניסה: {from}',
      oneNight: 'לילה אחד',
      nights: '{count} לילות',
      guests: 'מספר אורחים: {count}',
      subject: 'בקשת הזמנה - {cabin}',
    },
  },
  notice: {
    before:
      'הכפתורים פותחים את וואטסאפ או את תוכנת המייל שלכם עם הודעה מוכנה, וההודעה נשלחת רק אם תלחצו שם על "שליחה". היא מגיעה אלינו דרך השירות שבחרתם. פרטים ב',
    privacyLink: 'מדיניות הפרטיות',
    between: ' וב',
    cancellationLink: 'מדיניות הביטולים',
    after: '. ההזמנה מגיל {age}.',
  },
  contact: {
    heading: 'יצירת קשר',
    whatsapp: 'וואטסאפ',
    whatsappHint: '(נפתח בוואטסאפ)',
    whatsappMessage: 'שלום, יש לי שאלה על {name}.',
  },
  footer: {
    legalHeading: 'מידע ומדיניות',
  },
  notFound: {
    title: 'העמוד לא נמצא',
    body: 'ייתכן שהקישור שגוי או שהעמוד הוסר.',
    back: 'חזרה לדף הבית',
  },
} as const;
