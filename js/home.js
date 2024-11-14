document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Enhancement
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
    });

    // Smooth Scroll Implementation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Calculate header height for offset
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Enhanced Accordion functionality
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');
        
        // Set initial state
        content.style.maxHeight = '0px';
        content.style.overflow = 'hidden';
        content.style.transition = 'max-height 0.3s ease-out';
        
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other accordion items
            accordionItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherContent = otherItem.querySelector('.accordion-content');
                    otherContent.style.maxHeight = '0px';
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
            
            // Animate content height
            if (!isActive) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = '0px';
            }
        });
    });
});