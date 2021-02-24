locals {
	client_dist = "${path.root}/../client/dist"
	website_bucket_name = "email-test-client-hosting-website"
}
resource "aws_s3_bucket" "client_bucket" {
	bucket = "email-test-client-hosting-website"
	acl = "public-read"
	website {
		index_document = "index.html"
		error_document = "index.html"
	}
	policy = <<EOF
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForGetBucketObjects",
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${local.website_bucket_name}/*"
    }
  ]
}
EOF
}

resource "null_resource" "remove_and_upload_to_s3" {
	provisioner "local-exec" {
		command = "aws s3 sync ${local.client_dist} s3://${aws_s3_bucket.client_bucket.id}"
	}
}
