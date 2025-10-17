import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-serif">Política de Privacidade</CardTitle>
            <p className="text-sm text-muted-foreground">Última atualização: Janeiro de 2025</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introdução</h2>
              <p className="text-muted-foreground leading-relaxed">
                A W1nner Engenharia está comprometida em proteger sua privacidade. Esta Política de Privacidade explica
                como coletamos, usamos, divulgamos e protegemos suas informações quando você usa nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Informações que Coletamos</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">Coletamos os seguintes tipos de informações:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>Informações de Cadastro:</strong> Nome completo, e-mail, CPF, telefone
                </li>
                <li>
                  <strong>Informações de Projeto:</strong> Dados sobre terrenos, documentos, localização
                </li>
                <li>
                  <strong>Informações de Pagamento:</strong> Dados necessários para processamento de pagamentos
                </li>
                <li>
                  <strong>Informações de Uso:</strong> Como você interage com nossos serviços
                </li>
                <li>
                  <strong>Informações Técnicas:</strong> Endereço IP, tipo de navegador, sistema operacional
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Como Usamos suas Informações</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">Usamos as informações coletadas para:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Fornecer, operar e manter nossos serviços</li>
                <li>Processar suas solicitações e transações</li>
                <li>Enviar comunicações relacionadas aos serviços</li>
                <li>Melhorar e personalizar sua experiência</li>
                <li>Detectar, prevenir e resolver problemas técnicos</li>
                <li>Cumprir obrigações legais e regulatórias</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Compartilhamento de Informações</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Podemos compartilhar suas informações nas seguintes situações:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>Prestadores de Serviços:</strong> Com empresas que nos auxiliam na prestação de serviços
                </li>
                <li>
                  <strong>Órgãos Públicos:</strong> Quando necessário para regularização de terrenos e projetos
                </li>
                <li>
                  <strong>Requisitos Legais:</strong> Quando exigido por lei ou processo legal
                </li>
                <li>
                  <strong>Proteção de Direitos:</strong> Para proteger nossos direitos, propriedade ou segurança
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Não vendemos suas informações pessoais a terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Segurança das Informações</h2>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger suas informações
                contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui criptografia de dados,
                controles de acesso e monitoramento regular de nossos sistemas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Retenção de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Mantemos suas informações pessoais pelo tempo necessário para cumprir os propósitos descritos nesta
                política, a menos que um período de retenção mais longo seja exigido ou permitido por lei. Após esse
                período, suas informações serão excluídas ou anonimizadas de forma segura.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Seus Direitos (LGPD)</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Confirmar a existência de tratamento de dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar a anonimização, bloqueio ou eliminação de dados</li>
                <li>Solicitar a portabilidade de dados</li>
                <li>Revogar o consentimento</li>
                <li>Obter informações sobre compartilhamento de dados</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Para exercer esses direitos, entre em contato conosco através dos canais indicados na seção de contato.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Cookies e Tecnologias Similares</h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso do site e
                personalizar conteúdo. Você pode controlar o uso de cookies através das configurações do seu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Alterações nesta Política</h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças
                significativas publicando a nova política em nosso site e atualizando a data de "Última atualização".
                Recomendamos que você revise esta política regularmente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados pessoais,
                entre em contato conosco:
              </p>
              <ul className="list-none pl-0 text-muted-foreground space-y-2 mt-3">
                <li>
                  <strong>E-mail:</strong> privacidade@w1nner.com.br
                </li>
                <li>
                  <strong>Telefone:</strong> (47) 99999-9999
                </li>
                <li>
                  <strong>Endereço:</strong> [Endereço da empresa]
                </li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
