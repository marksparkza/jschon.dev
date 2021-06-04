FROM python:3.9

WORKDIR /srv/jschon.dev
COPY server.py requirements.txt ./
COPY html html/
COPY static static/
RUN pip install -r requirements.txt

CMD ["sanic", "server.app", "--host=0.0.0.0", "--port=8000", "--workers=4"]
