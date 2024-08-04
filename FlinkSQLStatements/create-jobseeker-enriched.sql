create table JOBSEEKER_AI_ENRICHED_V1(
profile_id STRING,
technical_skills STRING,
login STRING,
email STRING,
first_name STRING,
last_name STRING,
location STRING,
company STRING,
profile_summary STRING,
ln_profile_summary STRING,
ln_job_title STRING,
ln_endorsements ARRAY<STRING NOT NULL>,
ln_recommendations ARRAY<STRING NOT NULL>,
recommended_jobs STRING,
technical_skills_embeddings_input STRING,
technical_skills_embeddings ARRAY<DOUBLE NOT NULL>
);