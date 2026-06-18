document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');
    const navLinks = document.querySelectorAll('.nav-link');
    const navOverlay = document.querySelector('.nav-overlay');
    const header = document.querySelector('.header');

    function closeMenu() {
        navList.classList.remove('active');
        navToggle.classList.remove('active');
        if (navOverlay) navOverlay.classList.remove('active');
        document.body.style.overflow = '';
        updateHeaderState();
    }

    function openMenu() {
        navList.classList.add('active');
        navToggle.classList.add('active');
        if (navOverlay) navOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        header.classList.remove('is-transparent');
    }

    if (navToggle) {
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navList.classList.contains('active') ? closeMenu() : openMenu();
        });
    }

    if (navOverlay) {
        navOverlay.addEventListener('click', closeMenu);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!location.pathname.endsWith('index.html') && !location.pathname.endsWith('/')) {
                return;
            }
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
            
            if (navList.classList.contains('active')) closeMenu();
        });
    });

    function updateHeaderState() {
        const contentSection = document.getElementById('contentSection');
        const isTopPage = !!contentSection && (location.pathname.endsWith('/') || location.pathname.endsWith('index.html') || location.pathname.split('/').pop() === '');
        const threshold = contentSection ? contentSection.offsetTop - header.offsetHeight - 12 : 0;
        const shouldBeTransparent = isTopPage && window.scrollY < threshold && !navList.classList.contains('active');

        header.classList.toggle('is-transparent', shouldBeTransparent);
        header.classList.toggle('is-solid', !shouldBeTransparent);
    }

    updateHeaderState();

    window.addEventListener('scroll', function() {
        updateHeaderState();
        updateActiveNavigation();
    });

    function updateActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + header.offsetHeight + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.voice-showcase, .work-card, .timeline-section, .fade-in-up, .parallax-slide-left, .parallax-slide-right, .parallax-fade-down');
    animateElements.forEach(el => {
        if (!el.classList.contains('fade-in-up') && 
            !el.classList.contains('parallax-slide-left') && 
            !el.classList.contains('parallax-slide-right') && 
            !el.classList.contains('parallax-fade-down')) {
            el.classList.add('fade-in');
        }
        observer.observe(el);
    });

    const workCards = document.querySelectorAll('.work-card');
    workCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    const heroButtons = document.querySelectorAll('.hero-actions .btn');
    heroButtons.forEach(button => {
        if (button.getAttribute('href').startsWith('#')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            });
        }
    });

    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        images.forEach(img => imageObserver.observe(img));
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navList.classList.contains('active')) closeMenu();
    });

    document.addEventListener('click', function(e) {
        if (navList.classList.contains('active')) {
            if (!navList.contains(e.target) && !navToggle.contains(e.target) && (!navOverlay || !navOverlay.contains(e.target))) {
                closeMenu();
            }
        }
    });

    // クリップボードコピー機能
    document.addEventListener('click', function(e) {
        const copyTarget = e.target.closest('.copy-target');
        if (copyTarget) {
            const textToCopy = copyTarget.getAttribute('data-copy');
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // コピー成功時の視覚的フィードバック
                    const originalText = copyTarget.textContent;
                    const hint = copyTarget.parentElement.querySelector('.copy-hint');
                    
                    if (hint) {
                        const originalHint = hint.textContent;
                        hint.textContent = 'Copied!';
                        hint.style.color = '#38A169';
                        hint.style.opacity = '1';
                        
                        setTimeout(() => {
                            hint.textContent = originalHint;
                            hint.style.color = '';
                            hint.style.opacity = '';
                        }, 2000);
                    }
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                });
            }
        }
    });

    const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() { this.classList.add('focus-visible'); });
        element.addEventListener('blur', function() { this.classList.remove('focus-visible'); });
    });

    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768 && navList.classList.contains('active')) closeMenu();
            updateHeaderState();
        }, 250);
    });

    console.log('Portfolio site initialized successfully!');
});

