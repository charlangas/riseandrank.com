// JavaScript for Accountant Landing Page

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links ul');

    hamburgerMenu.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    // Close mobile navigation on link click (for better user experience)
    const navItems = document.querySelectorAll('.nav-links ul li a');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('open');
        });
    });

    // FAQ Accordion Functionality
    const accordionButtons = document.querySelectorAll('.accordion-button');
    const accordionContents = document.querySelectorAll('.accordion-content');

    // Initially hide all accordion content
    accordionContents.forEach(content => {
        content.style.display = 'none';
    });

    accordionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const accordionContent = button.nextElementSibling;
            const isOpen = button.classList.contains('active');

            // Close other open accordion items
            accordionButtons.forEach(btn => {
                if (btn !== button) {
                    btn.classList.remove('active');
                    btn.nextElementSibling.style.maxHeight = null;
                    btn.nextElementSibling.style.display = 'none';
                }
            });

            // Toggle current accordion item
            if (isOpen) {
                button.classList.remove('active');
                accordionContent.style.maxHeight = null;
                accordionContent.style.display = 'none';
            } else {
                button.classList.add('active');
                accordionContent.style.display = 'block';
                accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
            }
        });
    });
});
