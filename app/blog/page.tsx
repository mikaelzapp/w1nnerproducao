"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { db } from "@/lib/firebase/config"
import { collection, query, getDocs } from "firebase/firestore"
import { Search, Calendar, User, ArrowRight } from "lucide-react"
import Link from "next/link"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  authorEmail: string
  imageUrl: string
  category: string
  publishedAt: string
  createdAt: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "blog_posts"))
        const querySnapshot = await getDocs(q)
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BlogPost[]

        const sortedPosts = postsData.sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
        )

        setPosts(sortedPosts)
        setFilteredPosts(sortedPosts)
      } catch (error: any) {
        console.error("Error fetching posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  useEffect(() => {
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredPosts(filtered)
  }, [searchTerm, posts])

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <div className="bg-primary text-primary-foreground py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-4 md:space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-serif font-bold text-balance">Blog</h1>
              <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed">
                Insights, novidades e conhecimento sobre engenharia e topografia
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="container mx-auto px-4 -mt-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Buscar artigos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 md:h-14 text-base md:text-lg bg-card shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="container mx-auto px-4 py-12 md:py-16">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando artigos...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-base md:text-lg">
                {searchTerm ? "Nenhum artigo encontrado." : "Nenhum artigo publicado ainda."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border-border group">
                    {/* Image */}
                    <div className="aspect-video overflow-hidden bg-secondary">
                      <img
                        src={post.imageUrl || "/placeholder.svg?height=400&width=600&query=engineering"}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <CardContent className="p-6 space-y-4">
                      {/* Category */}
                      {post.category && (
                        <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                          {post.category}
                        </span>
                      )}

                      {/* Title */}
                      <h2 className="text-xl font-serif font-bold line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-muted-foreground line-clamp-3 leading-relaxed">{post.excerpt}</p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{new Date(post.publishedAt).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>

                      {/* Read More */}
                      <div className="flex items-center gap-2 text-primary font-medium pt-2">
                        <span>Ler mais</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
