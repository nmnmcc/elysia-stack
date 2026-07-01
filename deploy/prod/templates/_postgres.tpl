  group "postgres" {
    network {
      port "db" { static = 5432 }
    }

    service {
      name     = "postgres"
      port     = "db"
      provider = "nomad"

      check {
        type     = "tcp"
        port     = "db"
        interval = "10s"
        timeout  = "2s"
      }
    }

    task "postgres" {
      driver = "docker"
      config {
        image           = "postgres:17"
        network_mode    = "[[ var "network" . ]]"
        network_aliases = ["postgres"]
        ports           = ["db"]
        volumes         = ["elysia-stack-postgres:/var/lib/postgresql/data"]
        args            = [
          "-c", "max_connections=200",
          "-c", "shared_buffers=256MB",
          "-c", "effective_cache_size=768MB",
          "-c", "work_mem=4MB",
          "-c", "wal_level=logical",
        ]
      }

      env {
        POSTGRES_USER     = "[[ var "postgres_user" . ]]"
        POSTGRES_PASSWORD = "[[ var "postgres_password" . ]]"
        POSTGRES_DB       = "[[ var "postgres_db" . ]]"
      }

      resources {
        cpu    = 500
        memory = 1024
      }
    }
  }
