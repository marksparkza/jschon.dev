import pathlib

from sanic import Sanic
from sanic.request import Request
from sanic.response import json

from jschon import JSON, JSONEvaluator, OutputFormat, URI, Catalogue

rootdir = pathlib.Path(__file__).parent

app = Sanic('jschon.dev')
app.static('/', rootdir / 'html' / 'index.html')
app.static('/static', rootdir / 'static')

metaschema_uris = {
    '2019-09': URI("https://json-schema.org/draft/2019-09/schema"),
    '2020-12': URI("https://json-schema.org/draft/2020-12/schema"),
}


@app.post('/evaluate')
async def evaluate(request: Request):
    try:
        catalogue = Catalogue(version := request.json['version'])
        schema = catalogue.create_schema(
            request.json['schema'],
            uri=URI('https://jschon.dev/schema'),
            metaschema_uri=metaschema_uris[version],
        )
        instance = JSON(request.json['instance'])
        output_format = OutputFormat(request.json['format'])
        evaluator = JSONEvaluator(schema)
        result = {
            'schema': (schema_validation := evaluator.validate_schema(output_format)),
            'instance': None,
        }
        if schema_validation['valid']:
            result['instance'] = evaluator.evaluate_instance(instance, output_format)

    except Exception as e:
        result = {
            'exception': e.__class__.__name__,
            'message': str(e),
        }

    return json(result)
