function linkify(output, editor) {
    var re = /("instanceLocation": ")(.+)(",\s*"keywordLocation")/g;
    return output.replaceAll(
        re, '$1<a onclick="jumpTo(\'$2\',' + editor + ');" href="#" class="fw-bold text-decoration-none">$2</a>$3'
    );
}

function jumpTo(loc, editor) {
    try {
        JSON.parse(editor.getValue());
    }
    catch (e) {
        alert(e.message);
        return;
    }
    $.ajax({
        url: "/select" + loc,
        method: "POST",
        contentType: "application/json",
        data: editor.getValue(),
        success: function (data, textStatus, jqXHR) {
            select(data, editor);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(JSON.stringify(jqXHR));
        },
        timeout: 10000,
    })
}

function select(result, editor) {
    if (result.document) {
        editor.setValue(JSON.stringify(result.document, null, 4));
        range = editor.find('"__selection__"');
        var indent = new Array(range.start.column + 1).join(' ');
        selection = JSON.stringify(result.selection, null, 4);
        selection = selection.replaceAll('\n', '\n' + indent);
        editor.replace(selection);
        editor.focus();
    } else {
        alert(JSON.stringify(result, null, 4));
    }
}
