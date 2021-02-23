output "apigateway_url" {
	value = module.api.apigateway_url
}

output "email_queue_url" {
	value = aws_sqs_queue.email_queue.id
}
