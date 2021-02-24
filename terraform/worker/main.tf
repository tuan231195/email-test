module "lambda" {
	source = "git::https://github.com/tuan231195/terraform-modules.git//modules/aws-lambda?ref=master"
	function_name = "email-test-worker-lambda-function"
	handler = "handlers/email-worker.handler"
	source_path = "${path.root}/../dist"
	runtime = "nodejs12.x"
	policy = {
		json = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
        "Action": [
            "secretsmanager:*"
        ],
        "Resource": "arn:aws:secretsmanager:ap-southeast-2:923678104243:secret:secrets-production-TjrQV5",
        "Effect": "Allow"
    },
 	{
        "Action": [
            "sqs:*"
        ],
        "Resource": [
			"${var.email_queue_arn}"
		],
        "Effect": "Allow"
    }
  ]
}
EOF
	}
	environment = {
		variables = {
			NODE_CONFIG_ENV = "production"
		}
	}
	layer_config = {
		package_file = "${path.root}/../dist/package.json"
		compatible_runtimes = ["nodejs12.x"]
	}
	timeout = 180
}

resource "aws_lambda_event_source_mapping" "event_source_mapping" {
	event_source_arn = var.email_queue_arn
	function_name = module.lambda.function_arn
	batch_size = 10
}
