// ─────────────────────────────────────────────
// HAMBURGER MENU
// ─────────────────────────────────────────────


const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('nav ul');


navToggle.addEventListener('click', () => {
  
  const isOpen = navMenu.classList.toggle('is-open');

  
  navToggle.classList.toggle('is-open', isOpen);

  
  navToggle.setAttribute('aria-expanded', String(isOpen));
});


navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    
    navMenu.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});


// ─────────────────────────────────────────────
// PROJECT MODAL (lightbox)
// ─────────────────────────────────────────────


const modal = document.getElementById('project-modal');
const modalImg = modal.querySelector('.modal-img');         
const modalVideo = modal.querySelector('.modal-video');     
const modalCaption = modal.querySelector('.modal-caption'); 
const modalClose = modal.querySelector('.modal-close');     
const modalBackdrop = modal.querySelector('.modal-backdrop'); 


function openModal(card) {
  
  const video = card.querySelector('video');
  const img   = card.querySelector('img');

  
  const caption = card.dataset.caption || (img ? img.alt : '') || '';

  if (video) {
    
    modalImg.classList.add('is-hidden');
    modalVideo.classList.remove('is-hidden');
    
    modalVideo.src = video.src;
    modalVideo.currentTime = 0;
  } else {
    
    modalVideo.classList.add('is-hidden');
    modalImg.classList.remove('is-hidden');

    modalImg.src = img.src;
    modalImg.alt = img.alt;
  }

  
  modalCaption.textContent = caption;
  modal.hidden = false; 

  
  requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('is-open')));

  
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  
  modal.classList.remove('is-open');


  modal.addEventListener('transitionend', () => {
    modal.hidden = true;    
    modalImg.src = '';      
    modalVideo.pause();     
    modalVideo.src = '';    
  }, { once: true });

  
  document.body.style.overflow = '';
}


document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => {
    const img   = card.querySelector('img');
    const video = card.querySelector('video');
    
    if (img && img.src) openModal(card);
    else if (video && video.src) openModal(card);
  });
});


modalClose.addEventListener('click', closeModal);       
modalBackdrop.addEventListener('click', closeModal);    


document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});


// ─────────────────────────────────────────────
// SHOWCASE SLIDER
// ─────────────────────────────────────────────


(function () {
  
  const slides = [...document.querySelectorAll('.slide')];

  
  if (!slides.length) return;

  
  let current = 0;
  const total = slides.length;

  
  function updateSlider() {
    slides.forEach((slide, i) => {
      
      let pos = i - current;

      
      if (pos > total / 2) pos -= total;
      if (pos < -total / 2) pos += total;

      
      slide.dataset.pos = Math.max(-2, Math.min(2, pos));

     
      slide.setAttribute('aria-hidden', pos !== 0 ? 'true' : 'false');
    });
  }

  
  document.querySelector('.slider-prev').addEventListener('click', () => {
    current = (current - 1 + total) % total;
    updateSlider();
  });

  
  document.querySelector('.slider-next').addEventListener('click', () => {
    current = (current + 1) % total;
    updateSlider();
  });

  
  document.getElementById('slider').addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { current = (current - 1 + total) % total; updateSlider(); }
    if (e.key === 'ArrowRight') { current = (current + 1) % total;         updateSlider(); }
  });

  
  updateSlider();

  
  document.querySelectorAll('.slide--video').forEach(slide => {
    const video = slide.querySelector('.slide-video');
    slide.addEventListener('mouseenter', () => video.play());
    slide.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0; 
    });
  });
})();
