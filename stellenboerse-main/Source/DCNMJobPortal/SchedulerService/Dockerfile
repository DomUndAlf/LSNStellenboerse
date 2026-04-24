FROM node:21

WORKDIR /app

ARG PERSONAL_ACCESS_TOKEN

RUN apt-get update && apt-get install -y curl unzip

RUN curl --location --header "PRIVATE-TOKEN: ${PERSONAL_ACCESS_TOKEN}" "https://gitlab.dit.htwk-leipzig.de/api/v4/projects/1248/jobs/artifacts/main/download?job=build_scheduler_service" -o /tmp/artifacts.zip

RUN unzip /tmp/artifacts.zip && \
    rm /tmp/artifacts.zip

COPY SchedulerService/package-lock.json /app/Source/DCNMJobPortal/SchedulerService
COPY SchedulerService/package.json /app/Source/DCNMJobPortal/SchedulerService

WORKDIR /app/Source/DCNMJobPortal/SchedulerService

RUN npm ci

RUN sed -i "s|localhost:\${process.env.WEBAGENT_PORT}|web_agent:\${process.env.WEBAGENT_PORT}|g" dist/SchedulerService/Services/scraperScheduler.js
RUN sed -i "s|localhost:\${process.env.DBSERVER_PORT}|database_handler:\${process.env.DBSERVER_PORT}|g" dist/SchedulerService/Services/cleanupScheduler.js

EXPOSE 4050

CMD sh -c "sleep 30 && node dist/SchedulerService/schedulerServer.js"
