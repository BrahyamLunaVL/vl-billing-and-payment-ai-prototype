import { Icon } from '../Icon';
import { Brand } from '../Brand';
import { Chip, type ChipTone } from '../Chip';
import { Button } from '../Button';
import './agreementdetailscard.css';

export interface AgreementDetailsCardProps {
  /** e.g. "Andrea Lucia Mondonedo Edwards | 40 Hours per week @ $18.00/hr". */
  title: string;
  statusLabel: string;
  statusTone?: ChipTone;
  hoursPerWeek: string;
  billingType: string;
  dateStart: string;
  vaName: string;
  vaHiredStatus: 'hired' | 'inactive';
  vaTelegramHandle: string;
  vaCountry: string;
  vaAka: string;
  onEditAgreement?: () => void;
  onRequestChanges?: () => void;
  className?: string;
}

/**
 * A client's agreement summary (Figma's "Agreement Details Card") — the
 * wide, two-tier card shown in the client's My Account agreements list:
 * a header row with the agreement title/status and Edit/Request Changes
 * actions, then a shaded details row with schedule facts plus the VA's
 * name/hired status/Telegram/country/AKA. Unlike `AgreementCard` (the VA's
 * own compact view of their agreement), this is the client's wider,
 * VA-focused view of the same relationship.
 */
export const AgreementDetailsCard = ({
  title,
  statusLabel,
  statusTone = 'blue',
  hoursPerWeek,
  billingType,
  dateStart,
  vaName,
  vaHiredStatus,
  vaTelegramHandle,
  vaCountry,
  vaAka,
  onEditAgreement,
  onRequestChanges,
  className,
}: AgreementDetailsCardProps) => {
  const classNames = ['agreement-details-card', className].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      <div className="agreement-details-card__header">
        <div className="agreement-details-card__title-row">
          <p className="agreement-details-card__title">{title}</p>
          <Chip label={statusLabel} tone={statusTone} />
        </div>
        <div className="agreement-details-card__header-actions">
          <Button
            type="tertiary"
            size="small"
            buttonText="Edit Agreement"
            onClick={onEditAgreement}
            style={{ width: '150px' }}
          />
          <Button
            type="tertiary"
            size="small"
            buttonText="Request Changes"
            onClick={onRequestChanges}
            style={{ width: '150px' }}
          />
        </div>
      </div>
      <div className="agreement-details-card__divider" />
      <div className="agreement-details-card__body">
        <div className="agreement-details-card__facts">
          <div className="agreement-details-card__item">
            <Icon name="clock" size={16} className="agreement-details-card__item-icon" />
            <span>{hoursPerWeek}</span>
          </div>
          <div className="agreement-details-card__item">
            <Icon name="circle-dollar" size={20} className="agreement-details-card__item-icon" />
            <span>Billing Type: {billingType}</span>
          </div>
          <div className="agreement-details-card__item">
            <Icon name="calendar" size={20} className="agreement-details-card__item-icon" />
            <span>{dateStart}</span>
          </div>
        </div>
        <div className="agreement-details-card__va-row">
          <span className="agreement-details-card__va-label">Your VA:</span>
          <span className="agreement-details-card__va-name">{vaName}</span>
          <Chip label={vaHiredStatus === 'hired' ? 'Hired' : 'Inactive'} tone="orange" />
        </div>
        <div className="agreement-details-card__meta-row">
          <div className="agreement-details-card__meta-item">
            <Brand name="telegram" size={16} />
            <span className="agreement-details-card__meta-label">Telegram:</span>
            <span className="agreement-details-card__meta-value agreement-details-card__meta-value--link">
              {vaTelegramHandle}
            </span>
          </div>
          <div className="agreement-details-card__meta-item">
            <Icon name="flag" size={16} className="agreement-details-card__item-icon" />
            <span className="agreement-details-card__meta-label">Country:</span>
            <span className="agreement-details-card__meta-value">{vaCountry}</span>
          </div>
          <div className="agreement-details-card__meta-item">
            <Icon name="circle-user" size={20} className="agreement-details-card__item-icon" />
            <span className="agreement-details-card__meta-label">AKA:</span>
            <span className="agreement-details-card__meta-value">{vaAka}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
