from sanic import Blueprint, HTTPResponse, Request, redirect

bp = Blueprint('home')


@bp.get('')
async def index(request: Request) -> HTTPResponse:
    return redirect('/schema')
