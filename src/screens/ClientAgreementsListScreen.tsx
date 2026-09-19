import { AgreementDetailsCard, Button } from '../components'
import type { AuthenticatedUser } from '../services/auth'
import { getAgreementsForClient } from '../services/clientAccount'
import { AGREEMENT_STATUS_LABEL, AGREEMENT_STATUS_TONE } from '../services/vaAccount'
import './ClientAgreementsListScreen.css'

export interface ClientAgreementsListScreenProps {
  user: AuthenticatedUser
  onEditAgreement: (agreementId: string) => void
  onRequestChanges: (agreementId: string) => void
}

/**
 * The client's dedicated "Client Agreements" list (Figma's "Client -
 * Agreements"), reached from the sidebar's "Agreements & Work Hrs" item —
 * the same agreement cards, same layout, shown inline on My Account.
 */
export const ClientAgreementsListScreen = ({
  user,
  onEditAgreement,
  onRequestChanges,
}: ClientAgreementsListScreenProps) => {
  const agreements = getAgreementsForClient(user.email)

  return (
    <>
      <div className="client-agreements-list-screen__header">
        <h1 className="client-agreements-list-screen__title">Client Agreements</h1>
        <Button type="secondary" buttonText="Filter" />
      </div>
      <div className="client-agreements-list-screen__card-list">
        {agreements.map((agreement) => (
          <AgreementDetailsCard
            key={agreement.id}
            title={`${agreement.vaName} | ${agreement.hoursPerWeek} @ ${agreement.billedRate}/hr`}
            statusLabel={AGREEMENT_STATUS_LABEL[agreement.status]}
            statusTone={AGREEMENT_STATUS_TONE[agreement.status]}
            hoursPerWeek={agreement.hoursPerWeek}
            billingType={agreement.billingType}
            dateStart={agreement.dateStart}
            vaName={agreement.vaName}
            vaHiredStatus={agreement.vaHiredStatus}
            vaTelegramHandle={agreement.vaTelegramHandle}
            vaCountry={agreement.vaCountry}
            vaAka={agreement.vaAka}
            onEditAgreement={() => onEditAgreement(agreement.id)}
            onRequestChanges={() => onRequestChanges(agreement.id)}
          />
        ))}
      </div>
    </>
  )
}
