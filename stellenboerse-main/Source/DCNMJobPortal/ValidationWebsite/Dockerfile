FROM node:21

WORKDIR /app

ARG PERSONAL_ACCESS_TOKEN

RUN apt-get update && apt-get install -y curl unzip

#hier noch am ende main ändern
RUN curl --location --header "PRIVATE-TOKEN: ${PERSONAL_ACCESS_TOKEN}" "https://gitlab.dit.htwk-leipzig.de/api/v4/projects/1248/jobs/artifacts/main/download?job=build_validation_website" -o /tmp/artifacts.zip

RUN unzip /tmp/artifacts.zip && \
    rm /tmp/artifacts.zip

COPY package-lock.json /app/Source/DCNMJobPortal/ValidationWebsite
COPY package.json /app/Source/DCNMJobPortal/ValidationWebsite

WORKDIR /app/Source/DCNMJobPortal/ValidationWebsite

RUN npm install
RUN npm install -g serve

#mal gucken ob das passt
RUN sed -i 's|http://localhost:4010|https://dcnm-stellen.imn.htwk-leipzig.de|g' build/static/js/main*.js \
 && sed -i 's|http://localhost:3000|https://dcnm-stellen.imn.htwk-leipzig.de|g' build/static/js/main*.js \
 && sed -i 's|/static/js/|/validation/static/js/|g' build/index.html \
 && sed -i 's|/static/css/|/validation/static/css/|g' build/index.html

EXPOSE 3010

CMD serve -s build -l 3010
