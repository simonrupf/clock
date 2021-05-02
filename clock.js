'use strict';

document.addEventListener('DOMContentLoaded', function() {
    // functions
    function hideAll() {
        for (const component of components) {
            for (const element of component.events.onHide) {
                element.style.display = 'none'
            }
        }
        for (const element of [
            backgroundColorInputElement,
            timeAlignTableElement,
            timeColorInputElement,
            timeSizeSetElement
        ]) {
            element.style.display = 'none'
        }
    }

    function hideAllEvent(event) {
        event.stopPropagation();
        hideAll();
    }

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

    function showTimeAlignOptions() {
        event.stopPropagation();

        const alignmentTable = [
            [
                {
                    symbol: '⭶',
                    hAlign: 'start',
                    vAlign: 'start'
                },{
                    symbol: '⭱',
                    hAlign: 'center',
                    vAlign: 'start'
                },{
                    symbol: '⭷',
                    hAlign: 'end',
                    vAlign: 'start'
                }
            ],[
                {
                    symbol: '⭰',
                    hAlign: 'start',
                    vAlign: 'center'
                },{
                    symbol: '✛',
                    hAlign: 'center',
                    vAlign: 'center'
                },{
                    symbol: '⭲',
                    hAlign: 'end',
                    vAlign: 'center'
                }
            ],[
                {
                    symbol: '⭹',
                    hAlign: 'start',
                    vAlign: 'end'
                },{
                    symbol: '⭳',
                    hAlign: 'center',
                    vAlign: 'end'
                },{
                    symbol: '⭸',
                    hAlign: 'end',
                    vAlign: 'end'
                }
            ]
        ];
        const alignmentMap = {
            start: ['left', 'top'],
            center: ['center', 'middle'],
            end: ['right', 'bottom']
        }
        const horizontal = localStorage.getItem('justify-content');
        const vertical = localStorage.getItem('align-items');

        // clear table and re-draw it
        timeAlignTableElement.textContent = '';
        for (const row of alignmentTable) {
            const alignTableRow = document.createElement('tr');
            for (const cell of row) {
                const alignTableDash = document.createElement('td');
                alignTableDash.textContent = cell.symbol;
                const dashStyles = Object.assign({}, styles.dash);
                dashStyles['text-align'] = alignmentMap[cell.hAlign][0];
                dashStyles['vertical-align'] = alignmentMap[cell.vAlign][1];
                if (
                    horizontal == cell.hAlign &&
                    vertical == cell.vAlign
                ) {
                    Object.assign(dashStyles, styles.dashSelected);
                }
                setStyles([alignTableDash], dashStyles);
                alignTableDash.onclick = updateAlignment(cell.hAlign, cell.vAlign);
                alignTableRow.appendChild(alignTableDash);
            }
            timeAlignTableElement.appendChild(alignTableRow);
        }
        timeAlignTableElement.style.display = 'block';
    }

    function updateAlignment(horizontal, vertical) {
        return function(event) {
            event.stopPropagation();
            hideAll();
            setPersistentStyles(document.body, {
                'justify-content': horizontal,
                'align-items': vertical
            });
        }
    }

    function updateColor(targetElement, colorPickerElement, itemKey) {
        return function(event) {
            hideAll();
            const styles = {};
            styles[itemKey] = colorPickerElement.value;
            setPersistentStyles(targetElement, styles);
        }
    }

    function updateSize() {
        setPersistentStyles(timeElement, {
            'font-size': timeSizeInputElement.value + timeSizeSelectElement.value
        });
    }

    function updateTime() {
        timeElement.textContent = (new Date()).toLocaleTimeString();
    }

    function updateLayout() {
        // styles
        setStyles([document.documentElement, document.body], styles.root);
        setStyles([document.body], styles.body);
        setStyles([timeSizeSetElement], styles.fieldgroup);
        timeElement.style.margin = '1em';

        // restore or initialize persisted styles
        const persistedStyles = [
            ['align-items', 'center', document.body],
            ['justify-content', 'center', document.body],
            ['color', '#000000', timeElement],
            ['background-color', '#ffffff', document.body],
            ['font-family', '', timeElement],
            ['font-size', '1em', timeElement]
        ];
        for (const component of components) {
            if (component.key) {
                persistedStyles.push([component.key, component.default, component.target]);
            }
        }
        for (const [key, defaultValue, element] of persistedStyles) {
            let value = localStorage.getItem(key);
            if (!value) {
                localStorage.setItem(key, defaultValue);
                value = defaultValue;
            }
            if (value) {
                element.style[key] = value;
            }
        }

        // text
        timeAlignElement.textContent = 'Alignment…';
        backgroundColorLabelElement.textContent = timeColorLabelElement.textContent = 'Color…';
        timeSizeLabelElement.textContent = 'Size…';

        // color picker
        for (const [pickerId, itemKey, labelElement, inputElement, colorElement] of [
            ['backgroundColor', 'background-color', backgroundColorLabelElement, backgroundColorInputElement, backgroundColorElement],
            ['timeColor', 'color', timeColorLabelElement, timeColorInputElement, timeColorElement]
        ]) {
            labelElement.setAttribute('for', pickerId);
            inputElement.setAttribute('id', pickerId);
            inputElement.setAttribute('type', 'color');
            inputElement.value = localStorage.getItem(itemKey);
            colorElement.appendChild(labelElement);
            colorElement.appendChild(document.createElement('br'));
            colorElement.appendChild(inputElement);
        }

        // size
        timeSizeLabelElement.setAttribute('for', 'timeSizeAmount');
        timeSizeInputElement.setAttribute('id', 'timeSizeAmount');
        timeSizeInputElement.setAttribute('type', 'number');
        timeSizeInputElement.setAttribute('min', '1');
        timeSizeInputElement.style.width = '3em';
        timeSizeInputElement.style['text-align'] = 'right';
        timeSizeSelectElement.setAttribute('id', 'timeSizeUnit');
        for (const unit of ['em', 'px', 'pt', 'cm', 'mm', 'in', 'pc', '%']) {
            const timeSizeOptionElement = document.createElement('option');
            timeSizeOptionElement.textContent = unit;
            timeSizeOptionElement.value = unit;
            timeSizeSelectElement.appendChild(timeSizeOptionElement);
        }
        const fontSize = localStorage.getItem('font-size').match(/[a-z%]+|[0-9]+/g);
        timeSizeInputElement.value = fontSize[0];
        timeSizeSelectElement.value = fontSize[1];
        timeSizeSetElement.appendChild(timeSizeInputElement);
        timeSizeSetElement.appendChild(timeSizeSelectElement);
        timeSizeElement.appendChild(timeSizeLabelElement);
        timeSizeElement.appendChild(document.createElement('br'));
        timeSizeElement.appendChild(timeSizeSetElement);

        // menus
        timeAlignElement.appendChild(timeAlignTableElement);
    }

    // classes
    function Component(elements = {}) {
        this.elements = elements;
        this.events = {
            onClick: [],
            onChange: [],
            onHide: []
        };
        this.setup = function() {};
        this.key = this.default = '';
        this.target = document.body;
    }

    function AboutComponent(styles) {
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
            setStyles([self], styles);
            this.elements.option.textContent = 'About…';
        };
    }

    function BackgroundImageComponent() {
        Component.call(this, {
            self: document.createElement('li'),
            label: document.createElement('label'),
            input: document.createElement('input')
        });

        const input = this.elements.input;
        const key = this.key = 'background-image';

        function update() {
            hideAll();
            const styles = {};
            styles[key] = 'url("' + input.value + '")';
            setPersistentStyles(document.body, styles);
        }

        this.events.onClick.push([this.elements.self, showElement(this.elements.input)]);
        this.events.onChange.push([input, update]);
        this.events.onHide.push(input);

        this.setup = function() {
            this.elements.label.textContent = 'Image URL…';
            this.elements.label.setAttribute('for', 'backgroundImage');
            input.setAttribute('id', 'backgroundImage');
            input.setAttribute('type', 'url');
            input.setAttribute('pattern', 'https://.*');
            input.setAttribute('placeholder', 'https://example.com');
            const backgroundImage = localStorage.getItem(key);
            input.value = backgroundImage ? backgroundImage.substring(5, backgroundImage.length - 2) : this.default;
            this.elements.self.appendChild(this.elements.label);
            this.elements.self.appendChild(document.createElement('br'));
            this.elements.self.appendChild(input);
        }
    }

    function FontComponent(targetElement) {
        Component.call(this, {
            self: document.createElement('li'),
            label: document.createElement('label'),
            select: document.createElement('select')
        });

        const select = this.elements.select;
        const key = this.key = 'font-family';

        function update() {
            hideAll();
            const styles = {};
            styles[key] = select.value;
            setPersistentStyles(targetElement, styles);
        }

        this.events.onClick.push([this.elements.label, showElement(this.elements.select)]);
        this.events.onChange.push([select, update]);
        this.events.onHide.push(select);

        this.setup = function() {
            this.elements.label.textContent = 'Font…';
            this.elements.label.setAttribute('for', 'timeFont');
            this.elements.select.setAttribute('id', 'timeFont');
            for (const fontFamily of ['Browser Default', 'Serif', 'Sans-Serif', 'Cursive', 'Fantasy', 'Monospace']) {
                const timeFontOptionElement = document.createElement('option');
                timeFontOptionElement.textContent = fontFamily;
                timeFontOptionElement.value = fontFamily == 'Browser Default' ? this.default : fontFamily;
                this.elements.select.appendChild(timeFontOptionElement);
            }
            this.elements.select.value = localStorage.getItem(key);
            this.elements.self.appendChild(this.elements.label);
            this.elements.self.appendChild(document.createElement('br'));
            this.elements.self.appendChild(this.elements.select);
        }
    }

    function OptionComponent(styles, targetElement, aboutOptionElement, options = []) {
        Component.call(this, {
            self: document.createElement('ul')
        });

        const self = this.elements.self;

        function show(event) {
            event.stopPropagation();
            hideAll();
            self.appendChild(aboutOptionElement);
            self.style.display = 'block';
            let left = event.clientX;
            let top = event.clientY;
            if (document.body.offsetWidth < (left + self.offsetWidth)) {
                left = document.body.offsetWidth - self.offsetWidth - 20;
                if (left < 0) {
                    left = 0;
                }
            }
            if (document.body.offsetHeight < (top + self.offsetHeight)) {
                top = document.body.offsetHeight - self.offsetHeight - 90;
                if (top < 0) {
                    top = 0;
                }
            }
            setStyles([self], {
                position: 'absolute',
                left: left + 'px',
                top: top + 'px'
            });
        }

        this.events.onClick.push([self, event => event.stopPropagation()]);
        this.events.onClick.push([targetElement, show]);
        this.events.onHide.push(self);

        this.setup = function() {
            setStyles([self], styles);
            for (const element of options) {
                self.appendChild(element);
            }
            document.body.appendChild(self);
        };
    }

    const styles = {
        body: {
            cursor: 'pointer',
            display: 'flex'
        },
        dash: {
            padding: '0 0.2em'
        },
        dashSelected: {
            'background-color': 'black',
            'border-radius': '0.2em',
            color: 'white'
        },
        fieldgroup: {
            border: '0',
            margin: '0',
            padding: '0'
        },
        options: {
            'background-color': 'rgba(255, 255, 255, 0.7)',
            'border-radius': '0.2em',
            color: 'black',
            'font-family': 'sans-serif',
            margin: '1em',
            padding: '0.5em 2em'
        },
        root: {
            height: '100%',
            margin: '0'
        }
    };

    const aboutOptionComponent = new AboutComponent(styles.options);
    const backgroundColorElement = document.createElement('li');
    const backgroundColorLabelElement = document.createElement('label');
    const backgroundColorInputElement = document.createElement('input');
    const backgroundImageComponent = new BackgroundImageComponent();
    const timeAlignElement = document.createElement('li');
    const timeAlignTableElement = document.createElement('table');
    const timeColorElement = document.createElement('li');
    const timeColorLabelElement = document.createElement('label');
    const timeColorInputElement = document.createElement('input');
    const timeElement = document.createElement('span');
    const timeFontComponent = new FontComponent(timeElement);
    const timeSizeElement = document.createElement('li');
    const timeSizeLabelElement = document.createElement('label');
    const timeSizeSetElement = document.createElement('fieldset');
    const timeSizeInputElement = document.createElement('input');
    const timeSizeSelectElement = document.createElement('select');
    const components = [
        aboutOptionComponent,
        backgroundImageComponent,
        new OptionComponent(styles.options, document.body, aboutOptionComponent.elements.option, [
            backgroundColorElement,
            backgroundImageComponent.elements.self
        ]),
        new OptionComponent(styles.options, timeElement, aboutOptionComponent.elements.option, [
            timeAlignElement,
            timeColorElement,
            timeFontComponent.elements.self,
            timeSizeElement
        ]),
        timeFontComponent
    ];


    // prepare events
    setInterval(updateTime, 1000);
    for (const component of components) {
        for (const [element, callback] of component.events.onClick) {
            element.onclick = callback;
        }
        for (const [element, callback] of component.events.onChange) {
            element.onchange = callback;
        }
    }
    for (const [element, callback] of [
        [backgroundColorElement, showElement(backgroundColorInputElement)],
        [timeAlignElement, showTimeAlignOptions],
        [timeColorElement, showElement(timeColorInputElement)],
        [timeSizeElement, showElement(timeSizeSetElement)]
    ]) {
        element.onclick = callback;
    }
    for (const [element, target, source, itemKey] of [
        [backgroundColorInputElement, document.body, backgroundColorInputElement, 'background-color'],
        [timeColorInputElement, timeElement, timeColorInputElement, 'color']
    ]) {
        element.onchange = updateColor(target, source, itemKey);
    }
    for (const element of [timeSizeInputElement, timeSizeSelectElement]) {
        element.onchange = updateSize;
    }

    // load DOM
    updateTime();
    document.body.appendChild(timeElement);
    hideAll();
    updateLayout();
    for (const component of components) {
        component.setup();
    }
});
