// Hamburger Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    // Ensure nav links are visible on desktop
    function checkScreenSize() {
        if (window.innerWidth > 768) {
            navLinks.style.display = 'flex';
        } else {
            navLinks.style.display = 'none';
        }
    }
    
    // Initial check
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        
        // Toggle nav links display
        if (navLinks.style.display === 'flex' || navLinks.style.display === '') {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
        }
        
        // For mobile, add active class for animation
        if (window.innerWidth <= 768) {
            navLinks.classList.toggle('active');
        }
        
        // Toggle body overflow when menu is open
        if (navLinks.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    // Close menu when clicking on a link (for mobile)
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                navLinks.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });
    
    // Form submission handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const button = this.querySelector('.cta-button');
            button.classList.add('form-submitting');
            
            // Simulate form submission (replace with actual form submission)
            setTimeout(() => {
                button.classList.remove('form-submitting');
                button.classList.add('form-success');
                button.querySelector('.button-text').textContent = 'Message Sent!';
                
                // Reset form
                setTimeout(() => {
                    contactForm.reset();
                    button.classList.remove('form-success');
                    button.querySelector('.button-text').textContent = 'Send Message';
                }, 3000);
            }, 1500);
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Animation for elements when they come into view
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.contact-card, .social-card, .thank-you-note');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Set initial state for animated elements
    document.querySelectorAll('.contact-card, .social-card, .thank-you-note').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    });
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on page load
});

// Form submission via Email (using SMTPJS)
function sendViaEmail(event) {
    event.preventDefault();
    
    const form = event.target;
    const button = form.querySelector('.cta-button');
    const spinner = form.querySelector('.button-spinner');
    const buttonText = form.querySelector('.button-text');
    
    // Show loading state
    button.classList.add('form-submitting');
    
    // Get form data
    const formData = {
        firstName: form.querySelector('#firstName').value,
        lastName: form.querySelector('#lastName').value,
        email: form.querySelector('#email').value,
        subject: form.querySelector('#subject').value,
        message: form.querySelector('#message').value
    };
    
    // Simulate form submission
    setTimeout(() => {
        button.classList.remove('form-submitting');
        button.classList.add('form-success');
        buttonText.textContent = 'Message Sent!';
        
        // Reset form after 3 seconds
        setTimeout(() => {
            form.reset();
            button.classList.remove('form-success');
            buttonText.textContent = 'Send Message';
        }, 3000);
    }, 1500);
}