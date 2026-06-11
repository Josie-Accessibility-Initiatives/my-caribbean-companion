export type DocumentType =
  'guide' | 'form' | 'authority' |
  'competent_authority' | 'reference'

export type CSMEDocument = {
  id: string
  title: string
  description: string
  url: string
  type: DocumentType
  lastVerified: string
  source: string
  categories?: string[]
}

export type CSMEDocumentsData = {
  global: CSMEDocument[]
  by_country: Record<string, CSMEDocument[]>
  by_category: Record<string, CSMEDocument[]>
}
