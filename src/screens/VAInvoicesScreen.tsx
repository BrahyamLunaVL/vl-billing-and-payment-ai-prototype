import { VAInvoicesPanel } from './VAInvoicesPanel'
import './VAInvoicesScreen.css'

export interface VAInvoicesScreenProps {
  userEmail: string
  onViewInvoice: (invoiceId: string) => void
}

/**
 * The VA's full "Invoices" page, reachable from the sidebar — the same
 * "Virtual Latinos Invoices" section (tabs + breakdown) shown inline on My
 * Account, just on its own page.
 */
export const VAInvoicesScreen = ({ userEmail, onViewInvoice }: VAInvoicesScreenProps) => {
  return (
    <>
      <h1 className="va-invoices-screen__title">Invoices</h1>
      <VAInvoicesPanel userEmail={userEmail} onViewInvoice={onViewInvoice} />
    </>
  )
}
