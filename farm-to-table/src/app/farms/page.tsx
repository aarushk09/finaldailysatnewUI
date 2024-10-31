'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from 'next/link'

interface Farm {
  id: number;
  name: string;
  distance: string;
  farmerName: string;
  since: number;
  image: string;
  description: string;
  products: string[];
}

export default function FarmsPage() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Simulating API call to fetch farms
    const fetchedFarms: Farm[] = [
      { id: 1, name: 'Green Acres', distance: '5 miles away', farmerName: 'John Doe', since: 2010, image: '/placeholder.svg?height=40&width=40', description: 'Specializing in organic vegetables and free-range eggs.', products: ['Organic Vegetables', 'Free-range Eggs', 'Honey'] },
      { id: 2, name: 'Sunny Meadows', distance: '7 miles away', farmerName: 'Jane Smith', since: 2015, image: '/placeholder.svg?height=40&width=40', description: 'Known for our delicious berries and homemade jams.', products: ['Strawberries', 'Blueberries', 'Homemade Jams'] },
      { id: 3, name: 'Organic Oasis', distance: '3 miles away', farmerName: 'Bob Johnson', since: 2008, image: '/placeholder.svg?height=40&width=40', description: 'Offering a wide variety of organic produce and dairy products.', products: ['Organic Produce', 'Milk', 'Cheese'] },
      { id: 4, name: 'Hillside Orchard', distance: '10 miles away', farmerName: 'Emily Brown', since: 2012, image: '/placeholder.svg?height=40&width=40', description: 'Specializing in a variety of apples and stone fruits.', products: ['Apples', 'Peaches', 'Plums'] },
    ]
    setFarms(fetchedFarms)
  }, [])

  const filteredFarms = farms.filter(farm => 
    farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farm.farmerName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Local Farms</h1>
      <Input
        placeholder="Search farms or farmers..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-8 max-w-md"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFarms.map((farm) => (
          <Card key={farm.id}>
            <CardHeader>
              <CardTitle>{farm.name}</CardTitle>
              <CardDescription>{farm.distance}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <Avatar>
                  <AvatarImage src={farm.image} />
                  <AvatarFallback>{farm.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{farm.farmerName}</p>
                  <p className="text-sm text-muted-foreground">Farmer since {farm.since}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{farm.description}</p>
              <div>
                <h4 className="font-semibold mb-2">Featured Products:</h4>
                <ul className="list-disc list-inside">
                  {farm.products.map((product, index) => (
                    <li key={index} className="text-sm">{product}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">View Full Profile</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{farm.name}</DialogTitle>
                    <DialogDescription>{farm.distance}</DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar>
                      <AvatarImage src={farm.image} />
                      <AvatarFallback>{farm.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{farm.farmerName}</p>
                      <p className="text-sm text-muted-foreground">Farmer since {farm.since}</p>
                    </div>
                  </div>
                  <p className="mb-4">{farm.description}</p>
                  <h4 className="font-semibold mb-2">Products:</h4>
                  <ul className="list-disc list-inside mb-4">
                    {farm.products.map((product, index) => (
                      <li key={index}>{product}</li>
                    ))}
                  </ul>
                  <Button className="w-full">Shop {farm.name} Products</Button>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href="/" className="text-blue-600 hover:underline">Return to Home</Link>
      </div>
    </div>
  )
}