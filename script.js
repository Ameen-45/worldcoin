document.addEventListener('DOMContentLoaded', function() {
  const ANIMATION_DURATION = 4000; 
  const logo = document.querySelector('.worldcoin-logo');

  setTimeout(() => {
    document.body.style.opacity = 1;
  }, 50);

  setTimeout(() => {

    logo.style.animation = 'comeForward 1.0s forwards';
    

    setTimeout(() => {
      window.location.href = "/home/";
    }, 1500);
    
  }, ANIMATION_DURATION);


  document.addEventListener('touchmove', function(e) {
    if (e.scale !== 1) e.preventDefault();
  }, { passive: false });

  
  function setViewportHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  
  setViewportHeight();
  window.addEventListener('resize', setViewportHeight);
});