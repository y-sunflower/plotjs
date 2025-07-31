document.querySelectorAll(".point").forEach((el) => {
  el.addEventListener("click", function () {
    const group = this.getAttribute("data-group");

    // Toggle logic
    const active = this.classList.contains("clicked");
    document.querySelectorAll(".point").forEach((p) => {
      p.classList.remove("clicked");
      p.classList.remove("dimmed");
    });

    if (!active) {
      this.classList.add("clicked");
      document.querySelectorAll(".point").forEach((p) => {
        if (p.getAttribute("data-group") !== group) {
          p.classList.add("dimmed");
        }
      });
    }
  });
});
