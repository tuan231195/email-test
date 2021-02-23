provider "aws" {
	region = "ap-southeast-2"
}

module "api" {
	source = "./api"
}
