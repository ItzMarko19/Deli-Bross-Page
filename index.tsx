import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Error Boundary to catch runtime crashes
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    if (window.confirm("¿Estás seguro? Esto borrará todos los datos guardados localmente para intentar reparar la aplicación.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '20px', 
          fontFamily: 'system-ui, sans-serif', 
          backgroundColor: '#f9fafb',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '500px', width: '100%', background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h1 style={{ color: '#ef4444', marginBottom: '10px', fontSize: '24px' }}>¡Ups! Algo salió mal 😔</h1>
            <p style={{ color: '#4b5563', marginBottom: '20px' }}>
              La aplicación ha encontrado un error inesperado y no puede continuar.
            </p>
            
            <div style={{ 
              backgroundColor: '#fee2e2', 
              color: '#b91c1c', 
              padding: '12px', 
              borderRadius: '8px', 
              fontSize: '12px', 
              fontFamily: 'monospace', 
              marginBottom: '20px',
              overflowX: 'auto',
              textAlign: 'left'
            }}>
              {this.state.error?.message || "Error desconocido"}
            </div>

            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                width: '100%',
                padding: '12px', 
                backgroundColor: '#f97316', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
              Intentar Recargar
            </button>
            
            <button 
              onClick={this.handleReset} 
              style={{ 
                width: '100%',
                padding: '12px', 
                backgroundColor: 'white', 
                color: '#6b7280', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: 'medium',
                fontSize: '14px'
              }}>
              Reiniciar Datos de Fábrica (Si recargar no funciona)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);