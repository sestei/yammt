import { GraphView } from './components/graph/GraphView'
import { ComponentPalette } from './components/palette/ComponentPalette'
import { BeamSettingsPanel } from './components/panels/BeamSettingsPanel'
import { PropertiesPanel } from './components/panels/PropertiesPanel'
import { ViewportSettingsPanel } from './components/panels/ViewportSettingsPanel'

function App() {
  return (
    <div id="app-shell">
      <header>
        <h1>YAMMT - Yet Another Mode-Matching Tool</h1>
      </header>
      <div className="app-body">
        <aside className="sidebar">
          <ComponentPalette />
          <BeamSettingsPanel />
          <ViewportSettingsPanel />
        </aside>
        <main>
          <GraphView />
        </main>
        <aside className="sidebar sidebar-right">
          <PropertiesPanel />
        </aside>
      </div>
    </div>
  )
}

export default App
