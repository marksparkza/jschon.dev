ace.config.set("basePath", "/static/ace-builds/src-min-noconflict");

editorOptions = {
    mode: "ace/mode/json",
    theme: "ace/theme/clouds",
    fontSize: "12.25px",
    printMargin: false,
    highlightActiveLine: false,
};

var schemaEditor = ace.edit("schema", editorOptions);
var instanceEditor = ace.edit("instance", editorOptions);

$("#input-panel").resizable({handles: "s", minHeight: 200});
$("#schema-panel").resizable({handles: "e", minWidth: 200});

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

function linkify(output, editor) {
    var re = /("instanceLocation": ")(.+)(",\s*"keywordLocation")/g;
    return output.replaceAll(
        re, '$1<a onclick="jumpTo(\'$2\',' + editor + ');" href="#" class="fw-bold text-decoration-none">$2</a>$3'
    );
}
