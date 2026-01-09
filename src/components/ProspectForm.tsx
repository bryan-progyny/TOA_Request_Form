import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, AlertTriangle } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';
import { formatCurrency, formatPercentage, unformatCurrency, unformatPercentage, formatNumberWithCommas, unformatNumber } from '../utils/formatting';
import { supabase } from '../lib/supabase';

type HealthPlanRow = {
  id: string;
  healthPlanName: string;
  deductibleIndividual: string;
  deductibleFamily: string;
  deductibleType: 'embedded' | 'aggregate';
  oopIndividual: string;
  oopFamily: string;
  oopType: 'embedded' | 'aggregate';
  coinsuranceIndividual: string;
  coinsuranceFamily: string;
  employeeDistribution: string;
  hasCopays: 'yes' | 'no';
  copayType: string;
};

export default function ProspectForm() {
  const [prospectName, setProspectName] = useState('');
  const [prospectIndustry, setProspectIndustry] = useState('');
  const [unionType, setUnionType] = useState('');
  const [eligibleEmployees, setEligibleEmployees] = useState('');
  const [eligibleMembers, setEligibleMembers] = useState('');
  const [consultant, setConsultant] = useState('');
  const [channelPartnership, setChannelPartnership] = useState('');
  const [healthplanPartnership, setHealthplanPartnership] = useState('');
  const [needsCignaSlides, setNeedsCignaSlides] = useState('');
  const [scenariosCount, setScenariosCount] = useState('');
  const [smartCyclesOption1, setSmartCyclesOption1] = useState('');
  const [smartCyclesOption2, setSmartCyclesOption2] = useState('');
  const [rxCoverageType, setRxCoverageType] = useState('');
  const [eggFreezingCoverage, setEggFreezingCoverage] = useState('');
  const [fertilityPepm, setFertilityPepm] = useState('');
  const [fertilityCaseRate, setFertilityCaseRate] = useState('');
  const [implementationFee, setImplementationFee] = useState('');
  const [currentFertilityBenefit, setCurrentFertilityBenefit] = useState('');
  const [fertilityAdministrator, setFertilityAdministrator] = useState('');
  const [combinedMedicalRxBenefit, setCombinedMedicalRxBenefit] = useState('');
  const [currentFertilityMedicalLimit, setCurrentFertilityMedicalLimit] = useState('');
  const [medicalLtmType, setMedicalLtmType] = useState('');
  const [currentFertilityRxLimit, setCurrentFertilityRxLimit] = useState('');
  const [rxLtmType, setRxLtmType] = useState('');
  const [medicalBenefitDetails, setMedicalBenefitDetails] = useState('');
  const [rxBenefitDetails, setRxBenefitDetails] = useState('');
  const [currentElectiveEggFreezing, setCurrentElectiveEggFreezing] = useState('');
  const [liveBirths12mo, setLiveBirths12mo] = useState('');
  const [currentBenefitPepm, setCurrentBenefitPepm] = useState('');
  const [currentBenefitCaseFee, setCurrentBenefitCaseFee] = useState('');
  const [includeNoBenefitColumn, setIncludeNoBenefitColumn] = useState('');
  const [dollarMaxColumn, setDollarMaxColumn] = useState('');
  const [competingAgainst, setCompetingAgainst] = useState<string[]>([]);
  const [adoptionSurrogacyEstimates, setAdoptionSurrogacyEstimates] = useState('');
  const [adoptionCoverage, setAdoptionCoverage] = useState('');
  const [adoptionFrequency, setAdoptionFrequency] = useState('');
  const [surrogacyCoverage, setSurrogacyCoverage] = useState('');
  const [surrogacyFrequency, setSurrogacyFrequency] = useState('');
  const [femaleEmployees4060, setFemaleEmployees4060] = useState('');
  const [liveBirths12moExpanded, setLiveBirths12moExpanded] = useState('');
  const [subscribersDependentsUnder12, setSubscribersDependentsUnder12] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [defaultDueDate, setDefaultDueDate] = useState('');
  const [rushReason, setRushReason] = useState('');
  const [showRushReason, setShowRushReason] = useState(false);
  const [distributionType, setDistributionType] = useState<'number' | 'percentage'>('percentage');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<boolean>(false);
  const [confirmSubmit, setConfirmSubmit] = useState<boolean>(false);
  const [distributionError, setDistributionError] = useState<boolean>(false);

  const [healthPlans, setHealthPlans] = useState<HealthPlanRow[]>([
    {
      id: crypto.randomUUID(),
      healthPlanName: '',
      deductibleIndividual: '',
      deductibleFamily: '',
      deductibleType: 'embedded',
      oopIndividual: '',
      oopFamily: '',
      oopType: 'embedded',
      coinsuranceIndividual: '',
      coinsuranceFamily: '',
      employeeDistribution: '',
      hasCopays: 'no',
      copayType: '',
    },
  ]);

  const calculateWorkingDays = (startDate: Date, daysToAdd: number): string => {
    const result = new Date(startDate);
    let addedDays = 0;

    while (addedDays < daysToAdd) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        addedDays++;
      }
    }

    const year = result.getFullYear();
    const month = String(result.getMonth() + 1).padStart(2, '0');
    const day = String(result.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const calculatedDate = calculateWorkingDays(new Date(), 5);
    setDefaultDueDate(calculatedDate);
    setDueDate(calculatedDate);
  }, []);

  const handleDueDateChange = (newDate: string) => {
    setDueDate(newDate);
    if (newDate !== defaultDueDate) {
      setShowRushReason(true);
    } else {
      setShowRushReason(false);
      setRushReason('');
    }
  };

  const addHealthPlan = () => {
    setHealthPlans([
      ...healthPlans,
      {
        id: crypto.randomUUID(),
        healthPlanName: '',
        deductibleIndividual: '',
        deductibleFamily: '',
        deductibleType: 'embedded',
        oopIndividual: '',
        oopFamily: '',
        oopType: 'embedded',
        coinsuranceIndividual: '',
        coinsuranceFamily: '',
        employeeDistribution: '',
        hasCopays: 'no',
        copayType: '',
      },
    ]);
  };

  const removeHealthPlan = (id: string) => {
    if (healthPlans.length > 1) {
      setHealthPlans(healthPlans.filter((plan) => plan.id !== id));
    }
  };

  const updateHealthPlan = (id: string, field: keyof HealthPlanRow, value: string) => {
    setHealthPlans(
      healthPlans.map((plan) =>
        plan.id === id ? { ...plan, [field]: value } : plan
      )
    );
    if (field === 'employeeDistribution') {
      setDistributionError(false);
    }
  };

  const validateForm = (): string | null => {
    if (!prospectName.trim()) return 'Prospect name is required';
    if (!prospectIndustry.trim()) return 'Prospect industry is required';
    if (!eligibleEmployees || parseInt(eligibleEmployees) <= 0) return 'Valid number of eligible employees is required';
    if (!eligibleMembers || parseInt(eligibleMembers) <= 0) return 'Valid number of eligible members is required';

    if (healthplanPartnership === 'Cigna' && !needsCignaSlides) {
      return 'Please specify if Cigna branded slides are needed';
    }

    const totalDistribution = healthPlans.reduce((sum, plan) => {
      return sum + (parseFloat(plan.employeeDistribution) || 0);
    }, 0);

    if (distributionType === 'percentage') {
      if (Math.abs(totalDistribution - 100) > 0.01) {
        setDistributionError(true);
        return `Employee distribution must add up to 100% (current total: ${totalDistribution.toFixed(2)}%)`;
      }
    } else {
      const expectedTotal = parseInt(eligibleEmployees);
      if (totalDistribution !== expectedTotal) {
        setDistributionError(true);
        return `Employee distribution must add up to ${expectedTotal} employees (current total: ${totalDistribution})`;
      }
    }

    setDistributionError(false);

    for (let i = 0; i < healthPlans.length; i++) {
      const plan = healthPlans[i];
      if (!plan.healthPlanName.trim()) return `Health plan ${i + 1}: Name is required`;
      if (!plan.deductibleIndividual) return `Health plan ${i + 1}: Individual deductible is required`;
      if (!plan.deductibleFamily) return `Health plan ${i + 1}: Family deductible is required`;
      if (!plan.oopIndividual) return `Health plan ${i + 1}: Individual OOP is required`;
      if (!plan.oopFamily) return `Health plan ${i + 1}: Family OOP is required`;
      if (!plan.coinsuranceIndividual) return `Health plan ${i + 1}: Individual coinsurance is required`;
      if (!plan.coinsuranceFamily) return `Health plan ${i + 1}: Family coinsurance is required`;
      if (!plan.employeeDistribution) return `Health plan ${i + 1}: Employee distribution is required`;
      if (plan.hasCopays === 'yes' && !plan.copayType) return `Health plan ${i + 1}: Copay type is required when copays are enabled`;
    }

    return null;
  };

  const checkForDuplicates = async () => {
    try {
      const { data: existingProspects, error } = await supabase
        .from('prospects')
        .select('*, health_plans(*)')
        .eq('prospect_name', prospectName)
        .eq('prospect_industry', prospectIndustry);

      if (error) throw error;

      if (!existingProspects || existingProspects.length === 0) {
        return false;
      }

      for (const existing of existingProspects) {
        const existingHealthPlans = existing.health_plans || [];

        if (existingHealthPlans.length !== healthPlans.length) {
          continue;
        }

        const fieldsMatch =
          existing.union_type === (unionType || null) &&
          existing.eligible_employees === (eligibleEmployees ? parseInt(eligibleEmployees) : null) &&
          existing.eligible_members === (eligibleMembers ? parseInt(eligibleMembers) : null) &&
          existing.consultant === (consultant || null) &&
          existing.channel_partnership === (channelPartnership || null) &&
          existing.healthplan_partnership === (healthplanPartnership || null) &&
          existing.needs_cigna_slides === (needsCignaSlides === 'yes' ? true : needsCignaSlides === 'no' ? false : null) &&
          existing.scenarios_count === (scenariosCount ? parseInt(scenariosCount) : null) &&
          existing.smart_cycles_option_1 === (smartCyclesOption1 || null) &&
          existing.smart_cycles_option_2 === (smartCyclesOption2 || null) &&
          existing.rx_coverage_type === (rxCoverageType || null) &&
          existing.egg_freezing_coverage === (eggFreezingCoverage || null) &&
          existing.fertility_pepm === (fertilityPepm ? parseFloat(unformatCurrency(fertilityPepm)) : null) &&
          existing.fertility_case_rate === (fertilityCaseRate ? parseFloat(unformatCurrency(fertilityCaseRate)) : null) &&
          existing.implementation_fee === (implementationFee ? parseFloat(unformatCurrency(implementationFee)) : null) &&
          existing.current_fertility_benefit === (currentFertilityBenefit || null) &&
          existing.fertility_administrator === (fertilityAdministrator || null) &&
          existing.combined_medical_rx_benefit === (combinedMedicalRxBenefit === 'yes' ? true : combinedMedicalRxBenefit === 'no' ? false : null) &&
          existing.notes === (notes || null) &&
          existing.due_date === (dueDate || null);

        if (!fieldsMatch) {
          continue;
        }

        const healthPlansMatch = healthPlans.every((plan, index) => {
          const existingPlan = existingHealthPlans[index];
          if (!existingPlan) return false;

          return (
            existingPlan.health_plan_name === plan.healthPlanName &&
            existingPlan.deductible_individual === parseFloat(unformatCurrency(plan.deductibleIndividual)) &&
            existingPlan.deductible_family === parseFloat(unformatCurrency(plan.deductibleFamily)) &&
            existingPlan.deductible_type === plan.deductibleType &&
            existingPlan.oop_individual === parseFloat(unformatCurrency(plan.oopIndividual)) &&
            existingPlan.oop_family === parseFloat(unformatCurrency(plan.oopFamily)) &&
            existingPlan.oop_type === plan.oopType &&
            existingPlan.coinsurance_individual === parseFloat(unformatPercentage(plan.coinsuranceIndividual)) &&
            existingPlan.coinsurance_family === parseFloat(unformatPercentage(plan.coinsuranceFamily)) &&
            existingPlan.employee_distribution === parseFloat(distributionType === 'percentage' ? unformatPercentage(plan.employeeDistribution) : unformatNumber(plan.employeeDistribution)) &&
            existingPlan.employee_distribution_type === distributionType &&
            existingPlan.has_copays === (plan.hasCopays === 'yes') &&
            existingPlan.copay_type === (plan.copayType || null)
          );
        });

        if (healthPlansMatch) {
          return true;
        }
      }

      return false;
    } catch (err) {
      console.error('Error checking for duplicates:', err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    if (!confirmSubmit) {
      const isDuplicate = await checkForDuplicates();
      if (isDuplicate) {
        setDuplicateWarning(true);
        setMessage({
          type: 'error',
          text: 'Warning: An identical submission already exists. Click "Submit Anyway" to proceed.'
        });
        return;
      }
    }

    setIsSubmitting(true);
    setMessage(null);
    setDuplicateWarning(false);
    setConfirmSubmit(false);

    try {
      const formData = {
        prospectName,
        prospectIndustry,
        unionType,
        eligibleEmployees,
        eligibleMembers,
        consultant,
        channelPartnership,
        healthplanPartnership,
        needsCignaSlides,
        scenariosCount,
        smartCyclesOption1,
        smartCyclesOption2,
        rxCoverageType,
        eggFreezingCoverage,
        fertilityPepm,
        fertilityCaseRate,
        implementationFee,
        currentFertilityBenefit,
        fertilityAdministrator,
        combinedMedicalRxBenefit,
        currentFertilityMedicalLimit,
        medicalLtmType,
        currentFertilityRxLimit,
        rxLtmType,
        medicalBenefitDetails,
        rxBenefitDetails,
        currentElectiveEggFreezing,
        liveBirths12mo,
        currentBenefitPepm,
        currentBenefitCaseFee,
        includeNoBenefitColumn,
        dollarMaxColumn,
        competingAgainst,
        adoptionSurrogacyEstimates,
        adoptionCoverage,
        adoptionFrequency,
        surrogacyCoverage,
        surrogacyFrequency,
        femaleEmployees4060,
        liveBirths12moExpanded,
        subscribersDependentsUnder12,
        notes,
        dueDate,
        rushReason,
        distributionType,
        healthPlans,
      };

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-toa-request`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit request');
      }

      setMessage({ type: 'success', text: 'Request submitted successfully!' });

      setProspectName('');
      setProspectIndustry('');
      setUnionType('');
      setEligibleEmployees('');
      setEligibleMembers('');
      setConsultant('');
      setChannelPartnership('');
      setHealthplanPartnership('');
      setNeedsCignaSlides('');
      setScenariosCount('');
      setSmartCyclesOption1('');
      setSmartCyclesOption2('');
      setRxCoverageType('');
      setEggFreezingCoverage('');
      setFertilityPepm('');
      setFertilityCaseRate('');
      setImplementationFee('');
      setCurrentFertilityBenefit('');
      setFertilityAdministrator('');
      setCombinedMedicalRxBenefit('');
      setCurrentFertilityMedicalLimit('');
      setMedicalLtmType('');
      setCurrentFertilityRxLimit('');
      setRxLtmType('');
      setMedicalBenefitDetails('');
      setRxBenefitDetails('');
      setCurrentElectiveEggFreezing('');
      setLiveBirths12mo('');
      setCurrentBenefitPepm('');
      setCurrentBenefitCaseFee('');
      setIncludeNoBenefitColumn('');
      setDollarMaxColumn('');
      setCompetingAgainst([]);
      setAdoptionSurrogacyEstimates('');
      setAdoptionCoverage('');
      setAdoptionFrequency('');
      setSurrogacyCoverage('');
      setSurrogacyFrequency('');
      setFemaleEmployees4060('');
      setLiveBirths12moExpanded('');
      setSubscribersDependentsUnder12('');
      setNotes('');
      const newDefaultDate = calculateWorkingDays(new Date(), 5);
      setDefaultDueDate(newDefaultDate);
      setDueDate(newDefaultDate);
      setRushReason('');
      setShowRushReason(false);
      setHealthPlans([
        {
          id: crypto.randomUUID(),
          healthPlanName: '',
          deductibleIndividual: '',
          deductibleFamily: '',
          deductibleType: 'embedded',
          oopIndividual: '',
          oopFamily: '',
          oopType: 'embedded',
          coinsuranceIndividual: '',
          coinsuranceFamily: '',
          employeeDistribution: '',
          hasCopays: 'no',
          copayType: '',
        },
      ]);
    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setMessage({ type: 'error', text: `Error: ${errorMessage}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Save className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">TOA Request Form</h1>
              <p className="text-slate-600 mt-1">Let's gather the information we need to get started</p>
            </div>
          </div>
        </div>

        {message && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-2xl w-full mx-4">
            <div
              className={`p-6 rounded-2xl shadow-2xl border-2 ${
                message.type === 'success'
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-300'
                  : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-red-300'
              }`}
            >
              <p className="text-lg font-semibold text-center">{message.text}</p>
              <button
                onClick={() => setMessage(null)}
                className={`mt-4 w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  message.type === 'success'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {message && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={() => setMessage(null)}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-3 border-b border-slate-100">Client Information</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <AutocompleteInput
                      value={prospectName}
                      onChange={setProspectName}
                      optionType="prospect_name"
                      label="Prospect Name"
                      placeholder="Type or select prospect name..."
                      required
                    />
                  </div>

                  <div>
                    <AutocompleteInput
                      value={prospectIndustry}
                      onChange={setProspectIndustry}
                      optionType="prospect_industry"
                      label="Prospect Industry"
                      placeholder="Type or select industry..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Union Type
                    </label>
                    <select
                      value={unionType}
                      onChange={(e) => setUnionType(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                    >
                      <option value="">Select union type...</option>
                      <option value="AFL-CIO">AFL-CIO</option>
                      <option value="Teamsters">Teamsters</option>
                      <option value="SEIU">SEIU</option>
                      <option value="UAW">UAW</option>
                      <option value="UFCW">UFCW</option>
                      <option value="Other">Other</option>
                      <option value="Non-Union">Non-Union</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      # of Eligible Employees (Medically Enrolled Employees) *
                    </label>
                    <input
                      type="text"
                      value={eligibleEmployees ? formatNumberWithCommas(eligibleEmployees) : ''}
                      onChange={(e) => setEligibleEmployees(unformatNumber(e.target.value))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                      placeholder="Enter number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      # of Eligible Members (Employees + Spouses/Dependents) *
                    </label>
                    <input
                      type="text"
                      value={eligibleMembers ? formatNumberWithCommas(eligibleMembers) : ''}
                      onChange={(e) => setEligibleMembers(unformatNumber(e.target.value))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                      placeholder="Enter number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Consultant
                    </label>
                    <select
                      value={consultant}
                      onChange={(e) => setConsultant(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                    >
                      <option value="">Select...</option>
                      <option value="WTW">WTW</option>
                      <option value="Mercer">Mercer</option>
                      <option value="TPG">TPG</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Channel Partnership
                    </label>
                    <select
                      value={channelPartnership}
                      onChange={(e) => setChannelPartnership(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                    >
                      <option value="">Select...</option>
                      <option value="CVS">CVS</option>
                      <option value="Caslight">Caslight</option>
                      <option value="Evernorth">Evernorth</option>
                      <option value="CHA">CHA</option>
                      <option value="Quantum">Quantum</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Health-plan Partnership
                    </label>
                    <select
                      value={healthplanPartnership}
                      onChange={(e) => setHealthplanPartnership(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                    >
                      <option value="">Select...</option>
                      <option value="IBX">IBX</option>
                      <option value="BCBSNC">BCBSNC</option>
                      <option value="HealthPartners">HealthPartners</option>
                      <option value="Brighton">Brighton</option>
                      <option value="WebTPA">WebTPA</option>
                      <option value="MagniCare">MagniCare</option>
                      <option value="Surest">Surest</option>
                      <option value="Meritain">Meritain</option>
                      <option value="Providence">Providence</option>
                      <option value="BCBS Alabama">BCBS Alabama</option>
                      <option value="Cigna">Cigna</option>
                    </select>
                  </div>

                  {healthplanPartnership === 'Cigna' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">
                        Do you need the Cigna branded slides? *
                      </label>
                      <select
                        value={needsCignaSlides}
                        onChange={(e) => setNeedsCignaSlides(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                      >
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => handleDueDateChange(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                    />
                  </div>

                  {showRushReason && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-800 mb-2">
                        Rush Reason (Due date changed from standard 5-day SLA)
                      </label>
                      <textarea
                        value={rushReason}
                        onChange={(e) => setRushReason(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                        rows={3}
                        placeholder="Please explain the reason for the date change..."
                      />
                    </div>
                  )}
                </div>
              </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100">Health Plans</h2>

              <div className={`mb-6 p-4 rounded-lg transition-colors ${distributionError ? 'bg-yellow-100 border-2 border-yellow-400' : ''}`}>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Employee Distribution Type *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <input
                      type="radio"
                      value="percentage"
                      checked={distributionType === 'percentage'}
                      onChange={(e) => {
                        setDistributionType(e.target.value as 'percentage');
                        setDistributionError(false);
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-slate-700 font-medium">Percentage (%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <input
                      type="radio"
                      value="number"
                      checked={distributionType === 'number'}
                      onChange={(e) => {
                        setDistributionType(e.target.value as 'number');
                        setDistributionError(false);
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-slate-700 font-medium">Number of Employees</span>
                  </label>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                <table className="w-full border-collapse bg-white">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <th className="border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-700 w-[50px]">

                      </th>
                      <th className="border border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wide min-w-[150px]">
                        Health Plan
                      </th>
                      <th className="border border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wide min-w-[120px]">
                        Deductible Individual
                      </th>
                      <th className="border border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wide min-w-[120px]">
                        Deductible Family
                      </th>
                      <th className="border border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wide min-w-[120px]">
                        Deductible Type
                      </th>
                      <th className="border border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wide min-w-[120px]">
                        OOP Individual
                      </th>
                      <th className="border border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wide min-w-[120px]">
                        OOP Family
                      </th>
                      <th className="border border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wide min-w-[120px]">
                        OOP Type
                      </th>
                      <th className="border border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wide min-w-[120px]">
                        Coinsurance Individual
                      </th>
                      <th className="border border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wide min-w-[120px]">
                        Coinsurance Family
                      </th>
                      <th className="border border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wide min-w-[100px]">
                        Employee ({distributionType === 'percentage' ? '%' : '#'})
                      </th>
                      <th className="border border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wide min-w-[100px]">
                        Has Copays?
                      </th>
                      <th className="border border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wide min-w-[150px]">
                        Copay Type
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthPlans.map((plan, index) => (
                      <tr key={plan.id} className="hover:bg-slate-50">
                        <td className="border border-slate-200 p-3 text-center">
                          {healthPlans.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeHealthPlan(plan.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete row"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </td>
                        <td className="border border-slate-300 p-0">
                          <input
                            type="text"
                            value={plan.healthPlanName}
                            onChange={(e) => updateHealthPlan(plan.id, 'healthPlanName', e.target.value)}
                            className="w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                            placeholder="Plan name"
                          />
                        </td>
                        <td className="border border-slate-300 p-0">
                          <input
                            type="text"
                            value={plan.deductibleIndividual ? formatCurrency(plan.deductibleIndividual) : ''}
                            onChange={(e) => updateHealthPlan(plan.id, 'deductibleIndividual', unformatCurrency(e.target.value))}
                            className="w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                            placeholder="$0"
                          />
                        </td>
                        <td className="border border-slate-300 p-0">
                          <input
                            type="text"
                            value={plan.deductibleFamily ? formatCurrency(plan.deductibleFamily) : ''}
                            onChange={(e) => updateHealthPlan(plan.id, 'deductibleFamily', unformatCurrency(e.target.value))}
                            className="w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                            placeholder="$0"
                          />
                        </td>
                        <td className="border border-slate-300 p-0">
                          <select
                            value={plan.deductibleType}
                            onChange={(e) => updateHealthPlan(plan.id, 'deductibleType', e.target.value)}
                            className="w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                          >
                            <option value="embedded">Embedded</option>
                            <option value="aggregate">Aggregate</option>
                          </select>
                        </td>
                        <td className="border border-slate-300 p-0">
                          <input
                            type="text"
                            value={plan.oopIndividual ? formatCurrency(plan.oopIndividual) : ''}
                            onChange={(e) => updateHealthPlan(plan.id, 'oopIndividual', unformatCurrency(e.target.value))}
                            className="w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                            placeholder="$0"
                          />
                        </td>
                        <td className="border border-slate-300 p-0">
                          <input
                            type="text"
                            value={plan.oopFamily ? formatCurrency(plan.oopFamily) : ''}
                            onChange={(e) => updateHealthPlan(plan.id, 'oopFamily', unformatCurrency(e.target.value))}
                            className="w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                            placeholder="$0"
                          />
                        </td>
                        <td className="border border-slate-300 p-0">
                          <select
                            value={plan.oopType}
                            onChange={(e) => updateHealthPlan(plan.id, 'oopType', e.target.value)}
                            className="w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                          >
                            <option value="embedded">Embedded</option>
                            <option value="aggregate">Aggregate</option>
                          </select>
                        </td>
                        <td className="border border-slate-300 p-0">
                          <input
                            type="text"
                            value={plan.coinsuranceIndividual ? formatPercentage(plan.coinsuranceIndividual) : ''}
                            onChange={(e) => updateHealthPlan(plan.id, 'coinsuranceIndividual', unformatPercentage(e.target.value))}
                            className="w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                            placeholder="0%"
                          />
                        </td>
                        <td className="border border-slate-300 p-0">
                          <input
                            type="text"
                            value={plan.coinsuranceFamily ? formatPercentage(plan.coinsuranceFamily) : ''}
                            onChange={(e) => updateHealthPlan(plan.id, 'coinsuranceFamily', unformatPercentage(e.target.value))}
                            className="w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                            placeholder="0%"
                          />
                        </td>
                        <td className="border border-slate-300 p-0">
                          <input
                            type="text"
                            value={
                              plan.employeeDistribution
                                ? distributionType === 'percentage'
                                  ? formatPercentage(plan.employeeDistribution)
                                  : plan.employeeDistribution
                                : ''
                            }
                            onChange={(e) =>
                              updateHealthPlan(
                                plan.id,
                                'employeeDistribution',
                                distributionType === 'percentage'
                                  ? unformatPercentage(e.target.value)
                                  : e.target.value.replace(/[^0-9]/g, '')
                              )
                            }
                            className="w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                            placeholder={distributionType === 'percentage' ? '0%' : '0'}
                          />
                        </td>
                        <td className="border border-slate-300 p-0">
                          <select
                            value={plan.hasCopays}
                            onChange={(e) => updateHealthPlan(plan.id, 'hasCopays', e.target.value)}
                            className="w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                          >
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                          </select>
                        </td>
                        <td className="border border-slate-300 p-0">
                          <select
                            value={plan.copayType}
                            onChange={(e) => updateHealthPlan(plan.id, 'copayType', e.target.value)}
                            className="w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                            disabled={plan.hasCopays === 'no'}
                          >
                            <option value="">Select...</option>
                            <option value="Medical and Rx">Medical and Rx</option>
                            <option value="Medical only">Medical only</option>
                            <option value="Rx Only">Rx Only</option>
                            <option value="Surest plan">Surest plan</option>
                            <option value="Other">Other</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={addHealthPlan}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Plus size={18} />
                Add Row
              </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-3 border-b border-slate-100">New Benefit</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    How many scenarios would you like to show?
                  </label>
                  <select
                    value={scenariosCount}
                    onChange={(e) => setScenariosCount(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    <option value="">Select...</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </div>

                {(scenariosCount === '1' || scenariosCount === '2') && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Number of Smart Cycles Option 1:
                    </label>
                    <select
                      value={smartCyclesOption1}
                      onChange={(e) => setSmartCyclesOption1(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                    >
                      <option value="">Select...</option>
                      <option value="1">1</option>
                      <option value="1+1">1+1</option>
                      <option value="2">2</option>
                      <option value="2+1">2+1</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                  </div>
                )}

                {scenariosCount === '2' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Number of Smart Cycles Option 2:
                    </label>
                    <select
                      value={smartCyclesOption2}
                      onChange={(e) => setSmartCyclesOption2(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                    >
                      <option value="">Select...</option>
                      <option value="1">1</option>
                      <option value="1+1">1+1</option>
                      <option value="2">2</option>
                      <option value="2+1">2+1</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    How will Rx be covered? (Prog Rx / No Prog Rx)
                  </label>
                  <select
                    value={rxCoverageType}
                    onChange={(e) => setRxCoverageType(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    <option value="">Select...</option>
                    <option value="Prog Rx">Prog Rx</option>
                    <option value="No Prog Rx">No Prog Rx</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Will elective egg freezing be covered?
                  </label>
                  <select
                    value={eggFreezingCoverage}
                    onChange={(e) => setEggFreezingCoverage(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    <option value="">Select...</option>
                    <option value="Yes (included in the employer cost)">Yes (included in the employer cost)</option>
                    <option value="Yes (spiked out from the employer cost)">Yes (spiked out from the employer cost)</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Fertility PEPM
                  </label>
                  <input
                    type="number"
                    value={fertilityPepm}
                    onChange={(e) => setFertilityPepm(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="$0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Fertility Case Rate
                  </label>
                  <input
                    type="number"
                    value={fertilityCaseRate}
                    onChange={(e) => setFertilityCaseRate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="$0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Implementation Fee
                  </label>
                  <input
                    type="number"
                    value={implementationFee}
                    onChange={(e) => setImplementationFee(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="$0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-3 border-b border-slate-100">Current Benefit</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Does prospect currently offer fertility benefits?
                  </label>
                  <select
                    value={currentFertilityBenefit}
                    onChange={(e) => setCurrentFertilityBenefit(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    <option value="">Select...</option>
                    <option value="Standard benefits">Standard benefits</option>
                    <option value="non-standard benefit (cycle)">non-standard benefit (cycle)</option>
                    <option value="fully insured">fully insured</option>
                    <option value="No benefit">No benefit</option>
                  </select>
                </div>

                {currentFertilityBenefit && currentFertilityBenefit !== 'No benefit' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Who administers the fertility benefit?
                    </label>
                    <select
                      value={fertilityAdministrator}
                      onChange={(e) => setFertilityAdministrator(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                    >
                      <option value="">Select...</option>
                      <option value="Carrot">Carrot</option>
                      <option value="Kindbody">Kindbody</option>
                      <option value="Ovia">Ovia</option>
                      <option value="WIN">WIN</option>
                      <option value="Maven">Maven</option>
                      <option value="Carrier">Carrier</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}
              </div>

              {(currentFertilityBenefit === 'Standard benefits' || currentFertilityBenefit === 'fully insured') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Does the prospect have combined medical / Rx benefit?
                    </label>
                    <select
                      value={combinedMedicalRxBenefit}
                      onChange={(e) => setCombinedMedicalRxBenefit(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                    >
                      <option value="">Select...</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      What is the current fertility medical dollar limit?
                    </label>
                    <input
                      type="number"
                      value={currentFertilityMedicalLimit}
                      onChange={(e) => setCurrentFertilityMedicalLimit(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                      placeholder="$0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Is medical LTM lifetime or annual?
                    </label>
                    <select
                      value={medicalLtmType}
                      onChange={(e) => setMedicalLtmType(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                    >
                      <option value="">Select...</option>
                      <option value="Lifetime">Lifetime</option>
                      <option value="Annual">Annual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      What is the current fertility Rx dollar limit?
                    </label>
                    <input
                      type="number"
                      value={currentFertilityRxLimit}
                      onChange={(e) => setCurrentFertilityRxLimit(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                      placeholder="$0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Is Rx LTM lifetime or annual?
                    </label>
                    <select
                      value={rxLtmType}
                      onChange={(e) => setRxLtmType(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                    >
                      <option value="">Select...</option>
                      <option value="Lifetime">Lifetime</option>
                      <option value="Annual">Annual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Does the prospect currently offer elective egg freezing?
                    </label>
                    <select
                      value={currentElectiveEggFreezing}
                      onChange={(e) => setCurrentElectiveEggFreezing(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                    >
                      <option value="">Select...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Unsure">Unsure</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Optional - Please provide the number of live births from the latest 12-month reporting period
                    </label>
                    <input
                      type="text"
                      value={liveBirths12mo ? formatNumberWithCommas(liveBirths12mo) : ''}
                      onChange={(e) => setLiveBirths12mo(unformatNumber(e.target.value))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Current benefit PEPM
                    </label>
                    <input
                      type="number"
                      value={currentBenefitPepm}
                      onChange={(e) => setCurrentBenefitPepm(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                      placeholder="$0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Current benefit case fee
                    </label>
                    <input
                      type="number"
                      value={currentBenefitCaseFee}
                      onChange={(e) => setCurrentBenefitCaseFee(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                      placeholder="$0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              {currentFertilityBenefit === 'non-standard benefit (cycle)' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Please provide medical benefit details here
                    </label>
                    <textarea
                      value={medicalBenefitDetails}
                      onChange={(e) => setMedicalBenefitDetails(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                      rows={4}
                      placeholder="Enter medical benefit details..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Please provide Rx benefit details here
                    </label>
                    <textarea
                      value={rxBenefitDetails}
                      onChange={(e) => setRxBenefitDetails(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                      rows={4}
                      placeholder="Enter Rx benefit details..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Does the prospect currently offer elective egg freezing?
                    </label>
                    <select
                      value={currentElectiveEggFreezing}
                      onChange={(e) => setCurrentElectiveEggFreezing(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                    >
                      <option value="">Select...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Unsure">Unsure</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Optional - Please provide the number of live births from the latest 12-month reporting period
                    </label>
                    <input
                      type="text"
                      value={liveBirths12mo ? formatNumberWithCommas(liveBirths12mo) : ''}
                      onChange={(e) => setLiveBirths12mo(unformatNumber(e.target.value))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Current benefit PEPM
                    </label>
                    <input
                      type="number"
                      value={currentBenefitPepm}
                      onChange={(e) => setCurrentBenefitPepm(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                      placeholder="$0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Current benefit case fee
                    </label>
                    <input
                      type="number"
                      value={currentBenefitCaseFee}
                      onChange={(e) => setCurrentBenefitCaseFee(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                      placeholder="$0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              {currentFertilityBenefit === 'No benefit' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Would you like to include a no benefit column in the TOA?
                  </label>
                  <select
                    value={includeNoBenefitColumn}
                    onChange={(e) => setIncludeNoBenefitColumn(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-3 border-b border-slate-100">Additional</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Would you like to see a Dollar Max column for comparison?
                  </label>
                  <select
                    value={dollarMaxColumn}
                    onChange={(e) => setDollarMaxColumn(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {dollarMaxColumn === 'yes' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      If yes - do we know who we are competing against? (Select up to 2)
                    </label>
                    <div className="space-y-2">
                      {['Carrot', 'Maven', 'Kindbody', 'Win', 'Ovia', 'Carrier', 'Unsure'].map((option) => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={competingAgainst.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (competingAgainst.length < 2) {
                                  setCompetingAgainst([...competingAgainst, option]);
                                }
                              } else {
                                setCompetingAgainst(competingAgainst.filter((item) => item !== option));
                              }
                            }}
                            disabled={!competingAgainst.includes(option) && competingAgainst.length >= 2}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 font-medium">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Would you like to see adoption and surrogacy cost estimates?
                  </label>
                  <select
                    value={adoptionSurrogacyEstimates}
                    onChange={(e) => setAdoptionSurrogacyEstimates(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              {adoptionSurrogacyEstimates === 'yes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      What coverage would you like to see for adoption?
                    </label>
                    <select
                      value={adoptionCoverage}
                      onChange={(e) => setAdoptionCoverage(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                    >
                      <option value="">Select...</option>
                      <option value="5000">$5,000</option>
                      <option value="7500">$7,500</option>
                      <option value="10000">$10,000</option>
                      <option value="12500">$12,500</option>
                      <option value="15000">$15,000</option>
                      <option value="17500">$17,500</option>
                      <option value="20000">$20,000</option>
                      <option value="25000">$25,000</option>
                      <option value="30000">$30,000</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Would adoption be per lifetime or per child?
                    </label>
                    <select
                      value={adoptionFrequency}
                      onChange={(e) => setAdoptionFrequency(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                    >
                      <option value="">Select...</option>
                      <option value="Per lifetime">Per lifetime</option>
                      <option value="Per child">Per child</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      What coverage would you like to see for surrogacy?
                    </label>
                    <select
                      value={surrogacyCoverage}
                      onChange={(e) => setSurrogacyCoverage(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                    >
                      <option value="">Select...</option>
                      <option value="5000">$5,000</option>
                      <option value="7500">$7,500</option>
                      <option value="10000">$10,000</option>
                      <option value="12500">$12,500</option>
                      <option value="15000">$15,000</option>
                      <option value="17500">$17,500</option>
                      <option value="20000">$20,000</option>
                      <option value="25000">$25,000</option>
                      <option value="30000">$30,000</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Would surrogacy be per lifetime or per child?
                    </label>
                    <select
                      value={surrogacyFrequency}
                      onChange={(e) => setSurrogacyFrequency(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                    >
                      <option value="">Select...</option>
                      <option value="Per lifetime">Per lifetime</option>
                      <option value="Per child">Per child</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-3 border-b border-slate-100">Expanded Products</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    How many female employees, spouses and domestic partners are between age 40-60?
                  </label>
                  <input
                    type="text"
                    value={femaleEmployees4060 ? formatNumberWithCommas(femaleEmployees4060) : ''}
                    onChange={(e) => setFemaleEmployees4060(unformatNumber(e.target.value))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Provide the number of live births in the most recent 12 months?
                  </label>
                  <input
                    type="text"
                    value={liveBirths12moExpanded ? formatNumberWithCommas(liveBirths12moExpanded) : ''}
                    onChange={(e) => setLiveBirths12moExpanded(unformatNumber(e.target.value))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Please provide the number of subscribers with dependents 12 and under
                  </label>
                  <input
                    type="text"
                    value={subscribersDependentsUnder12 ? formatNumberWithCommas(subscribersDependentsUnder12) : ''}
                    onChange={(e) => setSubscribersDependentsUnder12(unformatNumber(e.target.value))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-3 border-b border-slate-100">Notes</h2>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm hover:shadow"
                rows={6}
                placeholder="Add any additional notes here..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            {duplicateWarning && (
              <button
                type="button"
                onClick={() => {
                  setConfirmSubmit(true);
                  setDuplicateWarning(false);
                  document.querySelector('form')?.requestSubmit();
                }}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <AlertTriangle size={22} />
                Submit Anyway
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Save size={22} />
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
