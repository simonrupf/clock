'use strict';
document.addEventListener('DOMContentLoaded', function() {
    // functions
    function appendFormElements(elements, formElement) {
        elements.self.appendChild(elements.label);
        elements.self.appendChild(document.createElement('br'));
        elements.self.appendChild(formElement);
    }

    function appendOptions(target, options) {
        for (const option of options) {
            const optionElement = document.createElement('option');
            optionElement.textContent = option;
            optionElement.value = option == 'Browser Default' ? '' : option;
            target.appendChild(optionElement);
        }
    }

    function getClock(time) {
        const hour = time.getHours();
        const minute = time.getMinutes();

        const minuteAngle = minute * 6; // 360° / 60 minutes = 6° per minute
        const hourAngle = (hour % 12) * 30 + minute * 0.5; // 360° / 12 hours = 30° per hour, add .5° per minute
        const handAngle = (360 + minuteAngle - hourAngle) % 360;

        const useFullHour = minute <= 10 || minute >= 50;
        const emoji = icons[useFullHour ? 0 : 1][Math.floor(12 / 360 * handAngle)];

        let angle = (minute / 60) * 360;
        if (!useFullHour) {
            angle += 180;
        }

        return {icon: emoji, angle: angle % 360};
    }

    function hideAll() {
        for (const component of components) {
            for (const element of component.events.onHide) {
                element.style.display = 'none'
            }
        }
    }

    function hideAllEvent(event) {
        event.stopPropagation();
        hideAll();
    }

    function setEvents(component, callback) {
        component.events.onClick.push([component.elements.self, showElement(component.elements.setting)]);
        component.events.onChange.push([component.elements.setting, callback]);
        component.events.onHide.push(component.elements.setting);
    };

    function setStyles(elements, styles) {
        for (const element of elements) {
            for (const [key, value] of Object.entries(styles)) {
                element.style[key] = value;
            }
        }
    }

    function setPersistentStyles(element, styles) {
        for (const [key, value] of Object.entries(styles)) {
            localStorage.setItem(key, value);
            element.style[key] = value;
        }
    }

    function showElement(element) {
        return function(event) {
            event.stopPropagation();
            element.style.display = 'block';
        }
    }

    function update(key, valueGetter, target) {
        return function(event) {
            hideAll();
            const styles = {};
            styles[key] = valueGetter();
            setPersistentStyles(target, styles);
        }
    }

    function updateProperties(labelElement, idElement, key, labelText) {
        labelElement.textContent = labelText;
        labelElement.setAttribute('for', key);
        idElement.setAttribute('id', key);
    }

    function updateIcon() {
        const emoji = getClock(new Date());
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="48" transform="rotate(${emoji.angle} 32 32)">${emoji.icon}</text></svg>`;
        icon.href = 'data:image/svg+xml;base64,' + encoder.encode(svg).toBase64();
    }

    function updateTime() {
        const time = new Date();
        // detect pauses in execution and re-set clock
        const now = time.getTime();
        if (now > (lastUpdate + 5000)) {
            // reset animation by re-creating hands
            for (const hand in clockHands) {
                const resetHand = clockHands[hand].cloneNode(true);
                clockHands[hand].parentNode.replaceChild(resetHand, clockHands[hand]);
                clockHands[hand] = resetHand;
            }
            const minuteOffset = time.getMinutes() * 60;
            clockHands['hour'].style.animationDelay   = (time.getHours() * 3600 + minuteOffset) * -1 + 's';
            clockHands['minute'].style.animationDelay = minuteOffset * -1 + 's';
            clockHands['second'].style.animationDelay = time.getSeconds() * -1 + 's';
        }
        timeElement.textContent = time.toLocaleTimeString();
        lastUpdate = now;
    }

    // classes
    function Component(elements = {}) {
        this.elements = elements;
        this.events = {
            onClick: [],
            onChange: [],
            onHide: []
        };
        this.getValue = function() {
            return elements.setting.value;
        };
        this.setup = function() {};
        this.key = this.default = '';
        this.target = document.body;
    }

    function AboutComponent() {
        Component.call(this, {
            self: document.body.childNodes[1],
            option: document.createElement('li')
        });

        const self = this.elements.self;

        function showAbout(event) {
            hideAllEvent(event);
            self.style.display = 'block';
        }

        this.events.onClick.push([self, hideAllEvent]);
        this.events.onClick.push([this.elements.option, showAbout]);
        this.events.onHide.push(self);

        this.setup = function() {
            this.elements.option.textContent = 'About…';
        };
    }

    function AlignComponent() {
        Component.call(this, {
            self: document.createElement('li'),
            label: document.createElement('label'),
            setting: document.createElement('table')
        });

        const table = this.elements.setting;
        const key = this.key = 'justify-content_align-items';
        const target = this.target;
        this.default = 'center';

        function show(event) {
            event.stopPropagation();

            const alignmentTable = [
                [
                    {
                        symbol: '↖', hAlign: 'start', vAlign: 'start'
                    },{
                        symbol: '↑', hAlign: 'center', vAlign: 'start'
                    },{
                        symbol: '↗', hAlign: 'end', vAlign: 'start'
                    }
                ],[
                    {
                        symbol: '←', hAlign: 'start', vAlign: 'center'
                    },{
                        symbol: '✛', hAlign: 'center', vAlign: 'center'
                    },{
                        symbol: '→', hAlign: 'end', vAlign: 'center'
                    }
                ],[
                    {
                        symbol: '↙', hAlign: 'start', vAlign: 'end'
                    },{
                        symbol: '↓', hAlign: 'center', vAlign: 'end'
                    },{
                        symbol: '↘', hAlign: 'end', vAlign: 'end'
                    }
                ]
            ];
            const alignmentMap = {
                start: ['left', 'top'],
                center: ['center', 'middle'],
                end: ['right', 'bottom']
            }
            const [horizontalKey, verticalKey] = key.split('_');
            const horizontal = localStorage.getItem(horizontalKey);
            const vertical = localStorage.getItem(verticalKey);

            // clear the table and re-draw it
            table.textContent = '';
            for (const row of alignmentTable) {
                const alignTableRow = document.createElement('tr');
                for (const cell of row) {
                    const alignTableDash = document.createElement('td');
                    alignTableDash.textContent = cell.symbol;
                    setStyles([alignTableDash], {
                        'text-align': alignmentMap[cell.hAlign][0],
                        'vertical-align': alignmentMap[cell.vAlign][1]
                    });
                    if (
                        horizontal == cell.hAlign &&
                        vertical == cell.vAlign
                    ) {
                        alignTableDash.setAttribute('class', 'selected');
                    }
                    const globalStyles = {};
                    globalStyles[horizontalKey] = cell.hAlign;
                    globalStyles[verticalKey] = cell.vAlign;
                    alignTableDash.onclick = update(globalStyles);
                    alignTableRow.appendChild(alignTableDash);
                }
                table.appendChild(alignTableRow);
            }
            table.style.display = 'block';
        }

        function update(styles) {
            return function(event) {
                hideAllEvent(event);
                setPersistentStyles(target, styles);
            }
        }

        this.events.onClick.push([this.elements.self, show]);
        this.events.onHide.push(table);

        this.setup = function() {
            updateProperties(this.elements.label, table, key, 'Alignment…');
            appendFormElements(this.elements, table);
        }
    }

    function BackgroundImageComponent() {
        Component.call(this, {
            self: document.createElement('li'),
            label: document.createElement('label'),
            setting: document.createElement('input')
        });

        const input = this.elements.setting;
        const key = this.key = 'background-image';

        this.getValue = function() {
            return 'url("' + input.value + '")';
        };
        setEvents(this, update(key, this.getValue, this.target));

        this.setup = function() {
            updateProperties(this.elements.label, input, key, 'Image URL…');
            input.setAttribute('type', 'url');
            input.setAttribute('pattern', 'https://.*');
            input.setAttribute('placeholder', 'https://example.com');
            const backgroundImage = localStorage.getItem(key);
            input.value = backgroundImage ? backgroundImage.substring(5, backgroundImage.length - 2) : this.default;
            appendFormElements(this.elements, input);
        }
    }

    function ColorComponent(key, defaultValue, target) {
        Component.call(this, {
            self: document.createElement('li'),
            label: document.createElement('label'),
            setting: document.createElement('input')
        });

        const input = this.elements.setting;
        this.key = key;
        this.default = defaultValue;
        this.target = target;
        setEvents(this, update(key, this.getValue, target));

        this.setup = function() {
            updateProperties(this.elements.label, input, key, 'Color…');
            input.setAttribute('type', 'color');
            input.value = localStorage.getItem(key);
            appendFormElements(this.elements, input);
        }
    }

    function FontComponent(target) {
        Component.call(this, {
            self: document.createElement('li'),
            label: document.createElement('label'),
            setting: document.createElement('select')
        });

        const select = this.elements.setting;
        const key = this.key = 'font-family';
        this.target = target;
        setEvents(this, update(key, this.getValue, target));

        this.setup = function() {
            updateProperties(this.elements.label, select, key, 'Font…');
            appendOptions(select, ['Browser Default', 'Serif', 'Sans-Serif', 'Cursive', 'Fantasy', 'Monospace']);
            select.value = localStorage.getItem(key);
            appendFormElements(this.elements, select);
        }
    }

    function OptionComponent(target, aboutComponent, components = []) {
        Component.call(this, {
            self: document.createElement('ul')
        });

        const self = this.elements.self;

        function show(event) {
            hideAllEvent(event);
            self.appendChild(aboutComponent.elements.option);
            self.style.display = 'block';
            let positions = [20, 90];
            for (const [key, eventOffset, bodyOffset, selfOffset] of [
                [0, event.clientX, document.body.offsetWidth, self.offsetWidth],
                [1, event.clientY, document.body.offsetHeight, self.offsetHeight]
            ]) {
                let offset = eventOffset;
                if (bodyOffset < (offset + selfOffset)) {
                    offset = bodyOffset - selfOffset - positions[key];
                    if (offset < 0) {
                        offset = 0;
                    }
                }
                positions[key] = offset;
            }
            setStyles([self], {
                position: 'absolute',
                left: positions[0] + 'px',
                top: positions[1] + 'px'
            });
        }

        this.events.onClick.push([self, event => event.stopPropagation()]);
        this.events.onClick.push([target, show]);
        this.events.onHide.push(self);

        this.setup = function() {
            for (const component of components) {
                self.appendChild(component.elements.self);
            }
            document.body.appendChild(self);
        };
    }

    function SizeComponent(target) {
        Component.call(this, {
            self: document.createElement('li'),
            setting: document.createElement('fieldset'),
            input: document.createElement('input'),
            label: document.createElement('label'),
            select: document.createElement('select')
        });

        const input = this.elements.input;
        const select = this.elements.select;
        const key = this.key = 'font-size';
        this.default = '1em';
        this.target = target;

        this.getValue = function() {
            return input.value + select.value;
        };

        const updateCallback = update(key, this.getValue, target);
        setEvents(this, updateCallback);
        this.events.onChange = [
            [input, updateCallback],
            [select, updateCallback]
        ];

        this.setup = function() {
            updateProperties(this.elements.label, input, key, 'Size…');
            input.setAttribute('class', 'small');
            input.setAttribute('type', 'number');
            input.setAttribute('min', '1');
            select.setAttribute('id', key + '-unit');
            appendOptions(select, ['em', 'px', 'pt', 'cm', 'mm', 'in', 'pc', '%']);
            const fontSize = localStorage.getItem(key).match(/[a-z%]+|[0-9]+/g);
            input.value = fontSize[0];
            select.value = fontSize[1];
            this.elements.setting.appendChild(input);
            this.elements.setting.appendChild(select);
            appendFormElements(this.elements, this.elements.setting);
        }
    }

    // polyfill for Chrome
    if (typeof Uint8Array.prototype.toBase64 !== 'function') {
        Uint8Array.prototype.toBase64 = function() {
            return btoa(Array.from(this, (byte) => String.fromCodePoint(byte)).join(''));
        }
    }

    const aboutComponent = new AboutComponent();
    const backgroundColorComponent = new ColorComponent('background-color', '#ffffff', document.body);
    const backgroundImageComponent = new BackgroundImageComponent();
    const clockElement = document.createElement('div');
    const clockHands = {};
    const timeElement = document.createElement('span');
    const timeAlignComponent = new AlignComponent();
    const timeColorComponent = new ColorComponent('color', '#000000', timeElement);
    const timeFontComponent = new FontComponent(timeElement);
    const timeSizeComponent = new SizeComponent(timeElement);
    const components = [
        aboutComponent,
        backgroundColorComponent,
        backgroundImageComponent,
        new OptionComponent(document.body, aboutComponent, [
            backgroundColorComponent,
            backgroundImageComponent
        ]),
        new OptionComponent(timeElement, aboutComponent, [
            timeAlignComponent,
            timeColorComponent,
            timeFontComponent,
            timeSizeComponent
        ]),
        timeAlignComponent,
        timeColorComponent,
        timeFontComponent,
        timeSizeComponent
    ];
    const encoder = new TextEncoder();
    const icons = [
        ['🕛','🕚','🕙','🕘','🕗','🕖','🕕','🕔','🕓','🕒','🕑','🕐'],
        ['🕠','🕟','🕞','🕝','🕜','🕧','🕦','🕥','🕤','🕣','🕢','🕡']
    ];
    const icon = document.querySelector("link[rel*='icon']") || document.createElement('link');
    let lastUpdate = 0;

    // load DOM
    clockElement.className = 'clock';
    for (const hand of ['hour', 'minute', 'second']) {
        const handElement = clockElement.cloneNode();
        handElement.className = hand + ' hand';
        clockElement.appendChild(handElement);
        clockHands[hand] = handElement;
    }
    icon.rel = 'icon';
    icon.type = 'image/svg+xml';
    updateIcon();
    updateTime();
    document.body.appendChild(clockElement);
    document.body.appendChild(timeElement);
    hideAll();

    // prepare events, restore or initialize persisted styles
    setInterval(updateIcon, 60000);
    setInterval(updateTime, 1000);
    for (const component of components) {
        for (const [element, callback] of component.events.onClick) {
            element.onclick = callback;
        }
        for (const [element, callback] of component.events.onChange) {
            element.onchange = callback;
        }
        if (component.key) {
            const keys = component.key.split('_');
            for (const key of keys) {
                let value = localStorage.getItem(key);
                if (!value) {
                    localStorage.setItem(key, component.default);
                    value = component.default;
                }
                if (value) {
                    component.target.style[key] = value;
                }
            }
        }
        component.setup();
    }
});
