import axios from 'axios';
import React, { useState, useEffect } from 'react';


const MASTER_PWD = import.meta.env.VITE_ADMIN_PASSWORD;
const API_URL = import.meta.env.VITE_API_URL;

function App() {
  // .env se variables load karein

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => {
    // Page load hote hi ye check karega
    const savedAdmin = localStorage.getItem('isAdmin');
    return savedAdmin === 'true';
  });


  // Custom Login Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');

  // Theme State (Default: Light Mode)
  const [darkMode, setDarkMode] = useState(false);

  // Custom Alert System State
  const [alertConfig, setAlertConfig] = useState({ visible: false, message: '', type: 'info' });

  // Admin Form State
  const [form, setForm] = useState({ title: '', description: '', category: 'mern', image: '', link: '' });
  const [editId, setEditId] = useState(null);

  // User Contact Form State
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' });

  // Trigger Custom Smooth Toast
  const triggerAlert = (message, type = 'info') => {
    setAlertConfig({ visible: true, message, type });
    setTimeout(() => {
      setAlertConfig({ visible: false, message: '', type: 'info' });
    }, 4000);
  };

  const fetchProjects = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API_URL}/api/projects`);

      if (res.data) {
        setProjects(res.data);
      }
    } catch (err) {
      console.log("Database connection offline.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Admin Verification Engine
  const handleAdminAuthSubmit = (e) => {
    e.preventDefault();

    // Vite Meta Check
    const MASTER_PWD = import.meta.env.VITE_ADMIN_PASSWORD;

    if (enteredPassword === MASTER_PWD) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true'); // <--- Ye line add karein
      setShowLoginModal(false);
      setEnteredPassword('');
      triggerAlert("Access Granted! Welcome Admin.", "success");
    }
    else {
      triggerAlert("Authentication Failed! Wrong Password.", "danger");
    }
  };

  const handleLoginClick = () => {
    if (isAdmin) {
      setIsAdmin(false);
      localStorage.removeItem('isAdmin'); // <--- Ye line add karein
      triggerAlert("Logged out from admin control.", "info");
      return;
    }
    setShowLoginModal(true);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const MASTER_PWD = import.meta.env.VITE_ADMIN_PASSWORD;
    const config = { headers: { 'admin-password': MASTER_PWD } };

    try {
      if (editId) {
        // ✅ EDIT: Ensure editId properly pass ho raha hai
        await axios.put(`${API_URL}/api/projects/${editId}`, form, config);
        triggerAlert("Project Updated Successfully!", "success");
      } else {
        // ✅ ADD:
        await axios.post(`${API_URL}/api/projects`, form, config);
        triggerAlert("Project Added Successfully!", "success");
      }
      setForm({ title: '', description: '', category: 'mern', image: '', link: '' });
      setEditId(null);
      fetchProjects();
    } catch (err) {
      triggerAlert("Action Failed: " + (err.response?.data?.message || "Check Console"), "danger");
    }
  };


  const handleDelete = async (id) => {
    if (window.confirm("Delete this project?")) {
      const MASTER_PWD = import.meta.env.VITE_ADMIN_PASSWORD;
      try {
        // ✅ DELETE: Header saath mein bhej rahe hain
        await axios.delete(`${API_URL}/api/projects/${id}`, {
          headers: { 'admin-password': MASTER_PWD }
        });
        triggerAlert("Project Deleted!", "info");
        fetchProjects();
      } catch (err) {
        triggerAlert("Delete Failed: " + (err.response?.data?.message || "Unauthorized"), "danger");
      }
    }
  };


  const handleEditSelect = (proj) => {
    setEditId(proj._id);
    setForm({ title: proj.title, description: proj.description, category: proj.category, image: proj.image, link: proj.link });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm({ title: '', description: '', category: 'mern', image: '', link: '' });
    triggerAlert("Edit operation rolled back.", "info");
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();

    const subject = encodeURIComponent(`New Portfolio Message from ${contactData.name}`);
    const body = encodeURIComponent(
      `Name: ${contactData.name}\n` +
      `Email: ${contactData.email}\n\n` +
      `Message:\n${contactData.message}`
    );

    triggerAlert("Redirecting to email application client...", "info");
    setTimeout(() => {
      window.location.href = `mailto:surajpatel2026@zohomail.in?subject=${subject}&body=${body}`;
      setContactData({ name: '', email: '', message: '' });
    }, 1200);
  };

  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.category === filter);

  const theme = {
    bodyBg: darkMode ? '#121214' : '#f4f4f5',
    textMain: darkMode ? '#ffffff' : '#111215',
    textMuted: darkMode ? '#cbd5e1' : '#52525b',
    cardBg: darkMode ? '#1e1f22' : '#ffffff',
    border: darkMode ? '#334155' : '#e4e4e7',
    navBg: darkMode ? '#1a1b1e' : '#ffffff',
    navBorder: darkMode ? '#2d3139' : '#e4e4e7',
    inputBg: darkMode ? '#272930' : '#ffffff',
    adminBoxBg: darkMode ? 'rgba(30, 31, 34, 0.85)' : 'rgba(255, 255, 255, 0.9)',
    adminBoxShadow: darkMode ? '0 20px 40px rgba(0,0,0,0.5)' : '0 20px 40px rgba(37, 99, 235, 0.08)',
    modalOverlay: darkMode ? 'rgba(0,0,0,0.75)' : 'rgba(15, 23, 42, 0.6)'
  };

  return (
    <div style={{ backgroundColor: theme.bodyBg, color: theme.textMain, transition: 'all 0.3s ease', minHeight: '100vh' }}>

      <style>{`
        nav {
          background: ${theme.navBg};
          border-bottom: 1px solid ${theme.navBorder};
          padding: 15px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1000;
          transition: all 0.3s ease;
        }
        nav .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: ${theme.textMain};
          letter-spacing: 0.5px;
        }
        nav .logo span {
          color: #2563eb;
        }
        nav ul {
          display: flex;
          align-items: center;
          gap: 25px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        nav ul li a {
          color: ${theme.textMuted};
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: color 0.2s;
        }
        nav ul li a:hover {
          color: ${theme.textMain};
        }
        .nav-controls-right {
          display: none;
        }
        .theme-toggle-btn {
          background: none;
          border: none;
          color: ${darkMode ? '#fbbf24' : '#ea580c'};
          font-size: 1.25rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          transition: transform 0.2s ease;
        }
        .theme-toggle-btn:hover {
          transform: scale(1.15);
        }
        .desktop-theme-wrapper {
          display: block;
        }
        .footer-social-icon:hover {
          background: #2563eb !important;
        }
     
        .custom-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: ${theme.modalOverlay};
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          z-index: 999999;
          animation: fadeIn 0.25s ease;
        }
        .custom-modal-card {
          background: ${theme.cardBg};
          border: 1px solid ${theme.border};
          box-shadow: ${theme.adminBoxShadow};
          width: 90%; max-width: 420px;
          border-radius: 14px; padding: 28px;
          position: relative;
          animation: modalScaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes modalScaleUp { from { transform: scale(0.9) translateY(10px); opacity:0; } to { transform: scale(1) translateY(0); opacity:1; } }

        .admin-premium-card {
          max-width: 680px;
          margin: 40px auto;
          background: ${theme.adminBoxBg};
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 35px;
          border-radius: 16px;
          border: 1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(37, 99, 235, 0.15)'};
          box-shadow: ${theme.adminBoxShadow};
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .admin-form-group {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }
        .admin-form-group label {
          font-size: 0.88rem;
          font-weight: 600;
          color: ${theme.textMain};
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 0.3px;
        }
        .admin-form-group label i {
          color: #2563eb;
          font-size: 0.95rem;
        }
        .admin-field-wrapper {
          position: relative;
          width: 100%;
        }
        .admin-field-wrapper i {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 1rem;
          pointer-events: none;
          transition: color 0.2s ease;
        }
        .admin-field-wrapper textarea + i {
          top: 22px;
          transform: none;
        }
        .admin-input-element {
          width: 100%;
          padding: 13px 16px 13px 42px;
          box-sizing: border-box;
          background: ${theme.inputBg};
          color: ${theme.textMain};
          border: 1px solid ${theme.border};
          border-radius: 8px;
          font-size: 0.95rem;
          font-family: inherit;
          outline: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .admin-input-element:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
        }
        .admin-input-element:focus + i {
          color: #2563eb;
        }
        .admin-action-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 10px;
        }
        .admin-submit-btn {
          flex: 2;
          padding: 14px;
          background: #2563eb;
          color: #ffffff;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
          transition: all 0.2s ease;
        }
        .admin-submit-btn:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3);
        }
        .admin-cancel-btn {
          flex: 1;
          padding: 14px;
          background: ${darkMode ? '#334155' : '#e4e4e7'};
          color: ${theme.textMain};
          font-weight: 600;
          font-size: 1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .admin-cancel-btn:hover {
          background: ${darkMode ? '#475569' : '#d4d4d8'};
        }

        .toast-container {
          position: fixed;
          top: 25px;
          right: 25px;
          z-index: 9999999;
          animation: slideInCustom 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 24px;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          color: white;
          font-weight: 500;
          font-size: 0.95rem;
          min-width: 280px;
        }
        .toast-success { background: #10b981; border-left: 5px solid #047857; }
        .toast-danger { background: #ef4444; border-left: 5px solid #b91c1c; }
        .toast-info { background: #2563eb; border-left: 5px solid #1d4ed8; }

        ::placeholder {
          color: #94a3b8 !important;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .nav-controls-right {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .desktop-theme-wrapper {
            display: none;
          }
          nav ul {
            display: ${menuOpen ? 'flex' : 'none'};
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: ${theme.navBg};
            border-bottom: 1px solid ${theme.navBorder};
            padding: 20px;
            gap: 15px;
            box-sizing: border-box;
          }
          .admin-premium-card {
            margin: 20px 15px;
            padding: 22px;
          }
          .admin-action-row {
            flex-direction: column-reverse;
          }
          .admin-submit-btn, .admin-cancel-btn {
            width: 100%;
          }
        }
          .skeleton-card{
  background: ${theme.cardBg};
  border:1px solid ${theme.border};
  border-radius:12px;
  overflow:hidden;
}

.skeleton-image{
  width:100%;
  height:200px;
  background:linear-gradient(
      90deg,
      #e5e7eb 25%,
      #f3f4f6 50%,
      #e5e7eb 75%
  );
  background-size:400% 100%;
  animation: shimmer 1.2s infinite;
}

.skeleton-line{
  height:15px;
  margin:12px 20px;
  border-radius:5px;
  background:linear-gradient(
      90deg,
      #e5e7eb 25%,
      #f3f4f6 50%,
      #e5e7eb 75%
  );
  background-size:400% 100%;
  animation: shimmer 1.2s infinite;
}

.skeleton-line.short{
  width:50%;
}

.skeleton-line.medium{
  width:80%;
}

@keyframes shimmer{
  0%{
      background-position:100% 0;
  }
  100%{
      background-position:-100% 0;
  }
}
      `}</style>

      {/* Dynamic Toast Layer */}
      {alertConfig.visible && (
        <div className={`toast-container toast-${alertConfig.type}`}>
          <i className={
            alertConfig.type === 'success' ? "fas fa-check-circle" :
              alertConfig.type === 'danger' ? "fas fa-exclamation-triangle" : "fas fa-info-circle"
          } style={{ fontSize: '1.2rem' }}></i>
          <span>{alertConfig.message}</span>
        </div>
      )}

      {/* Custom Admin Password Modal */}
      {showLoginModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card">
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fas fa-lock" style={{ color: '#2563eb' }}></i> Security Gateway
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: theme.textMuted }}>Please enter your master password to unlock administration configuration metrics node.</p>

            <form onSubmit={handleAdminAuthSubmit}>
              <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                <div className="admin-field-wrapper">
                  <input
                    type="password"
                    placeholder="Enter Admin Password"
                    className="admin-input-element"
                    value={enteredPassword}
                    onChange={e => setEnteredPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  <i className="fas fa-key"></i>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="admin-cancel-btn"
                  style={{ padding: '10px 18px', fontSize: '0.9rem' }}
                  onClick={() => { setShowLoginModal(false); setEnteredPassword(''); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-submit-btn"
                  style={{ padding: '10px 22px', fontSize: '0.9rem', flex: 'none' }}
                >
                  Verify Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <nav>
        <div className="logo">
          <img
            src="https://i.ibb.co/G4GDhTSr/20260616-092702.png"
            alt="Suraj Patel"
            style={{ height: '40px', width: 'auto', display: 'block' }}
          />uraj<span>Patel</span>


        </div>

        <div className="nav-controls-right">
          <button
            className="theme-toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <i className={darkMode ? "fas fa-sun" : "fas fa-moon"}></i>
          </button>
          <div className="menu-toggle" style={{ color: theme.textMain }} onClick={() => setMenuOpen(!menuOpen)}>☰</div>
        </div>

        <ul>
          <li><a href="#home" onClick={() => setMenuOpen(false)}>Home</a></li>
          <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
          <li><a href="#skills" onClick={() => setMenuOpen(false)}>Skills</a></li>
          <li><a href="#projects" onClick={() => setMenuOpen(false)}>Projects</a></li>
          <li><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></li>

          <li className="desktop-theme-wrapper">
            <button
              className="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <i className={darkMode ? "fas fa-sun" : "fas fa-moon"}></i>
            </button>
          </li>

          <li>
            <button
              onClick={handleLoginClick}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                border: isAdmin ? '1px solid #ef4444' : '1px solid #2563eb',
                background: isAdmin ? '#ef4444' : 'transparent',
                color: isAdmin ? '#ffffff' : (darkMode ? '#ffffff' : '#2563eb'),
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
            >
              <i className={isAdmin ? "fas fa-sign-out-alt" : "fas fa-user-shield"} style={{ marginRight: '6px' }}></i>
              {isAdmin ? "Logout" : "Admin Login"}
            </button>
          </li>
        </ul>
      </nav>


      {/* Admin Management Panel */}
      {isAdmin && (
        <div className="admin-premium-card">
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <span style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Database Master Control
            </span>
            <h2 style={{ color: theme.textMain, fontSize: '1.75rem', fontWeight: '700', marginTop: '10px', marginBottom: '5px' }}>
              {editId ? "✏️ Revise Project Stack" : "➕ Deploy New Project"}
            </h2>
            <p style={{ color: theme.textMuted, fontSize: '0.9rem', margin: '0' }}>Fill in the parameters below to update live portfolio cards node dynamically.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div className="admin-form-group">
              <label><i className="fas fa-heading"></i> Project Title</label>
              <div className="admin-field-wrapper">
                <input type="text" placeholder="e.g. Advanced AI Engine Dashboard" className="admin-input-element" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                <i className="fas fa-pen-nib"></i>
              </div>
            </div>

            <div className="admin-form-group">
              <label><i className="fas fa-align-left"></i> Project Description</label>
              <div className="admin-field-wrapper">
                <textarea placeholder="Write a short summary..." rows="3" className="admin-input-element" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required></textarea>
                <i className="fas fa-quote-right"></i>
              </div>
            </div>

            <div className="admin-form-group">
              <label><i className="fas fa-tags"></i> Stack Stream Category</label>
              <div className="admin-field-wrapper">
                <select className="admin-input-element" style={{ appearance: 'none', cursor: 'pointer' }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="mern">MERN Stack Development</option>
                  <option value="gaming">Interactive Games Engine</option>
                  <option value="tools">Utilities & Core Tools</option>
                  <option value="frontend">Frontend Specialized UI</option>
                </select>
                <i className="fas fa-layer-group"></i>
                <i className="fas fa-chevron-down" style={{ left: 'auto', right: '16px' }}></i>
              </div>
            </div>

            <div className="admin-form-group">
              <label><i className="fas fa-image"></i> Cloud Image Visual Link</label>
              <div className="admin-field-wrapper">
                <input type="text" placeholder="https://images.unsplash.com/photo-example-url" className="admin-input-element" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} required />
                <i className="fas fa-link"></i>
              </div>
            </div>

            <div className="admin-form-group">
              <label><i className="fas fa-globe"></i> Live Production Deployment Link</label>
              <div className="admin-field-wrapper">
                <input type="text" placeholder="https://your-live-deployment.vercel.app" className="admin-input-element" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} required />
                <i className="fas fa-external-link-alt"></i>
              </div>
            </div>

            <div className="admin-action-row">
              {editId && (
                <button type="button" className="admin-cancel-btn" onClick={handleCancelEdit}>
                  Cancel Rollback
                </button>
              )}
              <button type="submit" className="admin-submit-btn">
                <i className={editId ? "fas fa-sync-alt" : "fas fa-rocket"}></i>
                {editId ? "Update System Node" : "Deploy Live to Cloud Stack"}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero" id="home" style={{ padding: '60px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '30px', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="hero-text" style={{ flex: '1 1 500px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: theme.textMain }}>Hi, I'm <span style={{ color: '#2563eb' }}>Suraj Patel</span></h1>
          <span className="typing" style={{ fontWeight: '600', color: '#2563eb', display: 'block', marginBottom: '15px' }}>Full-Stack Developer & Data Analyst</span>
          <p style={{ color: theme.textMuted, lineHeight: '1.6', marginBottom: '25px' }}>I build fast, reliable web applications and turn data into clear business insights.</p>
          <div className="cta-group" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <a href="#contact" className="contact-btn" style={{ background: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              Get In Touch <i className="fas fa-arrow-right"></i>
            </a>
            <div className="social-icons" style={{ display: 'flex', gap: '15px', fontSize: '1.3rem' }}>
              <a href="https://www.linkedin.com/in/suraj-patel-webdev" target="_blank" rel="noreferrer" style={{ color: theme.textMain }}><i className="fab fa-linkedin"></i></a>
              <a href="https://github.com/SurajPatel2024/HotelRoomsManagementSystem.git" target="_blank" rel="noreferrer" style={{ color: theme.textMain }}><i className="fab fa-github"></i></a>
            </div>
          </div>
        </div>
        <div   >
          <img src="https://i.ibb.co/G4GDhTSr/20260616-092702.png​" alt="Developer Avatar" style={{ maxWidth: '280px', borderRadius: '50%' }} />
        </div>
      </section>

      {/* About Me Section */}
      <section id="about" style={{ padding: '40px 30px', maxWidth: '1100px', margin: '40px auto', background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px' }}>
        <h2 style={{ borderBottom: `2px solid #2563eb`, display: 'inline-block', paddingBottom: '5px', marginBottom: '20px', color: theme.textMain }}>About Me</h2>
        <p style={{ color: theme.textMuted, lineHeight: '1.7', fontSize: '1.05rem', margin: '0' }}>I am a software professional focused on full-stack development and data analysis. I create scalable web projects, optimize databases, and build interactive analytics dashboards.</p>
      </section>

      {/* Skills Segment */}
      <section id="skills" style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ borderBottom: `2px solid #2563eb`, display: 'inline-block', paddingBottom: '5px', marginBottom: '30px', color: theme.textMain }}>My Skills</h2>
        <div className="skills-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {[
            { icon: "fab fa-js-square", color: "#f7df1e", title: "JavaScript", sub: "Language" },
            { icon: "fab fa-react", color: "#61dafb", title: "React.js", sub: "Frontend" },
            { icon: "fab fa-node-js", color: "#339933", title: "Node.js", sub: "Backend" },
            { icon: "fas fa-file-code", color: darkMode ? "#ffffff" : "#000000", title: "Express.js", sub: "Server" },
            { icon: "fas fa-database", color: "#47a248", title: "MongoDB", sub: "Database" },
            { icon: "fas fa-server", color: "#00758f", title: "SQL", sub: "Database" },
            { icon: "fas fa-file-excel", color: "#1f7246", title: "Excel", sub: "Data Analysis" },
            { isImg: true, src: "https://upload.wikimedia.org/wikipedia/commons/c/cf/New_Power_BI_Logo.svg", title: "PowerBI", sub: "Analytics" },
            { icon: "fab fa-html5", color: "#e34f26", title: "HTML5 / CSS3", sub: "Design" }
          ].map((sk, idx) => (
            <div key={idx} className="skill-card" style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, padding: '20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              {sk.isImg ? <img src={sk.src} alt={sk.title} style={{ width: '40px', height: '40px' }} /> : <i className={sk.icon} style={{ fontSize: '2.5rem', color: sk.color }}></i>}
              <div className="skill-info">
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: theme.textMain }}>{sk.title}</h3>
                <span style={{ color: theme.textMuted, fontSize: '0.85rem' }}>{sk.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Grid */}
      <section id="projects" style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ borderBottom: `2px solid #2563eb`, display: 'inline-block', paddingBottom: '5px', marginBottom: '30px', color: theme.textMain, textAlign: 'center' }}>My Projects</h2>

        <div className="filter-buttons" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px', justifyContent: 'center' }}>
          {['all', 'mern', 'gaming', 'tools', 'frontend'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: `1px solid ${filter === cat ? '#2563eb' : theme.border}`,
                background: filter === cat ? '#2563eb' : theme.cardBg,
                color: filter === cat ? '#ffffff' : theme.textMain,
                cursor: 'pointer',
                fontWeight: '500',
                textTransform: 'uppercase',
                fontSize: '0.8rem'
              }}
            >
              {cat === 'all' ? 'All Projects' : `${cat}`}
            </button>
          ))}
        </div>

        {loading ? (

          <div
            className="projects-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
              gap: '25px',
              width: '100%'
            }}
          >

            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="skeleton-card">

                <div className="skeleton-image"></div>

                <div style={{ padding: "15px" }}>

                  <div className="skeleton-line medium"></div>

                  <div className="skeleton-line"></div>

                  <div className="skeleton-line short"></div>

                </div>

              </div>
            ))}

          </div>

        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: theme.textMuted, background: theme.cardBg, borderRadius: '12px', border: `1px dashed ${theme.border}`, maxWidth: '500px', margin: '0 auto' }}>
            <i className="fas fa-folder-open" style={{ fontSize: '2rem', marginBottom: '10px', color: theme.border }}></i>
            <p style={{ fontSize: '0.95rem', fontWeight: '500' }}>No projects found in the database.</p>
            <p style={{ fontSize: '0.85rem' }}>Login as Admin to add your work.</p>
          </div>
        ) : (
          <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px', width: '100%' }}>
            {filteredProjects.map(project => (
              <div key={project._id} className="project-card" style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                <img src={project.image} alt={project.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                <div className="card-content" style={{ padding: '20px' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: theme.textMain }}>{project.title}</h3>
                  <p style={{ color: theme.textMuted, fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '15px' }}>{project.description}</p>
                  <a href={project.link} className="view" target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  Visit Project <i className="fas fa-external-link-alt" style={{ fontSize: '0.8rem' }}></i>
                  </a>
                  {isAdmin && (
                    <div className="crud-btns" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                      <button className="btn-edit" style={{ padding: '6px 12px', cursor: 'pointer', background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textMain, borderRadius: '4px' }} onClick={() => handleEditSelect(project)}>✏️ Edit</button>
                      <button className="btn-delete" style={{ padding: '6px 12px', cursor: 'pointer', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }} onClick={() => handleDelete(project._id)}>🗑️ Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact Form */}
      <section id="contact" style={{ background: theme.cardBg, borderTop: `1px solid ${theme.border}`, padding: '60px 20px' }}>
        <h2 style={{ marginBottom: '10px', textAlign: 'center', color: theme.textMain }}>Contact Me</h2>
        <p style={{ color: theme.textMuted, marginBottom: '30px', textAlign: 'center' }}>Feel free to drop a message.</p>

        <form onSubmit={handleContactSubmit} style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: theme.textMain, textAlign: 'start' }}><i className="fas fa-user" style={{ marginRight: '6px', color: '#2563eb' }}></i>Your Name</label>
            <input type="text" placeholder="John Doe" value={contactData.name} onChange={e => setContactData({ ...contactData, name: e.target.value })} style={{ padding: '12px', background: theme.inputBg, color: theme.textMain, border: `1px solid ${theme.border}`, borderRadius: '6px' }} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: theme.textMain, textAlign: 'start' }}><i className="fas fa-envelope" style={{ marginRight: '6px', color: '#2563eb' }}></i>Your Email</label>
            <input type="email" placeholder="john@example.com" value={contactData.email} onChange={e => setContactData({ ...contactData, email: e.target.value })} style={{ padding: '12px', background: theme.inputBg, color: theme.textMain, border: `1px solid ${theme.border}`, borderRadius: '6px' }} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: theme.textMain, textAlign: 'start' }}><i className="fas fa-comment-alt" style={{ marginRight: '6px', color: '#2563eb' }}></i>Message</label>
            <textarea placeholder="Hi Suraj, let's talk..." rows="5" value={contactData.message} onChange={e => setContactData({ ...contactData, message: e.target.value })} style={{ padding: '12px', background: theme.inputBg, color: theme.textMain, border: `1px solid ${theme.border}`, borderRadius: '6px', resize: 'vertical' }} required></textarea>
          </div>

          <button type="submit" style={{ padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifycontent: 'center', gap: '10px', fontSize: '0.95rem' }}>
            Send Message <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer style={{ background: theme.navBg, color: theme.textMain, padding: '40px 20px', borderTop: `1px solid ${theme.navBorder}` }}>
        <div className="footer-container" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '30px' }}>
          <div className="footer-brand">
            <h4 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px', color: theme.textMain }}>Suraj <span style={{ color: '#2563eb' }}>Patel</span></h4>
            <p style={{ color: theme.textMuted, fontSize: '0.9rem', maxWidth: '350px' }}>Building scalable web projects and data solutions.</p>
          </div>
          <div className="footer-socials">
            <h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '15px', color: theme.textMain }}>Connect Hub</h5>
            <div style={{ display: 'flex', gap: '15px' }}>
              <a href="https://www.linkedin.com/in/suraj-patel-webdev" target="_blank" rel="noreferrer" style={{ color: '#ffffff', background: '#27272a', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fab fa-linkedin-in"></i></a>
              <a href="https://github.com/SurajPatel2024/HotelRoomsManagementSystem.git" target="_blank" rel="noreferrer" style={{ color: '#ffffff', background: '#27272a', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fab fa-github"></i></a>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1100px', margin: '30px auto 0 auto', paddingTop: '20px', borderTop: `1px solid ${theme.navBorder}`, display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: theme.textMuted }}>
          <p>&copy; {new Date().getFullYear()} Suraj Patel. All rights reserved.</p>
          <p><i className="fas fa-code-branch"></i> V2.3.1 Vite Build</p>
        </div>
      </footer>

    </div>
  );
}

export default App;
