FROM python:3.11

WORKDIR /srv
COPY api api/
COPY jschon jschon/

WORKDIR /srv/api
RUN pip install -r requirements.txt

WORKDIR /srv
CMD ["sanic", "api.app", "--host=0.0.0.0", "--port=4444", "--workers=4", "--no-access-logs"]
