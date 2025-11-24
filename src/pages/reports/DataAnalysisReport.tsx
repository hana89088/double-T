import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, Download, Filter } from 'lucide-react';

interface MarketingData {
  month: string;
  revenue: number;
  customers: number;
  conversionRate: number;
  marketingSpend: number;
  roi: number;
  category: string;
  satisfaction: number;
}

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

const sampleMarketingData: MarketingData[] = [
  { month: 'Jan', revenue: 125000, customers: 450, conversionRate: 3.2, marketingSpend: 15000, roi: 8.3, category: 'Digital', satisfaction: 4.2 },
  { month: 'Feb', revenue: 138000, customers: 520, conversionRate: 3.8, marketingSpend: 18000, roi: 7.7, category: 'Digital', satisfaction: 4.3 },
  { month: 'Mar', revenue: 142000, customers: 580, conversionRate: 4.1, marketingSpend: 20000, roi: 7.1, category: 'Social', satisfaction: 4.1 },
  { month: 'Apr', revenue: 155000, customers: 640, conversionRate: 4.5, marketingSpend: 22000, roi: 7.0, category: 'Social', satisfaction: 4.4 },
  { month: 'May', revenue: 168000, customers: 720, conversionRate: 4.8, marketingSpend: 25000, roi: 6.7, category: 'Email', satisfaction: 4.5 },
  { month: 'Jun', revenue: 175000, customers: 780, conversionRate: 5.1, marketingSpend: 28000, roi: 6.3, category: 'Email', satisfaction: 4.6 },
  { month: 'Jul', revenue: 182000, customers: 850, conversionRate: 5.3, marketingSpend: 30000, roi: 6.1, category: 'Content', satisfaction: 4.7 },
  { month: 'Aug', revenue: 195000, customers: 920, conversionRate: 5.6, marketingSpend: 32000, roi: 6.1, category: 'Content', satisfaction: 4.8 },
  { month: 'Sep', revenue: 188000, customers: 880, conversionRate: 5.4, marketingSpend: 29000, roi: 6.5, category: 'SEO', satisfaction: 4.6 },
  { month: 'Oct', revenue: 205000, customers: 980, conversionRate: 5.8, marketingSpend: 35000, roi: 5.9, category: 'SEO', satisfaction: 4.9 },
  { month: 'Nov', revenue: 218000, customers: 1050, conversionRate: 6.1, marketingSpend: 38000, roi: 5.7, category: 'Paid', satisfaction: 4.8 },
  { month: 'Dec', revenue: 235000, customers: 1150, conversionRate: 6.5, marketingSpend: 42000, roi: 5.6, category: 'Paid', satisfaction: 5.0 }
];

const categoryData: ChartData[] = [
  { name: 'Digital', value: 35, color: '#3B82F6' },
  { name: 'Social', value: 25, color: '#10B981' },
  { name: 'Email', value: 20, color: '#F59E0B' },
  { name: 'Content', value: 12, color: '#EF4444' },
  { name: 'SEO', value: 5, color: '#8B5CF6' },
  { name: 'Paid', value: 3, color: '#06B6D4' }
];

const satisfactionData = [
  { name: 'Jan', satisfaction: 4.2, customers: 450 },
  { name: 'Feb', satisfaction: 4.3, customers: 520 },
  { name: 'Mar', satisfaction: 4.1, customers: 580 },
  { name: 'Apr', satisfaction: 4.4, customers: 640 },
  { name: 'May', satisfaction: 4.5, customers: 720 },
  { name: 'Jun', satisfaction: 4.6, customers: 780 },
  { name: 'Jul', satisfaction: 4.7, customers: 850 },
  { name: 'Aug', satisfaction: 4.8, customers: 920 },
  { name: 'Sep', satisfaction: 4.6, customers: 880 },
  { name: 'Oct', satisfaction: 4.9, customers: 980 },
  { name: 'Nov', satisfaction: 4.8, customers: 1050 },
  { name: 'Dec', satisfaction: 5.0, customers: 1150 }
];

