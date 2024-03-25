## Confluent Cloud

You need a working account for Confluent Cloud. Sign-up with Confluent Cloud is very easy and you will get a $400 budget for your first trials for free. If you don't have a working Confluent Cloud account please [Sign-up to Confluent Cloud](https://www.confluent.io/confluent-cloud/tryfree/?utm_campaign=tm.campaigns_cd.Q124_EMEA_Stream-Processing-Essentials&utm_source=marketo&utm_medium=workshop).

## Tools

* install kafka or Confluent Platform (we need the tools kafka-avro-consumer-console and kafka-avro-producer-console), [Downlod Confluent Platform](https://www.confluent.io/get-started/?product=self-managed)
* Local install Confluent CLI, [install the cli](https://docs.confluent.io/confluent-cli/current/install.html) 
* install terraform on your desktop. [Follow the installation guide](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)
* I am running still completely on bash on my Intel Mac. Environment Variables are set in `~/.bash_profile`, if you running other OS or use other Shells like zsh, please setup that script can execute kafka tools without absolution path.
* install Python3 on MacOS: [Downland](https://www.python.org/downloads/macos/) and follow the instructions
* Install all the python modules we need;
```bash
pip3 install confluent_kafka
pip3 install PyPDF2
pip3 install gcc
pip3 install pymongo
pip3 install requests
pip3 install fastavro
pip3 install avro
pip3 install jproperties
pip3 install langchain
pip3 install openai
pip3 install langchain_openai
pip3 install -U langchain-community
pip3 install google-search-results
pip3 install Flask
pip3 install langchain_core
pip3 install pydantic
```

## API Keys from Confluent Cloud Cluster and Salesforce

For Confluent Cloud: Create API Key in Confluent Cloud via CLI (In my case as OrgAdmin):
```bash
    confluent login
    confluent api-key create --resource cloud --description "API for terraform"
    # It may take a couple of minutes for the API key to be ready.
    # Save the API key and secret. The secret is not retrievable later.
    #+------------+------------------------------------------------------------------+
    #| API Key    | <your generated key>                                             |
    #| API Secret | <your generated secret>                                          |
    #+------------+------------------------------------------------------------------+
```
## Clone and enter this repository.
```
git clone https://github.com/gopi0518/jobportal-genai.git
cd jobportal-genai
```

Update the .env file for the following variables with your credentials.:
```
CONFLUENT_CLOUD_EMAIL=<replace>
CONFLUENT_CLOUD_PASSWORD=<replace>
export TF_VAR_confluent_cloud_api_key="<replace>"
export TF_VAR_confluent_cloud_api_secret="<replace>"
export TF_VAR_mongodbatlas_public_key="<replace>"
export TF_VAR_mongodbatlas_private_key="<replace>"
export TF_VAR_mongodbatlas_org_id="<replace>"
```
Terraform will take all these parameters and doing the configuraiton for you and finally deploy all confluent cloud resources including service accounts and role bindings.

## Build your cloud infrastructure
1. Navigate to the repo's terraform directory.
   ```
   cd terraform
   ```

## Generative AI API we use

We use langchain LLM version 0.1 [Langchain Docu](https://python.langchain.com/docs/get_started/introduction)

HINT:
<table><tr><td>Now, it will cost money. Unfortunately the APIs are not for free. I spend 10$ for open AI, 10$ for ProxyCurl API and SERP API is still in free status.</td></tr></table>

First we need a key which allow us to use OpenAI. Follow steps from [here](https://platform.openai.com/docs/quickstart/account-setup) to create an Account and then an API Key only.

Next Task: Create proxycurl api key. ProxyCurl will be used to scrape Linkedin. Sign Up to proxyurl and buy credits for 10$ (or whatever you think is enough, maybe you start more less) , [follow these Steps](https://nubela.co/proxycurl). You get 10 free credit. Which could be enough for a simple demo.

To be able to search in Google the correct linkedin Profile URL, we need a API key of SERP API from [here](https://serpapi.com/).

Now, put all Keys into `env-vars` file by executing the command:
```bash
cat > env-vars <<EOF
export PYTHONPATH=/YOURPATH
export OPENAI_API_KEY=YOUR openAI Key
export PROXYCURL_API_KEY=YOUR ProxyURL Key
export SERPAPI_API_KEY=Your SRP API KEy
EOF
```

Congratulation the preparation is done. This was a huge setup, I know. But all the rest is "one command execution"

## Run the job portal UI
```
cd portalUI
npm install
HTTPS=true npm start

```
## Run python code

```
python resumeclassification.py getting_started.ini
```

# Destroy the Confluent Cloud Resources
If you are finished, you can stop the programs in Terminal with CTRL+c and destroy everything in Confluent Cloud by :
```bash
terraform destroy
``` 

If you will get an error, execute destroy again, till everything is green.
```bash
terraform destroy
``` 

# Licenses
You need a Confluent Cloud Account (new ones get 400$ credit for free).
You need an OPenAI Account, with current credit.
You need a ProxyCurl API Account, with current credits.
Your need SERP API Account, here you will a starting amount of connections. This was enough in my case.

In  Total I spend 20 $ (Open AI, ProxyCurl) and I am still not out of credits.

