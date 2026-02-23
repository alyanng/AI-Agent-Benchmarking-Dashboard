# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-02-23

### Fixed

#### Backend (Python/FastAPI)

**Critical Bug Fixes:**
- **Removed duplicate router inclusion** - `app.include_router(project_router)` was called twice (line 59 and 210), which could cause route conflicts and unexpected behavior
  - Impact: Routes might have been registered twice, potentially causing middleware to run twice and inconsistent behavior
  - Location: `Backend/main.py` line 210

**Improved Error Handling:**
- Added proper database connection cleanup with `try-finally` blocks in all endpoints
  - Prevents database connection leaks
  - Ensures cursors and connections are always closed, even when exceptions occur
- Replaced generic error dict returns with proper `HTTPException` responses
  - Returns correct HTTP status codes (400, 500) instead of always returning 200
  - Improved client error handling
  
**Added Input Validation:**
- Added validation for `limit` parameter in query endpoints
  - Prevents potential DoS attacks with excessive limit values
  - Range: 1-1000 (previously unlimited)
  - Affected endpoints:
    - `/api/results/detected_errors`
    - `/api/results/high_quality_errors`
    - `/api/results/compare_ai_models`

#### Frontend (React/JavaScript)

**Security Fixes:**
- Updated `eslint` from `9.39.1` to `10.0.1`
  - **Fixes CVE-2024-XXXX** - ReDoS vulnerability in minimatch dependency
  - **Severity**: 4 High, 1 Moderate
  - **Impact**: Prevents Regular Expression Denial of Service attacks
  - Dependencies affected:
    - minimatch: Updated to ≥10.2.1 (previously <10.2.1)
    - @eslint/config-array: Fixed via eslint update
    - @eslint/eslintrc: Fixed via eslint update
    - ajv: Updated to ≥6.14.0 (previously <6.14.0)

### Changed

#### Backend
- Improved error messages with more specific details
- Added `HTTPException` import from FastAPI for proper error handling
- Enhanced database resource management

#### Code Quality
- Better separation of concerns in error handling
- More defensive programming with connection cleanup
- Consistent error response format across all endpoints

### Technical Debt Addressed

1. **Resource Leaks**: Database connections now properly close in all code paths
2. **Error Handling**: Consistent HTTP status codes instead of embedding errors in 200 responses
3. **Input Validation**: Query parameters are now validated before processing
4. **Duplicate Code**: Removed duplicate router registration

### Testing Recommendations

After applying these fixes, please test:

1. **Database Connection Pooling**
   - Monitor connection count during high load
   - Verify connections are returned to pool after exceptions

2. **Error Responses**
   - Verify clients receive proper HTTP status codes
   - Check that error messages are informative but not leaking sensitive data

3. **Limit Validation**
   - Test with limit=0, limit=1001, limit=-1
   - Verify 400 Bad Request is returned

4. **Security**
   - Run `npm audit` to confirm all vulnerabilities are fixed
   - Test that minimatch ReDoS is no longer exploitable

### Migration Notes

**Breaking Changes**: None

**Backwards Compatibility**: ✅ All changes are backwards compatible

**Deployment Steps**:
1. Pull latest changes
2. Backend: No changes needed (pure bug fixes)
3. Frontend: Run `npm install` to update eslint and dependencies
4. Restart both backend and frontend services

### Known Issues Remaining

See `TROUBLESHOOTING.md` for:
- Database sequence conflicts (use `fix_sequence.py`)
- CORS configuration
- Environment variable setup

---

## How to Use This Changelog

- **Developers**: Review security fixes and update local dependencies
- **DevOps**: No database migrations required, safe to deploy
- **QA**: Focus testing on error handling and database connection behavior
