# Users & Authentication 🛡️

Authentication is centrally managed to provide secure access to authorized tenants only.

## 🔐 Authentication Flow (JWT)

We use **SimpleJWT** for handling stateless authentication.

1.  **Login**: User sends `email` and `password`.
2.  **Validation**: System checks credentials against the global `User` table.
3.  **Token Issuance**: Returns `Access Token` (short-lived) and `Refresh Token` (long-lived).
4.  **Access**: Client sends `Authorization: Bearer <token>` in headers.

## 🎭 Roles & Permissions (RBAC)

The system moves beyond simple Django Group permissions to a more robust Role-Based Access Control keying off specific functional needs.

### Roles
Defined in `core.constants`:
-   `OWNER`: Full access to the tenant.
-   `MANAGER`: Can manage branches and staff.
-   `SALES`: Access to POS and Orders only.
-   `ACCOUNTANT`: Access to Financial Reports and Journal Entries.

### Granular Permissions
We use a custom `RoleOrPermissionRequired` decorator.
Example:
```python
@permission_classes([
    RoleOrPermissionRequired.with_requirements(
        required_permissions=["view_dashboard", "manage_staff"]
    )
])
```
This allows a user to access a view if:
-   Their Role implicitly grants access (e.g., Owner).
-   OR they have the specific explicit permission assigned.

## 👥 Staff Management
-   **SalesProfile**: Links a User to specific sales metrics (Top Performer stats).
-   **Branch Assignment**: Users can be restricted to specific branches, limiting the data they can see (e.g., multiple cashiers).
