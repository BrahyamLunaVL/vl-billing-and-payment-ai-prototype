import { useState } from 'react'
import type { AuthenticatedUser } from '../services/auth'
import { VAAppShell } from './VAAppShell'
import { MyAccountScreen } from './MyAccountScreen'
import { ChangesApprovalsScreen } from './ChangesApprovalsScreen'
import { InvoicePreviewScreen } from './InvoicePreviewScreen'
import { ClientAgreementScreen } from './ClientAgreementScreen'

export interface VAAppProps {
  user: AuthenticatedUser
}

type VAPage = 'my-account' | 'changes-approvals' | 'invoice-preview' | 'agreement'

/** Owns which VA page is showing and drives the shared Sidebar's selection to match. */
export const VAApp = ({ user }: VAAppProps) => {
  const [page, setPage] = useState<VAPage>('my-account')
  const [selectedSidebarItem, setSelectedSidebarItem] = useState('my-account')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null)
  /** Skips the Changes & Approvals list and opens the "New Request" wizard directly — set by the Agreement screen's "Request Changes" button. */
  const [openWizardDirectly, setOpenWizardDirectly] = useState(false)

  const handleSelectSidebarItem = (key: string) => {
    setSelectedSidebarItem(key)
    if (key === 'my-account') setPage('my-account')
    else if (key === 'changes-approvals-form') {
      setOpenWizardDirectly(false)
      setPage('changes-approvals')
    }
  }

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId)
    setSelectedSidebarItem('invoices')
    setPage('invoice-preview')
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
      {page === 'invoice-preview' && selectedInvoiceId && (
        <InvoicePreviewScreen invoiceId={selectedInvoiceId} onBack={handleBackToMyAccount} />
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
