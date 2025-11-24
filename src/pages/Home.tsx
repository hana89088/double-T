import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, FileText, Brain } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Marketing Insights</h1>
            </div>
            <div className="flex space-x-4">
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Marketing Analytics
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your marketing data into actionable insights with our advanced AI analytics platform. 
            Upload your data, generate insights, and create stunning visualizations in minutes.
          </p>
          <Link to="/register">
            <Button className="text-lg px-8 py-3">
              Start Your Free Trial
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Data Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Upload CSV, Excel, or text files with your marketing data
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
                <Brain className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-lg">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get AI-powered insights and recommendations from your data
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Visualizations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create stunning charts and graphs from your data
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Generate comprehensive marketing reports with insights
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Marketing Data?
          </h3>
          <p className="text-gray-600 mb-6">
            Join thousands of marketers who are already using AI to gain insights from their data.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register">
              <Button className="text-lg px-6 py-3">Get Started Free</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="text-lg px-6 py-3">Sign In</Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Marketing Insights. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}