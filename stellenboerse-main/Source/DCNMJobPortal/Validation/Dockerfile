FROM node:21

WORKDIR /app

ARG PERSONAL_ACCESS_TOKEN

RUN apt-get update && apt-get install -y curl unzip

# Pfad noch für meinen Branch exklusiv, am Ende ändern
RUN curl --location --header "PRIVATE-TOKEN: ${PERSONAL_ACCESS_TOKEN}" "https://gitlab.dit.htwk-leipzig.de/api/v4/projects/1248/jobs/artifacts/main/download?job=build_validation" -o /tmp/artifacts.zip

RUN unzip /tmp/artifacts.zip && \
    rm /tmp/artifacts.zip

RUN mkdir /app/Source/DCNMJobPortal/Validation/dist/Validation/Config

COPY Validation/package-lock.json /app/Source/DCNMJobPortal/Validation
COPY Validation/package.json /app/Source/DCNMJobPortal/Validation
COPY Validation/Config/swaggerDocs.yaml /app/Source/DCNMJobPortal/Validation/dist/Validation/Config

WORKDIR /app/Source/DCNMJobPortal/Validation

RUN npm ci

EXPOSE 4020

RUN sed -i "s|localhost:\${process.env.DBSERVER_PORT}|database_handler:\${process.env.DBSERVER_PORT}|g" dist/Validation/Services/validationEmail.js

RUN sed -i "s|localhost:\${process.env.DBSERVER_PORT}|database_handler:\${process.env.DBSERVER_PORT}|g" dist/Validation/Controllers/validationController.js

RUN sed -i "s|localhost:3010|dcnm-stellen.imn.htwk-leipzig.de/validation|g" dist/Validation/Services/validationEmail.js


CMD sh -c "node dist/Validation/validationServer.js"
