module "api_gateway" {
	source = "terraform-aws-modules/apigateway-v2/aws"

	name          = "email-test-apigw"
	protocol_type = "HTTP"
	create_api_domain_name = false

	cors_configuration = {
		allow_headers = ["content-type"]
		allow_methods = ["*"]
		allow_origins = ["*"]
	}

	integrations = {
		"POST /email" = {
			lambda_arn             = module.lambda.function_arn
			timeout_milliseconds   = 12000
			payload_format_version = "2.0"
		}
	}

	default_stage_access_log_destination_arn = aws_cloudwatch_log_group.apigateway_log_group.arn
	default_stage_access_log_format          = "$context.identity.sourceIp - - [$context.requestTime] \"$context.httpMethod $context.routeKey $context.protocol\" $context.status $context.responseLength $context.requestId $context.integrationErrorMessage"
}

resource "aws_cloudwatch_log_group" "apigateway_log_group" {
	retention_in_days = 14
	name = "email-test-apigw-log-group"
}

module "lambda" {
	source = "git::https://github.com/tuan231195/terraform-modules.git//modules/aws-lambda?ref=master"
	function_name = "email-test-sender-lambda-function"
	handler = "handlers/email-sender.handler"
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
        "Resource": "*",
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
}

resource "aws_lambda_permission" "apigateway_permission" {
	action = "lambda:InvokeFunction"
	function_name = module.lambda.function_arn
	principal = "apigateway.amazonaws.com"
	source_arn = "${module.api_gateway.this_apigatewayv2_api_execution_arn}/*/*/email"
}
