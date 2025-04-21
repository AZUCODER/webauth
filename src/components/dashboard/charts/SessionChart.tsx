'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Session = {
  id: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
};

type SessionsByDay = {
  date: string;
  count: number;
};

type SessionData = {
  sessions: Session[];
  sessionsByDay: SessionsByDay[];
};

export default function SessionChart() {
  const [data, setData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await api.get(`/api/sessions?days=${timeRange}`);
        
        const result = response.data;
        
        if (!result || !result.sessions || !result.sessionsByDay) {
          throw new Error('Invalid session data format');
        }
        
        setData(result);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching session data:', err);
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.message || err.message
            : err instanceof Error ? err.message : 'An unknown error occurred'
        );
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);

  // Format date for display in the chart tooltip
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // If we're still loading, show a loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="animate-pulse bg-gray-200 h-6 w-48 rounded"></CardTitle>
          <CardDescription className="animate-pulse bg-gray-200 h-4 w-64 rounded"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-gray-100 rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  // If there was an error, display it
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>Error loading session data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no data is available
  if (!data || data.sessionsByDay.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>No login data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No login history found for the selected time period.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Process chart data to fill in missing days with zero counts
  const processChartData = () => {
    // The API now returns data with all days already filled in
    // We just need to ensure the date format is correct and sort the data
    return data.sessionsByDay.map(item => ({
      date: item.date,
      count: item.count
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const chartData = processChartData();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Login History</CardTitle>
          <CardDescription>Your login activity over time</CardDescription>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('7')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === '7' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            7d
          </button>
          <button
            onClick={() => setTimeRange('30')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === '30' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            30d
          </button>
          <button
            onClick={() => setTimeRange('90')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === '90' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            90d
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tickMargin={10}
                minTickGap={20}
              />
              <YAxis 
                tickCount={5}
                domain={[0, 'auto']}
              />
              <Tooltip 
                formatter={(value) => [` ${value} login(s)`, 'Count']}
                labelFormatter={(label) => formatDate(label)}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  border: 'none' 
                }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#6366F1" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Recent Logins</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">Date</th>
                  <th className="pb-2 text-left font-medium">IP Address</th>
                  <th className="pb-2 text-left font-medium">Browser/Device</th>
                </tr>
              </thead>
              <tbody>
                {data.sessions.slice(0, 5).map((session) => {
                  // Simple browser/device detection from user agent
                  const ua = session.userAgent;
                  const isMobile = ua.includes('Mobile');
                  const browser = 
                    ua.includes('Firefox') ? 'Firefox' :
                    ua.includes('Chrome') ? 'Chrome' :
                    ua.includes('Safari') ? 'Safari' :
                    ua.includes('Edge') ? 'Edge' :
                    'Unknown';
                  
                  const device = isMobile ? 'Mobile' : 'Desktop';
                  const browserInfo = `${browser} on ${device}`;
                  
                  return (
                    <tr key={session.id} className="border-b">
                      <td className="py-3 text-left">
                        {new Date(session.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 text-left">{session.ipAddress}</td>
                      <td className="py-3 text-left">{browserInfo}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 