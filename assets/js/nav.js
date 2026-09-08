/* Surligne dans la navigation la section réellement affichée à l'écran.
   Sans ça, « Accueil » resterait actif en permanence sur la page d'accueil. */
(function () {
  var links = Array.prototype.slice.call(
    document.querySelectorAll('.nav a[href^="#"]')
  );
  if (!links.length) return;

  var sections = links
    .map(function (link) {
      return { link: link, el: document.getElementById(link.hash.slice(1)) };
    })
    .filter(function (s) { return s.el; });
  if (!sections.length) return;

  // Le repère de lecture est placé juste sous le header collant.
  var OFFSET = 140;

  function update() {
    var line = window.scrollY + OFFSET;
    var current = sections[0];

    sections.forEach(function (s) {
      if (s.el.getBoundingClientRect().top + window.scrollY <= line) current = s;
    });

    // En bas de page, la dernière section est forcément celle qu'on lit.
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
      current = sections[sections.length - 1];
    }

    sections.forEach(function (s) {
      if (s === current) s.link.setAttribute('aria-current', 'page');
      else s.link.removeAttribute('aria-current');
    });
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('hashchange', update);
})();
