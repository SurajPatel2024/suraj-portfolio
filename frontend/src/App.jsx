import axios from 'axios';
import React, { useState, useEffect } from 'react';


const MASTER_PWD = import.meta.env.VITE_ADMIN_PASSWORD;
const API_URL = import.meta.env.VITE_API_URL;
const getUserId = () => {

    let id = localStorage.getItem("userId");

    if (!id) {

        id = crypto.randomUUID();

        localStorage.setItem("userId", id);

    }

    return id;

};
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

  // Scripted portfolio chatbot state (no API or AI key required)
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatTyping, setChatTyping] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [awaitingVisitorName, setAwaitingVisitorName] = useState(false);
  const [chatVoiceEnabled, setChatVoiceEnabled] = useState(true);
  const [chatSpeaking, setChatSpeaking] = useState(false);

  // Speak every chatbot reply in English with the most natural English voice available.
  const speakChatReply = (text) => {
    if (!chatVoiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Keep spoken output English-only. URLs and Hindi-script fragments are not read aloud.
    const cleanText = String(text || '')
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/[\u0900-\u097F]+/g, ' ')
      .replace(/[•*_#`]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleanText) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 0.92;
    utterance.pitch = 1.02;
    utterance.volume = 1;
    utterance.onstart = () => setChatSpeaking(true);
    utterance.onend = () => setChatSpeaking(false);
    utterance.onerror = () => setChatSpeaking(false);

    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(voice => /^en([-_]|$)/i.test(voice.lang));
    // Prefer polished, natural-sounding system voices when installed; otherwise use any English voice.
    const preferredVoice = englishVoices.find(voice => /aria|jenny|sonia|samantha|ava|zira|google us english|natural|neural/i.test(voice.name))
      || englishVoices.find(voice => /en[-_]US/i.test(voice.lang))
      || englishVoices.find(voice => /en[-_]GB/i.test(voice.lang))
      || englishVoices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  };

  const stopChatSpeech = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setChatSpeaking(false);
  };

  useEffect(() => () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

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

const handleLike = async (id) => {

    try {

        await axios.post(
            `${API_URL}/api/projects/${id}/like`,
            {
                userId: getUserId()
            }
        );

        fetchProjects();

    } catch (err) {

        console.log(err);

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

  const getChatbotReply = (rawMessage) => {
    const message = rawMessage.toLowerCase().trim();
    const isHindi = /[\u0900-\u097F]/.test(rawMessage) || /\b(kya|kaise|kaun|mera|meri|hai|hain|batao|dikhao|chahiye|kripya|dhanyavaad|shukriya|namaste|aap|tum)\b/.test(message);
    const name = visitorName || 'there';
    // Written chatbot replies are also kept in English for consistent English voice output.
    const say = (english, hindi) => english;

    // Match a project by its actual title and return details from the database.
    const matchedProject = projects.find(project =>
      project.title && message.includes(project.title.toLowerCase())
    );
    if (matchedProject) {
      const projectLink = matchedProject.link ? `\nLive link: ${matchedProject.link}` : '';
      return `${matchedProject.title}\n${matchedProject.description || ''}${projectLink}`;
    }

    if (/\b(hi|hello|hey|hii|namaste|नमस्ते|हेलो|नमस्कार)\b/.test(message)) {
      return say(`Hello ${name}! 👋 What would you like to explore in Suraj's portfolio?`, `नमस्ते ${name}! 👋 आप Suraj के पोर्टफोलियो में क्या देखना चाहेंगे?`);
    }
    if (/\b(who|about|yourself|suraj|profile| परिचय|अपने बारे|मेरे बारे|apne bare|mere bare|batao|kaun ho|कौन)\b/.test(message)) {
      return say('Suraj Patel is a Full-Stack Developer who builds frontend and backend web projects. Explore this portfolio to see his work.', 'Suraj Patel एक Full-Stack Developer हैं, जो frontend और backend web projects बनाते हैं। उनके काम को देखने के लिए Projects section देखें।');
    }
    if (/\b(skill|skills|technology|tech stack|mern|frontend|backend|कौशल|स्किल|टेक्नोलॉजी)\b/.test(message)) {
      return say('The portfolio showcases MERN, frontend, gaming, and tools project categories. Ask about a specific project to learn more.', 'इस पोर्टफोलियो में MERN, frontend, gaming और tools से जुड़े projects हैं। किसी खास project का नाम पूछें, मैं उसकी जानकारी दूँगा।');
    }
    if (/\b(project|projects|work|portfolio|demo|प्रोजेक्ट|काम|परियोजना)\b/.test(message)) {
      if (!projects.length) return say('Projects are not available right now. Please check the Projects section again shortly.', 'अभी projects की जानकारी उपलब्ध नहीं है। कृपया थोड़ी देर बाद Projects section देखें।');
      const titles = projects.slice(0, 6).map(project => `• ${project.title}`).join('\n');
      return say(`There are ${projects.length} project(s) in the portfolio. Here are some: \n${titles}\nType a project name to see its details.`, `पोर्टफोलियो में ${projects.length} project(s) हैं। कुछ projects:\n${titles}\nकिसी project की details के लिए उसका नाम लिखें।`);
    }
    if (/\b(education|study|college|school|qualification|padhai|shiksha|पढ़ाई|शिक्षा|कॉलेज|स्कूल)\b/.test(message)) {
      return say('Detailed education information has not been added to this portfolio yet. Please use the Contact section to ask Suraj directly.', 'Education की पूरी जानकारी अभी पोर्टफोलियो में नहीं जोड़ी गई है। आप Contact section से Suraj से सीधे पूछ सकते हैं।');
    }
    if (/\b(experience|job|career|anubhav|kaam ka anubhav|काम का अनुभव|अनुभव|नौकरी)\b/.test(message)) {
      return say('Detailed work-experience information is not listed here yet. Please contact Suraj for the latest details.', 'Work experience की विस्तृत जानकारी अभी यहाँ उपलब्ध नहीं है। नई जानकारी के लिए Suraj से Contact section के जरिए संपर्क करें।');
    }
    if (/\b(resume|cv|रिज्यूमे|बायोडाटा)\b/.test(message)) {
      return say('A resume download has not been configured on this website yet. Please contact Suraj by email to request it.', 'इस वेबसाइट पर अभी Resume download की सुविधा नहीं जोड़ी गई है। Resume के लिए Suraj को email करें।');
    }
    if (/\b(contact|email|mail|hire|reach|message|sampark|संपर्क|ईमेल|काम देना)\b/.test(message)) {
      return say('You can email Suraj at surajpatel2026@zohomail.in or use the Contact section on this page.', 'आप Suraj को surajpatel2026@zohomail.in पर email कर सकते हैं या वेबसाइट का Contact section इस्तेमाल कर सकते हैं।');
    }
    if (/\b(instagram|insta|इंस्टाग्राम)\b/.test(message)) {
      return 'Instagram: https://www.instagram.com/surajpatel_coder/';
    }
    if (/\b(linkedin|लिंक्डइन)\b/.test(message)) {
      return 'LinkedIn: https://www.linkedin.com/in/suraj-patel-webdev';
    }
    if (/\b(github|git hub|गिटहब)\b/.test(message)) {
      return 'GitHub: https://github.com/SurajPatel2024/HotelRoomsManagementSystem';
    }
    if (/\b(social|social media|links|सोशल|लिंक)\b/.test(message)) {
      return say('Here are Suraj’s social links:\nInstagram: https://www.instagram.com/surajpatel_coder/\nLinkedIn: https://www.linkedin.com/in/suraj-patel-webdev\nGitHub: https://github.com/SurajPatel2024/HotelRoomsManagementSystem', 'ये रहे Suraj के social links:\nInstagram: https://www.instagram.com/surajpatel_coder/\nLinkedIn: https://www.linkedin.com/in/suraj-patel-webdev\nGitHub: https://github.com/SurajPatel2024/HotelRoomsManagementSystem');
    }
    if (/\b(thank|thanks|धन्यवाद|शुक्रिया)\b/.test(message)) {
      return say(`You're welcome, ${name}! 😊 Feel free to ask me anything else.`, `आपका स्वागत है ${name}! 😊 कुछ और पूछना हो तो बताइए।`);
    }
    if (/\b(bye|goodbye|see you|अलविदा|बाय)\b/.test(message)) {
      return say(`Thanks for visiting, ${name}! Have a great day. 👋`, `पोर्टफोलियो देखने के लिए धन्यवाद ${name}! आपका दिन शुभ हो। 👋`);
    }
    return say('I can help with About, Skills, Projects, Education, Experience, Resume, Contact, and social links. Try asking about one of these.', 'मैं About, Skills, Projects, Education, Experience, Resume, Contact और social links के बारे में बता सकता हूँ। इनमें से किसी विषय पर पूछें।');
  };

  const sendChatMessage = (messageText = chatInput) => {
    const cleanMessage = messageText.trim();
    if (!cleanMessage || chatTyping) return;

    setChatMessages(prev => [...prev, { from: 'user', text: cleanMessage }]);
    setChatInput('');

    if (awaitingVisitorName) {
      const skipped = /^(skip|नहीं|छोड़ो|anonymous)$/i.test(cleanMessage);
      const extractedName = cleanMessage.match(/(?:my name is|i am|i'm|mera naam|मेरा नाम)\s+(.+?)(?:\s+hai|\s+है)?$/i);
      const name = skipped ? '' : (extractedName?.[1] || cleanMessage).replace(/[.!?]/g, '').trim().slice(0, 35);
      setVisitorName(name);
      setAwaitingVisitorName(false);
      setChatTyping(true);
      window.setTimeout(() => {
        const greeting = name
          ? `Nice to meet you, ${name}! You can now ask me anything about Suraj and this portfolio.`
          : 'Welcome! You can now ask me anything about Suraj and this portfolio.';
        setChatMessages(prev => [...prev, { from: 'bot', text: greeting }]);
        setChatTyping(false);
        speakChatReply(greeting);
      }, 550);
      return;
    }

    setChatTyping(true);
    window.setTimeout(() => {
      const reply = getChatbotReply(cleanMessage);
      setChatMessages(prev => [...prev, { from: 'bot', text: reply }]);
      setChatTyping(false);
      speakChatReply(reply);
    }, 650);
  };

  const openChatbot = () => {
    setChatOpen(true);
    if (chatMessages.length === 0) {
      setAwaitingVisitorName(true);
      const welcome = 'Hello! Welcome to Suraj Patel’s portfolio. What is your name? You can type Skip to continue without a name.';
      setChatMessages([{ from: 'bot', text: welcome }]);
      speakChatReply(welcome);
    }
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

      <style>
        {`
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
    .project-actions{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-top:18px;
}

.like-btn{
    display:flex;
    align-items:center;
    gap:8px;

    padding:8px 14px;

    border:none;

    border-radius:30px;

    background:#f5f5f5;

    color:#444;

    font-weight:600;

    cursor:pointer;

    transition:.3s;
}

.like-btn i{
    color:#888;
    transition:.3s;
}

.like-btn:hover{
    transform:translateY(-2px);
    background:#ffe8ec;
}

.like-btn:hover i{
    color:#ff3366;
}

.like-btn.liked{
    background:#ff3366;
    color:white;
}

.like-btn.liked i{
    color:white;
    animation:pop .35s;
}

.visit-btn{
    text-decoration:none;
    color:white;
    background:#2563eb;
    padding:8px 14px;
    border-radius:8px;
    transition:.3s;
}

.visit-btn:hover{
    background:#1d4ed8;
}

@keyframes pop{

0%{transform:scale(1)}

40%{transform:scale(1.35)}

100%{transform:scale(1)}

}

        /* Premium portfolio refresh */
        html { scroll-behavior: smooth; scroll-padding-top: 86px; }
        body { margin: 0; }
        button, input, textarea, select { font: inherit; }
        nav { padding: 14px max(22px, calc((100vw - 1180px) / 2)); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }
        nav .logo { display: flex; align-items: center; gap: 2px; white-space: nowrap; }
        nav .logo .brand-mark {
          width: 42px !important; height: 42px !important; object-fit: cover;
          border-radius: 50%; padding: 3px; display: block;
          border: 2px solid transparent;
          background: linear-gradient(${darkMode ? '#1a1b1e' : '#fff'}, ${darkMode ? '#1a1b1e' : '#fff'}) padding-box,
                      conic-gradient(from 0deg, #2563eb, #06b6d4, #8b5cf6, #ec4899, #2563eb) border-box;
          box-shadow: 0 0 0 3px rgba(37,99,235,.10), 0 0 18px rgba(37,99,235,.25);
          animation: brandSpin 7s linear infinite, brandPulse 2.8s ease-in-out infinite;
        }
        nav .logo { transition: transform .25s ease; }
        nav .logo:hover { transform: translateY(-2px); }
        nav ul li a { position: relative; padding: 8px 0; }
        nav ul li a::after { content: ""; position: absolute; left: 0; bottom: 0; width: 0; height: 2px; background: #2563eb; transition: width .25s ease; }
        nav ul li a:hover::after { width: 100%; }
        .menu-toggle { cursor: pointer; font-size: 1.45rem; padding: 4px 8px; border-radius: 8px; }
        .premium-hero { position: relative; isolation: isolate; min-height: 440px; }
        .premium-hero::before { content: ""; position: absolute; z-index: -1; width: 360px; height: 360px; top: 5px; left: -130px; border-radius: 50%; background: radial-gradient(circle, rgba(37,99,235,.15), transparent 68%); filter: blur(8px); pointer-events: none; }
        .premium-hero-text h1 { font-size: clamp(2.6rem, 6vw, 4.6rem) !important; line-height: 1.08; letter-spacing: -2px; font-weight: 800; }
        .premium-hero-text .typing { font-size: clamp(1.05rem, 2vw, 1.35rem); }
        .premium-hero-text p { max-width: 590px; font-size: 1.05rem; }
        .hero-avatar-wrap { position: relative; display: grid; place-items: center; width: min(330px, 80vw); aspect-ratio: 1; margin: 0 auto; }
        .hero-avatar-wrap::before, .hero-avatar-wrap::after { content: ""; position: absolute; inset: 2%; border: 1px solid rgba(37,99,235,.65); border-radius: 50%; animation: orbit 10s linear infinite; }
        .hero-avatar-wrap::after { inset: -5%; border: 2px dashed rgba(6,182,212,.55); opacity: .75; animation-direction: reverse; animation-duration: 18s; }
        .hero-avatar-wrap .orbit-dot { position: absolute; width: 13px; height: 13px; top: 12%; right: 17%; z-index: 2; border-radius: 50%; background: #06b6d4; box-shadow: 0 0 18px #06b6d4; animation: dotFloat 3s ease-in-out infinite; }
        .hero-avatar { width: 76%; height: 76%; object-fit: cover; border-radius: 50%; border: 5px solid ${darkMode ? '#272930' : '#fff'}; box-shadow: 0 22px 65px rgba(37,99,235,.25); animation: avatarFloat 5s ease-in-out infinite; }
        @keyframes orbit { to { transform: rotate(360deg); } }
        @keyframes brandSpin { to { filter: hue-rotate(360deg); } }
        @keyframes brandPulse { 0%,100% { box-shadow: 0 0 0 3px rgba(37,99,235,.10), 0 0 14px rgba(37,99,235,.18); } 50% { box-shadow: 0 0 0 5px rgba(6,182,212,.13), 0 0 25px rgba(37,99,235,.42); } }
        @keyframes avatarFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
        @keyframes dotFloat { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-8px) scale(1.15); } }
        .social-icons a { display: grid; place-items: center; width: 42px; height: 42px; border: 1px solid ${theme.border}; border-radius: 12px; background: ${theme.cardBg}; transition: transform .25s, color .25s, background .25s, border-color .25s; }
        .social-icons a:hover { transform: translateY(-5px); color: white !important; background: #2563eb; border-color: #2563eb; }
        .contact-btn, .visit-btn, .admin-submit-btn { box-shadow: 0 8px 22px rgba(37,99,235,.2); transition: transform .25s ease, box-shadow .25s ease, background .25s ease; }
        .contact-btn:hover, .visit-btn:hover, .admin-submit-btn:hover { transform: translateY(-3px); box-shadow: 0 13px 28px rgba(37,99,235,.28); }
        #about, .admin-premium-card { backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
        #about { position: relative; overflow: hidden; box-shadow: 0 18px 55px rgba(15,23,42,.06); }
        #about::after { content: ""; position: absolute; right: -55px; bottom: -90px; width: 190px; height: 190px; border-radius: 50%; background: rgba(37,99,235,.08); filter: blur(5px); }
        .skill-card { position: relative; overflow: hidden; transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease; }
        .skill-card::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 3px; background: #2563eb; transform: scaleY(0); transition: transform .25s ease; }
        .skill-card:hover { transform: translateY(-6px); border-color: #2563eb !important; box-shadow: 0 14px 30px rgba(37,99,235,.1); }
        .skill-card:hover::before { transform: scaleY(1); }
        .project-card {
          position: relative; isolation: isolate; transform: translateY(0);
          transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s ease, border-color .3s ease;
          box-shadow: 0 10px 28px rgba(15,23,42,.07); overflow: hidden;
          animation: projectEnter .65s both cubic-bezier(.2,.8,.2,1);
        }
        .project-card::before {
          content: ""; position: absolute; z-index: 2; inset: 0; padding: 1px;
          border-radius: inherit; pointer-events: none; opacity: 0;
          background: linear-gradient(120deg, #2563eb, #06b6d4, #8b5cf6, #2563eb);
          background-size: 250% 250%; animation: borderFlow 5s linear infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude; transition: opacity .3s ease;
        }
        .project-card::after {
          content: ""; position: absolute; z-index: 1; top: -80%; left: -65%; width: 45%; height: 260%;
          pointer-events: none; transform: rotate(25deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
          transition: left .7s ease;
        }
        .project-card:hover { transform: translateY(-12px) scale(1.015); border-color: rgba(37,99,235,.65) !important; box-shadow: 0 24px 55px rgba(37,99,235,.18); }
        .project-card:hover::before { opacity: 1; }
        .project-card:hover::after { left: 130%; }
        .project-card > img { display: block; background: ${darkMode ? '#272930' : '#e2e8f0'}; transition: transform .65s cubic-bezier(.2,.8,.2,1), filter .4s ease; }
        .project-card:hover > img { transform: scale(1.09); filter: saturate(1.2) contrast(1.03); }
        .project-card .card-content { position: relative; z-index: 3; }
        .project-card h3 { transition: color .25s ease, transform .25s ease; }
        .project-card:hover h3 { color: #2563eb !important; transform: translateX(3px); }
        .project-card .project-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        @keyframes projectEnter { from { opacity: 0; transform: translateY(24px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes borderFlow { 0% { background-position: 0% 50%; } 100% { background-position: 250% 50%; } }
        .projects-grid .project-card:nth-child(2) { animation-delay: .08s; }
        .projects-grid .project-card:nth-child(3) { animation-delay: .16s; }
        .projects-grid .project-card:nth-child(4) { animation-delay: .24s; }
        .projects-grid .project-card:nth-child(5) { animation-delay: .32s; }
        .projects-grid .project-card:nth-child(6) { animation-delay: .40s; }
        .like-btn { transition: transform .2s ease, background .2s ease, color .2s ease; }
        .like-btn:active { transform: scale(.94); }
        .filter-buttons button { transition: transform .2s ease, box-shadow .2s ease; }
        .filter-buttons button:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(37,99,235,.12); }
        #contact form input:focus, #contact form textarea:focus { outline: none; border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,.13); }
        .footer-socials a { transition: transform .22s ease, background .22s ease; }
        .footer-socials a:hover { transform: translateY(-4px); background: #2563eb !important; }
        .instagram-social:hover { background: linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7) !important; }
        .skeleton-image, .skeleton-line { background: linear-gradient(90deg, ${darkMode ? '#30333a' : '#e5e7eb'} 25%, ${darkMode ? '#414550' : '#f3f4f6'} 50%, ${darkMode ? '#30333a' : '#e5e7eb'} 75%); background-size: 400% 100%; }
        @media (max-width: 768px) {
          nav { padding: 12px 18px; }
          .premium-hero { text-align: center; padding-top: 48px !important; }
          .premium-hero-text h1 { letter-spacing: -1.2px; }
          .premium-hero-text .cta-group { justify-content: center; }
          .premium-hero-text p { margin-left: auto; margin-right: auto; }
          .hero-avatar-wrap { width: min(270px, 72vw); }
          .project-card:hover { transform: translateY(-6px) scale(1.008); }
          .social-icons { justify-content: center; }
          .projects-grid { grid-template-columns: minmax(0, 1fr) !important; }
          #about { margin-left: 16px !important; margin-right: 16px !important; padding: 28px 22px !important; }
          footer .footer-container { flex-direction: column; }
          footer > div:last-child { flex-direction: column; gap: 5px; }
          .toast-container { left: 15px; right: 15px; top: 15px; min-width: 0; box-sizing: border-box; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
        }

    `}
    </style>

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
            className="brand-mark"
            style={{ height: '42px', width: '42px', display: 'block' }}
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
      <section className="hero premium-hero" id="home" style={{ padding: '60px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '30px', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="hero-text premium-hero-text" style={{ flex: '1 1 500px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: theme.textMain }}>Hi, I'm <span style={{ color: '#2563eb' }}>Suraj Patel</span></h1>
          <span className="typing" style={{ fontWeight: '600', color: '#2563eb', display: 'block', marginBottom: '15px' }}>Full-Stack Developer & Data Analyst</span>
          <p style={{ color: theme.textMuted, lineHeight: '1.6', marginBottom: '25px' }}>I build fast, reliable web applications and turn data into clear business insights.</p>
          <div className="cta-group" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <a href="#contact" className="contact-btn" style={{ background: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              Get In Touch <i className="fas fa-arrow-right"></i>
            </a>
            <div className="social-icons" style={{ display: 'flex', gap: '15px', fontSize: '1.3rem' }}>
              <a href="https://www.linkedin.com/in/suraj-patel-webdev" target="_blank" rel="noreferrer" style={{ color: theme.textMain }}><i className="fab fa-linkedin"></i></a>
              <a href="https://github.com/SurajPatel2024/HotelRoomsManagementSystem.git" target="_blank" rel="noreferrer" aria-label="GitHub" style={{ color: theme.textMain }}><i className="fab fa-github"></i></a>
              <a href="https://www.instagram.com/surajpatel_coder/" target="_blank" rel="noreferrer" aria-label="Instagram" style={{ color: theme.textMain }}><i className="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>
        <div className="hero-avatar-wrap">
          <span className="orbit-dot" aria-hidden="true"></span>
          <img className="hero-avatar" src="https://i.ibb.co/G4GDhTSr/20260616-092702.png" alt="Developer Avatar" />
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
                <img src={project.image} alt={project.title} loading="lazy" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                <div className="card-content" style={{ padding: '20px' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: theme.textMain }}>{project.title}</h3>
                  <p style={{ color: theme.textMuted, fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '15px' }}>{project.description}</p>
                  <div className="project-actions">

    <button
        onClick={() => handleLike(project._id)}
        className={`like-btn ${project.likedUsers?.includes(getUserId()) ? "liked" : ""}`}
    >
        <i className="fa-solid fa-heart"></i>
        <span>{project.likes}</span>
    </button>

    <a
        href={project.link}
        target="_blank"
        rel="noreferrer"
        className="visit-btn"
    >
        Visit →
    </a>

</div>
  
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
              <a href="https://github.com/SurajPatel2024/HotelRoomsManagementSystem.git" target="_blank" rel="noreferrer" aria-label="GitHub" style={{ color: '#ffffff', background: '#27272a', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fab fa-github"></i></a>
              <a href="https://www.instagram.com/surajpatel_coder/" target="_blank" rel="noreferrer" aria-label="Instagram" className="instagram-social" style={{ color: '#ffffff', background: '#27272a', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1100px', margin: '30px auto 0 auto', paddingTop: '20px', borderTop: `1px solid ${theme.navBorder}`, display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: theme.textMuted }}>
          <p>&copy; {new Date().getFullYear()} Suraj Patel. All rights reserved.</p>
          <p><i className="fas fa-code-branch"></i> V2.3.1 Vite Build</p>
        </div>
      </footer>

      {/* Floating scripted chatbot */}
      <div className={`portfolio-chat-widget ${chatOpen ? 'chat-is-open' : ''}`}>
        {chatOpen && (
          <section className="portfolio-chat-panel" aria-label="Portfolio chat assistant">
            <div className="portfolio-chat-header">
              <div className="portfolio-chat-avatar"><i className="fas fa-robot"></i></div>
              <div className="portfolio-chat-heading">
                <strong>Portfolio Assistant</strong>
                <span><i className="chat-online-dot"></i> Usually replies instantly</span>
              </div>
              <div className="portfolio-chat-voice-controls">
                <button type="button" onClick={() => { if (chatVoiceEnabled) stopChatSpeech(); setChatVoiceEnabled(value => !value); }} aria-label={chatVoiceEnabled ? 'Mute chatbot voice' : 'Enable chatbot voice'} title={chatVoiceEnabled ? 'Mute voice' : 'Enable voice'}><i className={chatVoiceEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute'}></i></button>
                <button type="button" onClick={stopChatSpeech} aria-label="Stop speaking" title="Stop speaking" disabled={!chatSpeaking}><i className="fas fa-stop"></i></button>
                <button type="button" className="portfolio-chat-close" onClick={() => { stopChatSpeech(); setChatOpen(false); }} aria-label="Close chat">×</button>
              </div>
            </div>

            <div className="portfolio-chat-messages" aria-live="polite">
              <div className="chat-date-label">TODAY</div>
              {chatMessages.map((message, index) => (
                <div key={`${index}-${message.from}`} className={`chat-message-row ${message.from === 'user' ? 'chat-user-row' : 'chat-bot-row'}`}>
                  {message.from === 'bot' && <span className="chat-mini-avatar"><i className="fas fa-robot"></i></span>}
                  <div className={`chat-bubble ${message.from === 'user' ? 'chat-user-bubble' : 'chat-bot-bubble'}`}>{message.text.split(/(https?:\/\/[^\s]+)/g).map((part, partIndex) => /^https?:\/\//.test(part) ? <a key={partIndex} href={part} target="_blank" rel="noreferrer" style={{ color: '#7dd3fc', textDecoration: 'underline', overflowWrap: 'anywhere' }}>{part}</a> : <React.Fragment key={partIndex}>{part}</React.Fragment>)}</div>
                </div>
              ))}
              {chatTyping && <div className="chat-message-row chat-bot-row"><span className="chat-mini-avatar"><i className="fas fa-robot"></i></span><div className="chat-bubble chat-bot-bubble chat-typing"><i></i><i></i><i></i></div></div>}
            </div>

            {chatMessages.length <= 3 && !awaitingVisitorName && (
              <div className="portfolio-chat-quick-replies">
                <button type="button" onClick={() => sendChatMessage('Tell me about Suraj')}>About / परिचय</button>
                <button type="button" onClick={() => sendChatMessage('Show me projects')}>Projects / प्रोजेक्ट</button>
                <button type="button" onClick={() => sendChatMessage('Social links')}>Social Links</button>
                <button type="button" onClick={() => sendChatMessage('How can I contact you?')}>Contact / संपर्क</button>
              </div>
            )}

            <form className="portfolio-chat-input-area" onSubmit={e => { e.preventDefault(); sendChatMessage(); }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type your message..." aria-label="Type your message" />
              <button type="submit" disabled={!chatInput.trim() || chatTyping} aria-label="Send message"><i className="fas fa-paper-plane"></i></button>
            </form>
            <div className="portfolio-chat-footnote">Automated portfolio assistant · Scripted replies</div>
          </section>
        )}
        <button type="button" className="portfolio-chat-launcher" onClick={chatOpen ? () => { stopChatSpeech(); setChatOpen(false); } : openChatbot} aria-label={chatOpen ? 'Close chat assistant' : 'Open chat assistant'}>
          <i className={chatOpen ? 'fas fa-times' : 'fas fa-comment-dots'}></i>
          {!chatOpen && <span className="chat-launcher-ping"></span>}
        </button>
      </div>

      <style>{`
/* Responsive floating portfolio chatbot */
.portfolio-chat-widget {
  position: fixed;
  right: max(20px, env(safe-area-inset-right));
  bottom: max(20px, env(safe-area-inset-bottom));
  z-index: 3000;
  font-family: inherit;
 
}

.portfolio-chat-launcher {
  position: relative;
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  border: 0;
  border-radius: 20px;
  background: linear-gradient(135deg, #2563eb, #06b6d4);
  color: #fff;
  font-size: 25px;
  cursor: pointer;
  box-shadow: 0 12px 34px rgba(37, 99, 235, .38);
  transition: transform .25s ease, box-shadow .25s ease;
  touch-action: manipulation;
}
.portfolio-chat-launcher:hover {
  transform: translateY(-4px) scale(1.04);
  box-shadow: 0 16px 38px rgba(37, 99, 235, .48);
}
.chat-launcher-ping {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 12px;
  height: 12px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 5px rgba(34, 197, 94, .16);
}

.portfolio-chat-panel {
  position: absolute;
  right: 0;
  bottom: 78px;
  display: flex;
  flex-direction: column;
  width: min(390px, calc(100vw - 36px));
  height: min(590px, calc(100vh - 125px));
  min-height: 320px;
  overflow: hidden;
  color: #f8fafc;
  background: #101827;
  border: 1px solid rgba(148, 163, 184, .25);
  border-radius: 20px;
  box-shadow: 0 24px 75px rgba(2, 6, 23, .38);
  animation: chatPanelIn .25s ease-out;
}
@supports (height: 100dvh) {
  .portfolio-chat-panel { height: min(590px, calc(100dvh - 125px)); }
}
@keyframes chatPanelIn {
  from { opacity: 0; transform: translateY(12px) scale(.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.portfolio-chat-header {
  display: flex;
  align-items: center;
  gap: 11px;
  flex: 0 0 auto;
  min-width: 0;
  padding: 15px;
  background: linear-gradient(120deg, #172554, #0e7490);
  border-bottom: 1px solid rgba(255, 255, 255, .1);
}
.portfolio-chat-avatar,
.chat-mini-avatar {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  color: #fff;
  background: rgba(255, 255, 255, .16);
  border-radius: 13px;
}
.portfolio-chat-avatar { width: 42px; height: 42px; font-size: 19px; }
.portfolio-chat-heading {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.portfolio-chat-heading strong { font-size: 14px; line-height: 1.3; }
.portfolio-chat-heading span { color: #cbd5e1; font-size: 11px; line-height: 1.3; }
.chat-online-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 5px;
  background: #4ade80;
  border-radius: 50%;
}
.portfolio-chat-voice-controls {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 5px;
  margin-left: auto;
}
.portfolio-chat-voice-controls button,
.portfolio-chat-close {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  color: #e2e8f0;
  background: rgba(255, 255, 255, .08);
  border: 1px solid rgba(255, 255, 255, .16);
  border-radius: 10px;
  cursor: pointer;
}
.portfolio-chat-voice-controls button:hover:not(:disabled),
.portfolio-chat-close:hover { background: rgba(59, 130, 246, .3); }
.portfolio-chat-voice-controls button:disabled { opacity: .35; cursor: not-allowed; }
.portfolio-chat-close { color: #fff; font-size: 22px; border: 0; background: rgba(255, 255, 255, .12); }

.portfolio-chat-messages {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 16px 13px 10px;
  background: radial-gradient(circle at top right, rgba(37, 99, 235, .12), transparent 45%), #101827;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
.chat-date-label {
  margin: 0 0 16px;
  color: #64748b;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-align: center;
}
.chat-message-row {
  display: flex;
  align-items: flex-end;
  gap: 7px;
  margin: 0 0 13px;
  animation: chatMessageIn .2s ease-out;
}
.chat-user-row { justify-content: flex-end; }
@keyframes chatMessageIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.chat-mini-avatar { width: 25px; height: 25px; font-size: 11px; background: #1d4ed8; border-radius: 8px; }
.chat-bubble {
  max-width: min(84%, 290px);
  padding: 10px 12px;
  overflow-wrap: anywhere;
  white-space: pre-line;
  font-size: 13px;
  line-height: 1.55;
  border-radius: 14px;
}
.chat-bot-bubble {
  color: #e2e8f0;
  background: #1e293b;
  border: 1px solid rgba(148, 163, 184, .12);
  border-bottom-left-radius: 4px;
}
.chat-user-bubble {
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #0891b2);
  border-bottom-right-radius: 4px;
}
.chat-bubble a { overflow-wrap: anywhere; }

.portfolio-chat-quick-replies {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 7px;
  padding: 0 13px 12px;
  background: #101827;
}
.portfolio-chat-quick-replies button {
  min-height: 36px;
  padding: 7px 10px;
  color: #7dd3fc;
  background: rgba(14, 116, 144, .13);
  border: 1px solid rgba(56, 189, 248, .4);
  border-radius: 20px;
  font-size: 11px;
  cursor: pointer;
  touch-action: manipulation;
}
.portfolio-chat-quick-replies button:hover { background: rgba(14, 116, 144, .3); }
.portfolio-chat-input-area {
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
  padding: 11px;
  background: #131f31;
  border-top: 1px solid rgba(148, 163, 184, .16);
}
.portfolio-chat-input-area input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 44px;
  padding: 10px 13px;
  color: #f8fafc;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  outline: none;
  font-size: 16px;
}
.portfolio-chat-input-area input:focus { border-color: #38bdf8; }
.portfolio-chat-input-area button {
  display: grid;
  flex: 0 0 46px;
  place-items: center;
  min-height: 44px;
  color: #fff;
  background: #2563eb;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
}
.portfolio-chat-input-area button:disabled { opacity: .45; cursor: not-allowed; }
.portfolio-chat-footnote {
  flex: 0 0 auto;
  padding: 0 10px 10px;
  color: #64748b;
  background: #131f31;
  font-size: 9px;
  text-align: center;
}
.chat-typing { display: flex; align-items: center; gap: 4px; min-width: 48px; }
.chat-typing i {
  width: 5px;
  height: 5px;
  background: #94a3b8;
  border-radius: 50%;
  animation: chatTyping .8s infinite alternate;
}
.chat-typing i:nth-child(2) { animation-delay: .15s; }
.chat-typing i:nth-child(3) { animation-delay: .3s; }
@keyframes chatTyping { to { opacity: .25; transform: translateY(-3px); } }

@media (max-width: 600px) {
  .portfolio-chat-widget {
    right: 40px ;
     top: 85%;
    position:fixed;
     
  }
  .portfolio-chat-launcher { width: 56px; height: 56px; border-radius: 18px; font-size: 23px; }
  .portfolio-chat-panel {
    position: fixed;
    right: max(10px, env(safe-area-inset-right));
    bottom: calc(76px + env(safe-area-inset-bottom));
    width: min(440px, calc(100vw - 20px));
    height: min(650px, calc(100vh - 105px));
    max-height: calc(100vh - 105px);
    min-height: 260px;
    border-radius: 18px;
  }
  @supports (height: 100dvh) {
    .portfolio-chat-panel {
      height: min(650px, calc(100dvh - 105px - env(safe-area-inset-top) - env(safe-area-inset-bottom)));
      max-height: calc(100dvh - 105px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
    }
  }
  .portfolio-chat-header { gap: 8px; padding: 11px; }
  .portfolio-chat-avatar { width: 36px; height: 36px; }
  .portfolio-chat-voice-controls { gap: 4px; }
  .portfolio-chat-voice-controls button,
  .portfolio-chat-close { width: 34px; height: 34px; }
  .portfolio-chat-messages { padding: 13px 10px 8px; }
  .chat-bubble { max-width: 88%; padding: 10px 11px; font-size: 13px; }
  .portfolio-chat-quick-replies { gap: 6px; padding: 0 10px 9px; }
  .portfolio-chat-quick-replies button { min-height: 34px; padding: 7px 9px; }
  .portfolio-chat-input-area { gap: 7px; padding: 9px; }
  .portfolio-chat-input-area input { min-height: 44px; padding: 9px 11px; }
}

@media (max-width: 380px) {
  .portfolio-chat-panel {
    right: 7px;
    width: calc(100vw - 14px);
    bottom: calc(70px + env(safe-area-inset-bottom));
  }
  .portfolio-chat-header { gap: 6px; padding: 9px; }
  .portfolio-chat-avatar { width: 32px; height: 32px; font-size: 16px; }
  .portfolio-chat-heading strong { font-size: 12px; }
  .portfolio-chat-heading span { font-size: 9px; }
  .portfolio-chat-voice-controls { gap: 3px; }
  .portfolio-chat-voice-controls button,
  .portfolio-chat-close { width: 31px; height: 31px; border-radius: 8px; }
  .portfolio-chat-quick-replies button { font-size: 10px; padding: 6px 8px; }
  .chat-bubble { max-width: 90%; font-size: 12px; }
}

@media (max-height: 520px) and (max-width: 900px) {
  .portfolio-chat-panel {
    height: calc(100vh - 84px);
    max-height: calc(100vh - 84px);
    min-height: 0;
    bottom: 68px;
  }
  @supports (height: 100dvh) {
    .portfolio-chat-panel { height: calc(100dvh - 84px); max-height: calc(100dvh - 84px); }
  }
  .portfolio-chat-header { padding: 7px 10px; }
  .portfolio-chat-avatar { width: 30px; height: 30px; }
  .portfolio-chat-messages { padding-top: 7px; }
  .portfolio-chat-quick-replies { padding-bottom: 5px; }
  .portfolio-chat-footnote { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .portfolio-chat-panel,
  .chat-message-row,
  .chat-typing i,
  .portfolio-chat-launcher { animation: none !important; transition: none !important; }
}
      `}</style>

    </div>
  );
}

export default App;
