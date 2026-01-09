import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface HealthPlan {
  healthPlanName: string;
  deductibleIndividual: string;
  deductibleFamily: string;
  deductibleType: string;
  oopIndividual: string;
  oopFamily: string;
  oopType: string;
  coinsuranceIndividual: string;
  coinsuranceFamily: string;
  employeeDistribution: string;
  hasCopays: string;
  copayType: string;
}

interface RequestBody {
  prospectName: string;
  prospectIndustry: string;
  healthPlans: HealthPlan[];
  distributionType: 'number' | 'percentage';
  [key: string]: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: RequestBody = await req.json();
    const { prospectName, prospectIndustry, healthPlans, distributionType, ...formData } = body;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const hashKey = crypto.randomUUID();

    const prospectData = {
      prospect_name: prospectName,
      prospect_industry: prospectIndustry,
      union_type: formData.unionType || null,
      number_of_employees: formData.eligibleEmployees ? parseInt(formData.eligibleEmployees) : null,
      eligible_employees: formData.eligibleEmployees ? parseInt(formData.eligibleEmployees) : null,
      eligible_members: formData.eligibleMembers ? parseInt(formData.eligibleMembers) : null,
      consultant: formData.consultant || null,
      channel_partnership: formData.channelPartnership || null,
      healthplan_partnership: formData.healthplanPartnership || null,
      needs_cigna_slides: formData.needsCignaSlides === 'yes' ? true : formData.needsCignaSlides === 'no' ? false : null,
      scenarios_count: formData.scenariosCount ? parseInt(formData.scenariosCount) : null,
      smart_cycles_option_1: formData.smartCyclesOption1 || null,
      smart_cycles_option_2: formData.smartCyclesOption2 || null,
      rx_coverage_type: formData.rxCoverageType || null,
      egg_freezing_coverage: formData.eggFreezingCoverage || null,
      fertility_pepm: formData.fertilityPepm ? parseFloat(formData.fertilityPepm) : null,
      fertility_case_rate: formData.fertilityCaseRate ? parseFloat(formData.fertilityCaseRate) : null,
      implementation_fee: formData.implementationFee ? parseFloat(formData.implementationFee) : null,
      current_fertility_benefit: formData.currentFertilityBenefit || null,
      fertility_administrator: formData.fertilityAdministrator || null,
      combined_medical_rx_benefit: formData.combinedMedicalRxBenefit === 'yes' ? true : formData.combinedMedicalRxBenefit === 'no' ? false : null,
      current_fertility_medical_limit: formData.currentFertilityMedicalLimit ? parseFloat(formData.currentFertilityMedicalLimit) : null,
      medical_ltm_type: formData.medicalLtmType || null,
      current_fertility_rx_limit: formData.currentFertilityRxLimit ? parseFloat(formData.currentFertilityRxLimit) : null,
      rx_ltm_type: formData.rxLtmType || null,
      medical_benefit_details: formData.medicalBenefitDetails || null,
      rx_benefit_details: formData.rxBenefitDetails || null,
      current_elective_egg_freezing: formData.currentElectiveEggFreezing || null,
      live_births_12mo: formData.liveBirths12mo ? parseInt(formData.liveBirths12mo) : null,
      current_benefit_pepm: formData.currentBenefitPepm ? parseFloat(formData.currentBenefitPepm) : null,
      current_benefit_case_fee: formData.currentBenefitCaseFee ? parseFloat(formData.currentBenefitCaseFee) : null,
      include_no_benefit_column: formData.includeNoBenefitColumn === 'yes' ? true : formData.includeNoBenefitColumn === 'no' ? false : null,
      dollar_max_column: formData.dollarMaxColumn === 'yes' ? true : formData.dollarMaxColumn === 'no' ? false : null,
      competing_against: formData.competingAgainst?.length > 0 ? formData.competingAgainst : null,
      adoption_surrogacy_estimates: formData.adoptionSurrogacyEstimates === 'yes' ? true : formData.adoptionSurrogacyEstimates === 'no' ? false : null,
      adoption_coverage: formData.adoptionCoverage ? parseFloat(formData.adoptionCoverage) : null,
      adoption_frequency: formData.adoptionFrequency || null,
      surrogacy_coverage: formData.surrogacyCoverage ? parseFloat(formData.surrogacyCoverage) : null,
      surrogacy_frequency: formData.surrogacyFrequency || null,
      female_employees_40_60: formData.femaleEmployees4060 ? parseInt(formData.femaleEmployees4060) : null,
      live_births_12mo_expanded: formData.liveBirths12moExpanded ? parseInt(formData.liveBirths12moExpanded) : null,
      subscribers_dependents_under_12: formData.subscribersDependentsUnder12 ? parseInt(formData.subscribersDependentsUnder12) : null,
      notes: formData.notes || null,
      due_date: formData.dueDate || null,
      rush_reason: formData.rushReason || null,
      hash_key: hashKey,
    };

    const { data: prospect, error: prospectError } = await supabase
      .from('prospects')
      .insert(prospectData)
      .select()
      .single();

    if (prospectError) {
      console.error("Prospect insert error:", prospectError);
      throw new Error(`Failed to insert prospect: ${prospectError.message}`);
    }

    const healthPlanRecords = healthPlans.map((plan) => ({
      prospect_id: prospect.id,
      health_plan_name: plan.healthPlanName,
      deductible_individual: parseFloat(plan.deductibleIndividual),
      deductible_family: parseFloat(plan.deductibleFamily),
      deductible_type: plan.deductibleType,
      oop_individual: parseFloat(plan.oopIndividual),
      oop_family: parseFloat(plan.oopFamily),
      oop_type: plan.oopType,
      coinsurance_individual: parseFloat(plan.coinsuranceIndividual),
      coinsurance_family: parseFloat(plan.coinsuranceFamily),
      employee_distribution: parseFloat(plan.employeeDistribution),
      employee_distribution_type: distributionType,
      has_copays: plan.hasCopays === 'yes',
      copay_type: plan.copayType || null,
      hash_key: hashKey,
    }));

    const { error: healthPlansError } = await supabase
      .from('health_plans')
      .insert(healthPlanRecords);

    if (healthPlansError) {
      console.error("Health plans insert error:", healthPlansError);
      throw new Error(`Failed to insert health plans: ${healthPlansError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Request submitted successfully. Data stored in Supabase.",
        prospectId: prospect.id,
        hashKey: hashKey,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "An error occurred"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});