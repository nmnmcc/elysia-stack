  group "redis" {
    network {
      mode = "bridge"
      port "redis" { static = 6379 }
    }

    task "redis" {
      driver = "docker"
      config {
        image        = "redis:7"
        network_mode = "elysia-stack"
        ports        = ["redis"]
      }

      resources {
        cpu    = 100
        memory = 128
      }
    }
  }
