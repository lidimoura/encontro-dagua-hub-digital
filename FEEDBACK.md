# FEEDBACK.md — Provadágua MVP

> Registro contínuo de feedback, bugs reportados e melhorias priorizadas.
> Atualizado em tempo real durante as sessões de demonstração e uso.

---

## Como registrar feedback

- **Usuária Lidi (super_admin):** edite este arquivo diretamente ou reporte no WhatsApp para acompanhamento técnico.
- **Lead/Cliente (Amanda, etc.):** utilize o botão **"Enviar Feedback"** dentro do CRM (barra superior).
- **Formato:** adicione uma linha na seção correspondente com `[DATA] Descrição do problema ou sugestão`.

---

## 🔴 Bugs Críticos (Bloqueadores)

| Data | Descrição | Status |
|---|---|---|
| 2026-04-22 | 403 Forbidden em boards/contacts/deals INSERT | ✅ Resolvido (V9.6) |
| 2026-04-22 | 400 Bad Request em companies (company_id inválido) | ✅ Resolvido (V9.7.3) |
| 2026-04-23 | Tech Stack e Catálogo vazando dados do Hub para lead | ✅ Resolvido (V9.7.3 + V9.8) |
| 2026-04-23 | board_stages INSERT falhando (coluna company_id inexistente) | ✅ Resolvido (V9.8 SQL 043) |
| 2026-04-23 | Alerta rls_disabled_in_public do Supabase | ✅ Resolvido (V9.8 SQL 043) |

---

## 🟡 Melhorias de UX (Backlog Prioritário)

| Data | Descrição | Prioridade |
|---|---|---|
| 2026-04-23 | Banner de MVP informando natureza do produto | ✅ Implementado (V9.8) |
| 2026-04-23 | Modal de Feedback dentro do CRM | ✅ Implementado (V9.8) |
| — | Botão de convite de equipe (WhatsApp/e-mail) | 🔵 Coming Soon |
| — | Ajustes residuais de i18n (traduções hardcoded) | 🔵 Backlog pós-validação |
| — | Isolamento completo de DB: adicionar company_id em products e companies | 🔵 Backlog pós-validação |

---

## 🟢 Melhorias Sugeridas (Roadmap)

| Data | Descrição | Origem |
|---|---|---|
| — | Notificação por e-mail quando lead avança no funil | Lidi |
| — | Exportação de contatos para CSV | — |
| — | Dashboard de métricas do funil (taxa de conversão por stage) | — |
| — | Integração com WhatsApp Business API | — |

---

## Histórico de Versões (Resumo)

| Versão | Data | Destaque |
|---|---|---|
| V9.8 | 2026-04-23 | RLS estrito, Tech Stack isolado, Banner MVP, Modal Feedback |
| V9.7.3 | 2026-04-22 | Fix companies 400, TechStack early return guard |
| V9.7.2 | 2026-04-22 | RLS auth_only para products/companies (banco compartilhado) |
| V9.6 | 2026-04-20 | Fix 403 boards/contacts, migration RLS CRM tables |
| V9.5 | — | Code Freeze MVP Go-Live |

---

_Este arquivo é parte do repositório e serve como fonte de verdade para QA e roadmap._
