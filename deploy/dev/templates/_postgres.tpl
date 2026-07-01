  group "postgres" {
    network {
      mode = "bridge"
      port "db" { static = 5432 }
    }

    task "postgres" {
      driver = "docker"
      config {
        image        = "postgres:17"
        network_mode = "elysia-stack"
        ports        = ["db"]
        volumes      = ["elysia-stack-postgres:/var/lib/postgresql/data"]
        args         = ["-c", "wal_level=logical"]
      }

      env {
        POSTGRES_USER     = "[[ var "postgres_user" . ]]"
        POSTGRES_PASSWORD = "[[ var "postgres_password" . ]]"
        POSTGRES_DB       = "[[ var "postgres_db" . ]]"
      }

      resources {
        cpu    = 200
        memory = 512
      }
    }
  }
