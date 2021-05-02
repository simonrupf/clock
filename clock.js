'use strict';

document.addEventListener('DOMContentLoaded', function() {
    // CSS element styles
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
        input: {
            'text-align': 'right',
            width: '3em'
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

    // functions
    function appendFormElements(elements, formElement) {
        elements.self.appendChild(elements.label);
        elements.self.appendChild(document.createElement('br'));
        elements.self.appendChild(formElement);
    }

    function appendOptions(targetElement, options) {
        for (const option of options) {
            const optionElement = document.createElement('option');
            optionElement.textContent = option;
            optionElement.value = option == 'Browser Default' ? '' : option;
            targetElement.appendChild(optionElement);
        }
    }

    function hideAll() {
        for (const component of components) {
            for (const element of component.events.onHide) {
                element.style.display = 'none'
            }
        }
        for (const element of [
            backgroundColorInputElement,
            timeAlignTableElement,
            timeColorInputElement
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

    function updateProperties(labelElement, idElement, key, labelText) {
        labelElement.textContent = labelText;
        labelElement.setAttribute('for', key);
        idElement.setAttribute('id', key);
    }

    function updateTime() {
        timeElement.textContent = (new Date()).toLocaleTimeString();
    }

    function updateLayout() {
        // styles
        setStyles([document.documentElement, document.body], styles.root);
        setStyles([document.body], styles.body);
        timeElement.style.margin = '1em';

        // restore or initialize persisted styles
        const persistedStyles = [
            ['align-items', 'center', document.body],
            ['justify-content', 'center', document.body],
            ['color', '#000000', timeElement],
            ['background-color', '#ffffff', document.body]
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
            setStyles([self], styles.options);
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
            updateProperties(this.elements.label, input, key, 'Image URL…');
            input.setAttribute('type', 'url');
            input.setAttribute('pattern', 'https://.*');
            input.setAttribute('placeholder', 'https://example.com');
            const backgroundImage = localStorage.getItem(key);
            input.value = backgroundImage ? backgroundImage.substring(5, backgroundImage.length - 2) : this.default;
            appendFormElements(this.elements, input);
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
        this.target = targetElement;

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
            updateProperties(this.elements.label, select, key, 'Font…');
            appendOptions(select, ['Browser Default', 'Serif', 'Sans-Serif', 'Cursive', 'Fantasy', 'Monospace']);
            select.value = localStorage.getItem(key);
            appendFormElements(this.elements, select);
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

    function SizeComponent(targetElement) {
        Component.call(this, {
            self: document.createElement('li'),
            fieldset: document.createElement('fieldset'),
            input: document.createElement('input'),
            label: document.createElement('label'),
            select: document.createElement('select')
        });

        const input = this.elements.input;
        const select = this.elements.select;
        const key = this.key = 'font-size';
        this.default = '1em';
        this.target = targetElement;

        function update() {
            hideAll();
            const styles = {};
            styles[key] = input.value + select.value;
            setPersistentStyles(targetElement, styles);
        }

        this.events.onClick.push([this.elements.label, showElement(this.elements.fieldset)]);
        this.events.onChange.push([input, update]);
        this.events.onChange.push([select, update]);
        this.events.onHide.push(this.elements.fieldset);

        this.setup = function() {
            updateProperties(this.elements.label, input, key, 'Size…');
            setStyles([this.elements.fieldset], styles.fieldgroup);
            setStyles([input], styles.input);
            input.setAttribute('type', 'number');
            input.setAttribute('min', '1');
            select.setAttribute('id', key + '-unit');
            appendOptions(select, ['em', 'px', 'pt', 'cm', 'mm', 'in', 'pc', '%']);
            const fontSize = localStorage.getItem(key).match(/[a-z%]+|[0-9]+/g);
            input.value = fontSize[0];
            select.value = fontSize[1];
            this.elements.fieldset.appendChild(input);
            this.elements.fieldset.appendChild(select);
            appendFormElements(this.elements, this.elements.fieldset);
        }
    }

    const aboutOptionComponent = new AboutComponent();
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
    const timeSizeComponent = new SizeComponent(timeElement);
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
            timeSizeComponent.elements.self
        ]),
        timeFontComponent,
        timeSizeComponent
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
        [timeColorElement, showElement(timeColorInputElement)]
    ]) {
        element.onclick = callback;
    }
    for (const [element, target, source, itemKey] of [
        [backgroundColorInputElement, document.body, backgroundColorInputElement, 'background-color'],
        [timeColorInputElement, timeElement, timeColorInputElement, 'color']
    ]) {
        element.onchange = updateColor(target, source, itemKey);
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
