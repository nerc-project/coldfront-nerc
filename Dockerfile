# This Dockerfile uses a multi-stage build
# * The builder image installs the compile time dependencies and
#   installs the pip packages into a virtual environment.
# * The final image copies the virtual environment over and
#   installs netcat and mysql libraries as runtime deps.

# Builder Image
FROM python:3.9-slim-bullseye as builder

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential default-libmysqlclient-dev git && \
    apt-get clean -y

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt /tmp/requirements.txt
RUN pip3 install -r /tmp/requirements.txt

# Final Image
FROM python:3.9-slim-bullseye

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        netcat libmariadb3 && \
    apt-get clean -y

COPY --from=builder --chown=1001:0 /opt/venv /opt/venv
COPY src/local_settings.py /opt/venv/lib/python3.9/site-packages

COPY src/bin/run_coldfront.sh /opt/venv/bin

ENV PATH="/opt/venv/bin:$PATH"
ENV DJANGO_SETTINGS_MODULE="local_settings"

EXPOSE 8080

USER 1001

CMD [ "run_coldfront.sh" ]
