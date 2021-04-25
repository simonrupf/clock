'use strict';

document.addEventListener('DOMContentLoaded', function() {
    let lastTime;
    const timeElement = document.body.childNodes[1];

    function getTime() {
        const time = new Date();
        return time.toLocaleTimeString();
    }

    function updateTime() {
        let currentTime = getTime();
        if (lastTime != currentTime) {
            lastTime = currentTime;
            timeElement.textContent = currentTime;
        }
    }

    function updateLayout() {
        [
            document.documentElement,
            document.body,
            timeElement
        ].forEach(function(element) {
            element.style.height = '100%';
            element.style.margin = '0';
        });

        timeElement.style.display = 'flex';
        timeElement.style['justify-content'] = 'center';
        timeElement.style['align-items'] = 'center';
    }

    updateTime();
    updateLayout();
    setInterval(updateTime, 100);
});
