import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { prospectId, prospectName, prospectIndustry, numberOfEmployees } = await req.json();

    const jiraUrl = Deno.env.get('JIRA_URL');
    const jiraEmail = Deno.env.get('JIRA_EMAIL');
    const jiraApiToken = Deno.env.get('JIRA_API_TOKEN');
    const jiraProjectKey = Deno.env.get('JIRA_PROJECT_KEY');

    if (!jiraUrl || !jiraEmail || !jiraApiToken || !jiraProjectKey) {
      console.log('Jira credentials not configured - skipping ticket creation');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Jira not configured - prospect saved without ticket creation',
          prospectId 
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const jiraTicketData = {
      fields: {
        project: {
          key: jiraProjectKey,
        },
        summary: `New Prospect: ${prospectName}`,
        description: `New prospect submission:

Prospect Name: ${prospectName}
Industry: ${prospectIndustry}
Number of Employees: ${numberOfEmployees}

Prospect ID: ${prospectId}`,
        issuetype: {
          name: 'Task',
        },
      },
    };

    const authHeader = `Basic ${btoa(`${jiraEmail}:${jiraApiToken}`)}`;

    const jiraResponse = await fetch(`${jiraUrl}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jiraTicketData),
    });

    if (!jiraResponse.ok) {
      const errorText = await jiraResponse.text();
      console.error('Jira API error:', errorText);
      throw new Error(`Jira API error: ${jiraResponse.status}`);
    }

    const jiraResult = await jiraResponse.json();
    const jiraTicketId = jiraResult.key;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    await supabase
      .from('prospects')
      .update({ jira_ticket_id: jiraTicketId })
      .eq('id', prospectId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        jiraTicketId,
        prospectId 
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error creating Jira ticket:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});