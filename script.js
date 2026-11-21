const translations={ru:{navWork:'Работы',navContact:'Связаться',intro:'Привет, я Илья Примак',hero:'Создаю цифровые<br>впечатления.',scroll:'Листай, чтобы исследовать ↓',aboutLabel:'Обо мне',aboutTitle:'От идеи<br><em>к реальности.</em>',aboutCopy:'Создаю цифровые проекты, объединяя AI-инструменты с веб-разработкой. Использую ИИ, чтобы быстрее превращать идеи в работающие сайты и интерфейсы, и дорабатываю результат с помощью HTML и CSS.',workLabel:'Избранные работы',workTitle:'Идеи в<br><em>действии.</em>',view:'Открыть проект ↗',contactLabel:'Есть идея?',contactTitle:'Давай создадим<br><em>что-то вместе.</em>',telegram:'Обсудить проект в Telegram ↗',whatsapp:'Обсудить проект в WhatsApp ↗',top:'Наверх ↑'},en:{navWork:'Work',navContact:'Get in touch',intro:'Hi, I’m Ilya Primak',hero:'Creating digital<br>experiences.',scroll:'Scroll to explore ↓',aboutLabel:'About me',aboutTitle:'From idea<br><em>to reality.</em>',aboutCopy:'I create digital projects by combining AI tools with web development. I use AI to turn ideas into working websites and interfaces faster, then refine the result with HTML and CSS.',workLabel:'Selected work',workTitle:'Ideas in<br><em>motion.</em>',view:'View project ↗',contactLabel:'Have an idea?',contactTitle:'Let’s create<br><em>something together.</em>',telegram:'Discuss a project on Telegram ↗',whatsapp:'Discuss a project on WhatsApp ↗',top:'Back to top ↑'},sr:{navWork:'Radovi',navContact:'Kontakt',intro:'Zdravo, ja sam Ilja Primak',hero:'Stvaram digitalna<br>iskustva.',scroll:'Skroluj i istraži ↓',aboutLabel:'O meni',aboutTitle:'Od ideje<br><em>do stvarnosti.</em>',aboutCopy:'Kreiram digitalne projekte kombinujući AI alate i veb razvoj. Koristim veštačku inteligenciju da brže pretvorim ideje u funkcionalne sajtove i interfejse, a zatim ih dorađujem pomoću HTML-a i CSS-a.',workLabel:'Odabrani radovi',workTitle:'Ideje u<br><em>pokretu.</em>',view:'Otvori projekat ↗',contactLabel:'Imaš ideju?',contactTitle:'Hajde da stvorimo<br><em>nešto zajedno.</em>',telegram:'Razgovarajmo na Telegramu ↗',whatsapp:'Razgovarajmo na WhatsAppu ↗',top:'Na vrh ↑'}};
translations.ru.laptop = 'Идеи становятся<br>реальностью.';
translations.en.laptop = 'Ideas become<br>reality.';
translations.sr.laptop = 'Ideje postaju<br>stvarnost.';
document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>{const lang=button.dataset.lang;document.documentElement.lang=lang;document.querySelectorAll('[data-i]').forEach(element=>element.innerHTML=translations[lang][element.dataset.i]);document.querySelectorAll('[data-lang]').forEach(item=>item.classList.toggle('active',item===button));}));
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const hero = document.querySelector('.hero');
const stage = document.querySelector('.hero-stage');
const scene = document.querySelector('.scene');
const heroContent = document.querySelector('.hero-content');
const entryScene = document.querySelector('.entry-scene');
const flightCanvas = document.querySelector('.flight-video');
const flightContext = flightCanvas.getContext('2d');
const flightFrames = Array.from({ length: 150 }, () => new Image());
let loadedFrames = 0;
flightFrames.forEach((frame, index) => {
  frame.onload = () => { loadedFrames += 1; requestMotion(); };
  frame.src = 'flight-frames/frame-' + String(index + 1).padStart(3, '0') + '.jpg';
});
const journeyScene = document.querySelector('.journey-scene');
let scheduled = false;

