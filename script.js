// ─────────────────────────────────────────────
// HAMBURGER MENU
// ─────────────────────────────────────────────

// Grab the hamburger button and the <ul> list of nav links from the DOM.
// document.querySelector() finds the *first* element that matches the CSS selector.
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('nav ul');

// Listen for a 'click' event on the hamburger button.
// The arrow function ( () => {} ) is the code that runs every time it's clicked.
navToggle.addEventListener('click', () => {
  // classList.toggle() adds the class if it's missing, removes it if it's there.
  // It also returns true/false so we know the new state.
  const isOpen = navMenu.classList.toggle('is-open');

  // Keep the button's own class in sync (e.g. for animating the icon into an X).
  // The second argument to toggle() forces the class on (true) or off (false).
  navToggle.classList.toggle('is-open', isOpen);

  // Update the aria-expanded attribute so screen readers know whether the menu
  // is open or closed. setAttribute() always expects a string, hence String(isOpen).
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// When the user taps any nav link, close the menu automatically.
// querySelectorAll() returns every matching element; forEach() loops over them.
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    // Remove the 'is-open' class from both the menu and the toggle button,
    // effectively collapsing the mobile menu.
    navMenu.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});


// ─────────────────────────────────────────────
// PROJECT MODAL (lightbox)
// ─────────────────────────────────────────────

// Cache references to every piece of the modal we'll need to manipulate.
// Doing this once at the top is faster than searching the DOM every time.
const modal = document.getElementById('project-modal');
const modalImg = modal.querySelector('.modal-img');         // <img> inside the modal
const modalVideo = modal.querySelector('.modal-video');     // <video> inside the modal
const modalCaption = modal.querySelector('.modal-caption'); // caption text element
const modalClose = modal.querySelector('.modal-close');     // × close button
const modalBackdrop = modal.querySelector('.modal-backdrop'); // dark overlay behind the modal

// openModal() is called when the user clicks a project card.
// It receives the card element so it can read the card's own image/video/caption.
function openModal(card) {
  // Look inside the clicked card for a <video> or <img>.
  const video = card.querySelector('video');
  const img   = card.querySelector('img');

  // Decide the caption text: prefer a custom data-caption attribute on the card,
  // fall back to the image's alt text, and finally an empty string.
  const caption = card.dataset.caption || (img ? img.alt : '') || '';

  if (video) {
    // Card has a video — hide the image element and show the video element.
    modalImg.classList.add('is-hidden');
    modalVideo.classList.remove('is-hidden');
    // Copy the video source and reset playback to the beginning.
    modalVideo.src = video.src;
    modalVideo.currentTime = 0;
  } else {
    // Card has a still image — hide the video element and show the image element.
    modalVideo.classList.add('is-hidden');
    modalImg.classList.remove('is-hidden');
    // Copy the image source and its alt text (good for accessibility).
    modalImg.src = img.src;
    modalImg.alt = img.alt;
  }

  // Populate the caption and make the modal visible in the DOM.
  modalCaption.textContent = caption;
  modal.hidden = false; // removes the HTML 'hidden' attribute

  // We need the browser to paint one frame with hidden=false before adding
  // 'is-open', otherwise the CSS transition won't play (you can't transition
  // from display:none). Double requestAnimationFrame guarantees two paint cycles.
  requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('is-open')));

  // Prevent the page behind the modal from scrolling while it's open.
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  // Remove 'is-open' to trigger the CSS close transition (e.g. fade out).
  modal.classList.remove('is-open');

  // Wait for the CSS transition to fully finish before hiding the element.
  // { once: true } means this listener automatically removes itself after firing once,
  // so it doesn't stack up on repeated opens/closes.
  modal.addEventListener('transitionend', () => {
    modal.hidden = true;    // hide from DOM (and from screen readers)
    modalImg.src = '';      // free the image reference
    modalVideo.pause();     // stop any playing video
    modalVideo.src = '';    // free the video reference
  }, { once: true });

  // Restore normal page scrolling.
  document.body.style.overflow = '';
}

// Attach a click listener to every project card.
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => {
    const img   = card.querySelector('img');
    const video = card.querySelector('video');
    // Only open the modal if the card actually contains media with a real src,
    // so clicking an empty placeholder card does nothing.
    if (img && img.src) openModal(card);
    else if (video && video.src) openModal(card);
  });
});

// Three ways to close the modal:
modalClose.addEventListener('click', closeModal);       // 1. Click the × button
modalBackdrop.addEventListener('click', closeModal);    // 2. Click the dark backdrop

// 3. Press the Escape key anywhere on the page.
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});


// ─────────────────────────────────────────────
// SHOWCASE SLIDER
// ─────────────────────────────────────────────

// Wrap everything in an IIFE (Immediately Invoked Function Expression):
// (function(){ ... })()
// This creates a private scope so variables like 'current' and 'total' don't
// accidentally clash with anything else on the page.
(function () {
  // Collect all slide elements into a real Array.
  // The spread [...] converts the NodeList returned by querySelectorAll into an Array,
  // which gives us access to methods like .forEach().
  const slides = [...document.querySelectorAll('.slide')];

  // If there are no slides on the page, bail out early — nothing to do.
  if (!slides.length) return;

  // 'current' tracks the index of the active (centre) slide.
  let current = 0;
  const total = slides.length;

  // updateSlider() recalculates each slide's position relative to 'current'
  // and writes it into a data-pos attribute that CSS uses for styling/transforms.
  function updateSlider() {
    slides.forEach((slide, i) => {
      // pos = how far this slide is from the active one.
      // e.g. active slide → 0, one to the right → 1, one to the left → -1
      let pos = i - current;

      // Circular wrap: if pos is more than halfway around the carousel in either
      // direction, loop it the short way instead so the carousel feels infinite.
      if (pos > total / 2) pos -= total;
      if (pos < -total / 2) pos += total;

      // Clamp to the range -2 … 2. Slides further away all share the same
      // "far off-screen" style, so we don't need more values than that.
      slide.dataset.pos = Math.max(-2, Math.min(2, pos));

      // Hide off-centre slides from screen readers so they aren't announced.
      slide.setAttribute('aria-hidden', pos !== 0 ? 'true' : 'false');
    });
  }

  // Previous button: move current one step back.
  // The modulo (%) wraps the index around to the end when it would go below 0.
  document.querySelector('.slider-prev').addEventListener('click', () => {
    current = (current - 1 + total) % total;
    updateSlider();
  });

  // Next button: move current one step forward, wrapping back to 0 at the end.
  document.querySelector('.slider-next').addEventListener('click', () => {
    current = (current + 1) % total;
    updateSlider();
  });

  // Keyboard navigation — left/right arrow keys work when focus is inside the slider.
  // This makes the slider accessible without a mouse.
  document.getElementById('slider').addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { current = (current - 1 + total) % total; updateSlider(); }
    if (e.key === 'ArrowRight') { current = (current + 1) % total;         updateSlider(); }
  });

  // Run once on page load so the correct slide starts in the centre position.
  updateSlider();

  // For slides that contain a video, play on hover and reset when the mouse leaves.
  // This gives a nice preview effect without auto-playing everything at once.
  document.querySelectorAll('.slide--video').forEach(slide => {
    const video = slide.querySelector('.slide-video');
    slide.addEventListener('mouseenter', () => video.play());
    slide.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0; // rewind so next hover starts from the beginning
    });
  });
})();
