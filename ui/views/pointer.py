from sanic import Blueprint, HTTPResponse, Request, html

bp = Blueprint('pointer', url_prefix='/pointer')


@bp.get('')
async def index(request: Request) -> HTTPResponse:
    template = request.app.ctx.template_env.get_template('pointer.html')
    return html(template.render())
