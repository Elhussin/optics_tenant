import { FormConfig } from "@/src/shared/types/formConfig";


export const actionListConfig: Record<string, FormConfig> = {
  "core_import_csv": {
    createAlias: "core_import_csv_create",
  },
    "hrm_employee_form_options": {
    retrieveAlias: "hrm_employee_form_options_retrieve",
  },
  "crm_customer_partner_links_by_customer": {
    createAlias: "crm_customer_partner_links_by_customer_list",
  },

  "crm_customer_partner_links_deactivate": {
    createAlias: "crm_customer_partner_links_deactivate_create",
  },
  "crm_insurance_claims_approve": {
    createAlias: "crm_insurance_claims_approve_create",
  },
  "crm_insurance_claims_approved_unpaid": {
    createAlias: "crm_insurance_claims_approved_unpaid_list",
  },
  "crm_insurance_claims_choices": {
    createAlias: "crm_insurance_claims_choices_retrieve",
  },
  "crm_insurance_claims_mark_paid": {
    createAlias: "crm_insurance_claims_mark_paid_create"
  },
  "crm_insurance_claims_pending": {
    createAlias: "crm_insurance_claims_pending_list",
  },

  "crm_insurance_claims_reject": {
    createAlias:"crm_insurance_claims_reject_create"
  },
  "crm_insurance_claims_submit": {
    createAlias: "crm_insurance_claims_submit_create",
  },
  "crm_partner_settlements_calculate": {
    createAlias: "crm_partner_settlements_calculate_create",
  },

  "crm_partner_settlements_confirm": {
    createAlias: "crm_partner_settlements_confirm_create",
  },

  "crm_partner_settlements_mark_paid": {
    createAlias: "crm_partner_settlements_mark_paid_create",
  },
 
  "crm_partners_bnpl_providers": {
    listAlias: "crm_partners_bnpl_providers_list",

  },

  "crm_partners_by_type": {
    createAlias: "crm_partners_by_type_list",
  },
  "crm_partners_choices": {
    createAlias: "crm_partners_choices_retrieve",
  },
  "crm_partners_claims_summary": {
    createAlias: "crm_partners_claims_summary_retrieve",
  },

  "crm_partners_customers": {
    createAlias: "crm_partners_customers_list",
  },

  "crm_partners_insurance_companies": {
    createAlias: "crm_partners_insurance_companies_list",
  },

  // acounct actions
// ---------------------------------------------------
  "accounting_chart_of_accounts": {
    createAlias: "accounting_chart_of_accounts_update",
  },
  "accounting_chart_of_accounts_by_type": {
    createAlias: "accounting_chart_of_accounts_by_type_list",
  },
  "accounting_chart_of_accounts_choices": {
    createAlias: "accounting_chart_of_accounts_choices_retrieve",
  },
  "accounting_chart_of_accounts_setup_defaults": {
    createAlias: "accounting_chart_of_accounts_setup_defaults_create",
  },
  "accounting_chart_of_accounts_tree": {
    createAlias: "accounting_chart_of_accounts_tree_list",
  },
  "accounting_financial_periods_current": {
    createAlias: "accounting_financial_periods_current_retrieve",
  },
  "accounting_journal_entries": {
    createAlias: "accounting_journal_entries_update",
  },
  "accounting_journal_entries_by_source": {
    createAlias: "accounting_journal_entries_by_source_list",
  },
  "accounting_journal_entries_choices": {
    createAlias: "accounting_journal_entries_choices_retrieve",

  },
  "accounting_journal_entries_post_entry": {
    createAlias: "accounting_journal_entries_post_entry_create",
  },
  "accounting_journal_entries_reverse_entry": {
    createAlias: "accounting_journal_entries_reverse_entry_create",
  },
  "accounting_journal_entries_unposted": {
    createAlias: "accounting_journal_entries_unposted_list",
  },

  "accounting_reports_balance_sheet": {
    createAlias: "accounting_reports_balance_sheet_retrieve",
  },

  "accounting_reports_income_statement": {
    createAlias: "accounting_reports_income_statement_retrieve",
  },
  "accounting_reports_ledger": {
    createAlias: "accounting_reports_ledger_retrieve"
  },
  "accounting_reports_trial_balance": {
    createAlias: "accounting_reports_trial_balance_retrieve",
  },
  // ---------------------------------------------------
    "mobile_customers_search": {
    listAlias: "mobile_customers_search_list",
  },

  "mobile_dashboard": {
    retrieveAlias: "mobile_dashboard_retrieve",
  },

  "mobile_orders": {
    retrieveAlias: "mobile_orders_retrieve",
  },

  "mobile_products_search": {
    listAlias: "mobile_products_search_list",
  },

  "mobile_quick_sale": {
    createAlias: "mobile_quick_sale_create",
  },


  "mobile_sync": {
    retrieveAlias: "mobile_sync_retrieve",
  },

// ---------------------------------------------------
  "products_branches_active": {
    listAlias: "products_branches_active_list",
  },
  "products_branches_low_stock": {
    listAlias: "products_branches_low_stock_list",
  },
  "products_branches_main": {
    retrieveAlias: "products_branches_main_retrieve",
  },
  "products_orders_fulfillment_check": {
    createAlias: "products_orders_fulfillment_check_create",
  },
  "products_products_import_csv": {
    createAlias: "products_products_import_csv_create",
  },
    "products_stock_movements_adjustment": {
    createAlias: "products_stock_movements_adjustment_create",
  },
  "products_stock_movements_by_stock": {
    listAlias: "products_stock_movements_by_stock_list",
  },
  "products_stock_movements_purchase": {
    createAlias: "products_stock_movements_purchase_create",
  },
  "products_stock_transfers_approve": {
    createAlias: "products_stock_transfers_approve_create",
  },

  "products_stock_transfers_cancel": {
    createAlias: "products_stock_transfers_cancel_create",
  },

  "products_stock_transfers_incoming": {
    listAlias: "products_stock_transfers_incoming_list",
  },
  "products_stock_transfers_outgoing": {
    listAlias: "products_stock_transfers_outgoing_list",
  },
  "products_stock_transfers_pending": {
    listAlias: "products_stock_transfers_pending_list",
  },
  "products_stock_transfers_receive": {
    createAlias: "products_stock_transfers_receive_create",
    },

  "products_stock_transfers_ship": {
    createAlias: "products_stock_transfers_ship_create",
    },

  "products_stock_transfers_submit": {
    createAlias: "products_stock_transfers_submit_create",
  },

  "products_stocks_by_branch": {
    createAlias: "products_stocks_by_branch_list",
  },
  "products_stocks_low_stock": {
    createAlias: "products_stocks_low_stock_list",
  },
  "products_stocks_out_of_stock": {
    createAlias: "products_stocks_out_of_stock_list",
  },
  "products_stocks_stores_only": {
    createAlias: "products_stocks_stores_only_list",
  },
  "products_variants_nearest_branch": {
    retrieveAlias: "products_variants_nearest_branch_retrieve",
  },
  "products_variants_stock_summary": {
    retrieveAlias: "products_variants_stock_summary_retrieve",
  },
  "products_variants_total_stock": {
    retrieveAlias: "products_variants_total_stock_retrieve",
  },
  // ---------------------------------------------------
      "tenants_create_payment_order": {
    createAlias: "tenants_create_payment_order_create",
     },
  "tenants_paypal_cancel": {
    retrieveAlias: "tenants_paypal_cancel_retrieve",
  },

  "tenants_paypal_execute": {
    createAlias: "tenants_paypal_execute_create"
  },
  "tenants_paypal_webhook": {
    createAlias: "tenants_paypal_webhook_create",
  },
  // ---------------------------------------------------
  // sales actions


  "sales_installments_mark_paid": {
    "createAlias" :"sales_installments_mark_paid_create"
  },
  "sales_installments_overdue": {
    createAlias: "sales_installments_overdue_list",
  },
  "sales_inventory_damage": {
    createAlias: "sales_inventory_damage_create",
  },
  "sales_invoices_by_order": {
    listAlias: "sales_invoices_by_order_list",
  },
  "sales_invoices_calculate_totals": {
    createAlias: "sales_invoices_calculate_totals_create",
  },
  "sales_invoices_choices": {
    retrieveAlias: "sales_invoices_choices_retrieve",
  },
  "sales_invoices_confirm": {
    createAlias: "sales_invoices_confirm_create",
  },
  "sales_orders_calculate_totals": {
    createAlias: "sales_orders_calculate_totals_create",
  },

  "sales_orders_cancel": {
    createAlias: "sales_orders_cancel_create",
  },
  "sales_orders_choices": {
    retrieveAlias: "sales_orders_choices_retrieve",
  },
  "sales_orders_confirm": {
    createAlias: "sales_orders_confirm_create",
  },
  "sales_orders_deliver": {
    createAlias: "sales_orders_deliver_create",
  },

  "sales_orders_ready": {
    createAlias: "sales_orders_ready_create",
  },
  "sales_orders_return": {
    createAlias: "sales_orders_return_create",
  },
  "sales_payment_methods": {
    updateAlias: "sales_payment_methods_update",
  },

  "sales_payments": {
    updateAlias: "sales_payments_update",
  },
  "sales_payments_bnpl_callback": {
    createAlias: "sales_payments_bnpl_callback_create",
  },
  "sales_payments_choices": {
    retrieveAlias: "sales_payments_choices_retrieve",
  },
  "sales_payments_create_bnpl_session": {
    createAlias: "sales_payments_create_bnpl_session_create",
  },
  "sales_payments_mark_completed": {
    createAlias: "sales_payments_mark_completed_create",
  },
  "sales_payments_mark_failed": {
   createAlias :"sales_payments_mark_failed_create"
  },
  "sales_payments_refund": {
    createAlias: "sales_payments_refund_create",
  },
  "sales_payments_summary": {
    retrieveAlias: "sales_payments_summary_retrieve",
  },
  "sales_reports_branch_comparison": {
    listAlias: "sales_reports_branch_comparison_list",
  },
  "sales_reports_financial_dashboard": {
    retrieveAlias: "sales_reports_financial_dashboard_retrieve",
  },
  "sales_reports_inventory_summary": {
    retrieveAlias: "sales_reports_inventory_summary_retrieve",
  },
  "sales_reports_pending_orders": {
    retrieveAlias: "sales_reports_pending_orders_retrieve",
  },
  "sales_reports_receivables_aging": {
    retrieveAlias: "sales_reports_receivables_aging_retrieve",
  },
  "sales_reports_sales_by_date": {
    listAlias: "sales_reports_sales_by_date_list",
  },
  "sales_reports_sales_summary": {
    retrieveAlias: "sales_reports_sales_summary_retrieve",
  },
  "sales_reports_stock_movements": {
    retrieveAlias: "sales_reports_stock_movements_retrieve",
  },
  "sales_reports_top_products": {
    listAlias: "sales_reports_top_products_list",
  },
  "sales_wholesale_create_order": {
    createAlias: "sales_wholesale_create_order_create",
  },
  "sales_wholesale_customer_credit": {
    createAlias: "sales_wholesale_customer_credit_create",
  },
  "sales_wholesale_customer_statement": {
    retrieveAlias: "sales_wholesale_customer_statement_retrieve",
  },
  "sales_wholesale_customers": {
    listAlias: "sales_wholesale_customers_list",
  },
  "sales_wholesale_dashboard": {
    retrieveAlias: "sales_wholesale_dashboard_retrieve",
  },
  "sales_wholesale_pricing": {
    createAlias: "sales_wholesale_pricing_create",
  },
  "sales_wholesale_validate": {
    createAlias: "sales_wholesale_validate_create",
  }

}