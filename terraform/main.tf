terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
    confluent = {
      source  = "confluentinc/confluent"
      version = "1.82.0"
    }
    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "1.8.0"
    }
  }
}

provider "confluent" {
  cloud_api_key    = var.confluent_cloud_api_key
  cloud_api_secret = var.confluent_cloud_api_secret
}

provider "confluent" {
  # https://developer.hashicorp.com/terraform/language/providers/configuration#alias-multiple-provider-configurations
  alias = "kafka"

  cloud_api_key    = var.confluent_cloud_api_key
  cloud_api_secret = var.confluent_cloud_api_secret

  #   kafka_id            = confluent_kafka_cluster.dedicated.id
  kafka_rest_endpoint = confluent_kafka_cluster.dedicated.rest_endpoint
  kafka_api_key       = confluent_api_key.genaidemo-manager-kafka-api-key.id
  kafka_api_secret    = confluent_api_key.genaidemo-manager-kafka-api-key.secret
}

provider "aws" {
  region = var.region
}

# Configure the MongoDB Atlas Provider
provider "mongodbatlas" {
  public_key  = var.mongodbatlas_public_key
  private_key = var.mongodbatlas_private_key
}

resource "confluent_environment" "genaidemo" {
  display_name = "GenAI_Demo"
  stream_governance {
    package = "ADVANCED"
  }
}

data "confluent_organization" "main" {}

data "confluent_schema_registry_cluster" "advanced" {
  environment {
    id = confluent_environment.genaidemo.id
  }

  depends_on = [
    confluent_kafka_cluster.dedicated
  ]
}

data "confluent_flink_region" "genaidemoflink" {
  cloud   = "AWS"
  region  = "us-east-1"
}

resource "confluent_kafka_cluster" "dedicated" {
  display_name = "genaidemo_cluster"
  availability = "SINGLE_ZONE"
  cloud        = "AWS"
  region       = "us-east-1"

  dedicated {
    cku = 1
  }

  environment {
    id = confluent_environment.genaidemo.id
  }
}

# 'genaidemo-manager' service account is required in this configuration to create topics and grant ACLs
# to 'genaidemo-producer' and 'genaidemo-manager' service accounts.
resource "confluent_service_account" "genaidemo-manager" {
  display_name = "genaidemo-manager"
  description  = "Service account to manage 'demo' Kafka cluster"
}
// Service account to perform a task within Confluent Cloud, such as executing a Flink statement
resource "confluent_service_account" "statements-runner" {
  display_name = "statements-runner"
  description  = "Service account for running Flink Statements in 'inventory' Kafka cluster"
}

resource "confluent_role_binding" "genaidemo-manager-kafka-cluster-admin" {
  principal   = "User:${confluent_service_account.genaidemo-manager.id}"
  role_name   = "CloudClusterAdmin"
  crn_pattern = confluent_kafka_cluster.dedicated.rbac_crn
}
resource "confluent_role_binding" "genaidemo-manager-flink-developer" {
  principal   = "User:${confluent_service_account.genaidemo-manager.id}"
  role_name   = "FlinkDeveloper"
  crn_pattern = confluent_environment.genaidemo.resource_name
}
resource "confluent_role_binding" "statements-runner-environment-admin" {
  principal   = "User:${confluent_service_account.statements-runner.id}"
  role_name   = "EnvironmentAdmin"
  crn_pattern = confluent_environment.genaidemo.resource_name
}
resource "confluent_role_binding" "infrastructure-manager-environment-admin" {
  principal   = "User:${confluent_service_account.genaidemo-manager.id}"
  role_name   = "EnvironmentAdmin"
  crn_pattern = confluent_environment.genaidemo.resource_name
}
// https://docs.confluent.io/cloud/current/access-management/access-control/rbac/predefined-rbac-roles.html#assigner
// https://docs.confluent.io/cloud/current/flink/operate-and-deploy/flink-rbac.html#submit-long-running-statements
resource "confluent_role_binding" "genaidemo-manager-assigner" {
  principal   = "User:${confluent_service_account.genaidemo-manager.id}"
  role_name   = "Assigner"
  crn_pattern = "${data.confluent_organization.main.resource_name}/service-account=${confluent_service_account.statements-runner.id}"
}

