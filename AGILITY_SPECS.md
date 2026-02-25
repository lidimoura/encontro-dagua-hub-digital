# AGILITY OS INTEGRATION SPECS

## 1. "Deal Won" Webhook (Output)
**Trigger**: `deals.status = 'CLOSED_WON'`
**Payload**:
```json
{
  "event_type": "DEAL_WON",
  "deal": {
    "id": "uuid",
    "title": "Deal Title",
    "value": 15000.00,
    "currency": "BRL",
    "closed_at": "2024-02-15T14:00:00Z"
  },
  "client": {
    "id": "uuid",
    "name": "Client Name",
    "email": "client@example.com",
    "phone": "+5511999999999",
    "document": "CPF/CNPJ"
  },
  "products": [
    {
      "id": "uuid",
      "name": "Consultoria CRM",
      "quantity": 1,
      "unit_price": 15000.00
    }
  ],
  "associated_agent": {
    "name": "Jury",
    "role": "Legal"
  }
}
```

## 2. Product Catalog Sync (Input)
**Endpoint**: `POST /rest/v1/products`
**Schema**:
```typescript
interface ProductSync {
  id?: string; // Optional (Update if present, Create if null)
  name: string;
  description?: string;
  price: number;
  category: string;
  active: boolean;
  product_type?: 'service' | 'product' | 'tech_stack';
  metadata?: Record<string, any>;
}
```

## 3. Tech Stack Query (Read)
**Logic**: Filter `products` table by `product_type = 'tech_stack'`.
**SQL**:
```sql
SELECT 
  id,
  name,
  description,
  price as monthly_cost,
  external_url,
  metadata->>'limits' as usage_limits
FROM products
WHERE 
  product_type = 'tech_stack' 
  AND active = true
  AND company_id = 'YOUR_TENANT_ID';
```

## 4. Nexus System Logs (Maintenance)
**Structure**:
```json
{
  "log_id": "uuid",
  "timestamp": "ISO8601",
  "level": "ERROR" | "WARN" | "INFO",
  "source": "AGILITY_OS",
  "error_code": "ERR_SYNC_001",
  "message": "Failed to sync deal status",
  "context": {
    "deal_id": "uuid",
    "retry_count": 3
  }
}
```

## 5. Authentication Standard
**Recommendation**: **Service Role (Backend)** & **RLS (Frontend)**
- **Agility OS Background Jobs**: Use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for administrative tasks (syncing catalogs, reading full logs).
- **Agility OS User Action**: If performing action on behalf of a user, use `JWT` Impersonation or ensure the user's token is passed to respect RLS policies (Tenant Isolation).
