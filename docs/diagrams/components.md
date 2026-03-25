# Components Diagram

```mermaid
graph TD
UI[Frontend UI]
API[API Routes]
Auth[Auth Service]
DB[(Database)]
Stripe[Stripe Service]

    UI --> API
    API --> Auth
    API --> DB
    API --> Stripe

    Auth --> DB

```
