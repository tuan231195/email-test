locals {
	message_retention_period = 1209600
	max_received_count = 3
	visibility_timeout_seconds = 360
}
resource "aws_sqs_queue" "email_queue" {
	fifo_queue = true
	name = "email-queue.fifo"
	message_retention_seconds = local.message_retention_period
	visibility_timeout_seconds = local.visibility_timeout_seconds
	content_based_deduplication = true
	redrive_policy = jsonencode({
		deadLetterTargetArn = aws_sqs_queue.email_queue_dlq.arn,
		maxReceiveCount = local.max_received_count
	})
}

resource "aws_sqs_queue" "email_queue_dlq" {
	fifo_queue = true
	name = "email-queue-dlq.fifo"
	message_retention_seconds = local.message_retention_period
	content_based_deduplication = true
}
