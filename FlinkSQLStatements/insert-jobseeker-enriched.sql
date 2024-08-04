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