import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';
import { 
  BrainCircuit, AlertTriangle, ShieldCheck, MapPin, RotateCw, 
  TrendingUp, TrendingDown, Minus, Activity, Sparkles, Clock
} from 'lucide-react';
import { api } from '../services/api';

export const AIModules: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hotspots' | 'forecast' | 'anomalies'>('hotspots');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [hotspotsData, setHotspotsData] = useState<any>({ hotspots: [], deployments: [] });
  const [trendData, setTrendData] = useState<any>(null);
  const [anomaliesData, setAnomaliesData] = useState<any>({ anomalies: [] });
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchAllPredictions = async (forceRefresh: boolean = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [hsRes, trRes, anRes] = await Promise.allSettled([
        api.getHotspots({ refresh: forceRefresh }),
        api.getForecast(forceRefresh),
        api.getAnomalies(forceRefresh)
      ]);

      if (hsRes.status === 'fulfilled' && hsRes.value) {
        setHotspotsData(hsRes.value);
        if (hsRes.value.last_updated) {
          setLastUpdated(hsRes.value.last_updated);
        }
      }

      if (trRes.status === 'fulfilled' && trRes.value) {
        setTrendData(trRes.value);
        if (trRes.value.last_updated) {
          setLastUpdated(trRes.value.last_updated);
        }
      }

      if (anRes.status === 'fulfilled' && anRes.value) {
        setAnomaliesData(anRes.value);
        if (anRes.value.last_updated) {
          setLastUpdated(anRes.value.last_updated);
        }
      }

      if (hsRes.status === 'rejected' && trRes.status === 'rejected' && anRes.status === 'rejected') {
        setError('Prediction temporarily unavailable. Please try again.');
      }
    } catch (err: any) {
      setError('Prediction temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllPredictions(false);
  }, []);

  const handleRefresh = () => {
    fetchAllPredictions(true);
  };

  const hotspots = hotspotsData?.hotspots || (Array.isArray(hotspotsData) ? hotspotsData : []);
  const deployments = hotspotsData?.deployments || [];
  const anomalies = anomaliesData?.anomalies || (Array.isArray(anomaliesData) ? anomaliesData : []);

  // Combined chart data for Forecast Tab (historical + predicted points)
  const combinedChartData = React.useMemo(() => {
    if (!trendData || trendData.status === 'insufficient_data') return [];
    const hist = (trendData.historical_chart || []).map((h: any) => ({
      month: h.month,
      actual: h.actual,
      predicted: undefined,
      upper_bound: undefined,
      lower_bound: undefined
    }));

    const fc = (trendData.forecast_chart || []).map((f: any) => ({
      month: f.month,
      actual: undefined,
      predicted: f.predicted,
      upper_bound: f.upper_bound,
      lower_bound: f.lower_bound
    }));

    // Bridge the last historical actual into the forecast line
    if (hist.length > 0 && fc.length > 0) {
      const lastHist = hist[hist.length - 1];
      fc[0] = {
        ...fc[0],
        actual: lastHist.actual
      };
    }

    return [...hist.slice(-12), ...fc];
  }, [trendData]);

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return <TrendingUp className="w-3.5 h-3.5 text-rose-600" />;
    if (trend === 'decreasing') return <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />;
    return <Minus className="w-3.5 h-3.5 text-slate-500" />;
  };

  const getSeverityBadge = (sev: string) => {
    const s = (sev || 'LOW').toUpperCase();
    if (s === 'CRITICAL') {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-rose-300 bg-rose-50 text-rose-700">CRITICAL</span>;
    }
    if (s === 'HIGH') {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-orange-300 bg-orange-50 text-orange-700">HIGH</span>;
    }
    if (s === 'MEDIUM') {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300 bg-amber-50 text-amber-700">MEDIUM</span>;
    }
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-blue-300 bg-blue-50 text-blue-700">LOW</span>;
  };

  const getPriorityBadge = (prio: string) => {
    const p = (prio || 'MEDIUM').toUpperCase();
    if (p === 'CRITICAL') {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-rose-300 bg-rose-50 text-rose-700 uppercase">CRITICAL</span>;
    }
    if (p === 'HIGH') {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-orange-300 bg-orange-50 text-orange-700 uppercase">HIGH</span>;
    }
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300 bg-amber-50 text-amber-700 uppercase">MEDIUM</span>;
  };

  return (
    <div className="space-y-8">
      {/* Title & Refresh Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-slate-900 tracking-wide flex items-center space-x-3">
            <BrainCircuit className="w-8 h-8 text-orange-500" />
            <span>AI Intelligence Modules</span>
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
            Predictive Models & Crime Pattern Discovery
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Updated:</span>
              <span className="text-slate-800 font-mono font-medium">{lastUpdated}</span>
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center space-x-2 px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold rounded-lg border border-orange-300 transition-all cursor-pointer disabled:opacity-50"
            title="Fetch fresh calculations and AI intelligence"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Predictions'}</span>
          </button>
        </div>
      </div>

      {/* Error Banner if any */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-700">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={() => fetchAllPredictions(false)}
            className="text-rose-800 underline hover:no-underline font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('hotspots')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'hotspots' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Crime Hotspot Prediction</span>
          {hotspots.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
              {hotspots.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'forecast' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Crime Trend Forecast</span>
          {trendData && trendData.status !== 'insufficient_data' && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${trendData.overall_trend === 'increasing' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              {trendData.overall_trend}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('anomalies')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'anomalies' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Anomaly Detection</span>
          {anomalies.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold">
              {anomalies.length}
            </span>
          )}
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && !refreshing && (
        <div className="glass-card p-12 text-center space-y-4">
          <Activity className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-900">Synthesizing Crime Statistics & Consulting Groq AI...</p>
          <p className="text-xs text-slate-500">Aggregating police station incident data, trend regressions, and localized surges.</p>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 1: HOTSPOTS */}
      {/* ============================================================ */}
      {!loading && activeTab === 'hotspots' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* List of Hotspots */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
                High Risk Spot Aggregates
              </h3>
              <span className="text-[11px] text-slate-500">
                Ranked by volume, heinous ratio & recency
              </span>
            </div>

            <div className="space-y-4 max-h-[620px] overflow-y-auto pr-2">
              {hotspots.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 border border-slate-200 rounded-lg">
                  No crime records found for hotspot prediction.
                </div>
              ) : (
                hotspots.map((hs: any, idx: number) => {
                  const hasCoords = hs.latitude != null && hs.longitude != null;
                  const coordsFormatted = hasCoords 
                    ? `${Number(hs.latitude).toFixed(4)}° N, ${Number(hs.longitude).toFixed(4)}° E`
                    : 'Coordinates not recorded';

                  return (
                    <div 
                      key={hs.rank || idx} 
                      className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 transition-all hover:border-orange-400 hover:shadow-xs"
                    >
                      {/* Header Row */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-900 tracking-wide">
                                Location Index #{hs.rank || idx + 1}
                              </span>
                              {hs.risk_level && (
                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">
                                  {hs.risk_level}
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                              {hs.location}
                            </h4>
                            {hs.district && (
                              <span className="text-[11px] text-slate-500">
                                District: {hs.district}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded border border-rose-200 font-mono">
                          Risk: {hs.risk_score}/100
                        </span>
                      </div>

                      {/* Stat Metrics Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 pb-2 border-y border-slate-100 text-[11px]">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Incidents</span>
                          <span className="font-bold text-slate-800">{hs.incident_count} total</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Recent</span>
                          <span className="font-bold text-slate-800">{hs.recent_incidents} recent</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Trend</span>
                          <div className="flex items-center space-x-1 font-semibold capitalize text-slate-700">
                            {getTrendIcon(hs.trend)}
                            <span>{hs.trend}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Top Crime</span>
                          <span className="font-semibold text-orange-600 truncate block" title={hs.top_crime}>
                            {hs.top_crime}
                          </span>
                        </div>
                      </div>

                      {/* Coordinates */}
                      <div className="text-[10px] text-slate-500 font-mono">
                        Coordinates: <span className="text-slate-700 font-medium">{coordsFormatted}</span>
                      </div>

                      {/* AI Intelligence Interpretation */}
                      {hs.analysis && (
                        <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200/80 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] text-orange-700 font-semibold">
                            <span className="flex items-center space-x-1">
                              <Sparkles className="w-3 h-3 text-orange-600" />
                              <span>AI Intelligence Analysis</span>
                            </span>
                            {hs.confidence && (
                              <span className="text-slate-600 font-mono">
                                Confidence: {typeof hs.confidence === 'number' ? `${Math.round(hs.confidence * 100)}%` : hs.confidence}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed font-normal">
                            {hs.analysis}
                          </p>
                          {hs.recommended_action && (
                            <p className="text-[11px] text-slate-600 pt-1.5 border-t border-amber-200/60">
                              <span className="text-orange-700 font-semibold">Recommended: </span>
                              {hs.recommended_action}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Recommendations / Deployments */}
          <div className="glass-card p-6 space-y-4 border-orange-200 flex flex-col">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-orange-500" />
                <span>Suggested Police Deployments</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">AI-Generated Strategy</span>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[620px] pr-2 flex-1">
              {deployments.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 border border-slate-200 rounded-lg">
                  No automated deployment actions recommended at this time.
                </div>
              ) : (
                deployments.map((d: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="p-4 bg-white rounded-xl border border-slate-200 space-y-2.5 transition-all hover:border-orange-400 hover:shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(d.priority)}
                        <h4 className="text-xs font-bold text-slate-900">
                          {d.location}
                        </h4>
                      </div>
                      {d.risk_score != null && (
                        <span className="text-[10px] text-rose-700 font-mono font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Risk: {d.risk_score}/100
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-700 space-y-1.5">
                      {d.reason && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Reason</span>
                          <p className="text-slate-600 leading-relaxed">{d.reason}</p>
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] uppercase font-bold text-orange-600 block">Recommended Action</span>
                        <p className="text-slate-900 font-semibold leading-relaxed">{d.recommended_action}</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[10px]">
                        {d.recommended_time_period && (
                          <div className="text-slate-500">
                            <span>Suggested Time: </span>
                            <span className="text-slate-800 font-mono font-medium">{d.recommended_time_period}</span>
                          </div>
                        )}
                        {d.confidence && (
                          <div className="text-slate-500 font-mono">
                            <span>Confidence: </span>
                            <span className="text-emerald-700 font-semibold">{d.confidence}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-500 italic">
              Note: Deployment suggestions are based on historical crime patterns and available database records. Use as decision support for human review by authorized officers.
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: TREND FORECAST */}
      {/* ============================================================ */}
      {!loading && activeTab === 'forecast' && (
        <div className="space-y-8">
          {trendData && trendData.status === 'insufficient_data' ? (
            <div className="glass-card p-8 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-900">Insufficient Historical Data</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                {trendData.message || 'Not enough historical records to generate a reliable statistical forecast.'}
              </p>
            </div>
          ) : (
            <>
              {/* Summary KPIs Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-5 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                    Overall Trajectory
                  </span>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(trendData?.overall_trend || 'stable')}
                    <span className="text-xl font-bold text-slate-900 capitalize">
                      {trendData?.overall_trend || 'Analyzing...'}
                    </span>
                    {trendData?.trend_percentage != null && (
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${trendData.trend_percentage >= 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        {trendData.trend_percentage > 0 ? '+' : ''}{trendData.trend_percentage}%
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">Relative shift in recent 6 months vs prior baseline.</p>
                </div>

                <div className="glass-card p-5 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                    Forecast Horizon
                  </span>
                  <span className="text-xl font-bold text-slate-900">
                    {trendData?.forecast_period || 'Next 7 Days / 6-Month Horizon'}
                  </span>
                  <p className="text-[10px] text-slate-500">Linear regression with 95% confidence intervals.</p>
                </div>

                <div className="glass-card p-5 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                    Historical Span Analyzed
                  </span>
                  <span className="text-xl font-bold text-slate-900">
                    {trendData?.historical_chart?.length || 0} Months
                  </span>
                  <p className="text-[10px] text-slate-500">Continuous monthly case registration records.</p>
                </div>
              </div>

              {/* Recharts forecasting line diagram */}
              <div className="glass-card p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
                    Historical Actuals & 6-Month Statistical Forecast
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Model: Least-Squares Linear Regression
                  </span>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={combinedChartData}>
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          borderColor: '#e2e8f0', 
                          color: '#0f172a', 
                          borderRadius: '8px',
                          fontSize: '11px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        name="Actual Reported Cases" 
                        stroke="#2563eb" 
                        strokeWidth={2} 
                        dot={{ fill: '#2563eb', r: 3 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="predicted" 
                        name="Predicted Cases" 
                        stroke="#f97316" 
                        strokeWidth={2} 
                        strokeDasharray="4 4"
                        dot={{ fill: '#f97316', r: 3 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="upper_bound" 
                        name="Confidence Limit (Max)" 
                        stroke="#94a3b8" 
                        strokeDasharray="3 3" 
                        dot={false} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="lower_bound" 
                        name="Confidence Limit (Min)" 
                        stroke="#cbd5e1" 
                        strokeDasharray="3 3" 
                        dot={false} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Breakdown & AI Explanations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Trends Table */}
                <div className="glass-card p-6 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
                    Category Trend Breakdown
                  </h3>
                  <div className="space-y-3">
                    {trendData?.categories?.map((cat: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300"
                      >
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-900 block">{cat.category}</span>
                          <span className="text-[10px] text-slate-500">
                            Recent: {cat.recent_count} · Prior: {cat.prior_count}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 font-semibold capitalize text-slate-700">
                            {getTrendIcon(cat.trend)}
                            <span>{cat.trend}</span>
                          </div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${cat.change_percentage >= 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                            {cat.change_percentage > 0 ? '+' : ''}{cat.change_percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Explanation & Recommendations */}
                <div className="glass-card p-6 space-y-4 border-orange-200">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                    <Sparkles className="w-4.5 h-4.5 text-orange-500" />
                    <span>AI Trend Interpretation & Recommendations</span>
                  </h3>

                  <div className="space-y-3 text-xs text-slate-700">
                    <div className="p-3.5 bg-amber-50/70 rounded-lg border border-amber-200/80 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-orange-700 block">
                        Statistical Interpretation
                      </span>
                      <p className="text-slate-700 leading-relaxed font-normal">
                        {trendData?.ai_analysis || 'Analyzing trajectory...'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-emerald-50/70 rounded-lg border border-emerald-200/80 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                        Operational Recommendation
                      </span>
                      <p className="text-slate-700 leading-relaxed font-normal">
                        {trendData?.recommendation || 'Formulating strategy...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: ANOMALY DETECTION */}
      {/* ============================================================ */}
      {!loading && activeTab === 'anomalies' && (
        <div className="space-y-6">
          {/* Overall Summary if present */}
          {anomaliesData?.overall_summary && (
            <div className="glass-card p-5 border-amber-300/80 bg-amber-50/60 flex items-start space-x-3.5">
              <Sparkles className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  AI Anomaly Intelligence Brief
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {anomaliesData.overall_summary}
                </p>
              </div>
            </div>
          )}

          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
                Statistical Spike & Anomaly Logs
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                Method: Standardized Z-Score Surges (Z ≥ 1.5)
              </span>
            </div>

            <div className="space-y-4">
              {anomalies.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 border border-slate-200 rounded-lg">
                  No crime volume anomalies detected within the current historical dataset.
                </div>
              ) : (
                anomalies.map((an: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 transition-all hover:border-rose-400 hover:shadow-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                              Volume Anomaly in {an.date || an.month}
                            </h4>
                            {getSeverityBadge(an.severity)}
                          </div>
                          <p className="text-xs text-slate-800 mt-1 font-semibold">
                            {an.location}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block font-mono">
                          Z-Score: <strong className="text-rose-600 font-bold">{an.anomaly_score}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Quantitative Breakdown Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 px-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Observed Count</span>
                        <span className="font-bold text-slate-900">{an.observed_count || an.total_crimes} cases</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Expected Baseline</span>
                        <span className="font-bold text-slate-700">{an.expected_count} cases</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Severity</span>
                        <span className="font-semibold text-slate-800">{an.severity}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Crime Category</span>
                        <span className="font-semibold text-orange-600 truncate block" title={an.crime_category || an.driver_category}>
                          {an.crime_category || an.driver_category}
                        </span>
                      </div>
                    </div>

                    {/* AI Explanation & Recommendation */}
                    {(an.ai_explanation || an.description) && (
                      <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200/80 space-y-1.5 text-xs">
                        <p className="text-slate-700">
                          <span className="text-orange-700 font-semibold">AI Analysis: </span>
                          {an.ai_explanation || an.description}
                        </p>
                        {an.recommendation && (
                          <p className="text-slate-700 pt-1.5 border-t border-amber-200/60">
                            <span className="text-emerald-700 font-semibold">Action: </span>
                            {an.recommendation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
