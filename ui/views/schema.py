from sanic import Blueprint, HTTPResponse, Request, html, json

from ui.client import APIClient

bp = Blueprint('schema', url_prefix='/schema')


@bp.get('')
async def index(request: Request, api: APIClient) -> HTTPResponse:
    template = request.app.ctx.template_env.get_template('schema.html')
    return html(template.render(
        version=api.version,
    ))


@bp.post('/evaluate')
async def evaluate(request: Request, api: APIClient) -> HTTPResponse:
    return json(api.post('/evaluate', request.json))


@bp.post('/select/<loc:path>')
async def select(request: Request, api: APIClient, loc: str) -> HTTPResponse:
    return json(api.post(f'/select/{loc}', request.json))
