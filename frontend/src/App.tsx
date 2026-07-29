import HealthCheck from './components/HealthCheck';
import './index.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Sales Management System</h1>
        <p className="subtitle">Internal Workflow and Sales Platform</p>
      </header>
      
      <main className="app-main">
        <section className="dashboard-grid">
          <HealthCheck />
          {/* Future components will go here */}
          <div className="placeholder-card">
            <h3>Ready for Business Modules</h3>
            <p>Phase 1 Foundation is complete. Business logic, authentication, and routing will be implemented in subsequent phases.</p>
          </div>
        </section>
      </main>
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Knoweb. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
