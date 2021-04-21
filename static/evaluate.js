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

function eval() {
    $("#schema,#instance").removeClass("is-valid is-invalid");
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
            $("#result").val(JSON.stringify(data, null, 4));
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $("#result").val("ajax: " + textStatus);
        },
        timeout: 30000,
    })
}
