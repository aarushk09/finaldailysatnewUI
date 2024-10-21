'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, BookOpen, Trophy } from 'lucide-react'
import GroqInsights from './groq-insights'

export default function CollegeChances() {
  const [university, setUniversity] = useState('')
  const [gpa, setGpa] = useState(3.0)
  const [satScore, setSatScore] = useState(1200)
  const [extracurriculars, setExtracurriculars] = useState<string[]>([])
  const [chance, setChance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAddExtracurricular = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newActivity = formData.get('extracurricular') as string
    if (newActivity) {
      setExtracurriculars((prev) => [...prev, newActivity])
      e.currentTarget.reset()
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          university,
          gpa,
          satScore,
          extracurriculars,
        }),
      })
      const data = await response.json()
      setChance(data.chance)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">College Chances Calculator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Enter your academic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="university">Dream University</Label>
              <Select onValueChange={setUniversity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a university" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harvard">Harvard University</SelectItem>
                  <SelectItem value="stanford">Stanford University</SelectItem>
                  <SelectItem value="mit">MIT</SelectItem>
                  <SelectItem value="berkeley">UC Berkeley</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="gpa">GPA</Label>
              <Slider
                id="gpa"
                min={0}
                max={4}
                step={0.1}
                value={[gpa]}
                onValueChange={([value]) => setGpa(value)}
              />
              <p className="text-right">{gpa.toFixed(1)}</p>
            </div>
            <div>
              <Label htmlFor="sat">SAT Score</Label>
              <Slider
                id="sat"
                min={400}
                max={1600}
                step={10}
                value={[satScore]}
                onValueChange={([value]) => setSatScore(value)}
              />
              <p className="text-right">{satScore}</p>
            </div>
            <form onSubmit={handleAddExtracurricular} className="flex gap-2">
              <Input name="extracurricular" placeholder="Add extracurricular activity" />
              <Button type="submit">Add</Button>
            </form>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} className="w-full" disabled={loading}>
              {loading ? 'Calculating...' : 'Calculate Chances'}
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Results</CardTitle>
            <CardDescription>Based on your profile</CardDescription>
          </CardHeader>
          <CardContent>
            {chance !== null && (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Your chances of getting into {university}:</h2>
                <div className="text-6xl font-bold text-blue-600 mb-4">{chance}%</div>
                <p className="text-lg mb-4">Keep working hard to improve your chances!</p>
              </div>
            )}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Your Profile Summary</h3>
              <div className="flex items-center gap-2">
                <GraduationCap className="text-blue-500" />
                <span>GPA: {gpa.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="text-green-500" />
                <span>SAT Score: {satScore}</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Trophy className="text-yellow-500" />
                  Extracurricular Activities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {extracurriculars.map((activity, index) => (
                    <Badge key={index} variant="secondary">{activity}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <GroqInsights />
    </div>
  )
}
