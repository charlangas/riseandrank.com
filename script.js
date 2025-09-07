document.addEventListener('DOMContentLoaded', function () {
    
    // --- FAQ ACCORDION SCRIPT ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close other open items
            const currentlyActive = document.querySelector('.faq-item.active');
            if (currentlyActive && currentlyActive !== item) {
                currentlyActive.classList.remove('active');
            }
            // Toggle the clicked item
            item.classList.toggle('active');
        });
    });

    // --- PROJECT CAROUSEL SCRIPT ---
    const track = document.querySelector('.carousel-track');
    if (track) { // Only run if the carousel exists on the page
        const slides = Array.from(track.children);
        const nextButton = document.getElementById('nextBtn');
        const prevButton = document.getElementById('prevBtn');
        let currentIndex = 0;

        // Function to move the carousel track
        const moveToSlide = (targetIndex) => {
            if (!slides[targetIndex]) return; // Exit if slide doesn't exist
            
            const amountToMove = slides[targetIndex].offsetLeft;
            track.style.transform = 'translateX(-' + amountToMove + 'px)';
            currentIndex = targetIndex;
            updateNavButtons();
        };

        // Function to update the disabled state of nav buttons
        const updateNavButtons = () => {
            prevButton.disabled = currentIndex === 0;
            
            // Check if the last slide is fully visible
            const lastSlide = slides[slides.length - 1];
            const trackVisibleWidth = track.parentElement.offsetWidth;
            const lastSlideEndPosition = lastSlide.offsetLeft + lastSlide.offsetWidth;
            
            nextButton.disabled = lastSlideEndPosition <= (slides[currentIndex].offsetLeft + trackVisibleWidth);
        };
        
        // Event listeners for buttons
        nextButton.addEventListener('click', e => {
            // Find the first slide that is currently out of view to the right
            let nextIndex = slides.findIndex(slide => {
                return slide.offsetLeft > (slides[currentIndex].offsetLeft + 10); // +10 for small buffer
            });
            if(nextIndex === -1) nextIndex = slides.length - 1; // Go to last if none found
            moveToSlide(nextIndex);
        });

        prevButton.addEventListener('click', e => {
            // Find the first slide whose right edge is to the left of the current slide's left edge
            const currentSlideLeft = slides[currentIndex].offsetLeft;
            let prevIndex = -1;
            for(let i = currentIndex - 1; i >= 0; i--){
                const slideRight = slides[i].offsetLeft + slides[i].offsetWidth;
                if(slideRight < currentSlideLeft){
                    prevIndex = i;
                    break;
                }
            }
            if(prevIndex === -1 && currentIndex > 0) prevIndex = 0; // If can't find a good one, go to start
            if(prevIndex !== -1) moveToSlide(prevIndex);
        });

        // Initial state
        moveToSlide(0);

        // Optional: Recalculate on window resize
        window.addEventListener('resize', () => {
            moveToSlide(currentIndex);
        });
    }
    
    // --- INTERSECTION OBSERVER FOR FADE-IN ANIMATION ---
    const fadeElements = document.querySelectorAll('.fade-in-element');

    const observerOptions = {
      root: null, // observes intersections relative to the viewport
      rootMargin: '0px',
      threshold: 0.1 // Triggers when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        // If the element is intersecting the viewport
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Stop observing the element once it's visible
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Start observing each of the elements
    fadeElements.forEach(el => {
      observer.observe(el);
    });

    // --- HERO FLICKER ANIMATION ---
    const flickerAnimation = async () => {
        // A helper function to pause execution for a given time in milliseconds
        const delay = ms => new Promise(res => setTimeout(res, ms));

        const lamp = document.getElementById('hero-lamp');
        const logo = document.getElementById('hero-logo');
        const hero = document.getElementById('hero-section');
        if (!lamp || !logo || !hero) return; // Exit if elements aren't on the page

        // Define image sources and colors
        const lampOnSrc = 'img/lamp.svg';
        const lampOffSrc = 'img/lamp-off.svg';
        const logoOnSrc = 'img/logo-white.svg';
        const logoOffSrc = 'img/logo-moon.svg';
        const colorOn = '#010AD1';
        const colorOff = '#00008B';

        // Set initial "off" state for the background
        hero.style.backgroundColor = colorOff;

        // The animation sequence
        try {
            await delay(1200); // Initial delay before starting
            lamp.src = lampOnSrc;
            logo.src = logoOnSrc;
            hero.style.backgroundColor = colorOn;

            await delay(100);
            lamp.src = lampOffSrc;
            logo.src = logoOffSrc;
            hero.style.backgroundColor = colorOff;

            await delay(150);
            lamp.src = lampOnSrc;
            logo.src = logoOnSrc;
            hero.style.backgroundColor = colorOn;

            await delay(80);
            lamp.src = lampOffSrc;
            logo.src = logoOffSrc;
            hero.style.backgroundColor = colorOff;

            await delay(250);
            lamp.src = lampOnSrc; // Stays on permanently
            logo.src = logoOnSrc;
            hero.style.backgroundColor = colorOn;
            lamp.alt = "An illustrated lamp that is turned on"; // Update alt text for accessibility

        } catch (error) {
            console.error("Flicker animation failed:", error);
            // Ensure elements are on even if the animation is interrupted
            lamp.src = lampOnSrc;
            logo.src = logoOnSrc;
            hero.style.backgroundColor = colorOn;
            lamp.alt = "An illustrated lamp that is turned on";
        }
    };

    // Run the animation
    flickerAnimation();

});