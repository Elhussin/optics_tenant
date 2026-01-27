
import json
import re

missing_aliases = [
    "accounting_categories_update",
    "accounting_chart_of_accounts_by_type_list",
    "accounting_chart_of_accounts_choices_retrieve",
    "accounting_chart_of_accounts_setup_defaults_create",
    "accounting_chart_of_accounts_tree_list",
    "accounting_chart_of_accounts_update",
    "accounting_financial_periods_current_retrieve",
    "accounting_financial_periods_update",
    "accounting_journal_entries_by_source_list",
    "accounting_journal_entries_choices_retrieve",
    "accounting_journal_entries_post_entry_create",
    "accounting_journal_entries_reverse_entry_create",
    "accounting_journal_entries_unposted_list",
    "accounting_journal_entries_update",
    "accounting_reports_balance_sheet_retrieve",
    "accounting_reports_income_statement_retrieve",
    "accounting_reports_ledger_retrieve",
    "accounting_reports_trial_balance_retrieve",
    "accounting_taxes_update",
    "branches_branch_users_update",
    "branches_branches_update",
    "branches_shifts_update",
    "core_import_csv_create",
    "crm_campaigns_update",
    "crm_claim_documents_create",
    "crm_claim_documents_destroy",
    "crm_claim_documents_filter_options_retrieve",
    "crm_claim_documents_list",
    "crm_claim_documents_partial_update",
    "crm_claim_documents_retrieve",
    "crm_claim_documents_update",
    "crm_claim_items_create",
    "crm_claim_items_destroy",
    "crm_claim_items_filter_options_retrieve",
    "crm_claim_items_list",
    "crm_claim_items_partial_update",
    "crm_claim_items_retrieve",
    "crm_claim_items_update",
    "crm_complaints_update",
    "crm_contact_us_update",
    "crm_customer_groups_update",
    "crm_customer_partner_links_by_customer_list",
    "crm_customer_partner_links_create",
    "crm_customer_partner_links_deactivate_create",
    "crm_customer_partner_links_destroy",
    "crm_customer_partner_links_filter_options_retrieve",
    "crm_customer_partner_links_list",
    "crm_customer_partner_links_partial_update",
    "crm_customer_partner_links_retrieve",
    "crm_customer_partner_links_update",
    "crm_customers_update",
    "crm_documents_update",
    "crm_insurance_claims_approve_create",
    "crm_insurance_claims_approved_unpaid_list",
    "crm_insurance_claims_choices_retrieve",
    "crm_insurance_claims_create",
    "crm_insurance_claims_destroy",
    "crm_insurance_claims_filter_options_retrieve",
    "crm_insurance_claims_list",
    "crm_insurance_claims_mark_paid_create",
    "crm_insurance_claims_partial_update",
    "crm_insurance_claims_pending_list",
    "crm_insurance_claims_reject_create",
    "crm_insurance_claims_retrieve",
    "crm_insurance_claims_submit_create",
    "crm_insurance_claims_update",
    "crm_interactions_update",
    "crm_opportunities_update",
    "crm_partner_branches_create",
    "crm_partner_branches_destroy",
    "crm_partner_branches_filter_options_retrieve",
    "crm_partner_branches_list",
    "crm_partner_branches_partial_update",
    "crm_partner_branches_retrieve",
    "crm_partner_branches_update",
    "crm_partner_price_list_items_create",
    "crm_partner_price_list_items_destroy",
    "crm_partner_price_list_items_filter_options_retrieve",
    "crm_partner_price_list_items_list",
    "crm_partner_price_list_items_partial_update",
    "crm_partner_price_list_items_retrieve",
    "crm_partner_price_list_items_update",
    "crm_partner_price_lists_create",
    "crm_partner_price_lists_destroy",
    "crm_partner_price_lists_filter_options_retrieve",
    "crm_partner_price_lists_list",
    "crm_partner_price_lists_partial_update",
    "crm_partner_price_lists_retrieve",
    "crm_partner_price_lists_update",
    "crm_partner_settlements_calculate_create",
    "crm_partner_settlements_confirm_create",
    "crm_partner_settlements_create",
    "crm_partner_settlements_destroy",
    "crm_partner_settlements_filter_options_retrieve",
    "crm_partner_settlements_list",
    "crm_partner_settlements_mark_paid_create",
    "crm_partner_settlements_partial_update",
    "crm_partner_settlements_retrieve",
    "crm_partner_settlements_update",
    "crm_partners_bnpl_providers_list",
    "crm_partners_by_type_list",
    "crm_partners_choices_retrieve",
    "crm_partners_claims_summary_retrieve",
    "crm_partners_customers_list",
    "crm_partners_insurance_companies_list",
    "crm_partners_update",
    "crm_subscriptions_update",
    "crm_tasks_update",
    "hrm_attendances_update",
    "hrm_departments_update",
    "hrm_employee_form_options_retrieve",
    "hrm_employees_update",
    "hrm_leaves_update",
    "hrm_notifications_create",
    "hrm_notifications_destroy",
    "hrm_notifications_filter_options_retrieve",
    "hrm_notifications_list",
    "hrm_notifications_partial_update",
    "hrm_notifications_retrieve",
    "hrm_notifications_update",
    "hrm_payrolls_update",
    "hrm_performance_reviews_update",
    "hrm_tasks_update",
    "mobile_customers_search_list",
    "mobile_dashboard_retrieve",
    "mobile_orders_retrieve",
    "mobile_products_search_list",
    "mobile_quick_sale_create",
    "mobile_sync_retrieve",
    "prescriptions_prescription_update",
    "products_answers_create",
    "products_answers_destroy",
    "products_answers_filter_options_retrieve",
    "products_answers_list",
    "products_answers_partial_update",
    "products_answers_retrieve",
    "products_answers_update",
    "products_attribute_values_update",
    "products_attributes_update",
    "products_branches_active_list",
    "products_branches_low_stock_list",
    "products_branches_main_retrieve",
    "products_brands_update",
    "products_categories_update",
    "products_flexible_prices_update",
    "products_manufacturers_update",
    "products_marketing_create",
    "products_marketing_destroy",
    "products_marketing_filter_options_retrieve",
    "products_marketing_list",
    "products_marketing_partial_update",
    "products_marketing_retrieve",
    "products_marketing_update",
    "products_offers_create",
    "products_offers_destroy",
    "products_offers_filter_options_retrieve",
    "products_offers_list",
    "products_offers_partial_update",
    "products_offers_retrieve",
    "products_offers_update",
    "products_orders_fulfillment_check_create",
    "products_product_images_update",
    "products_products_import_csv_create",
    "products_products_update",
    "products_questions_create",
    "products_questions_destroy",
    "products_questions_filter_options_retrieve",
    "products_questions_list",
    "products_questions_partial_update",
    "products_questions_retrieve",
    "products_questions_update",
    "products_reviews_create",
    "products_reviews_destroy",
    "products_reviews_filter_options_retrieve",
    "products_reviews_list",
    "products_reviews_partial_update",
    "products_reviews_retrieve",
    "products_reviews_update",
    "products_stock_movements_adjustment_create",
    "products_stock_movements_by_stock_list",
    "products_stock_movements_purchase_create",
    "products_stock_movements_update",
    "products_stock_transfer_items_create",
    "products_stock_transfer_items_destroy",
    "products_stock_transfer_items_filter_options_retrieve",
    "products_stock_transfer_items_list",
    "products_stock_transfer_items_partial_update",
    "products_stock_transfer_items_retrieve",
    "products_stock_transfer_items_update",
    "products_stock_transfers_approve_create",
    "products_stock_transfers_cancel_create",
    "products_stock_transfers_create",
    "products_stock_transfers_destroy",
    "products_stock_transfers_filter_options_retrieve",
    "products_stock_transfers_incoming_list",
    "products_stock_transfers_list",
    "products_stock_transfers_outgoing_list",
    "products_stock_transfers_partial_update",
    "products_stock_transfers_pending_list",
    "products_stock_transfers_receive_create",
    "products_stock_transfers_retrieve",
    "products_stock_transfers_ship_create",
    "products_stock_transfers_submit_create",
    "products_stock_transfers_update",
    "products_stocks_by_branch_list",
    "products_stocks_low_stock_list",
    "products_stocks_out_of_stock_list",
    "products_stocks_stores_only_list",
    "products_stocks_update",
    "products_suppliers_update",
    "products_variants_create",
    "products_variants_destroy",
    "products_variants_filter_options_retrieve",
    "products_variants_list",
    "products_variants_nearest_branch_retrieve",
    "products_variants_partial_update",
    "products_variants_retrieve",
    "products_variants_stock_summary_retrieve",
    "products_variants_total_stock_retrieve",
    "products_variants_update",
    "sales_installments_create",
    "sales_installments_destroy",
    "sales_installments_filter_options_retrieve",
    "sales_installments_list",
    "sales_installments_mark_paid_create",
    "sales_installments_overdue_list",
    "sales_installments_partial_update",
    "sales_installments_retrieve",
    "sales_installments_update",
    "sales_inventory_damage_create",
    "sales_invoices_by_order_list",
    "sales_invoices_calculate_totals_create",
    "sales_invoices_choices_retrieve",
    "sales_invoices_confirm_create",
    "sales_invoices_update",
    "sales_orders_calculate_totals_create",
    "sales_orders_cancel_create",
    "sales_orders_choices_retrieve",
    "sales_orders_confirm_create",
    "sales_orders_deliver_create",
    "sales_orders_ready_create",
    "sales_orders_return_create",
    "sales_orders_update",
    "sales_payment_methods_update",
    "sales_payments_bnpl_callback_create",
    "sales_payments_choices_retrieve",
    "sales_payments_create_bnpl_session_create",
    "sales_payments_mark_completed_create",
    "sales_payments_mark_failed_create",
    "sales_payments_refund_create",
    "sales_payments_summary_retrieve",
    "sales_payments_update",
    "sales_reports_branch_comparison_list",
    "sales_reports_financial_dashboard_retrieve",
    "sales_reports_inventory_summary_retrieve",
    "sales_reports_pending_orders_retrieve",
    "sales_reports_receivables_aging_retrieve",
    "sales_reports_sales_by_date_list",
    "sales_reports_sales_summary_retrieve",
    "sales_reports_stock_movements_retrieve",
    "sales_reports_top_products_list",
    "sales_wholesale_create_order_create",
    "sales_wholesale_customer_credit_create",
    "sales_wholesale_customer_statement_retrieve",
    "sales_wholesale_customers_list",
    "sales_wholesale_dashboard_retrieve",
    "sales_wholesale_pricing_create",
    "sales_wholesale_validate_create",
    "tenants_activate_retrieve",
    "tenants_clients_create",
    "tenants_clients_update",
    "tenants_create_payment_order_create",
    "tenants_domain_update",
    "tenants_paypal_cancel_retrieve",
    "tenants_paypal_execute_create",
    "tenants_paypal_webhook_create",
    "tenants_registers_create",
    "tenants_registers_destroy",
    "tenants_registers_filter_options_retrieve",
    "tenants_registers_list",
    "tenants_registers_partial_update",
    "tenants_registers_retrieve",
    "tenants_registers_update",
    "tenants_subscription_plans_partial_update",
    "users_contact_us_update",
    "users_health_retrieve",
    "users_login_create",
    "users_logout_create",
    "users_pages_update",
    "users_password_reset_confirm_create",
    "users_password_reset_create",
    "users_permissions_update",
    "users_profile_retrieve",
    "users_public_pages_list",
    "users_public_pages_retrieve",
    "users_register_create",
    "users_role_permissions_update",
    "users_roles_update",
    "users_tenant_settings_update",
    "users_token_refresh_create",
    "users_users_update",
]

