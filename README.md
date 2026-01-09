# TOA Request Form

A professional web application for collecting and managing TOA (Total Opportunity Assessment) requests. Data is automatically stored in Supabase with optional Jira ticket creation.

## Features

- **Comprehensive Form**: Collect detailed prospect information including client details, health plans, benefits, and more
- **Supabase Integration**: Automatically stores all form submissions in Supabase database
- **Dynamic Health Plans**: Add multiple health plan configurations with employee distribution tracking
- **Due Date Tracking**: Set due dates and automatically flag rush requests (less than 5 business days)
- **Advanced Filtering**: Filter requests by date range, prospect name, and industry
- **CSV Export**: Export filtered data with all fields to CSV for reporting and analysis
- **Sorting Options**: Sort by default (most recent first) or group by prospect name with most recent on top
- **Duplicate Detection**: Automatic warning when submitting identical requests
- **Data Management**: Delete submitted requests with confirmation prompts
- **Results Counter**: Always see how many requests match your current filters
- **Admin Dashboard**: Review all submitted requests with detailed information and health plan breakdowns
- **Jira Integration (Optional)**: Create Jira tickets for new prospects
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Validation**: Client-side validation ensures data integrity before submission

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Backend**: Supabase Edge Functions
- **Database**: Supabase PostgreSQL
- **Project Management**: Jira (optional)

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ and npm installed
- A Supabase account and project
- (Optional) A Jira account for ticket creation

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` (if available)
   - Configure the required Supabase variables (see Configuration section)

## Configuration

### Required Environment Variables

Create a `.env` file in the project root with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Database

The database schema is automatically created using migrations in the `supabase/migrations/` folder. Tables include:
- `prospects` - Main table for TOA requests
- `health_plans` - Health plan configurations linked to prospects
- `dropdown_options` - Autocomplete options for form fields

### Jira Setup (Optional)

For Jira integration, configure these in your Supabase Edge Functions:

- `JIRA_URL` - Your Jira instance URL
- `JIRA_EMAIL` - Email associated with your Jira account
- `JIRA_API_TOKEN` - Jira API token
- `JIRA_PROJECT_KEY` - Project key for ticket creation

**See [SETUP.md](./SETUP.md) for detailed Jira configuration instructions.**

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

Build the project:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── ProspectForm.tsx       # Main form component
│   │   ├── AdminView.tsx          # Submitted requests dashboard
│   │   └── AutocompleteInput.tsx  # Reusable autocomplete field
│   ├── lib/
│   │   └── supabase.ts            # Supabase client configuration
│   ├── utils/
│   │   └── formatting.ts          # Currency/number formatting utilities
│   ├── App.tsx                     # Root component
│   ├── main.tsx                    # Application entry point
│   └── index.css                   # Global styles
├── supabase/
│   ├── migrations/                 # Database schema migrations
│   └── functions/
│       ├── submit-toa-request/     # Form submission handler
│       └── create-jira-ticket/     # Jira integration
├── SETUP.md                        # Detailed setup instructions
└── README.md                       # This file
```

## How It Works

1. **Form Submission**: User fills out the comprehensive TOA request form
2. **Validation**: Client-side validation ensures all required fields are complete
3. **Supabase Storage**: Data is sent to the `submit-toa-request` edge function
4. **Data Insert**: Prospect and health plan data is inserted into Supabase tables
5. **Success Response**: User receives confirmation that data was stored
6. **View Requests**: Switch to "View Submitted Requests" to see all submissions
7. **(Optional)** Jira Ticket: Call `create-jira-ticket` to create a Jira issue

## Form Sections

The form collects information across multiple sections:

- **Client Information**: Prospect details, industry, employees, consultants, partnerships, due date
- **Health Plans**: Multiple health plan configurations with deductibles, OOP, coinsurance, employee distribution
- **New Benefit**: Smart cycles options, Rx coverage, egg freezing, pricing details (PEPM, case rate, implementation fee)
- **Current Benefit**: Existing fertility benefits and coverage details
- **Additional**: Dollar max comparisons, competing vendors
- **Expanded Products**: Demographics and birth data
- **Notes**: Additional comments and requirements

## View Submitted Requests

The admin view allows you to:
- See all submitted TOA requests with key details
- Filter by date range (last week, month, 3 months, custom dates, or all time)
- Filter by prospect name to see all submissions for a specific prospect
- Filter by industry to focus on specific sectors
- Sort by prospect name (groups same prospects together, most recent first)
- Export filtered results to CSV with all form fields included
- Clear all filters with one click to return to default view
- View results counter showing filtered vs total requests
- View full request ID for tracking
- See "RUSH" labels for requests due within 5 business days
- Expand individual requests to see full health plan details
- View calculated blended OOP family amounts
- Delete requests with confirmation prompts

## Troubleshooting

### Form won't submit
- Check browser console for errors
- Verify all required fields are filled (marked with *)
- Ensure employee distribution adds up to 100% (or total employees if using number distribution)
- If Cigna is selected as health-plan partnership, "Do you need the Cigna branded slides?" must be answered

