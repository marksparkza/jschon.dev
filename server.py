import pathlib

from sanic import Sanic
from sanic.response import json

from jschon import JSON, JSONSchema, JSONEvaluation
from jschon.catalogue import jsonschema_2019_09, jsonschema_2020_12

rootdir = pathlib.Path(__file__).parent

app = Sanic("jschon.dev")
app.static('/', rootdir / 'index.html')
app.static('/static', rootdir / 'static')


@app.main_process_start
async def init_catalogue(app, loop):
    jsonschema_2019_09.initialize()
    jsonschema_2020_12.initialize()


@app.post('/evaluate')
async def evaluate(request):
    metaschema_uri = request.args.get('metaschema_uri')
    try:
        schema = JSONSchema(request.json['schema'], metaschema_uri=metaschema_uri)
        instance = JSON(request.json['instance'])
        evaluation = JSONEvaluation(instance, schema)
        return json(evaluation.basic)
    except Exception as e:
        return json({
            'exception': e.__class__.__name__,
            'message': str(e),
        })
