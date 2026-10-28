// The Climb (experience.html): moves the mountain scene as you scroll.
//
// The page works without this file: visitors then see a still daytime picture
// with the tahr on the summit, and all the text. The same happens for visitors
// who prefer less motion (a setting on their phone or computer).
//
// As you scroll, this file works out how far through the story you are and hands
// that to css/experience.css as numbers between 0 and 1 (--p, --night, --sun ...).
// The CSS decides how much each mountain layer moves; the tahr's path up the
// ridge is the invisible line with id="story-trail" in experience.html.

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

    // ---------- Pines, clouds and kites load once the main scene is in ----------
    var extrasLoaded = false;
    function loadExtras() {
        if (extrasLoaded) return;
        extrasLoaded = true;
        Array.prototype.forEach.call(story.querySelectorAll("img[data-src]"), function (img) {
            img.src = img.getAttribute("data-src");
        });
        story.classList.add("story-extras");
    }

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) { loadExtras(); return; }
    setTimeout(loadExtras, 6000);   // in any case, soon after the loading screen's safety net

    document.documentElement.style.scrollBehavior = "smooth";
    story.classList.add("story-live");

    // ---------- Loading screen: wait for the paintings, then lift it ----------
    var loader = document.querySelector(".story-loader");
    if (loader) {
        var sources = ["sky-day", "mountains-far", "hills-mid", "ridge-near", "tahr-body", "tahr-head"];
        var count = 0;
        var finish = function () { loader.classList.add("is-done"); loadExtras(); };
        Promise.all(sources.map(function (name) {
            var img = new Image();
            img.src = "images/story/" + name + ".webp";
            return (img.decode ? img.decode() : Promise.resolve()).catch(function () {}).then(function () {
                count++;
                loader.style.setProperty("--loaded", count / sources.length);
            });
        })).then(function () { setTimeout(finish, 250); });
    }

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
    // the same "random" sky every visit
    var seed = 7;
    function rand() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }

    var stars = story.querySelector(".story-stars");
    if (stars) {
        var dots = "";
        for (var i = 0; i < 70; i++) {
            dots += '<circle cx="' + Math.round(rand() * 1440) + '" cy="' + Math.round(rand() * 520) +
                '" r="' + (0.6 + rand() * 1.4).toFixed(1) + '" opacity="' + (0.4 + rand() * 0.6).toFixed(2) + '"/>';
        }
        stars.innerHTML = dots;
    }

    // ---------- Dust and pollen drifting in the light (more of them on the sun's side) ----------
    var motes = story.querySelector(".story-motes");
    if (motes) {
        var html = "";
        for (var m = 0; m < 14; m++) {
            var x = Math.pow(rand(), 0.7) * 100;                 // lean towards the right, where the sun is
            html += '<span class="mote" style="left:' + x.toFixed(1) + '%;top:' + (34 + rand() * 56).toFixed(1) +
                '%;--s:' + (5 + rand() * 9).toFixed(1) + 'px;--d:' + (7 + rand() * 9).toFixed(1) +
                's;--delay:' + (-rand() * 16).toFixed(1) + 's;--dx:' + (-40 + rand() * 80).toFixed(0) + 'px"></span>';
        }
        motes.innerHTML = html;
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

    // The scene is drawn 1440 x 900 and fills the screen (centred, anchored to the bottom).
    // The camera pushes in towards the summit of the near ridge, so find it on screen.
    var SUMMIT = { x: 767, y: 403 };
    var view = { scale: 1, half: 720 };
    function placeSummit() {
        var w = window.innerWidth, h = window.innerHeight;
        view.scale = Math.max(w / 1440, h / 900);
        view.half = w / view.scale / 2;                          // half the visible width, in scene units
        story.style.setProperty("--ox", Math.round(w / 2 + (SUMMIT.x - 720) * view.scale) + "px");
        story.style.setProperty("--oy", Math.round(h - (900 - SUMMIT.y) * view.scale) + "px");
    }

    // On narrow screens the path is wider than the screen: slide the scene sideways
    // just enough to keep the tahr in view, like a camera following it.
    function panTo(x, zoom) {
        var margin = Math.min(140, view.half * 0.3);
        var onScreen = SUMMIT.x + (x - SUMMIT.x) * zoom;         // where the zoomed ridge puts it
        var lo = 720 - view.half + margin, hi = 720 + view.half - margin, pan = 0;
        if (onScreen < lo) pan = lo - onScreen;
        else if (onScreen > hi) pan = hi - onScreen;
        // never so far that the left edge of the ridge painting (x = -108) comes into view
        var ridgeLeft = SUMMIT.x + (-108 - SUMMIT.x) * zoom;
        pan = Math.min(pan, (720 - view.half) - ridgeLeft - 4);
        story.style.setProperty("--pan-x", (pan * view.scale).toFixed(1) + "px");
    }

    // On phones the summit card fills the lower half, so for the last stretch the camera
    // tilts down a little and the summit rises into the top of the screen.
    function liftSummit(p) {
        var lift = view.half < 400 ? ease(0.8, 1, p) * 170 : 0;
        story.style.setProperty("--pan-y", (-lift * view.scale).toFixed(1) + "px");
    }

    // ---------- The tahr's walk ----------
    // The tahr is built from painted parts. Each leg has an upper and a lower part that
    // swing in a real four-beat walk (left hind, left fore, right hind, right fore).
    // The walk is tied to the distance travelled, so the hooves don't slide: scroll slowly
    // and the tahr walks slowly; stop scrolling and it stops mid-step.
    var STRIDE = 37;   // distance along the trail covered by one full stride
    var LEGS = { nh: 0, nf: 0.25, fh: 0.5, ff: 0.75 };
    var legParts = {};
    var body = climber && climber.querySelector(".tahr-body");
    var turn = climber && climber.querySelector(".tahr-turn");
    var lean = climber && climber.querySelector(".tahr-lean");
    Object.keys(LEGS).forEach(function (k) {
        var leg = climber && climber.querySelector(".leg-" + k);
        if (!leg) return;
        var low = leg.querySelector(".seg-low");
        legParts[k] = { top: leg.querySelector(".seg-top"), low: low, lowBase: low.getAttribute("transform") };
    });

    function legAngles(k, cycle, amount) {
        var c = ((cycle + LEGS[k]) % 1 + 1) % 1;
        var hind = k.charAt(1) === "h";
        var reach = hind ? 16 : 17;
        var top, low = 0;
        if (c < 0.62) {
            top = -reach + 2 * reach * (c / 0.62);                    // hoof on the ground, pushing back
        } else {
            var w = (c - 0.62) / 0.38;                                  // hoof lifted, swinging forward
            top = reach - 2 * reach * (0.5 - 0.5 * Math.cos(Math.PI * w));
            low = Math.sin(Math.PI * w) * (hind ? -28 : 44);            // knee or hock bends to lift the hoof
        }
        return { top: top * amount, low: low * amount };
    }

    // ---------- Turning at the bends ----------
    // Find the hairpin bends (where the path swaps from going left to going right, or back),
    // measured as distance along the path.
    var bends = [];
    (function () {
        var nums = (trail ? trail.getAttribute("d") : "").match(/-?[\d.]+/g) || [];
        var pts = [];
        for (var i = 0; i + 1 < nums.length; i += 2) pts.push([+nums[i], +nums[i + 1]]);
        var along = 0;
        for (var j = 1; j < pts.length - 1; j++) {
            along += Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]);
            var before = pts[j][0] - pts[j - 1][0], after = pts[j + 1][0] - pts[j][0];
            if (before * after < 0) bends.push(along);
        }
    })();
    var TURN = 11;   // how far before and after a bend the turn takes (in path units)

    // 0 right at a bend, 1 once clear of it
    function clearOfBend(at) {
        var d = Infinity;
        for (var i = 0; i < bends.length; i++) d = Math.min(d, Math.abs(at - bends[i]));
        return d >= TURN ? 1 : ease(0, 1, d / TURN);
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

        // Further up the ridge is further from the camera, so the tahr looks smaller
        var size = 0.72 + 0.43 * clamp((here.y - SUMMIT.y) / (760 - SUMMIT.y));

        // At a bend the tahr turns its body towards the camera (it looks narrower, as seen
        // end-on) and takes short steps, then faces the new way. Tied to the scroll, so it
        // turns back if you scroll back.
        var clear = clearOfBend(at);
        var turnWidth = 0.58 + 0.42 * clear;

        // Walk while climbing; settle into a still stance on the start and the summit
        var amount = ease(0, 0.02, tp) * (1 - ease(0.97, 1, tp)) * (0.35 + 0.65 * clear);
        var cycle = at / (STRIDE * size);
        climber.setAttribute("transform", "translate(" + here.x.toFixed(1) + " " + here.y.toFixed(1) + ") scale(" + size.toFixed(3) + ")");
        if (turn) turn.setAttribute("transform", "scale(" + (facing * turnWidth).toFixed(3) + " 1)");
        if (lean) lean.setAttribute("transform", "rotate(" + (leanDeg * (1 - ease(0.97, 1, tp))).toFixed(1) + ")");
        // the body rises and dips a little with each step (in the parts' own units)
        if (body) body.setAttribute("transform", "translate(0 " + (-14 * Math.cos(cycle * 4 * Math.PI) * amount).toFixed(1) + ")");
        Object.keys(legParts).forEach(function (k) {
            var ang = legAngles(k, cycle, amount), part = legParts[k];
            part.top.setAttribute("transform", "rotate(" + ang.top.toFixed(1) + ")");
            part.low.setAttribute("transform", part.lowBase + " rotate(" + ang.low.toFixed(1) + ")");
        });
        return here.x;
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

    // ---------- Smooth glide ----------
    // The page scrolls normally, but the scene eases towards the scroll position instead
    // of jumping to it, so a mouse-wheel step or a flick on a phone becomes a smooth glide.
    var GLIDE = 7;          // higher = follows the scroll more tightly (per second)
    var shown = -1;         // the progress the scene is showing right now
    var target = 0;         // the progress the scroll position asks for
    var lastTime = 0, gliding = false;

    function readScroll() {
        var rect = story.getBoundingClientRect();
        var range = story.offsetHeight - window.innerHeight;
        target = range > 0 ? clamp(-rect.top / range) : 0;
        // Hide the progress line and chapter dots once the story has scrolled past
        story.classList.toggle("story-past", rect.bottom < window.innerHeight * 0.5);
    }

    function glide(now) {
        var dt = lastTime ? Math.min(0.1, (now - lastTime) / 1000) : 0.016;
        lastTime = now;
        if (shown < 0) shown = target;
        shown += (target - shown) * (1 - Math.exp(-GLIDE * dt));
        if (Math.abs(target - shown) < 0.0002) shown = target;
        render(shown);
        if (shown !== target) { requestAnimationFrame(glide); } else { gliding = false; lastTime = 0; }
    }

    function requestUpdate() {
        readScroll();
        if (!gliding) { gliding = true; requestAnimationFrame(glide); }
    }

    function render(p) {

        // Each part of the scene has its own stretch of the story (0 = top, 1 = bottom)
        var tp = ease(0.1, 0.92, p);
        var birds = clamp((p - 0.06) / 0.4);
        var s = story.style;
        s.setProperty("--p", p.toFixed(4));
        s.setProperty("--night", (1 - ease(0.03, 0.22, p)).toFixed(3));
        s.setProperty("--sun", ease(0.05, 0.32, p).toFixed(3));
        s.setProperty("--dawn", (ease(0.02, 0.12, p) * (1 - ease(0.2, 0.42, p))).toFixed(3));
        s.setProperty("--glow", (0.7 * ease(0.05, 0.22, p) * (1 - 0.5 * ease(0.3, 0.6, p))).toFixed(3));
        s.setProperty("--tp", tp.toFixed(4));
        s.setProperty("--birds", birds.toFixed(4));
        s.setProperty("--birdsop", (ease(0, 0.1, birds) * (1 - ease(0.85, 1, birds))).toFixed(3));
        var tahrX = moveClimber(tp);
        if (tahrX !== undefined) panTo(tahrX, 1 + p * 0.32);   // 0.32: how much .story-near grows (css)
        liftSummit(p);

        // At the top: the summit pose, the waving flag and a "Vanakkam!" (css/experience.css)
        var reached = tp > 0.995;
        story.classList.toggle("summit-reached", reached);
        if (reached) placeBubble();
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
    readScroll();
    shown = target;          // start exactly where the page opened, no glide
    render(shown);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", function () { placeSummit(); requestUpdate(); render(shown); });
})();