# Configure entities dict
entities = {}


def get_entity_name(alias):
    parts = alias.split('_')
    actions = {'list', 'create', 'retrieve',
               'update', 'destroy', 'partial_update'}

    # Heuristic for finding entity vs action
    # If last part is an action, entity is everything before it
    if len(parts) > 3 and parts[-1] == 'retrieve' and parts[-2] == 'options' and parts[-3] == 'filter':
        return '_'.join(parts[:-3])
    elif len(parts) > 1 and parts[-1] in actions:
        entity_parts = parts[:-1]
        # Check for double actions
        if len(entity_parts) > 1 and entity_parts[-1] in {'paid', 'completed', 'failed', 'confirm', 'cancel', 'ready', 'deliver', 'return', 'approve', 'reject', 'submit', 'calculate', 'receive', 'ship'}:
            # This is complex, but let's assume the entity is the noun phrase before the action verb
            # Keep the complex name for now as a separate "entity" key to avoid collisions
            return '_'.join(entity_parts)
        return '_'.join(entity_parts)
    else:
        # Fallback
        return '_'.join(parts[:-1])


for alias in missing_aliases:
    entity = get_entity_name(alias)
    if entity not in entities:
        entities[entity] = {
            'listAlias': None,
            'createAlias': None,
            'retrieveAlias': None,
            'updateAlias': None,
            'filterAlias': None,
            'extraAliases': []
        }

    if alias.endswith('_list'):
        entities[entity]['listAlias'] = alias
    elif alias.endswith('_create') and not any(x in alias for x in ['confirm_', 'calculate_', 'approve_', 'reject_', 'mark_']):
        # Simple create check - refine if needed
        if alias == f"{entity}_create":
            entities[entity]['createAlias'] = alias
        else:
            entities[entity]['extraAliases'].append(alias)
    elif alias.endswith('_retrieve') and 'filter_options' not in alias:
        if alias == f"{entity}_retrieve":
            entities[entity]['retrieveAlias'] = alias
        else:
            entities[entity]['extraAliases'].append(alias)
    elif alias.endswith('_update') or alias.endswith('_partial_update'):
        if alias == f"{entity}_update":
            entities[entity]['updateAlias'] = alias
        else:
            # Partial updates are standard but normally just 'updateAlias' handles PUT/PATCH
            pass
    elif alias.endswith('filter_options_retrieve'):
        entities[entity]['filterAlias'] = alias
    else:
        entities[entity]['extraAliases'].append(alias)

