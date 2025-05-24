document.addEventListener('DOMContentLoaded', function() {
    // Rotating banner functionality
    const bannerImages = document.querySelectorAll('.banner-container img');
    let currentImage = 0;
    
    function rotateBanner() {
        // Hide current image
        bannerImages[currentImage].classList.remove('active');
        
        // Move to next image
        currentImage = (currentImage + 1) % bannerImages.length;
        
        // Show next image
        bannerImages[currentImage].classList.add('active');
    }
    
    // Start rotation every 5 seconds
    if (bannerImages.length > 1) {
        bannerImages[0].classList.add('active');
        setInterval(rotateBanner, 5000);
    } else if (bannerImages.length === 1) {
        bannerImages[0].classList.add('active');
    }
    
    // Donate button functionality
    const donateButtons = document.querySelectorAll('#donate-btn, #cta-donate-btn');
    
    donateButtons.forEach(button => {
        button.addEventListener('click', function() {
            window.open('https://solscan.io/account/6wQj3gAcVTnpy1svqczZtS5CE8mkUuWUcXxNqiFWBdGF', '_blank');
        });
    });
    
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
});