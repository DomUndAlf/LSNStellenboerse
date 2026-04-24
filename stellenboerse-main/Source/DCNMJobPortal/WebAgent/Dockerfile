FROM node:21

WORKDIR /app

ARG PERSONAL_ACCESS_TOKEN

RUN apt-get update && apt-get install -y curl unzip

# Pfad noch für meinen Branch exklusiv, am Ende ändern
RUN curl --location --header "PRIVATE-TOKEN: ${PERSONAL_ACCESS_TOKEN}" "https://gitlab.dit.htwk-leipzig.de/api/v4/projects/1248/jobs/artifacts/main/download?job=build_web_agent" -o /tmp/artifacts.zip

RUN unzip /tmp/artifacts.zip && \
    rm /tmp/artifacts.zip

RUN mkdir /app/Source/DCNMJobPortal/WebAgent/dist/WebAgent/Config

COPY WebAgent/package-lock.json /app/Source/DCNMJobPortal/WebAgent
COPY WebAgent/package.json /app/Source/DCNMJobPortal/WebAgent
COPY WebAgent/Config/swaggerDocs.yaml /app/Source/DCNMJobPortal/WebAgent/dist/WebAgent/Config

WORKDIR /app/Source/DCNMJobPortal/WebAgent

RUN npm ci

EXPOSE 4030

RUN sed -i "s|localhost:\${process.env.DBSERVER_PORT}|database_handler:\${process.env.DBSERVER_PORT}|g" dist/WebAgent/Services/crawlerManager.js

RUN sed -i "s|localhost:\${process.env.AI_PORT}|ai_service:\${process.env.AI_PORT}|g" dist/WebAgent/Services/crawlerManager.js

RUN sed -i "s|localhost:\${process.env.AI_PORT}|ai_service:\${process.env.AI_PORT}|g" dist/WebAgent/Services/webMonitorUtils.js

RUN sed -i "s|localhost:\${process.env.DBSERVER_PORT}|database_handler:\${process.env.DBSERVER_PORT}|g" dist/WebAgent/Services/webMonitorUtils.js

# Increased sleep to 35s to ensure database_handler is fully initialized and healthy
# database_handler needs: 30s sleep + migrations + server start + healthcheck
CMD sh -c "sleep 35 && node dist/WebAgent/webAgentServer.js"
