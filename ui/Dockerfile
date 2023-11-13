FROM python:3.11

WORKDIR /srv
COPY ui ui/
RUN pip install -r ui/requirements.txt

CMD ["sanic", "ui.app", "--host=0.0.0.0", "--port=8888", "--workers=4", "--no-access-logs"]
