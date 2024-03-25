#!/usr/bin/env python
# =============================================================================
#
# Helper module
# Orginal source code https://github.com/confluentinc/examples/blob/7.5.0-post/clients/cloud/python/ccloud_lib.py
# =============================================================================

import argparse, sys
from confluent_kafka import avro, KafkaError
from jproperties import Properties

# Schema used for serializing Count class, passed in as the Kafka value
jobseeker_schema = """
{
  "fields": [
    {
      "default": null,
      "name": "resumepath",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "loginname",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "profileid",
      "type": [
        "null",
        "string"
      ]
    }
  ],
  "name": "record",
  "namespace": "org.apache.flink.avro.generated",
  "type": "record"
}
"""
jobpost_schema = """
{
  "fields": [
    {
      "default": null,
      "name": "jobreq",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "loginname",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "reqid",
      "type": [
        "null",
        "string"
      ]
    }
  ],
  "name": "record",
  "namespace": "org.apache.flink.avro.generated",
  "type": "record"
}
"""

jobseeker_genai_schema = """
{
  "fields": [
    {
      "default": null,
      "name": "profile_id",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "login",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "first_name",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "last_name",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "email",
      "type": [
        "null",
        "string"
      ]
    },
     {
      "default": null,
      "name": "location",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "company",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "profile_summary",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "ln_profile_summary",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "ln_job_title",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "ln_endorsements",
      "type": [{
                   "type":"array",
                   "items": "string"
                  },
               "null"
              ]
    },
    {
      "default": null,
      "name": "ln_recommendations",
      "type": [{
                   "type":"array",
                   "items": "string"
                  },
               "null"
              ]
    },
    {
      "default": null,
      "name": "technical_skills",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "recommended_jobs",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "technical_skills_embeddings",
      "type": [{
                   "type":"array",
                   "items": "double"
                  },
               "null"
              ]
    },
    {
      "default": null,
      "name": "jobs_embeddings",
      "type": [{
                   "type":"array",
                   "items": "double"
                  },
               "null"
              ]
    }
  ],
  "name": "record",
  "namespace": "org.apache.flink.avro.generated",
  "type": "record"
}
"""

jobpost_genai_schema = """
{
  "fields": [
    {
      "default": null,
      "name": "reqid",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "login",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "jobreq",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "job_title",
      "type": [
        "null",
        "string"
      ]
    },
   {
      "default": null,
      "name": "job_description",
      "type": [
        "null",
        "string"
      ]
    },
   {
      "default": null,
      "name": "required_skills",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "location",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "preferred_skills",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "default": null,
      "name": "jd_embeddings",
       "type": [{
                   "type":"array",
                   "items": "double"
                  },
               "null"
              ]
    }
  ],
  "name": "record",
  "namespace": "org.apache.jobpost.avro.generated",
  "type": "record"
}
"""

class Jobseeker(object):
    # Use __slots__ to explicitly declare all data members.
    __slots__ = [
        "resumepath",
        "loginname",
        "profileid"
    ]

    def __init__(
        self,
        resumepath=None,
        loginname=None,
        profileid=None
    ):
        self.resumepath = resumepath
        self.loginname = loginname
        self.profileid = profileid

    @staticmethod
    def dict_to_jobseeker(obj, ctx):
        if obj is None:
            return None
        return Jobseeker(
            resumepath=obj["resumepath"],
            loginname=obj["loginname"],
            profileid=obj["profileid"]
        )

    @staticmethod
    def jobseeker_to_dict(jobseeker, ctx):
        return dict(resumepath=jobseeker.resumepath, loginname=jobseeker.loginname, profileid=jobseeker.profileid)
#Jobpost req
class Jobpost(object):
    # Use __slots__ to explicitly declare all data members.
    __slots__ = [
        "jobreq",
        "loginname",
        "reqid"
    ]

    def __init__(
        self,
        jobreq=None,
        loginname=None,
        reqid=None
    ):
        self.jobreq = jobreq
        self.loginname = loginname
        self.reqid = reqid

    @staticmethod
    def dict_to_jobpost(obj, ctx):
        if obj is None:
            return None
        return Jobpost(
            jobreq=obj["jobreq"],
            loginname=obj["loginname"],
            reqid=obj["reqid"]
        )

    @staticmethod
    def jobpost_to_dict(jobpost, ctx):
        return dict(jobreq=jobpost.jobreq, loginname=jobpost.loginname,reqid=jobpost.reqid)
#JobpostGenAI res
class JobpostGenAI(object):
    # Use __slots__ to explicitly declare all data members.
    __slots__ = [
        "reqid",
        "login",
        "jobreq",
        "job_title",
        "job_description",
        "required_skills",
        "location",
        "preferred_skills",
        "jd_embeddings"
    ]

    def __init__(
        self,
        reqid=None,
        login=None,
        jobreq=None,
        job_title=None,
        job_description=None,
        required_skills=None,
        location=None,
        preferred_skills=None,
        jd_embeddings=None
    ):
        self.reqid = reqid
        self.login = login
        self.jobreq = jobreq
        self.job_title = job_title
        self.job_description = job_description
        self.required_skills = required_skills
        self.location = location
        self.preferred_skills = preferred_skills
        self.jd_embeddings = jd_embeddings
    @staticmethod
    def dict_to_jobpostgenai(obj, ctx):
        if obj is None:
            return None
        return Jobpostgenai(
            reqid=obj["reqid"],
            login=obj["login"],
            jobreq=obj["jobreq"],
            job_title=obj["job_title"],
            job_description=obj["job_description"],
            required_skills=obj["required_skills"],
            location=obj["location"],
            preferred_skills=obj["preferred_skills"],
            jd_embeddings=obj["jd_embeddings"]
        )

    @staticmethod
    def jobpostgenai_to_dict(jobpostgenai, ctx):
        return dict(reqid=jobpostgenai.reqid, login=jobpostgenai.login,jobreq=jobpostgenai.jobreq,job_title=jobpostgenai.job_title,job_description=jobpostgenai.job_description,required_skills=jobpostgenai.required_skills,location=jobpostgenai.location,preferred_skills=jobpostgenai.preferred_skills,jd_embeddings=jobpostgenai.jd_embeddings)

