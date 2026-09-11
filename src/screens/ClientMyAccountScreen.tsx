import { useState } from 'react'
import {
  ProfileCard,
  AgreementDetailsCard,
  ContactCard,
  Toggle,
  InvoiceSummary,
  Chip,
  Button,
  Icon,
  TabBar,
} from '../components'
import type { AuthenticatedUser } from '../services/auth'
import {
  getClientProfile,
  getAgreementsForClient,
  getInvoiceBreakdownForClient,
  getInvoiceBreakdownByChargeTypeForClient,
} from '../services/clientAccount'
import { AGREEMENT_STATUS_LABEL, AGREEMENT_STATUS_TONE } from '../services/vaAccount'
import './ClientMyAccountScreen.css'

export interface ClientMyAccountScreenProps {
  user: AuthenticatedUser
  onEditAgreement: (agreementId: string) => void
  onRequestChanges: (agreementId: string) => void
}

const INVOICE_TABS = [
  { key: 'upcoming', label: 'Upcoming Invoice (Current Working Period)' },
  { key: 'all', label: 'All Invoices' },
]

function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`
}

/** The client's home screen after login (Figma's "My Account" — client "Enabled" state). */
export const ClientMyAccountScreen = ({ user, onEditAgreement, onRequestChanges }: ClientMyAccountScreenProps) => {
  const [selectedTab, setSelectedTab] = useState('upcoming')
  const [invoiceViewKey, setInvoiceViewKey] = useState('per-va')

  const profile = getClientProfile(user.email)
  const agreements = getAgreementsForClient(user.email)
  const perVABreakdown = getInvoiceBreakdownForClient(user.email)
  const perChargeTypeBreakdown = getInvoiceBreakdownByChargeTypeForClient(user.email)

  const invoiceTotal = perVABreakdown.reduce((sum, va) => sum + va.totalAmount, 0)

  const perVASections = perVABreakdown.map((va) => ({
    key: va.vaEmail,
    label: va.vaName,
    totalAmount: formatUSD(va.totalAmount),
    sections: va.groups.map((group) => ({
      key: `${va.vaEmail}-${group.group}`,
      label: group.label,
      totalAmount: formatUSD(group.totalAmount),
      items: group.items,
    })),
  }))

  const perChargeTypeSections = perChargeTypeBreakdown.map((group) => ({
    key: group.group,
    label: group.label,
    totalAmount: formatUSD(group.totalAmount),
    items: group.items,
  }))

  return (
    <>
      <div className="client-my-account-screen__header">
        <h1 className="client-my-account-screen__title">My Account</h1>
      </div>

      {profile && (
        <ProfileCard
          header={
            <div className="client-my-account-screen__profile-header">
              <Icon name="buildings" size={40} />
              <div>
                <h2 className="client-my-account-screen__profile-name">{profile.companyName}</h2>
                <p className="client-my-account-screen__profile-description">
                  Client since {profile.clientSinceDate}
                </p>
              </div>
              <Chip
                label={profile.enabled ? 'Enabled' : 'Disabled'}
                tone={profile.enabled ? 'green' : 'red'}
                className="client-my-account-screen__profile-chip"
              />
            </div>
          }
        >
          <div className="client-my-account-screen__field-row">
            <div className="client-my-account-screen__field">
              <span>Legal Name</span>
              <span className="client-my-account-screen__field-value">{profile.legalName}</span>
            </div>
            <div className="client-my-account-screen__field">
              <span>Payment Method</span>
              <span className="client-my-account-screen__field-value">{profile.paymentMethod}</span>
            </div>
            <div className="client-my-account-screen__field">
              <span>Last Updated</span>
              <span className="client-my-account-screen__field-value">{profile.lastUpdatedDate}</span>
            </div>
          </div>
        </ProfileCard>
      )}

      <div className="client-my-account-screen__section">
        <div className="client-my-account-screen__section-header">
          <h2 className="client-my-account-screen__section-title">Agreements</h2>
          <Button type="secondary" buttonText="Filters" />
        </div>
        <div className="client-my-account-screen__card-list">
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
      </div>

      {profile && profile.contacts.length > 0 && (
        <div className="client-my-account-screen__section">
          <h2 className="client-my-account-screen__section-title">Contacts</h2>
          <ProfileCard>
            <div className="client-my-account-screen__card-list">
              {profile.contacts.map((contact, index) => (
                <ContactCard
                  key={contact.email}
                  name={contact.name}
                  accessTypeLabel={contact.accessTypeLabel}
                  description={contact.description}
                  hideDivider={index === profile.contacts.length - 1}
                />
              ))}
            </div>
          </ProfileCard>
        </div>
      )}

      <div className="client-my-account-screen__section">
        <h2 className="client-my-account-screen__section-title">Invoices</h2>
        <TabBar tabs={INVOICE_TABS} selectedKey={selectedTab} onSelectTab={setSelectedTab} />
        <ProfileCard>
          <div className="client-my-account-screen__toggle-row">
            <Toggle
              options={[
                { key: 'per-va', label: 'Per VA', icon: 'user-group' },
                { key: 'per-charge-type', label: 'Per Charge Type', icon: 'folders' },
              ]}
              selectedKey={invoiceViewKey}
              onSelect={setInvoiceViewKey}
            />
          </div>
          {perVABreakdown.length === 0 ? (
            <p className="client-my-account-screen__notice">No invoices found</p>
          ) : (
            <InvoiceSummary
              sections={invoiceViewKey === 'per-va' ? perVASections : perChargeTypeSections}
              totalLabel="(1) Invoice Total:"
              totalAmount={formatUSD(invoiceTotal)}
            />
          )}
        </ProfileCard>
      </div>
    </>
  )
}