### Duplicate warning appears
- The system checks if an identical submission already exists (all fields and health plans must match)
- This is a safety feature to prevent accidental duplicate entries
- If you need to submit anyway (e.g., requesting a new analysis for the same prospect), click "Submit Anyway"
- It's normal to have multiple submissions for the same prospect with different details

### Database connection errors
- Verify your Supabase environment variables are set correctly
- Check that the Supabase project is active
- Review edge function logs in Supabase dashboard

### Jira integration not working
- Ensure all Jira environment variables are configured
- Verify your API token has appropriate permissions
- Check that the project key exists and is accessible

For detailed troubleshooting, see [SETUP.md](./SETUP.md#troubleshooting).

## Security

- Never commit API keys or tokens to version control
- Use environment variables for all sensitive configuration
- Review database permissions and RLS policies regularly
- Supabase handles authentication and security automatically

## Support

For setup issues, configuration questions, or bug reports:

1. Check [SETUP.md](./SETUP.md) for detailed instructions
2. Review edge function logs in Supabase dashboard
3. Verify all environment variables are correctly configured
4. Check the Supabase database tables for data integrity

---

## For Non-Technical Users: How to Use This Application

### What This Application Does

This is a **TOA (Total Opportunity Assessment) Request Form** that helps you collect and organize information about potential clients and their health benefit needs. Think of it as a smart digital form that:

- Saves all your client information in one organized place
- Keeps track of health plan details and pricing
- Helps you manage deadlines with due dates and rush indicators
- Lets you review all your past submissions anytime

### How to Use the Application

#### Submitting a New Request

1. **Open the Application**: Click the link to access the form in your web browser

2. **Fill Out Client Information**:
   - Enter the prospect's name and industry
   - Add how many employees and members they have
   - Select their consultant and partnership details
   - Set a due date if the request needs to be completed by a specific date

3. **Add Health Plans**:
   - You can add multiple health plans by clicking "Add Row"
   - For each plan, enter the deductibles, out-of-pocket amounts, and how many employees are enrolled
   - The form will automatically check that your employee numbers or percentages add up correctly

4. **Complete Additional Sections**:
   - Fill out information about benefits, coverage, and pricing
   - Add any special notes or requirements at the bottom
   - Required fields are marked with a red asterisk (*)

5. **Submit**:
   - Click the green "Submit Request" button at the bottom
   - You'll see a confirmation message when your request is saved
   - The form will clear so you can start a new request

#### Viewing Your Submitted Requests

1. **Switch Views**: At the top of the page, click "View Submitted Requests"

2. **Filter Your Results**: Use the filter dropdowns to narrow down what you see:
   - **By Date**: Last week (default), last month, 3 months, custom range, or all time
   - **By Prospect**: Select a specific prospect name to see all their submissions
   - **By Industry**: Focus on prospects from a particular industry
   - **Sort Options**: Click "Sort by Name" to group prospects together with newest first

3. **See Your Results**: The counter at the top shows how many requests match your filters (e.g., "Showing 5 of 23 requests")

4. **Export to Excel**: Click "Export to CSV" to download all filtered results with complete details for reporting

5. **Reset Filters**: Click "Clear Filters" to return to the default last week view

6. **Review Requests**: Each request shows:
   - Prospect name and industry
   - Number of employees and members
   - How many health plans were added
   - When it was submitted
   - The due date (if one was set)
   - A **red "RUSH" badge** if the due date is less than 5 business days away
   - The full tracking ID for reference
   - Delete button (with confirmation) to remove incorrect entries

7. **Expand for Details**: Click on any request to see the full health plan breakdown and all the information that was submitted

### When to Use This

- **New prospect meetings**: Fill out the form during or right after client discussions
- **Proposal preparation**: Submit all the information you've gathered so it's organized for your team
- **Deadline tracking**: Set due dates so everyone knows which requests are urgent
- **Team collaboration**: Anyone can view submitted requests to see what's been collected

### Tips for Best Results

- **Fill out as much as you can**: The more complete the information, the better
- **Use the due date field**: This helps everyone see priorities at a glance
- **Check the "Submitted Requests" regularly**: Stay on top of what's been submitted and when things are due
- **Save your work**: Once you click submit, everything is safely stored - no need to worry about losing information

### Common Questions

**"I got a duplicate warning - what should I do?"**
- The system detected that you're submitting the exact same information that already exists
- This helps prevent accidental duplicates
- If this is intentional (like requesting a new analysis), click "Submit Anyway"
- If it's an accident, you can go back and modify the details

**"Can I delete or edit a submission?"**
- You can delete any submission by clicking the trash icon and confirming
- Editing is not currently available - delete and resubmit if you need to make changes

### Getting Help

If something isn't working:
- Make sure all required fields (marked with *) are filled in
- Check that employee percentages add up to 100%
- Try refreshing the page
- Contact your technical team if problems persist

## License

[Your License Here]
