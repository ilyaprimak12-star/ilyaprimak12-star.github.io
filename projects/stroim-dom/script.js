const button=document.querySelector('.hamburger');const navigation=document.querySelector('.nav-links');button.addEventListener('click',()=>{const open=navigation.classList.toggle('active');button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню')});navigation.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{navigation.classList.remove('active');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Открыть меню')}));

document.querySelectorAll('.feature-card a').forEach(link => {
  link.addEventListener('pointerup', () => { if (document.activeElement === link) link.blur(); });
  link.addEventListener('click', event => { if (event.detail > 0) link.blur(); });
});

const serviceCards = [...document.querySelectorAll('.feature-card')];
let clickedCard = null;
function clearCardHighlight() { serviceCards.forEach(card => card.classList.remove('is-hover')); }
document.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse') return;
  const hit = document.elementFromPoint(event.clientX, event.clientY);
  const current = hit && hit.closest('.feature-card');
  if (current !== clickedCard) clickedCard = null;
  serviceCards.forEach(card => card.classList.toggle('is-hover', card === current && card !== clickedCard));
}, { passive: true });
document.addEventListener('pointerleave', clearCardHighlight);
window.addEventListener('blur', clearCardHighlight);
document.addEventListener('visibilitychange', () => { if (document.hidden) clearCardHighlight(); });
let feedbackTimer;
serviceCards.forEach(card => card.querySelector('a').addEventListener('click', () => {
  clickedCard = card;
  clearCardHighlight();
  clearTimeout(feedbackTimer);
  serviceCards.forEach(item => item.classList.remove('click-feedback'));
  card.classList.add('click-feedback');
  feedbackTimer = setTimeout(() => card.classList.remove('click-feedback'), 2000);
}));
