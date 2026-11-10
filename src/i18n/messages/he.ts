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
    backToTop: 'חזרה למעלה',
    lastUpdated: 'עודכן לאחרונה',
    phone: 'טלפון',
    email: 'מייל',
    gmail: 'Gmail',
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
    moreApartments: {
      one: 'הצגת דירה נוספת',
      many: 'הצגת עוד {count} דירות',
      hide: 'הסתרת הדירות הנוספות',
    },
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
    about: 'על הדירה',
    more: 'דירות נוספות',
    jumpToRequest: 'לבקשת הזמנה',
  },
  facts: {
    heading: 'פרטי הדירה',
    guests: 'אורחים',
    upTo: 'עד {count}',
    bedrooms: 'חדרי שינה',
    bathrooms: 'חדרי רחצה',
    checkIn: 'כניסה',
    from: 'מהשעה {time}',
    checkOut: 'יציאה',
    until: 'עד השעה {time}',
    featuresHeading: 'מה יש בדירה',
    highlightsLabel: 'מה מיוחד בדירה',
    highlights: {
      plain: {
        wifi: 'Wi-Fi',
        'shabbos-kitchen': 'מטבח לשבת',
        jacuzzi: 'ג׳קוזי',
        sauna: 'סאונה יבשה',
        pool: 'בריכה מחוממת',
        view: 'נוף',
        balcony: 'מרפסת פרטית',
        courtyard: 'חצר',
        loft: 'לופט שינה',
        'separate-bedroom': 'חדר שינה נפרד',
        stone: 'קירות אבן',
        murals: 'ציורי קיר',
      },
      counted: {
        jacuzzi: '{count} ג׳קוזי',
        loft: '{count} לופטים',
      },
    },
  },
  gallery: {
    heading: 'תמונות של {name}',
    open: 'הגדלת תמונה {n} מתוך {total}: {alt}',
    dialog: 'תמונות של {name}',
    previous: 'התמונה הקודמת',
    next: 'התמונה הבאה',
    close: 'סגירה',
    all: 'כל התמונות ({count})',
    position: '{n} מתוך {total}',
  },
  booking: {
    whatsapp: 'שליחת בקשה בוואטסאפ',
    gmail: 'שליחת בקשה ב-Gmail',
    newTabHint: '{name} (נפתח בכרטיסייה חדשה)',
    mailApp: 'או דרך תוכנת המייל במכשיר',
    mailAppHint: '{name} (נפתח בתוכנת המייל)',
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
      'הכפתורים פותחים בכרטיסייה חדשה את וואטסאפ או את Gmail (או את תוכנת המייל שבמכשיר) עם הודעה מוכנה, וההודעה נשלחת רק אם תלחצו שם על "שליחה". היא מגיעה אלינו דרך השירות שבחרתם. פרטים ב',
    privacyLink: 'מדיניות הפרטיות',
    between: ' וב',
    cancellationLink: 'מדיניות הביטולים',
    after: '. ההזמנה מגיל {age}.',
  },
  contact: {
    heading: 'יצירת קשר',
    whatsapp: 'וואטסאפ',
    newTabHint: '(נפתח בכרטיסייה חדשה)',
    whatsappMessage: 'שלום, יש לי שאלה על {name}.',
  },
  footer: {
    legalHeading: 'מידע ומדיניות',
  },
  legal: {
    toc: 'בעמוד הזה',
    draft: 'טיוטה.',
    coordinator: {
      heading: 'רכז הנגישות',
      name: 'שם',
      phone: 'טלפון',
      email: 'מייל',
      lastCheck: 'תאריך הבדיקה האחרון',
      toFill: 'למילוי:',
    },
  },
  notFound: {
    title: 'העמוד לא נמצא',
    body: 'ייתכן שהקישור שגוי או שהעמוד הוסר.',
    back: 'חזרה לדף הבית',
  },
} as const;
