export type Language = 'pt' | 'en';

export const translations = {
    pt: {
        // --- NAVEGAÇÃO GLOBAL ---
        navHome: "Início",
        navCRM: "Gestão (CRM)",
        navBoards: "Quadros",
        navContacts: "Contatos",
        navActivities: "Atividades",
        navReports: "Relatórios",
        navQR: "QRd'água",
        navPrompts: "PromptLab",
        navAdmin: "Admin",
        logout: "Sair",
        profile: "Perfil",

        // --- SIDEBAR & NAVIGATION ---
        inbox: "Inbox",
        dashboard: "Painel",
        boards: "Boards",
        contacts: "Contatos",
        activities: "Atividades",
        qrWater: "QR d'água",
        promptLab: "Prompt Lab",
        reports: "Relatórios",
        aiHub: "Hub IA",
        decisions: "Decisões",
        settings: "Configurações",
        admin: "Admin",
        techStack: "Tech Stack",
        editProfile: "Editar Perfil",
        signOut: "Sair da conta",
        openMenu: "Abrir menu",

        // --- DECISIONS PAGE ---
        decisionsTitle: "Central de Decisões",
        decisionsSubtitle: "Decisões proativas para você tomar ação rapidamente",
        analyzeNow: "Analisar Agora",
        analyzingCRM: "Analisando...",
        lastAnalysis: "Última análise",
        neverAnalyzed: "Nunca analisado",
        noDecisionsPending: "Nenhuma decisão pendente",
        clickAnalyzePrompt: "Clique em 'Analisar Agora' para que a IA analise seu CRM e sugira ações baseadas em deals parados, atividades atrasadas e oportunidades.",
        analyzeMyCRM: "Analisar Meu CRM",
        approveAll: "Aprovar todas as sugeridas",
        clearAll: "Limpar tudo",

        // --- AI HUB PAGE ---
        aiAssistant: "Assistente IA",
        aiWelcomeTitle: "Olá! Sou seu assistente de CRM",
        aiWelcomeMessage: "Posso ajudar você a gerenciar deals, atividades, contatos e muito mais. Experimente perguntar algo!",
        aiPlaceholder: "Pergunte algo sobre seu CRM...",
        aiPoweredBy: "Powered by Gemini 2.5 Flash • Respostas podem conter imprecisões",
        clearConversation: "Limpar conversa",

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
        searchPlaceholder: "Buscar...",
        filterByStatus: "Filtrar por status",
        dropHere: "✓ Solte aqui!",
        dealStale: "Negócio Estagnado (>10 dias sem atualização)",
        totalValue: "Total",

        // --- DEAL CARD ---
        priority: "Prioridade",
        high: "Alta",
        medium: "Média",
        low: "Baixa",

        // --- MAZO AGENT (HEALTH SCORE) ---
        healthAnalysis: "Análise de Saúde do Cliente",
        analyzeHealth: "Analisar Saúde do Cliente",
        customerHealth: "Saúde do Cliente",
        churnRisk: "Risco Crítico de Churn",
        healthy: "Cliente Saudável",
        atRisk: "Cliente em Risco",
        critical: "Risco Crítico de Churn",
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

        // --- MÓDULO QR D'ÁGUA ---
        qrTitle: "Gerador de Identidade Digital",
        qrDesc: "Crie cartões digitais e QR Codes dinâmicos.",
        createQR: "Criar Novo QR",
        downloadQR: "Baixar QR Code",

        // --- MÓDULO PROMPTLAB ---
        promptTitle: "Laboratório de Prompts",
        promptDesc: "Crie, teste e armazene seus comandos de IA.",
        newPrompt: "Novo Prompt",
        runPrompt: "Executar",

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

        // --- AÇÕES GERAIS ---
        save: "Salvar",
        cancel: "Cancelar",
        delete: "Excluir",
        edit: "Editar",
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

        // --- LANDING PAGE ---
        solutions: "Soluções",
        gallery: "Galeria",
        enter: "Entrar",
        becomeClient: "Quero ser cliente",
        home: "Home",
        manifesto: "Manifesto",
        team: "Equipe",
        ourSolutions: "Nossas Soluções",
        heroTitleLanding: "Tecnologia mais acessível.",
        heroSubtitleLanding: "Um ecossistema digital que oferece as melhores soluções tecnológicas para resolver problemas reais e garantir resultados e prosperidade para todos.",
        knowHub: "Conheça o Hub",
        promptLabTitle: "Prompt Lab",
        qrWaterTitle: "Seu Canal Digital",
        clientGallery: "Galeria de Clientes do Hub",
        clientGalleryDesc: "Veja como empreendedores estão usando o QR D'água para conectar com seus clientes",
        technologyForAll: "Tecnologia para Todos",
        noOneLeftBehind: "🤝 Ninguém fica para trás",
        socialImpact: "Condições especiais para impacto social.",
        footer: "Inspirado na natureza, codificado para o mundo.",

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
        noRecentActivities: "Nenhuma atividade recente",
        noActivitiesRecorded: "Nenhuma atividade registrada",
        noProductsAdded: "Nenhum produto adicionado. O valor do negócio é manual.",
        noLinksAdded: "Nenhum link adicionado. Clique em \"Adicionar Link\" para começar.",
        noTagsCreated: "Nenhuma tag criada",
        noCustomFieldsCreated: "Nenhum campo personalizado criado",
        noUsersFound: "Nenhum usuário encontrado",
        noProductsAdminFirst: "Nenhum produto cadastrado. Cadastre produtos no Painel Admin primeiro.",
        noToolsInTechStack: "Nenhuma ferramenta cadastrada no Tech Stack.",
        noContractTemplates: "Nenhum template de contrato encontrado na biblioteca.",
        noDealsFound: "Nenhum negócio encontrado",
        noRisksDetected: "Nenhum novo risco detectado. Carteira saudável!",
        noAssetsFound: "Nenhum ativo encontrado",
    },
    en: {
        // --- GLOBAL NAV ---
        navHome: "Home",
        navCRM: "CRM Dashboard",
        navBoards: "Boards",
        navContacts: "Contacts",
        navActivities: "Activities",
        navReports: "Reports",
        navQR: "QR Generator",
        navPrompts: "PromptLab",
        navAdmin: "Admin",
        logout: "Logout",
        profile: "Profile",

        // --- SIDEBAR & NAVIGATION ---
        inbox: "Inbox",
        dashboard: "Dashboard",
        boards: "Boards",
        contacts: "Contacts",
        activities: "Activities",
        qrWater: "QR d'água",
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
        teamMember: "Member",
        note: "Note",
        teamMembersNote: "This is the core team of Encontro D'água Hub. New members can be added via the admin panel.",

        // --- LANDING PAGE ---
        heroTitle: "Connecting Ideas, People, and Technology",
        heroSubtitle: "The digital ecosystem uniting innovation and social impact.",
        ctaButton: "Get Started",
        loginButton: "Login",
        featuresTitle: "Our Solutions",
        aboutUs: "About Us",
        contactUs: "Contact Us",

        // --- CRM CORE ---
        addDeal: "Add Deal",
        newDeal: "New Deal",
        allDeals: "All Deals",
        myDeals: "My Deals",
        searchPlaceholder: "Search...",
        filterByStatus: "Filter by status",
        dropHere: "✓ Drop here!",
        dealStale: "Stale Deal (>10 days without update)",
        totalValue: "Total",

        // --- DEAL CARD ---
        priority: "Priority",
        high: "High",
        medium: "Medium",
        low: "Low",

        // --- MAZO AGENT (CHURN) ---
        healthAnalysis: "Client Health Analysis",
        analyzeHealth: "Analyze Client Health",
        customerHealth: "Customer Health",
        churnRisk: "Critical Churn Risk",
        healthy: "Healthy Client",
        atRisk: "Client at Risk",
        critical: "Critical Churn Risk",
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

        // --- QR MODULE ---
        qrTitle: "Digital Identity Generator",
        qrDesc: "Create digital cards and dynamic QR Codes.",
        createQR: "Create New QR",
        downloadQR: "Download QR",

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
        save: "Save",
        cancel: "Cancel",
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

        // --- LANDING PAGE ---
        solutions: "Solutions",
        gallery: "Gallery",
        enter: "Enter",
        becomeClient: "Become a Client",
        home: "Home",
        manifesto: "Manifesto",
        team: "Team",
        ourSolutions: "Our Solutions",
        heroTitleLanding: "More accessible technology.",
        heroSubtitleLanding: "A digital ecosystem that offers the best technological solutions to solve real problems and ensure results and prosperity for all.",
        knowHub: "Discover the Hub",
        promptLabTitle: "Prompt Lab",
        qrWaterTitle: "Your Digital Channel",
        clientGallery: "Hub Client Gallery",
        clientGalleryDesc: "See how entrepreneurs are using QR d'água to connect with their clients",
        technologyForAll: "Technology for Everyone",
        noOneLeftBehind: "🤝 No one left behind",
        socialImpact: "Special conditions for social impact.",
        footer: "Inspired by nature, coded for the world.",

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
        noRecentActivities: "No recent activities",
        noActivitiesRecorded: "No activities recorded",
        noProductsAdded: "No products added. Deal value is manual.",
        noLinksAdded: "No links added. Click \"Add Link\" to start.",
        noTagsCreated: "No tags created",
        noCustomFieldsCreated: "No custom fields created",
        noUsersFound: "No users found",
        noProductsAdminFirst: "No products registered. Register products in Admin Panel first.",
        noToolsInTechStack: "No tools registered in Tech Stack.",
        noContractTemplates: "No contract templates found in library.",
        noDealsFound: "No deals found",
        noRisksDetected: "No new risks detected. Healthy portfolio!",
        noAssetsFound: "No assets found",
    }
};
