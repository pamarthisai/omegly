(function (t, e) {
    "use strict";
    "function" != typeof t.CustomEvent && (t.CustomEvent = function (t, o) {
        o = o || {
            bubbles: !1,
            cancelable: !1,
            detail: void 0
        };
        var c = e.createEvent("CustomEvent");
        return c.initCustomEvent(t, o.bubbles, o.cancelable, o.detail), c
    }, t.CustomEvent.prototype = t.Event.prototype), e.addEventListener("touchstart", (function (t) {
        "true" !== t.target.getAttribute("data-swipe-ignore") && (n = t.target, s = Date.now(), o = t.touches[0].clientX, c = t.touches[0].clientY, a = 0, f = 0, m = t.touches.length)
    }), !1), e.addEventListener("touchmove", (function (t) {
        if (o && c) {
            var e = t.touches[0].clientX,
                s = t.touches[0].clientY;
            a = o - e, f = c - s
        }
    }), !1), e.addEventListener("touchend", (function (t) {
        if (n === t.target) {
            var d = parseInt(g(n, "data-swipe-threshold", "20"), 10),
                i = g(n, "data-swipe-unit", "px"),
                r = parseInt(g(n, "data-swipe-timeout", "500"), 10),
                v = Date.now() - s,
                l = "",
                u = t.changedTouches || t.touches || [];
            if ("vh" === i && (d = Math.round(d / 100 * e.documentElement.clientHeight)), "vw" === i && (d = Math.round(d / 100 * e.documentElement.clientWidth)), Math.abs(a) > Math.abs(f) ? Math.abs(a) > d && v < r && (l = a > 0 ? "swiped-left" : "swiped-right") : Math.abs(f) > d && v < r && (l = f > 0 ? "swiped-up" : "swiped-down"), "" !== l) {
                var h = {
                    dir: l.replace(/swiped-/, ""),
                    touchType: (u[0] || {}).touchType || "direct",
                    fingers: m,
                    xStart: parseInt(o, 10),
                    xEnd: parseInt((u[0] || {}).clientX || -1, 10),
                    yStart: parseInt(c, 10),
                    yEnd: parseInt((u[0] || {}).clientY || -1, 10)
                };
                n.dispatchEvent(new CustomEvent("swiped", {
                    bubbles: !0,
                    cancelable: !0,
                    detail: h
                })), n.dispatchEvent(new CustomEvent(l, {
                    bubbles: !0,
                    cancelable: !0,
                    detail: h
                }))
            }
            o = null, c = null, s = null
        }
    }), !1);
    var o = null,
        c = null,
        a = null,
        f = null,
        s = null,
        n = null,
        m = 0;

    function g(t, o, c) {
        for (; t && t !== e.documentElement;) {
            var a = t.getAttribute(o);
            if (a) return a;
            t = t.parentNode
        }
        return c
    }
})(window, document), (() => {
    document.getElementById("videoLocal");
    let t, e, o, c, a, f, s = document.getElementById("videoRemote");
    var n = document.getElementById("canvas");
    var m = n ? n.getContext("2d") : null;
    document.getElementById("vid");
    let g, d = document.getElementById("form"),
        i = document.getElementById("input"),
        r = document.getElementById("messages"),
        v = document.querySelector("h3"),
        l = document.getElementById("start"),
        u = !1,
        h = !1,
        y = !1;
    var p = [{
        flag: "https://twemoji.maxcdn.com/2/svg/1f1e6-1f1e8.svg",
        country: "Ascension Island",
        code: "ac"
    },
    {
        flag: "https://twemoji.maxcdn.com/2/svg/1f1e7-1f1f6.svg",
        country: "Caribbean Netherlands",
        code: "bq"
    }];
    const w = io.connect("wss://omegly.icaell.com"),
        j = new Peer;

    function x(t, e) {
        let o = document.createElement("li");
        o.innerHTML = `<div id='server'>\n    <div>\n      <img id='avatar' src='assets/img/icon.png' style="padding-top: 5px;">\n    </div>\n  <div style="display: inline;justify-items: center;margin-left: 10px;">\n    ${t}${e ? `<br> <img id='flag-stanger' src=${function (t) { if (!t) return ""; for (var e = 0; e < p.length; e++) if (p[e].country && p[e].country.toLowerCase() === t.toLowerCase()) return p[e].flag; return "" }(e)} style="padding: 5px 5px 0 0;">` + e : ""}\n  </div>`;
        messages.appendChild(o), r.scrollTo(0, r.scrollHeight)
    }

    function b() {
        if (n) {
            n.width = window.innerWidth;
            n.height = window.innerHeight;
        }
    } (async () => {
        const t = await (async () => {
            const t = await fetch("https://api.ipify.org?format=json");
            return (await t.json()).ip
        })(),
            e = await (async t => {
                const e = `/location/${t}`,
                    o = await fetch(e);
                return (await o.json()).country_name
            })(t);
        c = e
    })(), w.on("oc", (t => {
        v.innerHTML = "Users online: " + t
    })), d.addEventListener("submit", (function (t) {
        if (t.preventDefault(), "" !== i.value && h) {
            let t = i.value;
            w.emit("message", t);
            let e = document.createElement("li");
            e.innerHTML = "<h4 id='you'>You: </h4>" + t, messages.appendChild(e), i.value = "", r.scrollTo(0, r.scrollHeight)
        }
    })), w.on("message", (function (t, e) {
        e ? x(t) : function (t) {
            let e = document.createElement("li");
            e.innerHTML = "<h4>Stranger: </h4>" + t, messages.appendChild(e), r.scrollTo(0, r.scrollHeight)
        }(t)
    })), j.on("open", (t => {
        o = t
    })), w.on("connect", (() => {
        navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia, navigator.mediaDevices.getUserMedia({
            video: {
                width: {
                    min: 480,
                    max: 1280
                },
                aspectRatio: 1.33333
            },
            audio: !0
        }).then((e => {
            t = e, document.getElementById("local-video").srcObject = t, t.active ? g = !0 : (g = !1, x("Webcam not detected, please refresh page and make sure your webcam permission are correctly set! (Chrome works best)"), t = {})
        })).catch((t => {
            console.error("Error accessing media devices.", t), g = !1, x("Webcam not detected, please refresh page and make sure your webcam permission are correctly set! (Chrome works best)")
        }))
    })), window.stopStream = function () {
        w.emit("stop", o, g), u = !1, r.innerHTML = "", document.getElementById("remote-video").srcObject = void 0, h = !1, document.getElementById("vidoff").innerHTML = "", l.innerHTML = "Start", document.getElementById("standby").style.display = "block", document.getElementById("liveStream").style.display = "none", document.getElementById("canvas").style.display = "block", document.getElementById("stop").style.backgroundColor = "rgba(255, 0, 0, 0.2)"
    }, window.joinRoom = function () {
        u = !0, l.innerHTML = "Next", document.getElementById("standby").style.display = "none", document.getElementById("liveStream").style.display = "block", document.getElementById("canvas").style.display = "block", document.getElementById("stop").style.backgroundColor = "rgba(255, 0, 0, 0.5)", x("Searching for a stranger..."), y = !0, h = !1, w.emit("join room", o, g, c), document.getElementById("remote-video").srcObject = void 0, j.on("call", (e => {
            e.answer(t), e.on("stream", (t => {
                document.getElementById("remote-video").srcObject = t
            }))
        }))
    }, w.on("user joined", ((c, s, n, m) => {
        a = s, f = m, w.emit("send peerid", c, o, m), r.innerHTML = "";
        try {
            !function (t, e) {
                const o = j.call(t, e);
                o.on("stream", (t => {
                    document.getElementById("remote-video").srcObject = t
                }))
            }(s, t)
        } catch (t) {
            x("Media connection not established due to your webcam having an issue, Chat only."), w.emit("message", "Media connection not established due to stranger having a webcam error, He cannot see or hear you, Chat only.", !0)
        }
        x("Connection estabilished", m), document.getElementById("canvas").style.display = "none", h = !0, y = !1, n || (document.getElementById("vidoff").innerHTML = "Stranger has no video"), e = c
    })), w.on("other user", ((t, o) => {
        r.innerHTML = "", h = !0, y = !1, document.getElementById("canvas").style.display = "none", o || (document.getElementById("vidoff").innerHTML = "Stranger has no video"), e = t
    })), w.on("dc", (t => {
        document.getElementById("canvas").style.display = "block", document.getElementById("remote-video").srcObject = void 0, h = !1, r.innerHTML = "", joinRoom()
    })), w.on("other peer", ((t, e) => {
        a = t, f = e, x("Connection estabilished", e)
    })), document.querySelectorAll("span"), b(), window.onresize = b;
    var I = !0;
    !function t() {
        (I = !I) || function (t) {
            if (t) {
                for (var e = t.canvas.width, o = t.canvas.height, c = t.createImageData(e, o), a = new Uint32Array(c.data.buffer), f = a.length, s = 0; s < f;) a[s++] = (255 * Math.random() | 0) << 24;
                t.putImageData(c, 0, 0)
            }
        }(m), requestAnimationFrame(t)
    }(), s.addEventListener("swiped-left", (function (t) {
        joinRoom()
    })), s.addEventListener("swiped-right", (function (t) {
        stopStream()
    }))
})();
