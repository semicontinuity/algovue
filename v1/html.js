function $(elementId) {
    return document.getElementById(elementId);
}

function toggleClass(element, className) {
    const classes = element.classList;
    if (classes.contains(className)) {
        classes.remove(className);
    } else {
        classes.add(className);
    }
}

function renderIn(container, content) {
    container.innerText = '';
    container.appendChild(content);
}

function e(tag, ...classOrChild) {
    const element = document.createElement(tag);
    classOrChild.forEach(c => {
        if (c === undefined) return;
        if (typeof (c) === 'string') element.classList.add(c); else element.appendChild(c);
    });
    return element;
}

function table(...clazz) {
    const element = document.createElement('table');
    if (clazz.length !== 0) element.classList.add(clazz);
    return element;
}

function trWithClass(clazz, ...args) {
    const view = document.createElement('tr');
    view.className = clazz;
    args.forEach(c => { if (c !== undefined) view.appendChild(c) });
    return view;
}

function tr(...args) {
    const view = document.createElement('tr');
    args.forEach(c => { if (c !== undefined) view.appendChild(c) });
    return view;
}

function tdWithRowspanAndClass(rowSpan, clazz, ...args) {
    const view = document.createElement('td');
    view.rowSpan = rowSpan;
    if (clazz) view.className = clazz;
    args.forEach(c => view.appendChild(c));
    return view;
}

function tdWithClass(clazz, ...args) {
    const view = document.createElement('td');
    view.className = clazz;
    args.forEach(c => view.appendChild(c));
    return view;
}

function td(...args) {
    const view = document.createElement('td');
    args.forEach(c => view.appendChild(c));
    return view;
}

function div(...args) {
    const view = document.createElement('div');
    args.forEach(c => { if (c !== undefined) view.appendChild(c);});
    return view;
}

function divWithClass(clazz, ...args) {
    const view = document.createElement('div');
    view.className = clazz;
    args.forEach(c => { if (c !== undefined) view.appendChild(c);});
    return view;
}

function span(...args) {
    const view = document.createElement('span');
    args.forEach(c => view.appendChild(c));
    return view;
}

function spanWithClass(clazz, ...args) {
    const view = document.createElement('span');
    view.className = clazz;
    args.forEach(c => { if (c !== undefined) view.appendChild(c);});
    return view;
}

function text(innerText, className) {
    const view = document.createElement('span');
    if (innerText !== undefined) view.innerText = innerText;
    if (className) view.className = className;
    return view;
}

function textBlock(innerText, className) {
    const view = document.createElement('div');
    if (innerText !== undefined) view.innerText = innerText;
    if (className) view.className = className;
    return view;
}
