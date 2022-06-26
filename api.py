from sanic import HTTPResponse, Request, Sanic, json, text

from jschon import JSON, JSONSchema, URI, __version__, create_catalog

app = Sanic('jschon-api')

catalog = create_catalog('2019-09', '2020-12')


@app.get('/version')
async def version(request: Request) -> HTTPResponse:
    return text(__version__)


@app.post('/evaluate')
async def evaluate(request: Request) -> HTTPResponse:
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
