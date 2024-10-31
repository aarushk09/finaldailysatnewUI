'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from 'next/link'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const { toast } = useToast()
  const [cart, setCart] = useState<Product[]>([])

  useEffect(() => {
    // Simulating API call to fetch products
    const fetchedProducts: Product[] = [
      { id: 1, name: 'Fresh Strawberries', description: 'Sweet and juicy', price: 4.99, image: '/placeholder.svg?height=300&width=300', category: 'Fruits' },
      { id: 2, name: 'Organic Eggs', description: 'Farm fresh', price: 3.99, image: '/placeholder.svg?height=300&width=300', category: 'Dairy' },
      { id: 3, name: 'Artisan Cheese', description: 'Locally crafted', price: 6.99, image: '/placeholder.svg?height=300&width=300', category: 'Dairy' },
      { id: 4, name: 'Heirloom Tomatoes', description: 'Vibrant and flavorful', price: 3.49, image: '/placeholder.svg?height=300&width=300', category: 'Vegetables' },
      { id: 5, name: 'Organic Honey', description: 'Pure and natural', price: 8.99, image: '/placeholder.svg?height=300&width=300', category: 'Other' },
      { id: 6, name: 'Fresh Basil', description: 'Aromatic herb', price: 2.49, image: '/placeholder.svg?height=300&width=300', category: 'Herbs' },
    ]
    setProducts(fetchedProducts)
  }, [])

  useEffect(() => {
    const fetchCart = async () => {
      const user = auth.currentUser
      if (user) {
        const cartRef = doc(db, 'users', user.uid)
        const cartSnapshot = await getDoc(cartRef)

        if (cartSnapshot.exists()) {
          setCart(cartSnapshot.data().cart || [])
        }
      }
    }
    fetchCart()
  }, [])

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === "all" || product.category === selectedCategory)
  )

  const addToCart = async (product: Product) => {
    const user = auth.currentUser
    if (user) {
      const newCart = [...cart, product]
      setCart(newCart)

      await setDoc(doc(db, 'users', user.uid), { cart: newCart }, { merge: true })

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      })
    } else {
      toast({
        title: "Error",
        description: "You must be logged in to add items to your cart.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Marketplace</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-1/3"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="md:w-1/3">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Fruits">Fruits</SelectItem>
            <SelectItem value="Vegetables">Vegetables</SelectItem>
            <SelectItem value="Dairy">Dairy</SelectItem>
            <SelectItem value="Herbs">Herbs</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="rounded-md object-cover w-full h-full"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <span className="font-bold">${product.price.toFixed(2)}</span>
              <Button onClick={() => addToCart(product)}>Add to Cart</Button>
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
