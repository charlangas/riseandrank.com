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
});
