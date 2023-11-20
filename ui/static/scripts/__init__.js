editorOptions = {
    mode: "ace/mode/json",
    theme: "ace/theme/clouds",
    fontSize: "12px",
    printMargin: false,
    highlightActiveLine: false,
};

const schemaEditor = ace.edit("schema", editorOptions);
schemaEditor.setValue(`{
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://jschon.dev/schema"
}`, -1);

const instanceEditor = ace.edit("instance", editorOptions);
instanceEditor.setValue('null');

$("#input-panel").resizable({handles: "s", minHeight: 200});
$("#schema-panel").resizable({handles: "e", minWidth: 200});
