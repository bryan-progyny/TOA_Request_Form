# Outlook Email & Snowflake Setup Instructions

This application sends email via Microsoft Outlook and stores data in Snowflake. Here's how to set it up:

## Prerequisites

- Microsoft 365 account with admin access
- Snowflake account with appropriate permissions
- Access to create App Registrations in Azure AD

---

## Part 1: Microsoft Outlook Setup (Microsoft Graph API)

### Step 1: Create an Azure AD App Registration

1. Go to the [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **+ New registration**
4. Fill in the details:
   - **Name**: TOA Form Mailer (or any descriptive name)
   - **Supported account types**: Accounts in this organizational directory only
   - Click **Register**

### Step 2: Get Your Client ID and Tenant ID

After creating the app:
1. On the app's **Overview** page, copy:
   - **Application (client) ID** → This is your `OUTLOOK_CLIENT_ID`
   - **Directory (tenant) ID** → This is your `OUTLOOK_TENANT_ID`

### Step 3: Create a Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **+ New client secret**
3. Add a description (e.g., "TOA Form Secret")
4. Choose an expiration period (recommended: 24 months)
5. Click **Add**
6. **IMPORTANT**: Copy the **Value** immediately → This is your `OUTLOOK_CLIENT_SECRET`
   - You won't be able to see this value again!

### Step 4: Configure API Permissions

1. Go to **API permissions** in your app registration
2. Click **+ Add a permission**
3. Select **Microsoft Graph**
4. Choose **Application permissions** (not Delegated)
5. Add these permissions:
   - **Mail.Send** (to send emails)
6. Click **Add permissions**
7. **CRITICAL**: Click **Grant admin consent** for your organization
   - This requires admin privileges

### Step 5: Configure the Sending Email Account

1. Decide which email account will send the emails (e.g., toa-forms@yourcompany.com)
2. This email address will be your `OUTLOOK_FROM_EMAIL`
3. Make sure this account exists and is properly licensed

---

## Part 2: Snowflake Setup

### Step 1: Get Your Snowflake Account Details

You'll need:
- **Account identifier**: Found in your Snowflake URL (e.g., `xy12345.us-east-1`)
  - This is your `SNOWFLAKE_ACCOUNT` BAILEY RYAN -> MDA67638
- **Username**: Your Snowflake username → `SNOWFLAKE_USER`
- **Password**: Your Snowflake password → `SNOWFLAKE_PASSWORD`

### Step 2: Create Database and Schema

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

Your values:
- `SNOWFLAKE_DATABASE` = `TOA_DATA`
- `SNOWFLAKE_SCHEMA` = `REQUESTS`

### Step 3: Create a Warehouse

If you don't have a warehouse, create one:

```sql
CREATE WAREHOUSE IF NOT EXISTS TOA_WAREHOUSE
  WITH WAREHOUSE_SIZE = 'X-SMALL'
  AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE;
```

Your value:
- `SNOWFLAKE_WAREHOUSE` = `TOA_WAREHOUSE`

### Step 4: Create the PROSPECTS Table

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

### Step 5: Grant Permissions

Make sure your user has the necessary permissions:

```sql
GRANT USAGE ON DATABASE TOA_DATA TO ROLE YOUR_ROLE;
GRANT USAGE ON SCHEMA TOA_DATA.REQUESTS TO ROLE YOUR_ROLE;
GRANT INSERT, SELECT ON TABLE TOA_DATA.REQUESTS.PROSPECTS TO ROLE YOUR_ROLE;
GRANT USAGE ON WAREHOUSE TOA_WAREHOUSE TO ROLE YOUR_ROLE;
```

Replace `YOUR_ROLE` with your actual Snowflake role (e.g., `ACCOUNTADMIN`, `SYSADMIN`, or a custom role).

---

## Part 3: Configure Environment Variables

The edge function needs these environment variables. They are automatically configured - you just need to provide the values.

### Required Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `OUTLOOK_CLIENT_ID` | Azure AD App Client ID | `12345678-1234-1234-1234-123456789012` |
| `OUTLOOK_CLIENT_SECRET` | Azure AD App Client Secret | `abc123~DefGHI456jklMNO789pqrSTU` |
| `OUTLOOK_TENANT_ID` | Azure AD Tenant ID | `87654321-4321-4321-4321-210987654321` |
| `OUTLOOK_FROM_EMAIL` | Email address that sends | `toa-forms@yourcompany.com` |
| `SNOWFLAKE_ACCOUNT` | Snowflake account identifier | `xy12345.us-east-1` |
| `SNOWFLAKE_USER` | Snowflake username | `TOA_USER` |
| `SNOWFLAKE_PASSWORD` | Snowflake password | `YourSecurePassword123!` |
| `SNOWFLAKE_WAREHOUSE` | Snowflake warehouse name | `TOA_WAREHOUSE` |
| `SNOWFLAKE_DATABASE` | Snowflake database name | `TOA_DATA` |
| `SNOWFLAKE_SCHEMA` | Snowflake schema name | `REQUESTS` |

---

## Testing the Setup

### Test 1: Verify Email Sending

1. Fill out the form with test data
2. Submit the form
3. Check that Bailey.ryan@progyny.com receives an email with:
   - Subject: `TOA Request - [Prospect Name]`
   - CSV attachment with all form data

### Test 2: Verify Snowflake Storage

```sql
-- Check if data was inserted
USE DATABASE TOA_DATA;
USE SCHEMA REQUESTS;

SELECT * FROM PROSPECTS
ORDER BY CREATED_AT DESC
LIMIT 10;
```

You should see your test submission in the results.

---

## Troubleshooting

### Email Not Sending

1. **Check Azure AD App Permissions**
   - Verify `Mail.Send` permission is granted
   - Verify admin consent was granted

2. **Check Client Secret**
   - Make sure the secret hasn't expired
   - Verify the secret value is correct

3. **Check Sending Email Account**
   - Verify the account exists and is licensed
   - Try sending a test email from that account manually

### Snowflake Connection Issues

1. **Check Account Identifier**
   - It should be in the format: `account_name.region`
   - Find it in your Snowflake URL

2. **Check Credentials**
   - Verify username and password are correct
   - Try logging into Snowflake manually

3. **Check Permissions**
   - Make sure your user has INSERT permissions on the PROSPECTS table
   - Verify warehouse usage permissions

4. **Check Network Access**
   - Snowflake may require specific IP whitelisting
   - Check your Snowflake network policies

### General Debugging

Check the edge function logs in your Supabase dashboard under Functions to see detailed error messages.

---

## Security Best Practices

1. **Client Secrets**: Rotate them regularly (every 6-12 months)
2. **Passwords**: Use strong, unique passwords for Snowflake
3. **Permissions**: Only grant the minimum permissions needed
4. **Monitoring**: Regularly check logs for suspicious activity
5. **Email Account**: Use a dedicated service account, not a personal email

---

## Cost Considerations

### Microsoft Graph API
- Free for most use cases
- Check [Microsoft Graph pricing](https://azure.microsoft.com/en-us/pricing/details/graph-api/)

### Snowflake
- Charged based on:
  - Compute: Warehouse size and runtime
  - Storage: Data stored
- X-SMALL warehouse costs approximately $2/hour when running
- Auto-suspend helps minimize costs

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review edge function logs in Supabase dashboard
3. Verify all environment variables are set correctly
4. Test Azure AD app permissions in Azure Portal
5. Test Snowflake connectivity using Snowflake web interface
