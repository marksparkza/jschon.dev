from pathlib import Path

import yaml
from jinja2 import Environment, FileSystemLoader
from sanic import Sanic

from ui.client import APIClient
from ui.views import home, schema

project_dir = Path(__file__).parent.parent

with open(project_dir / 'templates' / '3rdparty.yml') as f:
    _3rdparty = yaml.safe_load(f)
with open(project_dir / 'examples' / 'demo-schema.json') as f:
    demo_schema = f.read()
with open(project_dir / 'examples' / 'demo-instance.json') as f:
    demo_instance = f.read()

app = Sanic('jschon-ui', env_prefix='JSCHON_')
app.ext.add_dependency(APIClient)
app.blueprint((
    home.bp,
    schema.bp,
))
app.static('/static', project_dir / 'static')
app.ctx.template_env = Environment(loader=FileSystemLoader(project_dir / 'templates'), autoescape=True)
app.ctx.template_env.globals |= dict(
    url_for=app.url_for,
    css=_3rdparty['css'],
    js=_3rdparty['js'],
    demo_schema=demo_schema,
    demo_instance=demo_instance,
)