// schema registry role binding
resource "confluent_role_binding" "all-subjects-example-rb" {
  principal   = "User:${confluent_service_account.genaidemo-manager.id}"
  role_name   = "ResourceOwner"
  crn_pattern = "${data.confluent_schema_registry_cluster.advanced.resource_name}/subject=*"
}

# Kafka API key
resource "confluent_api_key" "genaidemo-manager-kafka-api-key" {
  display_name = "genaidemo-manager-kafka-api-key"
  description  = "Kafka API Key that is owned by 'genaidemo-manager' service account"
  owner {
    id          = confluent_service_account.genaidemo-manager.id
    api_version = confluent_service_account.genaidemo-manager.api_version
    kind        = confluent_service_account.genaidemo-manager.kind
  }

  managed_resource {
    id          = confluent_kafka_cluster.dedicated.id
    api_version = confluent_kafka_cluster.dedicated.api_version
    kind        = confluent_kafka_cluster.dedicated.kind

    environment {
      id = confluent_environment.genaidemo.id
    }
  }


  # The goal is to ensure that confluent_role_binding.genaidemo-manager-kafka-cluster-admin is created before
  # confluent_api_key.genaidemo-manager-kafka-api-key is used to create instances of
  # confluent_kafka_topic, confluent_kafka_acl resources.

  # 'depends_on' meta-argument is specified in confluent_api_key.genaidemo-manager-kafka-api-key to avoid having
  # multiple copies of this definition in the configuration which would happen if we specify it in
  # confluent_kafka_topic, confluent_kafka_acl resources instead.
  depends_on = [
    confluent_role_binding.genaidemo-manager-kafka-cluster-admin
  ]
}
# Schema registry API key

resource "confluent_api_key" "genaidemo-manager-schema-registry-api-key" {
  display_name = "genaidemo-manager-schema-registry-api-key"
  description  = "Schema Registry API Key that is owned by 'infrastructure-manager' service account"
  owner {
    id          = confluent_service_account.genaidemo-manager.id
    api_version = confluent_service_account.genaidemo-manager.api_version
    kind        = confluent_service_account.genaidemo-manager.kind
  }

  managed_resource {
    id          = data.confluent_schema_registry_cluster.advanced.id
    api_version = data.confluent_schema_registry_cluster.advanced.api_version
    kind        = data.confluent_schema_registry_cluster.advanced.kind

    environment {
      id = confluent_environment.genaidemo.id
    }
  }
  depends_on = [
    confluent_role_binding.infrastructure-manager-environment-admin,
    confluent_role_binding.all-subjects-example-rb
  ]
}
# Flink API Key
resource "confluent_api_key" "genaidemo-manager-flink-api-key" {
  display_name = "genaidemo-manager-flink-api-key"
  description  = "Flink API Key that is owned by 'genaidemo-manager' service account"
  owner {
    id          = confluent_service_account.genaidemo-manager.id
    api_version = confluent_service_account.genaidemo-manager.api_version
    kind        = confluent_service_account.genaidemo-manager.kind
  }
  managed_resource {
    id          = data.confluent_flink_region.genaidemoflink.id
    api_version = data.confluent_flink_region.genaidemoflink.api_version
    kind        = data.confluent_flink_region.genaidemoflink.kind
    environment {
      id = confluent_environment.genaidemo.id
    }
  }
  depends_on = [
    confluent_role_binding.all-subjects-example-rb
  ]
}
# register schemas
# jobseekerv1 schema
resource "confluent_schema" "jobseekerv1" {
  schema_registry_cluster {
    id = data.confluent_schema_registry_cluster.advanced.id
  }
  rest_endpoint = data.confluent_schema_registry_cluster.advanced.rest_endpoint
  # https://developer.confluent.io/learn-kafka/schema-registry/schema-subjects/#topicnamestrategy
  subject_name = "${confluent_kafka_topic.jobseekerv1.topic_name}-value"
  format       = "AVRO"
  schema       = file("../Schemas/jobseekerv1.avsc")
  credentials {
    key    = confluent_api_key.genaidemo-manager-schema-registry-api-key.id
    secret = confluent_api_key.genaidemo-manager-schema-registry-api-key.secret
  }
}


