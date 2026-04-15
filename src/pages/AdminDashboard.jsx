import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

import BlogsManager from '../components/BlogsManager';
import ReviewsManager from '../components/ReviewsManager';
import LeadsManager from '../components/LeadsManager';
import ServicesManager from '../components/ServicesManager';
import ContentManager from '../components/ContentManager';
import CountriesManager from '../components/CountriesManager';

const COLORS = ['#d90429', '#111111', '#64748b', '#cbd5e1', '#f59e0b', '#3b82f6'];

const AdminDashboard = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const navigate = useNavigate();
  // Valid tabs: 'dashboard', 'leads', 'blogs', 'reviews', 'services', 'content'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // High-level dashboard stats
  const [stats, setStats] = useState({
    leadsCount: 0,
    blogsCount: 0,
    reviewsCount: 0,
    servicesCount: 0
  });

  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authentication check & Fetching overview stats only
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/', { replace: true });
      return;
    }

    const fetchOverviewStats = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch leads overview
        const leadsRes = await fetch(`${API_URL}/api/contact`, { headers });
        if (leadsRes.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/', { replace: true });
          return;
        }

        let leadsCount = 0, blogsCount = 0, reviewsCount = 0, servicesCount = 0;

        if (leadsRes.ok) {
          const data = await leadsRes.json();
          const validData = Array.isArray(data) ? data : [];
          setLeadsData(validData);
          leadsCount = validData.length;
        }

        try {
          const blogsRes = await fetch(`${API_URL}/api/blogs`, { headers });
          if (blogsRes.ok) {
            const data = await blogsRes.json();
            blogsCount = Array.isArray(data) ? data.length : 0;
          }
        } catch (err) { }

        try {
          const reviewsRes = await fetch(`${API_URL}/api/reviews`, { headers });
          if (reviewsRes.ok) {
            const data = await reviewsRes.json();
            reviewsCount = Array.isArray(data) ? data.length : 0;
          }
        } catch (err) { }

        try {
          const servicesRes = await fetch(`${API_URL}/api/services`, { headers });
          if (servicesRes.ok) {
            const data = await servicesRes.json();
            servicesCount = Array.isArray(data) ? data.length : 0;
          }
        } catch (err) { }

        setStats({ leadsCount, blogsCount, reviewsCount, servicesCount });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    navigate('/', { replace: true });
  };

  const closeSidebarMobile = () => {
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

  // ─── AGGREGATE CHART DATA ──────────────────────────────────────────────

  // 1. Leads Over Time (Group by Month)
  const aggregatedVisitors = leadsData.reduce((acc, lead) => {
    const d = lead.createdAt ? new Date(lead.createdAt) : new Date();
    const month = d.toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  // Default months if empty
  const defaultMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  let visitorsData = Object.keys(aggregatedVisitors).map(key => ({
    name: key,
    visitors: aggregatedVisitors[key]
  }));

  if (visitorsData.length === 0) {
    visitorsData = defaultMonths.map(m => ({ name: m, visitors: 0 }));
  } else {
    // Sort chronologically (simple heuristic since we only have months)
    const monthOrder = { 'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12 };
    visitorsData.sort((a, b) => (monthOrder[a.name] || 0) - (monthOrder[b.name] || 0));
  }

  // 2. Registrations by Country
  const aggregatedCountry = leadsData.reduce((acc, lead) => {
    const country = lead.destinationCountry || 'Unspecified';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  let countryData = Object.keys(aggregatedCountry).map(key => ({
    name: key,
    count: aggregatedCountry[key]
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  if (countryData.length === 0) {
    countryData = [{ name: 'No Data', count: 1 }];
  }

  // 3. Leads by Category
  const aggregatedCategory = leadsData.reduce((acc, lead) => {
    const category = lead.serviceNeeded || 'General';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  let categoryData = Object.keys(aggregatedCategory).map(key => ({
    name: key,
    count: aggregatedCategory[key]
  })).sort((a, b) => b.count - a.count);

  if (categoryData.length === 0) {
    categoryData = [{ name: 'No Data', count: 0 }];
  }

  return (
    <div className="admin-dashboard">
      {/* Mobile Overlay */}
      {isSidebarOpen && <div className="ad-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Sidebar Navigation */}
      <aside className={`ad-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="ad-logo">
          ✈️ <span>F2S</span> Admin
          <button className="ad-close-btn" onClick={() => setIsSidebarOpen(false)}>✕</button>
        </div>

        <nav className="ad-nav">
          <button className={`ad-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); closeSidebarMobile(); }}>
            📊 Dashboard
          </button>
          <button className={`ad-nav-btn ${activeTab === 'leads' ? 'active' : ''}`} onClick={() => { setActiveTab('leads'); closeSidebarMobile(); }}>
            📥 Client Leads <span className="ad-badge">{stats.leadsCount}</span>
          </button>
          <button className={`ad-nav-btn ${activeTab === 'blogs' ? 'active' : ''}`} onClick={() => { setActiveTab('blogs'); closeSidebarMobile(); }}>
            📰 Manage Blogs
          </button>
          <button className={`ad-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => { setActiveTab('reviews'); closeSidebarMobile(); }}>
            ⭐ Manage Reviews
          </button>
          <button className={`ad-nav-btn ${activeTab === 'countries' ? 'active' : ''}`} onClick={() => { setActiveTab('countries'); closeSidebarMobile(); }}>
            🗺️ Manage Countries
          </button>
          <button className={`ad-nav-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => { setActiveTab('services'); closeSidebarMobile(); }}>
            🛠 Manage Services
          </button>
          <button className={`ad-nav-btn ${activeTab === 'content' ? 'active' : ''}`} onClick={() => { setActiveTab('content'); closeSidebarMobile(); }}>
            ⚙️ Website Content
          </button>
        </nav>

        <div className="ad-sidebar-footer">
          <div className="ad-user">
            <div className="ad-avatar">A</div>
            <span>{localStorage.getItem('adminName') || 'Administrator'}</span>
          </div>
          <button className="ad-logout-premium" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="ad-main">
        <header className="ad-header">
          <div className="ad-header-title">
            <button className="ad-menu-toggle" onClick={() => setIsSidebarOpen(true)}>
              <svg fill="currentColor" viewBox="0 0 24 24" width="28" height="28">
                <path d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z"></path>
              </svg>
            </button>
            <h1>
              {activeTab === 'dashboard' ? 'Admin Dashboard' :
                activeTab === 'leads' ? 'Client Leads Overview' :
                  activeTab === 'blogs' ? 'Blog Management' :
                    activeTab === 'reviews' ? 'Review Testimonials' :
                      activeTab === 'countries' ? 'Country Visa Guides' :
                        activeTab === 'services' ? 'Services Offered' :
                          'Website Content Edit'}
            </h1>
          </div>
          <p className="ad-subtitle">Welcome back to the unified control center.</p>
        </header>

        <div className="ad-content-area">
          {loading && activeTab === 'dashboard' ? (
            <div className="ad-loader">Securely fetching database...</div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <div className="ad-dashboard-view">
                  <div className="ad-dashboard-grid">
                    <div className="ad-stat-card">
                      <h4>TOTAL BLOGS</h4>
                      <div className="stat-value">{stats.blogsCount}</div>
                      <div className="stat-change positive">Available articles</div>
                    </div>
                    <div className="ad-stat-card">
                      <h4>TOTAL SERVICES</h4>
                      <div className="stat-value">{stats.servicesCount}</div>
                      <div className="stat-change positive">Available services</div>
                    </div>
                    <div className="ad-stat-card">
                      <h4>TOTAL LEADS</h4>
                      <div className="stat-value">{stats.leadsCount}</div>
                      <div className="stat-change positive">Client submissions</div>
                    </div>
                    <div className="ad-stat-card">
                      <h4>TOTAL REVIEWS</h4>
                      <div className="stat-value">{stats.reviewsCount}</div>
                      <div className="stat-change positive">Client testimonials</div>
                    </div>
                  </div>

                  <div className="ad-charts-grid">
                    <div className="ad-chart-card">
                      <h3>Leads Over Time</h3>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <AreaChart data={visitorsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d90429" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#d90429" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="visitors" stroke="#d90429" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="ad-chart-card">
                      <h3>Registrations by Country</h3>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={countryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="count"
                            >
                              {countryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="ad-chart-card ad-chart-card-full">
                      <h3>Leads by Category</h3>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="count" fill="#111111" radius={[4, 4, 0, 0]} maxBarSize={60} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'leads' && <LeadsManager />}
              {activeTab === 'blogs' && <BlogsManager />}
              {activeTab === 'reviews' && <ReviewsManager />}
              {activeTab === 'countries' && <CountriesManager />}
              {activeTab === 'services' && <ServicesManager />}
              {activeTab === 'content' && <ContentManager />}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
