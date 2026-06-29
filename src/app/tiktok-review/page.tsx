'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TikTokReport } from '@/components/tiktok-report';
import { Upload, Loader2, AlertCircle } from 'lucide-react';

interface ReportData {
  report_id: string;
  platform: string;
  campaign_name: string;
  generated_at: string;
  date_range: string;
  scores: {
    overall: number;
    performance: number;
    efficiency: number;
    delivery: number;
    risk: number;
  };
  evidence: Array<{
    evidence_id: string;
    metric: string;
    value: number;
    value_formatted: string;
    benchmark: number;
    benchmark_formatted: string;
    status: 'above' | 'below' | 'on_target';
    campaign: string;
  }>;
  metric_analysis: Array<{
    metric: string;
    evidence_id: string;
    value: number;
    value_formatted: string;
    benchmark: number;
    benchmark_formatted: string;
    status: 'above_benchmark' | 'below_benchmark' | 'on_target' | 'insufficient_data';
    deviation: number;
    deviation_percentage: number;
    trend?: 'increasing' | 'decreasing' | 'stable';
  }>;
  diagnosis: Array<{
    rule_id: string;
    metric: string;
    evidence_id: string;
    value: number;
    value_formatted: string;
    condition: string;
    status: 'critical' | 'warning' | 'info' | 'good' | 'excellent';
    severity: 'high' | 'medium' | 'low' | 'none';
    recommendation: string;
    description: string;
    campaign: string;
  }>;
  action_plan: Array<{
    priority: string;
    action: string;
    issue: string;
    details: string;
    expected_impact: string;
    related_evidence: string[];
    related_diagnosis: string[];
  }>;
  llm_explanation: {
    executive_summary: string;
    diagnosis: string;
    action_plan: string;
  };
  warnings: Array<{ type: string; message: string }>;
  metadata: {
    has_video_data: boolean;
    data_sufficient: boolean;
    ars_version: string;
    are_version: string;
  };
}

export default function TikTokReviewPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  // Form state
  const [campaignName, setCampaignName] = useState('');
  const [spend, setSpend] = useState('');
  const [impressions, setImpressions] = useState('');
  const [clicks, setClicks] = useState('');
  const [ctr, setCtr] = useState('');
  const [cpc, setCpc] = useState('');
  const [conversions, setConversions] = useState('');
  const [cvr, setCvr] = useState('');
  const [cpa, setCpa] = useState('');
  const [roas, setRoas] = useState('');
  const [dateRange, setDateRange] = useState('Last 7 days');

  // Video metrics (optional)
  const [videoViews, setVideoViews] = useState('');
  const [sixSecondViews, setSixSecondViews] = useState('');
  const [sixSecondViewRate, setSixSecondViewRate] = useState('');
  const [avgWatchTime, setAvgWatchTime] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tiktok-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaigns: [{
            name: campaignName || 'Unknown Campaign',
            spend: parseFloat(spend) || 0,
            impressions: parseInt(impressions) || 0,
            clicks: parseInt(clicks) || 0,
            ctr: parseFloat(ctr) || 0,
            cpc: parseFloat(cpc) || 0,
            conversions: parseInt(conversions) || 0,
            cvr: parseFloat(cvr) || 0,
            cpa: parseFloat(cpa) || 0,
            roas: parseFloat(roas) || 0,
            video_views: videoViews ? parseInt(videoViews) : undefined,
            six_second_views: sixSecondViews ? parseInt(sixSecondViews) : undefined,
            six_second_view_rate: sixSecondViewRate ? parseFloat(sixSecondViewRate) : undefined,
            avg_watch_time: avgWatchTime ? parseFloat(avgWatchTime) : undefined,
          }],
          date_range: dateRange,
          locale: 'en',
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      setReportData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setReportData(null);
    setError(null);
  };

  if (reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Button onClick={handleReset} variant="outline">
              ← Back to Input
            </Button>
          </div>
          <TikTokReport data={reportData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">TikTok Ads Review</h1>
          <p className="text-slate-400">
            Enter your TikTok campaign data to get a comprehensive analysis
          </p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Campaign Data Input
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Campaign Name</Label>
                  <Input
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Summer Collection"
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Date Range</Label>
                  <Input
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    placeholder="Last 7 days"
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                  />
                </div>
              </div>

              {/* Core Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Core Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-slate-300">Spend ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={spend}
                      onChange={(e) => setSpend(e.target.value)}
                      placeholder="523.45"
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Impressions</Label>
                    <Input
                      type="number"
                      value={impressions}
                      onChange={(e) => setImpressions(e.target.value)}
                      placeholder="125000"
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Clicks</Label>
                    <Input
                      type="number"
                      value={clicks}
                      onChange={(e) => setClicks(e.target.value)}
                      placeholder="2312"
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">CTR (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={ctr}
                      onChange={(e) => setCtr(e.target.value)}
                      placeholder="1.85"
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">CPC ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={cpc}
                      onChange={(e) => setCpc(e.target.value)}
                      placeholder="0.23"
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Conversions</Label>
                    <Input
                      type="number"
                      value={conversions}
                      onChange={(e) => setConversions(e.target.value)}
                      placeholder="62"
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">CVR (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={cvr}
                      onChange={(e) => setCvr(e.target.value)}
                      placeholder="2.68"
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">CPA ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={cpa}
                      onChange={(e) => setCpa(e.target.value)}
                      placeholder="8.44"
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">ROAS</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={roas}
                      onChange={(e) => setRoas(e.target.value)}
                      placeholder="2.8"
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Video Metrics (Optional) */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Video Metrics <span className="text-sm text-slate-400">(Optional - for Hook analysis)</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-slate-300">Video Views</Label>
                    <Input
                      type="number"
                      value={videoViews}
                      onChange={(e) => setVideoViews(e.target.value)}
                      placeholder="125000"
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">6s Views</Label>
                    <Input
                      type="number"
                      value={sixSecondViews}
                      onChange={(e) => setSixSecondViews(e.target.value)}
                      placeholder="31250"
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">6s View Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={sixSecondViewRate}
                      onChange={(e) => setSixSecondViewRate(e.target.value)}
                      placeholder="25.0"
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Avg Watch Time (s)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={avgWatchTime}
                      onChange={(e) => setAvgWatchTime(e.target.value)}
                      placeholder="4.2"
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Campaign'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="mt-8 bg-slate-900/30 border-slate-800">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-white mb-2">About TikTok Analysis</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>• <strong>Core Metrics:</strong> Spend, Impressions, Clicks, CTR, CPC, Conversions, CVR, CPA, ROAS</li>
              <li>• <strong>Video Metrics:</strong> Optional, enables Hook and Creative Quality analysis</li>
              <li>• <strong>Data Requirements:</strong> Spend ≥ $50 and Results ≥ 50 for reliable analysis</li>
              <li>• <strong>Benchmarks:</strong> Based on TikTok industry standards (CTR 1.5%, CVR 3.5%, ROAS 2.5x)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
