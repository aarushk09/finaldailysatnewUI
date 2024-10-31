'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search,  MessageCircle,  } from 'lucide-react'

import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { auth, db } from '@/lib/firebase'
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface Farm {
  id: string;
  name: string;
  distance: string;
  farmerName: string;
  since: number;
  image: string;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [farms, setFarms] = useState<Farm[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const { toast } = useToast()
  const [user] = useAuthState(auth)

  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(collection(db, "products"))
      const querySnapshot = await getDocs(q)
      const fetchedProducts: Product[] = []
      querySnapshot.forEach((doc) => {
        fetchedProducts.push({ id: doc.id, ...doc.data() } as Product)
      })
      setProducts(fetchedProducts)
    }

    const fetchFarms = async () => {
      const q = query(collection(db, "farms"))
      const querySnapshot = await getDocs(q)
      const fetchedFarms: Farm[] = []
      querySnapshot.forEach((doc) => {
        fetchedFarms.push({ id: doc.id, ...doc.data() } as Farm)
      })
      setFarms(fetchedFarms)
    }

    const fetchCart = async () => {
      if (user) {
        const q = query(collection(db, `users/${user.uid}/cart`))
        const querySnapshot = await getDocs(q)
        const fetchedCart: CartItem[] = []
        querySnapshot.forEach((doc) => {
          fetchedCart.push({ id: doc.id, ...doc.data() } as CartItem)
        })
        setCart(fetchedCart)
      }
    }

    fetchProducts()
    fetchFarms()
    fetchCart()
  }, [user])

  const addToCart = async (product: Product) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to add items to your cart.",
        variant: "destructive",
      })
      return
    }

    const cartRef = collection(db, `users/${user.uid}/cart`)
    const existingItem = cart.find(item => item.id === product.id)

    if (existingItem) {
      const itemRef = doc(db, `users/${user.uid}/cart`, existingItem.id)
      await updateDoc(itemRef, { quantity: existingItem.quantity + 1 })
      setCart(prevCart => prevCart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ))
    } else {
      const newItem = { ...product, quantity: 1 }
      const docRef = await addDoc(cartRef, newItem)
      setCart(prevCart => [...prevCart, { ...newItem, id: docRef.id }])
    }

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const removeFromCart = async (productId: string) => {
    if (!user) return

    const itemRef = doc(db, `users/${user.uid}/cart`, productId)
    await deleteDoc(itemRef)
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-green-400 to-blue-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Fresh, Local Produce at Your Fingertips</h2>
          <p className="text-xl text-white mb-8">Connect with local farmers and enjoy sustainable, organic food.</p>
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for products or farms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-semibold mb-6">Featured Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
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
                  <Button onClick={() => removeFromCart(product.id)}>Remove from Cart</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Map */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-semibold mb-6">Discover Local Farms</h3>
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <img
              src="/placeholder.svg?height=400&width=800"
              alt="Map of local farms"
              className="w-full h-full object-cover"
            />
            {farms.map((farm, index) => (
              <Button
                key={farm.id}
                variant="secondary"
                size="icon"
                className="absolute rounded-full"
                style={{ top: `${20 + index * 25}%`, left: `${30 + index * 15}%` }}
              >
                <MapPin className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Farm Discovery */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-semibold mb-6">Recommended Farms</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {farms.map((farm) => (
              <Card key={farm.id}>
                <CardHeader>
                  <CardTitle>{farm.name}</CardTitle>
                  <CardDescription>{farm.distance}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={farm.image} />
                      <AvatarFallback>{farm.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{farm.farmerName}</p>
                      <p className="text-sm text-muted-foreground">Farmer since {farm.since}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">View Profile</Button>
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
                      <p>{farm.description}</p>
                      <Button className="w-full mt-4">Shop {farm.name} Products</Button>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Engagement */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-semibold mb-6">Community Highlights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Latest Discussions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {['Seasonal Recipes', 'Sustainable Farming Tips', 'Local Food Events'].map((topic, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => toast({ title: "Community", description: "Join the conversation and connect with local food enthusiasts." })}>
                  Join the Conversation
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sustainability Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Carbon Footprint Reduced</span>
                    <Badge variant="secondary">-15% This Month</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Food Waste Prevented</span>
                    <Badge variant="secondary">500 lbs This Week</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Local Farmers Supported</span>
                    <Badge variant="secondary">50+ This Year</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => toast({ title: "Sustainability", description: "Learn more about our environmental impact and initiatives." })}>
                  Learn More
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}