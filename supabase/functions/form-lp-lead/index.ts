import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─────────────────────────────────────────────────────────
// Webhook — Form LP Lead (Cérebro Único)
// Receives leads from LP, Link d'Água or Typebot and inserts them
// into `contacts` with the declared source + briefing_json.
// ─────────────────────────────────────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const payload = await req.json();
    console.log("[form-lp-lead] Received:", JSON.stringify(payload, null, 2));

    // ── Extract fields (Typebot variable naming conventions) ──────────
    const nameRaw = payload.name || payload.Nome || payload.fullName || "";
    const whatsapp =
      payload.whatsapp || payload.phone || payload.telefone || "";
    const email = payload.email || payload.Email || null;
    let services =
      payload.services ||
      payload.servicos ||
      payload.businessType ||
      payload.intent ||
      null; // array or string
    const landedVia =
      payload.landedVia ||
      payload.origem_url ||
      payload.referralSource ||
      "webhook";
    let message = payload.message || payload.mensagem || payload.notes || null;

    // Se a LP mandou message via 'notes' original ou custom, engole tudo.
    if (payload.businessType) {
      message = [message, `Interesse: ${payload.businessType}`]
        .filter(Boolean)
        .join(" | ");
    }
    if (payload.referralSource) {
      message = [message, `Origem Relatada: ${payload.referralSource}`]
        .filter(Boolean)
        .join(" | ");
    }

    // The source can be 'Amazô SDR', 'Link d\'Água', or 'LP do Hub'. Fallback to Webhook.
    let source = payload.source || payload.origem || "LP do Hub";
    if (
      source.toLowerCase() === "new" ||
      source.toLowerCase() === "lead" ||
      source.toLowerCase() === "website"
    ) {
      source = "LP do Hub";
    }
    if (
      payload.landedVia?.toLowerCase().includes("linkdagua") ||
      payload.landedVia?.toLowerCase().includes("link d'água")
    ) {
      source = "Link d'Água";
    }

    // ── QA BYPASS LOGIC ──────────────────────────────────────────
    const isTestPhone =
      whatsapp === "+55000000000" ||
      whatsapp === "55000000000" ||
      whatsapp === "00000000000";
    const isTestEmail = email?.toLowerCase().includes("test");
    const isQaBypass = isTestPhone || isTestEmail;
    const name =
      isQaBypass && !nameRaw.includes("[QA TEST]")
        ? `[QA TEST] ${nameRaw}`
        : nameRaw;

    // Validate required
    if (!name || !whatsapp) {
      return new Response(
        JSON.stringify({
          error: "Campos obrigatórios ausentes: name e whatsapp",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Normalize services into array
    const servicesArray: string[] = Array.isArray(services)
      ? services
      : typeof services === "string" && services.trim()
        ? services.split(",").map((s: string) => s.trim())
        : businessType
          ? [businessType]
          : [];

    // ── briefing_json: structured payload for CRM display ─────────────
    const briefingJson = {
      name,
      whatsapp,
      services: servicesArray,
      source: source,
      landed_via: landedVia,
      message: message || undefined,
      capture_time: new Date().toISOString(),
    };

    // ── 1. Insert into contacts with dynamic source ──────────────
    let resolvedContactId: string | null = null;
    const { data: contactData, error: contactError } = await supabaseClient
      .from("contacts")
      .insert([
        {
          name,
          phone: whatsapp,
          email: email || `${whatsapp.replace(/\D/g, "")}@sdr.webhook`,
          status: "ACTIVE",
          stage: "LEAD",
          source: source, // ← critical for AnalyticsSourceCard
          briefing_json: briefingJson, // ← critical for CRM sidebar display
          notes: `Lead via ${source}\nWhatsApp: ${whatsapp}\nServiços: ${servicesArray.join(", ") || "n/i"}\nMensagem: ${message || "n/a"}`,
          company_id: null,
        },
      ])
      .select("id, name")
      .single();

    if (contactError) {
      // Handle duplicate — fetch the existing contact and use its ID for the Deal
      if (contactError.code === "23505") {
        console.warn(
          "[form-lp-lead] Duplicate contact, fetching existing ID...",
        );
        const fakeEmail = `${whatsapp.replace(/\D/g, "")}@sdr.webhook`;
        const searchEmail = email || fakeEmail;

        const { data: existing } = await supabaseClient
          .from("contacts")
          .select("id, name")
          .or(`phone.eq.${whatsapp},email.eq.${searchEmail}`)
          .limit(1)
          .maybeSingle();

        if (existing) {
          resolvedContactId = existing.id;

          // TRANSPLANTE VITAL: Atualiza o contato existente para não perder o novo briefing e origem
          // Manteńha sempre o stage como LEAD ao invés de pular pro NEW pra não bugar o kanban.
          await supabaseClient
            .from("contacts")
            .update({
              briefing_json: briefingJson,
              source: source,
              stage: "LEAD"
            })
            .eq("id", existing.id);

          console.log(
            "[form-lp-lead] Resolved and updated existing contact:",
            existing.id,
          );
        } else {
          console.warn(
            "[form-lp-lead] Duplicate detected but could not find row by phone or email. Falling back to null contact.",
          );
        }
      } else {
        console.error("[form-lp-lead] Contact error:", contactError);
        throw contactError;
      }
    } else {
      resolvedContactId = contactData?.id;
      console.log("[form-lp-lead] Contact created:", contactData);
    }

    // ── 2. Create a Deal in the SDR board ────────────────────────────

    // Lookup the SDR board (or first board as fallback)
    const { data: sdrBoard } = await supabaseClient
      .from("boards")
      .select("id")
      .ilike("name", "%SDR%")
      .limit(1)
      .maybeSingle();

    const { data: fallbackBoard } = !sdrBoard
      ? await supabaseClient.from("boards").select("id").limit(1).maybeSingle()
      : { data: null };

    const targetBoardId = sdrBoard?.id ?? fallbackBoard?.id ?? null;
    let targetStageId = null;

    if (targetBoardId) {
      const { data: firstStage } = await supabaseClient
        .from("board_stages")
        .select("id")
        .eq("board_id", targetBoardId)
        .order("order", { ascending: true })
        .limit(1)
        .maybeSingle();

      targetStageId = firstStage?.id ?? null;

      if (!targetStageId) {
        console.warn(
          "[form-lp-lead] Board found but has NO stages. Skipping deal creation to avoid UUID syntax error 500.",
        );
        targetBoardId = null; // Prevent deal creation with invalid stage_id
      }
    }

    if (targetBoardId && resolvedContactId) {
      const { error: dealError } = await supabaseClient.from("deals").insert([
        {
          title: `Lead: ${name} (${source})`,
          status: targetStageId,
          stage_id: targetStageId,
          value: 0,
          board_id: targetBoardId,
          contact_id: resolvedContactId,
          source: source,
          briefing_json: briefingJson,
          notes: `Lead automático capturado via ${source}\nWhatsApp: ${whatsapp}\nServiços: ${servicesArray.join(", ") || "n/i"}`,
          probability: 20,
          priority: "medium",
        },
      ]);

      if (dealError) {
        console.warn(
          "[form-lp-lead] Deal creation warning:",
          dealError.message,
        );
      } else {
        console.log(
          "[form-lp-lead] ✅ Deal created in board:",
          targetBoardId,
          "for contact:",
          resolvedContactId,
        );
      }
    } else {
      console.warn(
        "[form-lp-lead] Skipping deal creation — board:",
        targetBoardId,
        "contact:",
        resolvedContactId,
      );
    }

    // ── 2. Also add to waitlist for backward compat ──────────────────
    await supabaseClient
      .from("waitlist")
      .insert([
        {
          name,
          whatsapp,
          email,
          referred_by: source,
          status: "PENDING",
          metadata: { ...briefingJson, rawPayload: payload },
        },
      ])
      .select()
      .then(({ error }) => {
        if (error)
          console.warn(
            "[form-lp-lead] Waitlist insert warning:",
            error.message,
          );
      });

    // ── 3. Fire push notification for Lidi ──────────────────────────
    // Non-blocking: push is best-effort
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        title: "🤖 Novo Lead Recebido!",
        notifBody: `${name} entrou por ${source}`,
        url: "/boards",
        lead_id: contactData?.id,
      }),
    }).catch((e) =>
      console.warn("[form-lp-lead] Push notification failed:", e.message),
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Lead capturado com briefing_json",
        contactId: contactData?.id,
        source: source,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[form-lp-lead] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
