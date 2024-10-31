'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { auth, db } from '@/lib/firebase'
import { collection, query, getDocs, addDoc, orderBy, serverTimestamp, onSnapshot, Timestamp } from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'

interface Recipe {
  id: string;
  title: string;
  description: string;
  author: string;
  image: string;
}

interface Discussion {
  id: string;
  title: string;
  author: string;
  content: string;
  timestamp: Timestamp;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  image: string;
}

export default function CommunityPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' })
  const [newComment, setNewComment] = useState('')
  const [expandedDiscussion, setExpandedDiscussion] = useState<string | null>(null)
  const { toast } = useToast()
  const [user] = useAuthState(auth)

  useEffect(() => {
    const fetchRecipes = async () => {
      const q = query(collection(db, 'recipes'))
      const querySnapshot = await getDocs(q)
      setRecipes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe)))
    }

    const fetchBlogPosts = async () => {
      const q = query(collection(db, 'blogPosts'))
      const querySnapshot = await getDocs(q)
      setBlogPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)))
    }

    const fetchDiscussions = async () => {
      const q = query(collection(db, 'discussions'), orderBy('timestamp', 'desc'))
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedDiscussions: Discussion[] = []
        querySnapshot.forEach((doc) => {
          fetchedDiscussions.push({ id: doc.id, ...doc.data() } as Discussion)
        })
        setDiscussions(fetchedDiscussions)
      })

      return () => unsubscribe()
    }

    fetchRecipes()
    fetchBlogPosts()
    fetchDiscussions()
  }, [])

  const handleNewDiscussion = async () => {
    if (newDiscussion.title && newDiscussion.content && user) {
      try {
        await addDoc(collection(db, 'discussions'), {
          title: newDiscussion.title,
          author: user.email,
          content: newDiscussion.content,
          timestamp: serverTimestamp(),
        })
        
        setNewDiscussion({ title: '', content: '' })
        toast({
          title: "Discussion Created",
          description: "Your new discussion has been posted successfully.",
        })
      } catch {
        toast({
          title: "Error",
          description: "Failed to create discussion. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleNewComment = async (discussionId: string) => {
    if (newComment && user) {
      try {
        const discussionRef = collection(db, 'discussions', discussionId, 'comments')
        await addDoc(discussionRef, {
          author: user.email,
          content: newComment,
          timestamp: serverTimestamp()
        })

        setNewComment('')
        toast({
          title: "Comment Added",
          description: "Your comment has been added successfully.",
        })
      } catch {
        toast({
          title: "Error",
          description: "Failed to add comment. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const filteredRecipes = recipes.filter(recipe => 
    (recipe.title && recipe.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (recipe.author && recipe.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  

  const filteredDiscussions = discussions.filter(discussion => 
    discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discussion.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredBlogPosts = blogPosts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Community</h1>
      <Input
        placeholder="Search community content..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-8 max-w-md"
      />
      <Tabs defaultValue="recipes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
        </TabsList>
        <TabsContent value="recipes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id}>
                <CardHeader>
                  <CardTitle>{recipe.title}</CardTitle>
                  <CardDescription>By {recipe.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <img src={recipe.image} alt={recipe.title} className="w-full h-40 object-cover rounded-md mb-4" />
                  <p className="text-sm text-muted-foreground">{recipe.description}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View Recipe</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="discussions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Start a New Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Discussion Title"
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                />
                <Textarea
                  placeholder="What would you like to discuss?"
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleNewDiscussion}>Post Discussion</Button>
            </CardFooter>
          </Card>
          {filteredDiscussions.map((discussion) => (
            <Card key={discussion.id}>
              <CardHeader>
                <CardTitle>{discussion.title}</CardTitle>
                <CardDescription>Started by {discussion.author} on {discussion.timestamp?.toDate().toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{discussion.content}</p>
                <Button
                  variant="outline"
                  onClick={() => setExpandedDiscussion(expandedDiscussion === discussion.id ? null : discussion.id)}
                >
                  {expandedDiscussion === discussion.id ? 'Hide Comments' : 'Show Comments'}
                </Button>
                {expandedDiscussion === discussion.id && (
                  <div className="mt-4 space-y-4">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button onClick={() => handleNewComment(discussion.id)}>Post Comment</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="blog" className="space-y-4">
          {filteredBlogPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>By {post.author} on {post.date}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row gap-4">
                <img src={post.image} alt={post.title} className="w-full md:w-1/3 h-40 object-cover rounded-md" />
                <p className="text-sm text-muted-foreground md:w-2/3">{post.excerpt}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Read Full Post</Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
