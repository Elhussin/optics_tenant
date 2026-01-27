# CRM (Customer Relationship Management) 🤝

Manage patient profiles, prescriptions, and insurance details.

## 👥 Customer Profile
Stores comprehensive data:
-   **Personal Info**: Name, Phone, Email, National ID.
-   **Medical History**: Integrated with the Prescriptions module.
-   **Financials**: Credit limit, Balance, Payment History.

## 🏆 Pricing Tiers (Gold/Silver/Bronze)
Customers can be assigned deeper discounts based on their tier.
-   **Logic**: When creating an order, the system checks the customer's tier and applies the global tier discount to eligible products.

## 🏥 Insurance Integration
The module handles insurance coverage for medical glasses.
-   **Insurance Company**: The provider entity.
-   **Policy**: Details of coverage (e.g., "Class A - 100% cover up to 500 SAR").
-   **Approval Workflow**: Some orders require manual approval from the insurance provider before processing.

## 📄 Prescriptions
Linked directly to customers and orders.
-   **Data Points**: Sphere (SPH), Cylinder (CYL), Axis, Addition (ADD), Pupillary Distance (PD).
-   **Validation**: Ensures values are within optical standards range.
