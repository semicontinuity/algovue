function renderIn(container, content) {
    container.innerText = '';
    container.appendChild(content);
}

function e(tag, ...clazz) {
    const element = document.createElement(tag);
    if (clazz.length !== 0) element.classList.add(clazz);
    return element;
}

function table(...clazz) {
    const element = document.createElement('table');
    if (clazz.length !== 0) element.classList.add(clazz);
    return element;
}

function tr(...args) {
    const view = document.createElement('tr');
    args.forEach(c => { if (c !== undefined) view.appendChild(c) });
    return view;
}

function td(...args) {
    const view = document.createElement('td');
    args.forEach(c => view.appendChild(c));
    return view;
}

function span(...args) {
    const view = document.createElement('span');
    args.forEach(c => view.appendChild(c));
    return view;
}

function div(...args) {
    const view = document.createElement('div');
    args.forEach(c => view.appendChild(c));
    return view;
}

function text(innerText, className) {
    const view = document.createElement('span');
    if (innerText !== undefined) view.innerText = innerText;
    if (className) view.className = className;
    return view;
}
