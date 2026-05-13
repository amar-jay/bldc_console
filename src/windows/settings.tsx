import { Link } from 'react-router-dom'

export default function Settings() {
  const openDashboardWindow = () => {
    if (window.api) {
      window.api.openNewWindow('')
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Settings Area</h1>
      <p>This is the settings view, independent of the dashboard.</p>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button onClick={openDashboardWindow}>
          Spawn Dashboard in New Window
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <Link to="/">Or, go back to Dashboard in this same window</Link>
      </div>
    </div>
  )
}