# Generate TS Content
ts_output = """import { FormConfig } from "@/src/shared/types/formConfig";

// This configuration is auto-generated based on missing aliases.
// Please review each entry. 
// Entries with 'extraAliases' usually imply custom actions or specific views needed.

export const suggestedFormsConfig: Record<string, FormConfig> = {
"""

for entity, config in sorted(entities.items()):
    ts_output += f"  // Entity: {entity}\n"
    ts_output += f'  "{entity}": {{\n'

    if config['listAlias']:
        ts_output += f'    listAlias: "{config["listAlias"]}",\n'
    if config['createAlias']:
        ts_output += f'    createAlias: "{config["createAlias"]}",\n'
    if config['retrieveAlias']:
        ts_output += f'    retrieveAlias: "{config["retrieveAlias"]}",\n'
    if config['updateAlias']:
        ts_output += f'    updateAlias: "{config["updateAlias"]}",\n'
    if config['filterAlias']:
        ts_output += f'    filterAlias: "{config["filterAlias"]}",\n'

    ts_output += '    fields: [], // TODO: Define fields\n'
    ts_output += '    detailsField: [], // TODO: Define details fields\n'

    if not config['listAlias'] and not config['createAlias']:
        ts_output += '    isViewOnly: true, // Inferred as view only or partial config\n'

    ts_output += '  },\n'

    if config['extraAliases']:
        ts_output += f"  // NOTE: The following aliases for '{entity}' likely require custom implementation or buttons:\n"
        for extra in config['extraAliases']:
            ts_output += f"  // - {extra}\n"
    ts_output += "\n"

ts_output += "};\n"

with open('/home/hussin/code/optics_tenant/osmFront/src/features/formGenerator/constants/suggestedEntityConfig.ts', 'w') as f:
    f.write(ts_output)
