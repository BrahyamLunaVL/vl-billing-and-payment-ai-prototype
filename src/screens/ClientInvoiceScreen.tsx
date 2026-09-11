import type { AuthenticatedUser } from '../services/auth'
import { ClientInvoicesPanel } from './ClientInvoicesPanel'
import './ClientInvoiceScreen.css'

export interface ClientInvoiceScreenProps {
  user: AuthenticatedUser
}

/**
 * The client's full "Invoices" page (Figma's "Client Invoice"), reachable
 * from the sidebar — every VA's invoices under this client's account, in
 * the same Per VA / Per Charge Type breakdown shown inline on My Account.
 */
export const ClientInvoiceScreen = ({ user }: ClientInvoiceScreenProps) => {
  return (
    <>
      <h1 className="client-invoice-screen__title">Invoices</h1>
      <ClientInvoicesPanel clientEmail={user.email} />
    </>
  )
}
