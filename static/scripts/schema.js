function set$schema() {
    schema = JSON.parse(schemaEditor.getValue());
    schema.$schema = $("#metaschema-uri").children("option:selected").val();
    schemaEditor.setValue(JSON.stringify(schema, null, 4));
    schemaEditor.gotoLine(1);
}

function eval() {
    $("#schema,#instance").removeClass("is-valid is-invalid");
    $("#result").text("");
    $("#result-caption").text("Please wait...");
    $("#result-caption").removeClass("text-success text-danger");
    $("#result-subcaption").addClass("d-none");

    schema = parse($("#schema"), schemaEditor);
    instance = parse($("#instance"), instanceEditor);

    if ($("#schema,#instance").hasClass("is-invalid")) {
        return;
    }
    if (schema.$schema) {
        $("#metaschema-uri").val(schema.$schema);
    }

    $.ajax({
        url: "/schema/evaluate",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            schema: schema,
            instance: instance,
            metaschema_uri: $("#metaschema-uri").val(),
            output_format: $("#output-format").val(),
        }),
        success: function (data, textStatus, jqXHR) {
            process(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $("#result").text("ajax: " + textStatus);
            $("#result-caption").text("Network error");
            $("#result-caption").addClass("text-danger");
        },
        timeout: 10000,
    })
}

function parse(element, editor) {
    try {
        return JSON.parse(editor.getValue());
    }
    catch (e) {
        element.addClass("is-invalid");
        $("#result").text(function(idx, curval) {
            return `${curval}${element.attr("id")}: ${e.message}\n`;
        });
        $("#result-caption").text("Syntax error");
        $("#result-caption").addClass("text-danger");
    }
}

function process(result) {
    if (result.instance) {
        $("#schema").addClass("is-valid");
        if (result.instance.valid) {
            $("#instance").addClass("is-valid");
            $("#result-caption").text("The instance is valid.");
            $("#result-caption").addClass("text-success");
        } else {
            $("#instance").addClass("is-invalid");
            $("#result-caption").text("The instance is invalid.");
            $("#result-caption").addClass("text-danger");
        }
        $("#result").html(linkify(JSON.stringify(result.instance, null, 4), 'instanceEditor'));
    }
    else if (result.schema) {
        $("#schema").addClass("is-invalid");
        $("#result").html(linkify(JSON.stringify(result.schema, null, 4), 'schemaEditor'));
        $("#result-caption").text("The schema is invalid.");
        $("#result-caption").addClass("text-danger");
        $("#result-subcaption").text("The output shows the meta-schema's evaluation of the schema.");
        $("#result-subcaption").removeClass("d-none");
    }
    else {
        $("#result").text(JSON.stringify(result, null, 4));
        $("#result-caption").text("Server error");
        $("#result-caption").addClass("text-danger");
    }
}

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
        url: "/schema/select" + loc,
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
