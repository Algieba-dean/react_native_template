# Jira Service Management & Ticket Integration

This optional guide explains how to connect mobile feedback submissions directly to Atlassian Jira Cloud or Jira Service Management (JSM).

---

## 1. Authentication & Security

**Never hardcode Jira API tokens in mobile app client code.**
Mobile applications must communicate with an intermediary backend or cloud edge worker (e.g. Cloudflare Worker or AWS Lambda) that safely injects the Jira API credentials.

```
[Mobile App] ──► [Edge Worker / Backend API] ──► [Jira Cloud REST API]
                     (Holds JIRA_API_TOKEN)
```

---

## 2. Jira REST API Payload Mapping

When transforming mobile `FeedbackSubmission` into Jira Issue Creation (`POST /rest/api/3/issue`):

```json
{
  "fields": {
    "project": {
      "key": "SUPPORT"
    },
    "summary": "[Mobile] ${submission.title}",
    "description": {
      "type": "doc",
      "version": 1,
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "${submission.description}\n\nCategory: ${submission.category}\nPlatform: ${submission.platform}\nVersion: ${submission.appVersion}\nContact: ${submission.contact || 'N/A'}"
            }
          ]
        }
      ]
    },
    "issuetype": {
      "name": "${submission.category === 'bug' ? 'Bug' : 'Task'}"
    }
  }
}
```

---

## 3. Handling Diagnostic Log Attachments

If diagnostic records are attached:
1. Serialize the safe `StructuredLogRecord[]` array as a JSON text stream.
2. Call Jira Issue Attachment API: `POST /rest/api/3/issue/{issueIdOrKey}/attachments` with `multipart/form-data`.
3. Provide the user with the resulting Jira Issue Key (e.g. `SUPPORT-1042`) as their feedback receipt.
