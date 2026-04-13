import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

import BlogsManager from '../components/BlogsManager';
import ReviewsManager from '../components/ReviewsManager';
import LeadsManager from '../components/LeadsManager';
import ServicesManager from '../components/ServicesManager';
import ContentManager from '../components/ContentManager';

const visitorsData = [
  { name: 'Jan', visitors: 4000 },
  { name: 'Feb', visitors: 3000 },
  { name: 'Mar', visitors: 5000 },
  { name: 'Apr', visitors: 4500 },
  { name: 'May', visitors: 6000 },
  { name: 'Jun', visitors: 8500 },
];

const countryData = [
  { name: 'USA', count: 45 },
  { name: 'UK', count: 30 },
  { name: 'Canada', count: 20 },
  { name: 'Australia', count: 15 },
];

const categoryData = [
  { name: 'Visa Support', count: 45 },
  { name: 'Admissions', count: 30 },
  { name: 'Consulting', count: 20 },
  { name: 'General', count: 15 },
];

const COLORS = ['#d90429', '#111111', '#64748b', '#cbd5e1'];

const AdminDashboard = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const navigate = useNavigate();
  // Valid tabs: 'dashboard', 'leads', 'blogs', 'reviews', 'services', 'content'
  const [activeTab, setActiveTab] = useState('dashboard');

  // High-level dashboard stats
  const [stats, setStats] = useState({
    leadsCount: 0,
    blogsCount: 0,
    reviewsCount: 0,
    servicesCount: 0
  });

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
          leadsCount = Array.isArray(data) ? data.length : 0;
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

  return (
    <div className="admin-dashboard">
      {/* Sidebar Navigation */}
      <aside className="ad-sidebar">
        <div className="ad-logo">
          ✈️ <span>F2S</span> Admin
        </div>

        <nav className="ad-nav">
          <button className={`ad-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            📊 Dashboard
          </button>
          <button className={`ad-nav-btn ${activeTab === 'leads' ? 'active' : ''}`} onClick={() => setActiveTab('leads')}>
            📥 Client Leads <span className="ad-badge">{stats.leadsCount}</span>
          </button>
          <button className={`ad-nav-btn ${activeTab === 'blogs' ? 'active' : ''}`} onClick={() => setActiveTab('blogs')}>
            📰 Manage Blogs
          </button>
          <button className={`ad-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
            ⭐ Manage Reviews
          </button>
          <button className={`ad-nav-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
            🛠 Manage Services
          </button>
          <button className={`ad-nav-btn ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>
            ⚙️ Website Content
          </button>
        </nav>

        <div className="ad-sidebar-footer">
          <div className="ad-user">
            <div className="ad-avatar">A</div>
            <span>{localStorage.getItem('adminName') || 'Administrator'}</span>
          </div>
          <button className="ad-logout" onClick={handleLogout}>Log Out</button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="ad-main">
        <header className="ad-header">
          <h1>
            {activeTab === 'dashboard' ? 'Admin Dashboard' :
              activeTab === 'leads' ? 'Client Leads Overview' :
                activeTab === 'blogs' ? 'Blog Management' :
                  activeTab === 'reviews' ? 'Review Testimonials' :
                    activeTab === 'services' ? 'Services Offered' :
                      'Website Content Edit'}
          </h1>
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
                      <h3>Web Visitors Overview</h3>
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
