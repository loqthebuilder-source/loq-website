const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const slides = [...document.querySelectorAll(".hero-image")];
const slideControls = document.querySelector(".hero-controls");
const slideButtons = [...slideControls.querySelectorAll("[data-slide]")];
const playback = slideControls.querySelector(".hero-playback");
const slideCaption = document.querySelector(".hero-note b");
let activeSlide = 0;
let playing = true;
let slideTimer;

function showSlide(index) {
  slides[activeSlide].classList.remove("is-active");
  slides[activeSlide].setAttribute("aria-hidden", "true");
  slideButtons[activeSlide].removeAttribute("aria-current");

  activeSlide = index;
  slides[index].classList.add("is-active");
  slides[index].removeAttribute("aria-hidden");
  slideButtons[index].setAttribute("aria-current", "true");
  slideCaption.textContent = slides[index].dataset.caption;
}

function syncPlayback() {
  window.clearInterval(slideTimer);
  playback.classList.toggle("is-paused", !playing);
  playback.setAttribute("aria-label", playing ? "Jeda tayangan gambar" : "Sambung tayangan gambar");

  if (playing && !reducedMotion.matches && !document.hidden) {
    slideTimer = window.setInterval(() => showSlide((activeSlide + 1) % slides.length), 6000);
  }
}

slideButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    showSlide(index);
    playing = false;
    syncPlayback();
  });
});
playback.addEventListener("click", () => {
  playing = !playing;
  syncPlayback();
});
document.addEventListener("visibilitychange", syncPlayback);
reducedMotion.addEventListener("change", syncPlayback);
slideControls.hidden = false;
syncPlayback();

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("in-view");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((section) => observer.observe(section));
}

const viewer = document.querySelector(".viewer");

if (typeof viewer.showModal === "function") {
  const photo = viewer.querySelector("img");
  const caption = viewer.querySelector("figcaption");
  let currentLink;

  for (const link of document.querySelectorAll(".work")) {
    link.setAttribute("aria-haspopup", "dialog");
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      event.preventDefault();
      currentLink = link;
      photo.src = link.href;
      photo.alt = link.querySelector("img").alt;
      caption.textContent = link.querySelector("h3").textContent;
      viewer.showModal();
    });
  }

  viewer.querySelector("button").addEventListener("click", () => viewer.close());
  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) viewer.close();
  });
  viewer.addEventListener("close", () => currentLink.focus());
}
