  group "redis" {
    network {
      port "redis" { static = 6379 }
    }

    service {
      name     = "redis"
      port     = "redis"
      provider = "nomad"

      check {
        type     = "tcp"
        port     = "redis"
        interval = "10s"
        timeout  = "2s"
      }
    }

    task "redis" {
      driver = "docker"
      config {
        image           = "redis:7"
        network_mode    = "[[ var "network" . ]]"
        network_aliases = ["redis"]
        ports           = ["redis"]
        args            = ["--maxmemory", "256mb", "--maxmemory-policy", "allkeys-lru", "--save", "60", "1000"]
      }

      resources {
        cpu    = 200
        memory = 384
      }
    }
  }
