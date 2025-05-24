document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const submitButton = contactForm.querySelector('.cta-button');
    const buttonText = submitButton.querySelector('.button-text');
    const spinner = submitButton.querySelector('.button-spinner');
    
    // Form submission handler
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Form validation
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        
        if (!firstName || !lastName || !email || !message) {
            alert('Please fill in all required fields.');
            return;
        }
        
        if (!validateEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        // Show loading state
        submitButton.disabled = true;
        buttonText.textContent = 'Sending...';
        spinner.style.display = 'block';
        
        // Simulate email sending (replace with actual SMTP code)
        setTimeout(() => {
            // In production, use actual SMTP code here
            // This is just a simulation
            const isSuccess = Math.random() > 0.1; // 90% success rate for demo
            
            if (isSuccess) {
                alert(`Thank you, ${firstName}! Your message has been sent successfully. We'll respond within 24 hours.`);
                contactForm.reset();
            } else {
                alert('There was an error sending your message. Please try again or contact us through our social media channels.');
            }
            
            // Reset button
            submitButton.disabled = false;
            buttonText.textContent = 'Send Message';
            spinner.style.display = 'none';
        }, 1500);
    });
    
    // Email validation function
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Social media links are already properly set in HTML
    // No additional JS needed for them
});
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
});
function sendViaEmail(event) {
    event.preventDefault();
    
    // Get form values
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').options[document.getElementById('subject').selectedIndex].text;
    const message = document.getElementById('message').value;
    
    // Your email address
    const recipientEmail = "Mikael.bruske@hotmail.com";
    
    // Create mailto link
    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        `Dear Mikael,\n\n${message}\n\nBest regards,\n${firstName} ${lastName}\n${email}`
    )}`;
    
    // Open email client
    window.location.href = mailtoLink;
}