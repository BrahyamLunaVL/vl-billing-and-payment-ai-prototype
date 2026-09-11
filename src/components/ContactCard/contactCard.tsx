import { Icon } from '../Icon';
import { Button } from '../Button';
import './contactcard.css';

export interface ContactCardProps {
  name: string;
  /** e.g. "Access Type (Admin):". */
  accessTypeLabel: string;
  description: string;
  onCall?: () => void;
  onSendEmail?: () => void;
  /** Hides the bottom divider — set on the last card in a list. */
  hideDivider?: boolean;
  className?: string;
}

/**
 * A single company contact row (Figma's "Contact Card"), used in My
 * Account's Contacts section: a placeholder avatar, name/access-type/
 * description, and Call/Send Email actions.
 */
export const ContactCard = ({
  name,
  accessTypeLabel,
  description,
  onCall,
  onSendEmail,
  hideDivider = false,
  className,
}: ContactCardProps) => {
  const classNames = ['contact-card', className].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      <div className="contact-card__row">
        <span className="contact-card__avatar" aria-hidden="true">
          <Icon name="circle-user" size={24} />
        </span>
        <div className="contact-card__details">
          <p className="contact-card__name">{name}</p>
          <p className="contact-card__access-type">{accessTypeLabel}</p>
          <p className="contact-card__description">{description}</p>
        </div>
        <div className="contact-card__actions">
          <Button type="tertiary" size="small" buttonText="Call" onClick={onCall} style={{ width: '150px' }} />
          <Button
            type="tertiary"
            size="small"
            buttonText="Send Email"
            onClick={onSendEmail}
            style={{ width: '150px' }}
          />
        </div>
      </div>
      {!hideDivider && <div className="contact-card__divider" />}
    </div>
  );
};
