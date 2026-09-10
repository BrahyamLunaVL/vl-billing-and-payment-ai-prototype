import { useState } from 'react'
import { ProfileCard, AgreementCard, CACard, Invoice, Chip, Button, Icon, TabBar } from '../components'
import type { AuthenticatedUser } from '../services/auth'
import {
  getVAProfile,
  getAgreementsForVA,
  getCARequestsForVA,
  getCARequestById,
  getInvoicesForVA,
  AGREEMENT_STATUS_LABEL,
  AGREEMENT_STATUS_TONE,
  CA_STATUS_LABEL,
  CA_STATUS_TONE,
} from '../services/vaAccount'
import { CADetailsView } from './CADetailsView'
import './MyAccountScreen.css'

export interface MyAccountScreenProps {
  user: AuthenticatedUser
  onViewInvoice: (invoiceId: string) => void
}

const INVOICE_TABS = [
  { key: 'preview', label: 'Invoice Preview' },
  { key: 'approved', label: 'Approved Invoices' },
  { key: 'pending', label: 'Pending Approval' },
  { key: 'previously-approved', label: 'Previously Approved' },
  { key: 'past', label: 'Past' },
]

/** The VA's home screen after login (Figma's "My Account" — Invoice Preview state). */
export const MyAccountScreen = ({ user, onViewInvoice }: MyAccountScreenProps) => {
  const [selectedTab, setSelectedTab] = useState('preview')
  const [selectedCARequestId, setSelectedCARequestId] = useState<string | null>(null)

  const profile = getVAProfile(user.email)
  const agreements = getAgreementsForVA(user.email)
  const caRequests = getCARequestsForVA(user.email)
  const invoices = getInvoicesForVA(user.email)
  const selectedCARequest = selectedCARequestId ? getCARequestById(selectedCARequestId) : undefined

  return (
    <>
      <div className="my-account-screen__header">
        {selectedCARequest ? (
          <Button
            type="tertiary"
            leftIcon="chevron-left"
            buttonText="Back to Changes & Approvals"
            onClick={() => setSelectedCARequestId(null)}
          />
        ) : (
          <h1 className="my-account-screen__title">My Account</h1>
        )}
        <Button type="secondary" buttonText="Click to see SAM Contact Info" />
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
                    <Button type="secondary" buttonText="Filter" size="small" />
                  </>
                }
              >
                <div className="my-account-screen__card-list">
                  {agreements.map((agreement) => (
                    <AgreementCard
                      key={agreement.id}
                      title={agreement.clientName}
                      statusLabel={AGREEMENT_STATUS_LABEL[agreement.status]}
                      statusTone={AGREEMENT_STATUS_TONE[agreement.status]}
                      hoursPerWeek={agreement.hoursPerWeek}
                      vaRate={agreement.vaRate}
                      clientRate={agreement.clientRate}
                      dateStart={agreement.dateStart}
                      dateEnd={agreement.dateEnd}
                      week={agreement.week}
                    />
                  ))}
                </div>
              </ProfileCard>
            </div>

            <div className="my-account-screen__column">
              <ProfileCard header={<span className="my-account-screen__section-title">Changes &amp; Approvals</span>}>
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
          <TabBar tabs={INVOICE_TABS} selectedKey={selectedTab} onSelectTab={setSelectedTab} />

          {selectedTab === 'preview' ? (
            <>
              <p className="my-account-screen__notice">
                Invoices listed here were not approved on time prior to payment period deadline, and
                will NOT be paid until the next pay period. You&apos;ll still need to approve these
                invoices prior to the NEXT pay period, which you&apos;ll be able to approve at any
                time if the invoice shows up here.
              </p>
              {invoices.map((invoice) => (
                <Invoice
                  key={invoice.id}
                  title={invoice.title}
                  items={invoice.items}
                  totalLabel={invoice.totalLabel}
                  totalAmount={invoice.totalAmount}
                  warnings={invoice.warnings}
                  approvedMessage={invoice.approvedMessage}
                  actions={[
                    { key: 'view', label: 'View', onClick: () => onViewInvoice(invoice.id) },
                    { key: 'approve', label: 'Approve' },
                    { key: 'upload', label: 'Upload Reports' },
                    { key: 'claim', label: 'Request Invoice Review (Claim)' },
                  ]}
                />
              ))}
              <p className="my-account-screen__notice">
                Any invoices for which you&apos;ve requested any changes that are pending approval by
                our admin team.
              </p>
              <p className="my-account-screen__notice">No changes pending yet</p>
            </>
          ) : (
            <p className="my-account-screen__notice">Nothing to show here yet.</p>
          )}
        </>
      )}
    </>
  )
}
