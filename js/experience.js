// The Climb (experience.html): moves the mountain scene as you scroll.
//
// The page works without this file: visitors then see a still daytime picture
// with the tahr on the summit, and all the text. The same happens for visitors
// who prefer less motion (a setting on their phone or computer).
//
// As you scroll, this file works out how far through the story you are and hands
// that to css/experience.css as numbers between 0 and 1 (--p, --night, --sun ...).
// The CSS decides how much each mountain layer moves; the tahr's path up the
// mountain is the dotted line with id="story-trail" in experience.html.

(function () {
    "use strict";

    var story = document.getElementById("story");
    if (!story) return;

    var chapters = story.querySelectorAll(".chapter");
    var navLinks = story.querySelectorAll(".story-nav a");

    // ---------- Chapter list: mark the chapter you are reading ----------
    if ("IntersectionObserver" in window) {
        var current = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                Array.prototype.forEach.call(navLinks, function (a) {
                    if (a.getAttribute("href") === "#" + entry.target.id) a.setAttribute("aria-current", "step");
                    else a.removeAttribute("aria-current");
                });
            });
        }, { rootMargin: "-45% 0px -45% 0px" });
        Array.prototype.forEach.call(chapters, function (c) { current.observe(c); });
    }

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    document.documentElement.style.scrollBehavior = "smooth";
    story.classList.add("story-live");

    // ---------- Cards float in (in 3D) when they reach the screen ----------
    var reveal = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-in");
                reveal.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    Array.prototype.forEach.call(chapters, function (c) { reveal.observe(c); });

    // ---------- Stars (they fade out as the sun comes up) ----------
    var stars = story.querySelector(".story-stars");
    if (stars) {
        var seed = 7;
        var rand = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
        var dots = "";
        for (var i = 0; i < 70; i++) {
            dots += '<circle cx="' + Math.round(rand() * 1440) + '" cy="' + Math.round(rand() * 520) +
                '" r="' + (0.6 + rand() * 1.4).toFixed(1) + '" opacity="' + (0.4 + rand() * 0.6).toFixed(2) + '"/>';
        }
        stars.innerHTML = dots;
    }

    // ---------- Thin progress line at the top ----------
    var bar = document.createElement("div");
    bar.className = "story-progress";
    bar.setAttribute("aria-hidden", "true");
    story.appendChild(bar);

    // ---------- The scroll-driven scene ----------
    var trail = document.getElementById("story-trail");
    var climber = story.querySelector(".climber");
    var trailLength = trail && trail.getTotalLength ? trail.getTotalLength() : 0;

    function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    // 0 before "from", 1 after "to", a smooth curve in between
    function ease(from, to, v) { var t = clamp((v - from) / (to - from)); return t * t * (3 - 2 * t); }

    // Where the summit is on screen, so the camera zooms towards it on any screen shape
    function placeSummit() {
        var w = window.innerWidth, h = window.innerHeight;
        var scale = Math.max(w / 1440, h / 900);   // the scene is drawn 1440 x 900 and fills the screen
        story.style.setProperty("--oy", Math.round(h - (900 - 360) * scale) + "px");   // summit is at y=360
    }

    function moveClimber(tp) {
        if (!trailLength || !climber) return;
        var at = tp * trailLength;
        var here = trail.getPointAtLength(at);
        var ahead = trail.getPointAtLength(Math.min(trailLength, at + 2));
        var behind = trail.getPointAtLength(Math.max(0, at - 2));
        var facing = ahead.x - behind.x < 0 ? -1 : 1;
        // Little hops every 22 units along the path; feet on the ground at the top
        var hop = Math.abs(Math.sin(at / 22 * Math.PI)) * 9 * (1 - ease(0.96, 1, tp));
        climber.setAttribute("transform",
            "translate(" + here.x.toFixed(1) + " " + (here.y - hop).toFixed(1) + ") scale(" + facing + " 1)");
    }

    var lastP = -1;
    function update() {
        var rect = story.getBoundingClientRect();
        var range = story.offsetHeight - window.innerHeight;
        var p = range > 0 ? clamp(-rect.top / range) : 0;
        // Hide the progress line and chapter dots once the story has scrolled past
        story.classList.toggle("story-past", rect.bottom < window.innerHeight * 0.5);
        if (p === lastP) return;
        lastP = p;

        var tp = ease(0.14, 0.9, p);
        var s = story.style;
        s.setProperty("--p", p.toFixed(4));
        s.setProperty("--night", (1 - ease(0.06, 0.32, p)).toFixed(3));
        s.setProperty("--sun", ease(0.08, 0.45, p).toFixed(3));
        s.setProperty("--glow", (0.7 * ease(0.08, 0.3, p) * (1 - 0.5 * ease(0.35, 0.7, p))).toFixed(3));
        s.setProperty("--tp", tp.toFixed(4));
        moveClimber(tp);
    }

    var ticking = false;
    function requestUpdate() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () { ticking = false; update(); });
    }

    // ---------- Gentle 3D tilt that follows the mouse (computers only) ----------
    var mouse = { x: 0, y: 0, tx: 0, ty: 0, running: false };
    function followMouse() {
        mouse.x += (mouse.tx - mouse.x) * 0.08;
        mouse.y += (mouse.ty - mouse.y) * 0.08;
        story.style.setProperty("--mx", mouse.x.toFixed(3));
        story.style.setProperty("--my", mouse.y.toFixed(3));
        if (Math.abs(mouse.tx - mouse.x) > 0.002 || Math.abs(mouse.ty - mouse.y) > 0.002) {
            requestAnimationFrame(followMouse);
        } else {
            mouse.running = false;
        }
    }
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        window.addEventListener("pointermove", function (e) {
            mouse.tx = e.clientX / window.innerWidth * 2 - 1;
            mouse.ty = e.clientY / window.innerHeight * 2 - 1;
            if (!mouse.running) { mouse.running = true; requestAnimationFrame(followMouse); }
        }, { passive: true });
    }

    placeSummit();
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", function () { placeSummit(); lastP = -1; requestUpdate(); });
})();
