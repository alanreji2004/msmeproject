import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, CheckSquare, Coins, IndianRupee, Briefcase, Settings, AlertCircle, LayoutDashboard, XOctagon, PieChart } from 'lucide-react';
import styles from './OptimizationDashboard.module.css';

const OptimizationDashboard = () => {
    const [budget, setBudget] = useState(100000000);
    const [wRev, setWRev] = useState(0.5);
    const [wEmp, setWEmp] = useState(0.5);

    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('allocated'); // 'allocated', 'rejected', 'sectors'

    const fetchOptimizationLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/optimize`, {
                params: {
                    budget: budget,
                    w_rev: wRev,
                    w_emp: wEmp
                }
            });
            setResults(response.data);
            setActiveTab('allocated'); // Reset to default view on new simulation
        } catch (err) {
            setError(err.message || 'Error running optimization engine');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOptimizationLogs();
        // eslint-disable-next-line
    }, []);

    const handleSliderChange = (type, value) => {
        let newRev = wRev;
        let newEmp = wEmp;

        if (type === 'rev') {
            newRev = parseFloat(value);
            newEmp = 1 - newRev;
        } else {
            newEmp = parseFloat(value);
            newRev = 1 - newEmp;
        }

        setWRev(Number(newRev.toFixed(2)));
        setWEmp(Number(newEmp.toFixed(2)));
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.dashboardContainer}>

                {/* Header Ribbon */}
                <header className={`${styles.glassPanel} ${styles.header}`}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>
                            Optimization Engine
                        </h1>
                        <p className={styles.subtitle}>
                            Fractional Knapsack allocation bounds configuration.
                        </p>
                    </div>
                </header>

                {/* Main Body Grid */}
                <div className={styles.mainGrid}>

                    {/* Left Column (Controls 4/12 width) */}
                    <aside className={styles.controlsSidebar}>

                        {/* Budget Card */}
                        <div className={styles.controlCard}>
                            <label className={styles.controlLabelNoBorder}>
                                <Coins size={16} />
                                Total Pool Budget
                            </label>
                            <div className={styles.budgetInputContainer}>
                                <span className={styles.budgetIcon}>₹</span>
                                <input
                                    type="number"
                                    value={budget}
                                    onChange={(e) => setBudget(Number(e.target.value))}
                                    className={styles.budgetInput}
                                    placeholder="100000000"
                                />
                            </div>
                        </div>

                        {/* Weight Sliders Card */}
                        <div className={styles.controlCard}>
                            <h3 className={styles.controlLabel}>
                                <Settings size={16} />
                                Policy Weights
                            </h3>

                            {/* Rev Slider */}
                            <div style={{ marginTop: '1.25rem' }}>
                                <div className={styles.sliderHeader}>
                                    <label className={styles.controlLabelNoBorder} style={{ marginBottom: 0 }}>
                                        <IndianRupee size={14} />
                                        Revenue Priority
                                    </label>
                                    <span className={styles.sliderValueBox}>{wRev.toFixed(2)}</span>
                                </div>
                                <div className={styles.sliderContainer}>
                                    <div className={styles.sliderTrackRev} style={{ width: `${wRev * 100}%` }}></div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={wRev}
                                        onChange={(e) => handleSliderChange('rev', e.target.value)}
                                        className={styles.rangeInput}
                                    />
                                    <div className={styles.sliderThumbRev} style={{ left: `calc(${wRev * 100}% - 7px)` }}></div>
                                </div>
                            </div>

                            {/* Emp Slider */}
                            <div>
                                <div className={styles.sliderHeader}>
                                    <label className={styles.controlLabelNoBorder} style={{ marginBottom: 0 }}>
                                        <Briefcase size={14} />
                                        Jobs Priority
                                    </label>
                                    <span className={styles.sliderValueBox}>{wEmp.toFixed(2)}</span>
                                </div>
                                <div className={styles.sliderContainer}>
                                    <div className={styles.sliderTrackEmp} style={{ width: `${wEmp * 100}%` }}></div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={wEmp}
                                        onChange={(e) => handleSliderChange('emp', e.target.value)}
                                        className={styles.rangeInput}
                                    />
                                    <div className={styles.sliderThumbEmp} style={{ left: `calc(${wEmp * 100}% - 7px)` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Simulation Button strictly placed below sliders */}
                        <button
                            onClick={fetchOptimizationLogs}
                            disabled={loading}
                            className={styles.runButton}
                        >
                            {loading ? <RefreshCw className="animate-spin" size={18} /> : null}
                            {loading ? 'Optimizing...' : 'Run Simulation'}
                        </button>

                        {/* Left Side Summary Stats box */}
                        {results && results.summary && !loading && (
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <p className={styles.statTitle}>MSMEs Funded</p>
                                    <p className={`${styles.statValue} ${styles.statValueBlue}`}>{results.summary.Total_MSMEs_Funded}</p>
                                </div>
                                <div className={styles.statCard}>
                                    <p className={styles.statTitle}>Jobs Created</p>
                                    <p className={`${styles.statValue} ${styles.statValuePink}`}>{results.summary.Total_Projected_Jobs_Created}</p>
                                </div>
                                <div className={`${styles.statCard} ${styles.statCardFull}`}>
                                    <p className={styles.statTitle}>Total Assigned Subsidy</p>
                                    <p className={`${styles.statValue} ${styles.statValueGreen}`}>₹{results.summary.Total_Budget_Spent.toLocaleString()}</p>
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* Right Column (Results Table & Tabs) */}
                    <main className={`${styles.glassPanel} ${styles.resultsArea}`}>

                        {loading ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner}></div>
                                <p className={styles.loadingText}>Running Knapsack Algorithm...</p>
                            </div>
                        ) : error ? (
                            <div className={styles.emptyState}>
                                <AlertCircle className={styles.emptyIcon} color="#dc3545" />
                                <h2 className={styles.emptyTitle} style={{ color: '#dc3545' }}>Engine Failure</h2>
                                <p className={styles.emptyDesc}>
                                    {error}
                                </p>
                            </div>
                        ) : results && results.allocations ? (

                            <>
                                {/* Table Header block */}
                                <div className={styles.tableHeader} style={{ borderBottom: 'none', paddingBottom: '1rem' }}>
                                    <h3 className={styles.tableTitle}>Optimization Review</h3>
                                </div>

                                {/* Custom Tabs */}
                                <div className={styles.tabsContainer}>
                                    <button
                                        onClick={() => setActiveTab('allocated')}
                                        className={`${styles.tabBtn} ${activeTab === 'allocated' ? styles.tabActive : ''}`}
                                    >
                                        <CheckSquare size={16} /> Allocated ({results.allocations.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('rejected')}
                                        className={`${styles.tabBtn} ${activeTab === 'rejected' ? styles.tabActive : ''}`}
                                    >
                                        <XOctagon size={16} /> Rejected ({results.non_selected ? results.non_selected.length : 0})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('sectors')}
                                        className={`${styles.tabBtn} ${activeTab === 'sectors' ? styles.tabActive : ''}`}
                                    >
                                        <PieChart size={16} /> Sector Impact
                                    </button>
                                </div>

                                {/* Scrollable Tab Content Area */}
                                <div className={styles.tableContainer}>

                                    {/* ALLOCATED TAB */}
                                    {activeTab === 'allocated' && (
                                        <table className={styles.dataTable}>
                                            <thead>
                                                <tr>
                                                    <th>MSME Details</th>
                                                    <th>Target Scheme</th>
                                                    <th style={{ textAlign: 'center' }}>Impact Score</th>
                                                    <th style={{ textAlign: 'right' }}>Subsidy Cap</th>
                                                    <th style={{ textAlign: 'center' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {results.allocations.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5">
                                                            <div className={styles.emptyState}>
                                                                <Coins className={styles.emptyIcon} />
                                                                <h2 className={styles.emptyTitle}>Budget Too Low</h2>
                                                                <p className={styles.emptyDesc}>No schemes fit within the allocated budget pool using these constraints.</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    results.allocations.map((alloc, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                <div className={styles.msmeId}>{alloc.MSME_ID}</div>
                                                                <div className={styles.impactTags}>
                                                                    <span className={`${styles.tag} ${styles.tagRevenue}`}>
                                                                        +₹{(alloc.After_Revenue - alloc.Before_Revenue).toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 })} Rev
                                                                    </span>
                                                                    <span className={`${styles.tag} ${styles.tagJobs}`}>
                                                                        +{alloc.Jobs_Created} Jobs
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className={styles.schemeName}>{alloc.Scheme_Name}</div>
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                <span className={styles.scoreBox}>
                                                                    {(alloc.Optimization_Score * 100).toFixed(2)}
                                                                </span>
                                                            </td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                <span className={styles.subsidyAmount}>
                                                                    ₹{alloc.Subsidy_Cost.toLocaleString()}
                                                                </span>
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                <span className={styles.statusPass}>
                                                                    <CheckSquare size={16} strokeWidth={2.5} />
                                                                    PASS
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* REJECTED TAB */}
                                    {activeTab === 'rejected' && (
                                        <table className={styles.dataTable}>
                                            <thead>
                                                <tr>
                                                    <th>MSME ID</th>
                                                    <th>Best Viable Scheme</th>
                                                    <th>Rejection Reason</th>
                                                    <th style={{ textAlign: 'center' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {!results.non_selected || results.non_selected.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4">
                                                            <div className={styles.emptyState}>
                                                                <CheckSquare className={styles.emptyIcon} color="#10b981" />
                                                                <h2 className={styles.emptyTitle}>100% Allocation Success</h2>
                                                                <p className={styles.emptyDesc}>All available MSMEs received scheme funding within the budget.</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    results.non_selected.map((ns, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                <div className={styles.msmeId} style={{ color: '#475569' }}>{ns.MSME_ID}</div>
                                                            </td>
                                                            <td>
                                                                <div className={styles.schemeName} style={{ color: '#64748b' }}>{ns.Target_Scheme}</div>
                                                            </td>
                                                            <td>
                                                                <span className={styles.scoreBox} style={{ color: '#0f172a', fontWeight: '500' }}>
                                                                    {ns.Reason}
                                                                </span>
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                <span className={styles.statusFail}>
                                                                    <XOctagon size={16} strokeWidth={2.5} />
                                                                    REJECTED
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* SECTOR TAB */}
                                    {activeTab === 'sectors' && (
                                        <div className={styles.sectorGrid}>
                                            {!results.sector_summary || results.sector_summary.length === 0 ? (
                                                <div className={styles.emptyState} style={{ gridColumn: '1 / -1' }}>
                                                    <AlertCircle className={styles.emptyIcon} />
                                                    <h2 className={styles.emptyTitle}>No Sector Data</h2>
                                                    <p className={styles.emptyDesc}>No allocations were made, so there is no sector data to summarize.</p>
                                                </div>
                                            ) : (
                                                results.sector_summary.map((sector, idx) => (
                                                    <div key={idx} className={styles.sectorCard}>
                                                        <div className={styles.sectorName}>
                                                            {sector.Sector}
                                                            <PieChart size={20} color="#3b82f6" opacity={0.5} />
                                                        </div>
                                                        <div className={styles.sectorStatRow}>
                                                            <span className={styles.sectorStatLabel}>MSMEs Approved</span>
                                                            <span className={styles.sectorStatValue} style={{ color: '#2563eb' }}>{sector.MSMEs_Funded}</span>
                                                        </div>
                                                        <div className={styles.sectorStatRow}>
                                                            <span className={styles.sectorStatLabel}>Jobs Initiated</span>
                                                            <span className={styles.sectorStatValue} style={{ color: '#db2777' }}>{sector.Jobs_Created}</span>
                                                        </div>
                                                        <div className={styles.sectorStatRow} style={{ borderTop: '1px solid #e2e8f0', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
                                                            <span className={styles.sectorStatLabel}>Budget Spent</span>
                                                            <span className={styles.sectorStatValue} style={{ color: '#059669', fontSize: '1rem' }}>₹{sector.Budget_Allocated.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>

                        ) : (
                            <div className={styles.emptyState}>
                                <LayoutDashboard className={styles.emptyIcon} />
                                <h2 className={styles.emptyTitle}>Ready to Simulate</h2>
                                <p className={styles.emptyDesc}>
                                    Configure your policy weights and funding budget on the left sidebar, then run the simulation to instantly allocate subsidies to valid MSMEs over the entire dataset.
                                </p>
                            </div>
                        )}

                    </main>

                </div>
            </div>
        </div>
    );
};

export default OptimizationDashboard;
