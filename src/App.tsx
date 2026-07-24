import { GraphView } from './components/graph/GraphView'
import { FileControls } from './components/layout/FileControls'
import { ComponentPalette } from './components/palette/ComponentPalette'
import { BeamSettingsPanel } from './components/panels/BeamSettingsPanel'
import { PropertiesPanel } from './components/panels/PropertiesPanel'
import { ViewportSettingsPanel } from './components/panels/ViewportSettingsPanel'

function App() {
  return (
    <div id="app-shell">
      <header>
        <h1>YAMMT - Yet Another Mode-Matching Tool</h1>
        <FileControls />
      </header>
      <div className="app-body">
        <div className="sidebar-column">
          <aside className="sidebar">
            <ComponentPalette />
            <BeamSettingsPanel />
            <ViewportSettingsPanel />
          </aside>
          <aside className="sidebar sidebar-right">
            <PropertiesPanel />
          </aside>
        </div>
        <main>
          <GraphView />
        </main>
      </div>
    </div>
  )
}

export default App
