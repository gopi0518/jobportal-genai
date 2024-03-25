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
import uuid
from confluent_kafka import DeserializingConsumer
from confluent_kafka import SerializingProducer
from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroDeserializer
from confluent_kafka.schema_registry.avro import AvroSerializer
#from confluent_kafka.schema_registry.avro import SerializerError
from confluent_kafka.avro.serializer import SerializerError
#from confluent_kafka.serialization import StringDeserializer
#from confluent_kafka.serialization import StringSerializer
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain.chains import LLMChain
import ccloud_lib
import pymongo
import requests
from flask import Flask, request, jsonify, json
# AI
# General
import json
import os
from bson import json_util
app = Flask(__name__)
try:
    path = os.path.dirname(os.path.abspath(__file__))
    upload_folder=os.path.join(
    path.replace("/file_folder",""),"tmp")
    os.makedirs(upload_folder, exist_ok=True)
    app.config['upload_folder'] = upload_folder
except Exception as e:
    app.logger.info("An error occurred while creating temp folder")
    app.logger.error("Exception occurred : {}".format(e))
args = ccloud_lib.parse_args()
config_file = args.config_file
resumereqtopic = args.resumereqtopic
jobposttopic = args.jobpostreqtopic
confproducer = ccloud_lib.read_ccloud_config(config_file)
confconsumer = ccloud_lib.read_ccloud_config(config_file)
schema_registry_conf = {
        "url": confconsumer["schema.registry.url"],
        "basic.auth.user.info": confconsumer["basic.auth.user.info"],
    }
schema_registry_client = SchemaRegistryClient(schema_registry_conf)
jobseeker_avro_serializer = AvroSerializer(
schema_registry_client = schema_registry_client,
schema_str =  ccloud_lib.jobseeker_schema,
to_dict = ccloud_lib.Jobseeker.jobseeker_to_dict)
# Jobposting serializer
jobpost_avro_serializer = AvroSerializer(
schema_registry_client = schema_registry_client,
schema_str =  ccloud_lib.jobpost_schema,
to_dict = ccloud_lib.Jobpost.jobpost_to_dict)
# mongo connection
client = pymongo.MongoClient("mongodb+srv://gdappili:confluent@confluentai.9job2cs.mongodb.net/?retryWrites=true&w=majority")
db = client.genai
profilecollection = db.dummytestv1
jobpostscollection = db.jobpostresv2
historycollection = db.historycollection
# openai embedding
embedding_url = "https://api.openai.com/v1/embeddings"
# consumer
# for full list of configurations, see:
#   https://docs.confluent.io/platform/current/clients/confluent-kafka-python/#deserializingconsumer

message_count = 0
waiting_count = 0
# Subscribe to topic

# producer
producer_conf = ""
producer_conf = ccloud_lib.pop_schema_registry_params_from_config(confproducer)
delivered_records = 0
# OpenAI init
# OPENAIKEY = os.environ["OPENAI_API_KEY"]
# llm = ChatOpenAI(model_name='gpt-3.5-turbo-1106',
#             temperature=0,
#             max_tokens = 256,response_format={ "type": "json_object" })
# Generate embeddings
def generate_embedding(text: str) -> list[float]:

        response = requests.post(
                embedding_url,
                headers={"Authorization": f"Bearer {openai_token}","Content-Type": "application/json"},
                json={"input": text, "model": "text-embedding-ada-002"})

        if response.status_code != 200:
                raise ValueError(f"Request failed with status  {response.status}")
        return response.json()['data'][0]['embedding']
# list profiles
@app.route("/jobportal/matchprofiles",methods=['POST'])
def list_profiles():
    data= json.loads(request.data)
    print(data);
    id="Gopi"
    jsondata = {}
    items = []
    # jobtitle=data['job_title']
    # print(jobtitle)
    # techskill=data['tech_skill']
    # print(techskill)
    # location=data['location']
    # if len(jobtitle)>0:
    #       searhfullquery=jobtitle
    # if len(techskill)>0:
    #       searhfullquery=jobtitle+" with "+techskill
    # if len(location)>0:
    #       searhfullquery=searhfullquery+" in "+location
    # searchquery = Searchquery(id=id,search_req=searhfullquery)
    # print(resj["recent_technologies_worked"])
    # print(searchquery);
    # publish_sr_confluent(searchquery)
    results = profilecollection.aggregate([
        {
            "$search": {
                "index": "jobseeker_techskills",
                "knnBeta": {
                    "vector": generate_embedding(data['searchquery'].lower()),
                    "path": "technical_skills_embeddings",
                    "k": 5
                }
            }
        }
    ])
    # print(results)
    for document in results:
        # print(json_util.dumps(document))
        items.append({'profile_id': document["profile_id"],'first_name':document["first_name"],'last_name':document["last_name"],'email':document["email"],'profile_summary':document["profile_summary"]})
    jsondata['items'] = items
    print(jsondata)
    return json_util.dumps(jsondata)
