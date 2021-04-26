'use strict';

document.addEventListener('DOMContentLoaded', function() {
    function hideAll() {
        for (const element of [
            aboutElement,
            timeAlignTableElement,
            timeColorInputElement,
            timeOptionsElement
        ]) {
            element.style.display = 'none'
        }
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

    function showAbout(event) {
        event.stopPropagation();
        hideAll();
        aboutElement.style.display = 'block';
    }

    function showTimeOptions(event) {
        event.stopPropagation();
        timeOptionsElement.style.display = 'block';
        let left = event.clientX;
        let top = event.clientY;
        if (document.body.offsetWidth < (left + timeOptionsElement.offsetWidth)) {
            left = document.body.offsetWidth - timeOptionsElement.offsetWidth - 20;
            if (left < 0) {
                left = 0;
            }
        }
        if (document.body.offsetHeight < (top + timeOptionsElement.offsetHeight)) {
            top = document.body.offsetHeight - timeOptionsElement.offsetHeight - 90;
            if (top < 0) {
                top = 0;
            }
        }
        setStyles([timeOptionsElement], {
            position: 'absolute',
            left: left + 'px',
            top: top + 'px'
        });
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
            const alignTableRow = nodePalette.tr.cloneNode();
            for (const cell of row) {
                const alignTableDash = nodePalette.td.cloneNode();
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

    function showTimeColorOptions() {
        event.stopPropagation();
        timeColorInputElement.style.display = 'block';
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

    function updateColor(event) {
        hideAll();
        setPersistentStyles(timeElement, {
            color: timeColorInputElement.value
        });
    }

    function updateTime() {
        timeElement.textContent = (new Date()).toLocaleTimeString();
    }

    function updateLayout() {
        // styles
        setStyles([document.documentElement, document.body], styles.root);
        setStyles([document.body], styles.body);
        setStyles([aboutElement, timeOptionsElement], styles.options);

        // restore persisted styles
        for (const [key, defaultValue, element] of [
            ['align-items', 'center', document.body],
            ['justify-content', 'center', document.body],
            ['color', '#000000', timeElement]
        ]) {
            let value = localStorage.getItem(key);
            if (!value) {
                localStorage.setItem(key, defaultValue);
                value = defaultValue;
            }
            element.style[key] = value;
        }

        // text
        timeAlignElement.textContent = 'Alignment…';
        timeColorLabelElement.textContent = 'Color…';
        aboutOptionElement.textContent = 'About…';

        // color picker
        timeColorLabelElement.setAttribute('for', 'timeColor');
        timeColorInputElement.setAttribute('id', 'timeColor');
        timeColorInputElement.setAttribute('type', 'color');
        timeColorInputElement.value = localStorage.getItem('color');
        timeColorElement.appendChild(timeColorLabelElement);
        timeColorElement.appendChild(document.createElement('br'));
        timeColorElement.appendChild(timeColorInputElement);

        // menus
        timeAlignElement.appendChild(timeAlignTableElement);
        for (const element of [
            timeAlignElement,
            timeColorElement,
            aboutOptionElement
        ]) {
            timeOptionsElement.appendChild(element);
        }
        document.body.appendChild(timeOptionsElement);
    }

    const nodePalette = {
        li: document.createElement('li'),
        tr: document.createElement('tr'),
        td: document.createElement('td')
    };
    const styles = {
        root: {
            height: '100%',
            margin: '0'
        },
        body: {
            cursor: 'pointer',
            display: 'flex'
        },
        options: {
            margin: '0',
            padding: '0.5em 2em',
            'background-color': 'rgba(255, 255, 255, 0.7)',
            'border-radius': '0.2em'
        },
        dash: {
            padding: '0 0.2em'
        },
        dashSelected: {
            color: 'white',
            'background-color': 'black',
            'border-radius': '0.2em'
        }
    };

    const aboutElement = document.body.childNodes[1];
    const timeElement = document.createElement('span');
    const timeOptionsElement = document.createElement('ul');
    const timeAlignElement = nodePalette.li.cloneNode();
    const timeAlignTableElement = document.createElement('table');
    const timeColorElement = nodePalette.li.cloneNode();
    const timeColorLabelElement = document.createElement('label');
    const timeColorInputElement = document.createElement('input');
    const aboutOptionElement = nodePalette.li.cloneNode();

    // prepare events
    setInterval(updateTime, 1000);
    for (const [element, callback] of [
        [timeElement, showTimeOptions],
        [timeAlignElement, showTimeAlignOptions],
        [timeColorElement, showTimeColorOptions],
        [aboutOptionElement, showAbout],
        [document.body, hideAll]
    ]) {
        element.onclick = callback;
    }
    timeColorInputElement.onchange = updateColor;

    // load DOM
    updateTime();
    document.body.appendChild(timeElement);
    hideAll();
    updateLayout();
});
