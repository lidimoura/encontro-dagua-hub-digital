- UX (Melhorias de experiência do usuário)
- Performance (Otimizações)
- Refactor (Refatoração de código)
- DevOps (Infraestrutura e deploy)
- Documentation (Documentação)
- Security (Segurança)
- Mobile (Mobile específico)
- IA (Inteligência Artificial)
- Branding (Marca e identidade visual)

---

## 🔮 ROADMAP: FASE 2 (Branch Develop & AI Integration)

**Status:** 📋 Planejado
**Data de Registro:** 23/12/2025

### Estratégia de Desenvolvimento

A partir desta fase, todo desenvolvimento de IA complexa será realizado na branch `develop` para preservar a estabilidade da `main` em produção.

### Backlog Mandatório

#### 1. Criação da Branch `develop`
- **Objetivo:** Isolar desenvolvimento de features complexas de IA
- **Regra:** Merge para `main` apenas após testes completos e aprovação
- **Benefício:** Preservar estabilidade da produção durante experimentação

#### 2. Migração da "Equipe de Agentes"
- **Origem:** Repositório original (Streamlit)
- **Agentes a Resgatar:**
  - `agente_briefing` - Coleta de requisitos
  - `agente_tecnico` - Análise técnica
  - `agente_qa` - Quality Assurance
  - Outros agentes especializados
- **Stack Atual:** Atualizar para Supabase/React
- **Integração:** Conectar com contexto do CRM e QR d'água

#### 3. Feature "Onboarding Mágico" (QR d'água AI)
- **Conceito:** Criação assistida por IA para Cartões Digitais
- **Fluxo:**
  1. Usuário descreve seu negócio via chat/input
  2. IA analisa e sugere configurações
  3. Formulário preenchido automaticamente:
     - Bio profissional gerada
     - Cores sugeridas baseadas no segmento
     - Links relevantes recomendados
  4. Usuário revisa e ajusta antes de salvar
- **Inspiração:** Similar à criação de Pipelines no CRM
- **Tecnologia:** Gemini 2.5 Flash com prompts estruturados

#### 4. Magic Landing Page Builder
- **Diferenciação:** Além do "Magic Card" (ágil e simples)
- **Objetivo:** IA capaz de gerar Landing Pages completas e dinâmicas
- **Funcionalidades:**
  - Geração de layout baseado em descrição
  - Sugestão de seções (Hero, Features, Testimonials, etc)
  - Customização de cores e tipografia
  - Integração com formulários e CTAs
- **Público:** Empreendedores que precisam de presença web profissional

#### 5. Showcase Dinâmico (Galeria Automatizada)
- **Objetivo:** Galeria que puxa melhores exemplos de clientes
- **Regra de Ouro:** ⚠️ **CONSENTIMENTO OBRIGATÓRIO (Opt-in)**
  - Campo `in_gallery` deve ser `true` explicitamente
  - Usuário deve marcar checkbox "Autorizar Galeria"
  - Nenhuma automação pode violar este consentimento
- **Critérios de Seleção:**
  - Projetos com `in_gallery = true`
  - Diversidade de segmentos (advogados, restaurantes, consultores, etc)
  - Qualidade visual e completude de informações
- **Implementação:**
  - Query Supabase filtrando `in_gallery = true`
  - Renderização dinâmica na Landing Page
  - Fallback para mockups quando não houver dados suficientes

### Princípios de Desenvolvimento

1. **Privacidade First:** Nenhuma feature de IA pode expor dados sem consentimento
2. **Transparência:** Usuário sempre sabe quando IA está sendo usada
3. **Controle:** Usuário pode desativar features de IA a qualquer momento
4. **Qualidade:** IA deve melhorar UX, não complicar
5. **Performance:** Features de IA não podem degradar performance da aplicação

### Próximos Passos

1. Criar branch `develop` a partir da `main` atual
2. Configurar CI/CD para branch `develop`
3. Documentar processo de merge `develop` → `main`
4. Iniciar desenvolvimento do "Onboarding Mágico"

---

**Nota:** Este roadmap é um documento vivo e será atualizado conforme o projeto evolui.