export default function DataAnalysisReport() {
  const [data, setData] = useState<MarketingData[]>(sampleMarketingData);
  const [selectedChart, setSelectedChart] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate key metrics
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalCustomers = data[data.length - 1]?.customers || 0;
  const avgConversionRate = data.reduce((sum, item) => sum + item.conversionRate, 0) / data.length;
  const avgROI = data.reduce((sum, item) => sum + item.roi, 0) / data.length;
  const totalMarketingSpend = data.reduce((sum, item) => sum + item.marketingSpend, 0);

  const handleExport = () => {
    const reportData = {
      summary: {
        totalRevenue,
        totalCustomers,
        avgConversionRate,
        avgROI,
        totalMarketingSpend
      },
      monthlyData: data,
      categoryBreakdown: categoryData,
      generatedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'marketing-analysis-report.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value, name) => [
          name === 'revenue' ? `$${value.toLocaleString()}` : 
          name === 'conversionRate' ? `${value}%` : value.toLocaleString(),
          name === 'revenue' ? 'Doanh thu' : 
          name === 'customers' ? 'Khách hàng' : 
          name === 'conversionRate' ? 'Tỷ lệ chuyển đổi' : name
        ]} />
        <Legend />
        <Bar dataKey="revenue" fill="#3B82F6" name="Doanh thu" />
        <Bar dataKey="customers" fill="#10B981" name="Khách hàng" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value, name) => [
          name === 'conversionRate' ? `${value}%` : 
          name === 'roi' ? `${value}x` : value.toLocaleString(),
          name === 'conversionRate' ? 'Tỷ lệ chuyển đổi' : 
          name === 'roi' ? 'ROI' : name
        ]} />
        <Legend />
        <Line type="monotone" dataKey="conversionRate" stroke="#F59E0B" strokeWidth={3} name="Tỷ lệ chuyển đổi" />
        <Line type="monotone" dataKey="roi" stroke="#EF4444" strokeWidth={3} name="ROI" />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={categoryData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderScatterChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart data={satisfactionData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="satisfaction" name="Mức độ hài lòng" unit="/5" />
        <YAxis dataKey="customers" name="Số khách hàng" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => [
          name === 'satisfaction' ? `${value}/5` : value.toLocaleString(),
          name === 'satisfaction' ? 'Mức độ hài lòng' : 'Số khách hàng'
        ]} />
        <Scatter name="Mối quan hệ" dataKey="customers" fill="#8B5CF6" />
      </ScatterChart>
    </ResponsiveContainer>
  );

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Báo cáo Phân tích Marketing</h1>
          <p className="text-gray-600">Phân tích chi tiết dữ liệu marketing với trực quan hóa chuyên sâu</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Doanh thu</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12.5% so với năm trước</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Khách hàng</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+156% so với năm trước</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tỷ lệ Chuyển đổi TB</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgConversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">+0.8% so với năm trước</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROI Trung bình</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgROI.toFixed(1)}x</div>
              <p className="text-xs text-muted-foreground">-0.5x so với năm trước</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chi tiêu Marketing</CardTitle>
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalMarketingSpend.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Tổng chi tiêu</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <Button
              variant={selectedChart === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedChart('all')}
            >
              Tất cả biểu đồ
            </Button>
            <Button
              variant={selectedChart === 'bar' ? 'default' : 'outline'}
              onClick={() => setSelectedChart('bar')}
            >
              Biểu đồ cột
            </Button>
            <Button
              variant={selectedChart === 'line' ? 'default' : 'outline'}
              onClick={() => setSelectedChart('line')}
            >
              Biểu đồ đường
            </Button>
            <Button
              variant={selectedChart === 'pie' ? 'default' : 'outline'}
              onClick={() => setSelectedChart('pie')}
            >
              Biểu đồ tròn
            </Button>
            <Button
              variant={selectedChart === 'scatter' ? 'default' : 'outline'}
              onClick={() => setSelectedChart('scatter')}
            >
              Biểu đồ phân tán
            </Button>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Revenue and Customers */}
          {(selectedChart === 'all' || selectedChart === 'bar') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Doanh thu và Khách hàng theo tháng
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderBarChart()}
                <p className="text-sm text-gray-600 mt-4">
                  Biểu đồ cột thể hiện sự tăng trưởng doanh thu và số lượng khách hàng qua từng tháng.
                  Xu hướng tăng trưởng ổn định cho thấy chiến lược marketing hiệu quả.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Line Chart - Conversion Rate and ROI */}
          {(selectedChart === 'all' || selectedChart === 'line') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Tỷ lệ chuyển đổi và ROI theo thời gian
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderLineChart()}
                <p className="text-sm text-gray-600 mt-4">
                  Biểu đồ đường thể hiện xu hướng tỷ lệ chuyển đổi và ROI. 
                  Tỷ lệ chuyển đổi tăng đều đặn trong khi ROI có xu hướng giảm nhẹ do tăng chi tiêu marketing.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Pie Chart - Category Distribution */}
          {(selectedChart === 'all' || selectedChart === 'pie') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2" />
                  Phân bố theo kênh Marketing
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderPieChart()}
                <p className="text-sm text-gray-600 mt-4">
                  Biểu đồ tròn thể hiện tỷ lệ phân bố chi tiêu marketing theo từng kênh. 
                  Digital marketing chiếm tỷ trọng lớn nhất (35%), tiếp theo là Social Media (25%).
                </p>
              </CardContent>
            </Card>
          )}

          {/* Scatter Chart - Satisfaction vs Customers */}
          {(selectedChart === 'all' || selectedChart === 'scatter') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Mối quan hệ: Mức độ hài lòng & Số khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderScatterChart()}
                <p className="text-sm text-gray-600 mt-4">
                  Biểu đồ phân tán thể hiện mối tương quan giữa mức độ hài lòng khách hàng và số lượng khách hàng. 
                  Xu hướng tích cực cho thấy chất lượng dịch vụ được cải thiện theo thời gian.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Analysis Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tóm tắt Phân tích & Khuyến nghị</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">Điểm mạnh:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Tăng trưởng doanh thu ổn định (88% trong năm)</li>
                  <li>• Tỷ lệ chuyển đổi cải thiện liên tục (từ 3.2% lên 6.5%)</li>
                  <li>• Mức độ hài lòng khách hàng cao và tăng đều</li>
                  <li>• Chiến lược đa kênh marketing hiệu quả</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-orange-700 mb-2">Cơ hội cải thiện:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• ROI có xu hướng giảm cần tối ưu chi tiêu</li>
                  <li>• Tăng đầu tư vào kênh SEO và Paid Ads hiệu quả</li>
                  <li>• Tối ưu hóa chi phí marketing để cải thiện ROI</li>
                  <li>• Tập trung vào các kênh có tỷ lệ chuyển đổi cao</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Khuyến nghị chiến lược:</h4>
              <p className="text-sm text-blue-700">
                Tiếp tục duy trì đà tăng trưởng hiện tại trong khi tập trung tối ưu hóa chi phí marketing. 
                Đầu tư nhiều hơn vào các kênh có ROI cao như SEO và Email Marketing. 
                Theo dõi chặt chẽ tỷ lệ chuyển đổi và mức độ hài lòng để đảm bảo tăng trưởng bền vững.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}