# jobseekerresv1 schema
resource "confluent_schema" "jobseekerresv1" {
  schema_registry_cluster {
    id = data.confluent_schema_registry_cluster.advanced.id
  }
  rest_endpoint = data.confluent_schema_registry_cluster.advanced.rest_endpoint
  # https://developer.confluent.io/learn-kafka/schema-registry/schema-subjects/#topicnamestrategy
  subject_name = "${confluent_kafka_topic.jobseekerresv1.topic_name}-value"
  format       = "AVRO"
  schema       = file("../Schemas/jobseekerresv1.avsc")
  credentials {
    key    = confluent_api_key.genaidemo-manager-schema-registry-api-key.id
    secret = confluent_api_key.genaidemo-manager-schema-registry-api-key.secret
  }
}


# jobpostreq schema
resource "confluent_schema" "jobpostreq" {
  schema_registry_cluster {
    id = data.confluent_schema_registry_cluster.advanced.id
  }
  rest_endpoint = data.confluent_schema_registry_cluster.advanced.rest_endpoint
  # https://developer.confluent.io/learn-kafka/schema-registry/schema-subjects/#topicnamestrategy
  subject_name = "${confluent_kafka_topic.jobpostreq.topic_name}-value"
  format       = "AVRO"
  schema       = file("../Schemas/jobpostreq.avsc")
  credentials {
    key    = confluent_api_key.genaidemo-manager-schema-registry-api-key.id
    secret = confluent_api_key.genaidemo-manager-schema-registry-api-key.secret
  }
}

# jobpostresv2 schema
resource "confluent_schema" "jobpostresv2" {
  schema_registry_cluster {
    id = data.confluent_schema_registry_cluster.advanced.id
  }
  rest_endpoint = data.confluent_schema_registry_cluster.advanced.rest_endpoint
  # https://developer.confluent.io/learn-kafka/schema-registry/schema-subjects/#topicnamestrategy
  subject_name = "${confluent_kafka_topic.jobpostresv2.topic_name}-value"
  format       = "AVRO"
  schema       = file("../Schemas/jobpostresv2.avsc")
  credentials {
    key    = confluent_api_key.genaidemo-manager-schema-registry-api-key.id
    secret = confluent_api_key.genaidemo-manager-schema-registry-api-key.secret
  }
}

# uploaddocs schema
resource "confluent_schema" "uploaddocs" {
  schema_registry_cluster {
    id = data.confluent_schema_registry_cluster.advanced.id
  }
  rest_endpoint = data.confluent_schema_registry_cluster.advanced.rest_endpoint
  # https://developer.confluent.io/learn-kafka/schema-registry/schema-subjects/#topicnamestrategy
  subject_name = "${confluent_kafka_topic.uploaddocs.topic_name}-value"
  format       = "AVRO"
  schema       = file("../Schemas/uploaddocs.avsc")
  credentials {
    key    = confluent_api_key.genaidemo-manager-schema-registry-api-key.id
    secret = confluent_api_key.genaidemo-manager-schema-registry-api-key.secret
  }
}


# Create jobseekerv1 topic
resource "confluent_kafka_topic" "jobseekerv1" {
  kafka_cluster {
    id = confluent_kafka_cluster.dedicated.id
  }

  topic_name       = "jobseekerv1"
  rest_endpoint    = confluent_kafka_cluster.dedicated.rest_endpoint
  partitions_count = 1
  credentials {
    key    = confluent_api_key.genaidemo-manager-kafka-api-key.id
    secret = confluent_api_key.genaidemo-manager-kafka-api-key.secret
  }
}

# Create jobpostreq topic jobpostreq
resource "confluent_kafka_topic" "jobpostreq" {
  kafka_cluster {
    id = confluent_kafka_cluster.dedicated.id
  }

  topic_name       = "jobpostreq"
  rest_endpoint    = confluent_kafka_cluster.dedicated.rest_endpoint
  partitions_count = 1
  credentials {
    key    = confluent_api_key.genaidemo-manager-kafka-api-key.id
    secret = confluent_api_key.genaidemo-manager-kafka-api-key.secret
  }
}

# Create jobseekerresv1 topic jobseekerresv1

