from functools import cached_property
from typing import Any

import requests.utils
from sanic import Request


class APIClient:
    def __init__(self, request: Request) -> None:
        self.url = request.app.config.API

    @cached_property
    def version(self) -> str:
        return self.get('/version')

    def get(self, path: str, **params: Any) -> Any:
        return self.call('get', path, None, **params)

    def post(self, path: str, data: dict, **params: Any) -> Any:
        return self.call('post', path, data, **params)

    def call(
            self,
            method: str,
            path: str,
            data: dict | None,
            **params: Any,
    ) -> Any:
        try:
            r = requests.request(method, f'{self.url}{path}', json=data, params=params)
            r.raise_for_status()

            content_type = r.headers['content-type']
            if content_type.startswith('application/json'):
                return r.json()

            return requests.utils.get_unicode_from_response(r)

        except Exception as e:
            return {
                'exception': e.__class__.__name__,
                'message': str(e),
            }
