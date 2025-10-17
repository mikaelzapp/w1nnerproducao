import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, CheckCircle, MapPin, Ruler, Building2, FileText, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const services = [
    {
      icon: MapPin,
      title: "Topografia",
      description: "Levantamentos topográficos precisos com tecnologia de ponta para seu projeto.",
    },
    {
      icon: Ruler,
      title: "Projetos de Engenharia",
      description: "Desenvolvimento completo de projetos estruturais e arquitetônicos.",
    },
    {
      icon: Building2,
      title: "Regularização de Imóveis",
      description: "Assessoria completa para regularização e documentação de propriedades.",
    },
    {
      icon: FileText,
      title: "Laudos Técnicos",
      description: "Elaboração de laudos técnicos e perícias com rigor profissional.",
    },
    {
      icon: TrendingUp,
      title: "Consultoria",
      description: "Consultoria especializada para otimização de projetos e processos.",
    },
    {
      icon: Shield,
      title: "Gestão de Obras",
      description: "Acompanhamento e gestão completa de obras e empreendimentos.",
    },
  ]

  const features = [
    "Equipe altamente qualificada",
    "Tecnologia de última geração",
    "Atendimento personalizado",
    "Prazos cumpridos rigorosamente",
  ]

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/modern-engineering-construction-site-aerial-view.jpg"
            alt="Engineering background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-balance leading-tight">
              Excelência em{" "}
              <span className="text-primary">
                Engenharia
                <br />e Topografia
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground text-pretty leading-relaxed max-w-2xl mx-auto">
              Transformamos projetos em realidade com precisão, tecnologia e compromisso com a qualidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/servicos">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8">
                  Nossos Serviços
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link
                href="https://wa.me/5547996384548?text=Ol%C3%A1%20vim%20pelo%20site"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                  Fale Conosco
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-primary rounded-full" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-balance">Sobre a W1nner</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Somos uma empresa especializada em engenharia e topografia, comprometida em oferecer soluções inovadoras e
              precisas para nossos clientes. Com anos de experiência no mercado, nossa equipe de profissionais
              qualificados utiliza tecnologia de ponta para garantir resultados excepcionais em cada projeto.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 justify-center">
                  <CheckCircle className="text-primary flex-shrink-0" size={20} />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-balance">Nossos Serviços</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Oferecemos uma gama completa de serviços em engenharia e topografia para atender todas as suas
              necessidades.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/servicos">
              <Button size="lg" variant="outline">
                Ver Todos os Serviços
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-balance">Pronto para iniciar seu projeto?</h2>
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              Entre em contato conosco e descubra como podemos transformar suas ideias em realidade com excelência e
              profissionalismo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/orcamento">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-background text-foreground hover:bg-background/90 text-lg px-8"
                >
                  Solicitar Orçamento
                </Button>
              </Link>
              <Link href="/portal">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 bg-transparent"
                >
                  Acessar Portal do Cliente
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: "Projetos Concluídos" },
              { number: "15+", label: "Anos de Experiência" },
              { number: "98%", label: "Clientes Satisfeitos" },
              { number: "50+", label: "Profissionais" },
            ].map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-4xl md:text-5xl font-serif font-bold text-primary">{stat.number}</div>
                <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
