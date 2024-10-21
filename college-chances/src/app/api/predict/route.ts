import { NextResponse } from 'next/server'
import { getGroqChatCompletion } from '@/lib/groq-client'

export async function POST(req: Request) {
  const body = await req.json()
  const { university, gpa, satScore, extracurriculars, query } = body

  let content: string

  if (query) {
    content = `Provide insights about the following college admissions factor: ${query}. Format your response in Markdown, using headers, lists, and emphasis where appropriate.`
  } else {
    content = `Based on the following information, estimate the chances of a student getting admitted to ${university}:
    GPA: ${gpa}
    SAT Score: ${satScore}
    Extracurricular Activities: ${extracurriculars.join(', ')}
    
    Provide a percentage chance and a brief explanation. Format your response in Markdown, using headers, lists, and emphasis where appropriate.`
  }

  try {
    const chatCompletion = await getGroqChatCompletion([
      { role: 'user', content },
    ] as const)

    const response = chatCompletion.choices[0]?.message?.content || ''

    if (query) {
      return NextResponse.json({ response })
    } else {
      // Extract the percentage from the response
      const percentageMatch = response.match(/(\d+(?:\.\d+)?)%/)
      const chance = percentageMatch ? parseFloat(percentageMatch[1]) : null

      return NextResponse.json({ chance, explanation: response })
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 })
  }
}