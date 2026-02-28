import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import Card from './Card';
import { PieChart, BarChart2 } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const SectorCharts = ({ data }) => {
    if (!data || data.length === 0) return null;

    const labels = data.map(item => item.Sector);
    const colors = [
        'rgba(37, 99, 235, 0.8)',   // Blue 600
        'rgba(16, 185, 129, 0.8)',  // Emerald 500
        'rgba(244, 63, 94, 0.8)',   // Rose 500
        'rgba(245, 158, 11, 0.8)',  // Amber 500
        'rgba(139, 92, 246, 0.8)',  // Violet 500
        'rgba(14, 165, 233, 0.8)'   // Sky 500
    ];

    const budgetData = {
        labels,
        datasets: [
            {
                label: 'Allocated Budget (₹)',
                data: data.map(item => item.Allocated_Budget),
                backgroundColor: colors,
                borderWidth: 0,
            }
        ]
    };

    const jobsData = {
        labels,
        datasets: [
            {
                label: 'Jobs Created',
                data: data.map(item => item.Jobs_Created),
                backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue 500
                borderRadius: 4,
            }
        ]
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false }
        },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-6">
            <Card title="Budget Allocation by Sector" headerIcon={<PieChart size={18} />} className="h-[22rem]">
                <div className="h-full w-full relative pb-4">
                    <Doughnut
                        data={budgetData}
                        options={{
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'right',
                                    labels: { font: { family: 'Inter', size: 11 } }
                                }
                            },
                            cutout: '70%'
                        }}
                    />
                </div>
            </Card>
            <Card title="Jobs Created by Sector" headerIcon={<BarChart2 size={18} />} className="h-[22rem]">
                <div className="h-full w-full relative pb-4">
                    <Bar data={jobsData} options={barOptions} />
                </div>
            </Card>
        </div>
    );
};

export default SectorCharts;
