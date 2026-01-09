import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database, RefreshCw, Download, X, Edit2, Trash2, ArrowUpDown } from 'lucide-react';
import { exportProspectsToCSV } from '../utils/csvExport';

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

export default function AdminView() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [healthPlans, setHealthPlans] = useState<HealthPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProspect, setSelectedProspect] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('last_week');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [prospectNameFilter, setProspectNameFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'default' | 'name-date'>('default');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: prospectsData, error: prospectsError } = await supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false });

      if (prospectsError) throw prospectsError;

      const { data: plansData, error: plansError } = await supabase
        .from('health_plans')
        .select('*');

      if (plansError) throw plansError;

      setProspects(prospectsData || []);
      setHealthPlans(plansData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getHealthPlansForProspect = (prospectId: string) => {
    return healthPlans.filter(plan => plan.prospect_id === prospectId);
  };

  const calculateWeightedAverageOOP = (prospectId: string) => {
    const plans = getHealthPlansForProspect(prospectId);
    if (plans.length === 0) return null;

    let totalWeight = 0;
    let weightedOOPFamily = 0;

    plans.forEach(plan => {
      if (!plan.oop_family) {
        console.warn('Missing oop_family for plan:', plan);
        return;
      }

      const weight = plan.employee_distribution_type === 'percentage'
        ? plan.employee_distribution / 100
        : plan.employee_distribution;

      totalWeight += weight;
      weightedOOPFamily += Number(plan.oop_family) * weight;
    });

    if (totalWeight === 0) return null;

    if (plans[0].employee_distribution_type === 'percentage') {
      return weightedOOPFamily;
    } else {
      return weightedOOPFamily / totalWeight;
    }
  };

  const getBusinessDaysDifference = (startDate: Date, endDate: Date): number => {
    let count = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
  };

  const isRushRequest = (createdAt: string, dueDate: string | null): boolean => {
    if (!dueDate) return false;

    const created = new Date(createdAt);
    const due = new Date(dueDate);
    const businessDays = getBusinessDaysDifference(created, due);

    return businessDays < 5;
  };

  const getFilteredProspects = () => {
    const now = new Date();
    let startDate: Date;
    let filteredByDate = prospects;

    switch (dateFilter) {
      case 'last_week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        filteredByDate = prospects.filter(p => new Date(p.created_at) >= startDate);
        break;
      case 'last_month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        filteredByDate = prospects.filter(p => new Date(p.created_at) >= startDate);
        break;
      case 'last_3_months':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        filteredByDate = prospects.filter(p => new Date(p.created_at) >= startDate);
        break;
      case 'custom':
        if (!customStartDate) {
          filteredByDate = prospects;
        } else {
          startDate = new Date(customStartDate);
          const endDate = customEndDate ? new Date(customEndDate) : now;
          filteredByDate = prospects.filter(p => {
            const createdDate = new Date(p.created_at);
            return createdDate >= startDate && createdDate <= endDate;
          });
        }
        break;
      case 'all':
        filteredByDate = prospects;
        break;
      default:
        filteredByDate = prospects;
    }

    let filtered = filteredByDate;

    if (prospectNameFilter !== 'all') {
      filtered = filtered.filter(p => p.prospect_name === prospectNameFilter);
    }

    if (industryFilter !== 'all') {
      filtered = filtered.filter(p => p.prospect_industry === industryFilter);
    }

    if (sortOrder === 'name-date') {
      filtered = [...filtered].sort((a, b) => {
        const nameCompare = a.prospect_name.localeCompare(b.prospect_name);
        if (nameCompare !== 0) return nameCompare;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return filtered;
  };

  const getUniqueProspectNames = () => {
    const names = prospects.map(p => p.prospect_name);
    return Array.from(new Set(names)).sort();
  };

  const getUniqueIndustries = () => {
    const industries = prospects.map(p => p.prospect_industry);
    return Array.from(new Set(industries)).sort();
  };

  const clearFilters = () => {
    setDateFilter('last_week');
    setProspectNameFilter('all');
    setIndustryFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSortOrder('default');
  };

  const handleDelete = async (prospectId: string) => {
    try {
      const { error } = await supabase
        .from('prospects')
        .delete()
        .eq('id', prospectId);

      if (error) throw error;

      await loadData();
      setDeleteConfirm(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete prospect');
    }
  };

  const handleExportCSV = () => {
    const filtered = getFilteredProspects();
    const filteredHealthPlans = healthPlans.filter(hp =>
      filtered.some(p => p.id === hp.prospect_id)
    );
    exportProspectsToCSV(filtered, filteredHealthPlans);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-300 rounded-xl p-6 max-w-md">
          <p className="text-red-800 font-semibold mb-2">Error loading data</p>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Database className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Submitted Requests
              </h1>
              <p className="text-slate-600 mt-1">View all TOA requests stored in Supabase</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Filter by Date
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm"
                >
                  <option value="last_week">Last Week</option>
                  <option value="last_month">Last Month</option>
                  <option value="last_3_months">Last 3 Months</option>
                  <option value="custom">Custom Range</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Filter by Prospect
                </label>
                <select
                  value={prospectNameFilter}
                  onChange={(e) => setProspectNameFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm"
                >
                  <option value="all">All Prospects</option>
                  {getUniqueProspectNames().map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Filter by Industry
                </label>
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm"
                >
                  <option value="all">All Industries</option>
                  {getUniqueIndustries().map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              {dateFilter === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-400 bg-white shadow-sm"
                    />
                  </div>
                </>
              )}

              <button
                onClick={loadData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Data
              </button>

              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export to CSV
              </button>

              <button
                onClick={() => setSortOrder(sortOrder === 'default' ? 'name-date' : 'default')}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
              >
                <ArrowUpDown className="w-4 h-4" />
                {sortOrder === 'default' ? 'Sort by Name' : 'Default Sort'}
              </button>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span className="font-semibold">
                Showing {getFilteredProspects().length} of {prospects.length} requests
              </span>
            </div>
          </div>
        </div>

        {getFilteredProspects().length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-12 text-center">
            <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No requests submitted yet</p>
            <p className="text-slate-400 mt-2">Submit your first TOA request to see it here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {getFilteredProspects().map((prospect) => {
              const plans = getHealthPlansForProspect(prospect.id);
              const isExpanded = selectedProspect === prospect.id;

              return (
                <div
                  key={prospect.id}
                  className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-slate-200 overflow-hidden"
                >
                  <div
                    className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setSelectedProspect(isExpanded ? null : prospect.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                          {prospect.prospect_name}
                        </h3>
                        <div className="space-y-1 text-sm text-slate-600">
                          <p><strong>Industry:</strong> {prospect.prospect_industry}</p>
                          <p><strong>Eligible Employees:</strong> {prospect.eligible_employees ? prospect.eligible_employees.toLocaleString() : 'N/A'}</p>
                          <p><strong>Eligible Members:</strong> {prospect.eligible_members ? prospect.eligible_members.toLocaleString() : 'N/A'}</p>
                          <p><strong>Health Plans:</strong> {plans.length}</p>
                          {plans.length > 0 && (() => {
                            const weightedAvg = calculateWeightedAverageOOP(prospect.id);
                            return weightedAvg !== null && (
                              <p><strong>Blended OOP Family:</strong> ${Math.round(weightedAvg).toLocaleString()}</p>
                            );
                          })()}
                          {prospect.due_date && (
                            <p>
                              <strong>Due Date:</strong> {new Date(prospect.due_date).toLocaleDateString()}
                              {isRushRequest(prospect.created_at, prospect.due_date) && (
                                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-bold">RUSH</span>
                              )}
                            </p>
                          )}
                          <p><strong>Submitted:</strong> {new Date(prospect.created_at).toLocaleString()}</p>
                          <p className="text-xs text-slate-500 mt-1"><strong>ID:</strong> {prospect.id}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col gap-2">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                          Submitted
                        </span>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {deleteConfirm === prospect.id ? (
                            <div className="flex flex-col gap-1">
                              <p className="text-xs text-red-600 font-semibold">Confirm delete?</p>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleDelete(prospect.id)}
                                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="px-2 py-1 bg-slate-600 text-white rounded text-xs hover:bg-slate-700"
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(prospect.id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Delete request"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && plans.length > 0 && (
                    <div className="border-t border-slate-200 p-4 bg-slate-50">
                      {(prospect.scenarios_count || prospect.smart_cycles_option_1 || prospect.smart_cycles_option_2) && (
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                          {prospect.scenarios_count && (
                            <div className="bg-white rounded-lg p-3 border border-slate-200">
                              <p className="text-xs text-slate-600 font-semibold mb-1">Scenarios Requested</p>
                              <p className="text-lg font-bold text-slate-900">{prospect.scenarios_count}</p>
                            </div>
                          )}
                          {prospect.smart_cycles_option_1 && (
                            <div className="bg-white rounded-lg p-3 border border-slate-200">
                              <p className="text-xs text-slate-600 font-semibold mb-1">Scenario 1: Smart Cycles</p>
                              <p className="text-lg font-bold text-slate-900">{prospect.smart_cycles_option_1}</p>
                            </div>
                          )}
                          {prospect.smart_cycles_option_2 && (
                            <div className="bg-white rounded-lg p-3 border border-slate-200">
                              <p className="text-xs text-slate-600 font-semibold mb-1">Scenario 2: Smart Cycles</p>
                              <p className="text-lg font-bold text-slate-900">{prospect.smart_cycles_option_2}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <h4 className="font-semibold text-slate-900 mb-3 text-sm">Plan Details</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden text-sm">
                          <thead>
                            <tr className="bg-slate-100">
                              <th className="border border-slate-200 px-3 py-2 text-left text-xs font-bold text-slate-800">
                                Plan Name
                              </th>
                              <th className="border border-slate-200 px-3 py-2 text-left text-xs font-bold text-slate-800">
                                Deductible (Ind)
                              </th>
                              <th className="border border-slate-200 px-3 py-2 text-left text-xs font-bold text-slate-800">
                                OOP Family
                              </th>
                              <th className="border border-slate-200 px-3 py-2 text-left text-xs font-bold text-slate-800">
                                Distribution
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {plans.map((plan) => (
                              <tr key={plan.id} className="hover:bg-slate-50">
                                <td className="border border-slate-200 px-3 py-2 text-slate-700">
                                  {plan.health_plan_name}
                                </td>
                                <td className="border border-slate-200 px-3 py-2 text-slate-700">
                                  ${plan.deductible_individual.toLocaleString()}
                                </td>
                                <td className="border border-slate-200 px-3 py-2 text-slate-700">
                                  ${plan.oop_family.toLocaleString()}
                                </td>
                                <td className="border border-slate-200 px-3 py-2 text-slate-700">
                                  {plan.employee_distribution}{plan.employee_distribution_type === 'percentage' ? '%' : ' emp'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
