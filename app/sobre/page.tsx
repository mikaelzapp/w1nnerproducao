import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Eye, Award, Users, TrendingUp, Shield, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Precisão",
      description: "Compromisso com a exatidão em cada medição e cálculo realizado.",
    },
    {
      icon: Shield,
      title: "Confiabilidade",
      description: "Construímos relacionamentos duradouros baseados em confiança e transparência.",
    },
    {
      icon: TrendingUp,
      title: "Inovação",
      description: "Utilizamos tecnologia de ponta para entregar soluções modernas e eficientes.",
    },
    {
      icon: Award,
      title: "Excelência",
      description: "Buscamos a perfeição em cada projeto, superando expectativas.",
    },
  ]

  const team = [
    {
      name: "Eng. João Silva",
      role: "Diretor Técnico",
      description: "Engenheiro Civil com 20 anos de experiência em projetos estruturais.",
    },
    {
      name: "Eng. Maria Santos",
      role: "Coordenadora de Topografia",
      description: "Especialista em georreferenciamento e levantamentos topográficos.",
    },
    {
      name: "Eng. Carlos Oliveira",
      role: "Gerente de Projetos",
      description: "Responsável pela gestão e execução de projetos complexos.",
    },
  ]

  const achievements = [
    "Mais de 500 projetos concluídos com sucesso",
    "15 anos de atuação no mercado",
    "Equipe de 50+ profissionais qualificados",
    "98% de satisfação dos clientes",
    "Certificações ISO 9001 e ISO 14001",
    "Parceria com as principais construtoras da região",
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <div className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-balance">Sobre a W1nner</h1>
              <p className="text-xl text-primary-foreground/90 leading-relaxed">
                Transformando ideias em realidade através da engenharia de excelência
              </p>
            </div>
          </div>
        </div>

        {/* Company Story */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-serif font-bold">Nossa História</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Fundada em 2010, a W1nner Engenharia e Topografia nasceu do sonho de profissionais apaixonados por
                transformar projetos em realidade. Ao longo dos anos, consolidamos nossa posição como referência em
                soluções de engenharia, combinando expertise técnica com tecnologia de ponta.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nossa trajetória é marcada pela busca constante da excelência, inovação e compromisso com nossos
                clientes. Cada projeto é tratado com dedicação única, garantindo resultados que superam expectativas e
                contribuem para o desenvolvimento sustentável da sociedade.
              </p>
            </div>
          </div>
        </div>

        {/* Mission and Vision */}
        <div className="bg-secondary/30 py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card className="border-border">
                <CardContent className="p-8 space-y-4">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="text-primary" size={28} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold">Nossa Missão</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Oferecer soluções em engenharia e topografia com excelência técnica, inovação e compromisso,
                    contribuindo para o desenvolvimento sustentável e o sucesso dos projetos de nossos clientes.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-8 space-y-4">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Eye className="text-primary" size={28} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold">Nossa Visão</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Ser reconhecida como a empresa líder em engenharia e topografia, referência em qualidade, inovação e
                    responsabilidade socioambiental, expandindo nossa atuação e impactando positivamente a sociedade.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold">Nossos Valores</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Princípios que guiam nossas ações e decisões diariamente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index} className="border-border hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 space-y-4 text-center">
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                      <Icon className="text-primary" size={28} />
                    </div>
                    <h3 className="text-xl font-semibold">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Team */}
        <div className="bg-secondary/30 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold">Nossa Equipe</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Profissionais qualificados e comprometidos com a excelência
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {team.map((member, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="p-6 space-y-4 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Users className="text-primary" size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                      <p className="text-primary font-medium mb-3">{member.role}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{member.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold">Nossas Conquistas</h2>
              <p className="text-lg text-muted-foreground">Resultados que demonstram nosso compromisso e dedicação</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
                  <CheckCircle className="text-primary flex-shrink-0" size={24} />
                  <span className="font-medium">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-balance">Pronto para trabalhar conosco?</h2>
              <p className="text-xl text-primary-foreground/90 leading-relaxed">
                Entre em contato e descubra como podemos ajudar a transformar seu projeto em realidade.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="https://wa.me/5547996384548?text=Ol%C3%A1%20vim%20pelo%20site"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-background text-foreground hover:bg-background/90 text-lg px-8"
                  >
                    Fale Conosco
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
                <Link href="/servicos">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 bg-transparent"
                  >
                    Conheça Nossos Serviços
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
