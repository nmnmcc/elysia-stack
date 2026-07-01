variable "project_root" {
  description = "Absolute path to the project root on the host"
  type        = string
}

variable "postgres_user" {
  type    = string
  default = "elysia_stack"
}

variable "postgres_password" {
  type    = string
  default = "elysia_stack"
}

variable "postgres_db" {
  type    = string
  default = "elysia_stack"
}

variable "s3_access_key" {
  type    = string
  default = "elysia-stack-dev"
}

variable "s3_secret_key" {
  type    = string
  default = "elysia-stack-dev-secret"
}
