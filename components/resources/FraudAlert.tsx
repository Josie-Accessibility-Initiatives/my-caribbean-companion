import { AlertTriangle } from 'lucide-react'

interface FraudAlertProps {
  context?: 'documents' | 'jobs' | 'housing' | 'general'
}

const CONTENT: Record<
  NonNullable<FraudAlertProps['context']>,
  { body: string; flags: string[] }
> = {
  documents: {
    body: 'Never pay an unofficial agent or individual to process your CSME Skills Certificate. All applications go directly through your home country\'s Competent Authority at no unofficial cost. If someone asks you to pay them to process your application, it is a scam.',
    flags: [
      'Asking for cash payment to process your Skills Certificate',
      'Claiming to have government connections that speed up your application',
      'Requesting copies of your passport before you have a job offer',
    ],
  },
  jobs: {
    body: 'Be cautious of job offers that require upfront payment for visa processing, training fees, or equipment. Legitimate Caribbean employers under CSME do not charge workers to secure employment.',
    flags: [
      'Requiring upfront payment for visa or work permit processing',
      'Job offers with unusually high salaries for entry-level roles',
      'Employers who cannot be verified on LinkedIn or company websites',
    ],
  },
  housing: {
    body: 'Never transfer money for a rental deposit without viewing the property in person or via video call with the actual landlord. Rental scams are common on Facebook Marketplace and WhatsApp groups.',
    flags: [
      'Landlord cannot meet in person or do a live video tour',
      'Rent price significantly below market rate for the area',
      'Requests for deposit via wire transfer or cryptocurrency',
    ],
  },
  general: {
    body: 'Scams targeting Caribbean migrants are common. Never pay unofficial agents to process documents, never transfer money for unseen rentals, and always verify job offers directly with the employer. If something feels wrong, it probably is.',
    flags: [
      'Requests for upfront payment for documents or jobs',
      'Unseen rental deposits via wire transfer',
      'Unofficial agents claiming government connections',
    ],
  },
}

export default function FraudAlert({ context = 'general' }: FraudAlertProps) {
  const { body, flags } = CONTENT[context]

  return (
    <div className="fraud-alert">
      <div className="fraud-alert-title">
        <AlertTriangle size={18} />
        Protect yourself from scams
      </div>
      <p>{body}</p>
      <ul>
        {flags.map((flag) => (
          <li key={flag}>{flag}</li>
        ))}
      </ul>
    </div>
  )
}
