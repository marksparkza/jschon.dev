function eval() {
    $("#schema,#instance").removeClass("is-valid is-invalid");
    $("#result").text("");
    $("#result-caption").text("Please wait...");
    $("#result-caption").removeClass("text-success text-danger");
    $("#result-subcaption").addClass("d-none");

    schema = parse($("#schema"));
    instance = parse($("#instance"));
    if ($("#schema,#instance").hasClass("is-invalid")) {
        return;
    }

    $.ajax({
        url: "evaluate",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            schema: schema,
            instance: instance,
            version: $("#version").val(),
            format: $("#format").val(),
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

function parse(element) {
    try {
        return JSON.parse(element.val());
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
