if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

(function () {
  var galleryViewport = document.getElementById("galleryViewport");

  // ---- top nav: click "Portfolio" to reveal the project list ----
  var topnav = document.getElementById("topnav");
  var navToggle = document.getElementById("navToggle");
  var navProjects = document.getElementById("navProjects");

  if (navToggle && navProjects && topnav) {
    navToggle.addEventListener("click", function () {
      var open = navProjects.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("click", function (e) {
      if (!topnav.contains(e.target)) {
        navProjects.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ---- home.html: a random, continuous, muted video playlist plays
  // automatically as soon as the page loads ----
  var introVideo = document.getElementById("introVideo");

  if (introVideo) {
    var introPlaylist = [
      { src: "assets/video/intro.mov", rotate: true },
      { src: "assets/video/intro2.mov", rotate: false },
    ];

    var playRandomClip = function () {
      var clip = introPlaylist[Math.floor(Math.random() * introPlaylist.length)];
      introVideo.src = clip.src;
      introVideo.classList.toggle("rotate90", clip.rotate);
      introVideo.play();
    };

    introVideo.addEventListener("ended", playRandomClip);
    playRandomClip();
  }

  // ---- project.html: vertical wheel drives horizontal scroll (wide viewports only —
  // below 900px the gallery becomes a normal vertical stack, see CSS) ----
  var narrowGallery = window.matchMedia("(max-width: 900px)");

  if (galleryViewport) {
    galleryViewport.addEventListener(
      "wheel",
      function (e) {
        if (narrowGallery.matches) return;
        if (Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
          e.preventDefault();
          galleryViewport.scrollLeft += e.deltaY;
        }
      },
      { passive: false }
    );

    document.addEventListener("mousemove", function (e) {
      var above = e.clientY < window.innerHeight / 2;
      document.body.classList.toggle("cursor-up", above);
    });

    galleryViewport.addEventListener("click", function () {
      if (document.body.classList.contains("cursor-up")) {
        window.location.href = "grid.html";
      }
    });

    // Remember exactly where the user was scrolled to, so leaving for the
    // grid and coming back lands on the *same* spot instead of a freshly
    // computed "center this image" position (those two never quite agreed).
    var SCROLL_KEY = "bw:galleryScrollLeft";
    var saveScroll = function () {
      sessionStorage.setItem(SCROLL_KEY, String(galleryViewport.scrollLeft));
    };
    galleryViewport.addEventListener("scroll", saveScroll, { passive: true });

    var requestedHash = window.__bwHash || "";
    var saved = sessionStorage.getItem(SCROLL_KEY);
    if (requestedHash) {
      // a specific image was requested (clicked from the grid) — always
      // honor that request over any old saved position. Wait for it to
      // finish loading first (an unloaded image has no width yet, so
      // scrollIntoView would center on the wrong box) and jump instantly
      // for a repeatable result.
      var target = document.getElementById(requestedHash.slice(1));
      if (target) {
        var targetImg = target.querySelector("img");
        var goToTarget = function () {
          target.scrollIntoView({
            behavior: "auto",
            inline: narrowGallery.matches ? "nearest" : "center",
            block: narrowGallery.matches ? "center" : "nearest",
          });
          saveScroll();
        };
        if (!targetImg || targetImg.complete) {
          requestAnimationFrame(goToTarget);
        } else {
          targetImg.addEventListener("load", function () {
            requestAnimationFrame(goToTarget);
          });
          targetImg.addEventListener("error", function () {
            requestAnimationFrame(goToTarget);
          });
        }
      }
    } else if (saved !== null && !narrowGallery.matches) {
      // no specific image requested (e.g. arrived via the nav link, or
      // back/forward) — restore exactly where the user was before
      galleryViewport.scrollLeft = parseFloat(saved);
    }
  }
})();
