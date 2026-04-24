FROM node:21

WORKDIR /app

ARG PERSONAL_ACCESS_TOKEN

RUN apt-get update && apt-get install -y curl unzip

RUN curl --location --header "PRIVATE-TOKEN: ${PERSONAL_ACCESS_TOKEN}" "https://gitlab.dit.htwk-leipzig.de/api/v4/projects/1248/jobs/artifacts/main/download?job=build_frontend" -o /tmp/artifacts.zip

RUN unzip /tmp/artifacts.zip && \
    rm /tmp/artifacts.zip

COPY package-lock.json /app/Source/DCNMJobPortal/Frontend
COPY package.json /app/Source/DCNMJobPortal/Frontend

WORKDIR /app/Source/DCNMJobPortal/Frontend

RUN sed -i 's|http://localhost:4010/api/jobs|https://dcnm-stellen.imn.htwk-leipzig.de/api/jobs|g' build/static/js/main*.js
RUN sed -i 's|http://localhost:4010/api/employers/distinct/name|https://dcnm-stellen.imn.htwk-leipzig.de/api/employers/distinct/name|g' build/static/js/main*.js
RUN sed -i 's|http://localhost:4010/api/privileges|https://dcnm-stellen.imn.htwk-leipzig.de/api/privileges|g' build/static/js/main*.js
RUN sed -i 's|http://localhost:4010/api/employers|https://dcnm-stellen.imn.htwk-leipzig.de/api/employers|g' build/static/js/main*.js
RUN sed -i 's|http://localhost:4010/api/locations|https://dcnm-stellen.imn.htwk-leipzig.de/api/locations|g' build/static/js/main*.js
RUN sed -i 's|http://localhost:4010/api/keyword|https://dcnm-stellen.imn.htwk-leipzig.de/api/keyword|g' build/static/js/main*.js
RUN sed -i 's|http://localhost:4010/api/tool/jobs|https://dcnm-stellen.imn.htwk-leipzig.de/api/tool/jobs|g' build/static/js/main*.js
RUN sed -i 's|http://localhost:3010?key=|https://dcnm-stellen.imn.htwk-leipzig.de?key=|g' build/static/js/main*.js
RUN sed -i 's|http://141.57.11.6|https://dcnm-stellen.imn.htwk-leipzig.de|g' build/static/js/main*.js

RUN npm ci
RUN npm install -g serve

EXPOSE 3000

CMD serve -s build