function updateMotion() {
  scheduled = false;
  if (reduced.matches) return;
  const distance = Math.max(hero.offsetHeight - innerHeight, 1);
  const progress = Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / distance));
  stage.style.setProperty('--progress', progress);
  scene.style.transform = `perspective(1400px) translate3d(${-progress * 5}%, ${progress * 4}%, 0) rotateY(${-progress * 5}deg) scale(${1 + progress * 0.52})`;
  heroContent.style.transform = `translate3d(0, ${-progress * 20}vh, 0) scale(${1 + progress * 0.12})`;
  heroContent.style.opacity = String(Math.max(0, 1 - progress * 3.2));
  const videoReady = loadedFrames === flightFrames.length && Boolean(flightContext);
  const journeyProgress = videoReady
    ? Math.max(0, Math.min(1, (progress - 0.82) / 0.18))
    : Math.max(0, Math.min(1, (progress - 0.48) / 0.52));
  const entryProgress = videoReady
    ? Math.max(0, Math.min(1, (progress - 0.77) / 0.07))
    : Math.max(0, Math.min(1, (progress - 0.25) / 0.3));
  if (videoReady) {
    flightCanvas.style.opacity = String(Math.max(0, Math.min(1, (progress - 0.08) / 0.12)));
    const frameProgress = Math.max(0, Math.min(1, (progress - 0.08) / 0.69));
    const frameIndex = Math.round(frameProgress * (flightFrames.length - 1));
    flightContext.drawImage(flightFrames[frameIndex], 0, 0, flightCanvas.width, flightCanvas.height);
  }
  entryScene.style.setProperty('--entry-progress', entryProgress);
  entryScene.style.opacity = entryProgress > 0 ? '1' : '0';
  journeyScene.style.setProperty('--journey-progress', journeyProgress);
  document.querySelectorAll('.motion-section').forEach(section => {
    const rect = section.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
    section.style.setProperty('--section-progress', position);
  });
}
function requestMotion() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateMotion); }
}
addEventListener('scroll', requestMotion, { passive: true });
addEventListener('resize', requestMotion);
document.querySelectorAll('.about, .work, .contact').forEach(section => section.classList.add('motion-section'));
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const about = document.querySelector('.about');
  about.addEventListener('pointermove', event => {
    if (reduced.matches) return;
    const bounds = about.getBoundingClientRect();
    about.style.setProperty('--orb-x', ((event.clientY - bounds.top) / bounds.height * 24 - 12) + 'deg');
    about.style.setProperty('--orb-y', ((event.clientX - bounds.left) / bounds.width * 32 - 16) + 'deg');
  });
  stage.addEventListener('pointermove', event => {
    if (reduced.matches) return;
    const bounds = stage.getBoundingClientRect();
    journeyScene.style.setProperty('--room-x', ((event.clientX / innerWidth - .5) * -8) + 'px');
    journeyScene.style.setProperty('--room-y', ((event.clientY / innerHeight - .5) * -8) + 'px');
    stage.style.setProperty('--pointer-x', `${(event.clientX - bounds.left) / bounds.width * 100}%`);
    stage.style.setProperty('--pointer-y', `${(event.clientY - bounds.top) / bounds.height * 100}%`);
    stage.style.setProperty('--tilt-x', `${(event.clientX / innerWidth - .5) * 12}px`);
    stage.style.setProperty('--tilt-y', `${(event.clientY / innerHeight - .5) * 12}px`);
  });
  document.querySelectorAll('.projects a, .contact-links a').forEach(link => {
    link.addEventListener('pointermove', event => {
      if (reduced.matches) return;
      const rect = link.getBoundingClientRect();
      link.style.setProperty('--light-x', `${(event.clientX - rect.left) / rect.width * 100}%`);
      link.style.setProperty('--light-y', `${(event.clientY - rect.top) / rect.height * 100}%`);
    });
  });
  stage.addEventListener('pointerleave', () => {
    stage.style.setProperty('--tilt-x', '0px');
    stage.style.setProperty('--tilt-y', '0px');
  });
}
reduced.addEventListener('change', () => {
  if (reduced.matches) { scene.style.transform = ''; heroContent.style.transform = ''; heroContent.style.opacity = ''; }
  requestMotion();
});
requestMotion();










/* Pause the two portfolio chapters once while their content is in view. */
if ('IntersectionObserver' in window) {
  const seenChapters = new WeakSet();
  let pauseTimer;
  let navigating = false;
  document.querySelectorAll('header nav a, header .logo, footer a').forEach(link => {
    link.addEventListener('click', () => {
      navigating = true;
      clearTimeout(pauseTimer);
      pauseTimer = null;
      document.documentElement.classList.remove('chapter-paused');
      setTimeout(() => { navigating = false; }, 2500);
    });
  });
  const chapters = document.querySelectorAll('.about, .work');
  const chapterObserver = new IntersectionObserver(entries => {
    if (reduced.matches || pauseTimer || navigating) return;
    for (const entry of entries) {
      if (!entry.isIntersecting || seenChapters.has(entry.target)) continue;
      seenChapters.add(entry.target);
      const bounds = entry.target.getBoundingClientRect();
      const chapter = entry.target.closest('.about-hold, .work-hold');
      if (chapter && bounds.height <= innerHeight * 1.05) {
        const targetTop = chapter.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: targetTop, behavior: 'instant' });
      }
      document.documentElement.classList.add('chapter-paused');
      pauseTimer = setTimeout(() => {
        document.documentElement.classList.remove('chapter-paused');
        pauseTimer = null;
      }, 700);
      break;
    }
  }, { threshold: 0.55 });
  chapters.forEach(chapter => chapterObserver.observe(chapter));
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      clearTimeout(pauseTimer);
      pauseTimer = null;
      document.documentElement.classList.remove('chapter-paused');
    }
  });
}








