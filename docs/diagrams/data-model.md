# Data Model

`BIN_TYPE` values are `RECYCLING_BINS`, `RUBBISH_BAGS`, `RUBBISH_WHEELIE`, and
`GREEN_WASTE_WHEELIE`. Red and blue recycling bins are modeled as one service
item because they go out together. Prepaid rubbish bags can store a per-service
maximum quantity; the current local seed cap is three bags.
Each active property can have at most one row per bin type.

Customers now buy package-backed property services rather than selecting raw bin
types as the primary product. `ServicePackage` stores the sellable package
definition, `PropertyService` connects that package to a property, and
`PropertyServiceItem` stores the operational detail for set-out/return or
cleaning work. `Bin` remains the per-property operational inventory used by the
run board and bin API.

```mermaid
erDiagram
USERS {
id CUID
email TEXT
name TEXT
email_verified BOOLEAN
image TEXT
role USER_ROLE
}

    ACCOUNTS {
        id CUID
        account_id TEXT
        provider_id TEXT
        user_id CUID
        password TEXT
    }

    SESSIONS {
        id CUID
        token TEXT
        user_id CUID
        expires_at DATETIME
        ip_address TEXT
        user_agent TEXT
    }

    VERIFICATIONS {
        id CUID
        identifier TEXT
        value TEXT
        expires_at DATETIME
    }

    PROPERTIES {
        id CUID
        user_id CUID
        service_area_id CUID
        label TEXT
        address_line_1 TEXT
        address_line_2 TEXT
        suburb TEXT
        city TEXT
        postcode TEXT
        collection_notes TEXT
        active BOOLEAN
        deactivated_at DATETIME
    }

    BINS {
        id CUID
        property_id CUID
        type BIN_TYPE
        label TEXT
        max_quantity INT
        collection_day COLLECTION_DAY
    }

    SUBSCRIPTIONS {
        id CUID
        user_id CUID
        property_service_id CUID
        status SUBSCRIPTION_STATUS
        stripe_customer_id TEXT
        stripe_subscription_id TEXT
        current_period_end DATETIME
        canceled_at DATETIME
    }

    SERVICE_PACKAGES {
        id CUID
        code SERVICE_PACKAGE_CODE
        name TEXT
        description TEXT
        billing_mode SERVICE_BILLING_MODE
        active BOOLEAN
        sort_order INT
    }

    PROPERTY_SERVICES {
        id CUID
        property_id CUID
        package_id CUID
        status PROPERTY_SERVICE_STATUS
        service_day COLLECTION_DAY
        frequency COLLECTION_FREQUENCY
        custom_notes TEXT
    }

    PROPERTY_SERVICE_ITEMS {
        id CUID
        property_service_id CUID
        type SERVICE_ITEM_TYPE
        bin_type BIN_TYPE
        quantity INT
    }

    SERVICE_AREAS {
        id CUID
        name TEXT
        city TEXT
        active BOOLEAN
    }

    COLLECTION_SCHEDULES {
        id CUID
        service_area_id CUID
        bin_type BIN_TYPE
        collection_day COLLECTION_DAY
        frequency COLLECTION_FREQUENCY
    }

    SERVICE_VISITS {
        id CUID
        property_id CUID
        bin_id CUID
        scheduled_for DATETIME
        status SERVICE_VISIT_STATUS
        completed_at DATETIME
    }

    WEBHOOK_EVENTS {
        id CUID
        provider TEXT
        event_id TEXT
        event_type TEXT
        status WEBHOOK_EVENT_STATUS
    }

    USERS ||--o{ ACCOUNTS : has
    USERS ||--o{ SESSIONS : has
    USERS ||--o{ PROPERTIES : owns
    PROPERTIES ||--o{ BINS : has
    USERS ||--o{ SUBSCRIPTIONS : has
    SERVICE_PACKAGES ||--o{ PROPERTY_SERVICES : defines
    PROPERTIES ||--o{ PROPERTY_SERVICES : has
    PROPERTY_SERVICES ||--o{ PROPERTY_SERVICE_ITEMS : includes
    PROPERTY_SERVICES ||--o{ SUBSCRIPTIONS : bills
    SERVICE_AREAS ||--o{ PROPERTIES : covers
    SERVICE_AREAS ||--o{ COLLECTION_SCHEDULES : defines
    PROPERTIES ||--o{ SERVICE_VISITS : receives
    BINS ||--o{ SERVICE_VISITS : schedules
```