resource "confluent_kafka_topic" "jobseekerresv1" {
  kafka_cluster {
    id = confluent_kafka_cluster.dedicated.id
  }

  topic_name       = "jobseekerresv1"
  rest_endpoint    = confluent_kafka_cluster.dedicated.rest_endpoint
  partitions_count = 1
  credentials {
    key    = confluent_api_key.genaidemo-manager-kafka-api-key.id
    secret = confluent_api_key.genaidemo-manager-kafka-api-key.secret
  }
}

# Create jobpostresv2 topic jobpostresv2

resource "confluent_kafka_topic" "jobpostresv2" {
  kafka_cluster {
    id = confluent_kafka_cluster.dedicated.id
  }

  topic_name       = "jobpostresv2"
  rest_endpoint    = confluent_kafka_cluster.dedicated.rest_endpoint
  partitions_count = 1
  credentials {
    key    = confluent_api_key.genaidemo-manager-kafka-api-key.id
    secret = confluent_api_key.genaidemo-manager-kafka-api-key.secret
  }
}

# Create docembedding topic docembedding

resource "confluent_kafka_topic" "uploaddocs" {
  kafka_cluster {
    id = confluent_kafka_cluster.dedicated.id
  }

  topic_name       = "uploaddocs"
  rest_endpoint    = confluent_kafka_cluster.dedicated.rest_endpoint
  partitions_count = 1
  credentials {
    key    = confluent_api_key.genaidemo-manager-kafka-api-key.id
    secret = confluent_api_key.genaidemo-manager-kafka-api-key.secret
  }
}

# Flink compute pool
resource "confluent_flink_compute_pool" "genaiflink" {
  display_name = "genai-compute-pool"
  cloud        = data.confluent_flink_region.genaidemoflink.cloud
  region       = data.confluent_flink_region.genaidemoflink.region
  max_cfu      = 5
  environment {
    id = confluent_environment.genaidemo.id
  }
  depends_on = [
    confluent_role_binding.statements-runner-environment-admin,
    confluent_role_binding.genaidemo-manager-assigner,
    confluent_role_binding.genaidemo-manager-flink-developer,
    confluent_api_key.genaidemo-manager-flink-api-key,
  ]
}


# Create careerguide

resource "confluent_flink_statement" "create-careerguide-flink" {
  organization {
    id = data.confluent_organization.main.id
  }
  environment {
    id = confluent_environment.genaidemo.id
  }
  compute_pool {
    id = confluent_flink_compute_pool.genaiflink.id
  }
  principal {
    id = confluent_service_account.statements-runner.id
  }
  # https://docs.confluent.io/cloud/current/flink/reference/example-data.html#marketplace-database
  statement = file("../Statements/create-careerguide-flink.sql")
  properties = {
    "sql.current-catalog"  = confluent_environment.genaidemo.display_name
    "sql.current-database" = confluent_kafka_cluster.dedicated.display_name
    "sql.secrets.openaikey" = var.openai_key
  }
  rest_endpoint = data.confluent_flink_region.genaidemoflink.rest_endpoint
  credentials {
    key    = confluent_api_key.genaidemo-manager-flink-api-key.id
    secret = confluent_api_key.genaidemo-manager-flink-api-key.secret
  }
}

# Create AI model

resource "confluent_flink_statement" "model-profileembedding" {
  organization {
    id = data.confluent_organization.main.id
  }
  environment {
    id = confluent_environment.genaidemo.id
  }
  compute_pool {
    id = confluent_flink_compute_pool.genaiflink.id
  }
  principal {
    id = confluent_service_account.statements-runner.id
  }
  # https://docs.confluent.io/cloud/current/flink/reference/example-data.html#marketplace-database
  statement = file("../Statements/model-profileembedding.sql")
  properties = {
    "sql.current-catalog"  = confluent_environment.genaidemo.display_name
    "sql.current-database" = confluent_kafka_cluster.dedicated.display_name
    "sql.secrets.openaikey" = var.openai_key
  }
  rest_endpoint = data.confluent_flink_region.genaidemoflink.rest_endpoint
  credentials {
    key    = confluent_api_key.genaidemo-manager-flink-api-key.id
    secret = confluent_api_key.genaidemo-manager-flink-api-key.secret
  }
}

