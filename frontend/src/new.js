import axios from 'axios';
import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]); // Filtered list ke liye state
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, message: '', type: 'info' });
  const [form, setForm] = useState({ title: '', description: '', category: 'mern', image: '', link: '' });
  const [editId, setEditId] = useState(null);
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' });

  // Projects fetch karne ka function
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/projects`);
      if (res.data) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error("Database connection offline.", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter update jab projects ya filter badle
  useEffect(() => {
    if (filter === 'all') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(p => p.category === filter));
    }
  }, [filter, projects]);

  const triggerAlert = (message, type = 'info') => {
    setAlertConfig({ visible: true, message, type });
    setTimeout(() => setAlertConfig({ visible: false, message: '', type: 'info' }), 4000);
  };

  const handleAdminAuthSubmit = (e) => {
    e.preventDefault();
    if (enteredPassword === import.meta.env.VITE_ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      setShowLoginModal(false);
      setEnteredPassword('');
      triggerAlert("Access Granted!", "success");
    } else {
      triggerAlert("Authentication Failed!", "danger");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: { 'admin-password': import.meta.env.VITE_ADMIN_PASSWORD } };
    try {
      if (editId) {
        await axios.put(`${API_URL}/api/projects/${editId}`, form, config);
        triggerAlert("Project Updated!", "success");
      } else {
        await axios.post(`${API_URL}/api/projects`, form, config);
        triggerAlert("Project Added!", "success");
      }
      setForm({ title: '', description: '', category: 'mern', image: '', link: '' });
      setEditId(null);
      fetchProjects();
    } catch (err) {
      triggerAlert("Action Failed!", "danger");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this project?")) {
      try {
        await axios.delete(`${API_URL}/api/projects/${id}`, { headers: { 'admin-password': import.meta.env.VITE_ADMIN_PASSWORD } });
        triggerAlert("Project Deleted!", "info");
        fetchProjects();
      } catch (err) {
        triggerAlert("Delete Failed!", "danger");
      }
    }
  };

  // Theme object
  const theme = {
    bodyBg: darkMode ? '#121214' : '#f4f4f5',
    textMain: darkMode ? '#ffffff' : '#111215',
    textMuted: darkMode ? '#cbd5e1' : '#52525b',
    cardBg: darkMode ? '#1e1f22' : '#ffffff',
    border: darkMode ? '#334155' : '#e4e4e7',
    inputBg: darkMode ? '#272930' : '#ffffff'
  };

  return (
    <div style={{ backgroundColor: theme.bodyBg, color: theme.textMain, minHeight: '100vh', transition: '0.3s' }}>
      {/* ... [Yaha apna Header aur Navigation code rakhein] ... */}

      {/* Projects Section */}
      <section id="projects" style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ marginBottom: '30px', color: theme.textMain }}>My Projects</h2>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          {['all', 'mern', 'gaming', 'tools', 'frontend'].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{ padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', background: filter === cat ? '#2563eb' : theme.cardBg, color: filter === cat ? '#fff' : theme.textMain, border: `1px solid ${theme.border}` }}>
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '50px', color: theme.textMuted }}>Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div style={{ padding: '40px', color: theme.textMuted }}>No projects found.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px', width: '100%' }}>
            {filteredProjects.map(project => (
              <div key={project._id} style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '20px' }}>
                <img src={project.image} alt={project.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                <h3 style={{ margin: '15px 0' }}>{project.title}</h3>
                <p style={{ color: theme.textMuted, fontSize: '0.9rem' }}>{project.description}</p>
                <a href={project.link} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Execute Engine</a>
                {isAdmin && (
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <button onClick={() => { setEditId(project._id); setForm(project); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>
                    <button onClick={() => handleDelete(project._id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ... [Baaki ka section contact aur footer] ... */}
    </div>
  );
}

export default App;
