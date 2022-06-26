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
        url: $("#branch").val() + "/evaluate",
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
        $("#result").text(JSON.stringify(result.instance, null, 4));
    }
    else if (result.schema) {
        $("#schema").addClass("is-invalid");
        $("#result").text(JSON.stringify(result.schema, null, 4));
        $("#result-caption").text("The schema is invalid.");
        $("#result-caption").addClass("text-danger");
        $("#result-subcaption").text("The output below is the result of the metaschema's evaluation of the schema.");
        $("#result-subcaption").removeClass("d-none");
    }
    else {
        $("#result").text(JSON.stringify(result, null, 4));
        $("#result-caption").text("Server error");
        $("#result-caption").addClass("text-danger");
    }
}

function set$schema() {
    schema = JSON.parse(schemaEditor.getValue());
    schema.$schema = $("#metaschema-uri").children("option:selected").val();
    schemaEditor.setValue(JSON.stringify(schema, null, 4));
    schemaEditor.gotoLine(1);
}

function setBranch(branch, version) {
    $("#branch").val(branch);
    $("#title").text("jschon.dev | " + branch);
    if (branch == "stable") {
        $("#stable-btn").text("stable • " + version);
        $("#stable-btn").addClass("active");
        $("#next-btn").text("next");
        $("#next-btn").removeClass("active");
    } else {
        $("#stable-btn").text("stable");
        $("#stable-btn").removeClass("active");
        $("#next-btn").text("next • " + version);
        $("#next-btn").addClass("active");
    }
}