const workList = [
  { id: 'work14.html', title: '大手マッチングアプリ<br>チャット機能開発', desc: 'Laravel × React × Tailwind × WebSocketでリアルタイムチャットを実装', img: './images/chat-app-nda.jpg', link: './work14.html' },
  { id: 'work3.html', title: 'HEART&BRAIN様<br>LP制作・既存サイト改修', desc: '役員層向けの信頼感と既存サイトとの統一感を重視したWordPress LP制作', img: './images/heartbrain-executive-compass.jpg', link: './work3.html' },
  { id: 'work11.html', title: 'メディパ様（美容医療）<br>サービス全般制作', desc: 'Googleのビジネスコンテストで優勝したチームのサービス', img: './images/medipatop.jpg', link: './work11.html' },
  { id: 'work9.html', title: '串かつ さじろう様<br>リニューアル', desc: '全6ページをフルスタック〜CMS化まで実装', img: './images/kushikatsu-sajiro.jpg', link: './work9.html' },
  { id: 'work16.html', title: 'カタログ制作<br>業務効率化ツール', desc: 'Python × AI画像認識で、花のカタログ画像とExcelの差分確認を自動化', img: './images/catalog-automation-hero.jpg', link: './work16.html' },
  { id: 'work15.html', title: 'LP制作<br>1ヶ月8件ペース', desc: 'デザインからログイン・DB・決済導線まで対応。ビジネスLPを高速制作', img: './images/lp-note-hero.jpg', link: './work15.html' },
  { id: 'work13.html', title: '書籍横断検索アプリ', desc: '岐阜の図書館・書店を一括検索。マイページ導線も改善', img: './images/IMG_2566.jpeg', link: './work13.html' },
  { id: 'work10.html', title: 'VEIN ENERGY様<br>コーポレート', desc: 'ロゴ制作から実装まで2日で納品', img: './images/vein-energy.jpg', link: './work10.html' },
  { id: 'work12.html', title: '五料産業株式会社様<br>リニューアル', desc: 'ヒアリングからデザイン・実装まで一貫して担当', img: './images/goryo-top.jpg', link: './work12.html' },
];

function renderOtherWorksSlider(currentId) {
  const sliderGrid = document.querySelector('.related-works-grid');
  if (!sliderGrid) return;
  sliderGrid.innerHTML = '';
  workList.filter(w => w.id !== currentId).forEach(work => {
    const card = document.createElement('article');
    card.className = 'work-card';
    const imgStyle = (work.img.includes('串かつ') || work.img.includes('medipatop') || work.img.includes('vein-energy.jpg') || work.img.includes('IMG_2566') || work.img.includes('Screenshot 2026-06-13 at 17.15.27') || work.img.includes('heartbrain-executive-compass') || work.img.includes('catalog-automation-hero')) ? 'style="object-position: center top;"' : '';
    card.innerHTML = `
      <div class="work-image">
        <img src="${work.img}" alt="${work.title}" loading="lazy" ${imgStyle}>
        <div class="work-overlay">
          <a href="${work.link}" class="work-link">詳細を見る</a>
        </div>
      </div>
      <div class="work-content">
        <h3 class="work-title">${work.title}</h3>
        <p class="work-description">${work.desc}</p>
      </div>
      <a href="${work.link}" class="work-detail-link"><span>詳細を見る</span><span>→</span></a>
    `;
    sliderGrid.appendChild(card);
  });
}

const pageName = location.pathname.split('/').pop();
if (document.querySelector('.related-works-grid')) {
  renderOtherWorksSlider(pageName);
}

(function() {
  const grid = document.querySelector('.related-works-grid');
  if (!grid) return;
  let current = 0;
  let intervalId = null;

  function getVisible() { return window.innerWidth <= 600 ? 1 : 3; }
  function getGap() { return parseInt(window.getComputedStyle(grid).gap) || 0; }
  function getCards() { return grid.querySelectorAll('.work-card'); }
  function slideTo(idx) {
    const cards = getCards();
    if (!cards.length) return;
    const cardWidth = cards[0].offsetWidth + getGap();
    grid.style.transform = `translateX(${-cardWidth * idx}px)`;
  }
  function autoSlide() {
    const cards = getCards();
    const visible = getVisible();
    if (cards.length <= visible) return;
    current = (current + 1) % (cards.length - visible + 1);
    slideTo(current);
  }
  function startSlider() {
    if (intervalId) clearInterval(intervalId);
    current = 0;
    slideTo(current);
    intervalId = setInterval(autoSlide, 3000);
  }
  window.addEventListener('resize', startSlider);
  startSlider();
})();

