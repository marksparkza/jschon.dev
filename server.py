import pathlib

from sanic import Sanic
from sanic.response import json

from jschon import JSON, JSONSchema, JSONEvaluator, OutputFormat, URI
from jschon.catalogue import jsonschema_2019_09, jsonschema_2020_12

rootdir = pathlib.Path(__file__).parent

app = Sanic('jschon.dev')
app.static('/', rootdir / 'html' / 'index.html')
app.static('/static', rootdir / 'static')


@app.main_process_start
async def init_catalogue(app, loop):
    jsonschema_2019_09.initialize()
    jsonschema_2020_12.initialize()


@app.post('/evaluate')
async def evaluate(request):
    try:
        metaschema_uri = URI(request.json['metaschema_uri'])
        output_format = OutputFormat(request.json['output_format'])
        schema = JSONSchema(request.json['schema'], metaschema_uri=metaschema_uri)
        instance = JSON(request.json['instance'])
        evaluator = JSONEvaluator(schema, instance)
        result = {
            'schema': (schema_validation := evaluator.validate_schema(output_format)),
            'instance': None,
        }
        if schema_validation['valid']:
            result['instance'] = evaluator.evaluate_instance(output_format)

    except Exception as e:
        result = {
            'exception': e.__class__.__name__,
            'message': str(e),
        }

    return json(result)
