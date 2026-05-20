# Requirements Clarification Questions

I detected a potential inconsistency in your responses that needs clarification:

## Inconsistency 1: Local Deployment vs Cloud Storage
You indicated "Local development only (Docker Compose)" (Q1: A) but also "Cloud object storage (e.g., AWS S3, Azure Blob)" (Q3: B).

Running locally with Docker Compose while using cloud object storage requires either real cloud credentials configured locally or a local S3-compatible emulator.

### Clarification Question 1
How should file/evidence storage work in the local Docker Compose environment?

A) Use MinIO (S3-compatible local object storage) running as a Docker container — code uses S3 SDK, easily swappable to real S3 later
B) Use actual AWS S3 with local AWS credentials — requires AWS account setup
C) Use local filesystem for MVP, with an abstraction layer that can be swapped to S3 later
X) Other (please describe after [Answer]: tag below)

[Answer]: A, but keep this simple as this is just a mock MVP
