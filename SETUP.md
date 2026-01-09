# TOA Request Form Setup Guide

This application stores TOA request data in Snowflake and optionally creates Jira tickets. Follow the instructions below to configure your environment.

---

## Table of Contents

1. [Snowflake Setup](#snowflake-setup)
2. [Jira Setup (Optional)](#jira-setup-optional)
3. [Testing](#testing)
4. [Troubleshooting](#troubleshooting)

---

## Snowflake Setup

### Prerequisites

- Snowflake account with SSO enabled through Microsoft
- Access to create databases, schemas, and tables
- Ability to generate OAuth tokens

### Step 1: Get Your Snowflake Account Details

You'll need the following information:

- **Account identifier**: Found in your Snowflake URL (e.g., `xy12345.us-east-1`)

### Step 2: Generate OAuth Token for SSO

Since your organization uses Microsoft SSO for Snowflake authentication, you'll need to obtain an OAuth token. There are several ways to do this:

#### Option A: Using SnowSQL CLI

1. Install SnowSQL if not already installed
2. Configure SSO authentication:
   ```bash
   snowsql -a <account_identifier> -u <your_email> --authenticator externalbrowser
   ```
3. After successful login, you can extract the token from the session

#### Option B: Using Snowflake Python Connector

```python
import snowflake.connector

conn = snowflake.connector.connect(
    account='<account_identifier>',
    user='<your_email>',
    authenticator='externalbrowser'
)

# Get the OAuth token
token = conn.rest.token
print(token)
```

#### Option C: Contact Your Snowflake Administrator

Your Snowflake administrator can create a service account with OAuth credentials specifically for this integration. This is the recommended approach for production use.

**Important Notes:**
- OAuth tokens typically expire after a certain period (usually 1-4 hours)
- For production, you should implement a token refresh mechanism
- Consider using a service account rather than a personal account

### Step 3: Create Database and Schema

Connect to Snowflake and run these commands:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS TOA_DATA;

-- Create schema
CREATE SCHEMA IF NOT EXISTS TOA_DATA.REQUESTS;

-- Use the database and schema
USE DATABASE TOA_DATA;
USE SCHEMA REQUESTS;
```

### Step 4: Create a Warehouse

If you don't have a warehouse, create one:

```sql
CREATE WAREHOUSE IF NOT EXISTS TOA_WAREHOUSE
  WITH WAREHOUSE_SIZE = 'X-SMALL'
  AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE;
```

### Step 5: Create the PROSPECTS Table

```sql
CREATE TABLE IF NOT EXISTS PROSPECTS (
  ID STRING DEFAULT UUID_STRING(),
  PROSPECT_NAME STRING NOT NULL,
  PROSPECT_INDUSTRY STRING,
  UNION_TYPE STRING,
  ELIGIBLE_EMPLOYEES NUMBER,
  ELIGIBLE_MEMBERS NUMBER,
  CONSULTANT STRING,
  CHANNEL_PARTNERSHIP STRING,
  HEALTHPLAN_PARTNERSHIP STRING,
  NEEDS_CIGNA_SLIDES STRING,
  SCENARIOS_COUNT NUMBER,
  SMART_CYCLES_OPTION_1 STRING,
  SMART_CYCLES_OPTION_2 STRING,
  RX_COVERAGE_TYPE STRING,
  EGG_FREEZING_COVERAGE STRING,
  FERTILITY_PEPM FLOAT,
  FERTILITY_CASE_RATE FLOAT,
  IMPLEMENTATION_FEE FLOAT,
  CURRENT_FERTILITY_BENEFIT STRING,
  FERTILITY_ADMINISTRATOR STRING,
  COMBINED_MEDICAL_RX_BENEFIT BOOLEAN,
  CURRENT_FERTILITY_MEDICAL_LIMIT FLOAT,
  MEDICAL_LTM_TYPE STRING,
  CURRENT_FERTILITY_RX_LIMIT FLOAT,
  RX_LTM_TYPE STRING,
  MEDICAL_BENEFIT_DETAILS STRING,
  RX_BENEFIT_DETAILS STRING,
  CURRENT_ELECTIVE_EGG_FREEZING STRING,
  LIVE_BIRTHS_12MO NUMBER,
  CURRENT_BENEFIT_PEPM FLOAT,
  CURRENT_BENEFIT_CASE_FEE FLOAT,
  INCLUDE_NO_BENEFIT_COLUMN BOOLEAN,
  DOLLAR_MAX_COLUMN BOOLEAN,
  COMPETING_AGAINST STRING,
  ADOPTION_SURROGACY_ESTIMATES BOOLEAN,
  ADOPTION_COVERAGE FLOAT,
  ADOPTION_FREQUENCY STRING,
  SURROGACY_COVERAGE FLOAT,
  SURROGACY_FREQUENCY STRING,
  FEMALE_EMPLOYEES_40_60 NUMBER,
  LIVE_BIRTHS_12MO_EXPANDED NUMBER,
  SUBSCRIBERS_DEPENDENTS_UNDER_12 NUMBER,
  NOTES STRING,
  CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (ID)
);
```

### Step 6: Grant Permissions

Make sure your user has the necessary permissions:

```sql
GRANT USAGE ON DATABASE TOA_DATA TO ROLE YOUR_ROLE;
GRANT USAGE ON SCHEMA TOA_DATA.REQUESTS TO ROLE YOUR_ROLE;
GRANT INSERT, SELECT ON TABLE TOA_DATA.REQUESTS.PROSPECTS TO ROLE YOUR_ROLE;
GRANT USAGE ON WAREHOUSE TOA_WAREHOUSE TO ROLE YOUR_ROLE;
```

Replace `YOUR_ROLE` with your actual Snowflake role (e.g., `ACCOUNTADMIN`, `SYSADMIN`, or a custom role).

### Step 7: Configure Environment Variables

The edge function needs these Snowflake environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `SNOWFLAKE_ACCOUNT` | Snowflake account identifier | `xy12345.us-east-1` |
| `SNOWFLAKE_OAUTH_TOKEN` | OAuth access token from Microsoft SSO | `ver=2&...` (long token string) |
| `SNOWFLAKE_WAREHOUSE` | Snowflake warehouse name | `TOA_WAREHOUSE` |
| `SNOWFLAKE_DATABASE` | Snowflake database name | `TOA_DATA` |
| `SNOWFLAKE_SCHEMA` | Snowflake schema name | `REQUESTS` |

**Important Notes:**
- The `SNOWFLAKE_OAUTH_TOKEN` is obtained through the Microsoft SSO authentication flow
- Tokens expire periodically and need to be refreshed
- For production use, implement an automated token refresh mechanism
- Store the token securely and never commit it to version control

---

## Jira Setup (Optional)

If you want to automatically create Jira tickets when prospects are submitted, follow these steps.

### Prerequisites

- Jira account with project access
- Permissions to create API tokens

### Step 1: Create a Jira API Token

1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **Create API token**
3. Give it a name (e.g., "TOA Form Integration")
4. Copy the generated token (you won't be able to see it again!)

### Step 2: Get Your Jira Details

You'll need:

- **Jira URL**: Your Jira site URL (e.g., `https://yourcompany.atlassian.net`)
- **Email**: The email address associated with your Jira account
- **Project Key**: The key for your Jira project (e.g., `SALES`, `TOA`)

To find your project key:
1. Go to your Jira project
2. Look at the URL or project settings
3. The key is usually visible in the project sidebar (e.g., `SALES-123` → project key is `SALES`)

### Step 3: Configure Environment Variables

The Jira edge function needs these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `JIRA_URL` | Your Jira instance URL | `https://yourcompany.atlassian.net` |
| `JIRA_EMAIL` | Email associated with Jira account | `your.email@company.com` |
| `JIRA_API_TOKEN` | API token from Step 1 | `ATATT3xFfGF0...` |
| `JIRA_PROJECT_KEY` | Project key where tickets will be created | `SALES` |

### Step 4: How to Use Jira Integration

The Jira integration is available through the `create-jira-ticket` edge function. To create a ticket after submitting a form, call:

```javascript
const response = await fetch(`${SUPABASE_URL}/functions/v1/create-jira-ticket`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prospectId: 'uuid-of-prospect',
    prospectName: 'Company Name',
    prospectIndustry: 'Technology',
    numberOfEmployees: 500
  })
});
```

---

## Testing

### Test Snowflake Connection

After setup, submit a test form and verify the data was inserted:

```sql
USE DATABASE TOA_DATA;
USE SCHEMA REQUESTS;

SELECT * FROM PROSPECTS
ORDER BY CREATED_AT DESC
LIMIT 10;
```

You should see your test submission in the results.

### Test Jira Integration (if configured)

1. Submit a test form
2. Call the `create-jira-ticket` edge function with the prospect details
3. Check your Jira project for the newly created ticket
4. The ticket should have:
   - Summary: "New Prospect: [Prospect Name]"
   - Description with prospect details

---

## Troubleshooting

### Snowflake Connection Issues

**Problem**: "Failed to insert into Snowflake" error

**Solutions**:
1. Verify your Snowflake account identifier format is correct (`account.region`)
2. Check that your OAuth token is valid and hasn't expired
3. Ensure the warehouse is running and accessible
4. Verify the user associated with the OAuth token has INSERT permissions on the PROSPECTS table
5. Check Snowflake network policies (IP whitelisting)

**Problem**: "Snowflake environment variables not configured" error

**Solutions**:
1. Verify all 5 Snowflake environment variables are set (ACCOUNT, OAUTH_TOKEN, WAREHOUSE, DATABASE, SCHEMA)
2. Check for typos in variable names
3. Ensure values don't have extra spaces or quotes

**Problem**: "Authentication failed" or "Token expired" error

**Solutions**:
1. Your OAuth token has likely expired - generate a new one
2. Verify the token is correctly formatted
3. Ensure you're using the full token string without truncation
4. Consider implementing an automated token refresh mechanism for production use

### Jira Integration Issues

**Problem**: Jira tickets not being created

**Solutions**:
1. Verify the API token is valid and hasn't expired
2. Check that the email matches your Jira account
3. Ensure the project key exists and is accessible
4. Verify the API token has permissions to create issues in the project

**Problem**: "Jira not configured" message

**Solutions**:
- This is normal if you haven't set up Jira yet
- The form will still work and save to Snowflake
- Set the 4 Jira environment variables to enable ticket creation

### General Debugging

- Check the edge function logs in your Supabase dashboard
- Look for detailed error messages in the browser console
- Verify all environment variables are set correctly
- Test Snowflake connectivity using the Snowflake web interface

---

## Security Best Practices

1. **OAuth Tokens**: Never commit OAuth tokens to version control
2. **Token Refresh**: Implement automated token refresh for production environments
3. **Service Accounts**: Use dedicated service accounts rather than personal accounts
4. **API Tokens**: Rotate Jira API tokens regularly (every 6-12 months)
5. **Permissions**: Only grant the minimum permissions needed
6. **Monitoring**: Regularly check logs for suspicious activity
7. **Network**: Consider IP whitelisting in Snowflake for additional security

### Token Refresh Strategy

For production environments, you should implement a token refresh mechanism:

1. **Short-lived Tokens**: Use short-lived OAuth tokens (1-4 hours)
2. **Refresh Logic**: Implement automatic token refresh before expiration
3. **Monitoring**: Set up alerts for authentication failures
4. **Fallback**: Have a fallback authentication method for emergencies

---

## Cost Considerations

### Snowflake
- Charged based on:
  - **Compute**: Warehouse size and runtime
  - **Storage**: Data stored
- X-SMALL warehouse costs approximately $2/hour when running
- Auto-suspend helps minimize costs by pausing the warehouse when not in use

### Jira
- Included with your Jira subscription
- No additional costs for API usage within normal limits

---

## Support

If you encounter issues:
1. Review the troubleshooting section above
2. Check edge function logs in Supabase dashboard
3. Verify all environment variables are set correctly
4. Test connections manually using Snowflake web interface and Jira API
5. Check that your user has appropriate permissions in both systems
