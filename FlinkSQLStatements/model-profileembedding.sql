CREATE MODEL `profile_skills_embeddings`
INPUT (technical_skills_embeddings_input STRING)
OUTPUT (profile_skills_embeddings ARRAY<FLOAT>)
WITH(
  'TASK' = 'embedding',
  'PROVIDER' = 'OPENAI',
  'OPENAI.ENDPOINT' = 'https://api.openai.com/v1/embeddings',
  'OPENAI.API_KEY' = '{{sessionconfig/sql.secrets.openaikey}}'
);