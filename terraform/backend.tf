terraform {
	backend "s3" {
		encrypt = true
		bucket = "email-test-terraform"
		key = "terraform.tfstate"
		region = "ap-southeast-2"
	}
}
