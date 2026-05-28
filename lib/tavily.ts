import { tavily } from '@tavily/core'

const client = tavily({
  apiKey: process.env.TAVILY_API_KEY!
})

export type TavilySearchResult = {
  title: string
  url: string
  content: string
  score: number
}

export async function searchWeb(
  query: string,
  options?: {
    includeDomains?: string[]
    excludeDomains?: string[]
    maxResults?: number
    searchDepth?: 'basic' | 'advanced'
  }
): Promise<TavilySearchResult[]> {
  const response = await client.search(query, {
    searchDepth: options?.searchDepth ?? 'basic',
    maxResults: options?.maxResults ?? 5,
    includeDomains: options?.includeDomains,
    excludeDomains: options?.excludeDomains
  })

  return response.results.map(r => ({
    title: r.title,
    url: r.url,
    content: r.content,
    score: r.score
  }))
}

export const COST_OF_LIVING_DOMAINS = [
  'globalcostdata.com',
  'numbeo.com',
  'expatistan.com',
  'livingcost.org'
]

export const QUALITY_OF_LIFE_DOMAINS = [
  'teleport.org',
  'numbeo.com',
  'worlddata.info'
]
