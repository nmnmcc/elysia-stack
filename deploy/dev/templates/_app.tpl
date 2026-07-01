  group "app" {
    network {
      mode = "bridge"
      port "backend"  { static = 30000 }
      port "frontend" { static = 3000 }
    }

    task "migrate" {
      driver = "raw_exec"
      lifecycle {
        hook    = "prestart"
        sidecar = false
      }
      config {
        command = "/bin/sh"
        args    = ["-c", "cd [[ var "project_root" . ]]/packages/backend && until yarn drizzle-kit migrate; do sleep 2; done"]
      }

      env {
        DATABASE_URL = "postgresql://[[ var "postgres_user" . ]]:[[ var "postgres_password" . ]]@127.0.0.1:5432/[[ var "postgres_db" . ]]"
      }
    }

    task "backend" {
      driver = "raw_exec"
      config {
        command = "/bin/sh"
        args    = ["-c", "cd [[ var "project_root" . ]] && bun --hot packages/backend/src/index.ts"]
      }

      env {
        PORT             = "30000"
        BETTER_AUTH_URL  = "http://localhost:30000"
        CORS_ORIGINS     = "http://localhost:3000"
        DATABASE_URL     = "postgresql://[[ var "postgres_user" . ]]:[[ var "postgres_password" . ]]@127.0.0.1:5432/[[ var "postgres_db" . ]]"
        S3_ENDPOINT      = "http://127.0.0.1:9000"
        S3_ACCESS_KEY_ID = "[[ var "s3_access_key" . ]]"
        S3_SECRET_ACCESS_KEY = "[[ var "s3_secret_key" . ]]"
        S3_BUCKET        = "elysia-stack"
        S3_REGION        = "us-east-1"
      }

      resources {
        cpu    = 500
        memory = 512
      }
    }

    task "frontend" {
      driver = "raw_exec"
      config {
        command = "/bin/sh"
        args    = ["-c", "cd [[ var "project_root" . ]] && yarn workspace @elysia-stack/frontend run next dev --turbopack -p 3000"]
      }

      env {
        PORT        = "3000"
        BACKEND_URL = "http://localhost:30000"
      }

      resources {
        cpu    = 300
        memory = 512
      }
    }
  }
