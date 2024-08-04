variable "confluent_cloud_api_key" {
  description = "Confluent Cloud API Key (also referred as Cloud API ID)"
  type        = string
}

variable "confluent_cloud_api_secret" {
  description = "Confluent Cloud API Secret"
  type        = string
  sensitive   = true
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "mongodbatlas_public_key" {
  description = "The public API key for MongoDB Atlas"
  type        = string
}

variable "mongodbatlas_private_key" {
  description = "The private API key for MongoDB Atlas"
  type        = string
}

variable "mongodbatlas_project_id" {
  description = "Project ID for MongoDB Atlas"
  type        = string
  default     = "66a5808b1a6e291397daf5e2"
}

variable "mongodbatlas_region" {
  description = "MongoDB Atlas region https://www.mongodb.com/docs/atlas/reference/amazon-aws/#std-label-amazon-aws"
  type        = string
  default     = "US_EAST_1"
}

variable "mongodbatlas_database_username" {
  description = "MongoDB Atlas database username. You can change it through command line"
  type        = string
  default     = "dappilig"
}

variable "mongodbatlas_database_password" {
  description = "MongoDB Atlas database password. You can change it through command line"
  type        = string
  default     = "Prokarma"
}

variable "openai_key" {
  description = "MongoDB Atlas database password. You can change it through command line"
  type        = string
  default     = "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"
}