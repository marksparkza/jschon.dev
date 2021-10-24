import pathlib

from jinja2 import Environment, FileSystemLoader
from sanic import Sanic
from sanic.request import Request
from sanic.response import json, html

import jschon
from jschon import create_catalog, JSON, JSONSchema, URI

rootdir = pathlib.Path(__file__).parent

app = Sanic('jschon.dev')
app.static('/static', rootdir / 'static')

template_env = Environment(loader=FileSystemLoader('templates'), autoescape=True)

catalog = create_catalog('2019-09', '2020-12')


@app.get('/')
async def index(request: Request):
    template = template_env.get_template('index.html')
    return html(template.render(version=jschon.__version__))


@app.post('/evaluate')
async def evaluate(request: Request):
    with catalog.session() as session:
        try:
            metaschema_uri = request.json['metaschema_uri']
            output_format = request.json['output_format']
            schema = JSONSchema(
                request.json['schema'],
                session=session,
                metaschema_uri=URI(metaschema_uri) if metaschema_uri else None,
            )
            instance = JSON(request.json['instance'])

            schema_result = schema.validate().output(output_format)
            if not schema_result['valid']:
                result = {'schema': schema_result}
            else:
                result = {'instance': schema.evaluate(instance).output(output_format)}

        except Exception as e:
            result = {
                'exception': e.__class__.__name__,
                'message': str(e),
            }

        return json(result)
