client {
  host_volume "docker-sock" {
    path      = "/var/run/docker.sock"
    read_only = true
  }
}

plugin "docker" {
  config {
    volumes {
      enabled = true
    }
  }
}
