output "apigateway_url" {
	value = module.api.apigateway_url
}

output "email_queue_url" {
	value = aws_sqs_queue.email_queue.id
}

output "bucket_url" {
	value = module.client.bucket_url
}
