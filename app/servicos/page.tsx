import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Ruler, Building2, FileText, TrendingUp, Shield, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ServicesPage() {
  const services = [
    {
      icon: MapPin,
      title: "Topografia",
      description:
        "Realizamos levantamentos topográficos completos utilizando equipamentos de última geração, incluindo estações totais, GPS geodésico e drones. Nossos serviços garantem precisão milimétrica para seu projeto.",
      features: ["Levantamento planialtimétrico", "Georreferenciamento de imóveis", "Locação de obras", "Batimetria"],
    },
    {
      icon: Ruler,
      title: "Projetos de Engenharia",
      description:
        "Desenvolvimento completo de projetos estruturais, arquitetônicos e de infraestrutura. Nossa equipe multidisciplinar garante soluções técnicas eficientes e econômicas.",
      features: [
        "Projetos estruturais",
        "Projetos arquitetônicos",
        "Projetos de infraestrutura",
        "Análise de viabilidade",
      ],
    },
    {
      icon: Building2,
      title: "Regularização de Imóveis",
      description:
        "Assessoria completa para regularização fundiária e documentação de propriedades. Cuidamos de todo o processo junto aos órgãos competentes.",
      features: [
        "Regularização fundiária",
        "Desmembramento e remembramento",
        "Retificação de áreas",
        "Averbação de construções",
      ],
    },
    {
      icon: FileText,
      title: "Laudos Técnicos",
      description:
        "Elaboração de laudos técnicos e perícias com rigor profissional e fundamentação técnica sólida para diversas finalidades.",
      features: ["Laudo de avaliação", "Perícia técnica", "Laudo de vistoria", "Assistência técnica"],
    },
    {
      icon: TrendingUp,
      title: "Consultoria",
      description:
        "Consultoria especializada para otimização de projetos, processos e tomada de decisões estratégicas em empreendimentos.",
      features: [
        "Análise de viabilidade técnica",
        "Otimização de projetos",
        "Gestão de riscos",
        "Planejamento estratégico",
      ],
    },
    {
      icon: Shield,
      title: "Gestão de Obras",
      description:
        "Acompanhamento e gestão completa de obras e empreendimentos, garantindo qualidade, prazo e orçamento.",
      features: ["Fiscalização de obras", "Controle de qualidade", "Gestão de cronograma", "Controle orçamentário"],
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <div className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-balance">Nossos Serviços</h1>
              <p className="text-xl text-primary-foreground/90 leading-relaxed">
                Soluções completas em engenharia e topografia para seu projeto
              </p>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 border-border">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="text-primary" size={28} />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-serif font-bold mb-3">{service.title}</h2>
                        <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <CheckCircle className="text-primary flex-shrink-0" size={18} />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-secondary/30 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-balance">
                Pronto para iniciar seu projeto?
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Entre em contato conosco e receba uma proposta personalizada para suas necessidades.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/orcamento">
                  <Button size="lg" className="bg-primary text-primary-foreground text-lg px-8">
                    Solicitar Orçamento
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
                <a
                  href="https://wa.me/5547996384548?text=Ol%C3%A1%20vim%20pelo%20site"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                    Fale Conosco
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
