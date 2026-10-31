(function () {
  document.documentElement.classList.add("js");

  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
      toggle.setAttribute(
        "aria-expanded",
        links.classList.contains("open") ? "true" : "false"
      );
    });
  }

  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -24px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
    window.setTimeout(function () {
      document.querySelectorAll(".reveal:not(.in)").forEach(function (el) {
        el.classList.add("in");
      });
    }, 450);
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = document.getElementById("form-status");
      if (status) {
        status.textContent = "已记录您的留言。正式对接请通过电话或邮件联系。";
        status.classList.add("show");
      }
      form.reset();
    });
  }
})();
