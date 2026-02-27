import { useState } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Activity, CheckCircle, AlertTriangle } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Dashboard() {
    const [loading, setLoading] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [error, setError] = useState('');

    const handleTrain = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_URL}/train`);
            setMetrics(response.data);
        } catch (err) {
            setError(err.message || 'Error training model');
        } finally {
            setLoading(false);
        }
    };

    const chartData = metrics ? {
        labels: Object.keys(metrics.feature_importance).slice(0, 10),
        datasets: [
            {
                label: 'Feature Importance Score',
                data: Object.values(metrics.feature_importance).slice(0, 10),
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgb(79, 70, 229)',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Top 10 Feature Importances',
                font: { size: 16 }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Model Dashboard</h1>
                    <p className="text-gray-500 mt-1">Train and evaluate the Random Forest model</p>
                </div>
                <button
                    onClick={handleTrain}
                    disabled={loading}
                    className={`flex items-center px-6 py-3 rounded-lg text-white font-medium transition-all shadow-md hover:shadow-lg ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                        }`}
                >
                    {loading ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Training...</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <Activity className="w-5 h-5" />
                            <span>Train Model</span>
                        </div>
                    )}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                    <div className="text-red-700">{error}</div>
                </div>
            )}

            {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center transform transition-transform hover:scale-[1.02]">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-3 bg-green-100 rounded-lg text-green-600">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Model Accuracy</h2>
                        </div>
                        <div className="text-5xl font-extrabold text-indigo-600 mt-2">
                            {(metrics.accuracy * 100).toFixed(1)}<span className="text-2xl text-indigo-400">%</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">Based on initial 80/20 train-test split</p>
                    </div>

                    <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
                        {chartData && <Bar data={chartData} options={chartOptions} />}
                    </div>

                    <div className="md:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></span>
                            Confusion Matrix
                        </h2>
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider">True \ Predicted</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 tracking-wider">Low</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 tracking-wider">Moderate</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 tracking-wider">High</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {metrics.confusion_matrix.map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                                                {['Low', 'Moderate', 'High'][i]}
                                            </td>
                                            {row.map((val, j) => (
                                                <td key={j} className={`px-6 py-4 whitespace-nowrap text-sm text-center ${i === j ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-gray-500'}`}>
                                                    {val}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
