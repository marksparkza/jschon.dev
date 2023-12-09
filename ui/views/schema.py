from sanic import Blueprint, HTTPResponse, Request, html, json

bp = Blueprint('schema', url_prefix='/schema')


@bp.get('')
async def index(request: Request) -> HTTPResponse:
    template = request.app.ctx.template_env.get_template('schema.html')
    return html(template.render())


@bp.post('/evaluate')
async def evaluate(request: Request) -> HTTPResponse:
    return json(request.ctx.api.post('/evaluate', request.json))


@bp.post('/select/<loc:path>')
async def select(request: Request, loc: str) -> HTTPResponse:
    return json(request.ctx.api.post(f'/select/{loc}', request.json))
