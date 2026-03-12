CREATE OR REPLACE FUNCTION get_crm_catalog_products()
RETURNS SETOF products
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM products
  WHERE is_active = true
    AND (type IS NULL OR type NOT IN ('tech_stack', 'infra', 'api_cost', 'infrastructure'))
    AND (category IS NULL OR category NOT IN ('tech_stack', 'infra', 'api', 'infrastructure', 'technology'))
    AND LOWER(name) NOT LIKE '%openai%'
    AND LOWER(name) NOT LIKE '%gemini%'
    AND LOWER(name) NOT LIKE '%anthropic%'
    AND LOWER(name) NOT LIKE '%claude%'
    AND LOWER(name) NOT LIKE '%vercel%'
    AND LOWER(name) NOT LIKE '%supabase%'
    AND LOWER(name) NOT LIKE '%aws %'
    AND LOWER(name) NOT LIKE '%gcp %'
    AND LOWER(name) NOT LIKE '%azure%'
    AND LOWER(name) NOT LIKE '%deno%'
    AND LOWER(name) NOT LIKE '%cloudflare%'
    AND LOWER(name) NOT LIKE '%digital ocean%'
    AND LOWER(name) NOT LIKE '%n8n%'
  ORDER BY name ASC;
END;
$$;
