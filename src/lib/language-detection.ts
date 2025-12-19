// IP-based geolocation and language detection utility
const LANGUAGE_MAP: { [key: string]: string } = {
  // English
  US: 'en', GB: 'en', AU: 'en', NZ: 'en', IE: 'en', ZA: 'en',
  
  // Spanish
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', PE: 'es', CL: 'es', VE: 'es',
  
  // French
  FR: 'fr', CA: 'en', LU: 'fr', HT: 'fr', SN: 'fr',
  
  // German
  DE: 'de', AT: 'de', LI: 'de',
  
  // Italian
  IT: 'it', SM: 'it',
  
  // Portuguese
  PT: 'pt', BR: 'pt',
  
  // Dutch
  NL: 'nl',
  
  // Belgium (default to Dutch, can be French)
  BE: 'nl',
  
  // Switzerland (default to German, can be French/Italian)
  CH: 'de',
  
  // Polish
  PL: 'pl',
  
  // Russian
  RU: 'ru', BY: 'ru', KZ: 'ru',
  
  // Chinese
  CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh', SG: 'zh',
  
  // Japanese
  JP: 'ja',
  
  // Korean
  KR: 'ko',
  
  // Arabic
  SA: 'ar', AE: 'ar', EG: 'ar', IL: 'ar', QA: 'ar', KW: 'ar', BH: 'ar', OM: 'ar', JO: 'ar', LB: 'ar', SY: 'ar', TN: 'ar', MA: 'ar', DZ: 'ar',
  
  // Hindi
  IN: 'hi',
  
  // Thai
  TH: 'th',
  
  // Vietnamese
  VN: 'vi',
  
  // Indonesian
  ID: 'id',
  
  // Turkish
  TR: 'tr',
  
  // Swedish
  SE: 'sv',
  
  // Norwegian
  NO: 'no',
  
  // Danish
  DK: 'da',
  
  // Finnish
  FI: 'fi',
  
  // Greek
  GR: 'el',
  
  // Czech
  CZ: 'cs',
  
  // Hungarian
  HU: 'hu',
  
  // Romanian
  RO: 'ro',
  
  // Croatian
  HR: 'hr',
};

const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'th', 'vi', 'id', 'tr', 'sv', 'no', 'da', 'fi', 'el', 'cs', 'hu', 'ro', 'hr'];

export async function detectLanguageFromIP(): Promise<string> {
  try {
    // Try to get geolocation from IP
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const countryCode = data.country_code;

    if (countryCode && LANGUAGE_MAP[countryCode]) {
      return LANGUAGE_MAP[countryCode];
    }

    // Fallback to browser language
    return getBrowserLanguage();
  } catch (error) {
    console.error('Error detecting language from IP:', error);
    // Fallback to browser language
    return getBrowserLanguage();
  }
}

export function getBrowserLanguage(): string {
  if (typeof navigator === 'undefined') return 'en';

  const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
  const baseLang = browserLang.split('-')[0].toLowerCase();

  return SUPPORTED_LANGUAGES.includes(baseLang) ? baseLang : 'en';
}

export function getSavedLanguage(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('veilpass_language');
}

export function setSavedLanguage(language: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('veilpass_language', language);
    
    // Save to database if user is logged in
    const account = localStorage.getItem('veilpass_account');
    if (account) {
      try {
        fetch('/api/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet_address: account,
            language_preference: language,
          }),
        }).catch(error => {
          console.error('Failed to save language preference:', error);
        });
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }
  }
}

export function getInitialLanguage(): string {
  // Priority: Saved language > IP detection > Browser language > Default (en)
  const saved = getSavedLanguage();
  if (saved) return saved;
  return getBrowserLanguage();
}

export function isLanguageSupported(language: string): boolean {
  return SUPPORTED_LANGUAGES.includes(language);
}

export function getLanguageLabel(language: string): string {
  const labels: { [key: string]: string } = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    pt: 'Português',
    nl: 'Nederlands',
    pl: 'Polski',
    ru: 'Русский',
    zh: '中文',
    ja: '日本語',
    ko: '한국어',
    ar: 'العربية',
    hi: 'हिन्दी',
    th: 'ไทย',
    vi: 'Tiếng Việt',
    id: 'Bahasa Indonesia',
    tr: 'Türkçe',
    sv: 'Svenska',
    no: 'Norsk',
    da: 'Dansk',
    fi: 'Suomi',
    el: 'Ελληνικά',
    cs: 'Čeština',
    hu: 'Magyar',
    ro: 'Română',
    hr: 'Hrvatski',
  };
  return labels[language] || language;
}
