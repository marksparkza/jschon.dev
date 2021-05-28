function eval() {
    $("#schema,#instance").removeClass("is-valid is-invalid");
    $("#result").text("");
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
        },
        timeout: 30000,
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
    }
}

function process(result) {
    if (result.schema) {
        if (result.schema.valid) {
            $("#schema").addClass("is-valid");
            if (result.instance.valid) {
                $("#instance").addClass("is-valid");
            } else {
                $("#instance").addClass("is-invalid");
            }
            $("#result").text(JSON.stringify(result.instance, null, 4));
        } else {
            $("#schema").addClass("is-invalid");
            $("#result").text(JSON.stringify(result, null, 4));
        }
    } else {
        $("#result").text(JSON.stringify(result, null, 4));
    }
}
