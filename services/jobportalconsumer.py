#!/usr/bin/env python
# =============================================================================
#
# Consume messages from Confluent Cloud
# Using Confluent Python Client for Apache Kafka
# Reads Avro data, integration with Confluent Cloud Schema Registry
# Call
# python icebreaker.py -f client.properties -t shoe_promotions
# avro consumer sample : https://github.com/confluentinc/examples/blob/7.5.0-post/clients/cloud/python/consumer_ccsr.py
# =============================================================================
# Confluent
import confluent_kafka
import PyPDF2
import os
import requests
from confluent_kafka import DeserializingConsumer
from confluent_kafka import SerializingProducer
from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroDeserializer
from confluent_kafka.schema_registry.avro import AvroSerializer
#from confluent_kafka.schema_registry.avro import SerializerError
from confluent_kafka.avro.serializer import SerializerError
#from confluent_kafka.serialization import StringDeserializer
#from confluent_kafka.serialization import StringSerializer
import ccloud_lib
# AI
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain.chains import LLMChain
from linkedin import scrape_linkedin_profile
from linkedin_lookup_agent import lookup as linkedin_lookup_agent
# General
from langchain.chains import LLMSummarizationCheckerChain
from langchain.prompts import PromptTemplate
from langchain_community.llms import OpenAI
from langchain_community.chat_models import ChatOpenAI
# from langchain.llms import OpenAI
from langchain.chains import LLMChain
import textwrap
import ccloud_lib
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
# from langchain.vectorstores import MongoDBAtlasVectorSearch
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
# from langchain.document_loaders import TextLoader
from langchain_community.document_loaders import TextLoader
# from langchain.document_loaders import UnstructuredPDFLoader
from langchain_community.document_loaders import UnstructuredPDFLoader
from bson import json_util
from flask import Flask, request, jsonify, json
from langchain_core.pydantic_v1 import BaseModel
from typing import Optional


OPENAIKEY = os.environ["OPENAI_API_KEY"]
PROXYCURL_API_KEY = os.environ["PROXYCURL_API_KEY"]
SERPAPI_API_KEY = os.environ["SERPAPI_API_KEY"]
embedding_url = "https://api.openai.com/v1/embeddings"
# text-davinci-003
llm = ChatOpenAI(model_name='gpt-3.5-turbo-1106',
             temperature=0,
             max_tokens = 256,response_format={ "type": "json_object" })
#Generate embeddings
def generate_embedding(text: str) -> list[float]:

        response = requests.post(
                embedding_url,
                headers={"Authorization": f"Bearer {openai_token}","Content-Type": "application/json"},
                json={"input": text, "model": "text-embedding-ada-002"})

        if response.status_code != 200:
                raise ValueError(f"Request failed with status  {response.status}")
        return response.json()['data'][0]['embedding']
# GENAI CREATE JOB POSTING
def jobpost_genai(jobreq):
    print(jobreq)
    fact_extraction_prompt = PromptTemplate(
    input_variables=["text_input"],
    template="prepare job posting for {text_input}, job posting should include 1. detailed job description 2. required qualification 3. preferred qualification 4. location in json")
    fact_extraction_chain = LLMChain(llm=llm, prompt=fact_extraction_prompt)
    facts = fact_extraction_chain.run(jobreq)
    jobposting = json.loads(facts)
    print(jobposting);
    return jobposting
#GenAI resume extraction
def jobseeker_genai(filepath):
    print(filepath)
    fhandle = open(filepath, 'rb')
    pdfReader = PyPDF2.PdfReader(fhandle)
    count = len(pdfReader.pages)
    resumepages = []
    for i in range(count):
        page = pdfReader.pages[i]
        # print(page.extract_text())
        resumepages.append(page.extract_text())
    #pagehandle = pdfReader.pages[0]
    # print(pagehandle.extract_text())
    # print(documents[0].page_content)
    fact_extraction_prompt = PromptTemplate(
    input_variables=["text_input"],
    template="Extract first name,last name,email,profile summary,recent technologies worked,recommended jobs and location from this resume {text_input} in json")
    fact_extraction_chain = LLMChain(llm=llm, prompt=fact_extraction_prompt)
    facts = fact_extraction_chain.run(resumepages)
    resj = json.loads(facts)
    print(resj);
    # jobs_embeddings=generate_embedding(resj["recommended_jobs"])
    # print(jobs_embeddings)
    # skills_embeddings=generate_embedding(resj["recent_technologies_worked"])
    # jobseeker_object = ccloud_lib.Jobseeker()
    # jobseeker_object.resumepath=file
    # jobseeker_object.loginname=userid
    # jobseeker_object.profileid=id
    # profile = Profile(id=userid,location=resj["location"],first_name=resj["first_name"],last_name=resj["last_name"],email=resj["email"],technical_skills=resj["recent_technologies_worked"],recommended_jobs=resj["recommended_jobs"],technical_skills_embeddings=skills_embeddings,jobs_embeddings=jobs_embeddings)
    # print(resj["recent_technologies_worked"])
    # publish_confluent(jobseeker_object)
    try:
        print("Producing Avro record: {}\t{}\t{}\t{}\t{}\t{}"
                                        .format(jobseeker_object.resumepath))
        producer.produce(topic=resumerestopic, value=jobseeker_object, on_delivery=acked)
        producer.poll(0)
        producer.flush()
        print("{} messages were produced to topic {}!".format(delivered_records, resumerestopic))
    except Exception as e:
        print("An error occured:", e)
    return resj
