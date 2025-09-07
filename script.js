document.addEventListener('DOMContentLoaded', function () {
    
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
    
    // --- INTERSECTION OBSERVER FOR FADE-IN ANIMATION ---
    const fadeElements = document.querySelectorAll('.fade-in-element');
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    fadeElements.forEach(el => observer.observe(el));

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

    /**
     * Sets the visual state of hero elements to ON or OFF.
     * @param {'on' | 'off'} state - The desired state.
     */
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
    
    // Add hover event listeners if the trigger element exists
    if (hoverTrigger) {
        hoverTrigger.addEventListener('mouseover', () => setLightsState('off'));
        hoverTrigger.addEventListener('mouseout', () => setLightsState('on'));
    }
});