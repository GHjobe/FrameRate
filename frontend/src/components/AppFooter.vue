<template>
  <footer class="footer">
    <div class="footer__inner">
      <a
        href="https://www.themoviedb.org"
        target="_blank"
        rel="noopener noreferrer"
        class="footer__logo"
        aria-label="The Movie Database (TMDB)"
      >
        <img src="/tmdb-logo.svg" alt="TMDB" height="12" />
      </a>
      <p class="footer__text">
        This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.
      </p>
      <p class="footer__text">
        Streaming availability data provided by
        <a href="https://www.justwatch.com" target="_blank" rel="noopener noreferrer" class="footer__link">JustWatch</a>.
      </p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: var(--space-8);
  padding: var(--space-6) 0;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
}
.footer__inner {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4) var(--space-6);
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 0 var(--space-6);
}
.footer__logo { display: inline-flex; line-height: 0; }
.footer__logo img { height: 12px; width: auto; }
.footer__text {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
.footer__link {
  color: var(--color-text);
  text-decoration: underline;
}
.footer__link:hover { color: var(--color-primary); }
.footer__link:focus-visible,
.footer__logo:focus-visible {
  outline: 2px solid var(--color-nav-active);
  outline-offset: 2px;
}
</style>