job "dev" {
  type        = "service"
  datacenters = ["dc1"]

  [[ template "_postgres" . ]]
  [[ template "_redis" . ]]
  [[ template "_rustfs" . ]]
  [[ template "_app" . ]]
}
