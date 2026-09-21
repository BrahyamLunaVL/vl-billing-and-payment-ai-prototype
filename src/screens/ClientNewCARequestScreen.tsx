import { useState } from 'react'
import { Button } from '../components'
import type { ClientAgreementView } from '../services/clientAccount'
import { getCARequestsForVA } from '../services/vaAccount'
import { NewCARequestWizard } from './NewCARequestWizard'
import './ClientNewCARequestScreen.css'

export interface ClientNewCARequestScreenProps {
  agreement: ClientAgreementView
  /** Called when the wizard's final step's primary button is clicked — sends the client to the C&A table. */
  onFinish: () => void
}

/** The client's "Request for Changes" flow, opened from an agreement's own detail screen — the same wizard as the VA's/Admin's, without Admin's "Request on behalf of" selector. */
export const ClientNewCARequestScreen = ({ agreement, onFinish }: ClientNewCARequestScreenProps) => {
  const recentRequest = getCARequestsForVA(agreement.vaEmail)[0]
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1)

  return (
    <div className="client-ca-wizard-screen">
      <div className="client-ca-wizard-screen__header">
        <h1 className="client-ca-wizard-screen__title">{wizardStep === 4 ? 'Success' : 'Changes & Approvals Form'}</h1>
        {wizardStep !== 4 && <Button type="tertiary" buttonText="Click to see SAM Contact Info" />}
      </div>
      <NewCARequestWizard
        recentRequest={recentRequest}
        agreementSettings={agreement.settings}
        onStepChange={setWizardStep}
        finishButtonLabel="Go to C&A Table"
        onFinish={onFinish}
      />
    </div>
  )
}
