# Auto-Save JSON Reports Feature

## Overview
This feature automatically detects, validates, and saves JSON debug reports returned by the AI agent without requiring manual file uploads.

## What Changed

### Frontend Changes (`Frontend/src/Send_to_Mcp.jsx`)

#### New Functions Added:
1. **`extractJsonFromAiResponse(aiText)`**
   - Extracts JSON from AI responses
   - Supports two formats:
     - Markdown code blocks: `` ```json ... ``` ``
     - Artifact tags: `<artifact>...</artifact>`

2. **`validateDebugReport(data)`**
   - Validates JSON structure
   - Checks required fields:
     - `project_name`
     - `project_github_url`
     - `errors` (must be an array)
   - Validates each error object has:
     - `error_id`
     - `error_type`
     - `was_fixed` (boolean)

3. **`handleSaveReport()`**
   - Sends validated JSON to backend
   - Calls `/save_json_data` endpoint
   - Shows success/error alerts

#### New State Variables:
- `detectedReport`: Stores the extracted and validated JSON
- `showSaveButton`: Controls visibility of save button
- `saveStatus`: Displays save operation status

#### UI Changes:
- New "Save Report to Database" button appears when valid JSON is detected
- Status messages show detection and save progress
- Styled save area with blue theme

### Backend Changes (`Backend/upload_ai_data.py`)

#### New Pydantic Models:
```python
class ErrorRecord(BaseModel):
    error_id: str
    error_type: str
    was_fixed: bool

class DebugReport(BaseModel):
    project_name: str
    project_github_url: str
    task_prompt_timestamp: str
    number_of_fixes: int
    total_time_spent_minutes: int
    number_of_errors_from_raygun: int
    errors: List[ErrorRecord]  # Array of errors
    summary: Optional[DebugReportSummary]
```

#### New Endpoint:
**POST `/save_json_data`**

**Request Body:**
```json
{
  "json_data": {
    "project_name": "UserService",
    "project_github_url": "https://github.com/company/user-service",
    "task_prompt_timestamp": "2026-02-05T14:30:00Z",
    "number_of_fixes": 1,
    "total_time_spent_minutes": 20,
    "number_of_errors_from_raygun": 19,
    "errors": [
      {
        "error_id": "269815739353",
        "error_type": "FileNotFoundException",
        "was_fixed": false
      },
      {
        "error_id": "269876052491",
        "error_type": "InputMismatchException",
        "was_fixed": true
      }
    ],
    "summary": {
      "total_errors_identified": 19,
      "errors_fixed": 17,
      "errors_not_fixed": 2,
      "deployment_correlation": "Introduced in v2.3.1",
      "recommendations": [
        "Add null checks before method calls"
      ]
    }
  },
  "prompt": "optional system prompt"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "JSON report saved successfully",
  "project_id": 123,
  "config_id": 456,
  "total_errors_inserted": 19,
  "number_of_fixes": 17
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "error message"
}
```

## How It Works

### Workflow:
1. User sends a prompt to the AI agent
2. AI returns a response (may contain JSON debug report)
3. Frontend automatically:
   - Extracts JSON from response text
   - Validates JSON structure
   - Shows "Save Report" button if valid
4. User clicks "Save Report to Database"
5. Frontend sends JSON to `/save_json_data`
6. Backend:
   - Validates data with Pydantic models
   - Inserts into `projects` table
   - Inserts into `configuration` table
   - Inserts into `results` table
   - Inserts multiple records into `error_records` table
7. Success/error message displayed to user

## Testing

### Test with Sample JSON:
```json
{
  "project_name": "TestProject",
  "project_github_url": "https://github.com/test/project",
  "task_prompt_timestamp": "2026-02-19T01:00:00Z",
  "number_of_fixes": 5,
  "total_time_spent_minutes": 30,
  "number_of_errors_from_raygun": 5,
  "errors": [
    {
      "error_id": "test001",
      "error_type": "NullPointerException",
      "was_fixed": true
    },
    {
      "error_id": "test002",
      "error_type": "IndexOutOfBounds",
      "was_fixed": false
    }
  ],
  "summary": {
    "total_errors_identified": 5,
    "errors_fixed": 4,
    "errors_not_fixed": 1,
    "deployment_correlation": "v1.0.0",
    "recommendations": ["Add validation"]
  }
}
```

### Manual Testing Steps:
1. Start backend: `cd Backend && uvicorn main:app --reload`
2. Start frontend: `cd Frontend && npm run dev`
3. Send a message to AI that should return a JSON report
4. Verify "Save Report" button appears
5. Click button and verify database entries

## Database Tables Affected

- **`projects`**: New project entry created
- **`configuration`**: New configuration entry created
- **`results`**: New result entry with fixes and duration
- **`error_records`**: Multiple entries (one per error in array)

## Benefits

✅ No manual file uploads required  
✅ Automatic JSON detection from AI responses  
✅ Data validation before saving  
✅ Clear user feedback  
✅ Supports multiple errors per report  
✅ Reuses existing database functions  

## Future Enhancements

- [ ] Add option to edit JSON before saving
- [ ] Show preview of detected JSON
- [ ] Support batch saving of multiple reports
- [ ] Add report history/tracking
- [ ] Export saved reports back to JSON
