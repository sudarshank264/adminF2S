import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

const revenueData = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 4500 },
  { name: 'May', revenue: 6000 },
  { name: 'Jun', revenue: 8500 },
];

const serviceData = [
  { name: 'Visa Support', count: 45 },
  { name: 'Admissions', count: 30 },
  { name: 'Consulting', count: 20 },
  { name: 'General', count: 15 },
];

const COLORS = ['#d90429', '#111111', '#64748b', '#cbd5e1'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | leads | blogs | reviews
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authentication check & Fetching
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/', { replace: true });
      return;
    }

    // Fetch Leads if authorized
    const fetchLeads = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/contact', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('adminToken');
          navigate('/', { replace: true });
          return;
        }

        const data = await response.json();
        setLeadsData(data);
      } catch (err) {
        console.error('Error fetching leads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [navigate]);

  const handleDeleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this client lead?")) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5001/api/contact/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        // Optimistically remove from UI
        setLeadsData(prev => prev.filter(lead => lead._id !== id));
      } else {
        alert("Failed to securely delete data. Check permissions.");
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    navigate('/', { replace: true });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
            📥 Client Leads <span className="ad-badge">{leadsData.length}</span>
          </button>
          <button className={`ad-nav-btn ${activeTab === 'blogs' ? 'active' : ''}`} onClick={() => setActiveTab('blogs')}>
            📰 Manage Blogs
          </button>
          <button className={`ad-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
            ⭐ Manage Reviews
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
          <h1>{activeTab === 'dashboard' ? 'Admin Dashboard' : activeTab === 'leads' ? 'Client Leads Overview' : activeTab === 'blogs' ? 'Blog Management' : 'Client Reviews Content'}</h1>
          <p className="ad-subtitle">Welcome back. Here is your latest data payload.</p>
        </header>

        <div className="ad-content-area">
          {loading ? (
            <div className="ad-loader">Securely fetching database...</div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <div className="ad-dashboard-view">
                  <div className="ad-dashboard-grid">
                    <div className="ad-stat-card">
                      <h4>Total Revenue</h4>
                      <div className="stat-value">$124,500</div>
                      <div className="stat-change positive">+14.5% vs last month</div>
                    </div>
                    <div className="ad-stat-card">
                      <h4>Active Users</h4>
                      <div className="stat-value">2,845</div>
                      <div className="stat-change positive">+5.2% vs last month</div>
                    </div>
                    <div className="ad-stat-card">
                      <h4>Total Leads</h4>
                      <div className="stat-value">{leadsData.length > 0 ? leadsData.length : 156}</div>
                      <div className="stat-change positive">+22.4% vs last month</div>
                    </div>
                    <div className="ad-stat-card">
                      <h4>Conversion Rate</h4>
                      <div className="stat-value">12.8%</div>
                      <div className="stat-change negative">-1.2% vs last month</div>
                    </div>
                  </div>

                  <div className="ad-charts-grid">
                    <div className="ad-chart-card">
                      <h3>Revenue Growth</h3>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d90429" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#d90429" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#d90429" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="ad-chart-card">
                      <h3>Service Requests</h3>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={serviceData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="count"
                            >
                              {serviceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="ad-chart-card ad-chart-card-full">
                      <h3>Leads by Category</h3>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <BarChart data={serviceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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

              {activeTab === 'leads' && (
                <div className="ad-table-wrapper">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Client Name</th>
                        <th>Contact Email</th>
                        <th>Phone</th>
                        <th>Service Target</th>
                        <th>Destination</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leadsData.map((lead) => (
                        <tr key={lead._id}>
                          <td style={{ color: 'var(--black)' }}>{formatDate(lead.createdAt)}</td>
                          <td style={{ fontWeight: 600, color: 'var(--black)' }}>{lead.fullName}</td>
                          <td><a href={`mailto:${lead.email}`} style={{ color: 'var(--black)' }}>{lead.email}</a></td>
                          <td style={{ color: 'var(--black)' }}>{lead.phone}</td>
                          <td><span className="ad-tag">{lead.serviceNeeded}</span></td>
                          <td style={{ color: 'var(--black)' }}>{lead.destinationCountry || '-'}</td>
                          <td>
                            <button 
                              onClick={() => handleDeleteLead(lead._id)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              title="Delete Lead"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {leadsData.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--grey)'}}>
                            No leads submitted yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'blogs' && (
                <div className="ad-placeholder">
                  <h3>Blog CMS System</h3>
                  <p>In our next phase, we will add the rich-text editor here to let you publish dynamic blog articles!</p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="ad-placeholder">
                  <h3>Reviews Video Manager</h3>
                  <p>Here you will be able to paste youtube/video links to dynamically update the public Reviews wall!</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
