function eval() {
    $("#schema,#instance,#result").removeClass("is-valid is-invalid");
    $("#result").val("");
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
        }),
        success: function (data, textStatus, jqXHR) {
            process(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $("#result").val("ajax: " + textStatus);
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
        label = $(`label[for=${element.attr("id")}]`).text();
        $("#result").val(function(i, curval) {
            newval = `${label}: ${e.message}`;
            if (curval) {
                newval = `${curval}\n${newval}`;
            }
            return newval;
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
            $("#result").val(JSON.stringify(result.instance, null, 4));
        } else {
            $("#schema").addClass("is-invalid");
            $("#result").val(JSON.stringify(result, null, 4));
        }
    } else {
        $("#result").addClass("is-invalid");
        $("#result").val(JSON.stringify(result, null, 4));
    }
}
