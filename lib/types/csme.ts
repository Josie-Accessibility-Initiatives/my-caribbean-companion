export type Country = {
  id: number
  code: string
  name: string
  immigrationUrl: string | null
  competentAuthorityUrl: string | null
  formsUrl: string | null
  notes: string | null
}

export type Category = {
  id: number
  code: string
  label: string
  description: string | null
}

export type CSMEComplexity = {
  complexity: 'easy' | 'moderate' | 'hard'
  processingWeeks: { min: number; max: number }
  competentAuthority: string
  skillsCertificateRequired: boolean
  notes: string
  inDemandProfessions: string[]
}

export type CSMEComplexityMap = Record<string, CSMEComplexity>
