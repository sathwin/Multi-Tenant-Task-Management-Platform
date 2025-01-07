import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  Calendar,
  Target,
} from 'lucide-react';
import { MetricsCard } from '@/components/dashboard/metrics-card';
import { AnalyticsChart } from '@/components/dashboard/analytics-chart';
import { DashboardMetrics, ChartData, TimeSeriesData } from '@/types';
import { Button } from '@/components/ui/button';

// Mock data - replace with actual API calls
const mockMetrics: DashboardMetrics = {
  totalTasks: 247,
  completedTasks: 189,
  overdueTasks: 12,
  inProgressTasks: 46,
  totalProjects: 8,
  activeProjects: 6,
  teamMembers: 12,
  avgCompletionTime: 2.5,
  productivityScore: 87,
  taskCompletionRate: 76.5,
};

const mockTimeSeriesData: TimeSeriesData[] = [
  { date: '2024-01-01', tasks: 45, completed: 34, created: 12 },
  { date: '2024-01-02', tasks: 52, completed: 41, created: 15 },
  { date: '2024-01-03', tasks: 48, completed: 38, created: 10 },
  { date: '2024-01-04', tasks: 61, completed: 47, created: 18 },
  { date: '2024-01-05', tasks: 55, completed: 43, created: 14 },
  { date: '2024-01-06', tasks: 67, completed: 52, created: 20 },
  { date: '2024-01-07', tasks: 59, completed: 46, created: 16 },
];

const mockProjectData: ChartData[] = [
  { name: 'Completed', value: 6, category: 'success' },
  { name: 'In Progress', value: 4, category: 'warning' },
  { name: 'Planning', value: 2, category: 'info' },
  { name: 'On Hold', value: 1, category: 'error' },
];

const mockTeamProductivity: ChartData[] = [
  { name: 'Alice', value: 95, category: 'user' },
  { name: 'Bob', value: 87, category: 'user' },
  { name: 'Charlie', value: 92, category: 'user' },
  { name: 'Diana', value: 78, category: 'user' },
  { name: 'Eve', value: 85, category: 'user' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your projects.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 7 days
          </Button>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <MetricsCard
            title="Total Tasks"
            value={mockMetrics.totalTasks}
            change={{
              value: 12,
              type: 'increase',
              period: 'last week',
            }}
            icon={CheckSquare}
            color="blue"
            loading={loading}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <MetricsCard
            title="Completed"
            value={mockMetrics.completedTasks}
            change={{
              value: 8,
              type: 'increase',
              period: 'last week',
            }}
            icon={Target}
            color="green"
            loading={loading}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <MetricsCard
            title="Overdue"
            value={mockMetrics.overdueTasks}
            change={{
              value: 5,
              type: 'decrease',
              period: 'last week',
            }}
            icon={AlertTriangle}
            color="red"
            loading={loading}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <MetricsCard
            title="Avg. Completion"
            value={`${mockMetrics.avgCompletionTime}d`}
            change={{
              value: 15,
              type: 'decrease',
              period: 'last week',
            }}
            icon={Clock}
            color="purple"
            loading={loading}
          />
        </motion.div>
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 lg:grid-cols-2"
      >
        <motion.div variants={itemVariants}>
          <AnalyticsChart
            title="Task Completion Trend"
            description="Daily task completion over time"
            type="area"
            data={mockTimeSeriesData}
            height={350}
            dataKeys={['completed', 'created']}
            xAxisKey="date"
            loading={loading}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <AnalyticsChart
            title="Project Status Distribution"
            description="Current status of all projects"
            type="pie"
            data={mockProjectData}
            height={350}
            loading={loading}
          />
        </motion.div>
      </motion.div>

      {/* Additional Charts */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 lg:grid-cols-3"
      >
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <AnalyticsChart
            title="Team Productivity"
            description="Individual team member performance"
            type="bar"
            data={mockTeamProductivity}
            height={300}
            loading={loading}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="glass-effect rounded-xl border p-6 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  Recent Activity
                </h3>
                <p className="text-sm text-muted-foreground">
                  Latest updates from your team
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    user: 'Alice',
                    action: 'completed task',
                    target: 'Design Review',
                    time: '2 hours ago',
                  },
                  {
                    user: 'Bob',
                    action: 'created project',
                    target: 'Mobile App',
                    time: '4 hours ago',
                  },
                  {
                    user: 'Charlie',
                    action: 'updated task',
                    target: 'API Integration',
                    time: '6 hours ago',
                  },
                  {
                    user: 'Diana',
                    action: 'commented on',
                    target: 'User Testing',
                    time: '1 day ago',
                  },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 rounded-lg p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {activity.user.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{' '}
                        {activity.action}{' '}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button variant="outline" className="w-full">
                <Activity className="h-4 w-4 mr-2" />
                View All Activity
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 