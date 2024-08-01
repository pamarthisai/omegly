(function(t, e) {
    "use strict";
    if (typeof t.CustomEvent !== "function") {
        t.CustomEvent = function(t, o) {
            o = o || { bubbles: false, cancelable: false, detail: undefined };
            var c = e.createEvent("CustomEvent");
            c.initCustomEvent(t, o.bubbles, o.cancelable, o.detail);
            return c;
        };
        t.CustomEvent.prototype = t.Event.prototype;
    }

    e.addEventListener("touchstart", function(t) {
        if ("true" !== t.target.getAttribute("data-swipe-ignore")) {
            n = t.target;
            s = Date.now();
            o = t.touches[0].clientX;
            c = t.touches[0].clientY;
            a = 0;
            f = 0;
            m = t.touches.length;
        }
    }, false);

    e.addEventListener("touchmove", function(t) {
        if (o && c) {
            var e = t.touches[0].clientX;
            s = t.touches[0].clientY;
            a = o - e;
            f = c - s;
        }
    }, false);

    e.addEventListener("touchend", function(t) {
        if (n === t.target) {
            var d = parseInt(g(n, "data-swipe-threshold", "20"), 10);
            var i = g(n, "data-swipe-unit", "px");
            var r = parseInt(g(n, "data-swipe-timeout", "500"), 10);
            var v = Date.now() - s;
            var l = "";
            var u = t.changedTouches || t.touches || [];

            if ("vh" === i) {
                d = Math.round(d / 100 * e.documentElement.clientHeight);
            }
            if ("vw" === i) {
                d = Math.round(d / 100 * e.documentElement.clientWidth);
            }

            if (Math.abs(a) > Math.abs(f)) {
                if (Math.abs(a) > d && v < r) {
                    l = a > 0 ? "swiped-left" : "swiped-right";
                }
            } else {
                if (Math.abs(f) > d && v < r) {
                    l = f > 0 ? "swiped-up" : "swiped-down";
                }
            }

            if (l !== "") {
                var h = {
                    dir: l.replace(/swiped-/, ""),
                    touchType: (u[0] || {}).touchType || "direct",
                    fingers: m,
                    xStart: parseInt(o, 10),
                    xEnd: parseInt((u[0] || {}).clientX || -1, 10),
                    yStart: parseInt(c, 10),
                    yEnd: parseInt((u[0] || {}).clientY || -1, 10)
                };
                n.dispatchEvent(new CustomEvent("swiped", { bubbles: true, cancelable: true, detail: h }));
                n.dispatchEvent(new CustomEvent(l, { bubbles: true, cancelable: true, detail: h }));
            }
            o = null;
            c = null;
            s = null;
        }
    }, false);

    var o = null, c = null, a = null, f = null, s = null, n = null, m = 0;

    function g(t, o, c) {
        while (t && t !== e.documentElement) {
            var a = t.getAttribute(o);
            if (a) return a;
            t = t.parentNode;
        }
        return c;
    }
}(window, document), (() => {
    const videoLocal = document.getElementById("videoLocal");
    const videoRemote = document.getElementById("videoRemote");
    const canvas = document.getElementById("canvas");
    const canvasContext = canvas ? canvas.getContext("2d") : null;
    const form = document.getElementById("form");
    const input = document.getElementById("input");
    const messages = document.getElementById("messages");
    const onlineCountElem = document.querySelector("h3");
    const startButton = document.getElementById("start");
    const standby = document.getElementById("standby");
    const liveStream = document.getElementById("liveStream");
    const stopButton = document.getElementById("stop");
    const vidOff = document.getElementById("vidoff");

    let localStream, peerId, strangerPeerId, strangerMediaStream;
    let isStreamActive = false, isRoomJoined = false, isStreamRequested = false;
    let userCountry = null;

    const emojiFlags = [
        { flag: "https://twemoji.maxcdn.com/2/svg/1f1e6-1f1e8.svg", country: "Ascension Island", code: "ac" },
        { flag: "https://twemoji.maxcdn.com/2/svg/1f1e7-1f1f6.svg", country: "Caribbean Netherlands", code: "bq" }
    ];

    const socket = io.connect("wss://omegly.icaell.com");
    const peer = new Peer();

    function appendMessage(sender, message, flag) {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <div id='server'>
                <div>
                    <img id='avatar' src='assets/img/icon.png' style="padding-top: 5px;">
                </div>
                <div style="display: inline;justify-items: center;margin-left: 10px;">
                    ${sender}
                    ${flag ? `<br> <img id='flag-stanger' src='${emojiFlags.find(e => e.country.toLowerCase() === flag.toLowerCase())?.flag || ""}' style="padding: 5px 5px 0 0;">` : ""}
                </div>
        `;
        messages.appendChild(listItem);
        messages.scrollTo(0, messages.scrollHeight);
    }

    function resizeCanvas() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    (async () => {
        try {
            const ipResponse = await fetch("https://api.ipify.org?format=json");
            const ipData = await ipResponse.json();
            const ip = ipData.ip;
            const locationResponse = await fetch(`/location/${ip}`);
            const locationData = await locationResponse.json();
            userCountry = locationData.country_name;
        } catch (error) {
            console.error("Error fetching IP or location data:", error);
        }
    })();

    socket.on("oc", (count) => {
        onlineCountElem.innerHTML = `Users online: ${count}`;
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (input.value.trim() !== "" && isStreamActive) {
            const message = input.value;
            socket.emit("message", message);
            const listItem = document.createElement("li");
            listItem.innerHTML = `<h4 id='you'>You: </h4>${message}`;
            messages.appendChild(listItem);
            input.value = "";
            messages.scrollTo(0, messages.scrollHeight);
        }
    });

    socket.on("message", (message, flag) => {
        if (flag) {
            appendMessage(message, "", flag);
        } else {
            const listItem = document.createElement("li");
            listItem.innerHTML = `<h4>Stranger: </h4>${message}`;
            messages.appendChild(listItem);
            messages.scrollTo(0, messages.scrollHeight);
        }
    });

    peer.on("open", (id) => {
        peerId = id;
    });

    socket.on("connect", () => {
        navigator.mediaDevices.getUserMedia({
            video: { width: { min: 480, max: 1280 }, aspectRatio: 1.33333 },
            audio: true
        }).then((stream) => {
            localStream = stream;
            const localVideo = document.getElementById("local-video");
            if (localVideo) {
                localVideo.srcObject = localStream;
                isStreamActive = !!localStream.active;
                if (!isStreamActive) {
                    appendMessage("Webcam not detected, please refresh page and make sure your webcam permissions are correctly set! (Chrome works best)");
                    localStream = {};
                }
            }
        }).catch((error) => {
            console.error("Error accessing media devices.", error);
            isStreamActive = false;
            appendMessage("Webcam not detected, please refresh page and make sure your webcam permissions are correctly set! (Chrome works best)");
        });
    });

    window.stopStream = function() {
        socket.emit("stop", peerId, isStreamActive);
        isStreamActive = false;
        messages.innerHTML = "";
        const remoteVideo = document.getElementById("remote-video");
        if (remoteVideo) {
            remoteVideo.srcObject = null;
        }
        isRoomJoined = false;
        vidOff.innerHTML = "";
        startButton.innerHTML = "Start";
        standby.style.display = "block";
        liveStream.style.display = "none";
        canvas.style.display = "block";
        stopButton.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
    };

    window.joinRoom = function() {
        isStreamActive = true;
        startButton.innerHTML = "Next";
        standby.style.display = "none";
        liveStream.style.display = "block";
        canvas.style.display = "block";
        stopButton.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
        appendMessage("Searching for a stranger...");
        isRoomJoined = true;
        isStreamRequested = false;
        socket.emit("join room", peerId, isStreamActive, userCountry);
        const remoteVideo = document.getElementById("remote-video");
        if (remoteVideo) {
            remoteVideo.srcObject = null;
        }
        peer.on("call", (call) => {
            call.answer(localStream);
            call.on("stream", (stream) => {
                const remoteVideo = document.getElementById("remote-video");
                if (remoteVideo) {
                    remoteVideo.srcObject = stream;
                }
            });
        });
    };

    socket.on("user joined", (countryCode, peerId, mediaStream, mediaStreamID) => {
        strangerPeerId = peerId;
        strangerMediaStream = mediaStreamID;
        socket.emit("send peerid", countryCode, peerId, mediaStreamID);
        messages.innerHTML = "";
        try {
            peer.call(strangerPeerId, localStream).on("stream", (stream) => {
                const remoteVideo = document.getElementById("remote-video");
                if (remoteVideo) {
                    remoteVideo.srcObject = stream;
                }
            });
        } catch (error) {
            appendMessage("Media connection not established due to your webcam having an issue, Chat only.");
            socket.emit("message", "Media connection not established due to stranger having a webcam error, they cannot see or hear you, Chat only.", true);
        }
        appendMessage("Connection established", mediaStreamID);
        canvas.style.display = "none";
        isStreamRequested = true;
        isRoomJoined = false;
        if (!mediaStream) {
            vidOff.innerHTML = "Stranger has no video";
        }
        userCountry = countryCode;
    });

    socket.on("other user", (countryCode, hasVideo) => {
        messages.innerHTML = "";
        isStreamRequested = true;
        isRoomJoined = false;
        canvas.style.display = "none";
        if (!hasVideo) {
            vidOff.innerHTML = "Stranger has no video";
        }
        userCountry = countryCode;
    });

    socket.on("dc", () => {
        canvas.style.display = "block";
        const remoteVideo = document.getElementById("remote-video");
        if (remoteVideo) {
            remoteVideo.srcObject = null;
        }
        isStreamRequested = false;
        messages.innerHTML = "";
        joinRoom();
    });

    socket.on("other peer", (peerId, mediaStreamID) => {
        strangerPeerId = peerId;
        strangerMediaStream = mediaStreamID;
        appendMessage("Connection established", mediaStreamID);
    });

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    let animationToggle = true;
    function animateCanvas() {
        if (animationToggle) {
            if (canvasContext) {
                const width = canvas.width;
                const height = canvas.height;
                const imageData = canvasContext.createImageData(width, height);
                const data = new Uint32Array(imageData.data.buffer);
                for (let i = 0; i < data.length; i++) {
                    data[i] = (255 * Math.random() | 0) << 24;
                }
                canvasContext.putImageData(imageData, 0, 0);
            }
        }
        animationToggle = !animationToggle;
        requestAnimationFrame(animateCanvas);
    }
    animateCanvas();

    if (videoRemote) {
        videoRemote.addEventListener("swiped-left", () => {
            joinRoom();
        });
        videoRemote.addEventListener("swiped-right", () => {
            stopStream();
        });
    }
})();
