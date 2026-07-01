export interface AppConfig {
  readonly server: {
    readonly host: string;
    readonly port: number;
    readonly corsOrigins: string[];
  };
  readonly auth: {
    readonly baseURL: string;
  };
  readonly database: {
    readonly url: string;
  };
  readonly s3: {
    readonly endpoint: string;
    readonly accessKeyId: string;
    readonly secretAccessKey: string;
    readonly bucket: string;
    readonly region: string;
  };
}

const read = (key: string, fallback?: string) => process.env[key] ?? fallback;

export function loadConfig(): AppConfig {
  const port = Number(read("PORT", "30000"));

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return {
    server: {
      host: read("HOST", "0.0.0.0")!,
      port,
      corsOrigins: read("CORS_ORIGINS", "http://localhost:3000")!
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    },
    auth: {
      baseURL: read("BETTER_AUTH_URL", `http://localhost:${port}`)!,
    },
    database: {
      url: read("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/elysia_stack")!,
    },
    s3: {
      endpoint: read("S3_ENDPOINT", "http://localhost:9000")!,
      accessKeyId: read("S3_ACCESS_KEY_ID", "minioadmin")!,
      secretAccessKey: read("S3_SECRET_ACCESS_KEY", "minioadmin")!,
      bucket: read("S3_BUCKET", "elysia-stack")!,
      region: read("S3_REGION", "us-east-1")!,
    },
  };
}
