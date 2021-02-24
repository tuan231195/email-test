provider "aws" {
	region = "ap-southeast-2"
}

module "api" {
	source = "./api"
	email_queue_arn = aws_sqs_queue.email_queue.arn
}

module "worker" {
	source = "./worker"
	email_queue_arn = aws_sqs_queue.email_queue.arn
}

module "client" {
	source = "./client"
}
