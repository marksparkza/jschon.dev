FROM python:3.11

WORKDIR /srv
COPY examples examples/
COPY static static/
COPY templates templates/
COPY ui ui/

WORKDIR /srv/ui
RUN pip install -r requirements.txt

WORKDIR /srv
CMD ["sanic", "ui.app", "--host=0.0.0.0", "--port=8888", "--workers=4", "--no-access-logs"]