function setupArtCursor() {
  document.querySelectorAll('#art-cursor').forEach(el => el.remove());

  const canUseCustomCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  document.body.classList.remove('custom-cursor-enabled');
  if (!canUseCustomCursor) return;

  const artCursor = document.createElement('div');
  artCursor.id = 'art-cursor';
  document.body.appendChild(artCursor);
  document.body.classList.add('custom-cursor-enabled');

  artCursor.style.opacity = '0';
  artCursor.style.pointerEvents = 'none';

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let isVisible = false;

  const interactiveSelector = [
    'a',
    'button',
    'input',
    'textarea',
    'select',
    'label',
    '[role="button"]',
    '.work-card',
    '.header-contact-icon',
    '.nav-link',
    '.work-link',
    '.work-detail-link'
  ].join(',');

  function handleMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isVisible) {
      isVisible = true;
      artCursor.style.opacity = '1';
    }

    const target = document.elementFromPoint(mouseX, mouseY);
    artCursor.classList.toggle('is-hover', !!target?.closest(interactiveSelector));
  }

  document.addEventListener('mousemove', handleMouseMove, { passive: true });
  document.addEventListener('mouseleave', () => {
    isVisible = false;
    artCursor.style.opacity = '0';
  }, { passive: true });
  document.addEventListener('mouseenter', () => {
    isVisible = true;
    artCursor.style.opacity = '1';
  }, { passive: true });

  function animateCursor() {
    if (isVisible) {
      cursorX += (mouseX - cursorX) * 0.32;
      cursorY += (mouseY - cursorY) * 0.32;
      artCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%) scale(1)`;
    }
    requestAnimationFrame(animateCursor);
  }

  animateCursor();
}
setupArtCursor();

function smoothScrollTo(targetPosition, duration = 800) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

class ParallaxHero {
    constructor() {
        this.scrollProgress = 0;
        this.mediaFullyExpanded = false;
        this.showContent = false;
        this.touchStartY = 0;
        this.isMobile = window.innerWidth < 768;
        this.isNavigating = false;
        
        this.elements = {
            bgImage: document.getElementById('bgImage'),
            bgOverlay: document.getElementById('bgOverlay'),
            mediaContainer: document.getElementById('mediaContainer'),
            heroVideo: document.getElementById('heroVideo'),
            mediaOverlay: document.getElementById('mediaOverlay'),
            titleLeft: document.getElementById('titleLeft'),
            titleRight: document.getElementById('titleRight'),
            subtitleLeft: document.getElementById('subtitleLeft'),
            subtitleRight: document.getElementById('subtitleRight'),
            contentSection: document.getElementById('contentSection')
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateElements();
    }
    
    bindEvents() {
        window.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        window.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        window.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        window.addEventListener('touchend', () => this.handleTouchEnd());
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => { this.isMobile = window.innerWidth < 768; });
    }
    
    handleWheel(e) {
        if (this.mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
            this.mediaFullyExpanded = false;
            e.preventDefault();
        } else if (!this.mediaFullyExpanded) {
            e.preventDefault();
            const scrollDelta = e.deltaY * 0.0009;
            this.updateProgress(scrollDelta);
        }
    }
    
    handleTouchStart(e) {
        this.touchStartY = e.touches[0].clientY;
    }
    
    handleTouchMove(e) {
        if (!this.touchStartY) return;
        const touchY = e.touches[0].clientY;
        const deltaY = this.touchStartY - touchY;
        
        if (this.mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
            this.mediaFullyExpanded = false;
            e.preventDefault();
        } else if (!this.mediaFullyExpanded) {
            e.preventDefault();
            const scrollFactor = deltaY < 0 ? 0.008 : 0.005;
            const scrollDelta = deltaY * scrollFactor;
            this.updateProgress(scrollDelta);
            this.touchStartY = touchY;
        }
    }
    
    handleTouchEnd() {
        this.touchStartY = 0;
    }
    
    handleScroll() {
        if (this.isNavigating || window.scrollY > window.innerHeight) return;
        if (!this.mediaFullyExpanded) window.scrollTo(0, 0);
    }
    
    updateProgress(delta) {
        const newProgress = Math.min(Math.max(this.scrollProgress + delta, 0), 1);
        this.scrollProgress = newProgress;
        
        if (newProgress >= 1) {
            this.mediaFullyExpanded = true;
            this.showContent = true;
        } else if (newProgress < 0.75) {
            this.showContent = false;
        }
        
        this.updateElements();
    }
    
    updateElements() {
        const progress = this.scrollProgress;
        const isMobile = this.isMobile;
        
        const mediaWidth = 300 + progress * (isMobile ? 650 : 1250);
        const mediaHeight = 400 + progress * (isMobile ? 200 : 400);
        
        if (this.elements.mediaContainer) {
            this.elements.mediaContainer.style.width = `${Math.min(mediaWidth, window.innerWidth * 0.95)}px`;
            this.elements.mediaContainer.style.height = `${Math.min(mediaHeight, window.innerHeight * 0.85)}px`;
        }
        
        if (this.elements.bgOverlay) this.elements.bgOverlay.style.opacity = progress;
        if (this.elements.mediaOverlay) this.elements.mediaOverlay.style.opacity = 0.4 - progress * 0.4;
        
        const textTranslateX = progress * (isMobile ? 180 : 150);
        if (this.elements.titleLeft) this.elements.titleLeft.style.transform = `translateX(-${textTranslateX}vw)`;
        if (this.elements.titleRight) this.elements.titleRight.style.transform = `translateX(${textTranslateX}vw)`;
        if (this.elements.subtitleLeft) this.elements.subtitleLeft.style.transform = `translateX(-${textTranslateX}vw)`;
        if (this.elements.subtitleRight) this.elements.subtitleRight.style.transform = `translateX(${textTranslateX}vw)`;
        
        if (this.elements.contentSection) {
            this.showContent ? this.elements.contentSection.classList.add('visible') : this.elements.contentSection.classList.remove('visible');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.parallax-hero-section')) {
        window.parallaxHeroInstance = new ParallaxHero();
    }
    
    function smoothScrollTo(targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const parallaxHero = window.parallaxHeroInstance;
            if (parallaxHero) {
                parallaxHero.isNavigating = true;
                parallaxHero.mediaFullyExpanded = true;
                parallaxHero.showContent = true;
                parallaxHero.updateElements();
            }
            
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            
            setTimeout(() => {
                if (parallaxHero) parallaxHero.isNavigating = false;
            }, 1000);
        }
    }
    
    function handleHashLinks() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            setTimeout(() => { smoothScrollTo(hash); }, 100);
        }
    }
    
    handleHashLinks();
    window.addEventListener('hashchange', handleHashLinks);
    
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href*="#"]');
        if (link) {
            const href = link.getAttribute('href');
            const hashIndex = href.indexOf('#');
            if (hashIndex !== -1) {
                const hash = href.substring(hashIndex + 1);
                const targetElement = document.getElementById(hash);
                if (targetElement && (window.location.pathname === '/index.html' || window.location.pathname === '/' || href.startsWith('index.html'))) {
                    e.preventDefault();
                    smoothScrollTo(hash);
                    window.history.pushState(null, null, '#' + hash);
                }
            }
        }
    });

    function initTimelineScroll() {
        const timeline = document.querySelector('.timeline');
        if (!timeline) return;

        const timelineItems = document.querySelectorAll('.timeline-item');
        
        function updateTimelineProgress() {
            const rect = timeline.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const startOffset = windowHeight * 0.6;
            const timelineTop = rect.top;
            const timelineHeight = rect.height;
            
            let progress = (startOffset - timelineTop);
            if (progress < 0) progress = 0;
            if (progress > timelineHeight) progress = timelineHeight;
            
            timeline.style.setProperty('--line-height', `${progress}px`);
            
            let styleEl = document.getElementById('timeline-dynamic-style');
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'timeline-dynamic-style';
                document.head.appendChild(styleEl);
            }
            styleEl.textContent = `.timeline::after { height: ${progress}px !important; }`;

            timelineItems.forEach(item => {
                const itemTop = item.getBoundingClientRect().top - timeline.getBoundingClientRect().top;
                progress >= itemTop ? item.classList.add('active') : item.classList.remove('active');
            });
        }

        window.addEventListener('scroll', () => {
            requestAnimationFrame(updateTimelineProgress);
        }, { passive: true });
        
        updateTimelineProgress();
    }

    initTimelineScroll();
});
