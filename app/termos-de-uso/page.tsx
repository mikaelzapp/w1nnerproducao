import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermsOfServicePage() {
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
            <CardTitle className="text-3xl font-serif">Termos de Uso</CardTitle>
            <p className="text-sm text-muted-foreground">Última atualização: Janeiro de 2025</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e usar os serviços da W1nner Engenharia, você concorda em cumprir e estar vinculado aos
                seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá
                usar nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Descrição dos Serviços</h2>
              <p className="text-muted-foreground leading-relaxed">
                A W1nner Engenharia oferece serviços de engenharia, incluindo mas não limitado a:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Regularização de terrenos urbanos e rurais</li>
                <li>Projetos de engenharia civil</li>
                <li>Consultoria técnica</li>
                <li>Levantamentos topográficos</li>
                <li>Acompanhamento de processos junto aos órgãos competentes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Cadastro e Conta de Usuário</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Para utilizar determinados serviços, você precisará criar uma conta. Ao criar uma conta, você concorda
                em:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Fornecer informações verdadeiras, precisas, atuais e completas</li>
                <li>Manter e atualizar prontamente suas informações de cadastro</li>
                <li>Manter a confidencialidade de sua senha</li>
                <li>Ser responsável por todas as atividades que ocorram em sua conta</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Uso Aceitável</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">Você concorda em não:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Usar os serviços para qualquer finalidade ilegal ou não autorizada</li>
                <li>Violar quaisquer leis locais, estaduais, nacionais ou internacionais</li>
                <li>Transmitir qualquer material que seja difamatório, obsceno ou ofensivo</li>
                <li>Interferir ou interromper os serviços ou servidores conectados aos serviços</li>
                <li>Tentar obter acesso não autorizado a qualquer parte dos serviços</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Propriedade Intelectual</h2>
              <p className="text-muted-foreground leading-relaxed">
                Todo o conteúdo presente neste site, incluindo mas não limitado a textos, gráficos, logos, ícones,
                imagens, clipes de áudio, downloads digitais e compilações de dados, é propriedade da W1nner Engenharia
                ou de seus fornecedores de conteúdo e está protegido pelas leis brasileiras e internacionais de direitos
                autorais.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Pagamentos e Reembolsos</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Os serviços prestados pela W1nner Engenharia são cobrados conforme orçamento previamente acordado. As
                condições de pagamento incluem:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Pagamento conforme cronograma estabelecido no contrato</li>
                <li>Possibilidade de parcelamento mediante aprovação</li>
                <li>Política de reembolso conforme especificado no contrato de serviço</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                A W1nner Engenharia não será responsável por quaisquer danos indiretos, incidentais, especiais,
                consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados, uso, boa vontade ou
                outras perdas intangíveis, resultantes do uso ou incapacidade de usar os serviços.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Modificações dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre
                mudanças significativas através do site ou por e-mail. O uso continuado dos serviços após tais
                modificações constitui sua aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Lei Aplicável</h2>
              <p className="text-muted-foreground leading-relaxed">
                Estes termos serão regidos e interpretados de acordo com as leis do Brasil. Qualquer disputa relacionada
                a estes termos será submetida à jurisdição exclusiva dos tribunais brasileiros.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através da página de contato
                ou pelo e-mail: contato@w1nner.com.br
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
