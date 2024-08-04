create table docs_embeddings_v1(
filename STRING,
loginname STRING,
pagenum INTEGER,
text STRING,
embedding ARRAY<DOUBLE NOT NULL>);