# create jobseekerprofilev3

resource "confluent_flink_statement" "create-jobseekerprofilev3" {
  organization {
    id = data.confluent_organization.main.id
  }
  environment {
    id = confluent_environment.genaidemo.id
  }
  compute_pool {
    id = confluent_flink_compute_pool.genaiflink.id
  }
  principal {
    id = confluent_service_account.statements-runner.id
  }
  # https://docs.confluent.io/cloud/current/flink/reference/example-data.html#marketplace-database
  statement = file("../Statements/create-jobseekerprofilev3.sql")
  properties = {
    "sql.current-catalog"  = confluent_environment.genaidemo.display_name
    "sql.current-database" = confluent_kafka_cluster.dedicated.display_name
    "sql.secrets.openaikey" = var.openai_key
  }
  rest_endpoint = data.confluent_flink_region.genaidemoflink.rest_endpoint
  credentials {
    key    = confluent_api_key.genaidemo-manager-flink-api-key.id
    secret = confluent_api_key.genaidemo-manager-flink-api-key.secret
  }
}

# create jobseekerprofilev3

resource "confluent_flink_statement" "create-jobseeker-enriched" {
  organization {
    id = data.confluent_organization.main.id
  }
  environment {
    id = confluent_environment.genaidemo.id
  }
  compute_pool {
    id = confluent_flink_compute_pool.genaiflink.id
  }
  principal {
    id = confluent_service_account.statements-runner.id
  }
  # https://docs.confluent.io/cloud/current/flink/reference/example-data.html#marketplace-database
  statement = file("../Statements/create-jobseeker-enriched.sql")
  properties = {
    "sql.current-catalog"  = confluent_environment.genaidemo.display_name
    "sql.current-database" = confluent_kafka_cluster.dedicated.display_name
    "sql.secrets.openaikey" = var.openai_key
  }
  rest_endpoint = data.confluent_flink_region.genaidemoflink.rest_endpoint
  credentials {
    key    = confluent_api_key.genaidemo-manager-flink-api-key.id
    secret = confluent_api_key.genaidemo-manager-flink-api-key.secret
  }
}

# create jobseekerprofilev3

resource "confluent_flink_statement" "create-doc-embedding" {
  organization {
    id = data.confluent_organization.main.id
  }
  environment {
    id = confluent_environment.genaidemo.id
  }
  compute_pool {
    id = confluent_flink_compute_pool.genaiflink.id
  }
  principal {
    id = confluent_service_account.statements-runner.id
  }
  # https://docs.confluent.io/cloud/current/flink/reference/example-data.html#marketplace-database
  statement = file("../Statements/create-doc-embeddings.sql")
  properties = {
    "sql.current-catalog"  = confluent_environment.genaidemo.display_name
    "sql.current-database" = confluent_kafka_cluster.dedicated.display_name
    "sql.secrets.openaikey" = var.openai_key
  }
  rest_endpoint = data.confluent_flink_region.genaidemoflink.rest_endpoint
  credentials {
    key    = confluent_api_key.genaidemo-manager-flink-api-key.id
    secret = confluent_api_key.genaidemo-manager-flink-api-key.secret
  }
}

# Insert career guide data

resource "confluent_flink_statement" "insert-career-guide" {
  organization {
    id = data.confluent_organization.main.id
  }
  environment {
    id = confluent_environment.genaidemo.id
  }
  compute_pool {
    id = confluent_flink_compute_pool.genaiflink.id
  }
  principal {
    id = confluent_service_account.statements-runner.id
  }
  # https://docs.confluent.io/cloud/current/flink/reference/example-data.html#marketplace-database
  statement = file("../Statements/insert-careerguide-flink.sql")
  properties = {
    "sql.current-catalog"  = confluent_environment.genaidemo.display_name
    "sql.current-database" = confluent_kafka_cluster.dedicated.display_name
    "sql.secrets.openaikey" = var.openai_key
  }
  rest_endpoint = data.confluent_flink_region.genaidemoflink.rest_endpoint
  credentials {
    key    = confluent_api_key.genaidemo-manager-flink-api-key.id
    secret = confluent_api_key.genaidemo-manager-flink-api-key.secret
  }
}

