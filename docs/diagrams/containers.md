# Containers Diagram

```mermaid
graph TD
User -->|HTTPS| App[Next.js App NodeJS24 Container]

    App --> DB[(MySQL Database)]
    App --> StripeAPI[Stripe API]

    App --> Logs[SiteHost Logging]

    subgraph SiteHost
        App
        DB
    end
```
