'use client';

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useLeadContext } from '@/lib/lead-context';
import { Lead } from '@/lib/dummy-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Target, AlertCircle } from 'lucide-react';

interface LeadCategory {
  name: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  description: string;
  leads: Lead[];
}

const LeadOverview = () => {
  const { leads } = useLeadContext();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Categorize leads based on their status and engagement
  const categorizedData = useMemo(() => {
    const signed = leads.filter((lead) => lead.amplitudeData?.signed);
    const qualified = leads.filter(
      (lead) => lead.amplitudeData?.qualified && !lead.amplitudeData?.signed,
    );
    const hot = leads.filter((lead) => lead.amplitudeData?.hot && !lead.amplitudeData?.qualified);
    const active = leads.filter(
      (lead) =>
        lead.amplitudeData?.chatSessionStarted &&
        !lead.amplitudeData?.hot &&
        !lead.amplitudeData?.conversationAbandoned,
    );
    const abandoned = leads.filter(
      (lead) =>
        lead.amplitudeData?.conversationAbandoned ||
        (!lead.amplitudeData?.chatSessionStarted && lead.amplitudeData),
    );

    const categories: LeadCategory[] = [
      {
        name: 'Signed',
        value: signed.length,
        color: '#10B981', // green-500
        icon: <Target className="w-4 h-4" />,
        description: 'Leads who have signed leases',
        leads: signed,
      },
      {
        name: 'Qualified',
        value: qualified.length,
        color: '#3B82F6', // blue-500
        icon: <TrendingUp className="w-4 h-4" />,
        description: 'Qualified prospects ready for conversion',
        leads: qualified,
      },
      {
        name: 'Hot',
        value: hot.length,
        color: '#8B5CF6', // violet-500
        icon: <Users className="w-4 h-4" />,
        description: 'Actively engaged prospects',
        leads: hot,
      },
      {
        name: 'Active',
        value: active.length,
        color: '#F59E0B', // amber-500
        icon: <Users className="w-4 h-4" />,
        description: 'Started conversation but not yet engaged',
        leads: active,
      },
      {
        name: 'Abandoned',
        value: abandoned.length,
        color: '#EF4444', // red-500
        icon: <AlertCircle className="w-4 h-4" />,
        description: 'Abandoned conversations or inactive leads',
        leads: abandoned,
      },
    ];

    return categories.filter((category) => category.value > 0);
  }, [leads]);

  const totalLeads = leads.length;
  const selectedCategoryData = selectedCategory
    ? categorizedData.find((cat) => cat.name === selectedCategory)
    : null;

  const handlePieClick = (data: any) => {
    setSelectedCategory(data.name === selectedCategory ? null : data.name);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalLeads) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} leads ({percentage}%)
          </p>
          <p className="text-xs text-gray-500">{data.description}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Lead Distribution Overview
          <Badge variant="outline" className="text-sm">
            {totalLeads} Total Leads
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Pie Chart with Direct Labels */}
          <div className="relative">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorizedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    onClick={handlePieClick}
                    className="cursor-pointer"
                    label={({ name, value, percent }) => {
                      const percentage = (percent * 100).toFixed(1);
                      return `${name} (${value}) ${percentage}%`;
                    }}
                    labelLine={false}
                  >
                    {categorizedData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={selectedCategory === entry.name ? '#374151' : 'none'}
                        strokeWidth={selectedCategory === entry.name ? 2 : 0}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Side - Selected Category Details */}
          <div className="space-y-4">
            {selectedCategoryData ? (
              <>
                <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedCategoryData.color }}
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{selectedCategoryData.name} Leads</h3>
                    <p className="text-sm text-gray-600">{selectedCategoryData.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedCategoryData.value} leads •{' '}
                      {((selectedCategoryData.value / totalLeads) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedCategoryData.leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-purple-200 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">{lead.name}</div>
                        {lead.amplitudeData?.engagementScore && (
                          <Badge variant="outline" className="text-xs">
                            {lead.amplitudeData.engagementScore}
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 space-y-1">
                        {lead.email && <div>📧 {lead.email}</div>}
                        {lead.phone && <div>📞 {lead.phone}</div>}
                        {lead.unitInterest && <div>🏠 {lead.unitInterest}</div>}
                        <div>📅 {new Date(lead.lastActivity).toLocaleDateString()}</div>
                      </div>

                      {lead.assignedAgent && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {lead.assignedAgent}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <Users className="w-12 h-12 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Click on a chart segment</h3>
                <p className="text-sm text-center">
                  Select a category from the pie chart to see detailed information about those leads
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadOverview;
