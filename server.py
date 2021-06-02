import os
import pathlib

from sanic import Sanic
from sanic.request import Request
from sanic.response import json

from jschon import Catalogue, JSON, JSONSchema, URI

rootdir = pathlib.Path(__file__).parent

app = Sanic('jschon.dev')
app.static('/', rootdir / 'html' / 'index.html')
app.static('/static', rootdir / 'static')
app.config.FORWARDED_SECRET = os.getenv('FORWARDED_SECRET')

metaschema_uris = {
    '2019-09': URI("https://json-schema.org/draft/2019-09/schema"),
    '2020-12': URI("https://json-schema.org/draft/2020-12/schema"),
}


@app.post('/evaluate')
async def evaluate(request: Request):
    try:
        catalogue = Catalogue(version := request.json['version'])
        schema = JSONSchema(
            request.json['schema'],
            catalogue=catalogue,
            uri=URI('https://jschon.dev/schema'),
            metaschema_uri=metaschema_uris[version],
        )
        instance = JSON(request.json['instance'])
        format = request.json['format']
        result = {
            'schema': (schema_result := schema.metaschema.evaluate(schema).output(format)),
            'instance': None,
        }
        if schema_result['valid']:
            result['instance'] = schema.evaluate(instance).output(format)

    except Exception as e:
        result = {
            'exception': e.__class__.__name__,
            'message': str(e),
        }

    return json(result)
