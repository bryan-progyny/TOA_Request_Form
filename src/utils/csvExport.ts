type Prospect = {
  id: string;
  prospect_name: string;
  prospect_industry: string;
  number_of_employees: number | null;
  eligible_employees: number | null;
  eligible_members: number | null;
  union_type: string | null;
  consultant: string | null;
  channel_partnership: string | null;
  healthplan_partnership: string | null;
  needs_cigna_slides: boolean | null;
  scenarios_count: number | null;
  smart_cycles_option_1: string | null;
  smart_cycles_option_2: string | null;
  rx_coverage_type: string | null;
  egg_freezing_coverage: string | null;
  fertility_pepm: number | null;
  fertility_case_rate: number | null;
  implementation_fee: number | null;
  current_fertility_benefit: string | null;
  fertility_administrator: string | null;
  combined_medical_rx_benefit: boolean | null;
  current_fertility_medical_limit: number | null;
  medical_ltm_type: string | null;
  current_fertility_rx_limit: number | null;
  rx_ltm_type: string | null;
  medical_benefit_details: string | null;
  rx_benefit_details: string | null;
  current_elective_egg_freezing: string | null;
  live_births_12mo: number | null;
  current_benefit_pepm: number | null;
  current_benefit_case_fee: number | null;
  include_no_benefit_column: boolean | null;
  dollar_max_column: boolean | null;
  competing_against: string[] | null;
  adoption_surrogacy_estimates: boolean | null;
  adoption_coverage: number | null;
  adoption_frequency: string | null;
  surrogacy_coverage: number | null;
  surrogacy_frequency: string | null;
  female_employees_40_60: number | null;
  live_births_12mo_expanded: number | null;
  subscribers_dependents_under_12: number | null;
  notes: string | null;
  due_date: string | null;
  hash_key: string;
  jira_ticket_id: string | null;
  created_at: string;
  created_by: string | null;
};

type HealthPlan = {
  id: string;
  prospect_id: string;
  health_plan_name: string;
  deductible_individual: number;
  deductible_family: number;
  deductible_type: string;
  oop_individual: number;
  oop_family: number;
  oop_type: string;
  coinsurance_individual: number;
  coinsurance_family: number;
  employee_distribution: number;
  employee_distribution_type: string;
  has_copays: boolean;
  copay_type: string | null;
  hash_key: string;
};

function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function exportProspectsToCSV(
  prospects: Prospect[],
  healthPlans: HealthPlan[]
): void {
  const headers = [
    'ID',
    'Prospect Name',
    'Industry',
    'Number of Employees',
    'Eligible Employees',
    'Eligible Members',
    'Union Type',
    'Consultant',
    'Channel Partnership',
    'Health Plan Partnership',
    'Needs Cigna Slides',
    'Scenarios Count',
    'Smart Cycles Option 1',
    'Smart Cycles Option 2',
    'Rx Coverage Type',
    'Egg Freezing Coverage',
    'Fertility PEPM',
    'Fertility Case Rate',
    'Implementation Fee',
    'Current Fertility Benefit',
    'Fertility Administrator',
    'Combined Medical/Rx Benefit',
    'Current Fertility Medical Limit',
    'Medical Limit Type',
    'Current Fertility Rx Limit',
    'Rx Limit Type',
    'Medical Benefit Details',
    'Rx Benefit Details',
    'Current Elective Egg Freezing',
    'Live Births (12mo)',
    'Current Benefit PEPM',
    'Current Benefit Case Fee',
    'Include No Benefit Column',
    'Dollar Max Column',
    'Competing Against',
    'Adoption/Surrogacy Estimates',
    'Adoption Coverage',
    'Adoption Frequency',
    'Surrogacy Coverage',
    'Surrogacy Frequency',
    'Female Employees (40-60)',
    'Live Births 12mo (Expanded)',
    'Subscribers w/ Dependents <12',
    'Notes',
    'Due Date',
    'Hash Key',
    'Jira Ticket ID',
    'Created At',
    'Created By',
    'Health Plan Count',
    'Health Plans Details'
  ];

  const rows = prospects.map(prospect => {
    const plans = healthPlans.filter(hp => hp.prospect_id === prospect.id);
    const plansDetail = plans.map(plan =>
      `${plan.health_plan_name}: Ded Ind $${plan.deductible_individual} / Fam $${plan.deductible_family} (${plan.deductible_type}), ` +
      `OOP Ind $${plan.oop_individual} / Fam $${plan.oop_family} (${plan.oop_type}), ` +
      `Coins Ind ${plan.coinsurance_individual}% / Fam ${plan.coinsurance_family}%, ` +
      `Dist ${plan.employee_distribution}${plan.employee_distribution_type === 'percentage' ? '%' : ' emp'}, ` +
      `Copays: ${plan.has_copays ? 'Yes' : 'No'}${plan.copay_type ? ` (${plan.copay_type})` : ''}`
    ).join(' | ');

    return [
      prospect.id,
      prospect.prospect_name,
      prospect.prospect_industry,
      prospect.number_of_employees,
      prospect.eligible_employees,
      prospect.eligible_members,
      prospect.union_type,
      prospect.consultant,
      prospect.channel_partnership,
      prospect.healthplan_partnership,
      prospect.needs_cigna_slides,
      prospect.scenarios_count,
      prospect.smart_cycles_option_1,
      prospect.smart_cycles_option_2,
      prospect.rx_coverage_type,
      prospect.egg_freezing_coverage,
      prospect.fertility_pepm,
      prospect.fertility_case_rate,
      prospect.implementation_fee,
      prospect.current_fertility_benefit,
      prospect.fertility_administrator,
      prospect.combined_medical_rx_benefit,
      prospect.current_fertility_medical_limit,
      prospect.medical_ltm_type,
      prospect.current_fertility_rx_limit,
      prospect.rx_ltm_type,
      prospect.medical_benefit_details,
      prospect.rx_benefit_details,
      prospect.current_elective_egg_freezing,
      prospect.live_births_12mo,
      prospect.current_benefit_pepm,
      prospect.current_benefit_case_fee,
      prospect.include_no_benefit_column,
      prospect.dollar_max_column,
      prospect.competing_against ? prospect.competing_against.join('; ') : '',
      prospect.adoption_surrogacy_estimates,
      prospect.adoption_coverage,
      prospect.adoption_frequency,
      prospect.surrogacy_coverage,
      prospect.surrogacy_frequency,
      prospect.female_employees_40_60,
      prospect.live_births_12mo_expanded,
      prospect.subscribers_dependents_under_12,
      prospect.notes,
      prospect.due_date,
      prospect.hash_key,
      prospect.jira_ticket_id,
      prospect.created_at,
      prospect.created_by,
      plans.length,
      plansDetail
    ].map(escapeCSV);
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `toa-requests-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