# jobseekerGenAI
class JobseekerGenAI(object):
    # Use __slots__ to explicitly declare all data members.
    __slots__ = [
        "profile_id",
        "login",
        "first_name",
        "last_name",
        "email",
        "location",
        "company",
        "profile_summary",
        "ln_profile_summary",
        "ln_job_title",
        "ln_endorsements",
        "ln_recommendations",
        "technical_skills",
        "recommended_jobs",
        "technical_skills_embeddings",
        "jobs_embeddings"
    ]

    def __init__(
        self,
        profile_id=None,
        login=None,
        first_name=None,
        last_name=None,
        email=None,
        company=None,
        location=None,
        profile_summary=None,
        ln_profile_summary=None,
        ln_job_title=None,
        ln_endorsements=None,
        ln_recommendations=None,
        technical_skills=None,
        recommended_jobs=None,
        technical_skills_embeddings=None,
        jobs_embeddings=None
    ):
        self.profile_id = profile_id
        self.login = login
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.company = company
        self.profile_summary = profile_summary
        self.ln_profile_summary = ln_profile_summary
        self.ln_job_title = ln_job_title
        self.ln_endorsements = ln_endorsements
        self.ln_recommendations = ln_recommendations
        self.technical_skills = technical_skills
        self.recommended_jobs = recommended_jobs
        self.technical_skills_embeddings = technical_skills_embeddings
        self.jobs_embeddings = jobs_embeddings

    @staticmethod
    def dict_to_jobseekergenai(obj, ctx):
        if obj is None:
            return None
        return JobseekerGenAI(
            profile_id=obj["profile_id"],
            login=obj["login"],
            first_name=obj["first_name"],
            last_name=obj["last_name"],
            email=obj["email"],
            location=obj["location"],
            company=obj["company"],
            profile_summary=obj["profile_summary"],
            ln_profile_summary=obj["ln_profile_summary"],
            ln_endorsements=obj["ln_endorsements"],
            ln_recommendations=obj["ln_recommendations"],
            technical_skills=obj["technical_skills"],
            recommended_jobs=obj["recommended_jobs"],
            technical_skills_embeddings=obj["technical_skills_embeddings"],
            jobs_embeddings=obj["jobs_embeddings"]
        )

    @staticmethod
    def jobseekergenai_to_dict(jobseekergenai, ctx):
        return dict(profile_id=jobseekergenai.profile_id,login=jobseekergenai.login,first_name=jobseekergenai.first_name, last_name=jobseekergenai.last_name, email=jobseekergenai.email,location=jobseekergenai.location, company=jobseekergenai.company,profile_summary=jobseekergenai.profile_summary,ln_profile_summary=jobseekergenai.ln_profile_summary,ln_job_title=jobseekergenai.ln_job_title,ln_endorsements=jobseekergenai.ln_endorsements,ln_recommendations=jobseekergenai.ln_recommendations,technical_skills=jobseekergenai.technical_skills,recommended_jobs=jobseekergenai.recommended_jobs,technical_skills_embeddings=jobseekergenai.technical_skills_embeddings,jobs_embeddings=jobseekergenai.jobs_embeddings)

def parse_args():
    """Parse command line arguments"""

    parser = argparse.ArgumentParser(
        description="Confluent Python Client example to consume messages to Confluent Cloud"
    )
    parser._action_groups.pop()
    required = parser.add_argument_group("required arguments")
    required.add_argument(
        "-f",
        dest="config_file",
        help="path to Confluent Cloud configuration file",
        required=True,
    )
    required.add_argument(
        "-resumereq", dest="resumereqtopic", help="resume req topic name", required=False
    )
    required.add_argument("-resumeres", dest="resumerestopic", help="resume res topic name", required=False)
    required.add_argument("-jobpostreq", dest="jobpostreqtopic", help="jobpost req topic name", required=False)
    required.add_argument("-jobpostres", dest="jobpostrestopic", help="jobpost res topic name", required=False)
    args = parser.parse_args()

    return args


def read_ccloud_config(config_file):
    """Read Confluent Cloud configuration for librdkafka clients"""

    conf = {}
    with open(config_file) as fh:
        for line in fh:
            line = line.strip()
            if len(line) != 0 and line[0] != "#":
                parameter, value = line.strip().split("=", 1)
                conf[parameter] = value.strip()

    return conf


def pop_schema_registry_params_from_config(conf):
    """Remove potential Schema Registry related configurations from dictionary"""

    conf.pop("schema.registry.url", None)
    conf.pop("basic.auth.user.info", None)
    conf.pop("basic.auth.credentials.source", None)

    return conf
