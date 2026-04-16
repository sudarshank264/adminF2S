import React, { useState, useEffect } from 'react';

const LeadsManager = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const leadsRes = await fetch(`${API_URL}/api/contact`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (leadsRes.ok) {
        const leads = await leadsRes.json();
        setLeadsData(leads);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this client lead?")) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/contact/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        setLeadsData(prev => prev.filter(lead => lead._id !== id));
      } else {
        alert("Failed to securely delete data. Check permissions.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="cms-manager">
      <div className="cms-header">
        <h3>Client Leads Manager</h3>
        <p style={{ color: 'var(--grey)' }}>Total Leads: {leadsData.length}</p>
      </div>

      <div className="ad-table-wrapper">
        {loading ? (
          <div className="ad-loader">Loading leads...</div>
        ) : (
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
                <tr key={lead._id || lead.id}>
                  <td style={{ color: 'var(--black)' }}>{formatDate(lead.createdAt || lead.date)}</td>
                  <td style={{ fontWeight: 600, color: 'var(--black)' }}>{lead.fullName || lead.name}</td>
                  <td><a href={`mailto:${lead.email}`} style={{ color: 'var(--black)' }}>{lead.email}</a></td>
                  <td style={{ color: 'var(--black)' }}>{lead.phone}</td>
                  <td><span className="ad-tag">{lead.serviceNeeded || lead.service}</span></td>
                  <td style={{ color: 'var(--black)' }}>{lead.destination || lead.destinationCountry || '-'}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteLead(lead._id || lead.id)}
                      className="action-btn delete-btn icon-only"
                      title="Delete Lead"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--grey)' }}>
                    No leads submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LeadsManager;
