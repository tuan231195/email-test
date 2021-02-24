locals {
	message_retention_period = 1209600
	max_received_count = 3
	visibility_timeout_seconds = 360
}
resource "aws_sqs_queue" "email_queue" {
	name = "email-queue"
	message_retention_seconds = local.message_retention_period
	visibility_timeout_seconds = local.visibility_timeout_seconds
	redrive_policy = jsonencode({
		deadLetterTargetArn = aws_sqs_queue.email_queue_dlq.arn,
		maxReceiveCount = local.max_received_count
	})
}

resource "aws_sqs_queue" "email_queue_dlq" {
	name = "email-queue-dlq"
	message_retention_seconds = local.message_retention_period
}
