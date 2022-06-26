import pathlib

import requests
from jinja2 import Environment, FileSystemLoader
from sanic import HTTPResponse, Request, Sanic, html, json

rootdir = pathlib.Path(__file__).parent

app = Sanic('jschon-ui', env_prefix='JSCHON_')
app.ctx.template_env = Environment(
    loader=FileSystemLoader('templates'),
    autoescape=True,
)
app.ctx.template_env.globals |= dict(
    url_for=app.url_for,
)
app.static('/static', rootdir / 'static')

api = {
    'next': app.config.API_NEXT,
    'stable': app.config.API_STABLE,
}


def version(branch: str) -> str:
    r = requests.get(f'{api[branch]}/version')
    r.raise_for_status()
    return r.text


@app.get('')
async def index(request: Request) -> HTTPResponse:
    template = request.app.ctx.template_env.get_template('index.html')
    return html(template.render(
        stable_version=version('stable'),
        next_version=version('next'),
    ))


@app.post('/<branch:str>/evaluate')
async def evaluate(request: Request, branch: str) -> HTTPResponse:
    r = requests.post(f'{api[branch]}/evaluate', json=request.json)
    r.raise_for_status()
    return json(r.json())
