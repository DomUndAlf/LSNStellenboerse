FROM node:21

WORKDIR /app

ARG PERSONAL_ACCESS_TOKEN

RUN apt-get update && apt-get install -y curl unzip

# Pfad noch für meinen Branch exklusiv, am Ende ändern
RUN curl --location --header "PRIVATE-TOKEN: ${PERSONAL_ACCESS_TOKEN}" "https://gitlab.dit.htwk-leipzig.de/api/v4/projects/1248/jobs/artifacts/main/download?job=build_database_handler" -o /tmp/artifacts.zip

RUN unzip /tmp/artifacts.zip && \
    rm /tmp/artifacts.zip

COPY DatabaseHandler/package-lock.json /app/Source/DCNMJobPortal/DatabaseHandler
COPY DatabaseHandler/package.json /app/Source/DCNMJobPortal/DatabaseHandler
COPY DatabaseHandler/Config/swaggerDocs.yaml /app/Source/DCNMJobPortal/DatabaseHandler/dist/DatabaseHandler/Config

WORKDIR /app/Source/DCNMJobPortal/DatabaseHandler

RUN npm ci

EXPOSE 4010

# Run migrations first, then start the server
# Increased sleep to 30s to ensure MySQL is fully ready (healthcheck start_period is 30s)
CMD sh -c "sleep 30 && npx typeorm-ts-node-commonjs migration:run -d dist/DatabaseHandler/Config/data-source.js && node dist/DatabaseHandler/databaseServer.js"
