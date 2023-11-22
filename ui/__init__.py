from pathlib import Path
from typing import Any

import requests
import yaml
from jinja2 import Environment, FileSystemLoader
from sanic import HTTPResponse, Request, Sanic, html, json

ui_dir = Path(__file__).parent

app = Sanic(
    'jschon-ui',
    env_prefix='JSCHON_',
)
app.ctx.template_env = Environment(
    loader=FileSystemLoader(ui_dir / 'templates'),
    autoescape=True,
)

app.ctx.template_env.globals |= dict(
    url_for=app.url_for,
)

with open(ui_dir / 'templates' / 'dependencies.yml') as f:
    app.ctx.template_env.globals |= yaml.safe_load(f)

with open(ui_dir / 'examples' / 'demo-schema.json') as f:
    app.ctx.template_env.globals |= dict(
        demo_schema=f.read()
    )

with open(ui_dir / 'examples' / 'demo-instance.json') as f:
    app.ctx.template_env.globals |= dict(
        demo_instance=f.read()
    )

app.static(
    '/static',
    ui_dir / 'static',
)

api = app.config.API


def callapi(method: str, path: str, data: Any) -> HTTPResponse:
    try:
        r = requests.request(method, f'{api}{path}', json=data)
        r.raise_for_status()
        result = r.json()

    except Exception as e:
        result = {
            'exception': e.__class__.__name__,
            'message': str(e),
        }

    return json(result)


def version() -> str:
    r = requests.get(f'{api}/version')
    r.raise_for_status()
    return r.text


@app.get('')
async def index(request: Request) -> HTTPResponse:
    template = request.app.ctx.template_env.get_template('index.html')
    return html(template.render(
        version=version(),
    ))


@app.post('/evaluate')
async def evaluate(request: Request) -> HTTPResponse:
    return callapi('post', '/evaluate', request.json)


@app.post('/select/<loc:path>')
async def select(request: Request, loc: str) -> HTTPResponse:
    return callapi('post', f'/select/{loc}', request.json)
