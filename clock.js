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
            backgroundImageInputElement,
            backgroundOptionsElement,
            timeAlignTableElement,
            timeColorInputElement,
            timeFontSelectElement,
            timeSizeSetElement,
            timeOptionsElement
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

    function showOptions(element) {
        return function(event) {
            event.stopPropagation();
            hideAll();
            element.appendChild(aboutOptionElement);
            element.style.display = 'block';
            let left = event.clientX;
            let top = event.clientY;
            if (document.body.offsetWidth < (left + element.offsetWidth)) {
                left = document.body.offsetWidth - element.offsetWidth - 20;
                if (left < 0) {
                    left = 0;
                }
            }
            if (document.body.offsetHeight < (top + element.offsetHeight)) {
                top = document.body.offsetHeight - element.offsetHeight - 90;
                if (top < 0) {
                    top = 0;
                }
            }
            setStyles([element], {
                position: 'absolute',
                left: left + 'px',
                top: top + 'px'
            });
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

    function updateBackgroundImage() {
        hideAll();
        setPersistentStyles(document.body, {
            'background-image': 'url("' + backgroundImageInputElement.value + '")'
        });
    }

    function updateColor(targetElement, colorPickerElement, itemKey) {
        return function(event) {
            hideAll();
            const styles = {};
            styles[itemKey] = colorPickerElement.value;
            setPersistentStyles(targetElement, styles);
        }
    }

    function updateFont() {
        hideAll();
        setPersistentStyles(timeElement, {
            'font-family': timeFontSelectElement.value
        });
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
        setStyles([backgroundOptionsElement, timeOptionsElement], styles.options);
        setStyles([timeSizeSetElement], styles.fieldgroup);
        timeElement.style.margin = '1em';

        // restore or initialize persisted styles
        for (const [key, defaultValue, element] of [
            ['align-items', 'center', document.body],
            ['justify-content', 'center', document.body],
            ['color', '#000000', timeElement],
            ['background-color', '#ffffff', document.body],
            ['background-image', '', document.body],
            ['font-family', '', timeElement],
            ['font-size', '1em', timeElement]
        ]) {
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
        backgroundImageLabelElement.textContent = 'Image URL…';
        timeFontLabelElement.textContent = 'Font…';
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

        // background image
        backgroundImageLabelElement.setAttribute('for', 'backgroundImage');
        backgroundImageInputElement.setAttribute('id', 'backgroundImage');
        backgroundImageInputElement.setAttribute('type', 'url');
        backgroundImageInputElement.setAttribute('pattern', 'https://.*');
        backgroundImageInputElement.setAttribute('placeholder', 'https://example.com');
        const backgroundImage = localStorage.getItem('background-image');
        backgroundImageInputElement.value = backgroundImage ? backgroundImage.substring(5, backgroundImage.length - 2) : '';
        backgroundImageElement.appendChild(backgroundImageLabelElement);
        backgroundImageElement.appendChild(document.createElement('br'));
        backgroundImageElement.appendChild(backgroundImageInputElement);

        // font
        timeFontLabelElement.setAttribute('for', 'timeFont');
        timeFontSelectElement.setAttribute('id', 'timeFont');
        for (const fontFamily of ['Browser Default', 'Serif', 'Sans-Serif', 'Cursive', 'Fantasy', 'Monospace']) {
            const timeFontOptionElement = document.createElement('option');
            timeFontOptionElement.textContent = fontFamily;
            timeFontOptionElement.value = fontFamily == 'Browser Default' ? '' : fontFamily;
            timeFontSelectElement.appendChild(timeFontOptionElement);
        }
        timeFontSelectElement.value = localStorage.getItem('font-family');
        timeFontElement.appendChild(timeFontLabelElement);
        timeFontElement.appendChild(document.createElement('br'));
        timeFontElement.appendChild(timeFontSelectElement);

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
        for (const [optionsElement, options] of [
            [
                backgroundOptionsElement, [
                    backgroundColorElement,
                    backgroundImageElement
                ]
            ], [
                timeOptionsElement, [
                    timeAlignElement,
                    timeColorElement,
                    timeFontElement,
                    timeSizeElement
                ]
            ]
        ]) {
            for (const element of options) {
                optionsElement.appendChild(element);
            }
            document.body.appendChild(optionsElement);
        }
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
    }

    function AboutComponent(styles, optionElement) {
        Component.call(this, {
            self: document.body.childNodes[1],
            option: optionElement
        });

        const self = this.elements.self;
        function showAbout(event) {
            hideAllEvent(event);
            self.style.display = 'block';
        }

        this.events.onClick.push([this.elements.self, hideAllEvent]);
        this.events.onClick.push([this.elements.option, showAbout]);
        this.events.onHide.push(this.elements.self);
        this.setup = function() {
            setStyles([this.elements.self], styles);
            this.elements.option.textContent = 'About…';
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

    const aboutOptionElement = document.createElement('li');
    const components = [
        new AboutComponent(styles.options, aboutOptionElement)
    ];

    const backgroundOptionsElement = document.createElement('ul');
    const backgroundColorElement = document.createElement('li');
    const backgroundColorLabelElement = document.createElement('label');
    const backgroundColorInputElement = document.createElement('input');
    const backgroundImageElement = document.createElement('li');
    const backgroundImageLabelElement = document.createElement('label');
    const backgroundImageInputElement = document.createElement('input');
    const timeElement = document.createElement('span');
    const timeOptionsElement = document.createElement('ul');
    const timeAlignElement = document.createElement('li');
    const timeAlignTableElement = document.createElement('table');
    const timeColorElement = document.createElement('li');
    const timeColorLabelElement = document.createElement('label');
    const timeColorInputElement = document.createElement('input');
    const timeFontElement = document.createElement('li');
    const timeFontLabelElement = document.createElement('label');
    const timeFontSelectElement = document.createElement('select');
    const timeSizeElement = document.createElement('li');
    const timeSizeLabelElement = document.createElement('label');
    const timeSizeSetElement = document.createElement('fieldset');
    const timeSizeInputElement = document.createElement('input');
    const timeSizeSelectElement = document.createElement('select');

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
        [backgroundImageElement, showElement(backgroundImageInputElement)],
        [backgroundOptionsElement, event => event.stopPropagation()],
        [document.body, showOptions(backgroundOptionsElement)],
        [timeElement, showOptions(timeOptionsElement)],
        [timeAlignElement, showTimeAlignOptions],
        [timeColorElement, showElement(timeColorInputElement)],
        [timeFontLabelElement, showElement(timeFontSelectElement)],
        [timeSizeElement, showElement(timeSizeSetElement)],
        [timeOptionsElement, event => event.stopPropagation()]
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
    backgroundImageInputElement.onchange = updateBackgroundImage;
    timeFontSelectElement.onchange = updateFont;

    // load DOM
    updateTime();
    document.body.appendChild(timeElement);
    hideAll();
    updateLayout();
    for (const component of components) {
        component.setup();
    }
});
