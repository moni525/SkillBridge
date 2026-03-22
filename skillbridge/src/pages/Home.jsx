import { Link } from 'react-router-dom';
import { Rocket, Sparkles, Code, Users } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import './Home.css';

export default function Home() {
    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-glow-1"></div>
                <div className="hero-glow-2"></div>

                <div className="container hero-content animate-fade-in">
                    <div className="badge hero-badge">Introducing SkillBridge OS</div>
                    <h1 className="hero-title">
                        Your Campus. <br />
                        <span className="gradient-text">Supercharged.</span>
                    </h1>
                    <p className="hero-subtitle">
                        A unified platform connecting RMKCET engineering students with mentors, events, projects, and campus resources.
                    </p>

                    <div className="hero-cta">
                        <Link to="/dashboard" className="btn btn-primary btn-lg">
                            <Rocket size={20} /> Launch Dashboard
                        </Link>
                        <a href="#features" className="btn btn-secondary btn-lg">
                            Explore Features
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section container">
                <div className="section-header text-center">
                    <h2>Everything you need. <br /> All in one place.</h2>
                </div>

                <div className="grid-3">
                    <FeatureCard
                        icon={Sparkles}
                        title="Events Hub"
                        description="Discover hackathons, workshops, symposiums, and college fests tailored to your interests."
                        link="/events"
                    />
                    <FeatureCard
                        icon={Users}
                        title="Mentor Matching"
                        description="Connect with experienced alumni and seniors who can guide your technical journey."
                        link="/mentors"
                    />
                    <FeatureCard
                        icon={Code}
                        title="Project Planner"
                        description="Plan your next big idea. We'll suggest the right mentors, labs, and equipment."
                        link="/planner"
                    />
                </div>
            </section>
        </div>
    );
}
