import { Button } from '../components'
import type { ClientAgreementView } from '../services/clientAccount'
import { getCARequestsForVA } from '../services/vaAccount'
import { NewCARequestWizard } from './NewCARequestWizard'
import './AdminNewCARequestScreen.css'

export interface AdminNewCARequestScreenProps {
  agreement: ClientAgreementView
  onCancel: () => void
}

/** Admin's "Request for Changes" flow, opened from an agreement's own detail screen — the same wizard as the VA's, plus the "Request on behalf of" Client/VA selector Figma adds for Admin. */
export const AdminNewCARequestScreen = ({ agreement, onCancel }: AdminNewCARequestScreenProps) => {
  const recentRequest = getCARequestsForVA(agreement.vaEmail)[0]

  return (
    <div className="admin-ca-wizard-screen">
      <div className="admin-ca-wizard-screen__header">
        <h1 className="admin-ca-wizard-screen__title">Changes & Approvals Form</h1>
        <Button type="secondary" buttonText="Click to see SAM Contact Info" />
      </div>
      <NewCARequestWizard
        recentRequest={recentRequest}
        agreementSettings={agreement.settings}
        showOnBehalfOf
        onCancel={onCancel}
      />
    </div>
  )
}
