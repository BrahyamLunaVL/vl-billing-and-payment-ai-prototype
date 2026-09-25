import { useState } from 'react'
import { Button } from '../components'
import type { ClientAgreementView } from '../services/clientAccount'
import { getCARequestsForVA } from '../services/vaAccount'
import { NewCARequestWizard } from './NewCARequestWizard'
import './AdminNewCARequestScreen.css'

export interface AdminNewCARequestScreenProps {
  agreement: ClientAgreementView
  /** Called when the wizard's final step's primary button is clicked — sends Admin to the C&A table. */
  onFinish: () => void
}

/** Admin's "Request for Changes" flow, opened from an agreement's own detail screen — the same wizard as the VA's, plus the "Request on behalf of" Client/VA selector Figma adds for Admin. */
export const AdminNewCARequestScreen = ({ agreement, onFinish }: AdminNewCARequestScreenProps) => {
  const recentRequest = getCARequestsForVA(agreement.vaEmail)[0]
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1)

  return (
    <div className="admin-ca-wizard-screen">
      <div className="admin-ca-wizard-screen__header">
        <h1 className="admin-ca-wizard-screen__title">{wizardStep === 4 ? 'Success' : 'Changes & Approvals Form'}</h1>
        {wizardStep !== 4 && <Button type="tertiary" buttonText="Click to see SAM Contact Info" />}
      </div>
      <NewCARequestWizard
        vaEmail={agreement.vaEmail}
        agreementId={agreement.id}
        recentRequest={recentRequest}
        agreementSettings={agreement.settings}
        showOnBehalfOf
        onStepChange={setWizardStep}
        finishButtonLabel="Go to C&A Table"
        onFinish={onFinish}
      />
    </div>
  )
}
