import './FeatureCard.css';

export default function FeatureCard({ icon: Icon, title, description, link }) {
    return (
        <a href={link} className="card feature-card">
            <div className="icon-wrapper">
                <Icon size={24} className="feature-icon" />
            </div>
            <h3 className="feature-title">{title}</h3>
            <p className="feature-desc">{description}</p>
        </a>
    );
}
