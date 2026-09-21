import { useState } from 'react'
import { ProfileCard, AgreementCard, CACard, Chip, Button, Icon } from '../components'
import type { AuthenticatedUser } from '../services/auth'
import {
  getVAProfile,
  getAgreementsForVA,
  getCARequestsForVA,
  getCARequestById,
  AGREEMENT_STATUS_LABEL,
  AGREEMENT_STATUS_TONE,
  CA_STATUS_LABEL,
  CA_STATUS_TONE,
} from '../services/vaAccount'
import { CADetailsView } from './CADetailsView'
import { VAInvoicesPanel } from './VAInvoicesPanel'
import './MyAccountScreen.css'

export interface MyAccountScreenProps {
  user: AuthenticatedUser
  onViewInvoice: (invoiceId: string) => void
  onViewAgreement: (agreementId: string) => void
}

/** The VA's home screen after login (Figma's "My Account" — Invoice Preview state). */
export const MyAccountScreen = ({ user, onViewInvoice, onViewAgreement }: MyAccountScreenProps) => {
  const [selectedCARequestId, setSelectedCARequestId] = useState<string | null>(null)

  const profile = getVAProfile(user.email)
  const agreements = getAgreementsForVA(user.email)
  const caRequests = getCARequestsForVA(user.email)
  const selectedCARequest = selectedCARequestId ? getCARequestById(selectedCARequestId) : undefined

  return (
    <>
      <div className="my-account-screen__header">
        {selectedCARequest ? (
          <Button
            type="primary"
            leftIcon="chevron-left"
            buttonText="Back to Your Account"
            onClick={() => setSelectedCARequestId(null)}
          />
        ) : (
          <h1 className="my-account-screen__title">My Account</h1>
        )}
        <Button type="tertiary" buttonText="Click to see SAM Contact Info" />
      </div>

      {selectedCARequest ? (
        <CADetailsView request={selectedCARequest} />
      ) : (
        <>
          <div className="my-account-screen__row">
            <div className="my-account-screen__column">
              {profile && (
                <ProfileCard
                  header={
                    <div className="my-account-screen__profile-header">
                      <Icon name="clipboard-user" size={40} />
                      <div>
                        <h2 className="my-account-screen__profile-name">{user.name}</h2>
                        <p className="my-account-screen__profile-description">
                          VA since {profile.vaSinceDate}
                        </p>
                        <p className="my-account-screen__profile-description">
                          SAM: {profile.samContactName}
                        </p>
                      </div>
                      <Chip
                        label={profile.hiredStatus === 'hired' ? 'Hired' : 'Inactive'}
                        tone={profile.hiredStatus === 'hired' ? 'orange' : 'red'}
                        className="my-account-screen__profile-chip"
                      />
                    </div>
                  }
                >
                  <div className="my-account-screen__field-list">
                    <div className="my-account-screen__field-row">
                      <span>Legal Name</span>
                      <span className="my-account-screen__field-value">{profile.legalName}</span>
                    </div>
                    <div className="my-account-screen__field-row">
                      <span>User</span>
                      <span className="my-account-screen__field-value">{user.email}</span>
                    </div>
                    <div className="my-account-screen__field-row">
                      <span>Telegram</span>
                      <span className="my-account-screen__field-value my-account-screen__field-value--link">
                        {profile.telegramHandle}
                      </span>
                    </div>
                    <div className="my-account-screen__field-row">
                      <span>Payment Email</span>
                      <span className="my-account-screen__field-value">{profile.paymentEmail}</span>
                    </div>
                    <div className="my-account-screen__field-row">
                      <span>Payment Method</span>
                      <span className="my-account-screen__field-value">{profile.paymentMethod}</span>
                    </div>
                  </div>
                </ProfileCard>
              )}

              <ProfileCard
                header={
                  <>
                    <span className="my-account-screen__section-title">Agreements</span>
                    <Button type="secondary" buttonText="Filter" />
                  </>
                }
              >
                <div className="my-account-screen__card-list my-account-screen__card-list--scrollable">
                  {agreements.map((agreement) => (
                    <AgreementCard
                      key={agreement.id}
                      title={`${agreement.clientName} @ ${agreement.vaHourlyRate}`}
                      statusLabel={AGREEMENT_STATUS_LABEL[agreement.status]}
                      statusTone={AGREEMENT_STATUS_TONE[agreement.status]}
                      hoursPerWeek={agreement.hoursPerWeek}
                      vaRate={agreement.vaRate}
                      dateStart={agreement.dateStart}
                      dateEnd={agreement.dateEnd}
                      week={agreement.week}
                      onClick={() => onViewAgreement(agreement.id)}
                    />
                  ))}
                </div>
              </ProfileCard>
            </div>

            <div className="my-account-screen__column">
              <ProfileCard
                header={<span className="my-account-screen__section-title">Changes &amp; Approvals Submissions</span>}
              >
                <div className="my-account-screen__card-list">
                  {caRequests.map((request) => (
                    <CACard
                      key={request.id}
                      title={request.title}
                      date={request.date}
                      statusLabel={CA_STATUS_LABEL[request.status]}
                      statusTone={CA_STATUS_TONE[request.status]}
                      onClick={() => setSelectedCARequestId(request.id)}
                    />
                  ))}
                </div>
              </ProfileCard>
            </div>
          </div>

          <h2 className="my-account-screen__section-title my-account-screen__invoices-title">
            Virtual Latinos Invoices
          </h2>
          <VAInvoicesPanel userEmail={user.email} onViewInvoice={onViewInvoice} />
        </>
      )}
    </>
  )
}
