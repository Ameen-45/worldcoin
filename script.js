document.addEventListener('DOMContentLoaded', function() {
  // Total animation duration (6 seconds)
  const ANIMATION_DURATION = 7000;
  
  // After animations complete, fade out and redirect
  setTimeout(() => {
    const intro = document.getElementById('intro');
    intro.classList.add('fade-out');
    
    setTimeout(() => {
     window.location.href ="/home/"
    }, 1000);
  }, ANIMATION_DURATION);

  // Force redraw to fix mobile animation start
  setTimeout(() => {
    document.body.style.opacity = 1;
  }, 50);

  // Prevent zooming on mobile
  document.addEventListener('touchmove', function(e) {
    if (e.scale !== 1) e.preventDefault();
  }, { passive: false });

  // Fix for mobile viewport height
  function setViewportHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  
  setViewportHeight();
  window.addEventListener('resize', setViewportHeight);
});