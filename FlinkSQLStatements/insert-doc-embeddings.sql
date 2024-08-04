insert into docs_embeddings_v1
       select filename as `title`,
        loginname,
        pagenum,
        content as `text`,
        profile_skills_embeddings as `embedding`
        from uploaddocs,LATERAL TABLE(ML_PREDICT('profile_skills_embeddings', content))
        where content is not null;