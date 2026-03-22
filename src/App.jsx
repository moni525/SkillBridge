import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Mentors from './pages/Mentors';
import Planner from './pages/Planner';
import Resources from './pages/Resources';
import Portfolio from './pages/Portfolio';
import SkillPath from './pages/SkillPath';
import Library from './pages/Library';
import ProtectedRoute from './components/ProtectedRoute';
import Chatbot from './components/Chatbot';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/welcome" element={<Home />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/events" element={<Events />} />
              <Route path="/mentors" element={<Mentors />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/skill-path" element={<SkillPath />} />
              <Route path="/library" element={<Library />} />
            </Route>
          </Routes>
        </main>
        <Chatbot />
      </Router>
    </ThemeProvider>
  );
}

export default App;
