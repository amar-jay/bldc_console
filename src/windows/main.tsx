import { Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import TopBar from '@/components/top-bar'
import MotorSpeedCard from '@/cards/motor-speed'
import PhaseCurrentsCard from '@/cards/phase-currents'
import BatteryCapCard from '@/cards/battery-cap'
import MotorXticsCard from '@/cards/motor-xtics'
import PhaseVoltageCard from '@/cards/phase-voltage'
import ElecMechAngleCard from '@/cards/elec-mech-angle'
import DQRefFrameCard from '@/cards/dq-ref-frame'
import { CardWrapper } from '@/components/card-wrapper'




export default function Main() {
  const openSettingsWindow = () => {
    if (window.api) {
      window.api.openNewWindow('settings')
    } else {
      console.warn('Electron API is not available in the browser environment.')
    }
  }

  return (
		<div className="min-h-screen bg-background text-foreground">

		<TopBar/>
		<div className="flex p-6 max-w-md min-w-0 flex-col gap-4 text-sm leading-loose w-full">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button onClick={openSettingsWindow} className="mt-2">
          Spawn Settings in New Window
					</Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
		<Link to="/settings">(Press <kbd>d</kbd> to toggle dark mode)</Link>
        </div>
			</div>

			<div className="p-6">
  <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
    
    <div className="break-inside-avoid mb-4">
      <CardWrapper title="Motor Characteristics" route="card/motor-xtics">
        <MotorXticsCard />
      </CardWrapper>
    </div>

    <div className="break-inside-avoid mb-4">
      <CardWrapper title="Electrical vs Mechanical Angle" route="card/elec-mech">
        <ElecMechAngleCard />
      </CardWrapper>
    </div>

    <div className="break-inside-avoid mb-4">
      <CardWrapper title="Phase Currents" route="card/phase-currents">
        <PhaseCurrentsCard />
      </CardWrapper>
    </div>

    <div className="break-inside-avoid mb-4">
      <CardWrapper title="Motor Speed" route="card/motor-speed">
        <MotorSpeedCard />
      </CardWrapper>
    </div>

    <div className="break-inside-avoid mb-4">
      <CardWrapper title="DQ Reference Frame" route="card/dq-frame">
        <DQRefFrameCard />
      </CardWrapper>
    </div>

    <div className="break-inside-avoid mb-4">
      <CardWrapper title="Phase Voltages" route="card/phase-voltage">
        <PhaseVoltageCard />
      </CardWrapper>
    </div>

    <div className="break-inside-avoid mb-4">
      <CardWrapper title="Battery Capacity" route="card/battery-cap">
        <BatteryCapCard />
      </CardWrapper>
    </div>

  </div>
</div>
		</div>
  )
}