# Insert doc embeddings

resource "confluent_flink_statement" "insert-doc-embeddings" {
  organization {
    id = data.confluent_organization.main.id
  }
  environment {
    id = confluent_environment.genaidemo.id
  }
  compute_pool {
    id = confluent_flink_compute_pool.genaiflink.id
  }
  principal {
    id = confluent_service_account.statements-runner.id
  }
  # https://docs.confluent.io/cloud/current/flink/reference/example-data.html#marketplace-database
  statement = file("../Statements/insert-doc-embeddings.sql")
  properties = {
    "sql.current-catalog"  = confluent_environment.genaidemo.display_name
    "sql.current-database" = confluent_kafka_cluster.dedicated.display_name
    "sql.secrets.openaikey" = var.openai_key
  }
  rest_endpoint = data.confluent_flink_region.genaidemoflink.rest_endpoint
  credentials {
    key    = confluent_api_key.genaidemo-manager-flink-api-key.id
    secret = confluent_api_key.genaidemo-manager-flink-api-key.secret
  }
}

# Insert insert-jobseeker-enriched

resource "confluent_flink_statement" "insert-jobseeker-enriched" {
  organization {
    id = data.confluent_organization.main.id
  }
  environment {
    id = confluent_environment.genaidemo.id
  }
  compute_pool {
    id = confluent_flink_compute_pool.genaiflink.id
  }
  principal {
    id = confluent_service_account.statements-runner.id
  }
  # https://docs.confluent.io/cloud/current/flink/reference/example-data.html#marketplace-database
  statement = file("../Statements/insert-jobseeker-enriched.sql")
  properties = {
    "sql.current-catalog"  = confluent_environment.genaidemo.display_name
    "sql.current-database" = confluent_kafka_cluster.dedicated.display_name
    "sql.secrets.openaikey" = var.openai_key
  }
  rest_endpoint = data.confluent_flink_region.genaidemoflink.rest_endpoint
  credentials {
    key    = confluent_api_key.genaidemo-manager-flink-api-key.id
    secret = confluent_api_key.genaidemo-manager-flink-api-key.secret
  }
}

# Insert insert-jobseekerprofilev3

resource "confluent_flink_statement" "insert-jobseekerprofilev3" {
  organization {
    id = data.confluent_organization.main.id
  }
  environment {
    id = confluent_environment.genaidemo.id
  }
  compute_pool {
    id = confluent_flink_compute_pool.genaiflink.id
  }
  principal {
    id = confluent_service_account.statements-runner.id
  }
  # https://docs.confluent.io/cloud/current/flink/reference/example-data.html#marketplace-database
  statement = file("../Statements/insert-jobseekerprofilev3.sql")
  properties = {
    "sql.current-catalog"  = confluent_environment.genaidemo.display_name
    "sql.current-database" = confluent_kafka_cluster.dedicated.display_name
    "sql.secrets.openaikey" = var.openai_key
  }
  rest_endpoint = data.confluent_flink_region.genaidemoflink.rest_endpoint
  credentials {
    key    = confluent_api_key.genaidemo-manager-flink-api-key.id
    secret = confluent_api_key.genaidemo-manager-flink-api-key.secret
  }
}



# Create MongoDB Atlas resources
resource "mongodbatlas_cluster" "genai-demo" {
  project_id = var.mongodbatlas_project_id
  name       = "confluentdemos"

  # Provider Settings "block"
  provider_instance_size_name = "M0"
  provider_name               = "TENANT"
  backing_provider_name       = "AWS"
  provider_region_name        = var.mongodbatlas_region
}

resource "mongodbatlas_project_ip_access_list" "genai-demo-ip" {
  project_id = var.mongodbatlas_project_id
  cidr_block = "0.0.0.0/0"
  comment    = "Allow connections from anywhere for demo purposes"
}


# Create a MongoDB Atlas Admin Database User
resource "mongodbatlas_database_user" "genai-db-user" {
  username           = var.mongodbatlas_database_username
  password           = var.mongodbatlas_database_password
  project_id         = var.mongodbatlas_project_id
  auth_database_name = "admin"

  roles {
    role_name     = "readWrite"
    database_name = mongodbatlas_cluster.genai-demo.name
  }
}
