document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const submitButton = document.getElementById("contact-submit");

  if (!form || !submitButton) {
    return;
  }

  form.addEventListener("submit", () => {
    submitButton.disabled = true;
    submitButton.textContent = "Enviando";
  });
});