if __name__ == "__main__":
    # Read arguments and configurations and initialize
    args = ccloud_lib.parse_args()
    config_file = args.config_file
    resumerestopic = args.resumerestopic
    resumereqtopic = args.resumereqtopic
    jobpostreqtopic = args.jobpostreqtopic
    jobpostrestopic = args.jobpostrestopic
    confconsumer = ccloud_lib.read_ccloud_config(config_file)
    confproducer = ccloud_lib.read_ccloud_config(config_file)


    schema_registry_conf = {
        "url": confconsumer["schema.registry.url"],
        "basic.auth.user.info": confconsumer["basic.auth.user.info"],
    }
    schema_registry_client = SchemaRegistryClient(schema_registry_conf)

    jobseeker_avro_deserializer = AvroDeserializer(
        schema_registry_client=schema_registry_client,
        schema_str=ccloud_lib.jobseeker_schema,
        from_dict=ccloud_lib.Jobseeker.dict_to_jobseeker,
    )
    jobpost_avro_deserializer = AvroDeserializer(
        schema_registry_client=schema_registry_client,
        schema_str=ccloud_lib.jobpost_schema,
        from_dict=ccloud_lib.Jobpost.dict_to_jobpost,
    )
    
    jobpostgenai_avro_serializer = AvroSerializer(
        schema_registry_client = schema_registry_client,
        schema_str =  ccloud_lib.jobpost_genai_schema,
        to_dict = ccloud_lib.JobpostGenAI.jobpostgenai_to_dict)

    jobseekergenai_avro_serializer = AvroSerializer(
        schema_registry_client = schema_registry_client,
        schema_str =  ccloud_lib.jobseeker_genai_schema,
        to_dict = ccloud_lib.JobseekerGenAI.jobseekergenai_to_dict)
   
    # consumer
    # for full list of configurations, see:
    #   https://docs.confluent.io/platform/current/clients/confluent-kafka-python/#deserializingconsumer
    consumer_conf = ccloud_lib.pop_schema_registry_params_from_config(confconsumer)
    consumer_conf["value.deserializer"] = jobseeker_avro_deserializer
    consumer = DeserializingConsumer(consumer_conf)
    
    # jobpost consumer
    # consumer
    # for full list of configurations, see:
    #   https://docs.confluent.io/platform/current/clients/confluent-kafka-python/#deserializingconsumer
    jobpostconsumer_conf = ccloud_lib.pop_schema_registry_params_from_config(confconsumer)
    jobpostconsumer_conf["value.deserializer"] = jobpost_avro_deserializer
    jobpostconsumer = DeserializingConsumer(jobpostconsumer_conf)
    
    message_count = 0
    waiting_count = 0
    # Subscribe to topic
    consumer.subscribe([resumereqtopic])
    jobpostconsumer.subscribe([jobpostreqtopic])
    
    # producer
    producer_conf = ""
    producer_conf = ccloud_lib.pop_schema_registry_params_from_config(confproducer)
    producer_conf["value.serializer"] = jobseekergenai_avro_serializer
    producer = SerializingProducer(producer_conf)
    # jobpost genai producer
    jobpostgenaiproducer_conf = ""
    jobpostgenaiproducer_conf = ccloud_lib.pop_schema_registry_params_from_config(confproducer)
    jobpostgenaiproducer_conf["value.serializer"] = jobpostgenai_avro_serializer
    jobpostgenaiproducer = SerializingProducer(jobpostgenaiproducer_conf)
    delivered_records = 0

    # Process messages
    while True:
        try:
            resumereq = consumer.poll(1.0)
            jobpostreq = jobpostconsumer.poll(1.0)
            jobseeker_object = None
            jobpost_object  = None
            if resumereq is None and  jobpostreq is None:
                # No message available within timeout.
                # Initial message consumption may take up to
                # `session.timeout.ms` for the consumer group to
                # rebalance and start consuming
                waiting_count = waiting_count + 1
                print(
                    "{}. Waiting for resume classification request/jobreq or event/error in poll()".format(
                        waiting_count
                    )
                )
                continue
            elif resumereq is not None and resumereq.error():
                print("error: {}".format(resumereq.error()))
            elif resumereq is not None and jobpostreq.error():
                print("error: {}".format(jobreq.error()))
            else:
                if resumereq is not None:
                	jobseeker_object = resumereq.value()
                if jobpostreq is not None:
                	jobpost_object = jobpostreq.value()
                if jobseeker_object is not None:
                    js_genai=jobseeker_genai(jobseeker_object.resumepath)
                    print(js_genai["first_name"])
                    information = js_genai["first_name"]+js_genai["last_name"]
                    skills_embeddings=generate_embedding(js_genai["recommended_jobs"]+" with "+js_genai["recent_technologies_worked"]+" in "+js_genai["location"])
                    # skills_embeddings=generate_embedding(js_genai["recent_technologies_worked"])
                    if information is not None:
                        print(
                            "Consumed record with value {}, Total processed rows {}".format(
                                information, message_count
                            )
                        )
                        message_count = message_count + 1
                        message = (
                            "Search for information: "
                            + str(information)
                            + " with genAI ice-breaker!"
                        )
                        # Here start with genAI
                        print("Hello LangChain!")
                        try:
                            linkedin_profile_url = linkedin_lookup_agent(name=information)
                            linkedin_data = scrape_linkedin_profile(linkedin_profile_url=linkedin_profile_url)
                            # Define tasks for chatgpt
                            summary_template = """
                                given the Linkedin information {linkedin_information} about a person from I want you to create:
                                1. a short summary
                                2. current company
                                3. current occupation
                                4. short summary of reccommendations received
                                5. short summary of skills endorsed
 
                                in json
                            """
                            # prepare prompt (chat)
                            summary_prompt_template = PromptTemplate(
                            input_variables=["linkedin_information"],
                            template=summary_template,
                            )
                            # create chatgpt instance
                            # llm = ChatOpenAI(temperature=1, model_name="gpt-3.5-turbo")
                            # LLM chain
                            chain = LLMChain(llm=llm, prompt=summary_prompt_template)
                            # execute and print result
                            result = chain.run(linkedin_information=linkedin_data)
                            resultjson = json.loads(result)
                            print(json.loads(result))
                            # produce data back
                            def acked(err, resumereq):
                                global delivered_records
                                """
                                    Delivery report handler called on successful or failed delivery of message
                                """
                                if err is not None:
                                    print("Failed to deliver message: {}".format(err))
                                else:
                                    delivered_records += 1
                                    print("Produced record to topic {} partition [{}] @ offset {}"
                                        .format(resumereq.topic(), resumereq.partition(), resumereq.offset()))

                            jobseekergenai_object = ccloud_lib.JobseekerGenAI()
                            jobseekergenai_object.profile_id = jobseeker_object.profileid
                            jobseekergenai_object.login = jobseeker_object.loginname
                            jobseekergenai_object.first_name = js_genai["first_name"]
                            jobseekergenai_object.last_name = js_genai["last_name"]
                            jobseekergenai_object.email = js_genai["email"]
                            jobseekergenai_object.location = js_genai["location"]
                            jobseekergenai_object.company = resultjson["current_company"]
                            jobseekergenai_object.profile_summary = js_genai["profile_summary"]
                            jobseekergenai_object.ln_profile_summary = resultjson["short_summary"]
                            jobseekergenai_object.ln_job_title = resultjson["current_occupation"]
                            jobseekergenai_object.ln_endorsements = resultjson["skills_endorsed_summary"]
                            jobseekergenai_object.ln_recommendations = resultjson["recommendations_summary"]
                            jobseekergenai_object.technical_skills = js_genai["recent_technologies_worked"]
                            jobseekergenai_object.recommended_jobs = js_genai["recommended_jobs"]
                            jobseekergenai_object.technical_skills_embeddings = skills_embeddings
                            # jobseekergenai_object.jobs_embeddings = jobs_embeddings
                            print("Producing Avro record: {}\t{}\t{}\t{}\t{}\t{}"
                                       .format(jobseekergenai_object.profile_id,jobseekergenai_object.login,jobseekergenai_object.first_name,jobseekergenai_object.last_name,jobseekergenai_object.email,jobseekergenai_object.location,jobseekergenai_object.company,jobseekergenai_object.profile_summary,jobseekergenai_object.ln_profile_summary,jobseekergenai_object.ln_job_title,jobseekergenai_object.ln_endorsements,jobseekergenai_object.ln_recommendations,jobseekergenai_object.technical_skills,jobseekergenai_object.recommended_jobs))
                            producer.produce(topic=resumerestopic, value=jobseekergenai_object, on_delivery=acked)
                            producer.poll(0)

                            producer.flush()

                            print("{} messages were produced to topic {}!".format(delivered_records, resumerestopic))
                        except Exception as e:
                            print("An error occured:", e)
                else:
                    if jobpost_object is not None:
                    	pref_qual=None
                    	req_qual=None
                    	jobdesc=None
                    	jobloc=None
                    	jobtitle=None
                    	jp_genai=jobpost_genai(jobpost_object.jobreq)
                    	if "location" in jp_genai:
                        	jobloc=jp_genai["location"]
                    	else:
                        	jobloc=jp_genai["jobLocation"]
                    	if "preferred_qualifications" in jp_genai:
                        	pref_qual=jp_genai["preferred_qualifications"]
                        	req_qual=jp_genai["required_qualifications"]
                        	jobdesc=jp_genai["job_description"]
                        	jobtitle=jp_genai["job_title"]
                    	else:
                        	req_qual=jp_genai["requiredQualifications"]
                        	pref_qual=jp_genai["preferredQualifications"]
                        	jobdesc=jp_genai["jobDescription"]
                        	jobtitle=jp_genai["jobTitle"]	
                    	jd_embeddings=generate_embedding(jobdesc+jobloc)
                    # skills_embeddings=generate_embedding(js_genai["recent_technologies_worked"])
                    	def acked(err, msg):
                        	global delivered_records
                        	"""
                          	Delivery report handler called on successful or failed delivery of message
                        	"""
                        	if err is not None:
                           		print("Failed to deliver message: {}".format(err))
                        	else:
                           		delivered_records += 1
                           		print("Produced record to topic {} partition [{}] @ offset {}"
                                	.format(msg.topic(), msg.partition(), msg.offset()))

                    	jobpostgenai_object = ccloud_lib.JobpostGenAI()
                    	jobpostgenai_object.reqid = jobpost_object.reqid
                    	jobpostgenai_object.login = jobpost_object.loginname
                    	jobpostgenai_object.jobreq = jobpost_object.jobreq
                    	jobpostgenai_object.job_title = jobtitle
                    	jobpostgenai_object.job_description = jobdesc
                    	jobpostgenai_object.required_skills = req_qual[0]+"\n"+req_qual[1]+"\n"+req_qual[2]
                    	jobpostgenai_object.location = jobloc
                    	jobpostgenai_object.preferred_skills = pref_qual[0]+"\n"+pref_qual[1]+pref_qual[2]
                    	jobpostgenai_object.jd_embeddings = jd_embeddings
                    	print("Producing Avro record: {}\t{}\t{}\t{}\t{}\t{}"
                               .format(jobpostgenai_object.reqid,jobpostgenai_object.login,jobpostgenai_object.jobreq,jobpostgenai_object.job_title,jobpostgenai_object.job_description,jobpostgenai_object.required_skills,jobpostgenai_object.location,jobpostgenai_object.preferred_skills))
                    	jobpostgenaiproducer.produce(topic=jobpostrestopic, value=jobpostgenai_object, on_delivery=acked)
                    	jobpostgenaiproducer.poll(0)
                    	jobpostgenaiproducer.flush()

                    print("{} messages were produced to topic {}!".format(delivered_records, jobpostrestopic))
        except KeyboardInterrupt:
            break
        except SerializerError as e:
            # Report malformed record, discard results, continue polling
            print("Message deserialization failed {}".format(e))
            pass

    # Leave group and commit final offsets
    consumer.close()
    jobpostconsumer.close() 
