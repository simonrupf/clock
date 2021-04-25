'use strict';

document.addEventListener('DOMContentLoaded', function() {
    function hideAll() {
        [
            aboutElement,
            timeAlignTableElement,
            timeOptionsElement
        ].forEach(function(element) {
            element.style.display = 'none'
        });
    }

    function setStyles(element, styles) {
        for (const [key, value] of Object.entries(styles)) {
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
        setStyles(timeOptionsElement, {
            position: 'absolute',
            left: left + 'px',
            top: top + 'px'
        });
    }

    function showTimeAlignOptions() {
        event.stopPropagation();
        timeAlignTableElement.style.display = 'block';
    }

    function updateAlignmentEvent(event, horizontal, vertical) {
        event.stopPropagation();
        hideAll();
        for (const [key, value] of Object.entries({
            'justify-content': horizontal,
            'align-items': vertical
        })) {
            localStorage.setItem(key, value);
            document.body.style[key] = value;
        }
    }

    function updateTime() {
        timeElement.textContent = (new Date()).toLocaleTimeString();
    }

    function updateLayout() {
        [
            document.documentElement,
            document.body
        ].forEach(function(element) {
            setStyles(element, {
                height: '100%',
                margin: '0'
            });
        });
        setStyles(document.body, {
            cursor: 'pointer',
            display: 'flex'
        });
        setStyles(timeOptionsElement, {
            margin: '0',
            'background-color': 'rgba(255, 255, 255, 0.7)',
            'border-radius': '1em'
        });

        [
            'justify-content',
            'align-items'
        ].forEach(function(key) {
            let value = localStorage.getItem(key);
            if (!value) {
                localStorage.setItem(key, 'center');
                value = 'center';
            }
            document.body.style[key] = value;
        });
    }

    const unorderedList = document.createElement('ul');
    const listItem = document.createElement('li');
    const table = document.createElement('table');
    const tableRow = document.createElement('tr');
    const tableDash = document.createElement('td');

    const aboutElement = document.body.childNodes[1];
    const timeElement = document.createElement('span');
    const timeOptionsElement = unorderedList.cloneNode();
    const timeAlignElement = listItem.cloneNode();
    const timeAlignTableElement = table.cloneNode();
    const aboutOptionElement = listItem.cloneNode();

    // prepare events
    setInterval(updateTime, 1000);
    timeElement.onclick = showTimeOptions;
    timeAlignElement.onclick = showTimeAlignOptions;
    aboutOptionElement.onclick = showAbout;
    document.body.onclick = hideAll;

    // load DOM
    updateTime();
    hideAll();
    updateLayout();
    document.body.appendChild(timeElement);

    timeAlignElement.textContent = 'Alignment…';
    aboutOptionElement.textContent = 'About…';

    [
        [
            {
                symbol: '⭶',
                hAlign: 'left',
                vAlign: 'top',
                onclick: function(event) {
                    updateAlignmentEvent(event, 'start', 'start');
                }
            },{
                symbol: '⭱',
                hAlign: 'center',
                vAlign: 'top',
                onclick: function(event) {
                    updateAlignmentEvent(event, 'center', 'start');
                }
            },{
                symbol: '⭷',
                hAlign: 'left',
                vAlign: 'top',
                onclick: function(event) {
                    updateAlignmentEvent(event, 'end', 'start');
                }
            }
        ],[
            {
                symbol: '⭰',
                hAlign: 'left',
                vAlign: 'middle',
                onclick: function(event) {
                    updateAlignmentEvent(event, 'start', 'center');
                }
            },{
                symbol: '✛',
                hAlign: 'center',
                vAlign: 'middle',
                onclick: function(event) {
                    updateAlignmentEvent(event, 'center', 'center');
                }
            },{
                symbol: '⭲',
                hAlign: 'left',
                vAlign: 'middle',
                onclick: function(event) {
                    updateAlignmentEvent(event, 'end', 'center');
                }
            }
        ],[
            {
                symbol: '⭹',
                hAlign: 'left',
                vAlign: 'bottom',
                onclick: function(event) {
                    updateAlignmentEvent(event, 'start', 'end');
                }
            },{
                symbol: '⭳',
                hAlign: 'center',
                vAlign: 'bottom',
                onclick: function(event) {
                    updateAlignmentEvent(event, 'center', 'end');
                }
            },{
                symbol: '⭸',
                hAlign: 'left',
                vAlign: 'bottom',
                onclick: function(event) {
                    updateAlignmentEvent(event, 'end', 'end');
                }
            }
        ]
    ].forEach(function(row) {
        const alignTableRow = tableRow.cloneNode();
        row.forEach(function(cell) {
            const alignTableDash = tableDash.cloneNode();
            alignTableDash.textContent = cell.symbol;
            setStyles(alignTableDash, {
                'text-align': cell.hAlign,
                'vertical-align': cell.vAlign
            });
            alignTableDash.onclick = cell.onclick;
            alignTableRow.appendChild(alignTableDash);
        });
        timeAlignTableElement.appendChild(alignTableRow);
    });
    timeAlignElement.appendChild(timeAlignTableElement);

    [
        timeAlignElement,
        aboutOptionElement
    ].forEach(function(element) {
        timeOptionsElement.appendChild(element);
    });
    document.body.appendChild(timeOptionsElement);
});
