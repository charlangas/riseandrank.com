document.addEventListener('DOMContentLoaded', function () {
    
    // --- NEW: MOBILE NAVIGATION SCRIPT ---
    const navWrapper = document.querySelector('.nav-wrapper');
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const hamburgerIcon = navToggle.querySelector('.icon-hamburger');
    const closeIcon = navToggle.querySelector('.icon-close');
    const body = document.body;

    navToggle.addEventListener('click', () => {
        const isVisible = navWrapper.getAttribute('data-visible');

        if (isVisible === 'false' || isVisible === null) {
            navWrapper.setAttribute('data-visible', true);
            navToggle.setAttribute('aria-expanded', true);
            hamburgerIcon.style.display = 'none';
            closeIcon.style.display = 'block';
            body.classList.add('nav-open');
        } else {
            navWrapper.setAttribute('data-visible', false);
            navToggle.setAttribute('aria-expanded', false);
            hamburgerIcon.style.display = 'block';
            closeIcon.style.display = 'none';
            body.classList.remove('nav-open');
        }
    });

    // --- FAQ ACCORDION SCRIPT ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const currentlyActive = document.querySelector('.faq-item.active');
            if (currentlyActive && currentlyActive !== item) {
                currentlyActive.classList.remove('active');
            }
            item.classList.toggle('active');
        });
    });

    // --- PROJECT CAROUSEL SCRIPT ---
    const track = document.querySelector('.carousel-track');
    if (track) {
        const slides = Array.from(track.children);
        const nextButton = document.getElementById('nextBtn');
        const prevButton = document.getElementById('prevBtn');
        let currentIndex = 0;
        const moveToSlide = (targetIndex) => {
            if (!slides[targetIndex]) return;
            const amountToMove = slides[targetIndex].offsetLeft;
            track.style.transform = 'translateX(-' + amountToMove + 'px)';
            currentIndex = targetIndex;
            updateNavButtons();
        };
        const updateNavButtons = () => {
            prevButton.disabled = currentIndex === 0;
            const lastSlide = slides[slides.length - 1];
            const trackVisibleWidth = track.parentElement.offsetWidth;
            const lastSlideEndPosition = lastSlide.offsetLeft + lastSlide.offsetWidth;
            nextButton.disabled = lastSlideEndPosition <= (slides[currentIndex].offsetLeft + trackVisibleWidth);
        };
        nextButton.addEventListener('click', e => {
            let nextIndex = slides.findIndex(slide => slide.offsetLeft > (slides[currentIndex].offsetLeft + 10));
            if(nextIndex === -1) nextIndex = slides.length - 1;
            moveToSlide(nextIndex);
        });
        prevButton.addEventListener('click', e => {
            const currentSlideLeft = slides[currentIndex].offsetLeft;
            let prevIndex = -1;
            for(let i = currentIndex - 1; i >= 0; i--){
                const slideRight = slides[i].offsetLeft + slides[i].offsetWidth;
                if(slideRight < currentSlideLeft){
                    prevIndex = i;
                    break;
                }
            }
            if(prevIndex === -1 && currentIndex > 0) prevIndex = 0;
            if(prevIndex !== -1) moveToSlide(prevIndex);
        });
        moveToSlide(0);
        window.addEventListener('resize', () => moveToSlide(currentIndex));
    }
    
    // --- MODIFIED: INTERSECTION OBSERVER FOR FADE-IN & H3 ANIMATION ---
    const animatedElements = document.querySelectorAll('.fade-in-element, .process-title-animate');
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.4 }; // Adjusted threshold
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Handle standard fade-in elements
            if (entry.target.classList.contains('fade-in-element')) {
                 entry.target.classList.add('is-visible');
            }
          
            // NEW: Handle and animate the process titles
            if (entry.target.classList.contains('process-title-animate')) {
                const text = new SplitType(entry.target, { types: 'chars' });
                gsap.from(text.chars, {
                    yPercent: 100,
                    opacity: 0,
                    stagger: 0.05, // Time between each character animating in
                    ease: 'power4.out',
                    duration: 1.5
                });
            }

            observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    animatedElements.forEach(el => observer.observe(el));


    // --- HERO FLICKER ANIMATION & HOVER LOGIC ---
    const lamp = document.getElementById('hero-lamp');
    const logo = document.getElementById('hero-logo');
    const hero = document.getElementById('hero-section');
    const hoverTrigger = document.getElementById('hover-trigger');

    const animationAssets = {
        lampOnSrc: 'img/lamp.svg',
        lampOffSrc: 'img/lamp-off.svg',
        logoOnSrc: 'img/logo-white.svg',
        logoOffSrc: 'img/logo-moon.svg',
        colorOn: '#010AD1',
        colorOff: '#00008B'
    };

    const setLightsState = (state) => {
        if (!lamp || !logo || !hero) return;

        if (state === 'on') {
            lamp.src = animationAssets.lampOnSrc;
            logo.src = animationAssets.logoOnSrc;
            hero.style.backgroundColor = animationAssets.colorOn;
        } else { // 'off'
            lamp.src = animationAssets.lampOffSrc;
            logo.src = animationAssets.logoOffSrc;
            hero.style.backgroundColor = animationAssets.colorOff;
        }
    };

    const preloadImages = (urls) => {
        const promises = urls.map(url => new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = resolve;
            img.onerror = reject;
        }));
        return Promise.all(promises);
    };

    const flickerAnimation = async () => {
        const delay = ms => new Promise(res => setTimeout(res, ms));
        const imagesToLoad = [animationAssets.lampOnSrc, animationAssets.logoOnSrc];

        try {
            await preloadImages(imagesToLoad);
            setLightsState('off');

            await delay(1200);
            setLightsState('on');
            await delay(100);
            setLightsState('off');
            await delay(200);
            setLightsState('on');
            await delay(80);
            setLightsState('off');
            await delay(400);
            setLightsState('on');
            lamp.alt = "An illustrated lamp that is turned on";
        } catch (error) {
            console.error("Flicker animation failed:", error);
            setLightsState('on');
            lamp.alt = "An illustrated lamp that is turned on";
        }
    };

    // Run the initial animation
    flickerAnimation();
    
    if (hoverTrigger) {
        hoverTrigger.addEventListener('mouseover', () => setLightsState('off'));
        hoverTrigger.addEventListener('mouseout', () => setLightsState('on'));
    }
});

// --- MOBILE CARD FOCUS ON SCROLL ---
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
        const cardsToAnimate = document.querySelectorAll('.problem-card, .solution-card');

        if (cardsToAnimate.length > 0) {
            const cardObserverOptions = {
                root: null,
                rootMargin: '-40% 0px -40% 0px', // Creates a trigger zone in the middle 20% of the screen
                threshold: 0
            };

            const cardObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // First, remove the focus class from all cards
                        cardsToAnimate.forEach(card => {
                            card.classList.remove('is-focused');
                        });
                        // Then, add the focus class to the one that is currently intersecting
                        entry.target.classList.add('is-focused');
                    }
                });
            }, cardObserverOptions);

            cardsToAnimate.forEach(card => {
                cardObserver.observe(card);
            });
        }
    }

// --- PARALLAX EFFECT SCRIPT ---
const parallaxSection = document.querySelector('.solution-heading-wrapper');

if (parallaxSection) {
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        parallaxSection.style.backgroundPositionY = (scrollPosition - parallaxSection.offsetTop) * 0.3 + 'px';
    });
}