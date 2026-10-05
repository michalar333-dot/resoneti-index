# Security Specification - RESONETI Index 4R

## 1. Data Invariants
- A submission must have a non-empty `companyName` (maximum 150 characters to prevent buffer overflow attacks).
- Answers must be a structured map.
- The creation time must strictly correspond to the server's timestamp (`request.time`).
- Submissions are write-only by public users (to prevent scraping of other firms' diagnostic results) and optionally read-only if the creator knows the specific generated `id`, but blanket reads are strictly banned.

## 2. The "Dirty Dozen" Playloads
Below are 12 malicious/invalid payloads that must be rejected:
1. Missing `companyName` during create.
2. Injected redundant global user roles in payload (e.g. `isAdmin: true` or `role: "admin"`).
3. Payload with a spoofed `createdAt` client timestamp instead of server timestamp.
4. Payload size exceeding 500KB.
5. `companyName` with length greater than 200 characters.
6. Answers injected with non-numeric rating answers (e.g., `q1: "hacked"`).
7. Attempting to update or modify an existing completed submission (immutable after submission).
8. Attempting to delete a completed submission.
9. Attempting to list all submissions in the database.
10. Attempting a wildcard search of submissions without pointing to an exact ID.
11. Attempting to overwrite a submission with a custom malicious alphanumeric ID of 1000 characters.
12. Attempting to change the score results on an already calculated submission.
