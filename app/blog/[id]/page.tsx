"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase/config"
import { doc, getDoc, collection, query, getDocs, limit } from "firebase/firestore"
import { Calendar, User, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

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
  images?: string[] // Added gallery images display
}

export default function BlogPostPage() {
  const params = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      if (!params.id) return

      try {
        const docRef = doc(db, "blog_posts", params.id as string)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const postData = { id: docSnap.id, ...docSnap.data() } as BlogPost
          setPost(postData)

          // Fetch related posts
          const q = query(collection(db, "blog_posts"), limit(4))
          const querySnapshot = await getDocs(q)
          const allPosts = querySnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }) as BlogPost)
            .filter((p) => p.id !== postData.id)

          const related = allPosts
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
            .slice(0, 3)

          setRelatedPosts(related)
        }
      } catch (error) {
        console.error("Error fetching post:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copiado para a área de transferência!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando artigo...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Artigo não encontrado.</p>
            <Link href="/blog">
              <Button variant="outline">Voltar ao Blog</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* Hero Image */}
        <div className="relative h-[40vh] md:h-[60vh] bg-secondary">
          <img
            src={post.imageUrl || "/placeholder.svg?height=800&width=1600&query=engineering"}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-20 md:-mt-32 relative z-10">
          <div className="max-w-4xl mx-auto">
            <article className="bg-card rounded-lg shadow-xl p-6 md:p-12 space-y-6 md:space-y-8">
              {/* Back Button */}
              <Link
                href="/blog"
                className="inline-flex items-center text-muted-foreground hover:text-primary text-sm md:text-base"
              >
                <ArrowLeft className="mr-2" size={18} />
                Voltar ao Blog
              </Link>

              {/* Category */}
              {post.category && (
                <span className="inline-block px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium bg-primary/10 text-primary rounded-full">
                  {post.category}
                </span>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-balance leading-tight">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm md:text-base text-muted-foreground pb-6 md:pb-8 border-b border-border">
                <div className="flex items-center gap-2">
                  <User size={18} />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto">
                  <Share2 size={18} className="mr-2" />
                  <span className="hidden sm:inline">Compartilhar</span>
                </Button>
              </div>

              {/* Excerpt */}
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed italic">{post.excerpt}</p>

              {/* Content */}
              <div className="prose prose-sm md:prose-lg max-w-none">
                <div className="text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</div>
              </div>

              {/* Gallery Images */}
              {post.images && post.images.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl md:text-2xl font-serif font-bold mb-4">Galeria de Imagens</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {post.images.map((img, index) => (
                      <div key={index} className="rounded-lg overflow-hidden border border-border">
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`Galeria ${index + 1}`}
                          className="w-full h-48 md:h-64 object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-12 md:mt-16 mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6 md:mb-8">Artigos Relacionados</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost.id} href={`/blog/${relatedPost.id}`}>
                      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden border-border group">
                        <div className="aspect-video overflow-hidden bg-secondary">
                          <img
                            src={relatedPost.imageUrl || "/placeholder.svg?height=300&width=400&query=engineering"}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardContent className="p-4 space-y-2">
                          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors text-sm md:text-base">
                            {relatedPost.title}
                          </h3>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {new Date(relatedPost.publishedAt).toLocaleDateString("pt-BR")}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
