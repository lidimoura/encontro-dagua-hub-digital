import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log("Fetching orphan Link d'Água contacts...");

  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('*')
    .gte('created_at', '2026-03-13T00:00:00Z');

  if (contactsError) {
    console.error("Error fetching contacts:", contactsError);
    return;
  }

  console.log(`Found ${contacts.length} contacts since March 13th.`);

  // Get Deals to check for orphans
  const { data: deals, error: dealsError } = await supabase
    .from('deals')
    .select('contact_id');

  if (dealsError) {
    console.error("Error fetching deals:", dealsError);
    return;
  }

  const dealContactIds = new Set(deals.map(d => d.contact_id).filter(Boolean));
  const orphanContacts = contacts.filter(c => !dealContactIds.has(c.id));

  console.log(`Found ${orphanContacts.length} ORPHAN contacts.`);

  if (orphanContacts.length === 0) {
    console.log("No orphans found. Exiting.");
    return;
  }

  // Find target Board (SDR)
  const { data: sdrBoard } = await supabase
    .from("boards")
    .select("id")
    .ilike("name", "%SDR%")
    .limit(1)
    .single();

  if (!sdrBoard) {
    console.error("Could not find SDR board.");
    return;
  }

  // Find target Stage (Lead)
  const { data: leadStage } = await supabase
    .from("board_stages")
    .select("id")
    .eq("board_id", sdrBoard.id)
    .or("label.ilike.*Lead*,label.ilike.*Novo*,name.ilike.*Lead*,name.ilike.*Novo*")
    .limit(1)
    .maybeSingle();

  const { data: firstStage } = await supabase
    .from("board_stages")
    .select("id")
    .eq("board_id", sdrBoard.id)
    .order("order", { ascending: true })
    .limit(1)
    .maybeSingle();

  const targetStageId = leadStage?.id || firstStage?.id;

  if (!targetStageId) {
    console.error("Could not find target stage ID.");
    return;
  }

  console.log(`Using Board ${sdrBoard.id} and Stage ${targetStageId}`);

  let createdCount = 0;
  for (const contact of orphanContacts) {
    // Generate briefing_json from contact.notes if missing
    let briefingJson = contact.briefing_json;
    if (!briefingJson) {
      briefingJson = {
         name: contact.name,
         whatsapp: contact.phone,
         source: contact.source,
      };
    }

    const { error: insertError } = await supabase.from('deals').insert([{
      title: `Lead: ${contact.name} (${contact.source})`,
      status: targetStageId,
      stage_id: targetStageId,
      value: 0,
      board_id: sdrBoard.id,
      contact_id: contact.id,
      probability: 20,
      priority: 'medium'
    }]);

    if (insertError) {
      console.error(`Error migrating contact ${contact.id}:`, insertError.message);
    } else {
      console.log(`✅ Migrated contact ${contact.name} (${contact.id})`);
      createdCount++;
    }
  }

  console.log(`Migration Complete. Created ${createdCount} new deals.`);
}

migrate().catch(console.error);
