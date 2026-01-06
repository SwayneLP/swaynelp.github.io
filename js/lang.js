// Système de traduction multilingue
(function() {
  const translations = {
    fr: {
      // Header
      'copyright': '© 2026 PORTFOLIO DE LUCAS PERNET. TOUS DROITS RÉSERVÉS.',
      'designed': 'CONÇU ET CODÉ PAR LUCAS PERNET.',
      'follow': 'SUIVEZ-MOI SUR',
      
      // Hero
      'title': 'LUCAS PERNET',
      'subtitle': 'DESIGNER GRAPHIQUE & TYPOGRAPHIQUE',
      
      // Intro
      'welcome-title': 'BIENVENUE SUR MON PORTFOLIO',
      'welcome-text': 'Lucas Pernet, 21 ans, designer graphique et étudiant en DSAA Culture de l\'Image Animée à Nevers. Mon travail se concentre sur l\'identité visuelle, le design éditorial et la pratique typographique. Mon parcours est marqué par six années d\'expérience en alternance en design graphique, au sein d\'entreprises industrielles et d\'imprimeries. J\'ai une solide compréhension de toute la chaîne de production graphique, du concept à l\'exécution du projet.',
      
      // Work
      'work-title': 'VARIABLES GAME',
      'work-text': 'Expérimentations typographiques autour de la fonction de police variable. Conception d\'une police grotesque de base, avec des axes variables pour la graisse, les empattements et le contraste entre traits épais et fins. À l\'avenir, deux axes variables supplémentaires seront ajoutés pour la largeur et l\'oblique.',
      
      // Footer
      'footer-title': 'TRAVAILLONS ENSEMBLE',
      'footer-text': 'Je suis actuellement disponible pour des travaux en freelance. N\'hésitez pas à me contacter pour discuter de collaborations ou de projets potentiels.',
      
      // Pins (sphere)
      'pin-design-title': 'Design',
      'pin-design-desc': 'Design graphique & identité visuelle',
      'pin-typo-title': 'Typographie',
      'pin-typo-desc': 'Polices variables & création de caractères',
      'pin-editorial-title': 'Éditorial',
      'pin-editorial-desc': 'Design d\'impression & de publication',
      'pin-motion-title': 'Motion',
      'pin-motion-desc': 'Animation & graphisme vidéo',
      'pin-digital-title': 'Digital',
      'pin-digital-desc': 'Projets web & interactifs'
    },
    en: {
      // Header
      'copyright': '© 2026 LUCAS PERNET\'S PORTFOLIO. ALL RIGHTS RESERVED.',
      'designed': 'DESIGNED AND CODED BY LUCAS PERNET.',
      'follow': 'FOLLOW ME ON',
      
      // Hero
      'title': 'LUCAS PERNET',
      'subtitle': 'GRAPHIC & TYPE DESIGNER',
      
      // Intro
      'welcome-title': 'WELCOME TO MY PORTFOLIO',
      'welcome-text': 'Lucas Pernet, 21 years old, graphic designer and student in the DSAA Culture of Animated Image in Nevers. My work focuses on visual identity, editorial design, and typographic practice. My background is marked by six years of work-study experience in graphic design, within industrial companies and printing houses. I have a strong understanding of the entire graphic production chain, from concept to project execution.',
      
      // Work
      'work-title': 'VARIABLES GAME',
      'work-text': 'Typographic experiments around the variable font function. Design of a grotesque base typeface, with variable axes for weight, serifs, and contrast between thick and thin strokes. In the future, two additional variable axes will be added for width and oblique.',
      
      // Footer
      'footer-title': 'LET\'S WORK TOGETHER',
      'footer-text': 'I\'m currently available for freelance works. Feel free to reach out to discuss potential collaborations or projects.',
      
      // Pins (sphere)
      'pin-design-title': 'Design',
      'pin-design-desc': 'Graphic design & visual identity',
      'pin-typo-title': 'Typography',
      'pin-typo-desc': 'Variable fonts & typeface design',
      'pin-editorial-title': 'Editorial',
      'pin-editorial-desc': 'Print & publication design',
      'pin-motion-title': 'Motion',
      'pin-motion-desc': 'Animation & video graphics',
      'pin-digital-title': 'Digital',
      'pin-digital-desc': 'Web & interactive projects'
    }
  };

  let currentLang = 'en'; // Langue par défaut

  // Détecter la langue du navigateur
  function detectLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const savedLang = localStorage.getItem('preferredLanguage');
    
    if (savedLang) {
      return savedLang;
    }
    
    // Si le navigateur est en français, utiliser français, sinon anglais
    return browserLang.startsWith('fr') ? 'fr' : 'en';
  }

  // Appliquer les traductions
  function applyTranslations(lang) {
    currentLang = lang;
    localStorage.setItem('preferredLanguage', lang);
    document.documentElement.setAttribute('lang', lang);
    
    const trans = translations[lang];
    
    // Traduire tous les éléments avec l'attribut data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (trans[key]) {
        element.textContent = trans[key];
      }
    });
    
    // Mettre à jour le bouton de langue
    const langButton = document.querySelector('.lang-switcher');
    if (langButton) {
      langButton.textContent = lang === 'fr' ? 'EN' : 'FR';
    }
  }

  // Basculer entre les langues
  function toggleLanguage() {
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    applyTranslations(newLang);
    
    // Notifier sketch3 du changement de langue pour mettre à jour les pins
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { lang: newLang, translations: translations[newLang] } 
    }));
  }

  // Créer le bouton de changement de langue
  function createLanguageSwitcher() {
    const button = document.createElement('button');
    button.className = 'lang-switcher';
    button.textContent = currentLang === 'fr' ? 'EN' : 'FR';
    button.addEventListener('click', toggleLanguage);
    
    // Ajouter le bouton dans le header
    const header = document.querySelector('header');
    if (header) {
      header.appendChild(button);
    } else {
      document.body.appendChild(button);
    }
  }

  // Initialiser
  function init() {
    currentLang = detectLanguage();
    createLanguageSwitcher();
    applyTranslations(currentLang);
  }

  // Exposer les fonctions globalement pour sketch3
  window.i18n = {
    get: (key) => translations[currentLang][key],
    getCurrentLang: () => currentLang,
    getTranslations: () => translations
  };

  // Démarrer quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
