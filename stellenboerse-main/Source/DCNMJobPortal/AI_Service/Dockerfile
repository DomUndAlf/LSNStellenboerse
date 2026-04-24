FROM node:21

WORKDIR /app

ARG PERSONAL_ACCESS_TOKEN

RUN apt-get update && apt-get install -y curl unzip

# Pfad noch für meinen Branch exklusiv, am Ende ändern
RUN curl --location --header "PRIVATE-TOKEN: ${PERSONAL_ACCESS_TOKEN}" "https://gitlab.dit.htwk-leipzig.de/api/v4/projects/1248/jobs/artifacts/main/download?job=build_ai_service" -o /tmp/artifacts.zip

RUN unzip /tmp/artifacts.zip && \
    rm /tmp/artifacts.zip

RUN mkdir /app/Source/DCNMJobPortal/AI_Service/dist/AI_Service/Config

RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN apt-get install -y ./google-chrome-stable_current_amd64.deb
RUN google-chrome --version

COPY AI_Service/package-lock.json /app/Source/DCNMJobPortal/AI_Service
COPY AI_Service/package.json /app/Source/DCNMJobPortal/AI_Service
COPY AI_Service/Config/swaggerDocs.yaml /app/Source/DCNMJobPortal/AI_Service/dist/AI_Service/Config

WORKDIR /app/Source/DCNMJobPortal/AI_Service

RUN npm ci

EXPOSE 4040

RUN sed -i "s|localhost:\${process.env.VALIDATION_PORT}|validation:\${process.env.VALIDATION_PORT}|g" dist/AI_Service/Services/jobExtractor.js
RUN sed -i "s|localhost:\${process.env.DBSERVER_PORT}|database_handler:\${process.env.DBSERVER_PORT}|g" dist/AI_Service/Services/jobExtractor.js
RUN sed -i "s|localhost:\${process.env.DBSERVER_PORT}|database_handler:\${process.env.DBSERVER_PORT}|g" dist/AI_Service/Services/urlClassificationUtils.js
RUN sed -i "s|localhost:\${process.env.DBSERVER_PORT}|database_handler:\${process.env.DBSERVER_PORT}|g" dist/AI_Service/Services/urlClassification.js
RUN sed -i "s|localhost:\${process.env.DBSERVER_PORT}|database_handler:\${process.env.DBSERVER_PORT}|g" dist/AI_Service/Services/extractDetails.js
RUN sed -i "s|localhost:\${process.env.DBSERVER_PORT}|database_handler:\${process.env.DBSERVER_PORT}|g" dist/AI_Service/Services/pdfService.js
RUN sed -i "s|localhost:\${process.env.VALIDATION_PORT}|validation:\${process.env.VALIDATION_PORT}|g" dist/AI_Service/Services/pdfService.js

CMD node dist/AI_Service/aiServer.js
