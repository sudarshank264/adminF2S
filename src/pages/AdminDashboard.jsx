import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('leads'); // leads | blogs | reviews
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
          <h1>{activeTab === 'leads' ? 'Client Leads Overview' : activeTab === 'blogs' ? 'Blog Management' : 'Client Reviews Content'}</h1>
          <p className="ad-subtitle">Welcome back. Here is your latest data payload.</p>
        </header>

        <div className="ad-content-area">
          {loading ? (
            <div className="ad-loader">Securely fetching database...</div>
          ) : (
            <>
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
