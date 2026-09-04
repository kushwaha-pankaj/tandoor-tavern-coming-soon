/**
 * Tandoor Tavern — Coming Soon
 * Marks the document ready once webfonts settle; respects reduced motion via CSS.
 */
(function () {
  "use strict";

  var root = document.documentElement;

  function markReady() {
    root.classList.add("is-ready");
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(markReady).catch(markReady);
  } else {
    markReady();
  }

  var logo = document.querySelector("img.site-logo");
  if (logo && typeof logo.decode === "function") {
    logo.decode().catch(function () {});
  }
})();
