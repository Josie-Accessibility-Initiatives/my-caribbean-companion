export type CSMEComplexity = {
  complexity: 'easy' | 'moderate' | 'hard'
  processingWeeks: { min: number; max: number }
  competentAuthority: string
  skillsCertificateRequired: boolean
  notes: string
  inDemandProfessions: string[]
}

export type CSMEComplexityMap = Record<string, CSMEComplexity>
