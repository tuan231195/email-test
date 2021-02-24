### Email Test

#### Live demo

The front end is hosted on Amazon S3 at: http://email-test-client-hosting-website.s3-website-ap-southeast-2.amazonaws.com/

The back end is hosted at: https://32na352eyk.execute-api.ap-southeast-2.amazonaws.com

#### Requirements

* Node 12+
* AWS account
* Mailgun and Sendgrid trial accounts
* Docker
* Terraform

#### API

Request Body

```
{
  "to":[
          {"email":"vdtn359@gmail.com","name":"John Doe"},
          {"email":"dotuan2311@gmail.com", "name": "Tuan Nguyen"}
       ],
  "cc":[{"email": "vdtn359@uowmail.edu.au", "name": "CC Nguyen"}],
  "bcc":[{"email": "vdtn359+a@gmail.com","name":"BCC Nguyen"}],
  "subject":"Test email",
  "from": { "email":"noreply@sg.vdtn359.com.au","name":"Test Sender" },
  "body": "<b>Hello world</b>"
}
```
Curl command:

Example curl:

```
curl -i -X POST \
 https://32na352eyk.execute-api.ap-southeast-2.amazonaws.com/email \
--header 'content-type: application/json' \
--data '{"to":[{"email":"vdtn359@gmail.com","name":"John Doe"},{"email":"dotuan2311@gmail.com","name":"Tuan Nguyen"}],"cc":[{"email":"vdtn359@uowmail.edu.au","name":"CC Nguyen"}],"bcc":[{"email":"vdtn359+a@gmail.com","name":"BCC Nguyen"}],"subject":"Test email","from":{"email":"noreply@sg.vdtn359.com.au","name":"Test Sender"},"body":"<b>Hello world</b>"}'
```

Params

``` 
| Name          | Type                                      | Description                   |Required|
|to             | array[{ email: string; name: string }]    | TO recipients                 |yes|
|from           | { email: string; name: string }           | sender                        |required|
|cc             | array[{ email: string; name: string }]    | CC recipients                 |no|
|bcc            | array[{ email: string; name: string }]    | BCC recipients                |no|
|subject        | string                                    | email subject                 |yes|
|body           | string                                    | email html body               |yes|

```


#### Local Setup

* Create a .env file from env.example with the following content

```
MAILGUN_API_KEY=<mailgun api key>
MAILGUN_DOMAIN=<mailgun domain>
SENDGRID_API_KEY=<sendgrid api key>
```

* In your AWS account, create a sqs queue called test-email-queue. Replace queueUrl value in `src/config/default.js` with the new sqs queue arn

* Run redis: 

```
docker run -d -p 6379:6379 --restart=always redis:5
```

* Start server and client:

```
npm run dev
```

#### Development

* `npm run dev`
* The frontend is available at http://localhost:1234
* The backend is available at http://localhost:5000

#### Deploy

```
npm run package
cd terraform
terraform init
terraform apply --auto-approve
```

* This command deploys the client assets to S3 and deploys backend code to Amazon API Gateway

#### Test
* `npm test`: Run tests
* `npm run test:coverage`: Run tests with coverage
