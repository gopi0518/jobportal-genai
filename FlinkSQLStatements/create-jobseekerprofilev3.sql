create table jobseekerprofilev3(
profile_id STRING,
title STRING,
paths ARRAY<ROW<`title` STRING, `rec_courses` STRING>>,
email STRING,
technical_skills STRING,
recommended_jobs STRING,
login STRING,
first_name STRING,
last_name STRING,
location STRING,
company STRING,
profile_summary STRING,
ln_profile_summary STRING,
ln_job_title STRING,
ln_endorsements ARRAY<STRING NOT NULL>,
ln_recommendations ARRAY<STRING NOT NULL>,
technical_skills_embeddings ARRAY<DOUBLE NOT NULL>,
PRIMARY KEY (profile_id) NOT ENFORCED
);