// src/main.ts
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, Logger, BadRequestException } from "@nestjs/common";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { ValidationError as ClassValidatorError } from "class-validator";
import helmet from "helmet";
import { GlobalExceptionFilter } from "./common/filters/exception.filter";
import ErrorLoggingInterceptor from "./common/interceptors/error-logging.interceptor";
import { ConfigurationService } from "./config/configuration";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
    );

    const config = app.get(ConfigurationService);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        validateCustomDecorators: true,
        exceptionFactory: (errors: ClassValidatorError[]) => {
          const validationErrors = errors.reduce<Record<string, string[]>>(
            (acc, err) => {
              if (err.constraints) {
                acc[err.property] = Object.values(err.constraints);
              }
              return acc;
            },
            {},
          );

          throw new BadRequestException({
            statusCode: 400,
            message: "Validation failed",
            errors: validationErrors,
          });
        },
      }),
    );

    app.useGlobalFilters(new GlobalExceptionFilter(config));
    app.useGlobalInterceptors(new ErrorLoggingInterceptor());

    app.use(helmet({ crossOriginResourcePolicy: false }));
    app.setGlobalPrefix("/api");

    app.enableCors({
      origin: true,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    });

    await app.listen(config.port, "0.0.0.0");

    logger.log(`Application is running on: ${await app.getUrl()}`);
    logger.log(`Environment: ${config.nodeEnv}`);
  } catch (error) {
    logger.error("Failed to start application", error);
    process.exit(1);
  }
}

bootstrap();
