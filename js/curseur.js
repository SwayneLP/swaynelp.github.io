// Au chargement du site
window.addEventListener("load", () => {
  document.body.classList.add("no-scroll");

  // Déblocage après 4 secondes
  setTimeout(() => {
    document.body.classList.remove("no-scroll");
  }, 4000);
});
