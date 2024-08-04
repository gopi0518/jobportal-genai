CREATE TABLE `careerguide` (
  `title` STRING,
  `paths` ARRAY < ROW <
    `title` STRING,
    `rec_courses` STRING
    > >,
  PRIMARY KEY (`title`) ENFORCED
);

INSERT INTO `careerguide` VALUES
(
  'Solution Engineer',
   ARRAY [
    ROW(
      'Solution Architect',
      'https://www.pluralsight.com/courses/enterprise-architecture-fundamentals,https://www.coursera.org/learn/cloud-solutions-architecture,https://www.udemy.com/course/software-design-and-architecture/,https://www.edx.org/learn/architecting-modern-web-applications'
      ),
    ROW(
      'Technical Sales Manager',
      'https://www.linkedin.com/learning/sales-leadership,https://www.coursera.org/learn/strategic-sales-management,https://www.udemy.com/course/effective-team-management/,https://www.edx.org/learn/financial-management'
      )
    ]
  );

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

CREATE MODEL `profile_skills_embeddings`
INPUT (technical_skills_embeddings_input STRING)
OUTPUT (profile_skills_embeddings ARRAY<FLOAT>)
WITH(
  'TASK' = 'embedding',
  'PROVIDER' = 'OPENAI',
  'OPENAI.ENDPOINT' = 'https://api.openai.com/v1/embeddings',
  'OPENAI.API_KEY' = '{{sessionconfig/sql.secrets.openaikey}}'
);

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


INSERT INTO JOBSEEKER_AI_ENRICHED_V1
SELECT
profile_id,
technical_skills,
login,
email,
first_name,
last_name,
location,
company,
profile_summary,
ln_profile_summary,
ln_job_title,
ln_endorsements,
ln_recommendations,
recommended_jobs,
technical_skills_embeddings_input,
profile_skills_embeddings as `technical_skills_embeddings` FROM jobseekerresv1,
LATERAL TABLE(ML_PREDICT('profile_skills_embeddings', technical_skills_embeddings_input)) where technical_skills_embeddings_input is not null;


INSERT INTO jobseekerprofilev3
SELECT
JOBSEEKER_AI_ENRICHED_V1.profile_id,
careerguide.title,
careerguide.paths,
JOBSEEKER_AI_ENRICHED_V1.email,
JOBSEEKER_AI_ENRICHED_V1.technical_skills,
JOBSEEKER_AI_ENRICHED_V1.recommended_jobs,
JOBSEEKER_AI_ENRICHED_V1.login,
JOBSEEKER_AI_ENRICHED_V1.first_name,
JOBSEEKER_AI_ENRICHED_V1.last_name,
JOBSEEKER_AI_ENRICHED_V1.location,
JOBSEEKER_AI_ENRICHED_V1.company,
JOBSEEKER_AI_ENRICHED_V1.profile_summary,
JOBSEEKER_AI_ENRICHED_V1.ln_profile_summary,
JOBSEEKER_AI_ENRICHED_V1.ln_job_title,
JOBSEEKER_AI_ENRICHED_V1.ln_endorsements,
JOBSEEKER_AI_ENRICHED_V1.ln_recommendations,
JOBSEEKER_AI_ENRICHED_V1.technical_skills_embeddings
FROM JOBSEEKER_AI_ENRICHED_V1
LEFT JOIN careerguide
ON JOBSEEKER_AI_ENRICHED_V1.ln_job_title = careerguide.title;

create table docs_embeddings_v1(
filename STRING,
loginname STRING,
pagenum INTEGER,
text STRING,
embedding ARRAY<DOUBLE NOT NULL>);

insert into docs_embeddings_v1
       select filename as `title`,
        loginname,
        pagenum,
        content as `text`,
        profile_skills_embeddings as `embedding`
        from uploaddocs,LATERAL TABLE(ML_PREDICT('profile_skills_embeddings', content))
        where content is not null;