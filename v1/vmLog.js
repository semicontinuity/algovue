const DEBUG = false;

function vmLog(type, action) {
    if (DEBUG) {
        const item = document.createElement('tr');
        let html = '';
        html += '<td style="background: #d3d3d3">'; html += type; html += '</td>';
        html += '<td>'; html += statement.toString(); html += '</td>';
        html += '<td>'; html += state; html += '</td>';
        html += '<td>'; html += JSON.stringify(frame); html += '</td>';
        html += '<td>'; html += register; html += '</td>';
        if (action !== undefined) {
            html += '<td>'; html += action.description; html += '</td>';
        }
        item.innerHTML = html;
        logView.appendChild(item);
    }
}
