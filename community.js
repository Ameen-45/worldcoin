document.addEventListener('DOMContentLoaded', function() {
    // Animated Logo Assembly
    const logoAnimation = () => {
        const logoContainer = document.getElementById('logo-animation');
        const logoPieces = 6; // Number of logo pieces
        
        // Create logo pieces
        for (let i = 0; i < logoPieces; i++) {
            const piece = document.createElement('div');
            piece.className = 'logo-piece';
            piece.style.width = '50px';
            piece.style.height = '50px';
            piece.style.backgroundColor = getRandomColor();
            piece.style.position = 'absolute';
            piece.style.borderRadius = '10px';
            piece.style.transform = `translate(${Math.random() * 400 - 200}px, ${Math.random() * 400 - 200}px)`;
            piece.style.opacity = '0';
            piece.style.transition = 'all 1s ease-in-out';
            logoContainer.appendChild(piece);
            
            // Animate pieces coming together
            setTimeout(() => {
                piece.style.opacity = '1';
                piece.style.transform = 'translate(0, 0)';
            }, i * 200);
        }
        
        // After pieces come together, reveal actual logo
        setTimeout(() => {
            logoContainer.innerHTML = '';
            const realLogo = document.createElement('img');
            realLogo.src = 'worldcoin+logo.png';
            realLogo.alt = 'WorldCoin Logo';
            realLogo.style.width = '100%';
            realLogo.style.height = '100%';
            realLogo.style.objectFit = 'contain';
            realLogo.style.animation = 'pulse 2s infinite';
            logoContainer.appendChild(realLogo);
        }, logoPieces * 200 + 1000);
    };
    
    // Helper function for random colors
    const getRandomColor = () => {
        const colors = ['#4a6bff', '#3a56d4', '#ff6b4a', '#6bff4a', '#ff4a6b'];
        return colors[Math.floor(Math.random() * colors.length)];
    };
    
    // Initialize logo animation when section is in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                logoAnimation();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const logoSection = document.querySelector('.logo-animation-section');
    if (logoSection) {
        observer.observe(logoSection);
    }
    
    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
    
    // Animate elements when they come into view
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate__animated');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                const animationClass = element.classList[1];
                element.classList.add(animationClass);
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on load
    
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
                
                // Close mobile menu if open
                if (hamburger.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                }
            }
        });
    });
    
    // Add pulse animation to CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
});
// Image Slideshow Functionality
function initSlideshow() {
    const slideshow = document.querySelector('.image-slideshow');
    if (!slideshow) return;
    
    const images = slideshow.querySelectorAll('img');
    let currentIndex = 0;
    
    function showNextImage() {
        // Hide current image
        images[currentIndex].classList.remove('active');
        
        // Move to next image
        currentIndex = (currentIndex + 1) % images.length;
        
        // Show next image
        images[currentIndex].classList.add('active');
    }
    
    // Start slideshow
    if (images.length > 1) {
        // Show first image immediately
        images[0].classList.add('active');
        
        // Set interval for slideshow
        setInterval(showNextImage, 10000); // Change every 10 seconds
    } else if (images.length === 1) {
        // Just show the single image
        images[0].classList.add('active');
    }
}

// Call the function when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initSlideshow();
    
    // ... rest of your existing JavaScript code ...
});
document.addEventListener('DOMContentLoaded', function() {
    const joinButton = document.querySelector('.cta-button');
    if (joinButton) {
        joinButton.addEventListener('click', function() {
            window.open('https://t.me/WorldCoinCr/1', '_blank');
        });
    }
});