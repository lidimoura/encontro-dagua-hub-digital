export type Language = 'pt' | 'en' | 'es';

export const translations = {
    pt: {
        // --- NAVEGAÇÃO GLOBAL ---
        navHome: "Início",
        navCRM: "Gestão (CRM)",
        navBoards: "Quadros",
        navContacts: "Contatos",
        navActivities: "Atividades",
        navReports: "Relatórios",
        navQR: "Páginas Pontes",
        navPrompts: "PromptLab",
        navAdmin: "Admin",
        logout: "Sair",
        profile: "Perfil",
        aboutUs: "Sobre Nós",
        becomeClient: "Quero ser Cliente",
        login: "Entrar",
        enter: "Entrar",
        home: "Início",
        solutions: "Soluções",
        gallery: "Galeria",

        // --- DASHBOARD ---
        dashboard: "Dashboard",
        dashboardTitle: "Dashboard",
        dashboardSubtitle: "O pulso do seu negócio em tempo real.",
        thisMonth: "Este Mês",
        lastQuarter: "Último Trimestre",
        thisYear: "Este Ano",
        walletAnalysis: "Análise de Carteira",
        downloadReport: "Baixar Relatório",
        totalPipeline: "Pipeline Total",
        activeDeals: "Negócios Ativos",
        conversionRate: "Conversão",
        revenueWon: "Receita (Ganha)",
        walletHealth: "Saúde da Carteira",
        walletDistribution: "Distribuição da Carteira",
        active: "Ativos",
        inactive: "Inativos",
        churn: "Churn",
        churnRisk: "Risco de Churn",
        clients: "Clientes",
        alerts: "Alertas",
        churnRiskDesc: "Clientes ativos sem compra há > 30 dias.",
        runCheckNow: "Rodar verificação agora",
        noRisksDetected: "Nenhum risco detectado",
        avgLTV: "LTV Médio",
        ltvDesc: "Valor médio vitalício por cliente ativo.",
        salesFunnel: "Funil de Vendas",
        recentActivities: "Atividades Recentes",
        noRecentActivities: "Nenhuma atividade recente",
        viewAllActivities: "Ver todas as atividades",

        // --- INBOX ---
        inboxTitle: "Inbox",
        inboxSubtitle: "Sua mesa de trabalho.",

        // --- REPORTS ---
        reportsTitle: "Relatórios de Performance",
        reportsSubtitle: "Análise detalhada de vendas e tendências.",
        revenueTrend: "Tendência de Receita",
        last6Months: "Últimos 6 Meses",
        salesCycle: "Ciclo de Vendas",
        avgDays: "Média",
        fastestDays: "Mais Rápido",
        slowestDays: "Mais Lento",
        basedOnDeals: "Baseado em {count} negócios fechados.",
        winLossAnalysis: "Win/Loss Analysis",
        winRate: "Taxa de Vitória",
        winsLosses: "Ganhos / Perdas",
        topLossReasons: "Top Motivos de Perda",
        topOpportunities: "Top Oportunidades",
        viewAll: "Ver todas",
        opportunity: "Oportunidade",
        value: "Valor",
        probability: "Probabilidade",
        owner: "Dono",

        // --- DECISIONS ---
        // (Existing keys: decisionsTitle, decisionsSubtitle, analyzeNow, analyzingCRM, lastAnalysis, neverAnalyzed, noDecisionsPending, clickAnalyzePrompt, analyzeMyCRM, approveAll, clearAll)
        total: "Total",
        critical: "Crítico",
        important: "Importante",
        moderate: "Moderado",
        low: "Baixo",
        reasoningLabel: "Por que estou sugerindo isso?",
        suggestedActionLabel: "Ação sugerida:",
        orLabels: "Ou:", // 'or' might be reserved keyword in some contexts, safely using orLabels or just 'or'
        or: "Ou:",
        approve: "Aprovar",
        snooze: "Adiar",
        ignore: "Ignorar",

        // --- SETTINGS ---

        general: "Geral",
        data: "Dados",
        team: "Equipe",

        // --- ADMIN ---
        adminPanelTitle: "Painel Admin 2.0",
        adminPanelSubtitle: "Gerenciamento avançado de usuários e permissões",
        users: "Usuários",
        catalog: "Catálogo",
        searchPlaceholder: "Buscar por email, nome ou telefone...",
        totalUsers: "Total",
        planFree: "Free",
        planMonthly: "Monthly",
        planAnnual: "Annual",
        editUser: "Editar Usuário",
        save: "Salvar",
        cancel: "Cancelar",
        plan: "Plano",
        status: "Status",
        phone: "Telefone",
        backToDashboard: "Voltar ao Dashboard",
        noUsersFound: "Nenhum usuário encontrado.",
        generateInviteLink: "Gerar Link de Convite",
        inviteUsersDesc: "Convide novos usuários para o Hub",
        generateInviteButton: "GERAR CONVITE (ANTI-CRASH)",
        inviteCreated: "✅ CONVITE CRIADO! COPIE ABAIXO:",
        inviteError: "Erro ao gerar convite: ",

        // --- AI HUB ---
        aiWelcomeTitle: "Olá! Sou seu assistente de CRM",
        aiWelcomeDesc: "Posso ajudar você a gerenciar deals, atividades, contatos e muito mais. Experimente perguntar algo!",
        suggestion1: "O que tenho pra fazer hoje?",
        suggestion2: "Mostre meu pipeline",
        suggestion3: "Quais deals estão parados?",
        suggestion4: "Crie uma reunião com Stark amanhã às 14h",
        poweredBy: "Powered by Gemini 2.5 Flash • Respostas podem conter imprecisões",
        aiAssistant: "Assistente IA",
        clearConversation: "Limpar conversa",
        aiPlaceholder: "Pergunte algo sobre seu CRM...",
        swipeToSee: "← Deslize para ver mais →",
        wantToAppear: "💡 Quer aparecer aqui? Marque 'Autorizar Galeria' ao criar seu projeto!",

        // Missing Keys
        techStack: "Tech Stack",
        openMenu: "Abrir menu",
        editProfile: "Editar Perfil",
        signOut: "Sair",


        // --- LANDING PAGE (PT) ---
        saasPitch: "Infraestrutura SaaS White Label",
        mobileFirst: "Mobile First",
        aiFirst: "AI First",
        realImpact: "Impacto Real",
        accessibleTech: "Tecnologia mais",
        accessibleTechHighlight: "acessível.",
        heroSubtitleLanding: "Um ecossistema digital que oferece as melhores soluções tecnológicas para resolver problemas reais e garantir resultados e prosperidade para todos.",
        knowHub: "Conhecer o Hub",

        // Solutions
        ourSolutions: "Nossas Soluções",
        solutionsDesc: "Não vendemos apenas automações ou prompts. Oferecemos soluções reais para problemas reais. Nosso foco é realizar seu desejo com precificação justa, escuta sensível e tecnologia assertiva.",
        realSolutions: "soluções reais para problemas reais",

        // Prompt Lab Section
        promptLabTitle: "Prompt Lab",
        promptLabTag: "Prova D'água",
        promptLabHeadline: "Transforme ideias brutas em",
        promptLabHeadlineHighlight: "prompts estruturados e eficientes",
        promptLabSub: "usando engenharia de prompts profissional.",
        promptLabDesc: "Nossa IA analisa sua intenção e cria prompts otimizados prontos para usar em qualquer LLM (ChatGPT, Claude, Gemini). Teste gratuitamente abaixo e veja a diferença na qualidade das respostas.",
        inputPlaceholder: "Ex: Criar legenda para foto de produto...",
        optimizing: "⏳ Otimizando...",
        optimize: "✨ Otimizar",
        copy: "Copiar",
        accessPro: "Quero Acesso ao Hub Pro",
        aiResponse: "Resposta da IA",
        testPrompt: "🧪 Testar Prompt",
        testing: "⏳ Testando...",
        wantJustPromptLab: "💡 Quer apenas o Prompt Lab?",
        promptLabBenefits: "Agentes de IA & Personalização de LLMs",
        subscribePro: "Assinar Pro Mensal (R$ 3,00)",

        // Link d'Água Section
        qrTitle: "Link d'Água",
        qrWaterTitle: "Link d'Água: Portal de Presença Integrada",
        qrWater: "Páginas Pontes",
        qrTag: "Link d'Água",
        qrHeadline: "Gerador de Identidade Digital",
        qrDesc: "Conecte seu negócio através de Código Físico (QR impresso) ou Link Digital (WhatsApp/Bio). Fidelidade total: o que você vê é o que seus clientes recebem.",
        linkDaguaBadge: "Produto Principal",
        linkDaguaTitle: "Link d'Água",
        linkDaguaSubtitle: "Sua vitrine digital",
        linkDaguaDesc: "Uma página profissional com <strong className=\"text-white\">todos os seus links, serviços e contatos</strong> em um único endereço compartilhável.",
        feat1: "📱 Link único que vai no WhatsApp, Instagram e cartão",
        feat2: "🛍️ Vitrine de produtos e serviços com fotos",
        feat3: "📊 Analytics de cliques em tempo real",
        feat4: "🔗 QR Code automático e link personalizado",
        feat5: "✅ Sem precisar de site — funciona no celular",
        viewShowcase: "Ver Vitrine",
        getMine: "Quero o meu",
        linksTitle: "Lidi Moura",
        linksSubtitle: "link.encontrodagua.com/lidi",
        link1: "WhatsApp",
        link2: "Instagram",
        link3: "Portfólio",
        link4: "Agendamento",
        linkStats: "247 cliques esta semana ↑",

        // Gallery Section
        galleryTitle: "Galeria de Clientes",
        clientGallery: "Galeria de Clientes do Hub",
        clientGalleryDesc: "Veja como empreendedores estão usando o Link d'Água para conectar com seus clientes",
        galleryTag: "Galeria de Clientes",
        galleryHeadline: "Galeria de Clientes do Hub",
        galleryDesc: "Veja como empreendedores estão usando o Link d'Água para se conectar com seus clientes",


        // Amazo Section
        amazoTag: "Agente de IA",
        amazoTitle: "Amazô IA",
        amazoDesc: "A Amazô ajuda no diagnóstico. Atendimento 24/7 para CS e Vendas direto no WhatsApp.",
        talkToAmazo: "Converse com a Amazô",
        talkToAmazoDesc: "Tire dúvidas, peça diagnóstico ou saiba mais sobre nossas soluções",
        chatWithAmazo: "Falar com Amazô agora",

        // Manifesto
        manifesto: "Manifesto",
        manifestoTitle: "Manifesto",
        manifestoText: "O Encontro D'água Hub não nasceu no Vale do Silício, mas sim da necessidade real de conectar pessoas e tecnologia de forma mais sustentável e acessível. Começamos simples, criando GEMs personalizados, e hoje somos um ecossistema digital vivo com inteligência artificial integrada. Este hub é a prova do nosso compromisso: cada linha de código e estratégia foi criada pela fundadora com suporte da sua equipe de agentes de IA. Estamos construindo uma tecnologia sustentável que seja acessível para todos que precisam e assim ser mais prósperos.",

        // Tech For All
        techForAll: "Tecnologia para Todos",
        noOneLeftBehind: "🤝 Ninguém fica pra trás",
        socialImpact: "Condições especiais para impacto social.",
        socialConsult: "Consultoria Social (WhatsApp)",

        // Team
        teamTitle: "Equipe",
        founderRole: "Founder & Visão",
        techLeadRole: "Tech Lead",
        csRole: "CS & Vendas",
        devRole: "Dev",
        founderPitch: "Criadora de Soluções Digitais e Fundadora do Hub. Formada em Psicologia, com especialização em Data Science (ONE/Alura/Oracle) e certificações em OCI, IA e MySQL. Arquiteta e gerencia todo o ecossistema digital no modo heutagógico, trabalhando lado a lado com o agente Antigravity.",
        precyPitch: "Inteligência Financeira (Tech). Precy calcula precificação e ROI com suporte multicurrency (BRL, USD, AUD), aplicando lógicas de Impacto Social automaticamente para ONGs e projetos sociais.",
        juryPitch: "Inteligência Jurídica (Legal). Emite contratos limpos adaptáveis para Common Law (Internacional) e Sistema Brasileiro. Totalmente integrada ao Board de negócios.",
        amazoPitch: "Especialista em escuta ativa. A Amazô realiza o diagnóstico inicial do seu negócio e guia você para a solução ideal, disponível a qualquer hora do dia.",
        antigravityPitch: "Arquiteto de Soluções Autônomo. Uma IA avançada que trabalha em dinâmica heutagógica com a Lidi. Juntos, transformam estratégias de negócios em código limpo e arquitetura escalável e funcional.",

        // Footer
        footerText: "Inspirado na natureza, codado para o mundo.",

        // --- AI HUB PAGE --- (Keys merged into Main AI HUB)


        // --- LOGIN PAGE ---
        welcomeBack: "Bem-vindo de volta",
        loginSubtitle: "Entre na sua conta para continuar.",
        password: "Senha",
        forgotPassword: "Esqueci minha senha",
        signIn: "Entrar",

        // --- TEAM MANAGEMENT ---
        teamMembers: "Membros da Equipe",
        teamMembersDesc: "Gerencie os membros da equipe e suas permissões",
        member: "Membro",
        role: "Função",
        email: "Email",
        access: "Acesso",
        teamMember: "Membro",
        note: "Nota",
        teamMembersNote: "Esta é a equipe central do Hub Encontro D'água. Novos membros podem ser adicionados via painel de administração.",


        // --- CRM CORE (KANBAN) ---
        addDeal: "Adicionar Negócio",
        newDeal: "Novo Negócio",
        allDeals: "Todos os Negócios",
        myDeals: "Meus Negócios",

        filterByStatus: "Filtrar por status",
        dropHere: "✓ Solte aqui!",
        dealStale: "Negócio Estagnado (>10 dias sem atualização)",
        totalValue: "Total",

        // --- DEAL CARD ---
        priority: "Prioridade",
        high: "Alta",
        medium: "Média",
        // low: "Baixa", // Duplicate of key at line 87

        // --- MAZO AGENT (HEALTH SCORE) ---
        healthAnalysis: "Análise de Saúde do Cliente",
        analyzeHealth: "Analisar Saúde do Cliente",
        customerHealth: "Saúde do Cliente",
        healthChurnRisk: "Risco Crítico de Churn",
        healthy: "Cliente Saudável",
        atRisk: "Cliente em Risco",
        healthCritical: "Risco Crítico de Churn",
        lastContact: "Último Contato",
        customerName: "Nome do Cliente",
        satisfaction: "Satisfação (1-10)",
        usageFrequency: "Frequência de Uso",
        paymentStatus: "Status de Pagamento",
        daily: "Diário",
        weekly: "Semanal",
        monthly: "Mensal",
        rarely: "Raramente",
        current: "✅ Em Dia",
        late: "⏰ Atrasado",
        overdue: "🚨 Inadimplente",
        recommendedActions: "Ações Recomendadas",
        engagement: "Engajamento",
        usage: "Uso",
        payment: "Pagamento",
        retentionFocus: "Focada em retenção, empatia e prevenção de churn",

        // --- ONBOARDING & TEMPLATES ---
        createBoardTitle: "Criar Novo Board",
        editBoard: "Editar Board",
        aiGeneration: "Criar com Inteligência Artificial",
        templates: "Modelos Prontos",
        selectTemplate: "Selecione um modelo",
        salesPipeline: "Funil de Vendas",
        hiringPipeline: "Processo Seletivo",
        projectTrack: "Gestão de Projetos",
        blankBoard: "Criar board em branco",
        perfectCreateBoard: "✅ Perfeito! Criar Board",
        boardName: "Nome do Board",

        // --- AGENTS ---
        pricingEngineer: "Engenheira de Precificação",
        legalAnalyst: "Analista Legal",
        internalCS: "Customer Success Interno",
        precyDesc: "Calcula preço justo baseado em custo, horas e impacto. Inclui precificação social.",
        mazoDesc: "Focada em retenção, empatia e saúde do cliente. Previne churn proativamente.",
        juryDesc: "Gera contratos usando templates da biblioteca. Garante compliance e segurança.",

        // --- MÓDULO BRIDGE PAGES (antes: Link d'Água / QR d'Água) ---
        qrPageTitle: "Gerador de Páginas Pontes",
        qrPageSubtitle: "Crie pontes entre o físico e o digital.",
        typeBridge: "Cartão Digital (Página Ponte)",

        targetUrl: "URL de Destino",
        urlPlaceholder: "https://seunsite.com.br",

        waNumber: "Número do WhatsApp",
        waPlaceholder: "5592999999999",
        waMessage: "Mensagem Padrão",
        waMessagePlaceholder: "Olá! Gostaria de saber mais...",

        pixKey: "Chave PIX",
        pixPlaceholder: "CPF, Email ou Aleatória",
        pixName: "Nome do Beneficiário",
        pixCity: "Cidade",
        pixAmount: "Valor (Opcional)",

        bridgeTitle: "Título da Página",
        bridgeTitlePlaceholder: "Sua Empresa ou Nome",
        bridgeDesc: "Descrição / Bio",
        bridgeDescPlaceholder: "Breve descrição do seu negócio...",
        bridgeButton: "Texto do Botão Principal",
        bridgeButtonPlaceholder: "Fale Conosco",
        bridgeLink: "Link do Botão",

        // Colors & Design
        colorPrimary: "Cor Principal",
        colorSecondary: "Cor de Fundo",
        logoUpload: "Logo (URL ou Upload)",
        logoPlaceholder: "https://...",

        // Actions
        generateQR: "Gerar Link",
        downloadQR: "Baixar PNG",
        saveProject: "Salvar Projeto",
        updateProject: "Atualizar Projeto",
        cancelEdit: "Cancelar Edição",
        savedSuccess: "Projeto salvo com sucesso!",

        // --- MÓDULO PROMPTLAB --- (Merged)



        // --- MOBILE SPECIFIC ---
        mobilePipeline: "Pipeline de Vendas",
        noDeals: "Nenhum deal encontrado",
        viewDetails: "Ver Detalhes",
        changeStatus: "Mudar Status",
        selectNewStatus: "Selecione o novo status:",
        currentStatus: "(Atual)",
        totalDeals: "Total Deals",
        pipelineValue: "Pipeline Value",
        contact: "Contato",
        tags: "Tags",
        aiInsights: "💡 AI Insights",

        // --- COLUNAS PADRÃO ---
        lead: "Lead",
        qualified: "Qualificado",
        proposal: "Proposta",
        negotiation: "Negociação",
        closedWon: "Ganho",
        closedLost: "Perdido",

        // --- DEAL MODAL ---
        dealName: "Nome do Negócio",
        mainContact: "Contato Principal",
        contactName: "Nome do Contato",
        contactEmail: "Email do Contato",
        createDeal: "Criar Negócio",
        deleteDeal: "Excluir Negócio",
        analyzeDeal: "Analisar Negócio",
        addProductService: "Adicionar Produto/Serviço",
        add: "Adicionar",

        // --- AÇÕES GERAIS --- (Partial Dupes Removed)
        close: "Fechar",
        loading: "Carregando...",
        search: "Buscar",
        filter: "Filtrar",
        sort: "Ordenar",

        // --- BOARD SELECTOR ---
        createNewBoard: "Criar novo board",

        // --- JOURNEY/PLAYBOOK ---
        customerJourney: "Jornada do Cliente",

        // --- ADDITIONAL FIELDS ---
        estimatedValue: "Valor Estimado ($)",
        company: "Empresa",

        // --- LANDING PAGE --- (Merged)


        // --- NOTIFICATIONS ---
        notifications: "Notificações",
        notificationsEmpty: "Você está em dia!",
        notificationsEmptyDesc: "Nenhuma notificação nova",

        // --- HEADER & UI CONTROLS ---
        help: "Ajuda",
        user: "Usuário",
        refreshPermissions: "Atualizar permissões",
        lightMode: "Modo Claro",
        darkMode: "Modo Escuro",

        // --- BOARD EMPTY STATES ---
        boardEmpty: "Nenhum board encontrado",
        boardEmptyDesc: "Crie seu primeiro board para começar",
        welcomeCreateBoard: "Bem-vindo! Crie seu primeiro negócio",
        createFirstBoard: "Criar meu primeiro Board",

        // --- EMPTY STATES (NEW) ---
        noProjectsYet: "Nenhum projeto criado ainda. Crie seu primeiro projeto acima!",
        noPromptsSaved: "Nenhum prompt salvo ainda. Otimize um prompt e clique em \"Salvar\"!",
        noToolsFound: "Nenhuma ferramenta encontrada",
        noProductsRegistered: "Nenhum produto cadastrado",
        noAssetsCreated: "Nenhum ativo criado ainda",

        noActivitiesRecorded: "Nenhuma atividade registrada",
        noProductsAdded: "Nenhum produto adicionado. O valor do negócio é manual.",
        noLinksAdded: "Nenhum link adicionado. Clique em \"Adicionar Link\" para começar.",
        noTagsCreated: "Nenhuma tag criada",
        noCustomFieldsCreated: "Nenhum campo personalizado criado",

        noProductsAdminFirst: "Nenhum produto cadastrado. Cadastre produtos no Painel Admin primeiro.",
        noToolsInTechStack: "Nenhuma ferramenta cadastrada no Tech Stack.",
        noContractTemplates: "Nenhum template de contrato encontrado na biblioteca.",
        noDealsFound: "Nenhum negócio encontrado",

        noAssetsFound: "Nenhum ativo encontrado",

        // --- SETTINGS PAGE ---
        dangerZoneSection: "⚠️ Zona de Perigo",
        dangerZoneDesc: "Ações irreversíveis ou de debug. Use com cuidado.",
        homePage: "Página Inicial",
        homePageDesc: "Escolha qual tela deve abrir quando você iniciar o CRM.",
        resetOnboarding: "🔄 Reiniciar Tutorial de Onboarding",
        confirmResetOnboarding: "Tem certeza que deseja reiniciar o tutorial de onboarding? A página será recarregada.",

        // --- CONTACTS PAGE ---
        deleteContact: "Excluir Contato",
        confirmDeleteContact: "Tem certeza que deseja excluir este contato? Esta ação não pode ser desfeita.",

        // --- ACCESS CONTROL ---
        accessDenied: "Acesso não autorizado para seu perfil.",

        // --- BOARD CREATION & STRATEGY (NEW KEYS) ---
        createBoard: "Criar Novo Board",
        // editBoard: "Editar Board", // Already exists above
        // boardName: "Nome do Board", // Already exists above
        boardDescription: "Descrição",
        useTemplate: "Usar Template",
        manageContactsStage: "Gerencia Contatos no Estágio",
        noneGenericBoard: "Nenhum (Board Genérico)",
        finishHere: "Ao Ganhar, enviar para...",
        noneFinishHere: "Nenhum (Finalizar aqui)",
        kanbanStages: "Etapas do Kanban",
        addStage: "Adicionar etapa",
        manageStages: "Gerenciar Estágios",
        // cancel: "Cancelar", // Already exists above
        saveChanges: "Salvar Alterações",
        featureDevelopment: "Funcionalidade em desenvolvimento",

        // --- TEMPLATES ---
        templateBlank: "Board em branco",
        templatePreSales: "🎯 Pré-venda (Lead → MQL)",
        templateSales: "💰 Pipeline de Vendas",
        templateOnboarding: "🚀 Onboarding de Clientes",
        templateCS: "❤️ CS & Upsell",
        templateApplied: "✨ Template aplicado! Você pode editar os campos abaixo.",

        // --- AI PROCESSING MODAL ---
        creatingCRM: "Criando seu CRM",
        definingStrategyTitle: "Definindo Estratégia",
        aiAnalyzingDesc: "A IA está desenhando seu processo...",
        aiAligningDesc: "A IA está alinhando metas e agentes...",
        analyzingBusiness: "Analisando seu negócio...",
        analyzingBusinessDesc: "Entendendo o contexto e necessidades.",
        designingProcess: "Desenhando Processo",
        designingProcessDesc: "Criando fases do funil e automações.",
        preparingPreview: "Preparando Preview...",
        preparingPreviewDesc: "Gerando visualização interativa.",
        readingContext: "Lendo Contexto do Board...",
        readingContextDesc: "Analisando a estrutura final aprovada.",
        definingStrategy: "Definindo Estratégia",
        definingStrategyDesc: "Configurando metas e persona do agente.",
        finalizingCreation: "Finalizando Criação...",
        finalizingCreationDesc: "Montando seu board personalizado.",

        // --- BOARD STRATEGY HEADER ---
        defineStrategy: "Definir Estratégia do Board (Meta, Agente e Gatilhos)",
        boardStrategy: "Estratégia do Board",
        strategySubtitle: "Defina como a IA deve trabalhar aqui",
        entryRules: "Regras de Entrada (O Filtro)",
        entryRulesPlaceholder: "Descreva as regras para a IA: Quem deve entrar aqui? Quais critérios de qualidade?",
        entryRulesHint: "A IA usará isso para filtrar leads",
        goalObjective: "Objetivo (O Alvo)",
        goalContextPlaceholder: "Por que essa meta existe? Qual o contexto estratégico?",
        agentExecutor: "Agente (O Executor)",
        agentName: "Nome",
        agentRole: "Cargo",
        agentBehaviorPlaceholder: "Como o agente deve agir? (Tom de voz, postura...)",
        completed: "Concluído",
        details: "Detalhes",
        speak: "Falar",
        behavior: "Comportamento",

        // --- PROMPT LAB ---
        yourRawIdea: "Sua Ideia Bruta",
        areaOfExpertise: "Área de Atuação",
        describeIdea: "Descreva sua ideia",
        optimizePrompt: "✨ Otimizar Prompt",

        wasThisUseful: "Esta resposta foi útil?",
        useful: "👍 Útil",
        notUseful: "👎 Não Útil",
        feedbackRegistered: "Feedback registrado! Obrigado.",
        tipsTitle: "💡 Dicas para melhores resultados",
        savedPrompts: "📚 Prompts Salvos",

        savePrompt: "Salvar Prompt",
        title: "Título",

        saving: "Salvando...",


        // Personas
        softwareEngineer: "Engenheiro de Software",
        productManager: "Product Manager",
        dataScientist: "Cientista de Dados",
        designer: "Designer",
        marketer: "Profissional de Marketing",
        teacher: "Professor",
        botArchitect: "Arquiteto de Bots",
        llmTrainer: "Treinador de LLM",
        webArchitect: "Arquiteto Web",

        // --- MAZÔ INTERNAL AGENT ---
        mazoRole: "Estrategista CX/CS",
        mazoPitch: "Estrategista interna. Analiso dados, saúde do cliente e sugiro ações para retenção.",

        // --- PHONE MOCKUP ---
        pageTitleDefault: "Título da Página",
        businessDescDefault: "Descrição do seu negócio",
        clickHere: "Clique Aqui",
        clientNameDefault: "Nome do Cliente",
        professionalBio: "Bio profissional",
        scanToAccess: "Escaneie para acessar",
        fillFormPreview: "Preencha o formulário para ver o preview",
        website: "Website",
        whatsapp: "WhatsApp",

        // --- TOUR ---
        tourWelcomeTitle: "Bem-vindo ao Encontro D'água .hub 🌀",
        tourWelcomeDesc: "Conheça seu Board de IA: Precy (Financeiro), Jury (Jurídico) e Mazô (Estratégia). Elas trabalham 24/7 por você.",
        tourPromptLabTitle: "Prompt Lab 🧠",
        tourPromptLabDesc: "Transforme ideias em ouro aqui. Engenharia de prompt estratégica para maximizar resultados da IA.",
        tourBoardsTitle: "Boards & Estratégia 📋",
        tourBoardsDesc: "Crie estratégias completas com IA em segundos usando nossos templates especializados.",
        tourAiflowTitle: "AI Hub - Suporte Inteligente 🤖",
        tourAiflowDesc: "Precisa de ajuda? O AI Hub é sua central de inteligência para te guiar pelo sistema.",
        tourQrTitle: "Link d'Água: Portal de Presença Integrada 📱",
        tourQrDesc: "Crie seu primeiro cartão digital agora. Links e Códigos dinâmicos conectando negócios no mundo digital.",
        skipTour: "Pular tour",
        previous: "Anterior",
        next: "Próximo",
        start: "Começar",

        // --- LANDING PAGE BADGE & FOOTER ---
        landingBadge: "🚀 Mobile First • AI First • Impacto Real",
        footerRights: "Todos os direitos reservados",

        // --- GALLERY ---


        // CRM Simulator
        crmNative: "CRM Nativo",
        smartManagement: "Gestão Inteligente",
        crmSimDesc: "Veja como a IA assiste você na gestão de leads e clientes",
        crmSimTip: "💡 Clique em 'Executar' no popup roxo para ver a mágica acontecer",
        leadColumn: "LEAD",
        negotiationColumn: "EM NEGOCIAÇÃO",
        clientColumn: "CLIENTE",
        aiInsightTitle: "💡 Insight da IA",
        aiInsightText: "Maria demonstrou interesse no Serviço X. Enviar Proposta?",
        executeBtn: "✨ Executar",
        crmCredits: "Base do CRM desenvolvida exclusivamente para alunos vitalícios da",
        crmInterest: "Tenho interesse no CRM",
        proposalSent: "Proposta enviada",
        activeSince: "Ativo desde Jan/2025",
        convertedSuccess: "Convertida com sucesso!",
        interestQr: "Interesse em Link d'Água",
        consultingCrm: "Consultoria CRM",
        wonLabel: "Ganho",

        // Prompt Lab
        insertIdeaFirst: "Por favor, insira sua ideia primeiro",
        apiKeyMissing: "API Key do Gemini não configurada",
        promptOptimizedSuccess: "Prompt otimizado com sucesso!",
        errorOptimizing: "Erro ao otimizar prompt",
        promptCopied: "Prompt copiado!",
        errorCopying: "Erro ao copiar",
        errorLoadingPrompts: "Erro ao carregar prompts salvos",
        insertTitle: "Por favor, insira um título",
        loginRequired: "Você precisa estar logado",
        promptSavedSuccess: "Prompt salvo com sucesso!",
        errorSaving: "Erro ao salvar prompt",
        confirmDeletePrompt: "Tem certeza que deseja excluir este prompt?",
        promptDeleted: "Prompt excluído!",
        errorDeleting: "Erro ao excluir prompt",
        promptLoaded: "Prompt carregado!",
        optimizeFirst: "Primeiro otimize um prompt",
        testCompleted: "Teste concluído!",
        errorTesting: "Erro ao testar prompt",
        errorFeedback: "Erro ao salvar feedback",
        feedbackPositive: "Obrigado pelo feedback positivo!",
        feedbackNegative: "Obrigado! Vamos melhorar.",
        promptPlaceholderTitle: "Seu prompt otimizado aparecerá aqui",
        promptPlaceholderDesc: "Preencha sua ideia e clique em 'Otimizar Prompt'",
        titleRequired: "Título *",
        tagsPlaceholder: "Tags (separadas por vírgula)",
        promptLabSubtitle: "Transforme ideias brutas em prompts perfeitos com IA",

        // Agents & Tools
        // Jury
        contractGenerator: "Gerador de Contratos",
        legalAssistant: "Assistente Jurídico com IA",
        openLegalChat: "Abrir Chat Jurídico",
        serviceContract: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS",
        clientSignature: "Assinatura do Cliente",
        contractorSignature: "Assinatura do Contratante",
        contractExported: "Contrato exportado!",
        pricingBreakdown: "DETALHAMENTO FINANCEIRO",
        totalCost: "Custo Total",
        revenue: "Receita",
        profitMargin: "Margem de Lucro",

        // Precy
        smartPricingCalc: "Calculadora de Precificação Inteligente",
        pricingFormula: "Fórmula: (Custo Stack + Horas × Taxa) × (1 + Margem%) × Impacto",
        editableParams: "Parâmetros Editáveis",
        hourlyRateLabel: "Valor Hora Técnica (R$)",
        profitMarginLabel: "Margem de Lucro (%)",
        projectTools: "Ferramentas do Projeto (Tech Stack)",
        loadingStack: "Carregando tech stack...",
        noToolsRegistered: "Nenhuma ferramenta cadastrada no Tech Stack.",
        addToolsHint: "Adicione ferramentas na página Admin > Tech Stack",
        commercialProposal: "PROPOSTA COMERCIAL",
        pricingCalculation: "CÁLCULO DE PRECIFICAÇÃO",
        stackCost: "Custo Stack",
        estimatedHours: "Horas Estimadas",
        basePrice: "Preço Base",
        finalPrice: "PREÇO FINAL",
        socialPricing: "PRECIFICAÇÃO SOCIAL",
        impact: "IMPACTO",
        featureInDev: "Funcionalidade em desenvolvimento",

        // Mazo
        paymentCurrent: "✅ Em Dia",
        paymentLate: "⏰ Atrasado",
        paymentOverdue: "🚨 Inadimplente",


    },
    en: {
        // --- NAVEGAÇÃO GLOBAL ---
        navHome: "Home",
        navCRM: "Management (CRM)",
        navBoards: "Boards",
        navContacts: "Contacts",
        navActivities: "Activities",
        navReports: "Reports",
        navQR: "Bridge Pages",
        navPrompts: "Prompt Lab",
        navAdmin: "Admin",
        logout: "Logout",
        profile: "Profile",
        aboutUs: "About Us",
        becomeClient: "Become a Client",
        login: "Login",
        enter: "Enter",
        home: "Home",
        solutions: "Solutions",
        gallery: "Gallery",

        // --- SIDEBAR & NAVIGATION ---
        inbox: "Inbox",
        dashboard: "Dashboard",
        boards: "Boards",
        contacts: "Contacts",
        activities: "Activities",
        qrWater: "Bridge Pages",
        promptLab: "Prompt Lab",
        reports: "Reports",
        aiHub: "AI Hub",
        decisions: "Decisions",
        settings: "Settings",
        admin: "Admin",
        techStack: "Tech Stack",
        editProfile: "Edit Profile",
        signOut: "Sign Out",
        openMenu: "Open menu",

        // --- DASHBOARD ---
        dashboardTitle: "Dashboard",
        dashboardSubtitle: "The pulse of your business in real-time.",
        thisMonth: "This Month",
        lastQuarter: "Last Quarter",
        thisYear: "This Year",
        walletAnalysis: "Wallet Analysis",
        downloadReport: "Download Report",
        totalPipeline: "Total Pipeline",
        activeDeals: "Active Deals",
        conversionRate: "Conversion",
        revenueWon: "Revenue (Won)",
        walletHealth: "Wallet Health",
        walletDistribution: "Wallet Distribution",
        active: "Active",
        inactive: "Inactive",
        churn: "Churn",
        churnRisk: "Churn Risk",
        clients: "Clients",
        alerts: "Alerts",
        churnRiskDesc: "Active clients without purchase > 30 days.",
        runCheckNow: "Run check now",
        noRisksDetected: "No risks detected",
        avgLTV: "Avg LTV",
        ltvDesc: "Average lifetime value per active client.",
        salesFunnel: "Sales Funnel",
        recentActivities: "Recent Activities",
        noRecentActivities: "No recent activities",
        viewAllActivities: "View all activities",

        // --- INBOX ---
        inboxTitle: "Inbox",
        inboxSubtitle: "Your workbench.",

        // --- REPORTS ---
        reportsTitle: "Performance Reports",
        reportsSubtitle: "Detailed sales and trend analysis.",
        revenueTrend: "Revenue Trend",
        last6Months: "Last 6 Months",
        salesCycle: "Sales Cycle",
        avgDays: "Average",
        fastestDays: "Fastest",
        slowestDays: "Slowest",
        basedOnDeals: "Based on {count} closed deals.",
        winLossAnalysis: "Win/Loss Analysis",
        winRate: "Win Rate",
        winsLosses: "Wins / Losses",
        topLossReasons: "Top Loss Reasons",
        topOpportunities: "Top Opportunities",
        viewAll: "View all",
        opportunity: "Opportunity",
        value: "Value",
        probability: "Probability",
        owner: "Owner",

        // --- DECISIONS ---
        decisionsTitle: "Decision Center",
        decisionsSubtitle: "Proactive decisions for you to take action quickly",
        analyzeNow: "Analyze Now",
        analyzingCRM: "Analyzing...",
        lastAnalysis: "Last analysis",
        neverAnalyzed: "Never analyzed",
        noDecisionsPending: "No pending decisions",
        clickAnalyzePrompt: "Click 'Analyze Now' for AI to analyze your CRM and suggest actions based on stalled deals, overdue activities, and opportunities.",
        analyzeMyCRM: "Analyze My CRM",
        approveAll: "Approve all suggested",
        clearAll: "Clear all",
        total: "Total",
        critical: "Critical",
        important: "Important",
        moderate: "Moderate",
        low: "Low",
        reasoningLabel: "Why am I suggesting this?",
        suggestedActionLabel: "Suggested Action:",
        orLabels: "Or:", // 'or' might be reserved, using orLabels just in case but key will be 'orLabels'
        or: "Or:",
        approve: "Approve",
        snooze: "Snooze",
        ignore: "Ignore",

        // --- SETTINGS ---
        homePage: "Home Page",
        homePageDesc: "Choose which screen you see when logging in.",
        dangerZoneSection: "Danger Zone",
        dangerZoneDesc: "Irreversible actions that affect your local data.",
        resetOnboarding: "Reset Onboarding",
        confirmResetOnboarding: "Are you sure? This will reset the tour and initial tips.",
        general: "General",
        data: "Data",
        team: "Team",

        // --- ADMIN ---
        adminPanelTitle: "Admin Panel 2.0",
        adminPanelSubtitle: "Advanced user and permission management",
        users: "Users",
        catalog: "Catalog",
        searchPlaceholder: "Search by email, name or phone...",
        totalUsers: "Total",
        planFree: "Free",
        planMonthly: "Monthly",
        planAnnual: "Annual",
        editUser: "Edit User",
        save: "Save",
        cancel: "Cancel",
        plan: "Plan",
        status: "Status",
        phone: "Phone",
        backToDashboard: "Back to Dashboard",
        noUsersFound: "No users found.",
        generateInviteLink: "Generate Invite Link",

        // --- AGENTS ---
        pricingEngineer: "Pricing Engineer",
        legalAnalyst: "Legal Analyst",
        internalCS: "Internal Customer Success",
        precyDesc: "Calculates fair price based on cost, hours, and impact. Includes social pricing.",
        mazoDesc: "Focused on retention, empathy, and customer health. Proactively prevents churn.",
        juryDesc: "Generates contracts using library templates. Ensures compliance and security.",
        inviteUsersDesc: "Invite new users to the Hub",
        generateInviteButton: "GENERATE INVITE (ANTI-CRASH)",
        inviteCreated: "✅ INVITE CREATED! COPY BELOW:",
        inviteError: "Error generating invite: ",



        // --- LANDING PAGE (EN) ---
        saasPitch: "White Label SaaS Infrastructure",
        mobileFirst: "Mobile First",
        aiFirst: "AI First",
        realImpact: "Real Impact",
        accessibleTech: "More accessible",
        accessibleTechHighlight: "technology.",
        heroSubtitleLanding: "A digital ecosystem offering the best technological solutions to solve real problems and ensure results and prosperity for all.",
        knowHub: "Discover the Hub",

        // Solutions
        ourSolutions: "Our Solutions",
        solutionsDesc: "We don't just sell automations or prompts. We offer real solutions for real problems. Our focus is to fulfill your wish with fair pricing, sensitive listening, and assertive technology.",
        realSolutions: "real solutions for real problems",

        // Prompt Lab Section
        promptLabTitle: "Prompt Lab",
        promptLabTag: "Prova D'água (Free Demo)",
        promptLabHeadline: "Transform raw ideas into",
        promptLabHeadlineHighlight: "structured and efficient prompts",
        promptLabSub: "using professional prompt engineering.",
        promptLabDesc: "Our AI analyzes your intent and creates optimized prompts ready to use in any LLM (ChatGPT, Claude, Gemini). Test for free below and see the difference in response quality.",
        inputPlaceholder: "Ex: Create caption for product photo...",
        optimizing: "⏳ Optimizing...",
        optimize: "✨ Optimize",
        copy: "Copy",
        accessPro: "Access Pro Hub",
        aiResponse: "AI Response",
        testPrompt: "🧪 Test Prompt",
        testing: "⏳ Testing...",
        wantJustPromptLab: "💡 Want just Prompt Lab?",
        promptLabBenefits: "AI Agents & LLM Personalization",
        subscribePro: "Subscribe Pro Monthly ($1.00)",

        // QR Section
        qrTitle: "Link d'Água",
        qrTag: "Link d'Água",
        qrHeadline: "Digital Identity Generator",
        qrWaterTitle: "Link d'Água: The Hybrid Experience",
        qrDesc: "Connect your business through Physical Code (Printed QR) or Digital Link (WhatsApp/Bio). Total fidelity: what you see is what your customers get.",
        linkDaguaBadge: "Main Product",
        linkDaguaTitle: "Link d'Água",
        linkDaguaSubtitle: "Your digital showcase",
        linkDaguaDesc: "A professional page with <strong className=\"text-white\">all your links, services, and contacts</strong> in a single shareable address.",
        feat1: "📱 Single link for WhatsApp, Instagram, and bio",
        feat2: "🛍️ Showcase products and services with photos",
        feat3: "📊 Real-time click analytics",
        feat4: "🔗 Automatic QR Code and custom link",
        feat5: "✅ No website needed — works directly on mobile",
        viewShowcase: "View Showcase",
        getMine: "Get Mine",
        linksTitle: "Lidi Moura",
        linksSubtitle: "link.encontrodagua.com/lidi",
        link1: "WhatsApp",
        link2: "Instagram",
        link3: "Portfolio",
        link4: "Scheduling",
        linkStats: "247 clicks this week ↑",

        // Gallery Section
        galleryTitle: "Client Gallery",
        galleryTag: "Client Gallery",
        galleryHeadline: "Hub Client Gallery",
        clientGallery: "Hub Client Gallery",
        galleryDesc: "See how entrepreneurs are using Link d'Água to connect with their clients",
        clientGalleryDesc: "See how entrepreneurs are using Link d'Água to connect with their clients",
        swipeToSee: "← Swipe to see more →",
        wantToAppear: "💡 Want to appear here? Check 'Authorize Gallery' when creating your project!",

        // Amazo Section
        amazoTag: "AI Agent",
        amazoTitle: "Amazô AI",
        amazoDesc: "Amazô helps with diagnosis. 24/7 Support for CS and Sales directly on WhatsApp.",
        talkToAmazo: "Chat with Amazô",
        talkToAmazoDesc: "Ask questions, request diagnosis, or learn more about our solutions",
        chatWithAmazo: "Talk to Amazô now",

        // Manifesto
        manifestoTitle: "Manifesto",
        manifestoText: "The Encontro D'água Hub was not born in Silicon Valley, but from the real need to connect people and technology in a more sustainable and accessible way. We started simple, creating custom GEMs, and today we are a living digital ecosystem with integrated artificial intelligence. This hub is proof of our commitment: every line of code and strategy was created by the founder with support from her team of AI agents. We are building sustainable technology that is accessible to everyone who needs it, enabling greater prosperity.",

        // Tech For All
        techForAll: "Technology for Everyone",
        noOneLeftBehind: "🤝 No one left behind",
        socialImpact: "Special conditions for social impact.",
        socialConsult: "Social Consult (WhatsApp)",

        // Team
        teamTitle: "Team",
        founderRole: "Founder & Vision",
        techLeadRole: "Tech Lead",
        csRole: "CS & Sales",
        devRole: "Dev",
        founderPitch: "Digital Solutions Creator and Hub Founder. Graduated in Psychology, specializing in Data Science (ONE/Alura/Oracle) with certifications in OCI, AI, and MySQL. She architects and manages the entire digital ecosystem in a heutagogic mode, working side by side with the Antigravity agent.",
        precyPitch: "Financial Intelligence (Tech). Precy calculates pricing and ROI with multi-currency support (BRL, USD, AUD), automatically applying Social Impact mechanics for NGOs.",
        juryPitch: "Legal Intelligence (Legal). Generates clean contracts adaptable for Common Law (International) and Brazilian Systems. Fully integrated into the business Board.",
        amazoPitch: "Active Listening Specialist. Amazô performs the initial diagnosis of your business and guides you to the ideal solution, available anytime.",
        antigravityPitch: "Autonomous Solutions Architect. An advanced AI working in a heutagogic dynamic with Lidi. Together, they transform business strategies into clean code and scalable, functional architecture.",

        // Footer
        footerText: "Inspired by nature, coded for the world.",

        // --- AI HUB PAGE ---
        aiAssistant: "AI Assistant",
        aiWelcomeTitle: "Hello! I'm your CRM assistant",
        aiWelcomeMessage: "I can help you manage deals, activities, contacts, and more. Try asking something!",
        aiPlaceholder: "Ask something about your CRM...",
        aiPoweredBy: "Powered by Gemini 2.5 Flash • Answers may contain inaccuracies",
        clearConversation: "Clear conversation",

        // --- LOGIN PAGE ---
        welcomeBack: "Welcome back",
        loginSubtitle: "Sign in to your account to continue.",
        password: "Password",
        forgotPassword: "Forgot password",
        signIn: "Sign In",


        // --- TEAM MANAGEMENT ---
        teamMembers: "Team Members",
        teamMembersDesc: "Manage team members and their permissions",
        member: "Member",
        role: "Role",
        email: "Email",
        access: "Access",
        note: "Note",
        teamMembersNote: "This is the core Hub team. New members can be added via the Admin Panel.",


        // --- CRM CORE (KANBAN) ---
        addDeal: "Add Deal",
        newDeal: "New Deal",
        allDeals: "All Deals",
        myDeals: "My Deals",
        kanbanSearchPlaceholder: "Search...",
        filterByStatus: "Filter by status",
        dropHere: "✓ Drop here!",
        dealStale: "Stale Deal (>10 days without update)",
        totalValue: "Total",

        // --- DEAL CARD ---
        priority: "Priority",
        high: "High",
        medium: "Medium",


        // --- MAZO AGENT (HEALTH SCORE) ---
        healthAnalysis: "Customer Health Analysis",
        analyzeHealth: "Analyze Customer Health",
        customerHealth: "Customer Health",
        healthChurnRisk: "Critical Churn Risk",
        healthy: "Healthy Customer",
        atRisk: "At Risk Customer",
        healthCritical: "Critical Churn Risk",
        lastContact: "Last Contact",
        customerName: "Customer Name",
        satisfaction: "Satisfaction (1-10)",
        usageFrequency: "Usage Frequency",
        paymentStatus: "Payment Status",
        daily: "Daily",
        weekly: "Weekly",
        monthly: "Monthly",
        rarely: "Rarely",
        current: "✅ Current",
        late: "⏰ Late",
        overdue: "🚨 Overdue",
        recommendedActions: "Recommended Actions",
        engagement: "Engagement",
        usage: "Usage",
        payment: "Payment",
        retentionFocus: "Focused on retention, empathy and churn prevention",

        // --- ONBOARDING & TEMPLATES ---
        createBoardTitle: "Create New Board",
        editBoard: "Edit Board",
        aiGeneration: "Generate with AI",
        templates: "Ready-made Templates",
        selectTemplate: "Select a template",
        salesPipeline: "Sales Pipeline",
        hiringPipeline: "Hiring Pipeline",
        projectTrack: "Project Management",
        blankBoard: "Create blank board",
        perfectCreateBoard: "✅ Perfect! Create Board",
        boardName: "Board Name",

        // --- BRIDGE PAGES MODULE (formerly QR d'Água) ---
        qrPageTitle: "Bridge Pages Generator",
        qrPageSubtitle: "Create bridges between the physical and digital world.",
        createQR: "Create New Bridge Page",
        downloadQR: "Download PNG",
        saveProject: "Save Project",
        updateProject: "Update Project",
        cancelEdit: "Cancel Edit",
        savedSuccess: "Project saved successfully!",
        configTab: "Configuration",
        designTab: "Design",
        contentTab: "Content",
        previewTab: "Preview",
        qrType: "Link Type",
        typeLink: "External Link / Code",
        typeWhatsapp: "WhatsApp",
        typePix: "PIX",
        typeBridge: "Digital Card (Bridge Page)",
        targetUrl: "Destination URL",
        urlPlaceholder: "https://yoursite.com",
        waNumber: "WhatsApp Number",
        waPlaceholder: "5592999999999",
        waMessage: "Default Message",
        waMessagePlaceholder: "Hello! I'd like to know more...",
        pixKey: "PIX Key",
        pixPlaceholder: "CPF, Email or Random",
        pixName: "Beneficiary Name",
        pixCity: "City",
        pixAmount: "Amount (Optional)",
        bridgeTitle: "Page Title",
        bridgeTitlePlaceholder: "Your Business or Name",
        bridgeDesc: "Description / Bio",
        bridgeDescPlaceholder: "Brief description of your business...",
        bridgeButton: "Main Button Text",
        bridgeButtonPlaceholder: "Contact Us",
        bridgeLink: "Button Link",
        colorPrimary: "Primary Color",
        colorSecondary: "Background Color",
        logoUpload: "Logo (URL or Upload)",
        logoPlaceholder: "https://...",
        generateQR: "Generate Link",

        // --- PROMPTLAB MODULE ---
        promptTitle: "Prompt Laboratory",
        promptDesc: "Create, test, and store your AI commands.",
        newPrompt: "New Prompt",
        runPrompt: "Run",

        // --- MOBILE SPECIFIC ---
        mobilePipeline: "Sales Pipeline",
        noDeals: "No deals found",
        viewDetails: "View Details",
        changeStatus: "Change Status",
        selectNewStatus: "Select new status:",
        currentStatus: "(Current)",
        totalDeals: "Total Deals",
        pipelineValue: "Pipeline Value",
        contact: "Contact",
        tags: "Tags",
        aiInsights: "💡 AI Insights",

        // --- STANDARD COLUMNS ---
        lead: "Lead",
        qualified: "Qualified",
        proposal: "Proposal",
        negotiation: "Negotiation",
        closedWon: "Closed Won",
        closedLost: "Closed Lost",

        // --- DEAL MODAL ---
        dealName: "Deal Name",
        mainContact: "Main Contact",
        contactName: "Contact Name",
        contactEmail: "Contact Email",
        createDeal: "Create Deal",
        deleteDeal: "Delete Deal",
        analyzeDeal: "Analyze Deal",
        addProductService: "Add Product/Service",
        add: "Add",

        // --- GENERAL ACTIONS ---

        delete: "Delete",
        edit: "Edit",
        close: "Close",
        loading: "Loading...",
        search: "Search",
        filter: "Filter",
        sort: "Sort",

        // --- BOARD SELECTOR ---
        createNewBoard: "Create new board",

        // --- JOURNEY/PLAYBOOK ---
        customerJourney: "Customer Journey",

        // --- ADDITIONAL FIELDS ---
        estimatedValue: "Estimated Value ($)",
        company: "Company",



        // --- NOTIFICATIONS ---
        notifications: "Notifications",
        notificationsEmpty: "All caught up!",
        notificationsEmptyDesc: "No new notifications",

        // --- HEADER & UI CONTROLS ---
        help: "Help",
        user: "User",
        refreshPermissions: "Refresh permissions",
        lightMode: "Light Mode",
        darkMode: "Dark Mode",

        // --- BOARD EMPTY STATES ---
        boardEmpty: "No boards found",
        boardEmptyDesc: "Create your first board to get started",
        welcomeCreateBoard: "Welcome! Create your first deal",
        createFirstBoard: "Create my first Board",

        // --- EMPTY STATES (NEW) ---
        noProjectsYet: "No projects created yet. Create your first project above!",
        noPromptsSaved: "No prompts saved yet. Optimize a prompt and click \"Save\"!",
        noToolsFound: "No tools found",
        noProductsRegistered: "No products registered",
        noAssetsCreated: "No assets created yet",

        noActivitiesRecorded: "No activities recorded",
        noProductsAdded: "No products added. Deal value is manual.",
        noLinksAdded: "No links added. Click \"Add Link\" to start.",
        noTagsCreated: "No tags created",
        noCustomFieldsCreated: "No custom fields created",

        noProductsAdminFirst: "No products registered. Register products in Admin Panel first.",
        noToolsInTechStack: "No tools registered in Tech Stack.",
        noContractTemplates: "No contract templates found in library.",
        noDealsFound: "No deals found",

        // CRM Simulator
        crmNative: "Native CRM",
        smartManagement: "Smart Management",
        crmSimDesc: "See how AI seamlessly assists you in proactively managing leads and clients.",
        crmSimTip: "💡 Click 'Execute' on the purple popup to see the magic happen",
        leadColumn: "LEAD",
        negotiationColumn: "IN NEGOTIATION",
        clientColumn: "CLIENT",
        aiInsightTitle: "💡 AI Insight",
        aiInsightText: "Maria showed interest in Service X. Send Proposal?",
        executeBtn: "✨ Execute",
        crmCredits: "Core CRM architecture developed exclusively for lifetime students of",
        crmInterest: "I'm interested in the CRM",
        proposalSent: "Proposal sent",
        activeSince: "Active since Jan/2025",
        convertedSuccess: "Successfully converted!",
        interestQr: "Interested in Link d'Água",
        consultingCrm: "CRM Consulting",
        wonLabel: "Won",

        // Prompt Lab (Additional Keys)
        insertIdeaFirst: "Please insert your idea first",
        apiKeyMissing: "Gemini API Key not configured",
        promptOptimizedSuccess: "Prompt optimized successfully!",
        errorOptimizing: "Error optimizing prompt",
        promptCopied: "Prompt copied!",
        errorCopying: "Error copying",
        errorLoadingPrompts: "Error loading saved prompts",
        insertTitle: "Please insert a title",
        loginRequired: "You must be logged in",
        promptSavedSuccess: "Prompt saved successfully!",
        errorSaving: "Error saving prompt",
        confirmDeletePrompt: "Are you sure you want to delete this prompt?",
        promptDeleted: "Prompt deleted!",
        errorDeleting: "Error deleting prompt",
        promptLoaded: "Prompt loaded!",
        optimizeFirst: "First optimize a prompt",
        testCompleted: "Test completed!",
        errorTesting: "Error testing prompt",
        errorFeedback: "Error saving feedback",
        feedbackPositive: "Thank you for the positive feedback!",
        feedbackNegative: "Thank you! We will improve.",
        promptPlaceholderTitle: "Your optimized prompt will appear here",
        promptPlaceholderDesc: "Enter your idea and click 'Optimize Prompt'",
        titleRequired: "Title *",
        tagsPlaceholder: "Tags (comma separated)",
        promptLabSubtitle: "Transform raw ideas into perfect prompts with AI",

        // Agents & Tools
        contractGenerator: "Contract Generator",
        legalAssistant: "AI Legal Assistant",
        openLegalChat: "Open Legal Chat",
        serviceContract: "SERVICE PROVISION CONTRACT",
        contractExported: "Contract exported!",
        pricingBreakdown: "FINANCIAL BREAKDOWN",
        totalCost: "Total Cost",
        revenue: "Revenue",
        profitMargin: "Profit Margin",

        // Precy
        smartPricingCalc: "Smart Pricing Calculator",
        pricingFormula: "Formula: (Stack Cost + Hours × Rate) × (1 + Margin%) × Impact",
        editableParams: "Editable Parameters",
        hourlyRateLabel: "Technical Hourly Rate ($)",
        profitMarginLabel: "Profit Margin (%)",
        projectTools: "Project Tools (Tech Stack)",
        loadingStack: "Loading tech stack...",
        addToolsHint: "Add tools on the Admin > Tech Stack page",
        commercialProposal: "COMMERCIAL PROPOSAL",
        pricingCalculation: "PRICING CALCULATION",
        stackCost: "Stack Cost",
        estimatedHours: "Estimated Hours",
        basePrice: "Base Price",
        finalPrice: "FINAL PRICE",
        socialPricing: "SOCIAL PRICING",
        impact: "IMPACT",

        // --- SETTINGS PAGE ---


        // --- CONTACTS PAGE ---
        deleteContact: "Delete Contact",
        confirmDeleteContact: "Are you sure you want to delete this contact? This action cannot be undone.",

        // --- ACCESS CONTROL ---
        accessDenied: "Access denied for your profile.",

        // --- BOARD CREATION & STRATEGY ---
        createBoard: "Create New Board",
        // editBoard: "Edit Board", // Already exists
        // boardName: "Board Name", // Already exists
        boardDescription: "Description",
        useTemplate: "Use Template",
        manageContactsStage: "Manage Contacts in Stage",
        noneGenericBoard: "None (Generic Board)",
        finishHere: "When Won, send to...",
        noneFinishHere: "None (Finish here)",
        kanbanStages: "Kanban Stages",
        addStage: "Add stage",
        manageStages: "Manage Stages",
        // cancel: "Cancel", // Already exists
        saveChanges: "Save Changes",
        featureDevelopment: "Feature in development",

        // --- TEMPLATES ---
        templateBlank: "Blank Board",
        templatePreSales: "🎯 Pre-sales (Lead → MQL)",
        templateSales: "💰 Sales Pipeline",
        templateOnboarding: "🚀 Customer Onboarding",
        templateCS: "❤️ CS & Upsell",
        templateApplied: "✨ Template applied! You can edit the fields below.",

        // --- AI PROCESSING MODAL ---
        creatingCRM: "Creating your CRM",
        definingStrategyTitle: "Defining Strategy",
        aiAnalyzingDesc: "AI is designing your process...",
        aiAligningDesc: "AI is aligning goals and agents...",
        analyzingBusiness: "Analyzing your business...",
        analyzingBusinessDesc: "Understanding context and needs.",
        designingProcess: "Designing Process",
        designingProcessDesc: "Creating funnel stages and automations.",
        preparingPreview: "Preparing Preview...",
        preparingPreviewDesc: "Generating interactive visualization.",
        readingContext: "Reading Board Context...",
        readingContextDesc: "Analyzing final approved structure.",
        definingStrategy: "Defining Strategy",
        definingStrategyDesc: "Configuring goals and agent persona.",
        finalizingCreation: "Finalizing Creation...",
        finalizingCreationDesc: "Assembling your custom board.",

        // --- BOARD STRATEGY HEADER ---
        defineStrategy: "Define Board Strategy (Goal, Agent, and Triggers)",
        boardStrategy: "Board Strategy",
        strategySubtitle: "Define how AI should work here",
        entryRules: "Entry Rules (The Filter)",
        entryRulesPlaceholder: "Describe rules for AI: Who should enter here? What are the quality criteria?",
        entryRulesHint: "AI will use this to filter leads",
        goalObjective: "Goal (The Target)",
        goalContextPlaceholder: "Why does this goal exist? What is the strategic context?",
        agentExecutor: "Agent (The Executor)",
        agentName: "Name",
        agentRole: "Role",
        agentBehaviorPlaceholder: "How should the agent act? (Tone of voice, posture...)",
        completed: "Completed",
        details: "Details",
        speak: "Speak",
        behavior: "Behavior",
        contractorSignature: "Contractor Signature",
        clientSignature: "Client Signature",

        // --- TOUR ---
        tourWelcomeTitle: "Welcome to Encontro D'água .hub 🌀",
        tourWelcomeDesc: "Meet your AI Board: Precy (Finance), Jury (Legal), and Mazo (Strategy). They work 24/7 for you.",
        tourPromptLabTitle: "Prompt Lab 🧠",
        tourPromptLabDesc: "Turn ideas into gold here. Strategic prompt engineering to maximize AI results.",
        tourBoardsTitle: "Boards & Strategy 📋",
        tourBoardsDesc: "Create complete AI strategies in seconds using our specialized templates.",
        tourAiflowTitle: "AI Hub - Smart Support 🤖",
        tourAiflowDesc: "Need help? AI Hub is your intelligence center to guide you through the system.",
        tourQrTitle: "Link d'Água: The Hybrid Portal 📱",
        tourQrDesc: "Create your first digital card now. Dynamic Links and Codes connecting business in the digital world.",
        skipTour: "Skip tour",
        previous: "Previous",
        next: "Next",
        start: "Start",


    },

    // ─────────────────────────────────────────────────────────────────────────
    // ESPAÑOL (ES) — Infraestrutura Trilíngue
    // Status: Placeholders prontos. Preencher incrementalmente.
    // Fallback: ES → EN → PT (garantido pelo LanguageContext v3)
    // Padrão: Seguindo convenções da Amazon i18n para SaaS B2B
    // ─────────────────────────────────────────────────────────────────────────
    es: {
        // --- NAVEGACIÓN GLOBAL ---
        navHome: "Inicio",
        navCRM: "Gestión (CRM)",
        navBoards: "Tableros",
        navContacts: "Contactos",
        navActivities: "Actividades",
        navReports: "Informes",
        navQR: "Bridge Pages",
        navPrompts: "Prompt Lab",
        navAdmin: "Admin",
        logout: "Cerrar sesión",
        profile: "Perfil",
        login: "Ingresar",
        enter: "Ingresar",
        home: "Inicio",

        // --- DASHBOARD ---
        dashboard: "Dashboard",
        dashboardTitle: "Dashboard",
        dashboardSubtitle: "El pulso de tu negocio en tiempo real.",
        thisMonth: "Este Mes",
        lastQuarter: "Último Trimestre",
        thisYear: "Este Año",
        totalPipeline: "Pipeline Total",
        activeDeals: "Negocios Activos",
        conversionRate: "Conversión",
        revenueWon: "Ingresos (Ganados)",

        // --- INBOX ---
        inboxTitle: "Bandeja de Entrada",
        inboxSubtitle: "Tu mesa de trabajo.",

        // --- CRM CORE ---
        addDeal: "Agregar Negocio",
        newDeal: "Nuevo Negocio",
        allDeals: "Todos los Negocios",
        myDeals: "Mis Negocios",
        lead: "Lead",
        qualified: "Calificado",
        proposal: "Propuesta",
        negotiation: "Negociación",
        closedWon: "Cerrado Ganado",
        closedLost: "Cerrado Perdido",

        // --- ONBOARDING ---
        createBoardTitle: "Crear Nuevo Tablero",
        boardName: "Nombre del Tablero",
        aiGeneration: "Crear con IA",
        templates: "Plantillas Listas",
        blankBoard: "Tablero en blanco",
        perfectCreateBoard: "✅ ¡Perfecto! Crear Tablero",

        // --- GENERAL ---
        save: "Guardar",
        cancel: "Cancelar",
        close: "Cerrar",
        loading: "Cargando...",
        search: "Buscar",
        filter: "Filtrar",
        sort: "Ordenar",
        edit: "Editar",
        delete: "Eliminar",
        add: "Agregar",
        viewAll: "Ver todos",

        // --- LOGIN ---
        welcomeBack: "Bienvenido de vuelta",
        loginSubtitle: "Ingresa a tu cuenta para continuar.",
        password: "Contraseña",
        forgotPassword: "Olvidé mi contraseña",
        signIn: "Ingresar",

        // --- AGENTS ---
        pricingEngineer: "Ingeniera de Precios",
        legalAnalyst: "Analista Legal",
        internalCS: "Éxito del Cliente Interno",

        // --- BRIDGE PAGES (formerly QR d'Água) ---
        qrPageTitle: "Generador de Bridge Pages",
        qrPageSubtitle: "Crea puentes entre el mundo físico y digital.",
        typeBridge: "Tarjeta Digital (Bridge Page)",
        qrWater: "Bridge Pages",

        // --- NOTIFICATIONS ---
        notifications: "Notificaciones",
        notificationsEmpty: "¡Todo al día!",
        notificationsEmptyDesc: "Sin nuevas notificaciones",

        // --- SETTINGS ---
        general: "General",
        data: "Datos",
        team: "Equipo",
        settings: "Configuración",

        // --- LANDING PAGE (ES) ---
        saasPitch: "Infraestructura SaaS White Label",
        mobileFirst: "Mobile First",
        aiFirst: "IA First",
        realImpact: "Impacto Real",
        heroSubtitleLanding: "Un ecosistema digital que ofrece las mejores soluciones tecnológicas para resolver problemas reales y garantizar resultados y prosperidad para todos.",
        knowHub: "Descubrir el Hub",
        ourSolutions: "Nuestras Soluciones",

        // --- AMAZO ---
        amazoTag: "Agente de IA",
        amazoTitle: "Amazô IA",
        amazoDesc: "Amazô ayuda con el diagnóstico. Atención 24/7 para CS y Ventas directo en WhatsApp.",
        talkToAmazo: "Habla con Amazô",
        chatWithAmazo: "Hablar con Amazô ahora",

        // --- FOOTER ---
        footerText: "Inspirado en la naturaleza, codificado para el mundo.",
        footerRights: "Todos los derechos reservados",

        // --- PROMPT LAB ---
        promptLabTitle: "Laboratorio de Prompts",
        promptLabSubtitle: "Transforma ideas brutas en prompts perfectos con IA",
        optimize: "✨ Optimizar",
        optimizing: "⏳ Optimizando...",
        copy: "Copiar",

        // --- TOUR ---
        skipTour: "Omitir tour",
        previous: "Anterior",
        next: "Siguiente",
        start: "Comenzar",
    },
};

