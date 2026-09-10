import { useState } from 'react'
import type { AuthenticatedUser } from '../services/auth'
import { VAAppShell } from './VAAppShell'
import { MyAccountScreen } from './MyAccountScreen'
import { ChangesApprovalsScreen } from './ChangesApprovalsScreen'
import { InvoicePreviewScreen } from './InvoicePreviewScreen'

export interface VAAppProps {
  user: AuthenticatedUser
}

type VAPage = 'my-account' | 'changes-approvals' | 'invoice-preview'

/** Owns which VA page is showing and drives the shared Sidebar's selection to match. */
export const VAApp = ({ user }: VAAppProps) => {
  const [page, setPage] = useState<VAPage>('my-account')
  const [selectedSidebarItem, setSelectedSidebarItem] = useState('my-account')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)

  const handleSelectSidebarItem = (key: string) => {
    setSelectedSidebarItem(key)
    if (key === 'my-account') setPage('my-account')
    else if (key === 'changes-approvals-form') setPage('changes-approvals')
  }

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId)
    setSelectedSidebarItem('invoices')
    setPage('invoice-preview')
  }

  const handleBackToMyAccount = () => {
    setSelectedSidebarItem('my-account')
    setPage('my-account')
  }

  return (
    <VAAppShell user={user} selectedSidebarItem={selectedSidebarItem} onSelectSidebarItem={handleSelectSidebarItem}>
      {page === 'my-account' && <MyAccountScreen user={user} onViewInvoice={handleViewInvoice} />}
      {page === 'changes-approvals' && <ChangesApprovalsScreen user={user} />}
      {page === 'invoice-preview' && selectedInvoiceId && (
        <InvoicePreviewScreen invoiceId={selectedInvoiceId} onBack={handleBackToMyAccount} />
      )}
    </VAAppShell>
  )
}
