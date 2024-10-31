'use client'

import { Button } from "@/components/ui/button"
import { ShoppingCart, Leaf } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { signOut } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { collection, query, getDocs } from 'firebase/firestore'

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user] = useAuthState(auth)
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
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

    fetchCart()
  }, [user])

  const handleSignOut = () => {
    
    signOut(auth)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold">Farm-to-Table</h1>
          </div>
          <nav className="hidden md:flex space-x-4">
            <Button variant={pathname === '/' ? 'default' : 'ghost'} asChild><Link href="/">Home</Link></Button>
            <Button variant={pathname === '/marketplace' ? 'default' : 'ghost'} asChild><Link href="/marketplace">Marketplace</Link></Button>
            <Button variant={pathname === '/farms' ? 'default' : 'ghost'} asChild><Link href="/farms">Farms</Link></Button>
            <Button variant={pathname === '/community' ? 'default' : 'ghost'} asChild><Link href="/community">Community</Link></Button>
          </nav>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Cart ({getTotalItems()})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Your Cart</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {cart.map((item) => (
                  <DropdownMenuItem key={item.id}>
                    {item.name} (x{item.quantity}) - ${(item.price * item.quantity).toFixed(2)}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/checkout" className="w-full">Checkout</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{user.email}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild><Link href="/auth">Sign In</Link></Button>
            )}
          </div>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}