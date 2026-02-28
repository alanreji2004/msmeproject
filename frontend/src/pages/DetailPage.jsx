import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { ArrowLeft, TrendingUp, Building, MapPin, Tag, Zap, CheckCircle2 } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function DetailPage() {
    const { id } = useParams();
    const [msme, setMsme] = useState(null);
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMsme = async () => {
            try {
                const response = await axios.get(`${API_URL}/msme/${id}`);
                setMsme(response.data);

                try {
                    const schemeResponse = await axios.get(`${API_URL}/msme/${id}/schemes`);
                    setSchemes(schemeResponse.data);
                } catch (schemeErr) {
                    // It's ok if schemes fail or none are found, we just won't show them
                    console.log("No schemes found");
                }

            } catch (err) {
                setError(err.response?.data?.detail || 'Error fetching MSME details');
            } finally {
                setLoading(false);
            }
        };
        fetchMsme();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-indigo-600">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex flex-col items-center">
                <div className="text-red-500 mb-4">{error}</div>
                <Link to="/msmes" className="text-indigo-600 hover:underline flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
                </Link>
            </div>
        );
    }

    if (!msme) return null;

    const { original_data, predicted_category, growth_score, top_important_features } = msme;

    const getScoreColor = (score) => {
        if (score < 40) return 'text-red-600';
        if (score < 70) return 'text-yellow-600';
        return 'text-green-600';
    };

    const getScoreBgColor = (score) => {
        if (score < 40) return 'bg-red-50 border-red-200';
        if (score < 70) return 'bg-yellow-50 border-yellow-200';
        return 'bg-green-50 border-green-200';
    };

    const pieData = {
        labels: ['Actual Score', 'Remaining Potential'],
        datasets: [
            {
                data: [growth_score, 100 - growth_score],
                backgroundColor: [
                    growth_score < 40 ? '#EF4444' : growth_score < 70 ? '#F59E0B' : '#10B981',
                    '#E5E7EB',
                ],
                borderWidth: 0,
            },
        ],
    };

    const InfoCard = ({ icon: Icon, label, value }) => (
        <div className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="p-2 bg-white rounded-md shadow-sm border border-gray-100 text-indigo-500 mr-4">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="text-lg font-semibold text-gray-800">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <Link to="/msmes" className="p-2 bg-white rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">MSME Details</h1>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-bold rounded-full ml-auto">
                    {original_data.MSME_ID}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Core Stats */}
                <div className={`col-span-1 lg:col-span-1 p-6 rounded-2xl shadow-sm border ${getScoreBgColor(growth_score)} flex flex-col items-center justify-center relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-bl-full -z-10 blur-xl"></div>

                    <h2 className="text-lg font-semibold text-gray-600 mb-2 uppercase tracking-wider">Growth Prediction</h2>

                    <div className="relative w-48 h-48 my-4">
                        <Pie data={pieData} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className={`text-4xl font-black ${getScoreColor(growth_score)}`}>
                                {growth_score.toFixed(1)}
                            </span>
                            <span className="text-xs font-bold text-gray-400 mt-1">/ 100</span>
                        </div>
                    </div>

                    <div className="text-center mt-4 bg-white p-3 rounded-lg w-full shadow-sm">
                        <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Category</p>
                        <p className={`text-xl font-bold ${getScoreColor(growth_score)}`}>{predicted_category}</p>
                    </div>
                </div>

                {/* Right Column: Business Profile */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3 flex items-center">
                            <Building className="w-5 h-5 mr-2 text-indigo-500" />
                            Company Profile
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoCard icon={Tag} label="Sector" value={original_data.Sector} />
                            <InfoCard icon={MapPin} label="Location" value={original_data.Location_Type} />
                            <InfoCard icon={Building} label="Enterprise Size" value={original_data.Enterprise_Size} />
                            <InfoCard icon={TrendingUp} label="Annual Revenue" value={`₹${(original_data.Annual_Revenue / 100000).toFixed(2)}L`} />
                            <InfoCard icon={Tag} label="Category" value={original_data.Category} />
                            <InfoCard icon={Building} label="Ownership" value={original_data.Ownership_Type} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">Key Predictive Factors</h3>
                        <div className="space-y-4">
                            {Object.entries(top_important_features).map(([feature, importance], index) => (
                                <div key={feature} className="relative">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-sm font-semibold text-gray-700">
                                            {index + 1}. {feature.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                            {(importance * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${importance * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Advisory Interface: Scheme Simulation */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-indigo-500" />
                    Advisory Interface: Scheme Simulation (Math Transparent)
                </h3>
                {schemes.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Eligible Scheme</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Before Rev</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Projected After Rev</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rev Gain</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Proj. Jobs</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Max Subsidy</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {schemes.map((s, idx) => (
                                    <tr key={idx} className={`transition-colors ${s.Recommended ? "bg-indigo-50 border-l-4 border-indigo-500" : "hover:bg-gray-50"}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {s.Recommended && <CheckCircle2 className="w-4 h-4 text-indigo-600 mr-2" />}
                                                <span className={`text-sm ${s.Recommended ? 'text-indigo-900 font-bold' : 'text-gray-900 font-medium'}`}>{s.Scheme_Name}</span>
                                            </div>
                                            {s.Recommended && <p className="text-xs text-indigo-600 mt-1 font-semibold ml-6">Recommended (Max Impact)</p>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{(s.Before_Revenue / 100000).toFixed(2)}L</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">₹{(s.Projected_After_Revenue / 100000).toFixed(2)}L</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">+{(s.Impact_Factor_Revenue_Percent).toFixed(1)}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">+{s.Impact_Factor_Employment}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{(s.Subsidy_Cap).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-100">No eligible schemes found for this MSME based on location, sector, and category.</div>
                )}
            </div>

        </div>
    );
}
