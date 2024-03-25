## Confluent Cloud

You need a working account for Confluent Cloud. Sign-up with Confluent Cloud is very easy and you will get a $400 budget for your first trials for free. If you don't have a working Confluent Cloud account please [Sign-up to Confluent Cloud](https://www.confluent.io/confluent-cloud/tryfree/?utm_campaign=tm.campaigns_cd.Q124_EMEA_Stream-Processing-Essentials&utm_source=marketo&utm_medium=workshop).

## Tools
* install git to clone the source
  https://git-scm.com/book/it/v2/Per-Iniziare-Installing-Git
  ```
  yum install git
  ```
* install npm to install UI dependency packages (below example to install npm from yum package)
  ```
  yum install npm
  ```
* install python3
  ```
  yum install python3
  yum install --assumeyes python3-pip
  ```
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
## Setup
1. Clone and enter this repository.
```
git clone https://github.com/gopi0518/jobportal-genai.git
cd jobportal-genai
```
2. Create an .accounts file by running the following command.
```
echo "CONFLUENT_CLOUD_EMAIL=add_your_email\nCONFLUENT_CLOUD_PASSWORD=add_your_password\nexport TF_VAR_confluent_cloud_api_key=\"add_your_api_key\"\nexport TF_VAR_confluent_cloud_api_secret=\"add_your_api_secret\"\nexport TF_VAR_mongodbatlas_public_key=\"add_your_public_key\"\nexport TF_VAR_mongodbatlas_private_key=\"add_your_private_key\"\nexport TF_VAR_mongodbatlas_org_id=\"add_your_org_id\"" > .accounts
```
3. Update the .accounts file for the following variables with your credentials.
```
CONFLUENT_CLOUD_EMAIL=<replace>
CONFLUENT_CLOUD_PASSWORD=<replace>
export TF_VAR_confluent_cloud_api_key="<replace>"
export TF_VAR_confluent_cloud_api_secret="<replace>"
export TF_VAR_mongodbatlas_public_key="<replace>"
export TF_VAR_mongodbatlas_private_key="<replace>"
export TF_VAR_mongodbatlas_org_id="<replace>"
```
4. Navigate to the home directory of the project and run create_env.sh script. This bash script copies the content of .accounts file into a new file called .env and append additional variables to it.
```
cd jobportal-genai
./create_env.sh
```
5. Source .env file.
```
source .env
```
## Build your cloud infrastructure
1. Navigate to the repo's terraform directory.
```
cd terraform
```
2. Initialize Terraform within the directory.
```
terraform init
```
3. Create the Terraform plan.
```
terraform plan
```
4. Apply the plan to create the infrastructure.
```
terraform apply
```
5. Write the output of terraform to a JSON file. The setup.sh script will parse the JSON file to update the .env file.
```
terraform output -json > ../resources.json
```
6. Run the setup.sh script.
```
cd jobportal-genai
./setup.sh
```
This script achieves the following:

* Creates an API key pair that will be used in connectors' configuration files for authentication purposes.
* Creates an API key pair for Schema Registry
* Creates Tags and business metadata
* Updates the .env file to replace the remaining variables with the newly generated values.
Source .env file
```
source .env file.
```
## Generative AI API we use

We use langchain LLM version 0.1 [Langchain Docu](https://python.langchain.com/docs/get_started/introduction)

HINT:
<table><tr><td>Now, it will cost money. Unfortunately the APIs are not for free. I spend 10$ for open AI, 10$ for ProxyCurl API and SERP API is still in free status.</td></tr></table>

First we need a key which allow us to use OpenAI. Follow steps from [here](https://platform.openai.com/docs/quickstart/account-setup) to create an Account and then an API Key only.

Next Task: Create proxycurl api key. ProxyCurl will be used to scrape Linkedin. Sign Up to proxyurl and buy credits for 10$ (or whatever you think is enough, maybe you start more less) , [follow these Steps](https://nubela.co/proxycurl). You get 10 free credit. Which could be enough for a simple demo.

To be able to search in Google the correct linkedin Profile URL, we need a API key of SERP API from [here](https://serpapi.com/).

Now, put all Keys into `env-vars` file by executing the command:
```
export OPENAI_API_KEY=YOUR openAI Key
export PROXYCURL_API_KEY=YOUR ProxyURL Key
export SERPAPI_API_KEY=Your SRP API KEy
```

Congratulation the preparation is done. This was a huge setup, I know. But all the rest is "one command execution"

## Run the job portal UI (from repo home directory)
```
cd portalUI
npm install --save axios
npm start
```
## Run python code (from repo home directory

```
cd services
python3 jobportalUIService.py -f client.properties -resumereq jobseekerv6 -jobpostreq jobpostreq
python3 jobportalconsumer.py -f client.properties -resumereq jobseekerv4 -jobpostreq jobpostreq -resumeres dummytestv1 -jobpostres jobpostresv2
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

