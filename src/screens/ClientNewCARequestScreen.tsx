import { Button } from '../components'
import type { ClientAgreementView } from '../services/clientAccount'
import { getCARequestsForVA } from '../services/vaAccount'
import { NewCARequestWizard } from './NewCARequestWizard'
import './ClientNewCARequestScreen.css'

export interface ClientNewCARequestScreenProps {
  agreement: ClientAgreementView
  onCancel: () => void
}

/** The client's "Request for Changes" flow, opened from an agreement's own detail screen — the same wizard as the VA's/Admin's, without Admin's "Request on behalf of" selector. */
export const ClientNewCARequestScreen = ({ agreement, onCancel }: ClientNewCARequestScreenProps) => {
  const recentRequest = getCARequestsForVA(agreement.vaEmail)[0]

  return (
    <div className="client-ca-wizard-screen">
      <div className="client-ca-wizard-screen__header">
        <h1 className="client-ca-wizard-screen__title">Changes & Approvals Form</h1>
        <Button type="tertiary" buttonText="Click to see SAM Contact Info" />
      </div>
      <NewCARequestWizard recentRequest={recentRequest} agreementSettings={agreement.settings} onCancel={onCancel} />
    </div>
  )
}
