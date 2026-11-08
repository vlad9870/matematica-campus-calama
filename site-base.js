/* Navegação e avisos das páginas internas de notícias. */
(() => {
  'use strict';
  const menuButton = document.querySelector('.mobile-toggle');
  const siteNav = document.querySelector('.site-nav');
  const submenuButtons = [...document.querySelectorAll('[data-menu-toggle]')];
  const closeSubmenus = (except = null) => {
    submenuButtons.forEach(button => {
      if (button !== except) {
        button.setAttribute('aria-expanded', 'false');
        button.closest('.has-dropdown').classList.remove('is-open');
      }
    });
  };
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    siteNav.classList.toggle('nav-open', open);
    if (!open) closeSubmenus();
  });
  submenuButtons.forEach(button => button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    closeSubmenus(button);
    button.setAttribute('aria-expanded', String(!open));
    button.closest('.has-dropdown').classList.toggle('is-open', !open);
  }));
  document.addEventListener('click', e => { if (!e.target.closest('.site-nav')) closeSubmenus(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeSubmenus();
      if (siteNav?.classList.contains('nav-open')) menuButton?.click();
    }
  });
  siteNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    closeSubmenus();
    if (siteNav.classList.contains('nav-open')) menuButton?.click();
  }));
  const dialog = document.getElementById('pending-dialog');
  const dialogName = document.getElementById('pending-name');
  const altLink = document.getElementById('pending-alt');
  document.querySelectorAll('[data-pending-page]').forEach(link => link.addEventListener('click', e => {
    e.preventDefault();
    dialogName.textContent = link.dataset.pendingPage;
    const alternativo = link.dataset.altUrl;
    altLink.hidden = !alternativo;
    if (alternativo) altLink.href = alternativo;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }));
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => dialog?.close()));
  dialog?.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  const ano = document.getElementById('copyright-year');
  if (ano) ano.textContent = new Date().getFullYear();
})();
