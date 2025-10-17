"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AdminRoute } from "@/components/admin-route"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { db, storage } from "@/lib/firebase/config"
import { collection, getDocs, addDoc, query, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import {
  BookOpen,
  Plus,
  ArrowLeft,
  Loader2,
  Edit2,
  Trash2,
  X,
  ImageIcon,
  Upload,
  Bold,
  Italic,
  List,
  LinkIcon,
  Heading1,
  Heading2,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/firebase/auth-context"
import { logActivity } from "@/lib/firebase/activity-logger"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  imageUrl: string
  images?: string[]
  publishedAt: string
}

export default function AdminBlogPage() {
  return (
    <AdminRoute>
      <AdminBlogContent />
    </AdminRoute>
  )
}

function AdminBlogContent() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    imageUrl: "",
    images: [] as string[],
  })

  useEffect(() => {
    fetchPosts()
  }, [])

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
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (isGallery) {
      setUploadingGallery(true)
    } else {
      setUploadingImage(true)
    }

    try {
      const storageRef = ref(storage, `blog-images/${Date.now()}-${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      if (isGallery) {
        setFormData({ ...formData, images: [...formData.images, downloadURL] })
      } else {
        setFormData({ ...formData, imageUrl: downloadURL })
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Erro ao fazer upload da imagem.")
    } finally {
      if (isGallery) {
        setUploadingGallery(false)
      } else {
        setUploadingImage(false)
      }
    }
  }

  const handleRemoveGalleryImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  const insertFormatting = (format: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.content.substring(start, end)
    let newText = ""
    let cursorOffset = 0

    switch (format) {
      case "bold":
        newText = `**${selectedText || "texto em negrito"}**`
        cursorOffset = selectedText ? newText.length : 2
        break
      case "italic":
        newText = `*${selectedText || "texto em itálico"}*`
        cursorOffset = selectedText ? newText.length : 1
        break
      case "h1":
        newText = `\n# ${selectedText || "Título Principal"}\n`
        cursorOffset = selectedText ? newText.length : 2
        break
      case "h2":
        newText = `\n## ${selectedText || "Subtítulo"}\n`
        cursorOffset = selectedText ? newText.length : 3
        break
      case "list":
        newText = `\n- ${selectedText || "Item da lista"}\n`
        cursorOffset = selectedText ? newText.length : 2
        break
      case "link":
        newText = `[${selectedText || "texto do link"}](url)`
        cursorOffset = selectedText ? newText.length - 5 : newText.length - 4
        break
    }

    const newContent = formData.content.substring(0, start) + newText + formData.content.substring(end)
    setFormData({ ...formData, content: newContent })

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const postData = {
        ...formData,
        author: user?.displayName || user?.email || "Admin",
        authorEmail: user?.email,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }

      await addDoc(collection(db, "blog_posts"), postData)

      await logActivity("blog_post_created", `Post criado: ${formData.title}`, user?.uid || "admin", {
        title: formData.title,
      })

      setFormData({
        title: "",
        excerpt: "",
        content: "",
        category: "",
        imageUrl: "",
        images: [],
      })
      setShowForm(false)
      fetchPosts()
      alert("Post criado com sucesso!")
    } catch (error) {
      console.error("Error creating post:", error)
      alert("Erro ao criar post.")
    } finally {
      setCreating(false)
    }
  }

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category || "",
      imageUrl: post.imageUrl || "",
      images: post.images || [],
    })
    setShowForm(true)
  }

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPost) return

    setCreating(true)

    try {
      await updateDoc(doc(db, "blog_posts", editingPost.id), {
        ...formData,
        updatedAt: new Date().toISOString(),
      })

      await logActivity("blog_post_updated", `Post atualizado: ${formData.title}`, user?.uid || "admin", {
        postId: editingPost.id,
      })

      setFormData({
        title: "",
        excerpt: "",
        content: "",
        category: "",
        imageUrl: "",
        images: [],
      })
      setShowForm(false)
      setEditingPost(null)
      fetchPosts()
      alert("Post atualizado com sucesso!")
    } catch (error) {
      console.error("Error updating post:", error)
      alert("Erro ao atualizar post.")
    } finally {
      setCreating(false)
    }
  }

  const handleDeletePost = async (post: BlogPost) => {
    const confirmed = confirm(`Tem certeza que deseja deletar o post "${post.title}"?`)
    if (!confirmed) return

    try {
      await deleteDoc(doc(db, "blog_posts", post.id))

      await logActivity("blog_post_deleted", `Post deletado: ${post.title}`, user?.uid || "admin", { postId: post.id })

      fetchPosts()
      alert("Post deletado com sucesso!")
    } catch (error) {
      console.error("Error deleting post:", error)
      alert("Erro ao deletar post.")
    }
  }

  const handleCancelEdit = () => {
    setEditingPost(null)
    setShowForm(false)
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "",
      imageUrl: "",
      images: [],
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20">
        <div className="bg-primary text-primary-foreground py-8 md:py-12">
          <div className="container mx-auto px-4">
            <Link
              href="/admin"
              className="inline-flex items-center text-primary-foreground/90 hover:text-primary-foreground mb-4"
            >
              <ArrowLeft className="mr-2" size={18} />
              Voltar ao Painel
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">Gerenciar Blog</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Posts List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="font-serif">Posts Publicados</CardTitle>
                      <CardDescription>Gerencie os artigos do blog</CardDescription>
                    </div>
                    <Button
                      onClick={() => {
                        setShowForm(!showForm)
                        setEditingPost(null)
                        setFormData({
                          title: "",
                          excerpt: "",
                          content: "",
                          category: "",
                          imageUrl: "",
                          images: [],
                        })
                      }}
                      className="bg-primary text-primary-foreground w-full sm:w-auto"
                    >
                      <Plus className="mr-2" size={18} />
                      Novo Post
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Carregando posts...</div>
                  ) : posts.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="mx-auto mb-4 text-muted-foreground" size={48} />
                      <p className="text-muted-foreground mb-4">Nenhum post publicado ainda.</p>
                      <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground">
                        <Plus className="mr-2" size={18} />
                        Criar Primeiro Post
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <div
                          key={post.id}
                          className="p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="flex-1 w-full">
                              <h3 className="font-semibold mb-1">{post.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{post.excerpt}</p>
                              <p className="text-xs text-muted-foreground">
                                Publicado em {new Date(post.publishedAt).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditPost(post)}
                                className="bg-transparent flex-1 sm:flex-none"
                              >
                                <Edit2 size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeletePost(post)}
                                className="bg-transparent text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Create/Edit Form */}
            <div className="lg:col-span-1">
              {showForm && (
                <Card className="sticky top-24">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-serif text-lg md:text-xl">
                        {editingPost ? "Editar Post" : "Novo Post"}
                      </CardTitle>
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                        <X size={18} />
                      </Button>
                    </div>
                    <CardDescription>Preencha os dados do artigo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="content" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="content">Conteúdo</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>

                      <TabsContent value="content" className="space-y-4 mt-4">
                        <form onSubmit={editingPost ? handleUpdatePost : handleSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Título *</Label>
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              required
                              placeholder="Digite o título do post"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="category">Categoria</Label>
                            <Input
                              id="category"
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                              placeholder="Ex: Engenharia, Topografia"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="excerpt">Resumo *</Label>
                            <Textarea
                              id="excerpt"
                              value={formData.excerpt}
                              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                              required
                              rows={3}
                              placeholder="Breve descrição do artigo"
                            />
                          </div>

                          {/* Image upload section */}
                          <div className="space-y-2">
                            <Label>Imagem de Capa</Label>
                            <div className="flex gap-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, false)}
                                className="hidden"
                                id="cover-image"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById("cover-image")?.click()}
                                disabled={uploadingImage}
                                className="flex-1"
                              >
                                {uploadingImage ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enviando...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-2" size={16} />
                                    Upload
                                  </>
                                )}
                              </Button>
                            </div>
                            {formData.imageUrl && (
                              <div className="relative mt-2 rounded-lg overflow-hidden border border-border">
                                <img
                                  src={formData.imageUrl || "/placeholder.svg"}
                                  alt="Capa"
                                  className="w-full h-32 object-cover"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  className="absolute top-2 right-2"
                                  onClick={() => setFormData({ ...formData, imageUrl: "" })}
                                >
                                  <X size={14} />
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Formatting toolbar */}
                          <div className="space-y-2">
                            <Label htmlFor="content">Conteúdo *</Label>
                            <div className="flex flex-wrap gap-1 p-2 bg-secondary rounded-t-lg border border-b-0 border-border">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => insertFormatting("bold")}
                                title="Negrito"
                              >
                                <Bold size={16} />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => insertFormatting("italic")}
                                title="Itálico"
                              >
                                <Italic size={16} />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => insertFormatting("h1")}
                                title="Título Principal"
                              >
                                <Heading1 size={16} />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => insertFormatting("h2")}
                                title="Subtítulo"
                              >
                                <Heading2 size={16} />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => insertFormatting("list")}
                                title="Lista"
                              >
                                <List size={16} />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => insertFormatting("link")}
                                title="Link"
                              >
                                <LinkIcon size={16} />
                              </Button>
                            </div>
                            <Textarea
                              id="content"
                              value={formData.content}
                              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                              required
                              rows={10}
                              className="rounded-t-none font-mono text-sm"
                              placeholder="Escreva o conteúdo do post aqui..."
                            />
                          </div>

                          {/* Gallery images section */}
                          <div className="space-y-2">
                            <Label>Galeria de Imagens</Label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, true)}
                              className="hidden"
                              id="gallery-images"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("gallery-images")?.click()}
                              disabled={uploadingGallery}
                              className="w-full"
                            >
                              {uploadingGallery ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="mr-2" size={16} />
                                  Adicionar Imagem
                                </>
                              )}
                            </Button>
                            {formData.images.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {formData.images.map((img, index) => (
                                  <div key={index} className="relative rounded-lg overflow-hidden border border-border">
                                    <img
                                      src={img || "/placeholder.svg"}
                                      alt={`Galeria ${index + 1}`}
                                      className="w-full h-20 object-cover"
                                    />
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="destructive"
                                      className="absolute top-1 right-1 h-6 w-6 p-0"
                                      onClick={() => handleRemoveGalleryImage(index)}
                                    >
                                      <X size={12} />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 pt-4">
                            <Button
                              type="submit"
                              className="flex-1 bg-primary text-primary-foreground"
                              disabled={creating}
                            >
                              {creating ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  {editingPost ? "Atualizando..." : "Criando..."}
                                </>
                              ) : editingPost ? (
                                "Atualizar Post"
                              ) : (
                                "Publicar Post"
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleCancelEdit}
                              className="flex-1 bg-transparent"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </form>
                      </TabsContent>

                      {/* Preview tab */}
                      <TabsContent value="preview" className="mt-4">
                        <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
                          {formData.imageUrl && (
                            <img
                              src={formData.imageUrl || "/placeholder.svg"}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          )}
                          {formData.category && (
                            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                              {formData.category}
                            </span>
                          )}
                          <h2 className="text-2xl font-serif font-bold">{formData.title || "Título do Post"}</h2>
                          <p className="text-muted-foreground italic">{formData.excerpt || "Resumo do post..."}</p>
                          <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap">{formData.content || "Conteúdo do post..."}</div>
                          </div>
                          {formData.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-4">
                              {formData.images.map((img, index) => (
                                <img
                                  key={index}
                                  src={img || "/placeholder.svg"}
                                  alt={`Galeria ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
