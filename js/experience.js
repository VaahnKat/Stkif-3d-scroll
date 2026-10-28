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

    // ---------- The tahr's walk ----------
    // Three painted leg positions (legs apart, half way, together). As the tahr moves
    // along the trail the picture blends from one to the next and back, tied to the
    // distance travelled: scroll slowly and it walks slowly, stop and it stops.
    var HALF_STRIDE = 30;   // distance along the trail from legs apart to legs together and back
    var frames = climber ? climber.querySelectorAll(".tahr-frame") : [];
    var photo = climber && climber.querySelector(".tahr-photo");
    var turn = climber && climber.querySelector(".tahr-turn");
    var lean = climber && climber.querySelector(".tahr-lean");

    // pose: 0 = legs apart, 1 = half way, 2 = legs together (standing)
    function showPose(pose) {
        var k = Math.min(Math.floor(pose), frames.length - 2);
        Array.prototype.forEach.call(frames, function (f, i) {
            var o = i === k ? 1 : i === k + 1 ? pose - k : 0;   // the later frame fades in on top
            f.setAttribute("opacity", o.toFixed(2));
        });
    }

    var facing = 1;
    function moveClimber(tp) {
        if (!trailLength || !climber) return;
        var at = tp * trailLength;
        var here = trail.getPointAtLength(at);
        var ahead = trail.getPointAtLength(Math.min(trailLength, at + 2));
        var behind = trail.getPointAtLength(Math.max(0, at - 2));
        if (Math.abs(ahead.x - behind.x) > 0.01) facing = ahead.x - behind.x < 0 ? -1 : 1;

        // Lean into the slope: nose up when climbing (smoothed around the bends)
        var a = trail.getPointAtLength(Math.max(0, at - 12));
        var b = trail.getPointAtLength(Math.min(trailLength, at + 12));
        var slope = Math.atan2(b.y - a.y, Math.abs(b.x - a.x) || 0.001) * 180 / Math.PI;
        var leanDeg = Math.max(-20, Math.min(20, slope * 0.45));

        // Walk while climbing; stand still with legs together at the start and on the summit
        var amount = ease(0, 0.02, tp) * (1 - ease(0.97, 1, tp));
        var u = (at / HALF_STRIDE) % 2;                 // 0..2: apart -> together -> apart
        var walkPose = u <= 1 ? u * 2 : (2 - u) * 2;
        showPose(2 + (walkPose - 2) * amount);

        climber.setAttribute("transform", "translate(" + here.x.toFixed(1) + " " + here.y.toFixed(1) + ")");
        if (turn) turn.style.transform = "scaleX(" + facing + ")";
        if (lean) lean.setAttribute("transform", "rotate(" + (leanDeg * (1 - ease(0.97, 1, tp))).toFixed(1) + ")");
        // the body rises a little as the legs come together
        if (photo) photo.setAttribute("transform", "translate(0 " + (-1.2 * Math.sin(u * Math.PI) * amount).toFixed(2) + ")");
    }

    // Keep the greeting bubble just above the tahr's head
    var bubble = story.querySelector(".summit-bubble");
    function placeBubble() {
        if (!bubble || !climber) return;
        var box = climber.getBoundingClientRect();
        var stage = story.querySelector(".story-stage").getBoundingClientRect();
        bubble.style.left = Math.round(box.left + box.width / 2 - stage.left) + "px";
        bubble.style.top = Math.round(box.top - stage.top - 8) + "px";
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

        // Each part of the scene has its own stretch of the story (0 = top, 1 = bottom)
        var tp = ease(0.1, 0.92, p);
        var birds = clamp((p - 0.06) / 0.4);
        var s = story.style;
        s.setProperty("--p", p.toFixed(4));
        s.setProperty("--night", (1 - ease(0.03, 0.22, p)).toFixed(3));
        s.setProperty("--sun", ease(0.05, 0.32, p).toFixed(3));
        s.setProperty("--glow", (0.7 * ease(0.05, 0.22, p) * (1 - 0.5 * ease(0.3, 0.6, p))).toFixed(3));
        s.setProperty("--tp", tp.toFixed(4));
        s.setProperty("--birds", birds.toFixed(4));
        s.setProperty("--birdsop", (ease(0, 0.1, birds) * (1 - ease(0.85, 1, birds))).toFixed(3));
        moveClimber(tp);

        // At the top: sparkles, a jump of joy and a "Vanakkam!" (css/experience.css)
        var reached = tp > 0.995;
        story.classList.toggle("summit-reached", reached);
        if (reached) placeBubble();
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