# list jobs
@app.route("/jobportal/jobs",methods=['POST'])
def list_jobs():
    data= json.loads(request.data)
    print(data);
    jsondata = {}
    items = []
    # jobtitle=data['job_title']
    # print(jobtitle)
    # techskill=data['tech_skill']
    # print(techskill)
    # location=data['location']
    # if len(jobtitle)>0:
    #       searhfullquery=jobtitle
    # if len(techskill)>0:
    #       searhfullquery=jobtitle+" with "+techskill
    # if len(location)>0:
    #       searhfullquery=searhfullquery+" in "+location
    # searchquery = Searchquery(id=id,search_req=searhfullquery)
    # print(resj["recent_technologies_worked"])
    # print(searchquery);
    # publish_sr_confluent(searchquery)
    results = jobpostscollection.aggregate([
        {
            "$search": {
                "index": "jobpostingsearch",
                "knnBeta": {
                    "vector": generate_embedding(data['searchquery'].lower()),
                    "path": "jd_embeddings",
                    "k": 5
                }
            }
         },
        {"$match": {"location": {"$regex": data['location'],"$options":"i"}}}
        
    ])
    # print(results)
    for document in results:
        # print(json_util.dumps(document))
        items.append({'jobid': document["reqid"],'job_req':document["jobreq"],'job_title':document["job_title"],'job_desc':document["job_description"],'required_skills':document["required_skills"],'preferred_skills':document["preferred_skills"],'location':document["location"]})
    jsondata['items'] = items
    print(jsondata)
    return json_util.dumps(jsondata)
# Jobseeker resume upload
@app.route("/jobportal/resume/upload",methods=['POST'])
def upload_resume():
    file = request.files.get("file")
    userid = request.form.get("userid")
    print(userid)
    resume_name = file.filename
    save_path = os.path.join(
    app.config.get('upload_folder'),resume_name)
    file.save(save_path)
    id = str(uuid.uuid4())
    fhandle = open(save_path, 'rb')
    publish_jobseeker_resume(save_path,userid,id)
    return id
@app.route("/jobportal/profile",methods=['GET'])
def get_profiles():
    login = request.args.get('login')
    profiles = {}
    profileitems = []
    profiledocs=profilecollection.aggregate([{ "$match" : {"login": login} }])
    for document in profiledocs:
        profileitems.append({'profile_id': document["profile_id"],'first_name':document["first_name"],'last_name':document["last_name"],'email':document["email"],'profile_summary':document["profile_summary"],'linkedin_pf_summary':document["ln_profile_summary"],'tech_skills':document["technical_skills"],'recommended_jobs':document["recommended_jobs"],'job_title':document["ln_job_title"],'location':document['location']})
    profiles['items'] = profileitems
    print(login)
    print(json_util.dumps(profiles))
    return json_util.dumps(profiles)
# View jobposting
@app.route("/jobportal/jobpost",methods=['GET'])
def view_jobpost():
    jobid = request.args.get('jobid')
    # reqid = "9b2db7a5-5320-4e60-9dec-c7752cc8d7f8"
    print(jobid)
    jobpost = {}
    jobpostitems = []
    jobpostdocs=jobpostscollection.aggregate([{ "$match" : {"reqid": jobid} }])
    print(jobpostdocs)
    for document in jobpostdocs:
        jobpostitems.append({'reqid':document["reqid"],'jobreq': document["jobreq"],'job_description':document["job_description"],'job_title':document["job_title"],'req_skills':document["required_skills"],'location':document["location"],'preferred_skills':document["preferred_skills"]})
    jobpost['items'] = jobpostitems
    print(jobid)
    print(json_util.dumps(jobpost))
    return json_util.dumps(jobpost)
@app.route("/jobportal/createjobpost",methods=['POST'])
def create_jobpost():
    login = request.args.get('login')
    postdata = json.loads(request.data)
    jobreq = postdata['postreq']
    print(jobreq)
    reqid = str(uuid.uuid4())
    data = { 
            "reqid" : reqid
        }
    publish_create_jobpost(jobreq,login,reqid)
    return jsonify(data)
@app.route("/jobportal/test",methods=['POST'])
def test():
	print(request.data)
	return "hello"
@app.route("/jobportal/recentsearch",methods=['GET'])
def usersearcg_history():
    login = request.args.get('login')
    print(login)
    searchresult = {}
    searchresultitems = []
    N = 3
    searchhis = historycollection.aggregate([{ "$match" : {"id": login} }])
    # print(searchhis)
    for document in list(searchhis)[-N:]:
        print(json_util.dumps(document))
        searchresultitems.append({'searchquery': document["search_req"]})
    searchresult['items'] = searchresultitems
    # print(json_util.dumps(searchresult))
    return json_util.dumps(searchresult)
# Publish job posting request
def publish_create_jobpost(jobreq,userid,reqid):
    try:
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
        producer_conf["value.serializer"] = jobpost_avro_serializer
        producer = SerializingProducer(producer_conf)
        jobpost_object = ccloud_lib.Jobpost()
        jobpost_object.jobreq = jobreq
        jobpost_object.loginname = userid
        jobpost_object.reqid = reqid
        producer.produce(topic=jobposttopic, value=jobpost_object, on_delivery=acked)
        producer.poll(0)
        producer.flush()
    except Exception as e:
        print("An error occured:", e)

def publish_jobseeker_resume(resumepath,userid,id):
    try:
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
        producer_conf["value.serializer"] = jobseeker_avro_serializer
        producer = SerializingProducer(producer_conf)
        jobseeker_object = ccloud_lib.Jobseeker()
        jobseeker_object.resumepath = resumepath
        jobseeker_object.loginname = userid
        jobseeker_object.profileid = id
        print(jobseeker_object.profileid)
        print("i am here")
        producer.produce(topic=resumereqtopic, value=jobseeker_object, on_delivery=acked)
        producer.poll(0)
        producer.flush()
    except Exception as e:
        print("An error occured:", e)
if __name__ == "__main__":
    app.run(debug=True,host='0.0.0.0')
