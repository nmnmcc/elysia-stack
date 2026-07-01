  group "rustfs" {
    network {
      mode = "bridge"
      port "api"     { static = 9000 }
      port "console" { static = 9001 }
    }

    task "rustfs" {
      driver = "docker"
      config {
        image        = "rustfs/rustfs"
        network_mode = "elysia-stack"
        ports        = ["api", "console"]
        volumes      = ["elysia-stack-rustfs:/data"]
        args         = ["server", "/data", "--console-address", ":9001"]
      }

      env {
        RUSTFS_ROOT_USER     = "[[ var "s3_access_key" . ]]"
        RUSTFS_ROOT_PASSWORD = "[[ var "s3_secret_key" . ]]"
      }

      resources {
        cpu    = 100
        memory = 256
      }
    }

    task "setup" {
      driver = "docker"
      lifecycle {
        hook    = "poststart"
        sidecar = false
      }
      config {
        image        = "minio/mc"
        network_mode = "elysia-stack"
        entrypoint   = ["/bin/sh", "-c"]
        args = [
          <<-EOF
          until mc alias set local http://rustfs:9000 [[ var "s3_access_key" . ]] [[ var "s3_secret_key" . ]]; do sleep 1; done
          mc mb --ignore-existing local/elysia-stack
          EOF
        ]
      }

      resources {
        cpu    = 50
        memory = 64
      }
    }
  }
