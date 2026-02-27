import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function TablePage() {
    const [msmes, setMsmes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchMsmes = async () => {
            try {
                const response = await axios.get(`${API_URL}/msmes`);
                setMsmes(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMsmes();
    }, []);

    const getScoreColor = (score) => {
        if (score < 40) return 'bg-red-100 text-red-800 border-red-200';
        if (score < 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-green-100 text-green-800 border-green-200';
    };

    const getCategoryColor = (category) => {
        if (category === 'Low') return 'text-red-600 font-medium';
        if (category === 'Moderate') return 'text-yellow-600 font-medium';
        return 'text-green-600 font-medium';
    };

    const filteredMsmes = msmes.filter(m =>
        m.MSME_ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.Sector.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">MSME Directory</h1>
                    <p className="text-sm text-slate-500 mt-1 pl-4">View all businesses and their growth predictions</p>
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search ID or Sector..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-64 text-sm bg-slate-50 text-slate-900"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-gray-500">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                        <div>Loading MSME data...</div>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">MSME ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sector</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Revenue</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Predicted Category</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Growth Score</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMsmes.map((msme) => (
                                <tr key={msme.MSME_ID} className="bg-white hover:bg-slate-50 transition-colors cursor-pointer group border-b border-slate-100">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="ml-2 font-semibold text-blue-600 text-sm">{msme.MSME_ID}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{msme.Sector}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">₹{(msme.Annual_Revenue / 100000).toFixed(1)}L</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={getCategoryColor(msme.Predicted_Growth_Category)}>
                                            {msme.Predicted_Growth_Category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`px-2 py-0.5 inline-flex text-xs font-bold rounded-md border ${getScoreColor(msme.Growth_Score)}`}>
                                                {msme.Growth_Score?.toFixed(1)}
                                            </span>
                                            <div className="w-16 bg-slate-200 rounded-full h-1 mt-2">
                                                <div
                                                    className="bg-blue-600 h-1 rounded-full"
                                                    style={{ width: `${msme.Growth_Score}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            to={`/msme/${msme.MSME_ID}`}
                                            className="text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-md transition-colors flex justify-end items-center opacity-0 group-hover:opacity-100"
                                        >
                                            Details <ChevronRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {filteredMsmes.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No MSMEs found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
