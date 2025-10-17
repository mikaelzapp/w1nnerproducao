import Link from "next/link"
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Company Info */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-lg md:text-xl font-serif font-bold">
              <span className="text-primary">W1nner</span> Engenharia
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Soluções profissionais em engenharia e topografia com excelência e precisão.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-semibold text-foreground text-sm md:text-base">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/servicos"
                  className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Serviços
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre"
                  className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/5547996384548?text=Ol%C3%A1%20vim%20pelo%20site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-semibold text-foreground text-sm md:text-base">Contato</h4>
            <ul className="space-y-2 md:space-y-3">
              <li className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                <Phone size={14} className="mt-0.5 sm:mt-1 text-primary flex-shrink-0" />
                <a
                  href="https://wa.me/5547996384548?text=Ol%C3%A1%20vim%20pelo%20site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors break-words"
                >
                  (47) 99638-4548
                </a>
              </li>
              <li className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                <Mail size={14} className="mt-0.5 sm:mt-1 text-primary flex-shrink-0" />
                <span className="break-all">contato@w1nner.com.br</span>
              </li>
              <li className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                <MapPin size={14} className="mt-0.5 sm:mt-1 text-primary flex-shrink-0" />
                <span>Endereço da empresa</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-semibold text-foreground text-sm md:text-base">Redes Sociais</h4>
            <div className="flex gap-3 md:gap-4">
              <a
                href="#"
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={16} className="md:w-[18px] md:h-[18px]" />
              </a>
              <a
                href="#"
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={16} className="md:w-[18px] md:h-[18px]" />
              </a>
              <a
                href="#"
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={16} className="md:w-[18px] md:h-[18px]" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} W1nner Engenharia e Topografia. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
