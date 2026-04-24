import swaggerJsDoc, { Options } from "swagger-jsdoc";
import { SwaggerDefinition } from "swagger-jsdoc";

const SWAGGER_DEFINITION: SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Scheduler API",
    version: "1.0.0",
    description: "API for scheduler service",
    servers: [{ url: "http://localhost:4050" }],
  },
};

const SWAGGER_OPTIONS: Options = {
  swaggerDefinition: SWAGGER_DEFINITION,
  apis: ["./Routers/*.ts"],
};

const SWAGGER_DOCS: object = swaggerJsDoc(SWAGGER_OPTIONS);

export default SWAGGER_DOCS;
