import { Routes, Route} from 'react-router-dom'
import './App.css'
import Settings from './windows/settings'
import Main from './windows/main'
import { Toaster } from "@/components/ui/sonner"
import Console from './windows/console'
import SubWindowLayout from './components/sub-window-layout'
import MotorSpeedCard from './cards/motor-speed'
import PhaseCurrentsCard from './cards/phase-currents'
import MotorXticsCard from './cards/motor-xtics'
import BatteryCapCard from './cards/battery-cap'
import PhaseVoltageCard from './cards/phase-voltage'
import ElecMechAngleCard from './cards/elec-mech-angle'
import DQRefFrameCard from './cards/dq-ref-frame'


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/settings" element={<Settings />} />
				<Route path="/console" element={<Console/>} />
        
        {/* Sub Windows for Cards */}
        <Route path="/card/motor-speed" element={<SubWindowLayout title="Motor Speed"><MotorSpeedCard/></SubWindowLayout>} />
        <Route path="/card/phase-currents" element={<SubWindowLayout title="Phase Currents"><PhaseCurrentsCard/></SubWindowLayout>} />
        <Route path="/card/motor-xtics" element={<SubWindowLayout title="Motor Characteristics"><MotorXticsCard/></SubWindowLayout>} />
        <Route path="/card/battery-cap" element={<SubWindowLayout title="Battery Capacity"><BatteryCapCard/></SubWindowLayout>} />
        <Route path="/card/phase-voltage" element={<SubWindowLayout title="Phase Voltages"><PhaseVoltageCard/></SubWindowLayout>} />
        <Route path="/card/elec-mech" element={<SubWindowLayout title="Angles"><ElecMechAngleCard/></SubWindowLayout>} />
        <Route path="/card/dq-frame" element={<SubWindowLayout title="DQ Reference Frame"><DQRefFrameCard/></SubWindowLayout>} />
      </Routes>
      <Toaster duration={1000} />
    </>
  )
}

export default App
