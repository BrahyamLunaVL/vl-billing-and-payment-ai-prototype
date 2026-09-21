import { useState } from 'react'
import type { AuthenticatedUser } from '../services/auth'
import { VAAppShell } from './VAAppShell'
import { MyAccountScreen } from './MyAccountScreen'
import { ChangesApprovalsScreen } from './ChangesApprovalsScreen'
import { InvoicePreviewScreen } from './InvoicePreviewScreen'
import { VAInvoicesScreen } from './VAInvoicesScreen'
import { ClientAgreementScreen } from './ClientAgreementScreen'

export interface VAAppProps {
  user: AuthenticatedUser
}

type VAPage = 'my-account' | 'changes-approvals' | 'invoices' | 'invoice-preview' | 'agreement'

/** Owns which VA page is showing and drives the shared Sidebar's selection to match. */
export const VAApp = ({ user }: VAAppProps) => {
  const [page, setPage] = useState<VAPage>('my-account')
  const [selectedSidebarItem, setSelectedSidebarItem] = useState('my-account')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null)
  /** Skips the Changes & Approvals list and opens the "New Request" wizard directly — set by the Agreement screen's "Request Changes" button. */
  const [openWizardDirectly, setOpenWizardDirectly] = useState(false)
  // Where "View Invoice" was opened from, so "Back" returns there instead of always My Account.
  const [invoiceOrigin, setInvoiceOrigin] = useState<'my-account' | 'invoices'>('my-account')

  const handleSelectSidebarItem = (key: string) => {
    setSelectedSidebarItem(key)
    if (key === 'my-account') setPage('my-account')
    else if (key === 'invoices') setPage('invoices')
    else if (key === 'changes-approvals-form') {
      setOpenWizardDirectly(false)
      setPage('changes-approvals')
    }
  }

  const handleViewInvoice = (invoiceId: string) => {
    setInvoiceOrigin(page === 'invoices' ? 'invoices' : 'my-account')
    setSelectedInvoiceId(invoiceId)
    setSelectedSidebarItem('invoices')
    setPage('invoice-preview')
  }

  const handleBackFromInvoice = () => {
    setSelectedSidebarItem(invoiceOrigin)
    setPage(invoiceOrigin)
  }

  const handleViewAgreement = (agreementId: string) => {
    setSelectedAgreementId(agreementId)
    setPage('agreement')
  }

  const handleBackToMyAccount = () => {
    setSelectedSidebarItem('my-account')
    setPage('my-account')
  }

  const handleRequestChanges = () => {
    setSelectedSidebarItem('changes-approvals-form')
    setOpenWizardDirectly(true)
    setPage('changes-approvals')
  }

  return (
    <VAAppShell user={user} selectedSidebarItem={selectedSidebarItem} onSelectSidebarItem={handleSelectSidebarItem}>
      {page === 'my-account' && (
        <MyAccountScreen user={user} onViewInvoice={handleViewInvoice} onViewAgreement={handleViewAgreement} />
      )}
      {page === 'changes-approvals' && (
        <ChangesApprovalsScreen user={user} openWizard={openWizardDirectly} onFinishWizard={handleBackToMyAccount} />
      )}
      {page === 'invoices' && <VAInvoicesScreen userEmail={user.email} onViewInvoice={handleViewInvoice} />}
      {page === 'invoice-preview' && selectedInvoiceId && (
        <InvoicePreviewScreen invoiceId={selectedInvoiceId} onBack={handleBackFromInvoice} />
      )}
      {page === 'agreement' && selectedAgreementId && (
        <ClientAgreementScreen
          user={user}
          agreementId={selectedAgreementId}
          onBack={handleBackToMyAccount}
          viewerRole="va"
          onRequestChanges={handleRequestChanges}
        />
      )}
    </VAAppShell>
  )
}
