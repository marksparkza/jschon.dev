import pathlib

from sanic import Sanic
from sanic.request import Request
from sanic.response import json

from jschon import create_catalog, JSON, JSONSchema, URI

rootdir = pathlib.Path(__file__).parent

app = Sanic('jschon.dev')
app.static('/', rootdir / 'html' / 'index.html')
app.static('/static', rootdir / 'static')

metaschema_uris = {
    '2019-09': URI("https://json-schema.org/draft/2019-09/schema"),
    '2020-12': URI("https://json-schema.org/draft/2020-12/schema"),
}

catalog = create_catalog('2019-09', '2020-12', default=True)


@app.post('/evaluate')
async def evaluate(request: Request):
    with catalog.session() as session:
        try:
            schema = JSONSchema(
                request.json['schema'],
                session=session,
                uri=URI('https://jschon.dev/schema'),
                metaschema_uri=metaschema_uris[request.json['version']],
            )
            instance = JSON(request.json['instance'])
            format = request.json['format']

            schema_result = schema.validate().output(format)

            if not schema_result['valid']:
                result = {'schema': schema_result}
            else:
                result = {'instance': schema.evaluate(instance).output(format)}

        except Exception as e:
            result = {
                'exception': e.__class__.__name__,
                'message': str(e),
            }

        return json(result)
