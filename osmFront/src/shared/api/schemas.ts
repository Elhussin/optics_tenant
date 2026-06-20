import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const AccountTypeEnum = z.enum([
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
  "cogs",
]);
const AccountSubtypeEnum = z.enum([
  "cash",
  "bank",
  "receivable",
  "inventory",
  "prepaid",
  "fixed_asset",
  "payable",
  "accrued",
  "tax_payable",
  "deferred",
  "loan",
  "capital",
  "retained",
  "reserves",
  "sales",
  "service",
  "other_income",
  "salary",
  "rent",
  "utilities",
  "supplies",
  "marketing",
  "other_expense",
  "cost_of_goods",
]);
const BlankEnum = z.unknown();
const NormalBalanceEnum = z.enum(["debit", "credit"]);
const ChartOfAccounts = z
  .object({
    id: z.number().int(),
    code: z.string().max(10),
    name: z.string().max(200),
    name_en: z.string().max(200).optional(),
    account_type: AccountTypeEnum,
    account_type_display: z.string(),
    account_subtype: z.union([AccountSubtypeEnum, BlankEnum]).optional(),
    parent: z.number().int().nullish(),
    parent_name: z.string(),
    description: z.string().optional(),
    opening_balance: z
      .string()
      .regex(/^-?\d{0,12}(?:\.\d{0,2})?$/)
      .optional(),
    current_balance: z.string().regex(/^-?\d{0,12}(?:\.\d{0,2})?$/),
    is_header: z.boolean().optional(),
    normal_balance: NormalBalanceEnum.optional(),
    normal_balance_display: z.string(),
    full_path: z.string(),
    is_active: z.boolean().optional(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PaginatedChartOfAccountsList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(ChartOfAccounts),
  })
  .passthrough();
const ChartOfAccountsRequest = z
  .object({
    code: z.string().min(1).max(10),
    name: z.string().min(1).max(200),
    name_en: z.string().max(200).optional(),
    account_type: AccountTypeEnum,
    account_subtype: z.union([AccountSubtypeEnum, BlankEnum]).optional(),
    parent: z.number().int().nullish(),
    description: z.string().optional(),
    opening_balance: z
      .string()
      .regex(/^-?\d{0,12}(?:\.\d{0,2})?$/)
      .optional(),
    is_header: z.boolean().optional(),
    normal_balance: NormalBalanceEnum.optional(),
    is_active: z.boolean().optional(),
  })
  .passthrough();
const PatchedChartOfAccountsRequest = z
  .object({
    code: z.string().min(1).max(10),
    name: z.string().min(1).max(200),
    name_en: z.string().max(200),
    account_type: AccountTypeEnum,
    account_subtype: z.union([AccountSubtypeEnum, BlankEnum]),
    parent: z.number().int().nullable(),
    description: z.string(),
    opening_balance: z.string().regex(/^-?\d{0,12}(?:\.\d{0,2})?$/),
    is_header: z.boolean(),
    normal_balance: NormalBalanceEnum,
    is_active: z.boolean(),
  })
  .partial()
  .passthrough();
const ChartOfAccountsChoices = z
  .object({
    account_types: z.object({}).partial().passthrough(),
    account_subtypes: z.object({}).partial().passthrough(),
  })
  .passthrough();
const SetupDefaultsResponse = z
  .object({ status: z.string(), message: z.string() })
  .passthrough();
const ChartOfAccountsTree = z
  .object({
    id: z.number().int(),
    code: z.string().max(10),
    name: z.string().max(200),
    account_type: AccountTypeEnum,
    current_balance: z
      .string()
      .regex(/^-?\d{0,12}(?:\.\d{0,2})?$/)
      .optional(),
    is_header: z.boolean().optional(),
    children: z.string(),
  })
  .passthrough();
const PaginatedChartOfAccountsTreeList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(ChartOfAccountsTree),
  })
  .passthrough();
const SourceTypeEnum = z.enum([
  "manual",
  "sales_invoice",
  "purchase_invoice",
  "payment",
  "receipt",
  "return",
  "adjustment",
  "payroll",
]);
const GeneralJournalList = z
  .object({
    id: z.number().int(),
    entry_number: z.string(),
    entry_date: z.string(),
    source_type: SourceTypeEnum.optional(),
    description: z.string(),
    total_debit: z
      .string()
      .regex(/^-?\d{0,12}(?:\.\d{0,2})?$/)
      .optional(),
    is_posted: z.boolean().optional(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PaginatedGeneralJournalListList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(GeneralJournalList),
  })
  .passthrough();
const EntryTypeEnum = z.enum([
  "standard",
  "adjustment",
  "closing",
  "opening",
  "reversal",
]);
const JournalLineRequest = z
  .object({
    account: z.number().int(),
    debit: z
      .string()
      .regex(/^-?\d{0,12}(?:\.\d{0,2})?$/)
      .optional(),
    credit: z
      .string()
      .regex(/^-?\d{0,12}(?:\.\d{0,2})?$/)
      .optional(),
    description: z.string().max(500).optional(),
    cost_center: z.string().max(50).optional(),
  })
  .passthrough();
const GeneralJournalCreateRequest = z
  .object({
    entry_date: z.string(),
    entry_type: EntryTypeEnum.optional(),
    source_type: SourceTypeEnum.optional(),
    source_document: z.string().max(100).optional(),
    description: z.string().min(1),
    notes: z.string().optional(),
    lines: z.array(JournalLineRequest),
  })
  .passthrough();
const JournalLine = z
  .object({
    id: z.number().int(),
    account: z.number().int(),
    account_code: z.string(),
    account_name: z.string(),
    debit: z
      .string()
      .regex(/^-?\d{0,12}(?:\.\d{0,2})?$/)
      .optional(),
    credit: z
      .string()
      .regex(/^-?\d{0,12}(?:\.\d{0,2})?$/)
      .optional(),
    description: z.string().max(500).optional(),
    cost_center: z.string().max(50).optional(),
  })
  .passthrough();
const GeneralJournalCreate = z
  .object({
    entry_date: z.string(),
    entry_type: EntryTypeEnum.optional(),
    source_type: SourceTypeEnum.optional(),
    source_document: z.string().max(100).optional(),
    description: z.string(),
    notes: z.string().optional(),
    lines: z.array(JournalLine),
  })
  .passthrough();
const GeneralJournal = z
  .object({
    id: z.number().int(),
    entry_number: z.string(),
    entry_date: z.string(),
    entry_type: EntryTypeEnum.optional(),
    entry_type_display: z.string(),
    source_type: SourceTypeEnum.optional(),
    source_type_display: z.string(),
    source_document: z.string().max(100).optional(),
    source_id: z.number().int().gte(0).lte(2147483647).nullish(),
    description: z.string(),
    total_debit: z.string().regex(/^-?\d{0,12}(?:\.\d{0,2})?$/),
    total_credit: z.string().regex(/^-?\d{0,12}(?:\.\d{0,2})?$/),
    is_posted: z.boolean(),
    posted_at: z.string().datetime({ offset: true }).nullable(),
    posted_by: z.number().int().nullish(),
    posted_by_name: z.string(),
    notes: z.string().optional(),
    lines: z.array(JournalLine),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const GeneralJournalRequest = z
  .object({
    entry_date: z.string(),
    entry_type: EntryTypeEnum.optional(),
    source_type: SourceTypeEnum.optional(),
    source_document: z.string().max(100).optional(),
    source_id: z.number().int().gte(0).lte(2147483647).nullish(),
    description: z.string().min(1),
    posted_by: z.number().int().nullish(),
    notes: z.string().optional(),
  })
  .passthrough();
const PatchedGeneralJournalRequest = z
  .object({
    entry_date: z.string(),
    entry_type: EntryTypeEnum,
    source_type: SourceTypeEnum,
    source_document: z.string().max(100),
    source_id: z.number().int().gte(0).lte(2147483647).nullable(),
    description: z.string().min(1),
    posted_by: z.number().int().nullable(),
    notes: z.string(),
  })
  .partial()
  .passthrough();
const PostEntryResponse = z
  .object({ status: z.string(), message: z.string() })
  .passthrough();
const ReverseEntryResponse = z
  .object({
    status: z.string(),
    message: z.string(),
    reversal_id: z.number().int(),
  })
  .passthrough();
const GeneralJournalChoices = z
  .object({
    entry_types: z.object({}).partial().passthrough(),
    source_types: z.object({}).partial().passthrough(),
  })
  .passthrough();
const BSItemAssets = z
  .object({
    code: z.string(),
    name: z.string(),
    balance: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const BalanceSheetSectionAssets = z
  .object({
    total: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    items: z.array(BSItemAssets),
  })
  .passthrough();
const BSItemLiabilities = z
  .object({
    code: z.string(),
    name: z.string(),
    balance: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const BalanceSheetSectionLiabilities = z
  .object({
    total: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    items: z.array(BSItemLiabilities),
  })
  .passthrough();
const BSItemEquity = z
  .object({
    code: z.string(),
    name: z.string(),
    balance: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const BalanceSheetSectionEquity = z
  .object({
    total: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    items: z.array(BSItemEquity),
  })
  .passthrough();
const BalanceSheetResponse = z
  .object({
    as_of_date: z.string(),
    assets: BalanceSheetSectionAssets,
    liabilities: BalanceSheetSectionLiabilities,
    equity: BalanceSheetSectionEquity,
    total_liabilities_and_equity: z
      .string()
      .regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    is_balanced: z.boolean(),
  })
  .passthrough();
const IncomeStatementPeriod = z
  .object({ start_date: z.string().nullable(), end_date: z.string() })
  .passthrough();
const IncomeItem = z
  .object({
    code: z.string(),
    name: z.string(),
    amount: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const IncomeStatementSection = z
  .object({
    total: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    items: z.array(IncomeItem),
  })
  .passthrough();
const IncomeItemCOGS = z
  .object({
    code: z.string(),
    name: z.string(),
    amount: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const IncomeStatementSectionCOGS = z
  .object({
    total: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    items: z.array(IncomeItemCOGS),
  })
  .passthrough();
const IncomeItemExpenses = z
  .object({
    code: z.string(),
    name: z.string(),
    amount: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const IncomeStatementSectionExpenses = z
  .object({
    total: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    items: z.array(IncomeItemExpenses),
  })
  .passthrough();
const IncomeStatementResponse = z
  .object({
    period: IncomeStatementPeriod,
    revenue: IncomeStatementSection,
    cogs: IncomeStatementSectionCOGS,
    gross_profit: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    expenses: IncomeStatementSectionExpenses,
    net_income: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const LedgerAccountInfo = z
  .object({ code: z.string(), name: z.string() })
  .passthrough();
const LedgerEntry = z
  .object({
    date: z.string(),
    entry_number: z.string(),
    description: z.string(),
    debit: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    credit: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    balance: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const AccountLedgerResponse = z
  .object({
    account: LedgerAccountInfo,
    opening_balance: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    entries: z.array(LedgerEntry),
    closing_balance: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const TrialBalanceAccount = z
  .object({
    account_code: z.string(),
    account_name: z.string(),
    account_type: z.string(),
    debit: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    credit: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const TrialBalanceTotals = z
  .object({
    debit: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    credit: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    is_balanced: z.boolean(),
  })
  .passthrough();
const TrialBalanceResponse = z
  .object({
    as_of_date: z.string(),
    accounts: z.array(TrialBalanceAccount),
    totals: TrialBalanceTotals,
  })
  .passthrough();
const BranchUsers = z
  .object({
    id: z.number().int(),
    branch__name: z.string(),
    employee__name: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean(),
    notes: z.string().nullish(),
    branch: z.number().int(),
    employee: z.number().int(),
  })
  .passthrough();
const PaginatedBranchUsersList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(BranchUsers),
  })
  .passthrough();
const BranchUsersRequest = z
  .object({
    notes: z.string().nullish(),
    branch: z.number().int(),
    employee: z.number().int(),
  })
  .passthrough();
const PatchedBranchUsersRequest = z
  .object({
    notes: z.string().nullable(),
    branch: z.number().int(),
    employee: z.number().int(),
  })
  .partial()
  .passthrough();
const BranchTypeEnum = z.enum(["store", "branch"]);
const Branch = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    name: z.string().max(100),
    branch_code: z.string(),
    branch_type: BranchTypeEnum,
    country: z.string().max(100).optional(),
    city: z.string().max(100).optional(),
    building_number: z.string().max(20).optional(),
    street_name: z.string().max(200).optional(),
    district: z.string().max(100).optional(),
    postal_code: z.string().max(20).optional(),
    additional_number: z.string().max(20).optional(),
    address: z.string().optional(),
    cr_number: z.string().max(50).optional(),
    tax_number: z.string().max(50).optional(),
    receipt_header: z.string().optional(),
    receipt_footer: z.string().optional(),
    phone: z.string().max(20).optional(),
    email: z.string().max(254).email().optional(),
    is_main_branch: z.boolean().optional(),
    allows_online_orders: z.boolean().optional(),
    operating_hours: z.unknown().optional(),
  })
  .passthrough();
const PaginatedBranchList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Branch),
  })
  .passthrough();
const BranchRequest = z
  .object({
    is_active: z.boolean().optional(),
    name: z.string().min(1).max(100),
    branch_type: BranchTypeEnum,
    country: z.string().min(1).max(100).optional(),
    city: z.string().max(100).optional(),
    building_number: z.string().max(20).optional(),
    street_name: z.string().max(200).optional(),
    district: z.string().max(100).optional(),
    postal_code: z.string().max(20).optional(),
    additional_number: z.string().max(20).optional(),
    address: z.string().optional(),
    cr_number: z.string().max(50).optional(),
    tax_number: z.string().max(50).optional(),
    receipt_header: z.string().optional(),
    receipt_footer: z.string().optional(),
    phone: z.string().max(20).optional(),
    email: z.string().max(254).email().optional(),
    is_main_branch: z.boolean().optional(),
    allows_online_orders: z.boolean().optional(),
    operating_hours: z.unknown().optional(),
  })
  .passthrough();
const PatchedBranchRequest = z
  .object({
    is_active: z.boolean(),
    name: z.string().min(1).max(100),
    branch_type: BranchTypeEnum,
    country: z.string().min(1).max(100),
    city: z.string().max(100),
    building_number: z.string().max(20),
    street_name: z.string().max(200),
    district: z.string().max(100),
    postal_code: z.string().max(20),
    additional_number: z.string().max(20),
    address: z.string(),
    cr_number: z.string().max(50),
    tax_number: z.string().max(50),
    receipt_header: z.string(),
    receipt_footer: z.string(),
    phone: z.string().max(20),
    email: z.string().max(254).email(),
    is_main_branch: z.boolean(),
    allows_online_orders: z.boolean(),
    operating_hours: z.unknown(),
  })
  .partial()
  .passthrough();
const Shift = z
  .object({
    id: z.number().int(),
    branch__name: z.string(),
    employee__user__username: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    start_time: z.string().datetime({ offset: true }),
    end_time: z.string().datetime({ offset: true }),
    notes: z.string().nullish(),
    branch: z.number().int(),
    employee: z.number().int(),
  })
  .passthrough();
const PaginatedShiftList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Shift),
  })
  .passthrough();
const ShiftRequest = z
  .object({
    is_active: z.boolean().optional(),
    start_time: z.string().datetime({ offset: true }),
    end_time: z.string().datetime({ offset: true }),
    notes: z.string().nullish(),
    branch: z.number().int(),
    employee: z.number().int(),
  })
  .passthrough();
const PatchedShiftRequest = z
  .object({
    is_active: z.boolean(),
    start_time: z.string().datetime({ offset: true }),
    end_time: z.string().datetime({ offset: true }),
    notes: z.string().nullable(),
    branch: z.number().int(),
    employee: z.number().int(),
  })
  .partial()
  .passthrough();
const ContactUs = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    email: z.string().max(254).email(),
    phone: z.string().max(20),
    name: z.string().max(100),
    message: z.string().max(500),
  })
  .passthrough();
const PaginatedContactUsList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(ContactUs),
  })
  .passthrough();
const ContactUsRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    email: z.string().min(1).max(254).email(),
    phone: z.string().min(1).max(20),
    name: z.string().min(1).max(100),
    message: z.string().min(1).max(500),
  })
  .passthrough();
const PatchedContactUsRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    email: z.string().min(1).max(254).email(),
    phone: z.string().min(1).max(20),
    name: z.string().min(1).max(100),
    message: z.string().min(1).max(500),
  })
  .partial()
  .passthrough();
const DefaultLanguageEnum = z.enum(["en", "ar"]);
const LanguageEnum = z.enum(["en", "ar"]);
const PageContent = z
  .object({
    language: LanguageEnum,
    title: z.string().max(200),
    content: z.string().optional(),
    seo_title: z.string().max(200).optional(),
    meta_description: z.string().max(500).optional(),
    meta_keywords: z.string().optional(),
  })
  .passthrough();
const Page = z
  .object({
    id: z.number().int(),
    default_language: DefaultLanguageEnum.optional(),
    is_published: z.boolean().optional(),
    slug: z
      .string()
      .max(200)
      .regex(/^[-a-zA-Z0-9_]+$/),
    is_deleted: z.boolean().optional(),
    is_active: z.boolean().optional(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    translations: z.array(PageContent),
  })
  .passthrough();
const PaginatedPageList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Page),
  })
  .passthrough();
const PageContentRequest = z
  .object({
    language: LanguageEnum,
    title: z.string().min(1).max(200),
    content: z.string().optional(),
    seo_title: z.string().max(200).optional(),
    meta_description: z.string().max(500).optional(),
    meta_keywords: z.string().optional(),
  })
  .passthrough();
const PageRequest = z
  .object({
    default_language: DefaultLanguageEnum.optional(),
    is_published: z.boolean().optional(),
    slug: z
      .string()
      .min(1)
      .max(200)
      .regex(/^[-a-zA-Z0-9_]+$/),
    is_deleted: z.boolean().optional(),
    is_active: z.boolean().optional(),
    translations: z.array(PageContentRequest),
  })
  .passthrough();
const PatchedPageRequest = z
  .object({
    default_language: DefaultLanguageEnum,
    is_published: z.boolean(),
    slug: z
      .string()
      .min(1)
      .max(200)
      .regex(/^[-a-zA-Z0-9_]+$/),
    is_deleted: z.boolean(),
    is_active: z.boolean(),
    translations: z.array(PageContentRequest),
  })
  .partial()
  .passthrough();
const CSVImportRequest = z
  .object({ csv_file: z.instanceof(File), config: z.unknown() })
  .passthrough();
const CSVImportResponse = z
  .object({
    created: z.number().int(),
    skipped: z.number().int(),
    failed: z.number().int(),
    errors: z.array(z.string()),
  })
  .passthrough();
const CSVImportError = z.object({ detail: z.string() }).passthrough();
const CSVImportForbidden = z.object({ detail: z.string() }).passthrough();
const Campaign = z
  .object({
    id: z.number().int(),
    customer__first_name: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    name: z.string().max(255),
    description: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    customers: z.array(z.number().int()).optional(),
  })
  .passthrough();
const PaginatedCampaignList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Campaign),
  })
  .passthrough();
const CampaignRequest = z
  .object({
    is_active: z.boolean().optional(),
    name: z.string().min(1).max(255),
    description: z.string().min(1),
    start_date: z.string(),
    end_date: z.string(),
    customers: z.array(z.number().int()).optional(),
  })
  .passthrough();
const PatchedCampaignRequest = z
  .object({
    is_active: z.boolean(),
    name: z.string().min(1).max(255),
    description: z.string().min(1),
    start_date: z.string(),
    end_date: z.string(),
    customers: z.array(z.number().int()),
  })
  .partial()
  .passthrough();
const DocumentTypeEnum = z.enum([
  "prescription",
  "invoice",
  "report",
  "authorization",
  "other",
]);
const ClaimDocument = z
  .object({
    id: z.number().int(),
    claim: z.number().int(),
    document_type: DocumentTypeEnum,
    document_type_display: z.string(),
    title: z.string().max(200),
    file: z.string().url(),
    notes: z.string().optional(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PaginatedClaimDocumentList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(ClaimDocument),
  })
  .passthrough();
const ClaimDocumentRequest = z
  .object({
    claim: z.number().int(),
    document_type: DocumentTypeEnum,
    title: z.string().min(1).max(200),
    file: z.instanceof(File),
    notes: z.string().optional(),
  })
  .passthrough();
const PatchedClaimDocumentRequest = z
  .object({
    claim: z.number().int(),
    document_type: DocumentTypeEnum,
    title: z.string().min(1).max(200),
    file: z.instanceof(File),
    notes: z.string(),
  })
  .partial()
  .passthrough();
const ClaimItem = z
  .object({
    id: z.number().int(),
    claim: z.number().int(),
    order_item: z.number().int().nullish(),
    description: z.string().max(200),
    quantity: z.number().int().gte(0).lte(2147483647).optional(),
    unit_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    total_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    claim_amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    approved_amount: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    insurance_code: z.string().max(50).optional(),
  })
  .passthrough();
const PaginatedClaimItemList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(ClaimItem),
  })
  .passthrough();
const ClaimItemRequest = z
  .object({
    claim: z.number().int(),
    order_item: z.number().int().nullish(),
    description: z.string().min(1).max(200),
    quantity: z.number().int().gte(0).lte(2147483647).optional(),
    unit_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    claim_amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    approved_amount: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    insurance_code: z.string().max(50).optional(),
  })
  .passthrough();
const PatchedClaimItemRequest = z
  .object({
    claim: z.number().int(),
    order_item: z.number().int().nullable(),
    description: z.string().min(1).max(200),
    quantity: z.number().int().gte(0).lte(2147483647),
    unit_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    claim_amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    approved_amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    insurance_code: z.string().max(50),
  })
  .partial()
  .passthrough();
const ComplaintStatusEnum = z.enum(["open", "resolved"]);
const Complaint = z
  .object({
    id: z.number().int(),
    customer__first_name: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    description: z.string(),
    status: ComplaintStatusEnum.optional(),
    customer: z.number().int(),
  })
  .passthrough();
const PaginatedComplaintList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Complaint),
  })
  .passthrough();
const ComplaintRequest = z
  .object({
    is_active: z.boolean().optional(),
    description: z.string().min(1),
    status: ComplaintStatusEnum.optional(),
    customer: z.number().int(),
  })
  .passthrough();
const PatchedComplaintRequest = z
  .object({
    is_active: z.boolean(),
    description: z.string().min(1),
    status: ComplaintStatusEnum,
    customer: z.number().int(),
  })
  .partial()
  .passthrough();
const Contact = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    email: z.string().max(254).email(),
    phone: z.string().max(20),
    name: z.string().max(100),
    message: z.string().max(500),
  })
  .passthrough();
const PaginatedContactList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Contact),
  })
  .passthrough();
const ContactRequest = z
  .object({
    is_active: z.boolean().optional(),
    email: z.string().min(1).max(254).email(),
    phone: z.string().min(1).max(20),
    name: z.string().min(1).max(100),
    message: z.string().min(1).max(500),
  })
  .passthrough();
const PatchedContactRequest = z
  .object({
    is_active: z.boolean(),
    email: z.string().min(1).max(254).email(),
    phone: z.string().min(1).max(20),
    name: z.string().min(1).max(100),
    message: z.string().min(1).max(500),
  })
  .partial()
  .passthrough();
const CustomerGroup = z
  .object({
    id: z.number().int(),
    customer__first_name: z.array(z.string()),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    name: z.string().max(100),
    description: z.string().optional(),
    customers: z.array(z.number().int()),
  })
  .passthrough();
const PaginatedCustomerGroupList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(CustomerGroup),
  })
  .passthrough();
const CustomerGroupRequest = z
  .object({
    is_active: z.boolean().optional(),
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    customers: z.array(z.number().int()),
  })
  .passthrough();
const PatchedCustomerGroupRequest = z
  .object({
    is_active: z.boolean(),
    name: z.string().min(1).max(100),
    description: z.string(),
    customers: z.array(z.number().int()),
  })
  .partial()
  .passthrough();
const CustomerPartnerLink = z
  .object({
    id: z.number().int(),
    customer: z.number().int(),
    customer_name: z.string(),
    partner: z.number().int(),
    partner_name: z.string(),
    partner_type: z.string(),
    membership_number: z.string().max(50).optional(),
    policy_number: z.string().max(50).optional(),
    coverage_start: z.string().nullish(),
    coverage_end: z.string().nullish(),
    annual_limit: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .nullish(),
    remaining_limit: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .nullish(),
    patient_share_percentage: z
      .string()
      .regex(/^-?\d{0,3}(?:\.\d{0,2})?$/)
      .nullish(),
    max_patient_share: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullish(),
    insurance_class: z.string().max(50).optional(),
    is_active: z.boolean().optional(),
    is_coverage_active: z.boolean(),
    notes: z.string().optional(),
  })
  .passthrough();
const PaginatedCustomerPartnerLinkList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(CustomerPartnerLink),
  })
  .passthrough();
const CustomerPartnerLinkRequest = z
  .object({
    customer: z.number().int(),
    partner: z.number().int(),
    membership_number: z.string().max(50).optional(),
    policy_number: z.string().max(50).optional(),
    coverage_start: z.string().nullish(),
    coverage_end: z.string().nullish(),
    annual_limit: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .nullish(),
    remaining_limit: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .nullish(),
    patient_share_percentage: z
      .string()
      .regex(/^-?\d{0,3}(?:\.\d{0,2})?$/)
      .nullish(),
    max_patient_share: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullish(),
    insurance_class: z.string().max(50).optional(),
    is_active: z.boolean().optional(),
    notes: z.string().optional(),
  })
  .passthrough();
const PatchedCustomerPartnerLinkRequest = z
  .object({
    customer: z.number().int(),
    partner: z.number().int(),
    membership_number: z.string().max(50),
    policy_number: z.string().max(50),
    coverage_start: z.string().nullable(),
    coverage_end: z.string().nullable(),
    annual_limit: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .nullable(),
    remaining_limit: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .nullable(),
    patient_share_percentage: z
      .string()
      .regex(/^-?\d{0,3}(?:\.\d{0,2})?$/)
      .nullable(),
    max_patient_share: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullable(),
    insurance_class: z.string().max(50),
    is_active: z.boolean(),
    notes: z.string(),
  })
  .partial()
  .passthrough();
const CustomerTypeEnum = z.enum(["individual", "company"]);
const PreferredContactEnum = z.enum(["email", "phone", "sms"]);
const Customer = z
  .object({
    id: z.number().int(),
    phone: z.string().regex(/^\+?\d{7,15}$/),
    identification_number: z.string().min(10).max(20),
    first_name: z.string().max(30),
    last_name: z.string().max(30),
    email: z.string().email().optional(),
    customer_type: CustomerTypeEnum.optional(),
    is_vip: z.boolean().nullish(),
    accepts_marketing: z.boolean().optional(),
    registration_number: z.string().max(50).nullish(),
    tax_number: z.string().max(50).nullish(),
    preferred_contact: PreferredContactEnum.optional(),
    website: z.string().max(200).url().nullish(),
    description: z.string().nullish(),
    address_line1: z.string().max(200).optional(),
    address_line2: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    postal_code: z.string().max(20).optional(),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
  })
  .passthrough();
const PaginatedCustomerList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Customer),
  })
  .passthrough();
const CustomerRequest = z
  .object({
    phone: z
      .string()
      .min(1)
      .regex(/^\+?\d{7,15}$/),
    identification_number: z.string().min(10).max(20),
    first_name: z.string().min(1).max(30),
    last_name: z.string().min(1).max(30),
    email: z.string().min(1).email().optional(),
    customer_type: CustomerTypeEnum.optional(),
    is_vip: z.boolean().nullish(),
    accepts_marketing: z.boolean().optional(),
    registration_number: z.string().max(50).nullish(),
    tax_number: z.string().max(50).nullish(),
    preferred_contact: PreferredContactEnum.optional(),
    website: z.string().max(200).url().nullish(),
    description: z.string().nullish(),
    address_line1: z.string().max(200).optional(),
    address_line2: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    postal_code: z.string().max(20).optional(),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
  })
  .passthrough();
const PatchedCustomerRequest = z
  .object({
    phone: z
      .string()
      .min(1)
      .regex(/^\+?\d{7,15}$/),
    identification_number: z.string().min(10).max(20),
    first_name: z.string().min(1).max(30),
    last_name: z.string().min(1).max(30),
    email: z.string().min(1).email(),
    customer_type: CustomerTypeEnum,
    is_vip: z.boolean().nullable(),
    accepts_marketing: z.boolean(),
    registration_number: z.string().max(50).nullable(),
    tax_number: z.string().max(50).nullable(),
    preferred_contact: PreferredContactEnum,
    website: z.string().max(200).url().nullable(),
    description: z.string().nullable(),
    address_line1: z.string().max(200),
    address_line2: z.string().max(200),
    city: z.string().max(100),
    postal_code: z.string().max(20),
    is_active: z.boolean(),
    is_deleted: z.boolean(),
  })
  .partial()
  .passthrough();
const Document = z
  .object({
    id: z.number().int(),
    customer__first_name: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    title: z.string().max(255),
    file: z.string().url(),
    customer: z.number().int().nullish(),
  })
  .passthrough();
const PaginatedDocumentList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Document),
  })
  .passthrough();
const DocumentRequest = z
  .object({
    is_active: z.boolean().optional(),
    title: z.string().min(1).max(255),
    file: z.instanceof(File),
    customer: z.number().int().nullish(),
  })
  .passthrough();
const PatchedDocumentRequest = z
  .object({
    is_active: z.boolean(),
    title: z.string().min(1).max(255),
    file: z.instanceof(File),
    customer: z.number().int().nullable(),
  })
  .partial()
  .passthrough();
const StatusC92Enum = z.enum([
  "draft",
  "submitted",
  "under_review",
  "approved",
  "partial",
  "rejected",
  "paid",
  "cancelled",
]);
const InsuranceClaimList = z
  .object({
    id: z.number().int(),
    claim_number: z.string(),
    order_number: z.string(),
    partner_name: z.string(),
    claim_date: z.string(),
    total_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    claim_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    approved_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    status: StatusC92Enum.optional(),
    status_display: z.string(),
  })
  .passthrough();
const PaginatedInsuranceClaimListList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(InsuranceClaimList),
  })
  .passthrough();
const InsuranceClaimCreateRequest = z
  .object({
    order: z.number().int(),
    partner: z.number().int(),
    customer_partner_link: z.number().int().nullish(),
    total_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    notes: z.string().optional(),
  })
  .passthrough();
const InsuranceClaimCreate = z
  .object({
    order: z.number().int(),
    partner: z.number().int(),
    customer_partner_link: z.number().int().nullish(),
    total_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    notes: z.string().optional(),
  })
  .passthrough();
const InsuranceClaim = z
  .object({
    id: z.number().int(),
    claim_number: z.string(),
    external_claim_number: z.string().max(100).optional(),
    order: z.number().int(),
    order_number: z.string(),
    partner: z.number().int(),
    partner_name: z.string(),
    customer_partner_link: z.number().int().nullish(),
    customer_name: z.string(),
    claim_date: z.string(),
    submission_date: z.string().nullable(),
    response_date: z.string().nullable(),
    payment_date: z.string().nullable(),
    total_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    claim_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    approved_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    paid_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    patient_share: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    status: StatusC92Enum.optional(),
    status_display: z.string(),
    rejection_reason: z.string().optional(),
    partial_reason: z.string().optional(),
    notes: z.string().optional(),
    internal_notes: z.string().optional(),
    items: z.array(ClaimItem),
    attached_documents: z.array(ClaimDocument),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const InsuranceClaimRequest = z
  .object({
    external_claim_number: z.string().max(100).optional(),
    order: z.number().int(),
    partner: z.number().int(),
    customer_partner_link: z.number().int().nullish(),
    total_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    claim_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    patient_share: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    status: StatusC92Enum.optional(),
    rejection_reason: z.string().optional(),
    partial_reason: z.string().optional(),
    notes: z.string().optional(),
    internal_notes: z.string().optional(),
  })
  .passthrough();
const PatchedInsuranceClaimRequest = z
  .object({
    external_claim_number: z.string().max(100),
    order: z.number().int(),
    partner: z.number().int(),
    customer_partner_link: z.number().int().nullable(),
    total_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    claim_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    patient_share: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    status: StatusC92Enum,
    rejection_reason: z.string(),
    partial_reason: z.string(),
    notes: z.string(),
    internal_notes: z.string(),
  })
  .partial()
  .passthrough();
const ApproveClaimRequestRequest = z
  .object({
    approved_amount: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    notes: z.string().min(1).optional(),
  })
  .passthrough();
const ApproveClaimResponse = z
  .object({
    status: z.string(),
    message: z.string(),
    approved_amount: z.string(),
  })
  .passthrough();
const MarkClaimPaidRequestRequest = z
  .object({
    amount: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    payment_reference: z.string().min(1).optional(),
  })
  .passthrough();
const MarkClaimPaidResponse = z
  .object({ status: z.string(), message: z.string(), paid_amount: z.string() })
  .passthrough();
const RejectClaimRequestRequest = z
  .object({ reason: z.string().min(1) })
  .passthrough();
const RejectClaimResponse = z
  .object({ status: z.string(), message: z.string() })
  .passthrough();
const SubmitClaimResponse = z
  .object({ status: z.string(), message: z.string(), claim_number: z.string() })
  .passthrough();
const ClaimChoices = z
  .object({ claim_status: z.object({}).partial().passthrough() })
  .passthrough();
const InteractionTypeEnum = z.enum(["call", "email", "meeting"]);
const Interaction = z
  .object({
    id: z.number().int(),
    customer__first_name: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    interaction_type: InteractionTypeEnum,
    notes: z.string().nullish(),
    customer: z.number().int(),
  })
  .passthrough();
const PaginatedInteractionList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Interaction),
  })
  .passthrough();
const InteractionRequest = z
  .object({
    is_active: z.boolean().optional(),
    interaction_type: InteractionTypeEnum,
    notes: z.string().nullish(),
    customer: z.number().int(),
  })
  .passthrough();
const PatchedInteractionRequest = z
  .object({
    is_active: z.boolean(),
    interaction_type: InteractionTypeEnum,
    notes: z.string().nullable(),
    customer: z.number().int(),
  })
  .partial()
  .passthrough();
const StageEnum = z.enum([
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
]);
const Opportunity = z
  .object({
    id: z.number().int(),
    customer__first_name: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    title: z.string().max(255),
    stage: StageEnum.optional(),
    amount: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullish(),
    customer: z.number().int(),
  })
  .passthrough();
const PaginatedOpportunityList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Opportunity),
  })
  .passthrough();
const OpportunityRequest = z
  .object({
    is_active: z.boolean().optional(),
    title: z.string().min(1).max(255),
    stage: StageEnum.optional(),
    amount: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullish(),
    customer: z.number().int(),
  })
  .passthrough();
const PatchedOpportunityRequest = z
  .object({
    is_active: z.boolean(),
    title: z.string().min(1).max(255),
    stage: StageEnum,
    amount: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullable(),
    customer: z.number().int(),
  })
  .partial()
  .passthrough();
const PartnerBranch = z
  .object({
    id: z.number().int(),
    partner: z.number().int(),
    partner_name: z.string(),
    branch: z.number().int(),
    branch_name: z.string(),
    special_discount: z
      .string()
      .regex(/^-?\d{0,3}(?:\.\d{0,2})?$/)
      .nullish(),
    is_active: z.boolean().optional(),
  })
  .passthrough();
const PaginatedPartnerBranchList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(PartnerBranch),
  })
  .passthrough();
const PartnerBranchRequest = z
  .object({
    partner: z.number().int(),
    branch: z.number().int(),
    special_discount: z
      .string()
      .regex(/^-?\d{0,3}(?:\.\d{0,2})?$/)
      .nullish(),
    is_active: z.boolean().optional(),
  })
  .passthrough();
const PatchedPartnerBranchRequest = z
  .object({
    partner: z.number().int(),
    branch: z.number().int(),
    special_discount: z
      .string()
      .regex(/^-?\d{0,3}(?:\.\d{0,2})?$/)
      .nullable(),
    is_active: z.boolean(),
  })
  .partial()
  .passthrough();
const PartnerSettlementStatusEnum = z.enum([
  "pending",
  "confirmed",
  "paid",
  "disputed",
]);
const PartnerSettlement = z
  .object({
    id: z.number().int(),
    settlement_number: z.string().max(50),
    partner: z.number().int(),
    partner_name: z.string(),
    settlement_date: z.string(),
    period_start: z.string(),
    period_end: z.string(),
    total_claims: z.number().int().gte(0).lte(2147483647).optional(),
    total_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    adjustments: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    net_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    status: PartnerSettlementStatusEnum.optional(),
    status_display: z.string(),
    payment_date: z.string().nullish(),
    payment_reference: z.string().max(100).optional(),
    notes: z.string().optional(),
  })
  .passthrough();
const PaginatedPartnerSettlementList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(PartnerSettlement),
  })
  .passthrough();
const PartnerSettlementRequest = z
  .object({
    settlement_number: z.string().min(1).max(50),
    partner: z.number().int(),
    period_start: z.string(),
    period_end: z.string(),
    total_claims: z.number().int().gte(0).lte(2147483647).optional(),
    total_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    adjustments: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    net_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    status: PartnerSettlementStatusEnum.optional(),
    payment_date: z.string().nullish(),
    payment_reference: z.string().max(100).optional(),
    notes: z.string().optional(),
  })
  .passthrough();
const PatchedPartnerSettlementRequest = z
  .object({
    settlement_number: z.string().min(1).max(50),
    partner: z.number().int(),
    period_start: z.string(),
    period_end: z.string(),
    total_claims: z.number().int().gte(0).lte(2147483647),
    total_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    adjustments: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    net_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    status: PartnerSettlementStatusEnum,
    payment_date: z.string().nullable(),
    payment_reference: z.string().max(100),
    notes: z.string(),
  })
  .partial()
  .passthrough();
const PartnerTypeEnum = z.enum([
  "insurance",
  "bnpl",
  "corporate",
  "wholesaler",
  "agent",
]);
const PartnerList = z
  .object({
    id: z.number().int(),
    name: z.string().max(200),
    partner_type: PartnerTypeEnum,
    partner_type_display: z.string(),
    code: z.string().max(20).optional(),
    is_active: z.boolean().optional(),
    default_discount: z
      .string()
      .regex(/^-?\d{0,3}(?:\.\d{0,2})?$/)
      .optional(),
    current_balance: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
  })
  .passthrough();
const PaginatedPartnerListList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(PartnerList),
  })
  .passthrough();
const PaymentTermsEnum = z.enum([
  "immediate",
  "7_days",
  "15_days",
  "30_days",
  "60_days",
  "90_days",
]);
const PartnerRequest = z
  .object({
    name: z.string().min(1).max(200),
    name_en: z.string().max(200).optional(),
    partner_type: PartnerTypeEnum,
    logo: z.instanceof(File).nullish(),
    contact_person: z.string().max(100).optional(),
    phone: z.string().max(20).optional(),
    email: z.string().max(254).email().optional(),
    website: z.string().max(200).url().optional(),
    address: z.string().optional(),
    contract_number: z.string().max(50).optional(),
    contract_start: z.string().nullish(),
    contract_end: z.string().nullish(),
    payment_terms: PaymentTermsEnum.optional(),
    default_discount: z
      .string()
      .regex(/^-?\d{0,3}(?:\.\d{0,2})?$/)
      .optional(),
    credit_limit: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    current_balance: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    patient_share_percentage: z
      .string()
      .regex(/^-?\d{0,3}(?:\.\d{0,2})?$/)
      .optional(),
    tax_number: z.string().max(50).optional(),
    notes: z.string().optional(),
    is_active: z.boolean().optional(),
  })
  .passthrough();
const Partner = z
  .object({
    id: z.number().int(),
    name: z.string().max(200),
    name_en: z.string().max(200).optional(),
    partner_type: PartnerTypeEnum,
    partner_type_display: z.string(),
    code: z.string(),
    logo: z.string().url().nullish(),
    contact_person: z.string().max(100).optional(),
    phone: z.string().max(20).optional(),
    email: z.string().max(254).email().optional(),
    website: z.string().max(200).url().optional(),
    address: z.string().optional(),
    contract_number: z.string().max(50).optional(),
    contract_start: z.string().nullish(),
    contract_end: z.string().nullish(),
    payment_terms: PaymentTermsEnum.optional(),
    default_discount: z
      .string()
      .regex(/^-?\d{0,3}(?:\.\d{0,2})?$/)
      .optional(),
    credit_limit: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    current_balance: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    available_credit: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    patient_share_percentage: z
      .string()
      .regex(/^-?\d{0,3}(?:\.\d{0,2})?$/)
      .optional(),
    tax_number: z.string().max(50).optional(),
    notes: z.string().optional(),
    is_active: z.boolean().optional(),
    is_contract_active: z.boolean(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PatchedPartnerRequest = z
  .object({
    name: z.string().min(1).max(200),
    name_en: z.string().max(200),
    partner_type: PartnerTypeEnum,
    logo: z.instanceof(File).nullable(),
    contact_person: z.string().max(100),
    phone: z.string().max(20),
    email: z.string().max(254).email(),
    website: z.string().max(200).url(),
    address: z.string(),
    contract_number: z.string().max(50),
    contract_start: z.string().nullable(),
    contract_end: z.string().nullable(),
    payment_terms: PaymentTermsEnum,
    default_discount: z.string().regex(/^-?\d{0,3}(?:\.\d{0,2})?$/),
    credit_limit: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    current_balance: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    patient_share_percentage: z.string().regex(/^-?\d{0,3}(?:\.\d{0,2})?$/),
    tax_number: z.string().max(50),
    notes: z.string(),
    is_active: z.boolean(),
  })
  .partial()
  .passthrough();
const ClaimsStats = z
  .object({
    total_claims: z.number().int(),
    total_amount: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    total_approved: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    total_paid: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const PartnerClaimsSummary = z
  .object({ summary: ClaimsStats, by_status: z.array(z.unknown()) })
  .passthrough();
const PartnerChoices = z
  .object({
    partner_types: z.object({}).partial().passthrough(),
    payment_terms: z.object({}).partial().passthrough(),
  })
  .passthrough();
const SubscriptionTypeEnum = z.enum(["monthly", "yearly", "lifetime"]);
const Subscription = z
  .object({
    id: z.number().int(),
    customer__first_name: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    subscription_type: SubscriptionTypeEnum,
    start_date: z.string().datetime({ offset: true }).optional(),
    end_date: z.string().datetime({ offset: true }),
    customer: z.number().int(),
  })
  .passthrough();
const PaginatedSubscriptionList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Subscription),
  })
  .passthrough();
const SubscriptionRequest = z
  .object({
    is_active: z.boolean().optional(),
    subscription_type: SubscriptionTypeEnum,
    start_date: z.string().datetime({ offset: true }).optional(),
    end_date: z.string().datetime({ offset: true }),
    customer: z.number().int(),
  })
  .passthrough();
const PatchedSubscriptionRequest = z
  .object({
    is_active: z.boolean(),
    subscription_type: SubscriptionTypeEnum,
    start_date: z.string().datetime({ offset: true }),
    end_date: z.string().datetime({ offset: true }),
    customer: z.number().int(),
  })
  .partial()
  .passthrough();
const PriorityEnum = z.enum(["low", "medium", "high"]);
const Task = z
  .object({
    id: z.number().int(),
    customer__first_name: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    title: z.string().max(255),
    description: z.string().nullish(),
    priority: PriorityEnum.optional(),
    due_date: z.string().datetime({ offset: true }).nullish(),
    completed: z.boolean().optional(),
    customer: z.number().int().nullish(),
    opportunity: z.number().int().nullish(),
  })
  .passthrough();
const PaginatedTaskList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Task),
  })
  .passthrough();
const TaskRequest = z
  .object({
    is_active: z.boolean().optional(),
    title: z.string().min(1).max(255),
    description: z.string().nullish(),
    priority: PriorityEnum.optional(),
    due_date: z.string().datetime({ offset: true }).nullish(),
    completed: z.boolean().optional(),
    customer: z.number().int().nullish(),
    opportunity: z.number().int().nullish(),
  })
  .passthrough();
const PatchedTaskRequest = z
  .object({
    is_active: z.boolean(),
    title: z.string().min(1).max(255),
    description: z.string().nullable(),
    priority: PriorityEnum,
    due_date: z.string().datetime({ offset: true }).nullable(),
    completed: z.boolean(),
    customer: z.number().int().nullable(),
    opportunity: z.number().int().nullable(),
  })
  .partial()
  .passthrough();
const Attendance = z
  .object({
    id: z.number().int(),
    employee__user__username: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    date: z.string(),
    hours_worked: z.number().nullish(),
    check_in: z.string().nullish(),
    check_out: z.string().nullish(),
    employee: z.number().int(),
  })
  .passthrough();
const PaginatedAttendanceList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Attendance),
  })
  .passthrough();
const AttendanceRequest = z
  .object({
    is_active: z.boolean().optional(),
    date: z.string(),
    hours_worked: z.number().nullish(),
    check_in: z.string().nullish(),
    check_out: z.string().nullish(),
    employee: z.number().int(),
  })
  .passthrough();
const PatchedAttendanceRequest = z
  .object({
    is_active: z.boolean(),
    date: z.string(),
    hours_worked: z.number().nullable(),
    check_in: z.string().nullable(),
    check_out: z.string().nullable(),
    employee: z.number().int(),
  })
  .partial()
  .passthrough();
const Department = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    name: z.string().max(100),
    description: z.string().nullish(),
    location: z.string().max(100).nullish(),
  })
  .passthrough();
const PaginatedDepartmentList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Department),
  })
  .passthrough();
const DepartmentRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    name: z.string().min(1).max(100),
    description: z.string().nullish(),
    location: z.string().max(100).nullish(),
  })
  .passthrough();
const PatchedDepartmentRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    name: z.string().min(1).max(100),
    description: z.string().nullable(),
    location: z.string().max(100).nullable(),
  })
  .partial()
  .passthrough();
const DepartmentOption = z
  .object({ label: z.string(), value: z.number().int() })
  .passthrough();
const UserOption = z
  .object({ label: z.string(), value: z.number().int() })
  .passthrough();
const PositionOption = z
  .object({ label: z.string(), value: z.string() })
  .passthrough();
const EmployeeFormOptionsResponse = z
  .object({
    departments: z.array(DepartmentOption),
    users: z.array(UserOption),
    positions: z.array(PositionOption),
  })
  .passthrough();
const PositionEnum = z.enum([
  "manager",
  "employee",
  "hr",
  "admin",
  "accountant",
  "marketing",
  "sales",
  "delivery",
  "customer_service",
]);
const Employee = z
  .object({
    id: z.number().int(),
    user: z.number().int(),
    department: z.number().int().nullish(),
    user_name: z.string(),
    department_name: z.string(),
    position: PositionEnum.optional(),
    salary: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    phone: z.string().max(20).optional(),
    hire_date: z.string().optional(),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PaginatedEmployeeList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Employee),
  })
  .passthrough();
const EmployeeRequest = z
  .object({
    user: z.number().int(),
    department: z.number().int().nullish(),
    position: PositionEnum.optional(),
    salary: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    phone: z.string().max(20).optional(),
    hire_date: z.string().optional(),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
  })
  .passthrough();
const PatchedEmployeeRequest = z
  .object({
    user: z.number().int(),
    department: z.number().int().nullable(),
    position: PositionEnum,
    salary: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    phone: z.string().max(20),
    hire_date: z.string(),
    is_active: z.boolean(),
    is_deleted: z.boolean(),
  })
  .partial()
  .passthrough();
const LeaveTypeEnum = z.enum(["sick", "vacation", "personal"]);
const LeaveStatusEnum = z.enum(["pending", "approved", "rejected"]);
const Leave = z
  .object({
    id: z.number().int(),
    employee__user__username: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    leave_type: LeaveTypeEnum,
    start_date: z.string(),
    end_date: z.string().nullish(),
    status: LeaveStatusEnum,
    employee: z.number().int(),
  })
  .passthrough();
const PaginatedLeaveList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Leave),
  })
  .passthrough();
const LeaveRequest = z
  .object({
    is_active: z.boolean().optional(),
    leave_type: LeaveTypeEnum,
    end_date: z.string().nullish(),
    employee: z.number().int(),
  })
  .passthrough();
const PatchedLeaveRequest = z
  .object({
    is_active: z.boolean(),
    leave_type: LeaveTypeEnum,
    end_date: z.string().nullable(),
    employee: z.number().int(),
  })
  .partial()
  .passthrough();
const NotificationTypeEnum = z.enum(["leave", "task", "payroll"]);
const Notification = z
  .object({
    id: z.number().int(),
    employee__user__username: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    notification_type: NotificationTypeEnum,
    message: z.string().nullish(),
    is_read: z.boolean().optional(),
    employee: z.number().int(),
  })
  .passthrough();
const PaginatedNotificationList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Notification),
  })
  .passthrough();
const NotificationRequest = z
  .object({
    is_active: z.boolean().optional(),
    notification_type: NotificationTypeEnum,
    message: z.string().nullish(),
    is_read: z.boolean().optional(),
    employee: z.number().int(),
  })
  .passthrough();
const PatchedNotificationRequest = z
  .object({
    is_active: z.boolean(),
    notification_type: NotificationTypeEnum,
    message: z.string().nullable(),
    is_read: z.boolean(),
    employee: z.number().int(),
  })
  .partial()
  .passthrough();
const PayrollStatusEnum = z.enum(["draft", "approved", "paid"]);
const Payroll = z
  .object({
    id: z.number().int(),
    employee__user__username: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    month: z.string().max(20),
    basic_salary: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    bonuses: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    deductions: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    net_salary: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullish(),
    status: PayrollStatusEnum.optional(),
    employee: z.number().int(),
    journal_entry: z.number().int().nullish(),
  })
  .passthrough();
const PaginatedPayrollList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Payroll),
  })
  .passthrough();
const PayrollRequest = z
  .object({
    is_active: z.boolean().optional(),
    month: z.string().min(1).max(20),
    basic_salary: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    bonuses: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    deductions: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    net_salary: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullish(),
    status: PayrollStatusEnum.optional(),
    employee: z.number().int(),
    journal_entry: z.number().int().nullish(),
  })
  .passthrough();
const PatchedPayrollRequest = z
  .object({
    is_active: z.boolean(),
    month: z.string().min(1).max(20),
    basic_salary: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    bonuses: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    deductions: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    net_salary: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullable(),
    status: PayrollStatusEnum,
    employee: z.number().int(),
    journal_entry: z.number().int().nullable(),
  })
  .partial()
  .passthrough();
const RatingEnum = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);
const PerformanceReview = z
  .object({
    id: z.number().int(),
    employee__user__username: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    review_date: z.string(),
    rating: RatingEnum,
    comments: z.string().nullish(),
    employee: z.number().int(),
  })
  .passthrough();
const PaginatedPerformanceReviewList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(PerformanceReview),
  })
  .passthrough();
const PerformanceReviewRequest = z
  .object({
    is_active: z.boolean().optional(),
    rating: RatingEnum,
    comments: z.string().nullish(),
    employee: z.number().int(),
  })
  .passthrough();
const PatchedPerformanceReviewRequest = z
  .object({
    is_active: z.boolean(),
    rating: RatingEnum,
    comments: z.string().nullable(),
    employee: z.number().int(),
  })
  .partial()
  .passthrough();
const MobileCustomerLookupItem = z
  .object({
    id: z.number().int(),
    name: z.string(),
    phone: z.string(),
    tier: z.string(),
    has_credit: z.boolean(),
  })
  .passthrough();
const MobileDashboardTodayStats = z
  .object({
    orders_count: z.number().int(),
    total_sales: z.string(),
    cash_sales: z.string(),
    card_sales: z.string(),
  })
  .passthrough();
const MobileDashboardOrder = z
  .object({
    id: z.number().int(),
    order_number: z.string(),
    customer_name: z.string(),
    total: z.string(),
    status: z.string(),
    time: z.string(),
  })
  .passthrough();
const MobileDashboardAlert = z
  .object({
    type: z.string(),
    title: z.string(),
    message: z.string(),
    action: z.string(),
  })
  .passthrough();
const MobileUserPerformance = z
  .object({ orders: z.number().int(), sales: z.string() })
  .passthrough();
const MobileDashboardResponse = z
  .object({
    today: MobileDashboardTodayStats,
    recent_orders: z.array(MobileDashboardOrder),
    alerts: z.array(MobileDashboardAlert),
    user_performance: MobileUserPerformance.nullable(),
    timestamp: z.string(),
  })
  .passthrough();
const OrderDetailCustomer = z
  .object({ id: z.number().int(), name: z.string() })
  .passthrough();
const OrderDetailItem = z
  .object({
    id: z.number().int(),
    name: z.string(),
    sku: z.string(),
    quantity: z.number().int(),
    price: z.string(),
    total: z.string(),
  })
  .passthrough();
const MobileOrderDetailResponse = z
  .object({
    id: z.number().int(),
    order_number: z.string(),
    status: z.string(),
    payment_status: z.string(),
    customer: OrderDetailCustomer.nullable(),
    branch: z.string().nullable(),
    items: z.array(OrderDetailItem),
    subtotal: z.string(),
    discount: z.string(),
    tax: z.string(),
    total: z.string(),
    paid: z.string(),
    remaining: z.string(),
    created_at: z.string(),
  })
  .passthrough();
const MobileProductSearchItem = z
  .object({
    id: z.number().int(),
    sku: z.string(),
    name: z.string(),
    price: z.string(),
    stock: z.number().int(),
  })
  .passthrough();
const QuickSaleItemRequest = z
  .object({
    variant_id: z.number().int(),
    quantity: z.number().int(),
    price: z.string().min(1),
  })
  .passthrough();
const MobileQuickSaleRequestRequest = z
  .object({
    customer_id: z.number().int().optional(),
    items: z.array(QuickSaleItemRequest),
    payment_method: z.string().min(1),
    discount: z.string().min(1),
  })
  .passthrough();
const MobileQuickSaleResponse = z
  .object({
    success: z.boolean(),
    order_id: z.number().int(),
    order_number: z.string(),
    total: z.string(),
  })
  .passthrough();
const SyncProduct = z
  .object({
    id: z.number().int(),
    sku: z.string(),
    price: z.string(),
    product__name: z.string(),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const SyncCustomer = z
  .object({
    id: z.number().int(),
    first_name: z.string(),
    last_name: z.string(),
    phone: z.string(),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const MobileSyncResponse = z
  .object({
    products: z.array(SyncProduct),
    customers: z.array(SyncCustomer),
    timestamp: z.string(),
  })
  .passthrough();
const Permission = z
  .object({
    id: z.number().int(),
    code: z.string().max(100),
    description: z.string().optional(),
  })
  .passthrough();
const Role = z
  .object({
    id: z.number().int(),
    name: z.string().max(50),
    permissions: z.array(Permission),
    is_active: z.boolean().optional(),
    description: z.string().optional(),
  })
  .passthrough();
const User = z
  .object({
    id: z.number().int(),
    username: z.string().min(5).max(50),
    email: z.string().email(),
    first_name: z.string().max(30),
    last_name: z.string().max(30),
    roles: z.array(Role),
    phone: z.string().regex(/^\+?\d{7,15}$/),
    client: z.number().int().nullable(),
    is_active: z.boolean().optional(),
    is_staff: z.boolean().optional(),
    is_superuser: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    deleted_at: z.string().datetime({ offset: true }).nullable(),
  })
  .passthrough();
const RightSphereEnum = z.enum([
  "-30.00",
  "-29.75",
  "-29.50",
  "-29.25",
  "-29.00",
  "-28.75",
  "-28.50",
  "-28.25",
  "-28.00",
  "-27.75",
  "-27.50",
  "-27.25",
  "-27.00",
  "-26.75",
  "-26.50",
  "-26.25",
  "-26.00",
  "-25.75",
  "-25.50",
  "-25.25",
  "-25.00",
  "-24.75",
  "-24.50",
  "-24.25",
  "-24.00",
  "-23.75",
  "-23.50",
  "-23.25",
  "-23.00",
  "-22.75",
  "-22.50",
  "-22.25",
  "-22.00",
  "-21.75",
  "-21.50",
  "-21.25",
  "-21.00",
  "-20.75",
  "-20.50",
  "-20.25",
  "-20.00",
  "-19.75",
  "-19.50",
  "-19.25",
  "-19.00",
  "-18.75",
  "-18.50",
  "-18.25",
  "-18.00",
  "-17.75",
  "-17.50",
  "-17.25",
  "-17.00",
  "-16.75",
  "-16.50",
  "-16.25",
  "-16.00",
  "-15.75",
  "-15.50",
  "-15.25",
  "-15.00",
  "-14.75",
  "-14.50",
  "-14.25",
  "-14.00",
  "-13.75",
  "-13.50",
  "-13.25",
  "-13.00",
  "-12.75",
  "-12.50",
  "-12.25",
  "-12.00",
  "-11.75",
  "-11.50",
  "-11.25",
  "-11.00",
  "-10.75",
  "-10.50",
  "-10.25",
  "-10.00",
  "-09.75",
  "-09.50",
  "-09.25",
  "-09.00",
  "-08.75",
  "-08.50",
  "-08.25",
  "-08.00",
  "-07.75",
  "-07.50",
  "-07.25",
  "-07.00",
  "-06.75",
  "-06.50",
  "-06.25",
  "-06.00",
  "-05.75",
  "-05.50",
  "-05.25",
  "-05.00",
  "-04.75",
  "-04.50",
  "-04.25",
  "-04.00",
  "-03.75",
  "-03.50",
  "-03.25",
  "-03.00",
  "-02.75",
  "-02.50",
  "-02.25",
  "-02.00",
  "-01.75",
  "-01.50",
  "-01.25",
  "-01.00",
  "-00.75",
  "-00.50",
  "-00.25",
  "-00.00",
  "+00.25",
  "+00.50",
  "+00.75",
  "+01.00",
  "+01.25",
  "+01.50",
  "+01.75",
  "+02.00",
  "+02.25",
  "+02.50",
  "+02.75",
  "+03.00",
  "+03.25",
  "+03.50",
  "+03.75",
  "+04.00",
  "+04.25",
  "+04.50",
  "+04.75",
  "+05.00",
  "+05.25",
  "+05.50",
  "+05.75",
  "+06.00",
  "+06.25",
  "+06.50",
  "+06.75",
  "+07.00",
  "+07.25",
  "+07.50",
  "+07.75",
  "+08.00",
  "+08.25",
  "+08.50",
  "+08.75",
  "+09.00",
  "+09.25",
  "+09.50",
  "+09.75",
  "+10.00",
  "+10.25",
  "+10.50",
  "+10.75",
  "+11.00",
  "+11.25",
  "+11.50",
  "+11.75",
  "+12.00",
  "+12.25",
  "+12.50",
  "+12.75",
  "+13.00",
  "+13.25",
  "+13.50",
  "+13.75",
  "+14.00",
  "+14.25",
  "+14.50",
  "+14.75",
  "+15.00",
  "+15.25",
  "+15.50",
  "+15.75",
  "+16.00",
  "+16.25",
  "+16.50",
  "+16.75",
  "+17.00",
  "+17.25",
  "+17.50",
  "+17.75",
  "+18.00",
  "+18.25",
  "+18.50",
  "+18.75",
  "+19.00",
  "+19.25",
  "+19.50",
  "+19.75",
  "+20.00",
  "+20.25",
  "+20.50",
  "+20.75",
  "+21.00",
  "+21.25",
  "+21.50",
  "+21.75",
  "+22.00",
  "+22.25",
  "+22.50",
  "+22.75",
  "+23.00",
  "+23.25",
  "+23.50",
  "+23.75",
  "+24.00",
  "+24.25",
  "+24.50",
  "+24.75",
  "+25.00",
  "+25.25",
  "+25.50",
  "+25.75",
  "+26.00",
  "+26.25",
  "+26.50",
  "+26.75",
  "+27.00",
  "+27.25",
  "+27.50",
  "+27.75",
  "+28.00",
  "+28.25",
  "+28.50",
  "+28.75",
  "+29.00",
  "+29.25",
  "+29.50",
  "+29.75",
  "+30.00",
]);
const NullEnum = z.unknown();
const RightCylinderEnum = z.enum([
  "-15.00",
  "-14.75",
  "-14.50",
  "-14.25",
  "-14.00",
  "-13.75",
  "-13.50",
  "-13.25",
  "-13.00",
  "-12.75",
  "-12.50",
  "-12.25",
  "-12.00",
  "-11.75",
  "-11.50",
  "-11.25",
  "-11.00",
  "-10.75",
  "-10.50",
  "-10.25",
  "-10.00",
  "-09.75",
  "-09.50",
  "-09.25",
  "-09.00",
  "-08.75",
  "-08.50",
  "-08.25",
  "-08.00",
  "-07.75",
  "-07.50",
  "-07.25",
  "-07.00",
  "-06.75",
  "-06.50",
  "-06.25",
  "-06.00",
  "-05.75",
  "-05.50",
  "-05.25",
  "-05.00",
  "-04.75",
  "-04.50",
  "-04.25",
  "-04.00",
  "-03.75",
  "-03.50",
  "-03.25",
  "-03.00",
  "-02.75",
  "-02.50",
  "-02.25",
  "-02.00",
  "-01.75",
  "-01.50",
  "-01.25",
  "-01.00",
  "-00.75",
  "-00.50",
  "-00.25",
  "-00.00",
]);
const LeftSphereEnum = z.enum([
  "-30.00",
  "-29.75",
  "-29.50",
  "-29.25",
  "-29.00",
  "-28.75",
  "-28.50",
  "-28.25",
  "-28.00",
  "-27.75",
  "-27.50",
  "-27.25",
  "-27.00",
  "-26.75",
  "-26.50",
  "-26.25",
  "-26.00",
  "-25.75",
  "-25.50",
  "-25.25",
  "-25.00",
  "-24.75",
  "-24.50",
  "-24.25",
  "-24.00",
  "-23.75",
  "-23.50",
  "-23.25",
  "-23.00",
  "-22.75",
  "-22.50",
  "-22.25",
  "-22.00",
  "-21.75",
  "-21.50",
  "-21.25",
  "-21.00",
  "-20.75",
  "-20.50",
  "-20.25",
  "-20.00",
  "-19.75",
  "-19.50",
  "-19.25",
  "-19.00",
  "-18.75",
  "-18.50",
  "-18.25",
  "-18.00",
  "-17.75",
  "-17.50",
  "-17.25",
  "-17.00",
  "-16.75",
  "-16.50",
  "-16.25",
  "-16.00",
  "-15.75",
  "-15.50",
  "-15.25",
  "-15.00",
  "-14.75",
  "-14.50",
  "-14.25",
  "-14.00",
  "-13.75",
  "-13.50",
  "-13.25",
  "-13.00",
  "-12.75",
  "-12.50",
  "-12.25",
  "-12.00",
  "-11.75",
  "-11.50",
  "-11.25",
  "-11.00",
  "-10.75",
  "-10.50",
  "-10.25",
  "-10.00",
  "-09.75",
  "-09.50",
  "-09.25",
  "-09.00",
  "-08.75",
  "-08.50",
  "-08.25",
  "-08.00",
  "-07.75",
  "-07.50",
  "-07.25",
  "-07.00",
  "-06.75",
  "-06.50",
  "-06.25",
  "-06.00",
  "-05.75",
  "-05.50",
  "-05.25",
  "-05.00",
  "-04.75",
  "-04.50",
  "-04.25",
  "-04.00",
  "-03.75",
  "-03.50",
  "-03.25",
  "-03.00",
  "-02.75",
  "-02.50",
  "-02.25",
  "-02.00",
  "-01.75",
  "-01.50",
  "-01.25",
  "-01.00",
  "-00.75",
  "-00.50",
  "-00.25",
  "-00.00",
  "+00.25",
  "+00.50",
  "+00.75",
  "+01.00",
  "+01.25",
  "+01.50",
  "+01.75",
  "+02.00",
  "+02.25",
  "+02.50",
  "+02.75",
  "+03.00",
  "+03.25",
  "+03.50",
  "+03.75",
  "+04.00",
  "+04.25",
  "+04.50",
  "+04.75",
  "+05.00",
  "+05.25",
  "+05.50",
  "+05.75",
  "+06.00",
  "+06.25",
  "+06.50",
  "+06.75",
  "+07.00",
  "+07.25",
  "+07.50",
  "+07.75",
  "+08.00",
  "+08.25",
  "+08.50",
  "+08.75",
  "+09.00",
  "+09.25",
  "+09.50",
  "+09.75",
  "+10.00",
  "+10.25",
  "+10.50",
  "+10.75",
  "+11.00",
  "+11.25",
  "+11.50",
  "+11.75",
  "+12.00",
  "+12.25",
  "+12.50",
  "+12.75",
  "+13.00",
  "+13.25",
  "+13.50",
  "+13.75",
  "+14.00",
  "+14.25",
  "+14.50",
  "+14.75",
  "+15.00",
  "+15.25",
  "+15.50",
  "+15.75",
  "+16.00",
  "+16.25",
  "+16.50",
  "+16.75",
  "+17.00",
  "+17.25",
  "+17.50",
  "+17.75",
  "+18.00",
  "+18.25",
  "+18.50",
  "+18.75",
  "+19.00",
  "+19.25",
  "+19.50",
  "+19.75",
  "+20.00",
  "+20.25",
  "+20.50",
  "+20.75",
  "+21.00",
  "+21.25",
  "+21.50",
  "+21.75",
  "+22.00",
  "+22.25",
  "+22.50",
  "+22.75",
  "+23.00",
  "+23.25",
  "+23.50",
  "+23.75",
  "+24.00",
  "+24.25",
  "+24.50",
  "+24.75",
  "+25.00",
  "+25.25",
  "+25.50",
  "+25.75",
  "+26.00",
  "+26.25",
  "+26.50",
  "+26.75",
  "+27.00",
  "+27.25",
  "+27.50",
  "+27.75",
  "+28.00",
  "+28.25",
  "+28.50",
  "+28.75",
  "+29.00",
  "+29.25",
  "+29.50",
  "+29.75",
  "+30.00",
]);
const LeftCylinderEnum = z.enum([
  "-15.00",
  "-14.75",
  "-14.50",
  "-14.25",
  "-14.00",
  "-13.75",
  "-13.50",
  "-13.25",
  "-13.00",
  "-12.75",
  "-12.50",
  "-12.25",
  "-12.00",
  "-11.75",
  "-11.50",
  "-11.25",
  "-11.00",
  "-10.75",
  "-10.50",
  "-10.25",
  "-10.00",
  "-09.75",
  "-09.50",
  "-09.25",
  "-09.00",
  "-08.75",
  "-08.50",
  "-08.25",
  "-08.00",
  "-07.75",
  "-07.50",
  "-07.25",
  "-07.00",
  "-06.75",
  "-06.50",
  "-06.25",
  "-06.00",
  "-05.75",
  "-05.50",
  "-05.25",
  "-05.00",
  "-04.75",
  "-04.50",
  "-04.25",
  "-04.00",
  "-03.75",
  "-03.50",
  "-03.25",
  "-03.00",
  "-02.75",
  "-02.50",
  "-02.25",
  "-02.00",
  "-01.75",
  "-01.50",
  "-01.25",
  "-01.00",
  "-00.75",
  "-00.50",
  "-00.25",
  "-00.00",
]);
const RightReadingAddEnum = z.enum([
  "+00.25",
  "+00.50",
  "+00.75",
  "+01.00",
  "+01.25",
  "+01.50",
  "+01.75",
  "+02.00",
  "+02.25",
  "+02.50",
  "+02.75",
  "+03.00",
  "+03.25",
  "+03.50",
  "+03.75",
  "+04.00",
  "+04.25",
  "+04.50",
  "+04.75",
  "+05.00",
  "+05.25",
  "+05.50",
  "+05.75",
  "+06.00",
]);
const LeftReadingAddEnum = z.enum([
  "+00.25",
  "+00.50",
  "+00.75",
  "+01.00",
  "+01.25",
  "+01.50",
  "+01.75",
  "+02.00",
  "+02.25",
  "+02.50",
  "+02.75",
  "+03.00",
  "+03.25",
  "+03.50",
  "+03.75",
  "+04.00",
  "+04.25",
  "+04.50",
  "+04.75",
  "+05.00",
  "+05.25",
  "+05.50",
  "+05.75",
  "+06.00",
]);
const PrescriptionRecord = z
  .object({
    id: z.number().int(),
    created_by: User,
    customer_name: z.string(),
    created_by_username: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    dependent_name: z.string().max(100).nullish(),
    right_sphere: z.union([RightSphereEnum, BlankEnum, NullEnum]).nullish(),
    right_cylinder: z.union([RightCylinderEnum, BlankEnum, NullEnum]).nullish(),
    right_axis: z.number().gte(0).lte(180).nullish(),
    left_sphere: z.union([LeftSphereEnum, BlankEnum, NullEnum]).nullish(),
    left_cylinder: z.union([LeftCylinderEnum, BlankEnum, NullEnum]).nullish(),
    left_axis: z.number().gte(0).lte(180).nullish(),
    right_reading_add: z
      .union([RightReadingAddEnum, BlankEnum, NullEnum])
      .nullish(),
    left_reading_add: z
      .union([LeftReadingAddEnum, BlankEnum, NullEnum])
      .nullish(),
    right_pupillary_distance: z.number().nullish(),
    left_pupillary_distance: z.number().nullish(),
    segment_height_right: z.string().max(20).nullish(),
    segment_height_left: z.string().max(20).nullish(),
    visual_acuity_right: z.string().max(20).nullish(),
    visual_acuity_left: z.string().max(20).nullish(),
    vertical_distance_right: z.string().max(20).nullish(),
    vertical_distance_left: z.string().max(20).nullish(),
    notes: z.string().nullish(),
    customer: z.number().int(),
  })
  .passthrough();
const PaginatedPrescriptionRecordList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(PrescriptionRecord),
  })
  .passthrough();
const PrescriptionRecordRequest = z
  .object({
    is_active: z.boolean().optional(),
    dependent_name: z.string().max(100).nullish(),
    right_sphere: z.union([RightSphereEnum, BlankEnum, NullEnum]).nullish(),
    right_cylinder: z.union([RightCylinderEnum, BlankEnum, NullEnum]).nullish(),
    right_axis: z.number().gte(0).lte(180).nullish(),
    left_sphere: z.union([LeftSphereEnum, BlankEnum, NullEnum]).nullish(),
    left_cylinder: z.union([LeftCylinderEnum, BlankEnum, NullEnum]).nullish(),
    left_axis: z.number().gte(0).lte(180).nullish(),
    right_reading_add: z
      .union([RightReadingAddEnum, BlankEnum, NullEnum])
      .nullish(),
    left_reading_add: z
      .union([LeftReadingAddEnum, BlankEnum, NullEnum])
      .nullish(),
    right_pupillary_distance: z.number().nullish(),
    left_pupillary_distance: z.number().nullish(),
    segment_height_right: z.string().max(20).nullish(),
    segment_height_left: z.string().max(20).nullish(),
    visual_acuity_right: z.string().max(20).nullish(),
    visual_acuity_left: z.string().max(20).nullish(),
    vertical_distance_right: z.string().max(20).nullish(),
    vertical_distance_left: z.string().max(20).nullish(),
    notes: z.string().nullish(),
    customer: z.number().int(),
  })
  .passthrough();
const PatchedPrescriptionRecordRequest = z
  .object({
    is_active: z.boolean(),
    dependent_name: z.string().max(100).nullable(),
    right_sphere: z.union([RightSphereEnum, BlankEnum, NullEnum]).nullable(),
    right_cylinder: z
      .union([RightCylinderEnum, BlankEnum, NullEnum])
      .nullable(),
    right_axis: z.number().gte(0).lte(180).nullable(),
    left_sphere: z.union([LeftSphereEnum, BlankEnum, NullEnum]).nullable(),
    left_cylinder: z.union([LeftCylinderEnum, BlankEnum, NullEnum]).nullable(),
    left_axis: z.number().gte(0).lte(180).nullable(),
    right_reading_add: z
      .union([RightReadingAddEnum, BlankEnum, NullEnum])
      .nullable(),
    left_reading_add: z
      .union([LeftReadingAddEnum, BlankEnum, NullEnum])
      .nullable(),
    right_pupillary_distance: z.number().nullable(),
    left_pupillary_distance: z.number().nullable(),
    segment_height_right: z.string().max(20).nullable(),
    segment_height_left: z.string().max(20).nullable(),
    visual_acuity_right: z.string().max(20).nullable(),
    visual_acuity_left: z.string().max(20).nullable(),
    vertical_distance_right: z.string().max(20).nullable(),
    vertical_distance_left: z.string().max(20).nullable(),
    notes: z.string().nullable(),
    customer: z.number().int(),
  })
  .partial()
  .passthrough();
const ProductVariantAnswer = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    answer: z.string(),
    question_id: z.number().int(),
    answered_by: z.number().int(),
  })
  .passthrough();
const PaginatedProductVariantAnswerList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(ProductVariantAnswer),
  })
  .passthrough();
const ProductVariantAnswerRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    answer: z.string().min(1),
    question_id: z.number().int(),
    answered_by: z.number().int(),
  })
  .passthrough();
const PatchedProductVariantAnswerRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    answer: z.string().min(1),
    question_id: z.number().int(),
    answered_by: z.number().int(),
  })
  .partial()
  .passthrough();
const AttributeValue = z
  .object({
    id: z.number().int(),
    attribute_name: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    value: z.string().max(100),
    label: z.string().nullable(),
    unique_key: z.string(),
    attribute: z.number().int(),
  })
  .passthrough();
const PaginatedAttributeValueList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(AttributeValue),
  })
  .passthrough();
const AttributeValueRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    value: z.string().min(1).max(100),
    attribute: z.number().int(),
  })
  .passthrough();
const PatchedAttributeValueRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    value: z.string().min(1).max(100),
    attribute: z.number().int(),
  })
  .partial()
  .passthrough();
const Attribute = z
  .object({
    id: z.number().int(),
    values: z.array(AttributeValue),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    name: z.string().max(100),
  })
  .passthrough();
const PaginatedAttributeList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Attribute),
  })
  .passthrough();
const AttributeRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    name: z.string().min(1).max(100),
  })
  .passthrough();
const PatchedAttributeRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    name: z.string().min(1).max(100),
  })
  .partial()
  .passthrough();
const Stock = z
  .object({
    id: z.number().int(),
    branch_name: z.string(),
    branch_code: z.string(),
    branch_type: z.string(),
    variant_sku: z.string(),
    variant_name: z.string(),
    product_name: z.string(),
    stock_status: z.string(),
    available_quantity: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    quantity_in_stock: z.number().int().gte(0).lte(2147483647).optional(),
    reserved_quantity: z.number().int().gte(0).lte(2147483647).optional(),
    reorder_level: z.number().int().gte(0).lte(2147483647).optional(),
    max_stock_level: z.number().int().gte(0).lte(2147483647).optional(),
    min_stock_level: z.number().int().gte(0).lte(2147483647).optional(),
    average_cost: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    last_cost: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    last_restocked: z.string().datetime({ offset: true }).nullable(),
    last_sale: z.string().datetime({ offset: true }).nullable(),
    allow_backorder: z.boolean().optional(),
    branch: z.number().int(),
    variant: z.number().int(),
  })
  .passthrough();
const ProductTypeEnum = z.enum(["CL", "SL", "FR", "AX", "OT", "DV", "All"]);
const Brand = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    name: z.string().max(100),
    country: z.string().max(50).optional(),
    website: z.string().max(200).url().optional(),
    description: z.string().optional(),
    product_type: ProductTypeEnum.optional(),
    logo: z.string().url().nullish(),
  })
  .passthrough();
const PaginatedBrandList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Brand),
  })
  .passthrough();
const BrandRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    name: z.string().min(1).max(100),
    country: z.string().max(50).optional(),
    website: z.string().max(200).url().optional(),
    description: z.string().optional(),
    product_type: ProductTypeEnum.optional(),
    logo: z.instanceof(File).nullish(),
  })
  .passthrough();
const PatchedBrandRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    name: z.string().min(1).max(100),
    country: z.string().max(50),
    website: z.string().max(200).url(),
    description: z.string(),
    product_type: ProductTypeEnum,
    logo: z.instanceof(File).nullable(),
  })
  .partial()
  .passthrough();
const Category = z
  .object({
    id: z.number().int(),
    parent_name: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    name: z.string().max(100),
    description: z.string().optional(),
    parent: z.number().int().nullish(),
  })
  .passthrough();
const PaginatedCategoryList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Category),
  })
  .passthrough();
const CategoryRequest = z
  .object({
    is_active: z.boolean().optional(),
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    parent: z.number().int().nullish(),
  })
  .passthrough();
const PatchedCategoryRequest = z
  .object({
    is_active: z.boolean(),
    name: z.string().min(1).max(100),
    description: z.string(),
    parent: z.number().int().nullable(),
  })
  .partial()
  .passthrough();
const FlexiblePrice = z
  .object({
    id: z.number().int(),
    variant: z.number().int(),
    pricing_policy: z.number().int().nullish(),
    customer: z.number().int().nullable(),
    customer_group: CustomerGroup,
    branch: Branch,
    partner: Partner,
    special_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    start_date: z.string().nullish(),
    end_date: z.string().nullish(),
    min_quantity: z.number().int().gte(0).lte(2147483647).optional(),
    currency: z.string().max(10).optional(),
    priority: z.number().int().gte(0).lte(2147483647).optional(),
  })
  .passthrough();
const PaginatedFlexiblePriceList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(FlexiblePrice),
  })
  .passthrough();
const FlexiblePriceRequest = z
  .object({
    variant: z.number().int(),
    pricing_policy: z.number().int().nullish(),
    customer: z.number().int().nullable(),
    customer_group_id: z.number().int().nullable(),
    branch_id: z.number().int().nullable(),
    partner_id: z.number().int().nullable(),
    special_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    start_date: z.string().nullish(),
    end_date: z.string().nullish(),
    min_quantity: z.number().int().gte(0).lte(2147483647).optional(),
    currency: z.string().min(1).max(10).optional(),
    priority: z.number().int().gte(0).lte(2147483647).optional(),
  })
  .passthrough();
const PatchedFlexiblePriceRequest = z
  .object({
    variant: z.number().int(),
    pricing_policy: z.number().int().nullable(),
    customer: z.number().int().nullable(),
    customer_group_id: z.number().int().nullable(),
    branch_id: z.number().int().nullable(),
    partner_id: z.number().int().nullable(),
    special_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    start_date: z.string().nullable(),
    end_date: z.string().nullable(),
    min_quantity: z.number().int().gte(0).lte(2147483647),
    currency: z.string().min(1).max(10),
    priority: z.number().int().gte(0).lte(2147483647),
  })
  .partial()
  .passthrough();
const Manufacturer = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    name: z.string().max(100),
    country: z.string().max(50).optional(),
    website: z.string().max(200).url().optional(),
    email: z.string().max(254).email().optional(),
    phone: z.string().max(20).optional(),
  })
  .passthrough();
const PaginatedManufacturerList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Manufacturer),
  })
  .passthrough();
const ManufacturerRequest = z
  .object({
    is_active: z.boolean().optional(),
    name: z.string().min(1).max(100),
    country: z.string().max(50).optional(),
    website: z.string().max(200).url().optional(),
    email: z.string().max(254).email().optional(),
    phone: z.string().max(20).optional(),
  })
  .passthrough();
const PatchedManufacturerRequest = z
  .object({
    is_active: z.boolean(),
    name: z.string().min(1).max(100),
    country: z.string().max(50),
    website: z.string().max(200).url(),
    email: z.string().max(254).email(),
    phone: z.string().max(20),
  })
  .partial()
  .passthrough();
const GenderEnum = z.enum(["unisex", "men", "women", "kids"]);
const AgeGroupEnum = z.enum(["adult", "child", "senior"]);
const ProductVariantMarketing = z
  .object({
    id: z.number().int(),
    variant_name: z.string(),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    title: z.string().max(200),
    description: z.string(),
    meta_title: z.string().max(200).optional(),
    meta_description: z.string().max(300).optional(),
    meta_keywords: z.string().max(200).optional(),
    slug: z
      .string()
      .max(50)
      .regex(/^[-a-zA-Z0-9_]+$/),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    seo_image: z.string().url().nullish(),
    seo_image_alt: z.string().max(200).optional(),
    gender: GenderEnum.optional(),
    age_group: z.union([AgeGroupEnum, BlankEnum]).optional(),
    variant: z.number().int(),
  })
  .passthrough();
const PaginatedProductVariantMarketingList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(ProductVariantMarketing),
  })
  .passthrough();
const ProductVariantMarketingRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    title: z.string().min(1).max(200),
    description: z.string().min(1),
    meta_title: z.string().max(200).optional(),
    meta_description: z.string().max(300).optional(),
    meta_keywords: z.string().max(200).optional(),
    slug: z
      .string()
      .min(1)
      .max(50)
      .regex(/^[-a-zA-Z0-9_]+$/),
    seo_image: z.instanceof(File).nullish(),
    seo_image_alt: z.string().max(200).optional(),
    gender: GenderEnum.optional(),
    age_group: z.union([AgeGroupEnum, BlankEnum]).optional(),
    variant: z.number().int(),
  })
  .passthrough();
const PatchedProductVariantMarketingRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    title: z.string().min(1).max(200),
    description: z.string().min(1),
    meta_title: z.string().max(200),
    meta_description: z.string().max(300),
    meta_keywords: z.string().max(200),
    slug: z
      .string()
      .min(1)
      .max(50)
      .regex(/^[-a-zA-Z0-9_]+$/),
    seo_image: z.instanceof(File).nullable(),
    seo_image_alt: z.string().max(200),
    gender: GenderEnum,
    age_group: z.union([AgeGroupEnum, BlankEnum]),
    variant: z.number().int(),
  })
  .partial()
  .passthrough();
const ProductVariantOffer = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    offer: z.string().max(100),
    start_date: z.string(),
    end_date: z.string(),
    ProductVariant_id: z.number().int(),
  })
  .passthrough();
const PaginatedProductVariantOfferList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(ProductVariantOffer),
  })
  .passthrough();
const ProductVariantOfferRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    offer: z.string().min(1).max(100),
    start_date: z.string(),
    end_date: z.string(),
    ProductVariant_id: z.number().int(),
  })
  .passthrough();
const PatchedProductVariantOfferRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    offer: z.string().min(1).max(100),
    start_date: z.string(),
    end_date: z.string(),
    ProductVariant_id: z.number().int(),
  })
  .partial()
  .passthrough();
const OrderFulfillmentItemRequest = z
  .object({ variant_id: z.number().int(), quantity: z.number().int() })
  .passthrough();
const OrderFulfillmentCheckRequestRequest = z
  .object({ items: z.array(OrderFulfillmentItemRequest) })
  .passthrough();
const VariantFulfillmentPlan = z
  .object({
    branch_id: z.number().int(),
    branch_name: z.string(),
    quantity: z.number().int(),
  })
  .passthrough();
const OrderFulfillmentCheckResponse = z
  .object({ variant_id: z.array(VariantFulfillmentPlan) })
  .passthrough();
const PricingPolicy = z
  .object({
    id: z.number().int(),
    name: z.string().max(100),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
  })
  .passthrough();
const PaginatedPricingPolicyList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(PricingPolicy),
  })
  .passthrough();
const PricingPolicyRequest = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
  })
  .passthrough();
const PatchedPricingPolicyRequest = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string(),
    is_active: z.boolean(),
  })
  .partial()
  .passthrough();
const ProductImage = z
  .object({
    id: z.number().int(),
    image: z.string().url(),
    alt_text: z.string().max(200).optional(),
    order: z.number().int().gte(0).lte(2147483647).optional(),
    is_primary: z.boolean().optional(),
    variant: z.number().int(),
  })
  .passthrough();
const PaginatedProductImageList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(ProductImage),
  })
  .passthrough();
const ProductImageRequest = z
  .object({
    image: z.instanceof(File),
    alt_text: z.string().max(200).optional(),
    order: z.number().int().gte(0).lte(2147483647).optional(),
    is_primary: z.boolean().optional(),
    variant: z.number().int(),
  })
  .passthrough();
const PatchedProductImageRequest = z
  .object({
    image: z.instanceof(File),
    alt_text: z.string().max(200),
    order: z.number().int().gte(0).lte(2147483647),
    is_primary: z.boolean(),
    variant: z.number().int(),
  })
  .partial()
  .passthrough();
const MainGroupEnum = z.enum(["CL", "SL", "FR", "AX", "OT", "DV"]);
const VariantTypeEnum = z.enum([
  "basic",
  "frames",
  "stockLenses",
  "rxLenses",
  "contactLenses",
  "custom",
]);
const Product = z
  .object({
    id: z.number().int(),
    brand_name: z.string(),
    manufacturer_name: z.string().nullable(),
    categories: z.array(Category),
    main_group_display: z.string(),
    variants: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    model: z.string().max(50),
    main_group: MainGroupEnum,
    name: z.string().max(200).optional(),
    description: z.string(),
    sku: z.string(),
    variant_type: VariantTypeEnum.optional(),
    manufacturer: z.number().int().nullish(),
    brand: z.number().int(),
  })
  .passthrough();
const PaginatedProductList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Product),
  })
  .passthrough();
const ProductRequest = z
  .object({
    categories_ids: z.array(z.number().int()),
    variants_input: z.array(z.object({}).partial().passthrough()).optional(),
    is_active: z.boolean().optional(),
    model: z.string().min(1).max(50),
    main_group: MainGroupEnum,
    name: z.string().max(200).optional(),
    variant_type: VariantTypeEnum.optional(),
    manufacturer: z.number().int().nullish(),
    brand: z.number().int(),
  })
  .passthrough();
const PatchedProductRequest = z
  .object({
    categories_ids: z.array(z.number().int()),
    variants_input: z.array(z.object({}).partial().passthrough()),
    is_active: z.boolean(),
    model: z.string().min(1).max(50),
    main_group: MainGroupEnum,
    name: z.string().max(200),
    variant_type: VariantTypeEnum,
    manufacturer: z.number().int().nullable(),
    brand: z.number().int(),
  })
  .partial()
  .passthrough();
const ProductImportSummary = z
  .object({
    created: z.number().int(),
    updated_or_skipped: z.number().int(),
    failed: z.number().int(),
  })
  .passthrough();
const ProductImportSuccessResponse = z
  .object({
    message: z.string(),
    summary: ProductImportSummary,
    errors: z.array(z.string()),
  })
  .passthrough();
const ProductImportBadRequest = z.object({ error: z.string() }).passthrough();
const ProductImportServerError = z.object({ detail: z.string() }).passthrough();
const PurchaseOrderItem = z
  .object({
    id: z.number().int(),
    variant_name: z.string(),
    variant_sku: z.string(),
    product_name: z.string(),
    line_total: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    remaining_quantity: z.number().int(),
    is_fully_received: z.boolean(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    quantity_ordered: z.number().int().gte(0).lte(2147483647),
    quantity_received: z.number().int(),
    unit_cost: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    notes: z.string().optional(),
    order: z.number().int(),
    variant: z.number().int(),
  })
  .passthrough();
const PurchaseOrderStatusEnum = z.enum([
  "draft",
  "submitted",
  "approved",
  "partially_received",
  "received",
  "cancelled",
]);
const PurchaseOrder = z
  .object({
    id: z.number().int(),
    supplier_name: z.string(),
    branch_name: z.string(),
    status_display: z.string(),
    created_by_name: z.string(),
    approved_by_name: z.string(),
    items: z.array(PurchaseOrderItem),
    items_count: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    order_number: z.string(),
    status: PurchaseOrderStatusEnum.optional(),
    order_date: z.string().optional(),
    expected_date: z.string().nullish(),
    received_date: z.string().datetime({ offset: true }).nullable(),
    approved_date: z.string().datetime({ offset: true }).nullable(),
    subtotal: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    tax_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    total_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    notes: z.string().optional(),
    supplier: z.number().int(),
    branch: z.number().int(),
    created_by: z.number().int().nullish(),
    approved_by: z.number().int().nullish(),
  })
  .passthrough();
const PaginatedPurchaseOrderList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(PurchaseOrder),
  })
  .passthrough();
const PurchaseOrderItemCreateRequest = z
  .object({
    variant: z.number().int(),
    quantity_ordered: z.number().int().gte(1),
    unit_cost: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    notes: z.string().optional().default(""),
  })
  .passthrough();
const PurchaseOrderCreateRequest = z
  .object({
    supplier: z.number().int(),
    branch: z.number().int(),
    order_date: z.string().optional(),
    expected_date: z.string().nullish(),
    notes: z.string().optional().default(""),
    items: z.array(PurchaseOrderItemCreateRequest),
  })
  .passthrough();
const PurchaseOrderRequest = z
  .object({
    is_active: z.boolean().optional(),
    status: PurchaseOrderStatusEnum.optional(),
    order_date: z.string().optional(),
    expected_date: z.string().nullish(),
    tax_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    notes: z.string().optional(),
    supplier: z.number().int(),
    branch: z.number().int(),
    created_by: z.number().int().nullish(),
    approved_by: z.number().int().nullish(),
  })
  .passthrough();
const PatchedPurchaseOrderRequest = z
  .object({
    is_active: z.boolean(),
    status: PurchaseOrderStatusEnum,
    order_date: z.string(),
    expected_date: z.string().nullable(),
    tax_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    notes: z.string(),
    supplier: z.number().int(),
    branch: z.number().int(),
    created_by: z.number().int().nullable(),
    approved_by: z.number().int().nullable(),
  })
  .partial()
  .passthrough();
const ReceiveItemsRequest = z
  .object({ items: z.array(z.object({}).partial().passthrough()).min(1) })
  .passthrough();
const ProductVariantQuestion = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    question: z.string(),
    ProductVariant_id: z.number().int(),
    asked_by: z.number().int(),
  })
  .passthrough();
const PaginatedProductVariantQuestionList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(ProductVariantQuestion),
  })
  .passthrough();
const ProductVariantQuestionRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    question: z.string().min(1),
    ProductVariant_id: z.number().int(),
    asked_by: z.number().int(),
  })
  .passthrough();
const PatchedProductVariantQuestionRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    question: z.string().min(1),
    ProductVariant_id: z.number().int(),
    asked_by: z.number().int(),
  })
  .partial()
  .passthrough();
const ProductVariantReview = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    rating: z.number().int().gte(0).lte(32767),
    review: z.string(),
    ProductVariant_id: z.number().int(),
    reviewed_by: z.number().int(),
  })
  .passthrough();
const PaginatedProductVariantReviewList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(ProductVariantReview),
  })
  .passthrough();
const ProductVariantReviewRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    rating: z.number().int().gte(0).lte(32767),
    review: z.string().min(1),
    ProductVariant_id: z.number().int(),
    reviewed_by: z.number().int(),
  })
  .passthrough();
const PatchedProductVariantReviewRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    rating: z.number().int().gte(0).lte(32767),
    review: z.string().min(1),
    ProductVariant_id: z.number().int(),
    reviewed_by: z.number().int(),
  })
  .partial()
  .passthrough();
const MovementTypeEnum = z.enum([
  "purchase",
  "sale",
  "transfer_in",
  "transfer_out",
  "adjustment",
  "damage",
  "return",
  "return_to_supplier",
  "reserve",
  "release",
]);
const StockMovement = z
  .object({
    id: z.number().int(),
    stock_info: z.string(),
    movement_type_display: z.string(),
    created_by_name: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    movement_type: MovementTypeEnum,
    quantity: z.number().int().gte(-2147483648).lte(2147483647),
    quantity_before: z.number().int(),
    quantity_after: z.number().int(),
    reference_number: z.string().max(50).optional(),
    notes: z.string().optional(),
    movement_date: z.string().datetime({ offset: true }),
    cost_per_unit: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    stock: z.number().int(),
    invoice: z.number().int().nullish(),
    purchase_order: z.number().int().nullish(),
    created_by: z.number().int().nullish(),
  })
  .passthrough();
const PaginatedStockMovementList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(StockMovement),
  })
  .passthrough();
const StockMovementCreateRequest = z
  .object({
    stock: z.number().int(),
    movement_type: MovementTypeEnum,
    quantity: z.number().int().gte(-2147483648).lte(2147483647),
    cost_per_unit: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    reference_number: z.string().max(50).optional(),
    notes: z.string().optional(),
  })
  .passthrough();
const StockMovementCreate = z
  .object({
    stock: z.number().int(),
    movement_type: MovementTypeEnum,
    quantity: z.number().int().gte(-2147483648).lte(2147483647),
    cost_per_unit: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    reference_number: z.string().max(50).optional(),
    notes: z.string().optional(),
  })
  .passthrough();
const StockMovementRequest = z
  .object({
    is_active: z.boolean().optional(),
    movement_type: MovementTypeEnum,
    quantity: z.number().int().gte(-2147483648).lte(2147483647),
    reference_number: z.string().max(50).optional(),
    notes: z.string().optional(),
    cost_per_unit: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    stock: z.number().int(),
    invoice: z.number().int().nullish(),
    purchase_order: z.number().int().nullish(),
    created_by: z.number().int().nullish(),
  })
  .passthrough();
const PatchedStockMovementRequest = z
  .object({
    is_active: z.boolean(),
    movement_type: MovementTypeEnum,
    quantity: z.number().int().gte(-2147483648).lte(2147483647),
    reference_number: z.string().max(50),
    notes: z.string(),
    cost_per_unit: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    stock: z.number().int(),
    invoice: z.number().int().nullable(),
    purchase_order: z.number().int().nullable(),
    created_by: z.number().int().nullable(),
  })
  .partial()
  .passthrough();
const StockTransferItem = z
  .object({
    id: z.number().int(),
    variant_name: z.string(),
    variant_sku: z.string(),
    product_name: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    quantity_requested: z.number().int().gte(0).lte(2147483647),
    quantity_sent: z.number().int(),
    quantity_received: z.number().int(),
    unit_cost: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    notes: z.string().optional(),
    transfer: z.number().int(),
    variant: z.number().int(),
  })
  .passthrough();
const PaginatedStockTransferItemList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(StockTransferItem),
  })
  .passthrough();
const StockTransferItemRequest = z
  .object({
    is_active: z.boolean().optional(),
    quantity_requested: z.number().int().gte(0).lte(2147483647),
    unit_cost: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    notes: z.string().optional(),
    transfer: z.number().int(),
    variant: z.number().int(),
  })
  .passthrough();
const PatchedStockTransferItemRequest = z
  .object({
    is_active: z.boolean(),
    quantity_requested: z.number().int().gte(0).lte(2147483647),
    unit_cost: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    notes: z.string(),
    transfer: z.number().int(),
    variant: z.number().int(),
  })
  .partial()
  .passthrough();
const StockTransferStatusEnum = z.enum([
  "pending",
  "submitted",
  "shipped",
  "received",
  "completed",
  "cancelled",
]);
const StockTransfer = z
  .object({
    id: z.number().int(),
    from_branch_name: z.string(),
    from_branch_code: z.string(),
    to_branch_name: z.string(),
    to_branch_code: z.string(),
    status_display: z.string(),
    items: z.array(StockTransferItem),
    items_count: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    transfer_number: z.string(),
    status: StockTransferStatusEnum.optional(),
    requested_by: z.string().max(100).optional(),
    approved_by: z.string().max(100).optional(),
    requested_date: z.string().datetime({ offset: true }),
    approved_date: z.string().datetime({ offset: true }).nullable(),
    shipped_date: z.string().datetime({ offset: true }).nullable(),
    received_date: z.string().datetime({ offset: true }).nullable(),
    notes: z.string().optional(),
    from_branch: z.number().int(),
    to_branch: z.number().int(),
  })
  .passthrough();
const PaginatedStockTransferList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(StockTransfer),
  })
  .passthrough();
const StockTransferCreateRequest = z
  .object({
    from_branch: z.number().int(),
    to_branch: z.number().int(),
    notes: z.string().optional(),
    items: z.array(z.object({}).partial().passthrough()).min(1),
  })
  .passthrough();
const StockTransferCreate = z
  .object({
    from_branch: z.number().int(),
    to_branch: z.number().int(),
    notes: z.string().optional(),
    items: z.array(z.object({}).partial().passthrough()).min(1),
  })
  .passthrough();
const StockTransferRequest = z
  .object({
    is_active: z.boolean().optional(),
    status: StockTransferStatusEnum.optional(),
    requested_by: z.string().max(100).optional(),
    approved_by: z.string().max(100).optional(),
    notes: z.string().optional(),
    from_branch: z.number().int(),
    to_branch: z.number().int(),
  })
  .passthrough();
const PatchedStockTransferRequest = z
  .object({
    is_active: z.boolean(),
    status: StockTransferStatusEnum,
    requested_by: z.string().max(100),
    approved_by: z.string().max(100),
    notes: z.string(),
    from_branch: z.number().int(),
    to_branch: z.number().int(),
  })
  .partial()
  .passthrough();
const PaginatedStockList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Stock),
  })
  .passthrough();
const StockRequest = z
  .object({
    is_active: z.boolean().optional(),
    quantity_in_stock: z.number().int().gte(0).lte(2147483647).optional(),
    reserved_quantity: z.number().int().gte(0).lte(2147483647).optional(),
    reorder_level: z.number().int().gte(0).lte(2147483647).optional(),
    max_stock_level: z.number().int().gte(0).lte(2147483647).optional(),
    min_stock_level: z.number().int().gte(0).lte(2147483647).optional(),
    average_cost: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    last_cost: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    allow_backorder: z.boolean().optional(),
    branch: z.number().int(),
    variant: z.number().int(),
  })
  .passthrough();
const PatchedStockRequest = z
  .object({
    is_active: z.boolean(),
    quantity_in_stock: z.number().int().gte(0).lte(2147483647),
    reserved_quantity: z.number().int().gte(0).lte(2147483647),
    reorder_level: z.number().int().gte(0).lte(2147483647),
    max_stock_level: z.number().int().gte(0).lte(2147483647),
    min_stock_level: z.number().int().gte(0).lte(2147483647),
    average_cost: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    last_cost: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    allow_backorder: z.boolean(),
    branch: z.number().int(),
    variant: z.number().int(),
  })
  .partial()
  .passthrough();
const StoreBranch = z
  .object({ id: z.number().int(), name: z.string() })
  .passthrough();
const PaginatedStoreBranchList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(StoreBranch),
  })
  .passthrough();
const Supplier = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    name: z.string().max(100),
    contact_person: z.string().max(100).optional(),
    email: z.string().max(254).email().optional(),
    phone: z.string().max(20).optional(),
    address: z.string().max(255).optional(),
    country: z.string().max(50).optional(),
    website: z.string().max(200).url().optional(),
    payment_terms: z.string().max(100).optional(),
  })
  .passthrough();
const PaginatedSupplierList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Supplier),
  })
  .passthrough();
const SupplierRequest = z
  .object({
    is_active: z.boolean().optional(),
    name: z.string().min(1).max(100),
    contact_person: z.string().max(100).optional(),
    email: z.string().max(254).email().optional(),
    phone: z.string().max(20).optional(),
    address: z.string().max(255).optional(),
    country: z.string().max(50).optional(),
    website: z.string().max(200).url().optional(),
    payment_terms: z.string().max(100).optional(),
  })
  .passthrough();
const PatchedSupplierRequest = z
  .object({
    is_active: z.boolean(),
    name: z.string().min(1).max(100),
    contact_person: z.string().max(100),
    email: z.string().max(254).email(),
    phone: z.string().max(20),
    address: z.string().max(255),
    country: z.string().max(50),
    website: z.string().max(200).url(),
    payment_terms: z.string().max(100),
  })
  .partial()
  .passthrough();
const ProductVariant = z
  .object({
    id: z.number().int(),
    product_name: z.string(),
    product_type_name: z.string(),
    product_type_code: z.string(),
    product_variant_type: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    factory_code: z.string().max(50).nullish(),
    sku: z.string(),
    description: z.string(),
    last_purchase_price: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullish(),
    selling_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    discount_percentage: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullish(),
    product: z.number().int(),
    product_type: z.number().int(),
    warranty: z.number().int().nullish(),
    weight: z.number().int().nullish(),
    dimensions: z.number().int().nullish(),
  })
  .passthrough();
const PaginatedProductVariantList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(ProductVariant),
  })
  .passthrough();
const CreateProductVariantRequest = z
  .object({
    variants_input: z.array(z.object({}).partial().passthrough()),
    is_active: z.boolean().nullable(),
    factory_code: z.string().max(50).nullable(),
    last_purchase_price: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullable(),
    selling_price: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullable(),
    discount_percentage: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullable(),
    product: z.number().int().nullable(),
    product_type: z.number().int().nullable(),
    warranty: z.number().int().nullable(),
    weight: z.number().int().nullable(),
    dimensions: z.number().int().nullable(),
  })
  .partial()
  .passthrough();
const CreateProductVariant = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }).nullable(),
    updated_at: z.string().datetime({ offset: true }).nullable(),
    is_active: z.boolean().nullish(),
    factory_code: z.string().max(50).nullish(),
    sku: z.string().nullable(),
    description: z.string().nullable(),
    last_purchase_price: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullish(),
    selling_price: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullish(),
    discount_percentage: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullish(),
    product: z.number().int().nullish(),
    product_type: z.number().int().nullish(),
    warranty: z.number().int().nullish(),
    weight: z.number().int().nullish(),
    dimensions: z.number().int().nullish(),
  })
  .passthrough();
const ProductVariantRequest = z
  .object({
    is_active: z.boolean().optional(),
    factory_code: z.string().max(50).nullish(),
    last_purchase_price: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullish(),
    selling_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    discount_percentage: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullish(),
    product_type: z.number().int(),
    warranty: z.number().int().nullish(),
    weight: z.number().int().nullish(),
    dimensions: z.number().int().nullish(),
  })
  .passthrough();
const PatchedProductVariantRequest = z
  .object({
    is_active: z.boolean(),
    factory_code: z.string().max(50).nullable(),
    last_purchase_price: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullable(),
    selling_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    discount_percentage: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullable(),
    product_type: z.number().int(),
    warranty: z.number().int().nullable(),
    weight: z.number().int().nullable(),
    dimensions: z.number().int().nullable(),
  })
  .partial()
  .passthrough();
const NearestBranchResponse = z
  .object({
    branch_id: z.number().int(),
    branch_name: z.string(),
    available: z.number(),
  })
  .passthrough();
const StockSummaryBranchInfo = z
  .object({
    branch: z.string(),
    stock: z.number(),
    available: z.number(),
    reserved: z.number(),
    status: z.string(),
  })
  .passthrough();
const VariantStockSummaryResponse = z
  .object({
    total_stock: z.number(),
    total_available: z.number(),
    total_reserved: z.number(),
    branches: z.array(StockSummaryBranchInfo),
    low_stock_branches: z.array(z.string()),
    out_of_stock_branches: z.array(z.string()),
  })
  .passthrough();
const VariantTotalStockResponse = z
  .object({ variant: z.number().int(), total_stock: z.number() })
  .passthrough();
const InstallmentStatusEnum = z.enum([
  "pending",
  "due",
  "paid",
  "overdue",
  "cancelled",
]);
const Installment = z
  .object({
    id: z.number().int(),
    payment: z.number().int(),
    installment_number: z.number().int(),
    amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    due_date: z.string(),
    status: InstallmentStatusEnum.optional(),
    status_display: z.string(),
    paid_at: z.string().datetime({ offset: true }).nullish(),
    paid_amount: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
  })
  .passthrough();
const PaginatedInstallmentList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Installment),
  })
  .passthrough();
const InstallmentRequest = z
  .object({
    due_date: z.string(),
    status: InstallmentStatusEnum.optional(),
    paid_at: z.string().datetime({ offset: true }).nullish(),
    paid_amount: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
  })
  .passthrough();
const PatchedInstallmentRequest = z
  .object({
    due_date: z.string(),
    status: InstallmentStatusEnum,
    paid_at: z.string().datetime({ offset: true }).nullable(),
    paid_amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
  })
  .partial()
  .passthrough();
const MarkInstallmentPaidRequestRequest = z
  .object({ amount: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/) })
  .passthrough();
const MarkInstallmentPaidResponse = z
  .object({ status: z.string(), message: z.string() })
  .passthrough();
const DamageItemRequestRequest = z
  .object({
    variant_id: z.number().int(),
    quantity: z.number().int(),
    reason: z.string().min(1),
  })
  .passthrough();
const CreateDamageRecordRequestRequest = z
  .object({
    branch_id: z.number().int(),
    items: z.array(DamageItemRequestRequest),
    reason: z.string().min(1).optional(),
  })
  .passthrough();
const CreateDamageRecordResponse = z
  .object({ status: z.string(), message: z.string() })
  .passthrough();
const InvoiceType = z
  .object({
    id: z.number().int(),
    name: z.string().max(100),
    code: z
      .string()
      .max(50)
      .regex(/^[-a-zA-Z0-9_]+$/),
    pricing_policy: PricingPolicy,
    revenue_account: ChartOfAccounts,
    is_active: z.boolean().optional(),
  })
  .passthrough();
const PaginatedInvoiceTypeList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(InvoiceType),
  })
  .passthrough();
const InvoiceTypeRequest = z
  .object({
    name: z.string().min(1).max(100),
    code: z
      .string()
      .min(1)
      .max(50)
      .regex(/^[-a-zA-Z0-9_]+$/),
    pricing_policy_id: z.number().int(),
    revenue_account_id: z.number().int(),
    is_active: z.boolean().optional(),
  })
  .passthrough();
const PatchedInvoiceTypeRequest = z
  .object({
    name: z.string().min(1).max(100),
    code: z
      .string()
      .min(1)
      .max(50)
      .regex(/^[-a-zA-Z0-9_]+$/),
    pricing_policy_id: z.number().int(),
    revenue_account_id: z.number().int(),
    is_active: z.boolean(),
  })
  .partial()
  .passthrough();
const InvoiceItem = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    quantity: z.number().int().gte(0).lte(2147483647).optional(),
    unit_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,4})?$/),
    discount_amount: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,4})?$/)
      .optional(),
    tax_percent: z
      .string()
      .regex(/^-?\d{0,1}(?:\.\d{0,4})?$/)
      .optional(),
    tax_amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,4})?$/),
    subtotal: z.string().regex(/^-?\d{0,8}(?:\.\d{0,4})?$/),
    total_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,4})?$/),
    product_variant: z.number().int().nullish(),
    invoice: z.number().int(),
  })
  .passthrough();
const InvoiceTypeCodeEnum = z.enum([
  "purchase",
  "sale",
  "return_purchase",
  "return_sale",
]);
const InvoiceStatusEnum = z.enum([
  "draft",
  "paid",
  "partially_paid",
  "overdue",
  "confirmed",
  "pending_clearance",
  "cleared",
  "rejected",
  "reported",
]);
const Invoice = z
  .object({
    id: z.number().int(),
    items: z.array(InvoiceItem),
    invoice_type_details: InvoiceType,
    insurance_details: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    subtotal: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    tax_rate: z
      .string()
      .regex(/^-?\d{0,1}(?:\.\d{0,4})?$/)
      .optional(),
    tax_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    discount_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    total_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    paid_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    patient_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    partner_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    invoice_number: z.string(),
    invoice_uuid: z.string().uuid().nullable(),
    zatca_tax_number: z.string().nullable(),
    previous_invoice_hash: z.string().nullable(),
    current_invoice_hash: z.string().nullable(),
    invoice_type_code: InvoiceTypeCodeEnum.optional(),
    pricing_policy_snapshot: z.unknown(),
    tax_snapshot: z.unknown(),
    currency: z.string().max(3).optional(),
    exchange_rate: z
      .string()
      .regex(/^-?\d{0,4}(?:\.\d{0,6})?$/)
      .optional(),
    total_amount_base: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    total_amount_foreign: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    due_date: z.string().nullish(),
    status: InvoiceStatusEnum,
    notes: z.string().nullish(),
    confirmed_at: z.string().datetime({ offset: true }).nullable(),
    branch: z.number().int().nullish(),
    customer: z.number().int().nullish(),
    partner: z.number().int().nullish(),
    invoice_type: z.number().int().nullish(),
    created_by: z.number().int().nullable(),
    order: z.number().int().nullish(),
    purchase_order: z.number().int().nullish(),
  })
  .passthrough();
const PaginatedInvoiceList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Invoice),
  })
  .passthrough();
const InvoiceItemRequest = z
  .object({
    is_active: z.boolean().optional(),
    quantity: z.number().int().gte(0).lte(2147483647).optional(),
    unit_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,4})?$/),
    discount_amount: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,4})?$/)
      .optional(),
    tax_percent: z
      .string()
      .regex(/^-?\d{0,1}(?:\.\d{0,4})?$/)
      .optional(),
    product_variant: z.number().int().nullish(),
  })
  .passthrough();
const InvoiceRequest = z
  .object({
    items: z.array(InvoiceItemRequest),
    is_active: z.boolean().optional(),
    tax_rate: z
      .string()
      .regex(/^-?\d{0,1}(?:\.\d{0,4})?$/)
      .optional(),
    discount_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    paid_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    patient_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    partner_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    invoice_type_code: InvoiceTypeCodeEnum.optional(),
    currency: z.string().min(1).max(3).optional(),
    exchange_rate: z
      .string()
      .regex(/^-?\d{0,4}(?:\.\d{0,6})?$/)
      .optional(),
    due_date: z.string().nullish(),
    notes: z.string().nullish(),
    branch: z.number().int().nullish(),
    customer: z.number().int().nullish(),
    partner: z.number().int().nullish(),
    invoice_type: z.number().int().nullish(),
    order: z.number().int().nullish(),
    purchase_order: z.number().int().nullish(),
  })
  .passthrough();
const PatchedInvoiceRequest = z
  .object({
    items: z.array(InvoiceItemRequest),
    is_active: z.boolean(),
    tax_rate: z.string().regex(/^-?\d{0,1}(?:\.\d{0,4})?$/),
    discount_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    paid_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    patient_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    partner_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    invoice_type_code: InvoiceTypeCodeEnum,
    currency: z.string().min(1).max(3),
    exchange_rate: z.string().regex(/^-?\d{0,4}(?:\.\d{0,6})?$/),
    due_date: z.string().nullable(),
    notes: z.string().nullable(),
    branch: z.number().int().nullable(),
    customer: z.number().int().nullable(),
    partner: z.number().int().nullable(),
    invoice_type: z.number().int().nullable(),
    order: z.number().int().nullable(),
    purchase_order: z.number().int().nullable(),
  })
  .partial()
  .passthrough();
const InvoiceTotalsResponse = z
  .object({
    subtotal: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    tax_amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    discount_amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    total: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const InvoiceConfirmResponse = z
  .object({ status: z.string(), message: z.string() })
  .passthrough();
const InvoiceChoicesResponse = z
  .object({
    invoice_type: z.object({}).partial().passthrough(),
    status: z.object({}).partial().passthrough(),
  })
  .passthrough();
const OrderItem = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    quantity: z.number().int().gte(0).lte(2147483647).optional(),
    unit_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,4})?$/),
    discount_amount: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,4})?$/)
      .optional(),
    tax_percent: z
      .string()
      .regex(/^-?\d{0,1}(?:\.\d{0,4})?$/)
      .optional(),
    tax_amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,4})?$/),
    subtotal: z.string().regex(/^-?\d{0,8}(?:\.\d{0,4})?$/),
    total_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,4})?$/),
    product_variant: z.number().int().nullish(),
    order: z.number().int(),
    prescription: z.number().int().nullish(),
  })
  .passthrough();
const OrderTypeEnum = z.enum([
  "cash",
  "credit",
  "insurance",
  "bnpl",
  "corporate",
  "wholesale",
]);
const OrderStatusEnum = z.enum([
  "pending",
  "confirmed",
  "ready",
  "delivered",
  "cancelled",
]);
const PaymentStatusEnum = z.enum([
  "pending",
  "partial",
  "paid",
  "refunded",
  "disputed",
]);
const Order = z
  .object({
    id: z.number().int(),
    items: z.array(OrderItem),
    remaining_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    payment_method_display: z.string(),
    insurance_details: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    subtotal: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    tax_rate: z
      .string()
      .regex(/^-?\d{0,1}(?:\.\d{0,4})?$/)
      .optional(),
    tax_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    discount_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    total_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    paid_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    patient_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    partner_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    order_type: OrderTypeEnum.optional(),
    order_number: z.string(),
    status: OrderStatusEnum.optional(),
    payment_status: PaymentStatusEnum.optional(),
    partner_share: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    customer_share: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    notes: z.string().optional(),
    internal_notes: z.string().optional(),
    confirmed_at: z.string().datetime({ offset: true }).nullable(),
    delivered_at: z.string().datetime({ offset: true }).nullable(),
    expected_delivery: z.string().datetime({ offset: true }).nullish(),
    branch: z.number().int().nullish(),
    customer: z.number().int().nullish(),
    payment_method: z.number().int().nullish(),
    partner: z.number().int().nullish(),
    customer_partner_link: z.number().int().nullish(),
    sales_person: z.number().int().nullish(),
  })
  .passthrough();
const PaginatedOrderList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Order),
  })
  .passthrough();
const OrderItemRequest = z
  .object({
    is_active: z.boolean().optional(),
    quantity: z.number().int().gte(0).lte(2147483647).optional(),
    unit_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,4})?$/),
    discount_amount: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,4})?$/)
      .optional(),
    tax_percent: z
      .string()
      .regex(/^-?\d{0,1}(?:\.\d{0,4})?$/)
      .optional(),
    product_variant: z.number().int().nullish(),
    prescription: z.number().int().nullish(),
  })
  .passthrough();
const OrderRequest = z
  .object({
    items: z.array(OrderItemRequest),
    is_active: z.boolean().optional(),
    tax_rate: z
      .string()
      .regex(/^-?\d{0,1}(?:\.\d{0,4})?$/)
      .optional(),
    discount_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    paid_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    patient_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    partner_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    order_type: OrderTypeEnum.optional(),
    status: OrderStatusEnum.optional(),
    payment_status: PaymentStatusEnum.optional(),
    partner_share: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    customer_share: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    notes: z.string().optional(),
    internal_notes: z.string().optional(),
    expected_delivery: z.string().datetime({ offset: true }).nullish(),
    branch: z.number().int().nullish(),
    customer: z.number().int().nullish(),
    payment_method: z.number().int().nullish(),
    partner: z.number().int().nullish(),
    customer_partner_link: z.number().int().nullish(),
    sales_person: z.number().int().nullish(),
  })
  .passthrough();
const ReturnItemRequestRequest = z
  .object({ order_item_id: z.number().int(), quantity: z.number().int() })
  .passthrough();
const CreateReturnRequestRequest = z
  .object({
    items: z.array(ReturnItemRequestRequest),
    reason: z.string().min(1).optional(),
  })
  .passthrough();
const CreateReturnResponse = z
  .object({
    status: z.string(),
    message: z.string(),
    invoice_number: z.string(),
    return_amount: z.string(),
  })
  .passthrough();
const PatchedOrderRequest = z
  .object({
    items: z.array(OrderItemRequest),
    is_active: z.boolean(),
    tax_rate: z.string().regex(/^-?\d{0,1}(?:\.\d{0,4})?$/),
    discount_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    paid_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    patient_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    partner_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    order_type: OrderTypeEnum,
    status: OrderStatusEnum,
    payment_status: PaymentStatusEnum,
    partner_share: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    customer_share: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    notes: z.string(),
    internal_notes: z.string(),
    expected_delivery: z.string().datetime({ offset: true }).nullable(),
    branch: z.number().int().nullable(),
    customer: z.number().int().nullable(),
    payment_method: z.number().int().nullable(),
    partner: z.number().int().nullable(),
    customer_partner_link: z.number().int().nullable(),
    sales_person: z.number().int().nullable(),
  })
  .partial()
  .passthrough();
const OrderTotalsResponse = z
  .object({
    subtotal: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    tax_amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    discount_amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    total: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const OrderCancelResponse = z
  .object({ status: z.string(), message: z.string() })
  .passthrough();
const OrderConfirmResponse = z
  .object({ status: z.string(), message: z.string() })
  .passthrough();
const OrderDeliverResponse = z
  .object({
    status: z.string(),
    message: z.string(),
    invoice_number: z.string(),
  })
  .passthrough();
const OrderReadyResponse = z
  .object({ status: z.string(), message: z.string() })
  .passthrough();
const OrderBulkUpdateStatusRequestStatusEnum = z.enum([
  "confirmed",
  "ready",
  "delivered",
  "cancelled",
]);
const OrderBulkUpdateStatusRequestRequest = z
  .object({
    ids: z.array(z.number().int()),
    status: OrderBulkUpdateStatusRequestStatusEnum,
  })
  .passthrough();
const OrderBulkUpdateStatusResponse = z
  .object({
    status: z.string(),
    message: z.string(),
    updated_count: z.number().int(),
    errors: z.array(z.string()),
  })
  .passthrough();
const OrderChoicesResponse = z
  .object({
    order_type: z.object({}).partial().passthrough(),
    payment_method: z.object({}).partial().passthrough(),
    status: z.object({}).partial().passthrough(),
    payment_status: z.object({}).partial().passthrough(),
  })
  .passthrough();
const PaymentMethod = z
  .object({
    id: z.number().int(),
    name_ar: z.string().max(100),
    name_en: z.string().max(100),
    code: z
      .string()
      .max(50)
      .regex(/^[-a-zA-Z0-9_]+$/),
    is_active: z.boolean().optional(),
    icon: z.string().url().nullish(),
    provider_fees_percent: z
      .string()
      .regex(/^-?\d{0,3}(?:\.\d{0,2})?$/)
      .optional(),
    is_installment: z.boolean().optional(),
    gl_account: z.number().int().nullish(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PaginatedPaymentMethodList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(PaymentMethod),
  })
  .passthrough();
const PaymentMethodRequest = z
  .object({
    name_ar: z.string().min(1).max(100),
    name_en: z.string().min(1).max(100),
    code: z
      .string()
      .min(1)
      .max(50)
      .regex(/^[-a-zA-Z0-9_]+$/),
    is_active: z.boolean().optional(),
    icon: z.instanceof(File).nullish(),
    provider_fees_percent: z
      .string()
      .regex(/^-?\d{0,3}(?:\.\d{0,2})?$/)
      .optional(),
    is_installment: z.boolean().optional(),
    gl_account: z.number().int().nullish(),
  })
  .passthrough();
const PatchedPaymentMethodRequest = z
  .object({
    name_ar: z.string().min(1).max(100),
    name_en: z.string().min(1).max(100),
    code: z
      .string()
      .min(1)
      .max(50)
      .regex(/^[-a-zA-Z0-9_]+$/),
    is_active: z.boolean(),
    icon: z.instanceof(File).nullable(),
    provider_fees_percent: z.string().regex(/^-?\d{0,3}(?:\.\d{0,2})?$/),
    is_installment: z.boolean(),
    gl_account: z.number().int().nullable(),
  })
  .partial()
  .passthrough();
const StatusB5aEnum = z.enum([
  "pending",
  "partial",
  "paid",
  "refunded",
  "disputed",
]);
const PaymentList = z
  .object({
    id: z.number().int(),
    amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    currency: z.string().max(3).optional(),
    payment_method: z.number().int().nullish(),
    payment_method_display: z.string(),
    status: StatusB5aEnum.optional(),
    status_display: z.string(),
    is_installment: z.boolean().optional(),
    paid_at: z.string().datetime({ offset: true }).nullish(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PaginatedPaymentListList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(PaymentList),
  })
  .passthrough();
const PaymentCreateRequest = z
  .object({
    invoice: z.number().int().nullish(),
    order: z.number().int().nullish(),
    amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    currency: z.string().min(1).max(3).optional(),
    payment_method: z.number().int().nullish(),
    partner: z.number().int().nullish(),
    is_installment: z.boolean().optional(),
    installments_count: z.number().int().gte(0).lte(2147483647).optional(),
    card_last_four: z.string().max(4).optional(),
    card_brand: z.string().max(20).optional(),
    cheque_number: z.string().max(50).optional(),
    cheque_bank: z.string().max(100).optional(),
    cheque_date: z.string().nullish(),
    transfer_reference: z.string().max(100).optional(),
    transfer_bank: z.string().max(100).optional(),
    notes: z.string().optional(),
  })
  .passthrough();
const PaymentCreate = z
  .object({
    invoice: z.number().int().nullish(),
    order: z.number().int().nullish(),
    amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    currency: z.string().max(3).optional(),
    payment_method: z.number().int().nullish(),
    partner: z.number().int().nullish(),
    is_installment: z.boolean().optional(),
    installments_count: z.number().int().gte(0).lte(2147483647).optional(),
    card_last_four: z.string().max(4).optional(),
    card_brand: z.string().max(20).optional(),
    cheque_number: z.string().max(50).optional(),
    cheque_bank: z.string().max(100).optional(),
    cheque_date: z.string().nullish(),
    transfer_reference: z.string().max(100).optional(),
    transfer_bank: z.string().max(100).optional(),
    notes: z.string().optional(),
  })
  .passthrough();
const PaymentAllocation = z
  .object({
    id: z.number().int(),
    invoice: z.number().int(),
    invoice_number: z.string(),
    invoice_item: z.number().int().nullish(),
    amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const Payment = z
  .object({
    id: z.number().int(),
    invoice: z.number().int().nullish(),
    invoice_number: z.string(),
    order: z.number().int().nullish(),
    order_number: z.string(),
    amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    amount_base: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    amount_foreign: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    currency: z.string().max(3).optional(),
    exchange_rate: z
      .string()
      .regex(/^-?\d{0,4}(?:\.\d{0,6})?$/)
      .optional(),
    payment_method: z.number().int().nullish(),
    payment_method_display: z.string(),
    payment_method_name_en: z.string(),
    payment_method_code: z.string(),
    status: StatusB5aEnum.optional(),
    status_display: z.string(),
    payer_content_type: z.number().int().nullish(),
    payer_object_id: z.number().int().gte(0).lte(2147483647).nullish(),
    partner: z.number().int().nullish(),
    partner_name: z.string(),
    gateway_transaction_id: z.string(),
    gateway_reference: z.string().max(100).optional(),
    is_installment: z.boolean().optional(),
    installments_count: z.number().int().gte(0).lte(2147483647).optional(),
    installment_amount: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullish(),
    bnpl_order_id: z.string().max(100).optional(),
    card_last_four: z.string().max(4).optional(),
    card_brand: z.string().max(20).optional(),
    cheque_number: z.string().max(50).optional(),
    cheque_bank: z.string().max(100).optional(),
    cheque_date: z.string().nullish(),
    transfer_reference: z.string().max(100).optional(),
    transfer_bank: z.string().max(100).optional(),
    paid_at: z.string().datetime({ offset: true }).nullable(),
    refunded_at: z.string().datetime({ offset: true }).nullable(),
    refund_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    notes: z.string().optional(),
    installments: z.string(),
    allocations: z.array(PaymentAllocation),
    created_by: z.number().int().nullable(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PaymentRequest = z
  .object({
    invoice: z.number().int().nullish(),
    order: z.number().int().nullish(),
    amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    amount_base: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    amount_foreign: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    currency: z.string().min(1).max(3).optional(),
    exchange_rate: z
      .string()
      .regex(/^-?\d{0,4}(?:\.\d{0,6})?$/)
      .optional(),
    payment_method: z.number().int().nullish(),
    status: StatusB5aEnum.optional(),
    payer_content_type: z.number().int().nullish(),
    payer_object_id: z.number().int().gte(0).lte(2147483647).nullish(),
    partner: z.number().int().nullish(),
    gateway_reference: z.string().max(100).optional(),
    is_installment: z.boolean().optional(),
    installments_count: z.number().int().gte(0).lte(2147483647).optional(),
    installment_amount: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullish(),
    bnpl_order_id: z.string().max(100).optional(),
    card_last_four: z.string().max(4).optional(),
    card_brand: z.string().max(20).optional(),
    cheque_number: z.string().max(50).optional(),
    cheque_bank: z.string().max(100).optional(),
    cheque_date: z.string().nullish(),
    transfer_reference: z.string().max(100).optional(),
    transfer_bank: z.string().max(100).optional(),
    refund_amount: z
      .string()
      .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
      .optional(),
    notes: z.string().optional(),
  })
  .passthrough();
const PatchedPaymentRequest = z
  .object({
    invoice: z.number().int().nullable(),
    order: z.number().int().nullable(),
    amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    amount_base: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    amount_foreign: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    currency: z.string().min(1).max(3),
    exchange_rate: z.string().regex(/^-?\d{0,4}(?:\.\d{0,6})?$/),
    payment_method: z.number().int().nullable(),
    status: StatusB5aEnum,
    payer_content_type: z.number().int().nullable(),
    payer_object_id: z.number().int().gte(0).lte(2147483647).nullable(),
    partner: z.number().int().nullable(),
    gateway_reference: z.string().max(100),
    is_installment: z.boolean(),
    installments_count: z.number().int().gte(0).lte(2147483647),
    installment_amount: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullable(),
    bnpl_order_id: z.string().max(100),
    card_last_four: z.string().max(4),
    card_brand: z.string().max(20),
    cheque_number: z.string().max(50),
    cheque_bank: z.string().max(100),
    cheque_date: z.string().nullable(),
    transfer_reference: z.string().max(100),
    transfer_bank: z.string().max(100),
    refund_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    notes: z.string(),
  })
  .partial()
  .passthrough();
const MarkCompletedRequestRequest = z
  .object({ transaction_id: z.string().min(1) })
  .partial()
  .passthrough();
const MarkCompletedResponse = z
  .object({ status: z.string(), message: z.string() })
  .passthrough();
const MarkFailedRequestRequest = z
  .object({ reason: z.string().min(1) })
  .partial()
  .passthrough();
const MarkFailedResponse = z
  .object({ status: z.string(), message: z.string() })
  .passthrough();
const PaymentRefundRequest = z
  .object({
    amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    reason: z.string().min(1).max(500),
  })
  .partial()
  .passthrough();
const RefundResponse = z
  .object({
    status: z.string(),
    message: z.string(),
    refunded_amount: z.string(),
  })
  .passthrough();
const BNPLCallbackResponse = z.object({ status: z.string() }).passthrough();
const PaymentChoices = z
  .object({
    payment_methods: z.object({}).partial().passthrough(),
    payment_status: z.object({}).partial().passthrough(),
  })
  .passthrough();
const GatewayEnum = z.enum(["tabby", "tamara"]);
const BNPLSessionRequestRequest = z
  .object({
    order_id: z.number().int(),
    gateway: GatewayEnum,
    installments_count: z.number().int().gte(2).lte(12).optional().default(4),
    success_url: z.string().min(1).url(),
    cancel_url: z.string().min(1).url(),
    failure_url: z.string().min(1).url(),
    webhook_url: z.string().min(1).url().optional(),
  })
  .passthrough();
const BNPLSessionResponse = z
  .object({
    success: z.boolean(),
    checkout_url: z.string().url(),
    session_id: z.string(),
    payment_id: z.number().int(),
    gateway: z.string(),
    installments: z.array(z.unknown()).optional(),
  })
  .passthrough();
const PaymentTotal = z
  .object({
    amount: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    count: z.number().int(),
  })
  .passthrough();
const InstallmentSummary = z
  .object({
    amount: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    count: z.number().int(),
  })
  .passthrough();
const PaymentSummaryResponse = z
  .object({
    period: z.string(),
    total: PaymentTotal,
    by_method: z.array(z.unknown()),
    installments: InstallmentSummary,
  })
  .passthrough();
const BranchComparisonResponse = z
  .object({
    branch_id: z.number().int(),
    branch_name: z.string(),
    orders_count: z.number().int(),
    total_revenue: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    avg_order: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const FinancialDashboardSales = z
  .object({
    invoices_count: z.number().int(),
    gross_total: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    tax_collected: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    discounts_given: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    net_total: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    amount_received: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    pending_amount: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const FinancialDashboardPurchases = z
  .object({
    invoices_count: z.number().int(),
    total: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    paid: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const FinancialDashboardReturns = z
  .object({
    count: z.number().int(),
    total: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const FinancialDashboardPaymentsByMethod = z
  .object({
    cash: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    card: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const FinancialDashboardPayments = z
  .object({
    total: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    by_method: FinancialDashboardPaymentsByMethod,
  })
  .passthrough();
const FinancialDashboardReservedInv = z
  .object({
    quantity: z.number().int(),
    estimated_value: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const FinancialDashboardResponse = z
  .object({
    period: z.string(),
    from_date: z.string(),
    sales: FinancialDashboardSales,
    purchases: FinancialDashboardPurchases,
    returns: FinancialDashboardReturns,
    payments: FinancialDashboardPayments,
    reserved_inventory: FinancialDashboardReservedInv,
  })
  .passthrough();
const InventorySummaryResponse = z
  .object({
    total_items: z.number().int(),
    total_quantity: z.number().int(),
    total_reserved: z.number().int(),
    total_value: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    low_stock_count: z.number().int(),
    out_of_stock_count: z.number().int(),
  })
  .passthrough();
const PendingOrdersByStatus = z
  .object({
    status: z.string(),
    count: z.number().int(),
    total_value: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    paid_amount: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const PendingOrdersTotal = z
  .object({
    count: z.number().int(),
    total_value: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    reserved_items: z.number().int(),
  })
  .passthrough();
const PendingOrdersResponse = z
  .object({
    by_status: z.array(PendingOrdersByStatus),
    total: PendingOrdersTotal,
  })
  .passthrough();
const AgingBucketCurrent = z
  .object({
    days: z.string(),
    count: z.number().int(),
    amount: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const AgingBucket3160 = z
  .object({
    days: z.string(),
    count: z.number().int(),
    amount: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const AgingBucket6190 = z
  .object({
    days: z.string(),
    count: z.number().int(),
    amount: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const AgingBucket90Plus = z
  .object({
    days: z.string(),
    count: z.number().int(),
    amount: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const AgingBuckets = z
  .object({
    current: AgingBucketCurrent,
    days_31_60: AgingBucket3160,
    days_61_90: AgingBucket6190,
    over_90: AgingBucket90Plus,
  })
  .passthrough();
const ReceivablesAgingResponse = z
  .object({
    aging: AgingBuckets,
    total_pending: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    invoices_count: z.number().int(),
  })
  .passthrough();
const SalesByDateResponse = z
  .object({
    date: z.string(),
    orders_count: z.number().int(),
    revenue: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const SalesSummaryPayments = z
  .object({
    total: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    cash: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    card: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const SalesSummaryResponse = z
  .object({
    total_orders: z.number().int(),
    total_revenue: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    total_tax: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    total_discount: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    avg_order_value: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    payments: SalesSummaryPayments,
  })
  .passthrough();
const StockMovementByType = z
  .object({
    movement_type: z.string(),
    count: z.number().int(),
    total_quantity: z.number().int(),
  })
  .passthrough();
const StockMovementsReportResponse = z
  .object({
    by_type: z.array(StockMovementByType),
    total_movements: z.number().int(),
  })
  .passthrough();
const TopProductsResponse = z
  .object({
    product_variant_id: z.number().int(),
    product_name: z.string(),
    variant_name: z.string(),
    total_sold: z.number().int(),
    total_revenue: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const CreateOrderItemRequestRequest = z
  .object({ variant_id: z.number().int(), quantity: z.number().int() })
  .passthrough();
const CreateWholesaleOrderRequestRequest = z
  .object({
    customer_id: z.number().int(),
    branch_id: z.number().int(),
    items: z.array(CreateOrderItemRequestRequest),
    payment_method: z.string().min(1).optional(),
    notes: z.string().min(1).optional(),
  })
  .passthrough();
const CreatedOrderInfo = z
  .object({
    id: z.number().int(),
    order_number: z.string(),
    total_amount: z.string(),
    discount_amount: z.string(),
    status: z.string(),
  })
  .passthrough();
const CreateWholesaleOrderResponse = z
  .object({ status: z.string(), message: z.string(), order: CreatedOrderInfo })
  .passthrough();
const UpdateCustomerCreditRequestRequest = z
  .object({
    credit_limit: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    credit_status: z.string().min(1),
    payment_terms_days: z.number().int(),
    pricing_tier: z.string().min(1),
    default_discount_percentage: z.string().regex(/^-?\d{0,3}(?:\.\d{0,2})?$/),
  })
  .partial()
  .passthrough();
const UpdatedCreditCustomer = z
  .object({
    id: z.number().int(),
    credit_limit: z.string(),
    credit_status: z.string(),
    pricing_tier: z.string(),
    available_credit: z.string(),
  })
  .passthrough();
const UpdateCustomerCreditResponse = z
  .object({
    status: z.string(),
    message: z.string(),
    customer: UpdatedCreditCustomer,
  })
  .passthrough();
const StatementCustomerInfo = z
  .object({
    id: z.number().int(),
    name: z.string(),
    credit_limit: z.string(),
    current_balance: z.string(),
  })
  .passthrough();
const StatementPeriod = z
  .object({
    start_date: z.string().nullable(),
    end_date: z.string().nullable(),
  })
  .passthrough();
const StatementTransaction = z
  .object({
    date: z.string(),
    type: z.string(),
    reference: z.string(),
    debit: z.string(),
    credit: z.string(),
    balance: z.string(),
  })
  .passthrough();
const StatementSummary = z
  .object({ total_invoices: z.string(), total_payments: z.string() })
  .passthrough();
const CustomerStatementResponse = z
  .object({
    customer: StatementCustomerInfo,
    period: StatementPeriod,
    opening_balance: z.string(),
    transactions: z.array(StatementTransaction),
    closing_balance: z.string(),
    summary: StatementSummary,
  })
  .passthrough();
const WholesaleCustomer = z
  .object({
    id: z.number().int(),
    first_name: z.string(),
    last_name: z.string(),
    customer_type: z.string(),
    pricing_tier: z.string(),
    credit_limit: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    current_balance: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
    credit_status: z.string(),
    payment_terms_days: z.number().int(),
    minimum_order_amount: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/),
  })
  .passthrough();
const DashboardMonthStats = z
  .object({
    orders_count: z.number().int(),
    total_sales: z.string(),
    total_discount: z.string(),
  })
  .passthrough();
const DashboardTopCustomer = z
  .object({
    customer_id: z.number().int(),
    name: z.string(),
    total: z.string(),
    orders_count: z.number().int(),
  })
  .passthrough();
const DashboardReceivables = z
  .object({ total: z.string(), customers_count: z.number().int() })
  .passthrough();
const WholesaleDashboardResponse = z
  .object({
    month_stats: DashboardMonthStats,
    top_customers: z.array(DashboardTopCustomer),
    receivables: DashboardReceivables,
    overdue_count: z.number().int(),
  })
  .passthrough();
const PricingItemRequestRequest = z
  .object({ variant_id: z.number().int(), quantity: z.number().int() })
  .passthrough();
const GetWholesalePricingRequestRequest = z
  .object({
    customer_id: z.number().int(),
    items: z.array(PricingItemRequestRequest),
    branch_id: z.number().int().optional(),
  })
  .passthrough();
const PricingCustomerInfo = z
  .object({
    id: z.number().int(),
    name: z.string(),
    pricing_tier: z.string(),
    pricing_tier_display: z.string(),
    default_discount: z.string(),
  })
  .passthrough();
const PricingResponseItem = z
  .object({
    variant_id: z.number().int(),
    variant_name: z.string(),
    quantity: z.number().int(),
    original_price: z.string(),
    unit_price: z.string(),
    discount_type: z.string(),
    discount_source: z.string(),
    line_discount: z.string(),
    line_total: z.string(),
  })
  .passthrough();
const GetWholesalePricingResponse = z
  .object({
    customer: PricingCustomerInfo,
    items: z.array(PricingResponseItem),
    subtotal: z.string(),
    line_discounts: z.string(),
    customer_discount: z.string(),
    total_discount: z.string(),
    final_total: z.string(),
  })
  .passthrough();
const ValidateItemRequestRequest = z
  .object({ variant_id: z.number().int(), quantity: z.number().int() })
  .passthrough();
const ValidateWholesaleOrderRequestRequest = z
  .object({
    customer_id: z.number().int(),
    items: z.array(ValidateItemRequestRequest),
    use_credit: z.boolean().optional(),
  })
  .passthrough();
const CustomerCreditInfo = z
  .object({
    credit_limit: z.string(),
    current_balance: z.string(),
    available_credit: z.string(),
    credit_status: z.string(),
  })
  .passthrough();
const ValidateWholesaleOrderResponse = z
  .object({
    is_valid: z.boolean(),
    errors: z.array(z.string()),
    customer_credit: CustomerCreditInfo.nullable(),
  })
  .passthrough();
const ActivationSuccessResponse = z
  .object({ detail: z.string() })
  .passthrough();
const ActivationErrorResponse = z.object({ detail: z.string() }).passthrough();
const CurrencyEnum = z.enum(["usd", "egp", "sar", "aud", "eur"]);
const SubscriptionPlan = z
  .object({
    id: z.number().int(),
    name: z.string().max(50),
    duration_months: z.number().int().gte(0).lte(2147483647).optional(),
    duration_years: z.number().int().gte(0).lte(2147483647).optional(),
    max_users: z.number().int().gte(0).lte(2147483647).optional(),
    max_branches: z.number().int().gte(0).lte(2147483647).optional(),
    max_products: z.number().int().gte(0).lte(2147483647).optional(),
    month_price: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    year_price: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    has_hr_module: z.boolean().optional(),
    has_inventory_module: z.boolean().optional(),
    has_eye_test_module: z.boolean().optional(),
    has_crm_module: z.boolean().optional(),
    currency: CurrencyEnum.optional(),
    discount: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    field_labels: z.string(),
  })
  .passthrough();
const Client = z
  .object({
    id: z.number().int(),
    name: z.string().max(100),
    max_users: z.number().int().gte(-2147483648).lte(2147483647).optional(),
    max_products: z.number().int().gte(-2147483648).lte(2147483647).optional(),
    max_branches: z.number().int().gte(-2147483648).lte(2147483647).optional(),
    paid_until: z.string().nullish(),
    on_trial: z.boolean().optional(),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    uuid: z.string().uuid(),
    created_at: z.string().datetime({ offset: true }),
    plans: SubscriptionPlan,
    is_paid: z.string(),
    is_plan_expired: z.string(),
    field_labels: z.string(),
  })
  .passthrough();
const PaginatedClientList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Client),
  })
  .passthrough();
const ClientRequest = z
  .object({
    name: z.string().min(1).max(100),
    max_users: z.number().int().gte(-2147483648).lte(2147483647).optional(),
    max_products: z.number().int().gte(-2147483648).lte(2147483647).optional(),
    max_branches: z.number().int().gte(-2147483648).lte(2147483647).optional(),
    paid_until: z.string().nullish(),
    on_trial: z.boolean().optional(),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
  })
  .passthrough();
const PatchedClientRequest = z
  .object({
    name: z.string().min(1).max(100),
    max_users: z.number().int().gte(-2147483648).lte(2147483647),
    max_products: z.number().int().gte(-2147483648).lte(2147483647),
    max_branches: z.number().int().gte(-2147483648).lte(2147483647),
    paid_until: z.string().nullable(),
    on_trial: z.boolean(),
    is_active: z.boolean(),
    is_deleted: z.boolean(),
  })
  .partial()
  .passthrough();
const DirectionEnum = z.enum(["month", "year"]);
const MethodEnum = z.enum([
  "credit_card",
  "bank_transfer",
  "paypal",
  "stripe",
  "manual",
  "another",
]);
const CreatePaymentOrderRequest = z
  .object({
    client_id: z.string().uuid(),
    plan_id: z.number().int(),
    direction: DirectionEnum,
    method: MethodEnum,
  })
  .passthrough();
const CreatePaymentOrderResponse = z
  .object({ approval_url: z.string().url(), order_id: z.string() })
  .passthrough();
const CreatePaymentErrorResponse = z
  .object({ detail: z.string() })
  .passthrough();
const Domain = z
  .object({
    id: z.number().int(),
    domain: z.string().max(253),
    is_primary: z.boolean().optional(),
    tenant: z.number().int(),
  })
  .passthrough();
const PaginatedDomainList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Domain),
  })
  .passthrough();
const DomainRequest = z
  .object({
    domain: z.string().min(1).max(253),
    is_primary: z.boolean().optional(),
    tenant: z.number().int(),
  })
  .passthrough();
const PatchedDomainRequest = z
  .object({
    domain: z.string().min(1).max(253),
    is_primary: z.boolean(),
    tenant: z.number().int(),
  })
  .partial()
  .passthrough();
const PaymentDetail = z
  .object({
    id: z.number().int(),
    amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    currency: z.string(),
    status: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    method: z.string(),
    direction: z.string(),
    transaction_id: z.string(),
    client: z.number().int(),
    plan_name: z.string(),
  })
  .passthrough();
const PaymentListResponse = z
  .object({ results: z.array(PaymentDetail), count: z.number().int() })
  .passthrough();
const PayPalExecuteRequestRequest = z
  .object({
    order_id: z.string().min(1),
    plan_id: z.number().int(),
    client_id: z.string().uuid(),
    direction: z.string().min(1),
  })
  .passthrough();
const PayPalExecuteSuccessResponse = z
  .object({ detail: z.string(), payment_id: z.number().int() })
  .passthrough();
const PayPalExecuteErrorResponse = z
  .object({ detail: z.string() })
  .passthrough();
const WebhookResponse = z.object({ status: z.string() }).passthrough();
const RegisterTenantRequest = z
  .object({
    name: z.string().min(1).max(100),
    email: z.string().min(1).email(),
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/),
  })
  .passthrough();
const RegisterTenantSuccessResponse = z
  .object({ detail: z.string() })
  .passthrough();
const RegisterTenantErrorResponse = z
  .object({ detail: z.string() })
  .passthrough();
const RegisterTenant = z
  .object({ name: z.string().max(100), email: z.string().email() })
  .passthrough();
const PaginatedRegisterTenantList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(RegisterTenant),
  })
  .passthrough();
const PatchedRegisterTenantRequest = z
  .object({
    name: z.string().min(1).max(100),
    email: z.string().min(1).email(),
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/),
  })
  .partial()
  .passthrough();
const PublicTenantSettings = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    business_name: z.string().max(255).optional(),
    description: z.string().optional(),
    facebook: z.string().max(200).url().optional(),
    instagram: z.string().max(200).url().optional(),
    whatsapp: z.string().max(20).optional(),
    twitter: z.string().max(200).url().optional(),
    tiktok: z.string().max(200).url().optional(),
    linkedin: z.string().max(200).url().optional(),
    phone: z.string().max(20).optional(),
    email: z.string().max(254).email().optional(),
    website: z.string().max(200).url().optional(),
    seo_title: z.string().max(255).optional(),
    seo_description: z.string().optional(),
    seo_keywords: z.string().max(255).optional(),
    address: z.string().max(255).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    postal_code: z.string().max(20).optional(),
    country: z.string().max(100).optional(),
  })
  .passthrough();
const PaginatedPublicTenantSettingsList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(PublicTenantSettings),
  })
  .passthrough();
const PublicTenantSettingsRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    business_name: z.string().min(1).max(255),
    description: z.string(),
    facebook: z.string().max(200).url(),
    instagram: z.string().max(200).url(),
    whatsapp: z.string().max(20),
    twitter: z.string().max(200).url(),
    tiktok: z.string().max(200).url(),
    linkedin: z.string().max(200).url(),
    phone: z.string().max(20),
    email: z.string().max(254).email(),
    website: z.string().max(200).url(),
    seo_title: z.string().max(255),
    seo_description: z.string(),
    seo_keywords: z.string().max(255),
    address: z.string().max(255),
    city: z.string().max(100),
    state: z.string().max(100),
    postal_code: z.string().max(20),
    country: z.string().max(100),
  })
  .partial()
  .passthrough();
const PatchedPublicTenantSettingsRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    business_name: z.string().min(1).max(255),
    description: z.string(),
    facebook: z.string().max(200).url(),
    instagram: z.string().max(200).url(),
    whatsapp: z.string().max(20),
    twitter: z.string().max(200).url(),
    tiktok: z.string().max(200).url(),
    linkedin: z.string().max(200).url(),
    phone: z.string().max(20),
    email: z.string().max(254).email(),
    website: z.string().max(200).url(),
    seo_title: z.string().max(255),
    seo_description: z.string(),
    seo_keywords: z.string().max(255),
    address: z.string().max(255),
    city: z.string().max(100),
    state: z.string().max(100),
    postal_code: z.string().max(20),
    country: z.string().max(100),
  })
  .partial()
  .passthrough();
const PaginatedSubscriptionPlanList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(SubscriptionPlan),
  })
  .passthrough();
const SubscriptionPlanRequest = z
  .object({
    name: z.string().min(1).max(50),
    duration_months: z.number().int().gte(0).lte(2147483647).optional(),
    duration_years: z.number().int().gte(0).lte(2147483647).optional(),
    max_users: z.number().int().gte(0).lte(2147483647).optional(),
    max_branches: z.number().int().gte(0).lte(2147483647).optional(),
    max_products: z.number().int().gte(0).lte(2147483647).optional(),
    month_price: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    year_price: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    has_hr_module: z.boolean().optional(),
    has_inventory_module: z.boolean().optional(),
    has_eye_test_module: z.boolean().optional(),
    has_crm_module: z.boolean().optional(),
    currency: CurrencyEnum.optional(),
    discount: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
  })
  .passthrough();
const PatchedSubscriptionPlanRequest = z
  .object({
    name: z.string().min(1).max(50),
    duration_months: z.number().int().gte(0).lte(2147483647),
    duration_years: z.number().int().gte(0).lte(2147483647),
    max_users: z.number().int().gte(0).lte(2147483647),
    max_branches: z.number().int().gte(0).lte(2147483647),
    max_products: z.number().int().gte(0).lte(2147483647),
    month_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    year_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    has_hr_module: z.boolean(),
    has_inventory_module: z.boolean(),
    has_eye_test_module: z.boolean(),
    has_crm_module: z.boolean(),
    currency: CurrencyEnum,
    discount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
  })
  .partial()
  .passthrough();
const HealthResponse = z.object({ status: z.string() }).passthrough();
const LoginRequest = z
  .object({ username: z.string().min(1), password: z.string().min(1) })
  .passthrough();
const LoginSuccessResponse = z.object({ detail: z.string() }).passthrough();
const LoginBadRequest = z
  .object({ username: z.array(z.string()), password: z.array(z.string()) })
  .partial()
  .passthrough();
const LoginForbidden = z.object({ detail: z.string() }).passthrough();
const LogoutResponse = z.object({ detail: z.string() }).passthrough();
const TokenRefreshError = z.object({ detail: z.string() }).passthrough();
const PasswordResetSuccessResponse = z
  .object({ detail: z.string() })
  .passthrough();
const PasswordResetBadRequest = z
  .object({ email: z.array(z.string()) })
  .partial()
  .passthrough();
const PasswordResetConfirmRequest = z
  .object({
    uid: z.string().min(1),
    token: z.string().min(1),
    new_password: z
      .string()
      .min(8)
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/),
  })
  .passthrough();
const PasswordResetConfirmSuccessResponse = z
  .object({ detail: z.string() })
  .passthrough();
const PaginatedPermissionList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Permission),
  })
  .passthrough();
const PermissionRequest = z
  .object({
    code: z.string().min(1).max(100),
    description: z.string().optional(),
  })
  .passthrough();
const PatchedPermissionRequest = z
  .object({ code: z.string().min(1).max(100), description: z.string() })
  .partial()
  .passthrough();
const Unauthorized = z.object({ detail: z.string() }).passthrough();
const RegisterRequest = z
  .object({
    username: z.string().min(5).max(50),
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/),
    email: z.string().min(1).email(),
  })
  .passthrough();
const RegisterSuccessResponse = z
  .object({ detail: z.string(), user: User })
  .passthrough();
const RolePermission = z
  .object({
    id: z.number().int(),
    role: z.number().int(),
    permission: z.number().int(),
    role_name: z.string(),
    permission_name: z.string(),
  })
  .passthrough();
const PaginatedRolePermissionList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(RolePermission),
  })
  .passthrough();
const RolePermissionRequest = z
  .object({ role: z.number().int(), permission: z.number().int() })
  .passthrough();
const PatchedRolePermissionRequest = z
  .object({ role: z.number().int(), permission: z.number().int() })
  .partial()
  .passthrough();
const PaginatedRoleList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Role),
  })
  .passthrough();
const RoleRequest = z
  .object({
    name: z.string().min(1).max(50),
    permission_ids: z.array(z.number().int()),
    is_active: z.boolean().optional(),
    description: z.string().optional(),
  })
  .passthrough();
const PatchedRoleRequest = z
  .object({
    name: z.string().min(1).max(50),
    permission_ids: z.array(z.number().int()),
    is_active: z.boolean(),
    description: z.string(),
  })
  .partial()
  .passthrough();
const RefreshTokenResponse = z
  .object({ detail: z.string(), access: z.string() })
  .passthrough();
const PaginatedUserList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(User),
  })
  .passthrough();
const UserRequest = z
  .object({
    username: z.string().min(5).max(50),
    email: z.string().min(1).email(),
    first_name: z.string().min(1).max(30),
    last_name: z.string().min(1).max(30),
    role_ids: z.array(z.number().int()).optional(),
    phone: z
      .string()
      .min(1)
      .regex(/^\+?\d{7,15}$/),
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/),
    is_active: z.boolean().optional(),
    is_staff: z.boolean().optional(),
    is_superuser: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
  })
  .passthrough();
const PatchedUserRequest = z
  .object({
    username: z.string().min(5).max(50),
    email: z.string().min(1).email(),
    first_name: z.string().min(1).max(30),
    last_name: z.string().min(1).max(30),
    role_ids: z.array(z.number().int()),
    phone: z
      .string()
      .min(1)
      .regex(/^\+?\d{7,15}$/),
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/),
    is_active: z.boolean(),
    is_staff: z.boolean(),
    is_superuser: z.boolean(),
    is_deleted: z.boolean(),
  })
  .partial()
  .passthrough();

export const schemas = {
  AccountTypeEnum,
  AccountSubtypeEnum,
  BlankEnum,
  NormalBalanceEnum,
  ChartOfAccounts,
  PaginatedChartOfAccountsList,
  ChartOfAccountsRequest,
  PatchedChartOfAccountsRequest,
  ChartOfAccountsChoices,
  SetupDefaultsResponse,
  ChartOfAccountsTree,
  PaginatedChartOfAccountsTreeList,
  SourceTypeEnum,
  GeneralJournalList,
  PaginatedGeneralJournalListList,
  EntryTypeEnum,
  JournalLineRequest,
  GeneralJournalCreateRequest,
  JournalLine,
  GeneralJournalCreate,
  GeneralJournal,
  GeneralJournalRequest,
  PatchedGeneralJournalRequest,
  PostEntryResponse,
  ReverseEntryResponse,
  GeneralJournalChoices,
  BSItemAssets,
  BalanceSheetSectionAssets,
  BSItemLiabilities,
  BalanceSheetSectionLiabilities,
  BSItemEquity,
  BalanceSheetSectionEquity,
  BalanceSheetResponse,
  IncomeStatementPeriod,
  IncomeItem,
  IncomeStatementSection,
  IncomeItemCOGS,
  IncomeStatementSectionCOGS,
  IncomeItemExpenses,
  IncomeStatementSectionExpenses,
  IncomeStatementResponse,
  LedgerAccountInfo,
  LedgerEntry,
  AccountLedgerResponse,
  TrialBalanceAccount,
  TrialBalanceTotals,
  TrialBalanceResponse,
  BranchUsers,
  PaginatedBranchUsersList,
  BranchUsersRequest,
  PatchedBranchUsersRequest,
  BranchTypeEnum,
  Branch,
  PaginatedBranchList,
  BranchRequest,
  PatchedBranchRequest,
  Shift,
  PaginatedShiftList,
  ShiftRequest,
  PatchedShiftRequest,
  ContactUs,
  PaginatedContactUsList,
  ContactUsRequest,
  PatchedContactUsRequest,
  DefaultLanguageEnum,
  LanguageEnum,
  PageContent,
  Page,
  PaginatedPageList,
  PageContentRequest,
  PageRequest,
  PatchedPageRequest,
  CSVImportRequest,
  CSVImportResponse,
  CSVImportError,
  CSVImportForbidden,
  Campaign,
  PaginatedCampaignList,
  CampaignRequest,
  PatchedCampaignRequest,
  DocumentTypeEnum,
  ClaimDocument,
  PaginatedClaimDocumentList,
  ClaimDocumentRequest,
  PatchedClaimDocumentRequest,
  ClaimItem,
  PaginatedClaimItemList,
  ClaimItemRequest,
  PatchedClaimItemRequest,
  ComplaintStatusEnum,
  Complaint,
  PaginatedComplaintList,
  ComplaintRequest,
  PatchedComplaintRequest,
  Contact,
  PaginatedContactList,
  ContactRequest,
  PatchedContactRequest,
  CustomerGroup,
  PaginatedCustomerGroupList,
  CustomerGroupRequest,
  PatchedCustomerGroupRequest,
  CustomerPartnerLink,
  PaginatedCustomerPartnerLinkList,
  CustomerPartnerLinkRequest,
  PatchedCustomerPartnerLinkRequest,
  CustomerTypeEnum,
  PreferredContactEnum,
  Customer,
  PaginatedCustomerList,
  CustomerRequest,
  PatchedCustomerRequest,
  Document,
  PaginatedDocumentList,
  DocumentRequest,
  PatchedDocumentRequest,
  StatusC92Enum,
  InsuranceClaimList,
  PaginatedInsuranceClaimListList,
  InsuranceClaimCreateRequest,
  InsuranceClaimCreate,
  InsuranceClaim,
  InsuranceClaimRequest,
  PatchedInsuranceClaimRequest,
  ApproveClaimRequestRequest,
  ApproveClaimResponse,
  MarkClaimPaidRequestRequest,
  MarkClaimPaidResponse,
  RejectClaimRequestRequest,
  RejectClaimResponse,
  SubmitClaimResponse,
  ClaimChoices,
  InteractionTypeEnum,
  Interaction,
  PaginatedInteractionList,
  InteractionRequest,
  PatchedInteractionRequest,
  StageEnum,
  Opportunity,
  PaginatedOpportunityList,
  OpportunityRequest,
  PatchedOpportunityRequest,
  PartnerBranch,
  PaginatedPartnerBranchList,
  PartnerBranchRequest,
  PatchedPartnerBranchRequest,
  PartnerSettlementStatusEnum,
  PartnerSettlement,
  PaginatedPartnerSettlementList,
  PartnerSettlementRequest,
  PatchedPartnerSettlementRequest,
  PartnerTypeEnum,
  PartnerList,
  PaginatedPartnerListList,
  PaymentTermsEnum,
  PartnerRequest,
  Partner,
  PatchedPartnerRequest,
  ClaimsStats,
  PartnerClaimsSummary,
  PartnerChoices,
  SubscriptionTypeEnum,
  Subscription,
  PaginatedSubscriptionList,
  SubscriptionRequest,
  PatchedSubscriptionRequest,
  PriorityEnum,
  Task,
  PaginatedTaskList,
  TaskRequest,
  PatchedTaskRequest,
  Attendance,
  PaginatedAttendanceList,
  AttendanceRequest,
  PatchedAttendanceRequest,
  Department,
  PaginatedDepartmentList,
  DepartmentRequest,
  PatchedDepartmentRequest,
  DepartmentOption,
  UserOption,
  PositionOption,
  EmployeeFormOptionsResponse,
  PositionEnum,
  Employee,
  PaginatedEmployeeList,
  EmployeeRequest,
  PatchedEmployeeRequest,
  LeaveTypeEnum,
  LeaveStatusEnum,
  Leave,
  PaginatedLeaveList,
  LeaveRequest,
  PatchedLeaveRequest,
  NotificationTypeEnum,
  Notification,
  PaginatedNotificationList,
  NotificationRequest,
  PatchedNotificationRequest,
  PayrollStatusEnum,
  Payroll,
  PaginatedPayrollList,
  PayrollRequest,
  PatchedPayrollRequest,
  RatingEnum,
  PerformanceReview,
  PaginatedPerformanceReviewList,
  PerformanceReviewRequest,
  PatchedPerformanceReviewRequest,
  MobileCustomerLookupItem,
  MobileDashboardTodayStats,
  MobileDashboardOrder,
  MobileDashboardAlert,
  MobileUserPerformance,
  MobileDashboardResponse,
  OrderDetailCustomer,
  OrderDetailItem,
  MobileOrderDetailResponse,
  MobileProductSearchItem,
  QuickSaleItemRequest,
  MobileQuickSaleRequestRequest,
  MobileQuickSaleResponse,
  SyncProduct,
  SyncCustomer,
  MobileSyncResponse,
  Permission,
  Role,
  User,
  RightSphereEnum,
  NullEnum,
  RightCylinderEnum,
  LeftSphereEnum,
  LeftCylinderEnum,
  RightReadingAddEnum,
  LeftReadingAddEnum,
  PrescriptionRecord,
  PaginatedPrescriptionRecordList,
  PrescriptionRecordRequest,
  PatchedPrescriptionRecordRequest,
  ProductVariantAnswer,
  PaginatedProductVariantAnswerList,
  ProductVariantAnswerRequest,
  PatchedProductVariantAnswerRequest,
  AttributeValue,
  PaginatedAttributeValueList,
  AttributeValueRequest,
  PatchedAttributeValueRequest,
  Attribute,
  PaginatedAttributeList,
  AttributeRequest,
  PatchedAttributeRequest,
  Stock,
  ProductTypeEnum,
  Brand,
  PaginatedBrandList,
  BrandRequest,
  PatchedBrandRequest,
  Category,
  PaginatedCategoryList,
  CategoryRequest,
  PatchedCategoryRequest,
  FlexiblePrice,
  PaginatedFlexiblePriceList,
  FlexiblePriceRequest,
  PatchedFlexiblePriceRequest,
  Manufacturer,
  PaginatedManufacturerList,
  ManufacturerRequest,
  PatchedManufacturerRequest,
  GenderEnum,
  AgeGroupEnum,
  ProductVariantMarketing,
  PaginatedProductVariantMarketingList,
  ProductVariantMarketingRequest,
  PatchedProductVariantMarketingRequest,
  ProductVariantOffer,
  PaginatedProductVariantOfferList,
  ProductVariantOfferRequest,
  PatchedProductVariantOfferRequest,
  OrderFulfillmentItemRequest,
  OrderFulfillmentCheckRequestRequest,
  VariantFulfillmentPlan,
  OrderFulfillmentCheckResponse,
  PricingPolicy,
  PaginatedPricingPolicyList,
  PricingPolicyRequest,
  PatchedPricingPolicyRequest,
  ProductImage,
  PaginatedProductImageList,
  ProductImageRequest,
  PatchedProductImageRequest,
  MainGroupEnum,
  VariantTypeEnum,
  Product,
  PaginatedProductList,
  ProductRequest,
  PatchedProductRequest,
  ProductImportSummary,
  ProductImportSuccessResponse,
  ProductImportBadRequest,
  ProductImportServerError,
  PurchaseOrderItem,
  PurchaseOrderStatusEnum,
  PurchaseOrder,
  PaginatedPurchaseOrderList,
  PurchaseOrderItemCreateRequest,
  PurchaseOrderCreateRequest,
  PurchaseOrderRequest,
  PatchedPurchaseOrderRequest,
  ReceiveItemsRequest,
  ProductVariantQuestion,
  PaginatedProductVariantQuestionList,
  ProductVariantQuestionRequest,
  PatchedProductVariantQuestionRequest,
  ProductVariantReview,
  PaginatedProductVariantReviewList,
  ProductVariantReviewRequest,
  PatchedProductVariantReviewRequest,
  MovementTypeEnum,
  StockMovement,
  PaginatedStockMovementList,
  StockMovementCreateRequest,
  StockMovementCreate,
  StockMovementRequest,
  PatchedStockMovementRequest,
  StockTransferItem,
  PaginatedStockTransferItemList,
  StockTransferItemRequest,
  PatchedStockTransferItemRequest,
  StockTransferStatusEnum,
  StockTransfer,
  PaginatedStockTransferList,
  StockTransferCreateRequest,
  StockTransferCreate,
  StockTransferRequest,
  PatchedStockTransferRequest,
  PaginatedStockList,
  StockRequest,
  PatchedStockRequest,
  StoreBranch,
  PaginatedStoreBranchList,
  Supplier,
  PaginatedSupplierList,
  SupplierRequest,
  PatchedSupplierRequest,
  ProductVariant,
  PaginatedProductVariantList,
  CreateProductVariantRequest,
  CreateProductVariant,
  ProductVariantRequest,
  PatchedProductVariantRequest,
  NearestBranchResponse,
  StockSummaryBranchInfo,
  VariantStockSummaryResponse,
  VariantTotalStockResponse,
  InstallmentStatusEnum,
  Installment,
  PaginatedInstallmentList,
  InstallmentRequest,
  PatchedInstallmentRequest,
  MarkInstallmentPaidRequestRequest,
  MarkInstallmentPaidResponse,
  DamageItemRequestRequest,
  CreateDamageRecordRequestRequest,
  CreateDamageRecordResponse,
  InvoiceType,
  PaginatedInvoiceTypeList,
  InvoiceTypeRequest,
  PatchedInvoiceTypeRequest,
  InvoiceItem,
  InvoiceTypeCodeEnum,
  InvoiceStatusEnum,
  Invoice,
  PaginatedInvoiceList,
  InvoiceItemRequest,
  InvoiceRequest,
  PatchedInvoiceRequest,
  InvoiceTotalsResponse,
  InvoiceConfirmResponse,
  InvoiceChoicesResponse,
  OrderItem,
  OrderTypeEnum,
  OrderStatusEnum,
  PaymentStatusEnum,
  Order,
  PaginatedOrderList,
  OrderItemRequest,
  OrderRequest,
  ReturnItemRequestRequest,
  CreateReturnRequestRequest,
  CreateReturnResponse,
  PatchedOrderRequest,
  OrderTotalsResponse,
  OrderCancelResponse,
  OrderConfirmResponse,
  OrderDeliverResponse,
  OrderReadyResponse,
  OrderBulkUpdateStatusRequestStatusEnum,
  OrderBulkUpdateStatusRequestRequest,
  OrderBulkUpdateStatusResponse,
  OrderChoicesResponse,
  PaymentMethod,
  PaginatedPaymentMethodList,
  PaymentMethodRequest,
  PatchedPaymentMethodRequest,
  StatusB5aEnum,
  PaymentList,
  PaginatedPaymentListList,
  PaymentCreateRequest,
  PaymentCreate,
  PaymentAllocation,
  Payment,
  PaymentRequest,
  PatchedPaymentRequest,
  MarkCompletedRequestRequest,
  MarkCompletedResponse,
  MarkFailedRequestRequest,
  MarkFailedResponse,
  PaymentRefundRequest,
  RefundResponse,
  BNPLCallbackResponse,
  PaymentChoices,
  GatewayEnum,
  BNPLSessionRequestRequest,
  BNPLSessionResponse,
  PaymentTotal,
  InstallmentSummary,
  PaymentSummaryResponse,
  BranchComparisonResponse,
  FinancialDashboardSales,
  FinancialDashboardPurchases,
  FinancialDashboardReturns,
  FinancialDashboardPaymentsByMethod,
  FinancialDashboardPayments,
  FinancialDashboardReservedInv,
  FinancialDashboardResponse,
  InventorySummaryResponse,
  PendingOrdersByStatus,
  PendingOrdersTotal,
  PendingOrdersResponse,
  AgingBucketCurrent,
  AgingBucket3160,
  AgingBucket6190,
  AgingBucket90Plus,
  AgingBuckets,
  ReceivablesAgingResponse,
  SalesByDateResponse,
  SalesSummaryPayments,
  SalesSummaryResponse,
  StockMovementByType,
  StockMovementsReportResponse,
  TopProductsResponse,
  CreateOrderItemRequestRequest,
  CreateWholesaleOrderRequestRequest,
  CreatedOrderInfo,
  CreateWholesaleOrderResponse,
  UpdateCustomerCreditRequestRequest,
  UpdatedCreditCustomer,
  UpdateCustomerCreditResponse,
  StatementCustomerInfo,
  StatementPeriod,
  StatementTransaction,
  StatementSummary,
  CustomerStatementResponse,
  WholesaleCustomer,
  DashboardMonthStats,
  DashboardTopCustomer,
  DashboardReceivables,
  WholesaleDashboardResponse,
  PricingItemRequestRequest,
  GetWholesalePricingRequestRequest,
  PricingCustomerInfo,
  PricingResponseItem,
  GetWholesalePricingResponse,
  ValidateItemRequestRequest,
  ValidateWholesaleOrderRequestRequest,
  CustomerCreditInfo,
  ValidateWholesaleOrderResponse,
  ActivationSuccessResponse,
  ActivationErrorResponse,
  CurrencyEnum,
  SubscriptionPlan,
  Client,
  PaginatedClientList,
  ClientRequest,
  PatchedClientRequest,
  DirectionEnum,
  MethodEnum,
  CreatePaymentOrderRequest,
  CreatePaymentOrderResponse,
  CreatePaymentErrorResponse,
  Domain,
  PaginatedDomainList,
  DomainRequest,
  PatchedDomainRequest,
  PaymentDetail,
  PaymentListResponse,
  PayPalExecuteRequestRequest,
  PayPalExecuteSuccessResponse,
  PayPalExecuteErrorResponse,
  WebhookResponse,
  RegisterTenantRequest,
  RegisterTenantSuccessResponse,
  RegisterTenantErrorResponse,
  RegisterTenant,
  PaginatedRegisterTenantList,
  PatchedRegisterTenantRequest,
  PublicTenantSettings,
  PaginatedPublicTenantSettingsList,
  PublicTenantSettingsRequest,
  PatchedPublicTenantSettingsRequest,
  PaginatedSubscriptionPlanList,
  SubscriptionPlanRequest,
  PatchedSubscriptionPlanRequest,
  HealthResponse,
  LoginRequest,
  LoginSuccessResponse,
  LoginBadRequest,
  LoginForbidden,
  LogoutResponse,
  TokenRefreshError,
  PasswordResetSuccessResponse,
  PasswordResetBadRequest,
  PasswordResetConfirmRequest,
  PasswordResetConfirmSuccessResponse,
  PaginatedPermissionList,
  PermissionRequest,
  PatchedPermissionRequest,
  Unauthorized,
  RegisterRequest,
  RegisterSuccessResponse,
  RolePermission,
  PaginatedRolePermissionList,
  RolePermissionRequest,
  PatchedRolePermissionRequest,
  PaginatedRoleList,
  RoleRequest,
  PatchedRoleRequest,
  RefreshTokenResponse,
  PaginatedUserList,
  UserRequest,
  PatchedUserRequest,
};

export const endpoints = makeApi([
  {
    method: "get",
    path: "/api/accounting/chart-of-accounts/",
    alias: "accounting_chart_of_accounts_list",
    description: `ViewSet for Chart of Accounts`,
    requestFormat: "json",
    parameters: [
      {
        name: "account_subtype",
        type: "Query",
        schema: z
          .enum([
            "accrued",
            "bank",
            "capital",
            "cash",
            "cost_of_goods",
            "deferred",
            "fixed_asset",
            "inventory",
            "loan",
            "marketing",
            "other_expense",
            "other_income",
            "payable",
            "prepaid",
            "receivable",
            "rent",
            "reserves",
            "retained",
            "salary",
            "sales",
            "service",
            "supplies",
            "tax_payable",
            "utilities",
          ])
          .optional(),
      },
      {
        name: "account_type",
        type: "Query",
        schema: z
          .enum(["asset", "cogs", "equity", "expense", "liability", "revenue"])
          .optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "is_header",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedChartOfAccountsList,
  },
  {
    method: "post",
    path: "/api/accounting/chart-of-accounts/",
    alias: "accounting_chart_of_accounts_create",
    description: `ViewSet for Chart of Accounts`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ChartOfAccountsRequest,
      },
    ],
    response: ChartOfAccounts,
  },
  {
    method: "get",
    path: "/api/accounting/chart-of-accounts/:id/",
    alias: "accounting_chart_of_accounts_retrieve",
    description: `ViewSet for Chart of Accounts`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ChartOfAccounts,
  },
  {
    method: "put",
    path: "/api/accounting/chart-of-accounts/:id/",
    alias: "accounting_chart_of_accounts_update",
    description: `ViewSet for Chart of Accounts`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ChartOfAccountsRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ChartOfAccounts,
  },
  {
    method: "patch",
    path: "/api/accounting/chart-of-accounts/:id/",
    alias: "accounting_chart_of_accounts_partial_update",
    description: `ViewSet for Chart of Accounts`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedChartOfAccountsRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ChartOfAccounts,
  },
  {
    method: "delete",
    path: "/api/accounting/chart-of-accounts/:id/",
    alias: "accounting_chart_of_accounts_destroy",
    description: `ViewSet for Chart of Accounts`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/accounting/chart-of-accounts/by_type/",
    alias: "accounting_chart_of_accounts_by_type_list",
    description: `Filter accounts by type`,
    requestFormat: "json",
    parameters: [
      {
        name: "account_subtype",
        type: "Query",
        schema: z
          .enum([
            "accrued",
            "bank",
            "capital",
            "cash",
            "cost_of_goods",
            "deferred",
            "fixed_asset",
            "inventory",
            "loan",
            "marketing",
            "other_expense",
            "other_income",
            "payable",
            "prepaid",
            "receivable",
            "rent",
            "reserves",
            "retained",
            "salary",
            "sales",
            "service",
            "supplies",
            "tax_payable",
            "utilities",
          ])
          .optional(),
      },
      {
        name: "account_type",
        type: "Query",
        schema: z
          .enum(["asset", "cogs", "equity", "expense", "liability", "revenue"])
          .optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "is_header",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "type",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: PaginatedChartOfAccountsList,
  },
  {
    method: "get",
    path: "/api/accounting/chart-of-accounts/choices/",
    alias: "accounting_chart_of_accounts_choices_retrieve",
    description: `Available choices`,
    requestFormat: "json",
    response: ChartOfAccountsChoices,
  },
  {
    method: "get",
    path: "/api/accounting/chart-of-accounts/filter_options/",
    alias: "accounting_chart_of_accounts_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: ChartOfAccounts,
  },
  {
    method: "post",
    path: "/api/accounting/chart-of-accounts/setup_defaults/",
    alias: "accounting_chart_of_accounts_setup_defaults_create",
    description: `Setup default accounts`,
    requestFormat: "json",
    response: SetupDefaultsResponse,
  },
  {
    method: "get",
    path: "/api/accounting/chart-of-accounts/tree/",
    alias: "accounting_chart_of_accounts_tree_list",
    description: `Display Chart of Accounts as a tree structure`,
    requestFormat: "json",
    parameters: [
      {
        name: "account_subtype",
        type: "Query",
        schema: z
          .enum([
            "accrued",
            "bank",
            "capital",
            "cash",
            "cost_of_goods",
            "deferred",
            "fixed_asset",
            "inventory",
            "loan",
            "marketing",
            "other_expense",
            "other_income",
            "payable",
            "prepaid",
            "receivable",
            "rent",
            "reserves",
            "retained",
            "salary",
            "sales",
            "service",
            "supplies",
            "tax_payable",
            "utilities",
          ])
          .optional(),
      },
      {
        name: "account_type",
        type: "Query",
        schema: z
          .enum(["asset", "cogs", "equity", "expense", "liability", "revenue"])
          .optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "is_header",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedChartOfAccountsTreeList,
  },
  {
    method: "get",
    path: "/api/accounting/journal-entries/",
    alias: "accounting_journal_entries_list",
    description: `ViewSet for General Journal Entries`,
    requestFormat: "json",
    parameters: [
      {
        name: "entry_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "entry_type",
        type: "Query",
        schema: z
          .enum(["adjustment", "closing", "opening", "reversal", "standard"])
          .optional(),
      },
      {
        name: "is_posted",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "source_type",
        type: "Query",
        schema: z
          .enum([
            "adjustment",
            "manual",
            "payment",
            "payroll",
            "purchase_invoice",
            "receipt",
            "return",
            "sales_invoice",
          ])
          .optional(),
      },
    ],
    response: PaginatedGeneralJournalListList,
  },
  {
    method: "post",
    path: "/api/accounting/journal-entries/",
    alias: "accounting_journal_entries_create",
    description: `ViewSet for General Journal Entries`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: GeneralJournalCreateRequest,
      },
    ],
    response: GeneralJournalCreate,
  },
  {
    method: "get",
    path: "/api/accounting/journal-entries/:id/",
    alias: "accounting_journal_entries_retrieve",
    description: `ViewSet for General Journal Entries`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: GeneralJournal,
  },
  {
    method: "put",
    path: "/api/accounting/journal-entries/:id/",
    alias: "accounting_journal_entries_update",
    description: `ViewSet for General Journal Entries`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: GeneralJournalRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: GeneralJournal,
  },
  {
    method: "patch",
    path: "/api/accounting/journal-entries/:id/",
    alias: "accounting_journal_entries_partial_update",
    description: `ViewSet for General Journal Entries`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedGeneralJournalRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: GeneralJournal,
  },
  {
    method: "delete",
    path: "/api/accounting/journal-entries/:id/",
    alias: "accounting_journal_entries_destroy",
    description: `ViewSet for General Journal Entries`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/accounting/journal-entries/:id/post_entry/",
    alias: "accounting_journal_entries_post_entry_create",
    description: `Post the journal entry`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PostEntryResponse,
  },
  {
    method: "post",
    path: "/api/accounting/journal-entries/:id/reverse_entry/",
    alias: "accounting_journal_entries_reverse_entry_create",
    description: `Reverse the journal entry`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ReverseEntryResponse,
  },
  {
    method: "get",
    path: "/api/accounting/journal-entries/by_source/",
    alias: "accounting_journal_entries_by_source_list",
    description: `Get journals by source`,
    requestFormat: "json",
    parameters: [
      {
        name: "entry_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "entry_type",
        type: "Query",
        schema: z
          .enum(["adjustment", "closing", "opening", "reversal", "standard"])
          .optional(),
      },
      {
        name: "is_posted",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "source_id",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "source_type",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedGeneralJournalListList,
  },
  {
    method: "get",
    path: "/api/accounting/journal-entries/choices/",
    alias: "accounting_journal_entries_choices_retrieve",
    description: `Available choices`,
    requestFormat: "json",
    response: GeneralJournalChoices,
  },
  {
    method: "get",
    path: "/api/accounting/journal-entries/filter_options/",
    alias: "accounting_journal_entries_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: GeneralJournal,
  },
  {
    method: "get",
    path: "/api/accounting/journal-entries/unposted/",
    alias: "accounting_journal_entries_unposted_list",
    description: `Get unposted journals`,
    requestFormat: "json",
    parameters: [
      {
        name: "entry_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "entry_type",
        type: "Query",
        schema: z
          .enum(["adjustment", "closing", "opening", "reversal", "standard"])
          .optional(),
      },
      {
        name: "is_posted",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "source_type",
        type: "Query",
        schema: z
          .enum([
            "adjustment",
            "manual",
            "payment",
            "payroll",
            "purchase_invoice",
            "receipt",
            "return",
            "sales_invoice",
          ])
          .optional(),
      },
    ],
    response: PaginatedGeneralJournalListList,
  },
  {
    method: "get",
    path: "/api/accounting/reports/balance-sheet/",
    alias: "accounting_reports_balance_sheet_retrieve",
    description: `Get Balance Sheet Report`,
    requestFormat: "json",
    parameters: [
      {
        name: "as_of_date",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: BalanceSheetResponse,
  },
  {
    method: "get",
    path: "/api/accounting/reports/income-statement/",
    alias: "accounting_reports_income_statement_retrieve",
    description: `Get Income Statement Report`,
    requestFormat: "json",
    parameters: [
      {
        name: "end_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "start_date",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: IncomeStatementResponse,
  },
  {
    method: "get",
    path: "/api/accounting/reports/ledger/:account_id/",
    alias: "accounting_reports_ledger_retrieve",
    description: `Get Ledger for a specific account`,
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.number().int(),
      },
      {
        name: "end_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "start_date",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: AccountLedgerResponse,
  },
  {
    method: "get",
    path: "/api/accounting/reports/trial-balance/",
    alias: "accounting_reports_trial_balance_retrieve",
    description: `Get Trial Balance Report`,
    requestFormat: "json",
    parameters: [
      {
        name: "as_of_date",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: TrialBalanceResponse,
  },
  {
    method: "get",
    path: "/api/branches/branch-users/",
    alias: "branches_branch_users_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "employee",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "notes",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedBranchUsersList,
  },
  {
    method: "post",
    path: "/api/branches/branch-users/",
    alias: "branches_branch_users_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BranchUsersRequest,
      },
    ],
    response: BranchUsers,
  },
  {
    method: "get",
    path: "/api/branches/branch-users/:id/",
    alias: "branches_branch_users_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: BranchUsers,
  },
  {
    method: "put",
    path: "/api/branches/branch-users/:id/",
    alias: "branches_branch_users_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BranchUsersRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: BranchUsers,
  },
  {
    method: "patch",
    path: "/api/branches/branch-users/:id/",
    alias: "branches_branch_users_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedBranchUsersRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: BranchUsers,
  },
  {
    method: "delete",
    path: "/api/branches/branch-users/:id/",
    alias: "branches_branch_users_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/branches/branch-users/filter_options/",
    alias: "branches_branch_users_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: BranchUsers,
  },
  {
    method: "get",
    path: "/api/branches/branches/",
    alias: "branches_branches_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "additional_number",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "address",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "allows_online_orders",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "branch_code",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "branch_type",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "building_number",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "city",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "country",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "cr_number",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "district",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "email",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "is_main_branch",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "operating_hours",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "phone",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "postal_code",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "receipt_footer",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "receipt_header",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "street_name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "tax_number",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedBranchList,
  },
  {
    method: "post",
    path: "/api/branches/branches/",
    alias: "branches_branches_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BranchRequest,
      },
    ],
    response: Branch,
  },
  {
    method: "get",
    path: "/api/branches/branches/:id/",
    alias: "branches_branches_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Branch,
  },
  {
    method: "put",
    path: "/api/branches/branches/:id/",
    alias: "branches_branches_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BranchRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Branch,
  },
  {
    method: "patch",
    path: "/api/branches/branches/:id/",
    alias: "branches_branches_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedBranchRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Branch,
  },
  {
    method: "delete",
    path: "/api/branches/branches/:id/",
    alias: "branches_branches_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/branches/branches/filter_options/",
    alias: "branches_branches_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Branch,
  },
  {
    method: "get",
    path: "/api/branches/shifts/",
    alias: "branches_shifts_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "employee",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "end_time",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "notes",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "start_time",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedShiftList,
  },
  {
    method: "post",
    path: "/api/branches/shifts/",
    alias: "branches_shifts_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ShiftRequest,
      },
    ],
    response: Shift,
  },
  {
    method: "get",
    path: "/api/branches/shifts/:id/",
    alias: "branches_shifts_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Shift,
  },
  {
    method: "put",
    path: "/api/branches/shifts/:id/",
    alias: "branches_shifts_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ShiftRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Shift,
  },
  {
    method: "patch",
    path: "/api/branches/shifts/:id/",
    alias: "branches_shifts_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedShiftRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Shift,
  },
  {
    method: "delete",
    path: "/api/branches/shifts/:id/",
    alias: "branches_shifts_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/branches/shifts/filter_options/",
    alias: "branches_shifts_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Shift,
  },
  {
    method: "get",
    path: "/api/cms/contact-us/",
    alias: "cms_contact_us_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "email",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "is_deleted",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "message",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "phone",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedContactUsList,
  },
  {
    method: "post",
    path: "/api/cms/contact-us/",
    alias: "cms_contact_us_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ContactUsRequest,
      },
    ],
    response: ContactUs,
  },
  {
    method: "get",
    path: "/api/cms/contact-us/:id/",
    alias: "cms_contact_us_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ContactUs,
  },
  {
    method: "put",
    path: "/api/cms/contact-us/:id/",
    alias: "cms_contact_us_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ContactUsRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ContactUs,
  },
  {
    method: "patch",
    path: "/api/cms/contact-us/:id/",
    alias: "cms_contact_us_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedContactUsRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ContactUs,
  },
  {
    method: "delete",
    path: "/api/cms/contact-us/:id/",
    alias: "cms_contact_us_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/cms/contact-us/filter_options/",
    alias: "cms_contact_us_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: ContactUs,
  },
  {
    method: "get",
    path: "/api/cms/pages/",
    alias: "cms_pages_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "author",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "client",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "default_language",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "is_deleted",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "is_published",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "slug",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "translations",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedPageList,
  },
  {
    method: "post",
    path: "/api/cms/pages/",
    alias: "cms_pages_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PageRequest,
      },
    ],
    response: Page,
  },
  {
    method: "get",
    path: "/api/cms/pages/:id/",
    alias: "cms_pages_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Page,
  },
  {
    method: "put",
    path: "/api/cms/pages/:id/",
    alias: "cms_pages_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PageRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Page,
  },
  {
    method: "patch",
    path: "/api/cms/pages/:id/",
    alias: "cms_pages_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedPageRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Page,
  },
  {
    method: "delete",
    path: "/api/cms/pages/:id/",
    alias: "cms_pages_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/cms/pages/filter_options/",
    alias: "cms_pages_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Page,
  },
  {
    method: "get",
    path: "/api/cms/public/pages/",
    alias: "cms_public_pages_list",
    description: `For public pages only`,
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedPageList,
  },
  {
    method: "get",
    path: "/api/cms/public/pages/:slug/",
    alias: "cms_public_pages_retrieve",
    description: `For public pages only`,
    requestFormat: "json",
    parameters: [
      {
        name: "slug",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Page,
  },
  {
    method: "post",
    path: "/api/core/import-csv/",
    alias: "core_import_csv_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z
          .object({ csv_file: z.instanceof(File), config: z.unknown() })
          .passthrough(),
      },
    ],
    response: CSVImportResponse,
    errors: [
      {
        status: 400,
        schema: z.object({ detail: z.string() }).passthrough(),
      },
      {
        status: 403,
        schema: z.object({ detail: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/crm/campaigns/",
    alias: "crm_campaigns_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "customers",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "description",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "end_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "start_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedCampaignList,
  },
  {
    method: "post",
    path: "/api/crm/campaigns/",
    alias: "crm_campaigns_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CampaignRequest,
      },
    ],
    response: Campaign,
  },
  {
    method: "get",
    path: "/api/crm/campaigns/:id/",
    alias: "crm_campaigns_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Campaign,
  },
  {
    method: "put",
    path: "/api/crm/campaigns/:id/",
    alias: "crm_campaigns_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CampaignRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Campaign,
  },
  {
    method: "patch",
    path: "/api/crm/campaigns/:id/",
    alias: "crm_campaigns_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedCampaignRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Campaign,
  },
  {
    method: "delete",
    path: "/api/crm/campaigns/:id/",
    alias: "crm_campaigns_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/campaigns/filter_options/",
    alias: "crm_campaigns_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Campaign,
  },
  {
    method: "get",
    path: "/api/crm/claim-documents/",
    alias: "crm_claim_documents_list",
    description: `مستندات المطالبات`,
    requestFormat: "json",
    parameters: [
      {
        name: "claim",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "document_type",
        type: "Query",
        schema: z
          .enum(["authorization", "invoice", "other", "prescription", "report"])
          .optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedClaimDocumentList,
  },
  {
    method: "post",
    path: "/api/crm/claim-documents/",
    alias: "crm_claim_documents_create",
    description: `مستندات المطالبات`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ClaimDocumentRequest,
      },
    ],
    response: ClaimDocument,
  },
  {
    method: "get",
    path: "/api/crm/claim-documents/:id/",
    alias: "crm_claim_documents_retrieve",
    description: `مستندات المطالبات`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ClaimDocument,
  },
  {
    method: "put",
    path: "/api/crm/claim-documents/:id/",
    alias: "crm_claim_documents_update",
    description: `مستندات المطالبات`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ClaimDocumentRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ClaimDocument,
  },
  {
    method: "patch",
    path: "/api/crm/claim-documents/:id/",
    alias: "crm_claim_documents_partial_update",
    description: `مستندات المطالبات`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedClaimDocumentRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ClaimDocument,
  },
  {
    method: "delete",
    path: "/api/crm/claim-documents/:id/",
    alias: "crm_claim_documents_destroy",
    description: `مستندات المطالبات`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/claim-documents/filter_options/",
    alias: "crm_claim_documents_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: ClaimDocument,
  },
  {
    method: "get",
    path: "/api/crm/claim-items/",
    alias: "crm_claim_items_list",
    description: `عناصر المطالبات`,
    requestFormat: "json",
    parameters: [
      {
        name: "claim",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedClaimItemList,
  },
  {
    method: "post",
    path: "/api/crm/claim-items/",
    alias: "crm_claim_items_create",
    description: `عناصر المطالبات`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ClaimItemRequest,
      },
    ],
    response: ClaimItem,
  },
  {
    method: "get",
    path: "/api/crm/claim-items/:id/",
    alias: "crm_claim_items_retrieve",
    description: `عناصر المطالبات`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ClaimItem,
  },
  {
    method: "put",
    path: "/api/crm/claim-items/:id/",
    alias: "crm_claim_items_update",
    description: `عناصر المطالبات`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ClaimItemRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ClaimItem,
  },
  {
    method: "patch",
    path: "/api/crm/claim-items/:id/",
    alias: "crm_claim_items_partial_update",
    description: `عناصر المطالبات`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedClaimItemRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ClaimItem,
  },
  {
    method: "delete",
    path: "/api/crm/claim-items/:id/",
    alias: "crm_claim_items_destroy",
    description: `عناصر المطالبات`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/claim-items/filter_options/",
    alias: "crm_claim_items_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: ClaimItem,
  },
  {
    method: "get",
    path: "/api/crm/complaints/",
    alias: "crm_complaints_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "customer",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "description",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedComplaintList,
  },
  {
    method: "post",
    path: "/api/crm/complaints/",
    alias: "crm_complaints_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ComplaintRequest,
      },
    ],
    response: Complaint,
  },
  {
    method: "get",
    path: "/api/crm/complaints/:id/",
    alias: "crm_complaints_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Complaint,
  },
  {
    method: "put",
    path: "/api/crm/complaints/:id/",
    alias: "crm_complaints_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ComplaintRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Complaint,
  },
  {
    method: "patch",
    path: "/api/crm/complaints/:id/",
    alias: "crm_complaints_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedComplaintRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Complaint,
  },
  {
    method: "delete",
    path: "/api/crm/complaints/:id/",
    alias: "crm_complaints_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/complaints/filter_options/",
    alias: "crm_complaints_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Complaint,
  },
  {
    method: "get",
    path: "/api/crm/contact-us/",
    alias: "crm_contact_us_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "email",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "message",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "phone",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedContactList,
  },
  {
    method: "post",
    path: "/api/crm/contact-us/",
    alias: "crm_contact_us_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ContactRequest,
      },
    ],
    response: Contact,
  },
  {
    method: "get",
    path: "/api/crm/contact-us/:id/",
    alias: "crm_contact_us_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Contact,
  },
  {
    method: "put",
    path: "/api/crm/contact-us/:id/",
    alias: "crm_contact_us_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ContactRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Contact,
  },
  {
    method: "patch",
    path: "/api/crm/contact-us/:id/",
    alias: "crm_contact_us_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedContactRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Contact,
  },
  {
    method: "delete",
    path: "/api/crm/contact-us/:id/",
    alias: "crm_contact_us_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/contact-us/filter_options/",
    alias: "crm_contact_us_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Contact,
  },
  {
    method: "get",
    path: "/api/crm/customer-groups/",
    alias: "crm_customer_groups_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "customers",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "description",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedCustomerGroupList,
  },
  {
    method: "post",
    path: "/api/crm/customer-groups/",
    alias: "crm_customer_groups_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CustomerGroupRequest,
      },
    ],
    response: CustomerGroup,
  },
  {
    method: "get",
    path: "/api/crm/customer-groups/:id/",
    alias: "crm_customer_groups_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: CustomerGroup,
  },
  {
    method: "put",
    path: "/api/crm/customer-groups/:id/",
    alias: "crm_customer_groups_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CustomerGroupRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: CustomerGroup,
  },
  {
    method: "patch",
    path: "/api/crm/customer-groups/:id/",
    alias: "crm_customer_groups_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedCustomerGroupRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: CustomerGroup,
  },
  {
    method: "delete",
    path: "/api/crm/customer-groups/:id/",
    alias: "crm_customer_groups_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/customer-groups/filter_options/",
    alias: "crm_customer_groups_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: CustomerGroup,
  },
  {
    method: "get",
    path: "/api/crm/customer-partner-links/",
    alias: "crm_customer_partner_links_list",
    description: `ربط العملاء بالشركاء`,
    requestFormat: "json",
    parameters: [
      {
        name: "customer",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "partner",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedCustomerPartnerLinkList,
  },
  {
    method: "post",
    path: "/api/crm/customer-partner-links/",
    alias: "crm_customer_partner_links_create",
    description: `ربط العملاء بالشركاء`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CustomerPartnerLinkRequest,
      },
    ],
    response: CustomerPartnerLink,
  },
  {
    method: "get",
    path: "/api/crm/customer-partner-links/:id/",
    alias: "crm_customer_partner_links_retrieve",
    description: `ربط العملاء بالشركاء`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: CustomerPartnerLink,
  },
  {
    method: "put",
    path: "/api/crm/customer-partner-links/:id/",
    alias: "crm_customer_partner_links_update",
    description: `ربط العملاء بالشركاء`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CustomerPartnerLinkRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: CustomerPartnerLink,
  },
  {
    method: "patch",
    path: "/api/crm/customer-partner-links/:id/",
    alias: "crm_customer_partner_links_partial_update",
    description: `ربط العملاء بالشركاء`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedCustomerPartnerLinkRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: CustomerPartnerLink,
  },
  {
    method: "delete",
    path: "/api/crm/customer-partner-links/:id/",
    alias: "crm_customer_partner_links_destroy",
    description: `ربط العملاء بالشركاء`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/crm/customer-partner-links/:id/deactivate/",
    alias: "crm_customer_partner_links_deactivate_create",
    description: `تعطيل الربط`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CustomerPartnerLinkRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: CustomerPartnerLink,
  },
  {
    method: "get",
    path: "/api/crm/customer-partner-links/by_customer/",
    alias: "crm_customer_partner_links_by_customer_list",
    description: `جلب ارتباطات عميل معين`,
    requestFormat: "json",
    parameters: [
      {
        name: "customer",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "customer_id",
        type: "Query",
        schema: z.number().int(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "partner",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedCustomerPartnerLinkList,
  },
  {
    method: "get",
    path: "/api/crm/customer-partner-links/filter_options/",
    alias: "crm_customer_partner_links_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: CustomerPartnerLink,
  },
  {
    method: "get",
    path: "/api/crm/customers/",
    alias: "crm_customers_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "customer_type",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "email",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "first_name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "last_name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "phone",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedCustomerList,
  },
  {
    method: "post",
    path: "/api/crm/customers/",
    alias: "crm_customers_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CustomerRequest,
      },
    ],
    response: Customer,
  },
  {
    method: "get",
    path: "/api/crm/customers/:id/",
    alias: "crm_customers_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Customer,
  },
  {
    method: "put",
    path: "/api/crm/customers/:id/",
    alias: "crm_customers_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CustomerRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Customer,
  },
  {
    method: "patch",
    path: "/api/crm/customers/:id/",
    alias: "crm_customers_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedCustomerRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Customer,
  },
  {
    method: "delete",
    path: "/api/crm/customers/:id/",
    alias: "crm_customers_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/customers/filter_options/",
    alias: "crm_customers_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Customer,
  },
  {
    method: "get",
    path: "/api/crm/documents/",
    alias: "crm_documents_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "customer",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "file",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "title",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedDocumentList,
  },
  {
    method: "post",
    path: "/api/crm/documents/",
    alias: "crm_documents_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DocumentRequest,
      },
    ],
    response: Document,
  },
  {
    method: "get",
    path: "/api/crm/documents/:id/",
    alias: "crm_documents_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Document,
  },
  {
    method: "put",
    path: "/api/crm/documents/:id/",
    alias: "crm_documents_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DocumentRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Document,
  },
  {
    method: "patch",
    path: "/api/crm/documents/:id/",
    alias: "crm_documents_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedDocumentRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Document,
  },
  {
    method: "delete",
    path: "/api/crm/documents/:id/",
    alias: "crm_documents_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/documents/filter_options/",
    alias: "crm_documents_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Document,
  },
  {
    method: "get",
    path: "/api/crm/insurance-claims/",
    alias: "crm_insurance_claims_list",
    description: `مطالبات التأمين`,
    requestFormat: "json",
    parameters: [
      {
        name: "order",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "partner",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum([
            "approved",
            "cancelled",
            "draft",
            "paid",
            "partial",
            "rejected",
            "submitted",
            "under_review",
          ])
          .optional(),
      },
    ],
    response: PaginatedInsuranceClaimListList,
  },
  {
    method: "post",
    path: "/api/crm/insurance-claims/",
    alias: "crm_insurance_claims_create",
    description: `مطالبات التأمين`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: InsuranceClaimCreateRequest,
      },
    ],
    response: InsuranceClaimCreate,
  },
  {
    method: "get",
    path: "/api/crm/insurance-claims/:id/",
    alias: "crm_insurance_claims_retrieve",
    description: `مطالبات التأمين`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: InsuranceClaim,
  },
  {
    method: "put",
    path: "/api/crm/insurance-claims/:id/",
    alias: "crm_insurance_claims_update",
    description: `مطالبات التأمين`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: InsuranceClaimRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: InsuranceClaim,
  },
  {
    method: "patch",
    path: "/api/crm/insurance-claims/:id/",
    alias: "crm_insurance_claims_partial_update",
    description: `مطالبات التأمين`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedInsuranceClaimRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: InsuranceClaim,
  },
  {
    method: "delete",
    path: "/api/crm/insurance-claims/:id/",
    alias: "crm_insurance_claims_destroy",
    description: `مطالبات التأمين`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/crm/insurance-claims/:id/approve/",
    alias: "crm_insurance_claims_approve_create",
    description: `اعتماد المطالبة`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ApproveClaimRequestRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ApproveClaimResponse,
  },
  {
    method: "post",
    path: "/api/crm/insurance-claims/:id/mark_paid/",
    alias: "crm_insurance_claims_mark_paid_create",
    description: `تسجيل السداد`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: MarkClaimPaidRequestRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: MarkClaimPaidResponse,
  },
  {
    method: "post",
    path: "/api/crm/insurance-claims/:id/reject/",
    alias: "crm_insurance_claims_reject_create",
    description: `رفض المطالبة`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ reason: z.string().min(1) }).passthrough(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: RejectClaimResponse,
  },
  {
    method: "post",
    path: "/api/crm/insurance-claims/:id/submit/",
    alias: "crm_insurance_claims_submit_create",
    description: `تقديم المطالبة`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: SubmitClaimResponse,
  },
  {
    method: "get",
    path: "/api/crm/insurance-claims/approved_unpaid/",
    alias: "crm_insurance_claims_approved_unpaid_list",
    description: `المطالبات المعتمدة غير المسددة`,
    requestFormat: "json",
    parameters: [
      {
        name: "order",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "partner",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum([
            "approved",
            "cancelled",
            "draft",
            "paid",
            "partial",
            "rejected",
            "submitted",
            "under_review",
          ])
          .optional(),
      },
    ],
    response: PaginatedInsuranceClaimListList,
  },
  {
    method: "get",
    path: "/api/crm/insurance-claims/choices/",
    alias: "crm_insurance_claims_choices_retrieve",
    description: `الخيارات المتاحة`,
    requestFormat: "json",
    response: z
      .object({ claim_status: z.object({}).partial().passthrough() })
      .passthrough(),
  },
  {
    method: "get",
    path: "/api/crm/insurance-claims/filter_options/",
    alias: "crm_insurance_claims_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: InsuranceClaim,
  },
  {
    method: "get",
    path: "/api/crm/insurance-claims/pending/",
    alias: "crm_insurance_claims_pending_list",
    description: `المطالبات المعلقة`,
    requestFormat: "json",
    parameters: [
      {
        name: "order",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "partner",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum([
            "approved",
            "cancelled",
            "draft",
            "paid",
            "partial",
            "rejected",
            "submitted",
            "under_review",
          ])
          .optional(),
      },
    ],
    response: PaginatedInsuranceClaimListList,
  },
  {
    method: "get",
    path: "/api/crm/interactions/",
    alias: "crm_interactions_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "customer",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "interaction_type",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "notes",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedInteractionList,
  },
  {
    method: "post",
    path: "/api/crm/interactions/",
    alias: "crm_interactions_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: InteractionRequest,
      },
    ],
    response: Interaction,
  },
  {
    method: "get",
    path: "/api/crm/interactions/:id/",
    alias: "crm_interactions_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Interaction,
  },
  {
    method: "put",
    path: "/api/crm/interactions/:id/",
    alias: "crm_interactions_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: InteractionRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Interaction,
  },
  {
    method: "patch",
    path: "/api/crm/interactions/:id/",
    alias: "crm_interactions_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedInteractionRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Interaction,
  },
  {
    method: "delete",
    path: "/api/crm/interactions/:id/",
    alias: "crm_interactions_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/interactions/filter_options/",
    alias: "crm_interactions_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Interaction,
  },
  {
    method: "get",
    path: "/api/crm/opportunities/",
    alias: "crm_opportunities_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "amount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "customer",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "stage",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "title",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedOpportunityList,
  },
  {
    method: "post",
    path: "/api/crm/opportunities/",
    alias: "crm_opportunities_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OpportunityRequest,
      },
    ],
    response: Opportunity,
  },
  {
    method: "get",
    path: "/api/crm/opportunities/:id/",
    alias: "crm_opportunities_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Opportunity,
  },
  {
    method: "put",
    path: "/api/crm/opportunities/:id/",
    alias: "crm_opportunities_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OpportunityRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Opportunity,
  },
  {
    method: "patch",
    path: "/api/crm/opportunities/:id/",
    alias: "crm_opportunities_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedOpportunityRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Opportunity,
  },
  {
    method: "delete",
    path: "/api/crm/opportunities/:id/",
    alias: "crm_opportunities_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/opportunities/filter_options/",
    alias: "crm_opportunities_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Opportunity,
  },
  {
    method: "get",
    path: "/api/crm/partner-branches/",
    alias: "crm_partner_branches_list",
    description: `ربط الشركاء بالفروع`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "partner",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedPartnerBranchList,
  },
  {
    method: "post",
    path: "/api/crm/partner-branches/",
    alias: "crm_partner_branches_create",
    description: `ربط الشركاء بالفروع`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PartnerBranchRequest,
      },
    ],
    response: PartnerBranch,
  },
  {
    method: "get",
    path: "/api/crm/partner-branches/:id/",
    alias: "crm_partner_branches_retrieve",
    description: `ربط الشركاء بالفروع`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PartnerBranch,
  },
  {
    method: "put",
    path: "/api/crm/partner-branches/:id/",
    alias: "crm_partner_branches_update",
    description: `ربط الشركاء بالفروع`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PartnerBranchRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PartnerBranch,
  },
  {
    method: "patch",
    path: "/api/crm/partner-branches/:id/",
    alias: "crm_partner_branches_partial_update",
    description: `ربط الشركاء بالفروع`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedPartnerBranchRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PartnerBranch,
  },
  {
    method: "delete",
    path: "/api/crm/partner-branches/:id/",
    alias: "crm_partner_branches_destroy",
    description: `ربط الشركاء بالفروع`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/partner-branches/filter_options/",
    alias: "crm_partner_branches_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: PartnerBranch,
  },
  {
    method: "get",
    path: "/api/crm/partner-settlements/",
    alias: "crm_partner_settlements_list",
    description: `التسويات المالية`,
    requestFormat: "json",
    parameters: [
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "partner",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["confirmed", "disputed", "paid", "pending"]).optional(),
      },
    ],
    response: PaginatedPartnerSettlementList,
  },
  {
    method: "post",
    path: "/api/crm/partner-settlements/",
    alias: "crm_partner_settlements_create",
    description: `التسويات المالية`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PartnerSettlementRequest,
      },
    ],
    response: PartnerSettlement,
  },
  {
    method: "get",
    path: "/api/crm/partner-settlements/:id/",
    alias: "crm_partner_settlements_retrieve",
    description: `التسويات المالية`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PartnerSettlement,
  },
  {
    method: "put",
    path: "/api/crm/partner-settlements/:id/",
    alias: "crm_partner_settlements_update",
    description: `التسويات المالية`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PartnerSettlementRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PartnerSettlement,
  },
  {
    method: "patch",
    path: "/api/crm/partner-settlements/:id/",
    alias: "crm_partner_settlements_partial_update",
    description: `التسويات المالية`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedPartnerSettlementRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PartnerSettlement,
  },
  {
    method: "delete",
    path: "/api/crm/partner-settlements/:id/",
    alias: "crm_partner_settlements_destroy",
    description: `التسويات المالية`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/crm/partner-settlements/:id/calculate/",
    alias: "crm_partner_settlements_calculate_create",
    description: `حساب التسوية من المطالبات`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PartnerSettlementRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PartnerSettlement,
  },
  {
    method: "post",
    path: "/api/crm/partner-settlements/:id/confirm/",
    alias: "crm_partner_settlements_confirm_create",
    description: `تأكيد التسوية`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PartnerSettlementRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PartnerSettlement,
  },
  {
    method: "post",
    path: "/api/crm/partner-settlements/:id/mark_paid/",
    alias: "crm_partner_settlements_mark_paid_create",
    description: `تسجيل سداد التسوية`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PartnerSettlementRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PartnerSettlement,
  },
  {
    method: "get",
    path: "/api/crm/partner-settlements/filter_options/",
    alias: "crm_partner_settlements_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: PartnerSettlement,
  },
  {
    method: "get",
    path: "/api/crm/partners/",
    alias: "crm_partners_list",
    description: `ViewSet للشركاء (تأمين، تقسيط، جملة، شركات)`,
    requestFormat: "json",
    parameters: [
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "partner_type",
        type: "Query",
        schema: z
          .enum(["agent", "bnpl", "corporate", "insurance", "wholesaler"])
          .optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedPartnerListList,
  },
  {
    method: "post",
    path: "/api/crm/partners/",
    alias: "crm_partners_create",
    description: `ViewSet للشركاء (تأمين، تقسيط، جملة، شركات)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PartnerRequest,
      },
    ],
    response: Partner,
  },
  {
    method: "get",
    path: "/api/crm/partners/:id/",
    alias: "crm_partners_retrieve",
    description: `ViewSet للشركاء (تأمين، تقسيط، جملة، شركات)`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Partner,
  },
  {
    method: "put",
    path: "/api/crm/partners/:id/",
    alias: "crm_partners_update",
    description: `ViewSet للشركاء (تأمين، تقسيط، جملة، شركات)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PartnerRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Partner,
  },
  {
    method: "patch",
    path: "/api/crm/partners/:id/",
    alias: "crm_partners_partial_update",
    description: `ViewSet للشركاء (تأمين، تقسيط، جملة، شركات)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedPartnerRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Partner,
  },
  {
    method: "delete",
    path: "/api/crm/partners/:id/",
    alias: "crm_partners_destroy",
    description: `ViewSet للشركاء (تأمين، تقسيط، جملة، شركات)`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/partners/:id/claims_summary/",
    alias: "crm_partners_claims_summary_retrieve",
    description: `ملخص مطالبات الشريك`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PartnerClaimsSummary,
  },
  {
    method: "get",
    path: "/api/crm/partners/:id/customers/",
    alias: "crm_partners_customers_list",
    description: `العملاء المرتبطين بهذا الشريك`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "partner_type",
        type: "Query",
        schema: z
          .enum(["agent", "bnpl", "corporate", "insurance", "wholesaler"])
          .optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedCustomerPartnerLinkList,
  },
  {
    method: "get",
    path: "/api/crm/partners/bnpl_providers/",
    alias: "crm_partners_bnpl_providers_list",
    description: `شركات التقسيط (Tabby, Tamara)`,
    requestFormat: "json",
    parameters: [
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "partner_type",
        type: "Query",
        schema: z
          .enum(["agent", "bnpl", "corporate", "insurance", "wholesaler"])
          .optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedPartnerListList,
  },
  {
    method: "get",
    path: "/api/crm/partners/by_type/",
    alias: "crm_partners_by_type_list",
    description: `جلب الشركاء حسب النوع`,
    requestFormat: "json",
    parameters: [
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "partner_type",
        type: "Query",
        schema: z
          .enum(["agent", "bnpl", "corporate", "insurance", "wholesaler"])
          .optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "type",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: PaginatedPartnerListList,
  },
  {
    method: "get",
    path: "/api/crm/partners/choices/",
    alias: "crm_partners_choices_retrieve",
    description: `الخيارات المتاحة`,
    requestFormat: "json",
    response: PartnerChoices,
  },
  {
    method: "get",
    path: "/api/crm/partners/filter_options/",
    alias: "crm_partners_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Partner,
  },
  {
    method: "get",
    path: "/api/crm/partners/insurance_companies/",
    alias: "crm_partners_insurance_companies_list",
    description: `شركات التأمين فقط`,
    requestFormat: "json",
    parameters: [
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "partner_type",
        type: "Query",
        schema: z
          .enum(["agent", "bnpl", "corporate", "insurance", "wholesaler"])
          .optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedPartnerListList,
  },
  {
    method: "get",
    path: "/api/crm/subscriptions/",
    alias: "crm_subscriptions_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "customer",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "end_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "start_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "subscription_type",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedSubscriptionList,
  },
  {
    method: "post",
    path: "/api/crm/subscriptions/",
    alias: "crm_subscriptions_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SubscriptionRequest,
      },
    ],
    response: Subscription,
  },
  {
    method: "get",
    path: "/api/crm/subscriptions/:id/",
    alias: "crm_subscriptions_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Subscription,
  },
  {
    method: "put",
    path: "/api/crm/subscriptions/:id/",
    alias: "crm_subscriptions_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SubscriptionRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Subscription,
  },
  {
    method: "patch",
    path: "/api/crm/subscriptions/:id/",
    alias: "crm_subscriptions_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedSubscriptionRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Subscription,
  },
  {
    method: "delete",
    path: "/api/crm/subscriptions/:id/",
    alias: "crm_subscriptions_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/subscriptions/filter_options/",
    alias: "crm_subscriptions_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Subscription,
  },
  {
    method: "get",
    path: "/api/crm/tasks/",
    alias: "crm_tasks_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "completed",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "customer",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "description",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "due_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "opportunity",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "priority",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "title",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedTaskList,
  },
  {
    method: "post",
    path: "/api/crm/tasks/",
    alias: "crm_tasks_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: TaskRequest,
      },
    ],
    response: Task,
  },
  {
    method: "get",
    path: "/api/crm/tasks/:id/",
    alias: "crm_tasks_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Task,
  },
  {
    method: "put",
    path: "/api/crm/tasks/:id/",
    alias: "crm_tasks_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: TaskRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Task,
  },
  {
    method: "patch",
    path: "/api/crm/tasks/:id/",
    alias: "crm_tasks_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedTaskRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Task,
  },
  {
    method: "delete",
    path: "/api/crm/tasks/:id/",
    alias: "crm_tasks_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/tasks/filter_options/",
    alias: "crm_tasks_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Task,
  },
  {
    method: "get",
    path: "/api/hrm/attendances/",
    alias: "hrm_attendances_list",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "check_in",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "check_out",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "employee",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "hours_worked",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedAttendanceList,
  },
  {
    method: "post",
    path: "/api/hrm/attendances/",
    alias: "hrm_attendances_create",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AttendanceRequest,
      },
    ],
    response: Attendance,
  },
  {
    method: "get",
    path: "/api/hrm/attendances/:id/",
    alias: "hrm_attendances_retrieve",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Attendance,
  },
  {
    method: "put",
    path: "/api/hrm/attendances/:id/",
    alias: "hrm_attendances_update",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AttendanceRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Attendance,
  },
  {
    method: "patch",
    path: "/api/hrm/attendances/:id/",
    alias: "hrm_attendances_partial_update",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedAttendanceRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Attendance,
  },
  {
    method: "delete",
    path: "/api/hrm/attendances/:id/",
    alias: "hrm_attendances_destroy",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/hrm/attendances/filter_options/",
    alias: "hrm_attendances_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Attendance,
  },
  {
    method: "get",
    path: "/api/hrm/departments/",
    alias: "hrm_departments_list",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "description",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "location",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedDepartmentList,
  },
  {
    method: "post",
    path: "/api/hrm/departments/",
    alias: "hrm_departments_create",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DepartmentRequest,
      },
    ],
    response: Department,
  },
  {
    method: "get",
    path: "/api/hrm/departments/:id/",
    alias: "hrm_departments_retrieve",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Department,
  },
  {
    method: "put",
    path: "/api/hrm/departments/:id/",
    alias: "hrm_departments_update",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DepartmentRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Department,
  },
  {
    method: "patch",
    path: "/api/hrm/departments/:id/",
    alias: "hrm_departments_partial_update",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedDepartmentRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Department,
  },
  {
    method: "delete",
    path: "/api/hrm/departments/:id/",
    alias: "hrm_departments_destroy",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/hrm/departments/filter_options/",
    alias: "hrm_departments_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Department,
  },
  {
    method: "get",
    path: "/api/hrm/employee-form-options/",
    alias: "hrm_employee_form_options_retrieve",
    requestFormat: "json",
    response: EmployeeFormOptionsResponse,
  },
  {
    method: "get",
    path: "/api/hrm/employees/",
    alias: "hrm_employees_list",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "department",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "hire_date_after",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "hire_date_before",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "phone",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "position",
        type: "Query",
        schema: z
          .array(
            z.enum([
              "accountant",
              "admin",
              "customer_service",
              "delivery",
              "employee",
              "hr",
              "manager",
              "marketing",
              "sales",
            ])
          )
          .optional(),
      },
      {
        name: "salary_max",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "salary_min",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "user__username",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedEmployeeList,
  },
  {
    method: "post",
    path: "/api/hrm/employees/",
    alias: "hrm_employees_create",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: EmployeeRequest,
      },
    ],
    response: Employee,
  },
  {
    method: "get",
    path: "/api/hrm/employees/:id/",
    alias: "hrm_employees_retrieve",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Employee,
  },
  {
    method: "put",
    path: "/api/hrm/employees/:id/",
    alias: "hrm_employees_update",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: EmployeeRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Employee,
  },
  {
    method: "patch",
    path: "/api/hrm/employees/:id/",
    alias: "hrm_employees_partial_update",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedEmployeeRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Employee,
  },
  {
    method: "delete",
    path: "/api/hrm/employees/:id/",
    alias: "hrm_employees_destroy",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/hrm/employees/filter_options/",
    alias: "hrm_employees_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Employee,
  },
  {
    method: "get",
    path: "/api/hrm/leaves/",
    alias: "hrm_leaves_list",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "employee",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "end_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "leave_type",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "start_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedLeaveList,
  },
  {
    method: "post",
    path: "/api/hrm/leaves/",
    alias: "hrm_leaves_create",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: LeaveRequest,
      },
    ],
    response: Leave,
  },
  {
    method: "get",
    path: "/api/hrm/leaves/:id/",
    alias: "hrm_leaves_retrieve",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Leave,
  },
  {
    method: "put",
    path: "/api/hrm/leaves/:id/",
    alias: "hrm_leaves_update",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: LeaveRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Leave,
  },
  {
    method: "patch",
    path: "/api/hrm/leaves/:id/",
    alias: "hrm_leaves_partial_update",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedLeaveRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Leave,
  },
  {
    method: "delete",
    path: "/api/hrm/leaves/:id/",
    alias: "hrm_leaves_destroy",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/hrm/leaves/filter_options/",
    alias: "hrm_leaves_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Leave,
  },
  {
    method: "get",
    path: "/api/hrm/notifications/",
    alias: "hrm_notifications_list",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "employee",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "is_read",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "message",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "notification_type",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedNotificationList,
  },
  {
    method: "post",
    path: "/api/hrm/notifications/",
    alias: "hrm_notifications_create",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: NotificationRequest,
      },
    ],
    response: Notification,
  },
  {
    method: "get",
    path: "/api/hrm/notifications/:id/",
    alias: "hrm_notifications_retrieve",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Notification,
  },
  {
    method: "put",
    path: "/api/hrm/notifications/:id/",
    alias: "hrm_notifications_update",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: NotificationRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Notification,
  },
  {
    method: "patch",
    path: "/api/hrm/notifications/:id/",
    alias: "hrm_notifications_partial_update",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedNotificationRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Notification,
  },
  {
    method: "delete",
    path: "/api/hrm/notifications/:id/",
    alias: "hrm_notifications_destroy",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/hrm/notifications/filter_options/",
    alias: "hrm_notifications_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Notification,
  },
  {
    method: "get",
    path: "/api/hrm/payrolls/",
    alias: "hrm_payrolls_list",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "basic_salary",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "bonuses",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "deductions",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "employee",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "journal_entry",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "month",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "net_salary",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedPayrollList,
  },
  {
    method: "post",
    path: "/api/hrm/payrolls/",
    alias: "hrm_payrolls_create",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PayrollRequest,
      },
    ],
    response: Payroll,
  },
  {
    method: "get",
    path: "/api/hrm/payrolls/:id/",
    alias: "hrm_payrolls_retrieve",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Payroll,
  },
  {
    method: "put",
    path: "/api/hrm/payrolls/:id/",
    alias: "hrm_payrolls_update",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PayrollRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Payroll,
  },
  {
    method: "patch",
    path: "/api/hrm/payrolls/:id/",
    alias: "hrm_payrolls_partial_update",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedPayrollRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Payroll,
  },
  {
    method: "delete",
    path: "/api/hrm/payrolls/:id/",
    alias: "hrm_payrolls_destroy",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/hrm/payrolls/filter_options/",
    alias: "hrm_payrolls_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Payroll,
  },
  {
    method: "get",
    path: "/api/hrm/performance-reviews/",
    alias: "hrm_performance_reviews_list",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "comments",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "employee",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "rating",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "review_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedPerformanceReviewList,
  },
  {
    method: "post",
    path: "/api/hrm/performance-reviews/",
    alias: "hrm_performance_reviews_create",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PerformanceReviewRequest,
      },
    ],
    response: PerformanceReview,
  },
  {
    method: "get",
    path: "/api/hrm/performance-reviews/:id/",
    alias: "hrm_performance_reviews_retrieve",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PerformanceReview,
  },
  {
    method: "put",
    path: "/api/hrm/performance-reviews/:id/",
    alias: "hrm_performance_reviews_update",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PerformanceReviewRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PerformanceReview,
  },
  {
    method: "patch",
    path: "/api/hrm/performance-reviews/:id/",
    alias: "hrm_performance_reviews_partial_update",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedPerformanceReviewRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PerformanceReview,
  },
  {
    method: "delete",
    path: "/api/hrm/performance-reviews/:id/",
    alias: "hrm_performance_reviews_destroy",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/hrm/performance-reviews/filter_options/",
    alias: "hrm_performance_reviews_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: PerformanceReview,
  },
  {
    method: "get",
    path: "/api/hrm/tasks/",
    alias: "hrm_tasks_list",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "description",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "due_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "employee",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "title",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedTaskList,
  },
  {
    method: "post",
    path: "/api/hrm/tasks/",
    alias: "hrm_tasks_create",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: TaskRequest,
      },
    ],
    response: Task,
  },
  {
    method: "get",
    path: "/api/hrm/tasks/:id/",
    alias: "hrm_tasks_retrieve",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Task,
  },
  {
    method: "put",
    path: "/api/hrm/tasks/:id/",
    alias: "hrm_tasks_update",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: TaskRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Task,
  },
  {
    method: "patch",
    path: "/api/hrm/tasks/:id/",
    alias: "hrm_tasks_partial_update",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedTaskRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Task,
  },
  {
    method: "delete",
    path: "/api/hrm/tasks/:id/",
    alias: "hrm_tasks_destroy",
    description: `Base ViewSet for HRM that helps restrict access based on employee role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/hrm/tasks/filter_options/",
    alias: "hrm_tasks_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Task,
  },
  {
    method: "get",
    path: "/api/mobile/customers/search/",
    alias: "mobile_customers_search_list",
    description: `Quick customer lookup for mobile`,
    requestFormat: "json",
    parameters: [
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "q",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.array(MobileCustomerLookupItem),
  },
  {
    method: "get",
    path: "/api/mobile/dashboard/",
    alias: "mobile_dashboard_retrieve",
    description: `Mobile Dashboard - All data in one request

Aggregates:
- Today&#x27;s statistics
- Recent orders
- Alerts
- User performance`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch_id",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: MobileDashboardResponse,
  },
  {
    method: "get",
    path: "/api/mobile/orders/:order_id/",
    alias: "mobile_orders_retrieve",
    description: `Mobile order details - Optimized`,
    requestFormat: "json",
    parameters: [
      {
        name: "order_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: MobileOrderDetailResponse,
  },
  {
    method: "get",
    path: "/api/mobile/products/search/",
    alias: "mobile_products_search_list",
    description: `Quick product search for mobile
Returns only required fields to minimize data size`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch_id",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "q",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.array(MobileProductSearchItem),
  },
  {
    method: "post",
    path: "/api/mobile/quick-sale/",
    alias: "mobile_quick_sale_create",
    description: `Quick sale from mobile`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: MobileQuickSaleRequestRequest,
      },
    ],
    response: MobileQuickSaleResponse,
  },
  {
    method: "get",
    path: "/api/mobile/sync/",
    alias: "mobile_sync_retrieve",
    description: `Mobile data sync (offline-first)
Returns only changes since last sync`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch_id",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "since",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: MobileSyncResponse,
  },
  {
    method: "get",
    path: "/api/prescriptions/prescription/",
    alias: "prescriptions_prescription_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "customer",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedPrescriptionRecordList,
  },
  {
    method: "post",
    path: "/api/prescriptions/prescription/",
    alias: "prescriptions_prescription_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PrescriptionRecordRequest,
      },
    ],
    response: PrescriptionRecord,
  },
  {
    method: "get",
    path: "/api/prescriptions/prescription/:id/",
    alias: "prescriptions_prescription_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PrescriptionRecord,
  },
  {
    method: "put",
    path: "/api/prescriptions/prescription/:id/",
    alias: "prescriptions_prescription_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PrescriptionRecordRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PrescriptionRecord,
  },
  {
    method: "patch",
    path: "/api/prescriptions/prescription/:id/",
    alias: "prescriptions_prescription_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedPrescriptionRecordRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PrescriptionRecord,
  },
  {
    method: "delete",
    path: "/api/prescriptions/prescription/:id/",
    alias: "prescriptions_prescription_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/prescriptions/prescription/filter_options/",
    alias: "prescriptions_prescription_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: PrescriptionRecord,
  },
  {
    method: "get",
    path: "/api/products/answers/",
    alias: "products_answers_list",
    description: `ViewSet for managing answers to customer questions.`,
    requestFormat: "json",
    parameters: [
      {
        name: "answer",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "answered_by",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "is_deleted",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "question_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedProductVariantAnswerList,
  },
  {
    method: "post",
    path: "/api/products/answers/",
    alias: "products_answers_create",
    description: `ViewSet for managing answers to customer questions.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProductVariantAnswerRequest,
      },
    ],
    response: ProductVariantAnswer,
  },
  {
    method: "get",
    path: "/api/products/answers/:id/",
    alias: "products_answers_retrieve",
    description: `ViewSet for managing answers to customer questions.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductVariantAnswer,
  },
  {
    method: "put",
    path: "/api/products/answers/:id/",
    alias: "products_answers_update",
    description: `ViewSet for managing answers to customer questions.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProductVariantAnswerRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductVariantAnswer,
  },
  {
    method: "patch",
    path: "/api/products/answers/:id/",
    alias: "products_answers_partial_update",
    description: `ViewSet for managing answers to customer questions.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedProductVariantAnswerRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductVariantAnswer,
  },
  {
    method: "delete",
    path: "/api/products/answers/:id/",
    alias: "products_answers_destroy",
    description: `ViewSet for managing answers to customer questions.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/products/answers/filter_options/",
    alias: "products_answers_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: ProductVariantAnswer,
  },
  {
    method: "get",
    path: "/api/products/attribute-values/",
    alias: "products_attribute_values_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "value__icontains",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedAttributeValueList,
  },
  {
    method: "post",
    path: "/api/products/attribute-values/",
    alias: "products_attribute_values_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AttributeValueRequest,
      },
    ],
    response: AttributeValue,
  },
  {
    method: "get",
    path: "/api/products/attribute-values/:id/",
    alias: "products_attribute_values_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: AttributeValue,
  },
  {
    method: "put",
    path: "/api/products/attribute-values/:id/",
    alias: "products_attribute_values_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AttributeValueRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: AttributeValue,
  },
  {
    method: "patch",
    path: "/api/products/attribute-values/:id/",
    alias: "products_attribute_values_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedAttributeValueRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: AttributeValue,
  },
  {
    method: "delete",
    path: "/api/products/attribute-values/:id/",
    alias: "products_attribute_values_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/products/attribute-values/filter_options/",
    alias: "products_attribute_values_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: AttributeValue,
  },
  {
    method: "get",
    path: "/api/products/attributes/",
    alias: "products_attributes_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "is_deleted",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "values",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedAttributeList,
  },
  {
    method: "post",
    path: "/api/products/attributes/",
    alias: "products_attributes_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AttributeRequest,
      },
    ],
    response: Attribute,
  },
  {
    method: "get",
    path: "/api/products/attributes/:id/",
    alias: "products_attributes_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Attribute,
  },
  {
    method: "put",
    path: "/api/products/attributes/:id/",
    alias: "products_attributes_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AttributeRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Attribute,
  },
  {
    method: "patch",
    path: "/api/products/attributes/:id/",
    alias: "products_attributes_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedAttributeRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Attribute,
  },
  {
    method: "delete",
    path: "/api/products/attributes/:id/",
    alias: "products_attributes_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/products/attributes/filter_options/",
    alias: "products_attributes_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Attribute,
  },
  {
    method: "get",
    path: "/api/products/branches/:branch_id/low-stock/",
    alias: "products_branches_low_stock_list",
    description: `API View to list low stock items for a specific branch.
Low stock is defined as: quantity_in_stock &lt;&#x3D; reorder_level + reserved_quantity`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.array(Stock),
  },
  {
    method: "get",
    path: "/api/products/branches/active/",
    alias: "products_branches_active_list",
    description: `API View to list all active branches.`,
    requestFormat: "json",
    response: z.array(Branch),
  },
  {
    method: "get",
    path: "/api/products/branches/main/",
    alias: "products_branches_main_retrieve",
    description: `API View to get the main branch details.`,
    requestFormat: "json",
    response: Branch,
  },
  {
    method: "get",
    path: "/api/products/brands/",
    alias: "products_brands_list",
    description: `ViewSet for managing Brands.`,
    requestFormat: "json",
    parameters: [
      {
        name: "country",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "description",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "is_deleted",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "logo",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "product_type",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "website",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedBrandList,
  },
  {
    method: "post",
    path: "/api/products/brands/",
    alias: "products_brands_create",
    description: `ViewSet for managing Brands.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BrandRequest,
      },
    ],
    response: Brand,
  },
  {
    method: "get",
    path: "/api/products/brands/:id/",
    alias: "products_brands_retrieve",
    description: `ViewSet for managing Brands.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Brand,
  },
  {
    method: "put",
    path: "/api/products/brands/:id/",
    alias: "products_brands_update",
    description: `ViewSet for managing Brands.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BrandRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Brand,
  },
  {
    method: "patch",
    path: "/api/products/brands/:id/",
    alias: "products_brands_partial_update",
    description: `ViewSet for managing Brands.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedBrandRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Brand,
  },
  {
    method: "delete",
    path: "/api/products/brands/:id/",
    alias: "products_brands_destroy",
    description: `ViewSet for managing Brands.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/products/brands/filter_options/",
    alias: "products_brands_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Brand,
  },
  {
    method: "get",
    path: "/api/products/categories/",
    alias: "products_categories_list",
    description: `ViewSet for managing Product Categories.`,
    requestFormat: "json",
    parameters: [
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "description",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "parent",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedCategoryList,
  },
  {
    method: "post",
    path: "/api/products/categories/",
    alias: "products_categories_create",
    description: `ViewSet for managing Product Categories.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CategoryRequest,
      },
    ],
    response: Category,
  },
  {
    method: "get",
    path: "/api/products/categories/:id/",
    alias: "products_categories_retrieve",
    description: `ViewSet for managing Product Categories.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Category,
  },
  {
    method: "put",
    path: "/api/products/categories/:id/",
    alias: "products_categories_update",
    description: `ViewSet for managing Product Categories.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CategoryRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Category,
  },
  {
    method: "patch",
    path: "/api/products/categories/:id/",
    alias: "products_categories_partial_update",
    description: `ViewSet for managing Product Categories.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedCategoryRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Category,
  },
  {
    method: "delete",
    path: "/api/products/categories/:id/",
    alias: "products_categories_destroy",
    description: `ViewSet for managing Product Categories.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/products/categories/filter_options/",
    alias: "products_categories_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Category,
  },
  {
    method: "get",
    path: "/api/products/flexible-prices/",
    alias: "products_flexible_prices_list",
    description: `ViewSet for managing Flexible Pricing rules.`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "currency",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "customer",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "customer_group",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "end_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "min_quantity",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "partner",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "pricing_policy",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "priority",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "special_price",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "start_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "variant",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedFlexiblePriceList,
  },
  {
    method: "post",
    path: "/api/products/flexible-prices/",
    alias: "products_flexible_prices_create",
    description: `ViewSet for managing Flexible Pricing rules.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: FlexiblePriceRequest,
      },
    ],
    response: FlexiblePrice,
  },
  {
    method: "get",
    path: "/api/products/flexible-prices/:id/",
    alias: "products_flexible_prices_retrieve",
    description: `ViewSet for managing Flexible Pricing rules.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: FlexiblePrice,
  },
  {
    method: "put",
    path: "/api/products/flexible-prices/:id/",
    alias: "products_flexible_prices_update",
    description: `ViewSet for managing Flexible Pricing rules.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: FlexiblePriceRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: FlexiblePrice,
  },
  {
    method: "patch",
    path: "/api/products/flexible-prices/:id/",
    alias: "products_flexible_prices_partial_update",
    description: `ViewSet for managing Flexible Pricing rules.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedFlexiblePriceRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: FlexiblePrice,
  },
  {
    method: "delete",
    path: "/api/products/flexible-prices/:id/",
    alias: "products_flexible_prices_destroy",
    description: `ViewSet for managing Flexible Pricing rules.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/products/flexible-prices/filter_options/",
    alias: "products_flexible_prices_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: FlexiblePrice,
  },
  {
    method: "get",
    path: "/api/products/manufacturers/",
    alias: "products_manufacturers_list",
    description: `ViewSet for managing Manufacturers.`,
    requestFormat: "json",
    parameters: [
      {
        name: "country",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "email",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "phone",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "website",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedManufacturerList,
  },
  {
    method: "post",
    path: "/api/products/manufacturers/",
    alias: "products_manufacturers_create",
    description: `ViewSet for managing Manufacturers.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ManufacturerRequest,
      },
    ],
    response: Manufacturer,
  },
  {
    method: "get",
    path: "/api/products/manufacturers/:id/",
    alias: "products_manufacturers_retrieve",
    description: `ViewSet for managing Manufacturers.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Manufacturer,
  },
  {
    method: "put",
    path: "/api/products/manufacturers/:id/",
    alias: "products_manufacturers_update",
    description: `ViewSet for managing Manufacturers.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ManufacturerRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Manufacturer,
  },
  {
    method: "patch",
    path: "/api/products/manufacturers/:id/",
    alias: "products_manufacturers_partial_update",
    description: `ViewSet for managing Manufacturers.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedManufacturerRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Manufacturer,
  },
  {
    method: "delete",
    path: "/api/products/manufacturers/:id/",
    alias: "products_manufacturers_destroy",
    description: `ViewSet for managing Manufacturers.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/products/manufacturers/filter_options/",
    alias: "products_manufacturers_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Manufacturer,
  },
  {
    method: "get",
    path: "/api/products/marketing/",
    alias: "products_marketing_list",
    description: `ViewSet for managing Product Variant Marketing details (e.g., SEO, campaigns).`,
    requestFormat: "json",
    parameters: [
      {
        name: "age_group",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "description",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "gender",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "is_deleted",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "meta_description",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "meta_keywords",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "meta_title",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "seo_image",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "seo_image_alt",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "slug",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "title",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "variant",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedProductVariantMarketingList,
  },
  {
    method: "post",
    path: "/api/products/marketing/",
    alias: "products_marketing_create",
    description: `ViewSet for managing Product Variant Marketing details (e.g., SEO, campaigns).`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProductVariantMarketingRequest,
      },
    ],
    response: ProductVariantMarketing,
  },
  {
    method: "get",
    path: "/api/products/marketing/:id/",
    alias: "products_marketing_retrieve",
    description: `ViewSet for managing Product Variant Marketing details (e.g., SEO, campaigns).`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductVariantMarketing,
  },
  {
    method: "put",
    path: "/api/products/marketing/:id/",
    alias: "products_marketing_update",
    description: `ViewSet for managing Product Variant Marketing details (e.g., SEO, campaigns).`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProductVariantMarketingRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductVariantMarketing,
  },
  {
    method: "patch",
    path: "/api/products/marketing/:id/",
    alias: "products_marketing_partial_update",
    description: `ViewSet for managing Product Variant Marketing details (e.g., SEO, campaigns).`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedProductVariantMarketingRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductVariantMarketing,
  },
  {
    method: "delete",
    path: "/api/products/marketing/:id/",
    alias: "products_marketing_destroy",
    description: `ViewSet for managing Product Variant Marketing details (e.g., SEO, campaigns).`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/products/marketing/filter_options/",
    alias: "products_marketing_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: ProductVariantMarketing,
  },
  {
    method: "get",
    path: "/api/products/offers/",
    alias: "products_offers_list",
    description: `ViewSet for managing special offers on product variants.`,
    requestFormat: "json",
    parameters: [
      {
        name: "ProductVariant_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "end_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "is_deleted",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "offer",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "start_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedProductVariantOfferList,
  },
  {
    method: "post",
    path: "/api/products/offers/",
    alias: "products_offers_create",
    description: `ViewSet for managing special offers on product variants.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProductVariantOfferRequest,
      },
    ],
    response: ProductVariantOffer,
  },
  {
    method: "get",
    path: "/api/products/offers/:id/",
    alias: "products_offers_retrieve",
    description: `ViewSet for managing special offers on product variants.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductVariantOffer,
  },
  {
    method: "put",
    path: "/api/products/offers/:id/",
    alias: "products_offers_update",
    description: `ViewSet for managing special offers on product variants.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProductVariantOfferRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductVariantOffer,
  },
  {
    method: "patch",
    path: "/api/products/offers/:id/",
    alias: "products_offers_partial_update",
    description: `ViewSet for managing special offers on product variants.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedProductVariantOfferRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductVariantOffer,
  },
  {
    method: "delete",
    path: "/api/products/offers/:id/",
    alias: "products_offers_destroy",
    description: `ViewSet for managing special offers on product variants.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/products/offers/filter_options/",
    alias: "products_offers_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: ProductVariantOffer,
  },
  {
    method: "post",
    path: "/api/products/orders/fulfillment-check/",
    alias: "products_orders_fulfillment_check_create",
    description: `Expecting JSON in the format:
{
    &quot;items&quot;: [
        {&quot;variant_id&quot;: 1, &quot;quantity&quot;: 3},
        {&quot;variant_id&quot;: 5, &quot;quantity&quot;: 2}
    ]
}`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OrderFulfillmentCheckRequestRequest,
      },
    ],
    response: OrderFulfillmentCheckResponse,
  },
  {
    method: "get",
    path: "/api/products/pricing-policies/",
    alias: "products_pricing_policies_list",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedPricingPolicyList,
  },
  {
    method: "post",
    path: "/api/products/pricing-policies/",
    alias: "products_pricing_policies_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PricingPolicyRequest,
      },
    ],
    response: PricingPolicy,
  },
  {
    method: "get",
    path: "/api/products/pricing-policies/:id/",
    alias: "products_pricing_policies_retrieve",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PricingPolicy,
  },
  {
    method: "put",
    path: "/api/products/pricing-policies/:id/",
    alias: "products_pricing_policies_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PricingPolicyRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PricingPolicy,
  },
  {
    method: "patch",
    path: "/api/products/pricing-policies/:id/",
    alias: "products_pricing_policies_partial_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedPricingPolicyRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PricingPolicy,
  },
  {
    method: "delete",
    path: "/api/products/pricing-policies/:id/",
    alias: "products_pricing_policies_destroy",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/products/product-images/",
    alias: "products_product_images_list",
    description: `ViewSet for managing Product Images.`,
    requestFormat: "json",
    parameters: [
      {
        name: "alt_text",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "image",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_primary",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "order",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "variant",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedProductImageList,
  },
  {
    method: "post",
    path: "/api/products/product-images/",
    alias: "products_product_images_create",
    description: `ViewSet for managing Product Images.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProductImageRequest,
      },
    ],
    response: ProductImage,
  },
  {
    method: "get",
    path: "/api/products/product-images/:id/",
    alias: "products_product_images_retrieve",
    description: `ViewSet for managing Product Images.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductImage,
  },
  {
    method: "put",
    path: "/api/products/product-images/:id/",
    alias: "products_product_images_update",
    description: `ViewSet for managing Product Images.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProductImageRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductImage,
  },
  {
    method: "patch",
    path: "/api/products/product-images/:id/",
    alias: "products_product_images_partial_update",
    description: `ViewSet for managing Product Images.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedProductImageRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductImage,
  },
  {
    method: "delete",
    path: "/api/products/product-images/:id/",
    alias: "products_product_images_destroy",
    description: `ViewSet for managing Product Images.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/products/product-images/filter_options/",
    alias: "products_product_images_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: ProductImage,
  },
  {
    method: "get",
    path: "/api/products/products/",
    alias: "products_products_list",
    description: `ViewSet for managing main Products.`,
    requestFormat: "json",
    parameters: [
      {
        name: "brand",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "categories",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "description",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "main_group",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "manufacturer",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "model",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "sku",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "variant_type",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "variants",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedProductList,
  },
  {
    method: "post",
    path: "/api/products/products/",
    alias: "products_products_create",
    description: `ViewSet for managing main Products.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProductRequest,
      },
    ],
    response: Product,
  },
  {
    method: "get",
    path: "/api/products/products/:id/",
    alias: "products_products_retrieve",
    description: `ViewSet for managing main Products.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Product,
  },
  {
    method: "put",
    path: "/api/products/products/:id/",
    alias: "products_products_update",
    description: `ViewSet for managing main Products.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProductRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Product,
  },
  {
    method: "patch",
    path: "/api/products/products/:id/",
    alias: "products_products_partial_update",
    description: `ViewSet for managing main Products.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedProductRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Product,
  },
  {
    method: "delete",
    path: "/api/products/products/:id/",
    alias: "products_products_destroy",
    description: `ViewSet for managing main Products.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/products/products/filter_options/",
    alias: "products_products_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Product,
  },
  {
    method: "post",
    path: "/api/products/products/import-csv/",
    alias: "products_products_import_csv_create",
    description: `Import products from CSV file using server-side configuration`,
    requestFormat: "form-data",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ file: z.instanceof(File) }).passthrough(),
      },
    ],
    response: ProductImportSuccessResponse,
    errors: [
      {
        status: 400,
        schema: z.object({ error: z.string() }).passthrough(),
      },
      {
        status: 500,
        schema: z.object({ detail: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/products/purchase-orders/",
    alias: "products_purchase_orders_list",
    description: `ViewSet for Purchase Order Management

Endpoints:
- GET /purchase-orders/ - List orders
- GET /purchase-orders/{id}/ - Order details
- POST /purchase-orders/ - Create order
- POST /purchase-orders/{id}/submit/ - Submit for approval
- POST /purchase-orders/{id}/approve/ - Approve order
- POST /purchase-orders/{id}/receive/ - Receive items
- POST /purchase-orders/{id}/cancel/ - Cancel order`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum([
            "approved",
            "cancelled",
            "draft",
            "partially_received",
            "received",
            "submitted",
          ])
          .optional(),
      },
      {
        name: "supplier",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedPurchaseOrderList,
  },
  {
    method: "post",
    path: "/api/products/purchase-orders/",
    alias: "products_purchase_orders_create",
    description: `Create a new purchase order with items`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PurchaseOrderCreateRequest,
      },
    ],
    response: PurchaseOrder,
  },
  {
    method: "get",
    path: "/api/products/purchase-orders/:id/",
    alias: "products_purchase_orders_retrieve",
    description: `ViewSet for Purchase Order Management

Endpoints:
- GET /purchase-orders/ - List orders
- GET /purchase-orders/{id}/ - Order details
- POST /purchase-orders/ - Create order
- POST /purchase-orders/{id}/submit/ - Submit for approval
- POST /purchase-orders/{id}/approve/ - Approve order
- POST /purchase-orders/{id}/receive/ - Receive items
- POST /purchase-orders/{id}/cancel/ - Cancel order`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PurchaseOrder,
  },
  {
    method: "put",
    path: "/api/products/purchase-orders/:id/",
    alias: "products_purchase_orders_update",
    description: `ViewSet for Purchase Order Management

Endpoints:
- GET /purchase-orders/ - List orders
- GET /purchase-orders/{id}/ - Order details
- POST /purchase-orders/ - Create order
- POST /purchase-orders/{id}/submit/ - Submit for approval
- POST /purchase-orders/{id}/approve/ - Approve order
- POST /purchase-orders/{id}/receive/ - Receive items
- POST /purchase-orders/{id}/cancel/ - Cancel order`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PurchaseOrderRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PurchaseOrder,
  },
  {
    method: "patch",
    path: "/api/products/purchase-orders/:id/",
    alias: "products_purchase_orders_partial_update",
    description: `ViewSet for Purchase Order Management

Endpoints:
- GET /purchase-orders/ - List orders
- GET /purchase-orders/{id}/ - Order details
- POST /purchase-orders/ - Create order
- POST /purchase-orders/{id}/submit/ - Submit for approval
- POST /purchase-orders/{id}/approve/ - Approve order
- POST /purchase-orders/{id}/receive/ - Receive items
- POST /purchase-orders/{id}/cancel/ - Cancel order`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedPurchaseOrderRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PurchaseOrder,
  },
  {
    method: "delete",
    path: "/api/products/purchase-orders/:id/",
    alias: "products_purchase_orders_destroy",
    description: `ViewSet for Purchase Order Management

Endpoints:
- GET /purchase-orders/ - List orders
- GET /purchase-orders/{id}/ - Order details
- POST /purchase-orders/ - Create order
- POST /purchase-orders/{id}/submit/ - Submit for approval
- POST /purchase-orders/{id}/approve/ - Approve order
- POST /purchase-orders/{id}/receive/ - Receive items
- POST /purchase-orders/{id}/cancel/ - Cancel order`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/products/purchase-orders/:id/approve/",
    alias: "products_purchase_orders_approve_create",
    description: `Approve the order`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PurchaseOrderRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PurchaseOrder,
  },
  {
    method: "post",
    path: "/api/products/purchase-orders/:id/cancel/",
    alias: "products_purchase_orders_cancel_create",
    description: `Cancel the order`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PurchaseOrderRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PurchaseOrder,
  },
  {
    method: "post",
    path: "/api/products/purchase-orders/:id/receive/",
    alias: "products_purchase_orders_receive_create",
    description: `Receive items and update stock`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ReceiveItemsRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PurchaseOrder,
  },
  {
    method: "post",
    path: "/api/products/purchase-orders/:id/submit/",
    alias: "products_purchase_orders_submit_create",
    description: `Submit order for approval`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PurchaseOrderRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PurchaseOrder,
  },
  {
    method: "get",
    path: "/api/products/purchase-orders/filter_options/",
    alias: "products_purchase_orders_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: PurchaseOrder,
  },
  {
    method: "get",
    path: "/api/products/questions/",
    alias: "products_questions_list",
    description: `ViewSet for managing customer questions about product variants.`,
    requestFormat: "json",
    parameters: [
      {
        name: "ProductVariant_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "asked_by",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "is_deleted",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "question",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedProductVariantQuestionList,
  },
  {
    method: "post",
    path: "/api/products/questions/",
    alias: "products_questions_create",
    description: `ViewSet for managing customer questions about product variants.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProductVariantQuestionRequest,
      },
    ],
    response: ProductVariantQuestion,
  },
  {
    method: "get",
    path: "/api/products/questions/:id/",
    alias: "products_questions_retrieve",
    description: `ViewSet for managing customer questions about product variants.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductVariantQuestion,
  },
  {
    method: "put",
    path: "/api/products/questions/:id/",
    alias: "products_questions_update",
    description: `ViewSet for managing customer questions about product variants.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProductVariantQuestionRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductVariantQuestion,
  },
  {
    method: "patch",
    path: "/api/products/questions/:id/",
    alias: "products_questions_partial_update",
    description: `ViewSet for managing customer questions about product variants.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedProductVariantQuestionRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductVariantQuestion,
  },
  {
    method: "delete",
    path: "/api/products/questions/:id/",
    alias: "products_questions_destroy",
    description: `ViewSet for managing customer questions about product variants.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/products/questions/filter_options/",
    alias: "products_questions_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: ProductVariantQuestion,
  },
  {
    method: "get",
    path: "/api/products/reviews/",
    alias: "products_reviews_list",
    description: `ViewSet for managing customer reviews on product variants.`,
    requestFormat: "json",
    parameters: [
      {
        name: "ProductVariant_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "is_deleted",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "rating",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "review",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "reviewed_by",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedProductVariantReviewList,
  },
  {
    method: "post",
    path: "/api/products/reviews/",
    alias: "products_reviews_create",
    description: `ViewSet for managing customer reviews on product variants.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProductVariantReviewRequest,
      },
    ],
    response: ProductVariantReview,
  },
  {
    method: "get",
    path: "/api/products/reviews/:id/",
    alias: "products_reviews_retrieve",
    description: `ViewSet for managing customer reviews on product variants.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductVariantReview,
  },
  {
    method: "put",
    path: "/api/products/reviews/:id/",
    alias: "products_reviews_update",
    description: `ViewSet for managing customer reviews on product variants.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProductVariantReviewRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductVariantReview,
  },
  {
    method: "patch",
    path: "/api/products/reviews/:id/",
    alias: "products_reviews_partial_update",
    description: `ViewSet for managing customer reviews on product variants.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedProductVariantReviewRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductVariantReview,
  },
  {
    method: "delete",
    path: "/api/products/reviews/:id/",
    alias: "products_reviews_destroy",
    description: `ViewSet for managing customer reviews on product variants.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/products/reviews/filter_options/",
    alias: "products_reviews_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: ProductVariantReview,
  },
  {
    method: "get",
    path: "/api/products/stock-movements/",
    alias: "products_stock_movements_list",
    description: `ViewSet for Stock Movements

Endpoints:
- GET /stock-movements/ - List movements
- POST /stock-movements/ - Add new movement (purchase, sale, adjustment, etc.)
- GET /stock-movements/by_stock/{stock_id}/ - Movements for specific stock`,
    requestFormat: "json",
    parameters: [
      {
        name: "movement_type",
        type: "Query",
        schema: z
          .enum([
            "adjustment",
            "damage",
            "purchase",
            "release",
            "reserve",
            "return",
            "return_to_supplier",
            "sale",
            "transfer_in",
            "transfer_out",
          ])
          .optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "stock",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedStockMovementList,
  },
  {
    method: "post",
    path: "/api/products/stock-movements/",
    alias: "products_stock_movements_create",
    description: `Create new stock movement with user logging`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StockMovementCreateRequest,
      },
    ],
    response: StockMovementCreate,
  },
  {
    method: "get",
    path: "/api/products/stock-movements/:id/",
    alias: "products_stock_movements_retrieve",
    description: `ViewSet for Stock Movements

Endpoints:
- GET /stock-movements/ - List movements
- POST /stock-movements/ - Add new movement (purchase, sale, adjustment, etc.)
- GET /stock-movements/by_stock/{stock_id}/ - Movements for specific stock`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StockMovement,
  },
  {
    method: "put",
    path: "/api/products/stock-movements/:id/",
    alias: "products_stock_movements_update",
    description: `ViewSet for Stock Movements

Endpoints:
- GET /stock-movements/ - List movements
- POST /stock-movements/ - Add new movement (purchase, sale, adjustment, etc.)
- GET /stock-movements/by_stock/{stock_id}/ - Movements for specific stock`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StockMovementRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StockMovement,
  },
  {
    method: "patch",
    path: "/api/products/stock-movements/:id/",
    alias: "products_stock_movements_partial_update",
    description: `ViewSet for Stock Movements

Endpoints:
- GET /stock-movements/ - List movements
- POST /stock-movements/ - Add new movement (purchase, sale, adjustment, etc.)
- GET /stock-movements/by_stock/{stock_id}/ - Movements for specific stock`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedStockMovementRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StockMovement,
  },
  {
    method: "delete",
    path: "/api/products/stock-movements/:id/",
    alias: "products_stock_movements_destroy",
    description: `ViewSet for Stock Movements

Endpoints:
- GET /stock-movements/ - List movements
- POST /stock-movements/ - Add new movement (purchase, sale, adjustment, etc.)
- GET /stock-movements/by_stock/{stock_id}/ - Movements for specific stock`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/products/stock-movements/adjustment/",
    alias: "products_stock_movements_adjustment_create",
    description: `Stock adjustment (Increase or Decrease)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StockMovementCreateRequest,
      },
    ],
    response: StockMovement,
    errors: [
      {
        status: 400,
        description: `No response body`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/products/stock-movements/by-stock/:stock_id/",
    alias: "products_stock_movements_by_stock_list",
    description: `Movements for specific stock`,
    requestFormat: "json",
    parameters: [
      {
        name: "movement_type",
        type: "Query",
        schema: z
          .enum([
            "adjustment",
            "damage",
            "purchase",
            "release",
            "reserve",
            "return",
            "return_to_supplier",
            "sale",
            "transfer_in",
            "transfer_out",
          ])
          .optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "stock",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "stock_id",
        type: "Query",
        schema: z.number().int(),
      },
    ],
    response: PaginatedStockMovementList,
  },
  {
    method: "get",
    path: "/api/products/stock-movements/filter_options/",
    alias: "products_stock_movements_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: StockMovement,
  },
  {
    method: "post",
    path: "/api/products/stock-movements/purchase/",
    alias: "products_stock_movements_purchase_create",
    description: `Add purchase (Restock)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StockMovementCreateRequest,
      },
    ],
    response: StockMovement,
    errors: [
      {
        status: 400,
        description: `No response body`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/products/stock-transfer-items/",
    alias: "products_stock_transfer_items_list",
    description: `ViewSet for Transfer Items`,
    requestFormat: "json",
    parameters: [
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "transfer",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedStockTransferItemList,
  },
  {
    method: "post",
    path: "/api/products/stock-transfer-items/",
    alias: "products_stock_transfer_items_create",
    description: `ViewSet for Transfer Items`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StockTransferItemRequest,
      },
    ],
    response: StockTransferItem,
  },
  {
    method: "get",
    path: "/api/products/stock-transfer-items/:id/",
    alias: "products_stock_transfer_items_retrieve",
    description: `ViewSet for Transfer Items`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StockTransferItem,
  },
  {
    method: "put",
    path: "/api/products/stock-transfer-items/:id/",
    alias: "products_stock_transfer_items_update",
    description: `ViewSet for Transfer Items`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StockTransferItemRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StockTransferItem,
  },
  {
    method: "patch",
    path: "/api/products/stock-transfer-items/:id/",
    alias: "products_stock_transfer_items_partial_update",
    description: `ViewSet for Transfer Items`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedStockTransferItemRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StockTransferItem,
  },
  {
    method: "delete",
    path: "/api/products/stock-transfer-items/:id/",
    alias: "products_stock_transfer_items_destroy",
    description: `ViewSet for Transfer Items`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/products/stock-transfer-items/filter_options/",
    alias: "products_stock_transfer_items_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: StockTransferItem,
  },
  {
    method: "get",
    path: "/api/products/stock-transfers/",
    alias: "products_stock_transfers_list",
    description: `ViewSet for Inter-Branch Transfers

Uses TransferBranchAccessMixin to show transfers relevant to the user&#x27;s branch
(either as sender or receiver).

Endpoints:
- GET /stock-transfers/ - List transfers
- POST /stock-transfers/ - Create transfer
- POST /stock-transfers/{id}/submit/ - Submit transfer for approval
- POST /stock-transfers/{id}/approve/ - Approve transfer
- POST /stock-transfers/{id}/ship/ - Ship transfer
- POST /stock-transfers/{id}/receive/ - Receive transfer
- POST /stock-transfers/{id}/cancel/ - Cancel transfer`,
    requestFormat: "json",
    parameters: [
      {
        name: "from_branch",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum([
            "cancelled",
            "completed",
            "pending",
            "received",
            "shipped",
            "submitted",
          ])
          .optional(),
      },
      {
        name: "to_branch",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedStockTransferList,
  },
  {
    method: "post",
    path: "/api/products/stock-transfers/",
    alias: "products_stock_transfers_create",
    description: `ViewSet for Inter-Branch Transfers

Uses TransferBranchAccessMixin to show transfers relevant to the user&#x27;s branch
(either as sender or receiver).

Endpoints:
- GET /stock-transfers/ - List transfers
- POST /stock-transfers/ - Create transfer
- POST /stock-transfers/{id}/submit/ - Submit transfer for approval
- POST /stock-transfers/{id}/approve/ - Approve transfer
- POST /stock-transfers/{id}/ship/ - Ship transfer
- POST /stock-transfers/{id}/receive/ - Receive transfer
- POST /stock-transfers/{id}/cancel/ - Cancel transfer`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StockTransferCreateRequest,
      },
    ],
    response: StockTransferCreate,
  },
  {
    method: "get",
    path: "/api/products/stock-transfers/:id/",
    alias: "products_stock_transfers_retrieve",
    description: `ViewSet for Inter-Branch Transfers

Uses TransferBranchAccessMixin to show transfers relevant to the user&#x27;s branch
(either as sender or receiver).

Endpoints:
- GET /stock-transfers/ - List transfers
- POST /stock-transfers/ - Create transfer
- POST /stock-transfers/{id}/submit/ - Submit transfer for approval
- POST /stock-transfers/{id}/approve/ - Approve transfer
- POST /stock-transfers/{id}/ship/ - Ship transfer
- POST /stock-transfers/{id}/receive/ - Receive transfer
- POST /stock-transfers/{id}/cancel/ - Cancel transfer`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StockTransfer,
  },
  {
    method: "put",
    path: "/api/products/stock-transfers/:id/",
    alias: "products_stock_transfers_update",
    description: `ViewSet for Inter-Branch Transfers

Uses TransferBranchAccessMixin to show transfers relevant to the user&#x27;s branch
(either as sender or receiver).

Endpoints:
- GET /stock-transfers/ - List transfers
- POST /stock-transfers/ - Create transfer
- POST /stock-transfers/{id}/submit/ - Submit transfer for approval
- POST /stock-transfers/{id}/approve/ - Approve transfer
- POST /stock-transfers/{id}/ship/ - Ship transfer
- POST /stock-transfers/{id}/receive/ - Receive transfer
- POST /stock-transfers/{id}/cancel/ - Cancel transfer`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StockTransferRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StockTransfer,
  },
  {
    method: "patch",
    path: "/api/products/stock-transfers/:id/",
    alias: "products_stock_transfers_partial_update",
    description: `ViewSet for Inter-Branch Transfers

Uses TransferBranchAccessMixin to show transfers relevant to the user&#x27;s branch
(either as sender or receiver).

Endpoints:
- GET /stock-transfers/ - List transfers
- POST /stock-transfers/ - Create transfer
- POST /stock-transfers/{id}/submit/ - Submit transfer for approval
- POST /stock-transfers/{id}/approve/ - Approve transfer
- POST /stock-transfers/{id}/ship/ - Ship transfer
- POST /stock-transfers/{id}/receive/ - Receive transfer
- POST /stock-transfers/{id}/cancel/ - Cancel transfer`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedStockTransferRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StockTransfer,
  },
  {
    method: "delete",
    path: "/api/products/stock-transfers/:id/",
    alias: "products_stock_transfers_destroy",
    description: `ViewSet for Inter-Branch Transfers

Uses TransferBranchAccessMixin to show transfers relevant to the user&#x27;s branch
(either as sender or receiver).

Endpoints:
- GET /stock-transfers/ - List transfers
- POST /stock-transfers/ - Create transfer
- POST /stock-transfers/{id}/submit/ - Submit transfer for approval
- POST /stock-transfers/{id}/approve/ - Approve transfer
- POST /stock-transfers/{id}/ship/ - Ship transfer
- POST /stock-transfers/{id}/receive/ - Receive transfer
- POST /stock-transfers/{id}/cancel/ - Cancel transfer`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/products/stock-transfers/:id/approve/",
    alias: "products_stock_transfers_approve_create",
    description: `Approve transfer`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StockTransferRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StockTransfer,
  },
  {
    method: "post",
    path: "/api/products/stock-transfers/:id/cancel/",
    alias: "products_stock_transfers_cancel_create",
    description: `Cancel transfer`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StockTransferRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StockTransfer,
  },
  {
    method: "post",
    path: "/api/products/stock-transfers/:id/receive/",
    alias: "products_stock_transfers_receive_create",
    description: `Receive transfer - Adds to receiving branch`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StockTransferRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StockTransfer,
  },
  {
    method: "post",
    path: "/api/products/stock-transfers/:id/ship/",
    alias: "products_stock_transfers_ship_create",
    description: `Ship transfer - Deducts from sending branch`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StockTransferRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StockTransfer,
  },
  {
    method: "post",
    path: "/api/products/stock-transfers/:id/submit/",
    alias: "products_stock_transfers_submit_create",
    description: `Submit transfer for approval`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StockTransferRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StockTransfer,
  },
  {
    method: "get",
    path: "/api/products/stock-transfers/filter_options/",
    alias: "products_stock_transfers_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: StockTransfer,
  },
  {
    method: "get",
    path: "/api/products/stock-transfers/incoming/",
    alias: "products_stock_transfers_incoming_list",
    description: `Incoming transfers to current branch`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch_id",
        type: "Query",
        schema: z.number().int(),
      },
      {
        name: "from_branch",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum([
            "cancelled",
            "completed",
            "pending",
            "received",
            "shipped",
            "submitted",
          ])
          .optional(),
      },
      {
        name: "to_branch",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedStockTransferList,
  },
  {
    method: "get",
    path: "/api/products/stock-transfers/outgoing/",
    alias: "products_stock_transfers_outgoing_list",
    description: `Outgoing transfers from current branch`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch_id",
        type: "Query",
        schema: z.number().int(),
      },
      {
        name: "from_branch",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum([
            "cancelled",
            "completed",
            "pending",
            "received",
            "shipped",
            "submitted",
          ])
          .optional(),
      },
      {
        name: "to_branch",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedStockTransferList,
  },
  {
    method: "get",
    path: "/api/products/stock-transfers/pending/",
    alias: "products_stock_transfers_pending_list",
    description: `Pending transfers`,
    requestFormat: "json",
    parameters: [
      {
        name: "from_branch",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum([
            "cancelled",
            "completed",
            "pending",
            "received",
            "shipped",
            "submitted",
          ])
          .optional(),
      },
      {
        name: "to_branch",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedStockTransferList,
  },
  {
    method: "get",
    path: "/api/products/stocks/",
    alias: "products_stocks_list",
    description: `ViewSet for Inventory Management

Endpoints:
- GET /stocks/ - List stock
- GET /stocks/{id}/ - Stock details
- POST /stocks/ - Add new stock (Warehouses only)
- GET /stocks/low_stock/ - Low stock products
- GET /stocks/out_of_stock/ - Out of stock products
- GET /stocks/by_branch/{branch_id}/ - Stock for specific branch`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "variant",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedStockList,
  },
  {
    method: "post",
    path: "/api/products/stocks/",
    alias: "products_stocks_create",
    description: `ViewSet for Inventory Management

Endpoints:
- GET /stocks/ - List stock
- GET /stocks/{id}/ - Stock details
- POST /stocks/ - Add new stock (Warehouses only)
- GET /stocks/low_stock/ - Low stock products
- GET /stocks/out_of_stock/ - Out of stock products
- GET /stocks/by_branch/{branch_id}/ - Stock for specific branch`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StockRequest,
      },
    ],
    response: Stock,
  },
  {
    method: "get",
    path: "/api/products/stocks/:id/",
    alias: "products_stocks_retrieve",
    description: `ViewSet for Inventory Management

Endpoints:
- GET /stocks/ - List stock
- GET /stocks/{id}/ - Stock details
- POST /stocks/ - Add new stock (Warehouses only)
- GET /stocks/low_stock/ - Low stock products
- GET /stocks/out_of_stock/ - Out of stock products
- GET /stocks/by_branch/{branch_id}/ - Stock for specific branch`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Stock,
  },
  {
    method: "put",
    path: "/api/products/stocks/:id/",
    alias: "products_stocks_update",
    description: `ViewSet for Inventory Management

Endpoints:
- GET /stocks/ - List stock
- GET /stocks/{id}/ - Stock details
- POST /stocks/ - Add new stock (Warehouses only)
- GET /stocks/low_stock/ - Low stock products
- GET /stocks/out_of_stock/ - Out of stock products
- GET /stocks/by_branch/{branch_id}/ - Stock for specific branch`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StockRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Stock,
  },
  {
    method: "patch",
    path: "/api/products/stocks/:id/",
    alias: "products_stocks_partial_update",
    description: `ViewSet for Inventory Management

Endpoints:
- GET /stocks/ - List stock
- GET /stocks/{id}/ - Stock details
- POST /stocks/ - Add new stock (Warehouses only)
- GET /stocks/low_stock/ - Low stock products
- GET /stocks/out_of_stock/ - Out of stock products
- GET /stocks/by_branch/{branch_id}/ - Stock for specific branch`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedStockRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Stock,
  },
  {
    method: "delete",
    path: "/api/products/stocks/:id/",
    alias: "products_stocks_destroy",
    description: `ViewSet for Inventory Management

Endpoints:
- GET /stocks/ - List stock
- GET /stocks/{id}/ - Stock details
- POST /stocks/ - Add new stock (Warehouses only)
- GET /stocks/low_stock/ - Low stock products
- GET /stocks/out_of_stock/ - Out of stock products
- GET /stocks/by_branch/{branch_id}/ - Stock for specific branch`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/products/stocks/by-branch/:branch_id/",
    alias: "products_stocks_by_branch_list",
    description: `Stock for specific branch`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "branch_id",
        type: "Query",
        schema: z.number().int(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "variant",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedStockList,
  },
  {
    method: "get",
    path: "/api/products/stocks/filter_options/",
    alias: "products_stocks_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Stock,
  },
  {
    method: "get",
    path: "/api/products/stocks/low_stock/",
    alias: "products_stocks_low_stock_list",
    description: `Low stock products`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "variant",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedStockList,
  },
  {
    method: "get",
    path: "/api/products/stocks/out_of_stock/",
    alias: "products_stocks_out_of_stock_list",
    description: `Out of stock products`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "variant",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedStockList,
  },
  {
    method: "get",
    path: "/api/products/stocks/stores_only/",
    alias: "products_stocks_stores_only_list",
    description: `Warehouses only (Branches that can add stock)`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "variant",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedStoreBranchList,
  },
  {
    method: "get",
    path: "/api/products/suppliers/",
    alias: "products_suppliers_list",
    description: `ViewSet for managing Suppliers.`,
    requestFormat: "json",
    parameters: [
      {
        name: "address",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "contact_person",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "country",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "email",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "payment_terms",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "phone",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "website",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedSupplierList,
  },
  {
    method: "post",
    path: "/api/products/suppliers/",
    alias: "products_suppliers_create",
    description: `ViewSet for managing Suppliers.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SupplierRequest,
      },
    ],
    response: Supplier,
  },
  {
    method: "get",
    path: "/api/products/suppliers/:id/",
    alias: "products_suppliers_retrieve",
    description: `ViewSet for managing Suppliers.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Supplier,
  },
  {
    method: "put",
    path: "/api/products/suppliers/:id/",
    alias: "products_suppliers_update",
    description: `ViewSet for managing Suppliers.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SupplierRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Supplier,
  },
  {
    method: "patch",
    path: "/api/products/suppliers/:id/",
    alias: "products_suppliers_partial_update",
    description: `ViewSet for managing Suppliers.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedSupplierRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Supplier,
  },
  {
    method: "delete",
    path: "/api/products/suppliers/:id/",
    alias: "products_suppliers_destroy",
    description: `ViewSet for managing Suppliers.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/products/suppliers/filter_options/",
    alias: "products_suppliers_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Supplier,
  },
  {
    method: "get",
    path: "/api/products/variants/",
    alias: "products_variants_list",
    description: `ViewSet for managing Product Variants.
Custom logic for creation to support nested pricing/attributes.`,
    requestFormat: "json",
    parameters: [
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "description",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "dimensions",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "discount_percentage",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "factory_code",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "last_purchase_price",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "product",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "product_type",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "selling_price",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "sku",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "warranty",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "weight",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedProductVariantList,
  },
  {
    method: "post",
    path: "/api/products/variants/",
    alias: "products_variants_create",
    description: `ViewSet for managing Product Variants.
Custom logic for creation to support nested pricing/attributes.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateProductVariantRequest,
      },
    ],
    response: CreateProductVariant,
  },
  {
    method: "get",
    path: "/api/products/variants/:id/",
    alias: "products_variants_retrieve",
    description: `ViewSet for managing Product Variants.
Custom logic for creation to support nested pricing/attributes.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductVariant,
  },
  {
    method: "put",
    path: "/api/products/variants/:id/",
    alias: "products_variants_update",
    description: `ViewSet for managing Product Variants.
Custom logic for creation to support nested pricing/attributes.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProductVariantRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductVariant,
  },
  {
    method: "patch",
    path: "/api/products/variants/:id/",
    alias: "products_variants_partial_update",
    description: `ViewSet for managing Product Variants.
Custom logic for creation to support nested pricing/attributes.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedProductVariantRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ProductVariant,
  },
  {
    method: "delete",
    path: "/api/products/variants/:id/",
    alias: "products_variants_destroy",
    description: `ViewSet for managing Product Variants.
Custom logic for creation to support nested pricing/attributes.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/products/variants/:variant_id/nearest-branch/",
    alias: "products_variants_nearest_branch_retrieve",
    description: `API View to find the nearest branch with sufficient stock.`,
    requestFormat: "json",
    parameters: [
      {
        name: "min_quantity",
        type: "Query",
        schema: z.number().int().optional().default(1),
      },
      {
        name: "variant_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: NearestBranchResponse,
  },
  {
    method: "get",
    path: "/api/products/variants/:variant_id/stock-summary/",
    alias: "products_variants_stock_summary_retrieve",
    description: `API View to get stock summary for a specific variant across all branches.`,
    requestFormat: "json",
    parameters: [
      {
        name: "variant_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: VariantStockSummaryResponse,
  },
  {
    method: "get",
    path: "/api/products/variants/:variant_id/total-stock/",
    alias: "products_variants_total_stock_retrieve",
    description: `API View to get total stock quantity for a variant across all branches.`,
    requestFormat: "json",
    parameters: [
      {
        name: "variant_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: VariantTotalStockResponse,
  },
  {
    method: "get",
    path: "/api/products/variants/filter_options/",
    alias: "products_variants_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: ProductVariant,
  },
  {
    method: "get",
    path: "/api/sales/installments/",
    alias: "sales_installments_list",
    description: `ViewSet للأقساط`,
    requestFormat: "json",
    parameters: [
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "payment",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum(["cancelled", "due", "overdue", "paid", "pending"])
          .optional(),
      },
    ],
    response: PaginatedInstallmentList,
  },
  {
    method: "post",
    path: "/api/sales/installments/",
    alias: "sales_installments_create",
    description: `ViewSet للأقساط`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: InstallmentRequest,
      },
    ],
    response: Installment,
  },
  {
    method: "get",
    path: "/api/sales/installments/:id/",
    alias: "sales_installments_retrieve",
    description: `ViewSet للأقساط`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Installment,
  },
  {
    method: "put",
    path: "/api/sales/installments/:id/",
    alias: "sales_installments_update",
    description: `ViewSet للأقساط`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: InstallmentRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Installment,
  },
  {
    method: "patch",
    path: "/api/sales/installments/:id/",
    alias: "sales_installments_partial_update",
    description: `ViewSet للأقساط`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedInstallmentRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Installment,
  },
  {
    method: "delete",
    path: "/api/sales/installments/:id/",
    alias: "sales_installments_destroy",
    description: `ViewSet للأقساط`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/sales/installments/:id/mark_paid/",
    alias: "sales_installments_mark_paid_create",
    description: `تسجيل سداد القسط`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z
          .object({ amount: z.string().regex(/^-?\d{0,18}(?:\.\d{0,2})?$/) })
          .passthrough(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: MarkInstallmentPaidResponse,
  },
  {
    method: "get",
    path: "/api/sales/installments/filter_options/",
    alias: "sales_installments_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Installment,
  },
  {
    method: "get",
    path: "/api/sales/installments/overdue/",
    alias: "sales_installments_overdue_list",
    description: `الأقساط المتأخرة`,
    requestFormat: "json",
    parameters: [
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "payment",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum(["cancelled", "due", "overdue", "paid", "pending"])
          .optional(),
      },
    ],
    response: PaginatedInstallmentList,
  },
  {
    method: "post",
    path: "/api/sales/inventory/damage/",
    alias: "sales_inventory_damage_create",
    description: `تسجيل تلف/إتلاف منتجات`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateDamageRecordRequestRequest,
      },
    ],
    response: CreateDamageRecordResponse,
  },
  {
    method: "get",
    path: "/api/sales/invoice-types/",
    alias: "sales_invoice_types_list",
    description: `ViewSet for Invoice Types.
Read-only for most users, full access for admins.`,
    requestFormat: "json",
    parameters: [
      {
        name: "code",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedInvoiceTypeList,
  },
  {
    method: "post",
    path: "/api/sales/invoice-types/",
    alias: "sales_invoice_types_create",
    description: `ViewSet for Invoice Types.
Read-only for most users, full access for admins.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: InvoiceTypeRequest,
      },
    ],
    response: InvoiceType,
  },
  {
    method: "get",
    path: "/api/sales/invoice-types/:id/",
    alias: "sales_invoice_types_retrieve",
    description: `ViewSet for Invoice Types.
Read-only for most users, full access for admins.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: InvoiceType,
  },
  {
    method: "put",
    path: "/api/sales/invoice-types/:id/",
    alias: "sales_invoice_types_update",
    description: `ViewSet for Invoice Types.
Read-only for most users, full access for admins.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: InvoiceTypeRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: InvoiceType,
  },
  {
    method: "patch",
    path: "/api/sales/invoice-types/:id/",
    alias: "sales_invoice_types_partial_update",
    description: `ViewSet for Invoice Types.
Read-only for most users, full access for admins.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedInvoiceTypeRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: InvoiceType,
  },
  {
    method: "delete",
    path: "/api/sales/invoice-types/:id/",
    alias: "sales_invoice_types_destroy",
    description: `ViewSet for Invoice Types.
Read-only for most users, full access for admins.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/sales/invoice-types/filter_options/",
    alias: "sales_invoice_types_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: InvoiceType,
  },
  {
    method: "get",
    path: "/api/sales/invoices/",
    alias: "sales_invoices_list",
    description: `Base ViewSet for Sales with Branch Isolation via BranchAccessMixin.
Users only see data from their assigned branches.`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "confirmed_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_by",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "currency",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "current_invoice_hash",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "customer",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "discount_amount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "due_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "exchange_rate",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "invoice_number",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "invoice_type",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "invoice_type_code",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "invoice_uuid",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "items",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "notes",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "order",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "paid_amount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "partner",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "partner_amount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "patient_amount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "previous_invoice_hash",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "pricing_policy_snapshot",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "purchase_order",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "subtotal",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "tax_amount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "tax_rate",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "tax_snapshot",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "total_amount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "total_amount_base",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "total_amount_foreign",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "zatca_tax_number",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedInvoiceList,
  },
  {
    method: "post",
    path: "/api/sales/invoices/",
    alias: "sales_invoices_create",
    description: `Base ViewSet for Sales with Branch Isolation via BranchAccessMixin.
Users only see data from their assigned branches.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: InvoiceRequest,
      },
    ],
    response: Invoice,
  },
  {
    method: "get",
    path: "/api/sales/invoices/:id/",
    alias: "sales_invoices_retrieve",
    description: `Base ViewSet for Sales with Branch Isolation via BranchAccessMixin.
Users only see data from their assigned branches.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Invoice,
  },
  {
    method: "put",
    path: "/api/sales/invoices/:id/",
    alias: "sales_invoices_update",
    description: `Base ViewSet for Sales with Branch Isolation via BranchAccessMixin.
Users only see data from their assigned branches.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: InvoiceRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Invoice,
  },
  {
    method: "patch",
    path: "/api/sales/invoices/:id/",
    alias: "sales_invoices_partial_update",
    description: `Base ViewSet for Sales with Branch Isolation via BranchAccessMixin.
Users only see data from their assigned branches.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedInvoiceRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Invoice,
  },
  {
    method: "delete",
    path: "/api/sales/invoices/:id/",
    alias: "sales_invoices_destroy",
    description: `Base ViewSet for Sales with Branch Isolation via BranchAccessMixin.
Users only see data from their assigned branches.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/sales/invoices/:id/calculate_totals/",
    alias: "sales_invoices_calculate_totals_create",
    description: `Base ViewSet for Sales with Branch Isolation via BranchAccessMixin.
Users only see data from their assigned branches.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: InvoiceTotalsResponse,
  },
  {
    method: "post",
    path: "/api/sales/invoices/:id/confirm/",
    alias: "sales_invoices_confirm_create",
    description: `تأكيد الفاتورة وخصم المخزون`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: InvoiceConfirmResponse,
  },
  {
    method: "get",
    path: "/api/sales/invoices/by_order/",
    alias: "sales_invoices_by_order_list",
    description: `جلب فواتير طلب معين`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "confirmed_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_by",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "currency",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "current_invoice_hash",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "customer",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "discount_amount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "due_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "exchange_rate",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "invoice_number",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "invoice_type",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "invoice_type_code",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "invoice_uuid",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "items",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "notes",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "order",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "order_id",
        type: "Query",
        schema: z.number().int(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "paid_amount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "partner",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "partner_amount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "patient_amount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "previous_invoice_hash",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "pricing_policy_snapshot",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "purchase_order",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "subtotal",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "tax_amount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "tax_rate",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "tax_snapshot",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "total_amount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "total_amount_base",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "total_amount_foreign",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "zatca_tax_number",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedInvoiceList,
  },
  {
    method: "get",
    path: "/api/sales/invoices/choices/",
    alias: "sales_invoices_choices_retrieve",
    requestFormat: "json",
    response: InvoiceChoicesResponse,
  },
  {
    method: "get",
    path: "/api/sales/invoices/filter_options/",
    alias: "sales_invoices_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Invoice,
  },
  {
    method: "get",
    path: "/api/sales/orders/",
    alias: "sales_orders_list",
    description: `Base ViewSet for Sales with Branch Isolation via BranchAccessMixin.
Users only see data from their assigned branches.`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "confirmed_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "customer",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "customer_partner_link",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "customer_share",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "delivered_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "discount_amount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "expected_delivery",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "internal_notes",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "items",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "notes",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "order_number",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "order_type",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "paid_amount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "partner",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "partner_amount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "partner_share",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "patient_amount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "payment_method",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "payment_status",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "sales_person",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "subtotal",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "tax_amount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "tax_rate",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "total_amount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedOrderList,
  },
  {
    method: "post",
    path: "/api/sales/orders/",
    alias: "sales_orders_create",
    description: `Base ViewSet for Sales with Branch Isolation via BranchAccessMixin.
Users only see data from their assigned branches.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OrderRequest,
      },
    ],
    response: Order,
  },
  {
    method: "get",
    path: "/api/sales/orders/:id/",
    alias: "sales_orders_retrieve",
    description: `Base ViewSet for Sales with Branch Isolation via BranchAccessMixin.
Users only see data from their assigned branches.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Order,
  },
  {
    method: "put",
    path: "/api/sales/orders/:id/",
    alias: "sales_orders_update",
    description: `Base ViewSet for Sales with Branch Isolation via BranchAccessMixin.
Users only see data from their assigned branches.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OrderRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Order,
  },
  {
    method: "patch",
    path: "/api/sales/orders/:id/",
    alias: "sales_orders_partial_update",
    description: `Base ViewSet for Sales with Branch Isolation via BranchAccessMixin.
Users only see data from their assigned branches.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedOrderRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Order,
  },
  {
    method: "delete",
    path: "/api/sales/orders/:id/",
    alias: "sales_orders_destroy",
    description: `Base ViewSet for Sales with Branch Isolation via BranchAccessMixin.
Users only see data from their assigned branches.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/sales/orders/:id/calculate_totals/",
    alias: "sales_orders_calculate_totals_create",
    description: `Base ViewSet for Sales with Branch Isolation via BranchAccessMixin.
Users only see data from their assigned branches.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: OrderTotalsResponse,
  },
  {
    method: "post",
    path: "/api/sales/orders/:id/cancel/",
    alias: "sales_orders_cancel_create",
    description: `إلغاء الطلب وتحرير المخزون`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: OrderCancelResponse,
  },
  {
    method: "post",
    path: "/api/sales/orders/:id/confirm/",
    alias: "sales_orders_confirm_create",
    description: `تأكيد الطلب وحجز المخزون`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: OrderConfirmResponse,
  },
  {
    method: "post",
    path: "/api/sales/orders/:id/deliver/",
    alias: "sales_orders_deliver_create",
    description: `توصيل الطلب وخصم المخزون وإنشاء الفاتورة`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: OrderDeliverResponse,
  },
  {
    method: "post",
    path: "/api/sales/orders/:id/ready/",
    alias: "sales_orders_ready_create",
    description: `تجهيز الطلب للتسليم`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: OrderReadyResponse,
  },
  {
    method: "post",
    path: "/api/sales/orders/:order_id/return/",
    alias: "sales_orders_return_create",
    description: `إنشاء مرتجع مبيعات`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateReturnRequestRequest,
      },
      {
        name: "order_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: CreateReturnResponse,
  },
  {
    method: "post",
    path: "/api/sales/orders/bulk-update-status/",
    alias: "sales_orders_bulk_update_status_create",
    description: `تحديث حالة مجموعة من الطلبات دفعة واحدة`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OrderBulkUpdateStatusRequestRequest,
      },
    ],
    response: OrderBulkUpdateStatusResponse,
  },
  {
    method: "get",
    path: "/api/sales/orders/choices/",
    alias: "sales_orders_choices_retrieve",
    requestFormat: "json",
    response: OrderChoicesResponse,
  },
  {
    method: "get",
    path: "/api/sales/orders/filter_options/",
    alias: "sales_orders_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Order,
  },
  {
    method: "get",
    path: "/api/sales/payment-methods/",
    alias: "sales_payment_methods_list",
    description: `ViewSet for dynamically managing payment methods`,
    requestFormat: "json",
    parameters: [
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "is_installment",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedPaymentMethodList,
  },
  {
    method: "post",
    path: "/api/sales/payment-methods/",
    alias: "sales_payment_methods_create",
    description: `ViewSet for dynamically managing payment methods`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PaymentMethodRequest,
      },
    ],
    response: PaymentMethod,
  },
  {
    method: "get",
    path: "/api/sales/payment-methods/:id/",
    alias: "sales_payment_methods_retrieve",
    description: `ViewSet for dynamically managing payment methods`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PaymentMethod,
  },
  {
    method: "put",
    path: "/api/sales/payment-methods/:id/",
    alias: "sales_payment_methods_update",
    description: `ViewSet for dynamically managing payment methods`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PaymentMethodRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PaymentMethod,
  },
  {
    method: "patch",
    path: "/api/sales/payment-methods/:id/",
    alias: "sales_payment_methods_partial_update",
    description: `ViewSet for dynamically managing payment methods`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedPaymentMethodRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PaymentMethod,
  },
  {
    method: "delete",
    path: "/api/sales/payment-methods/:id/",
    alias: "sales_payment_methods_destroy",
    description: `ViewSet for dynamically managing payment methods`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/sales/payment-methods/filter_options/",
    alias: "sales_payment_methods_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: PaymentMethod,
  },
  {
    method: "get",
    path: "/api/sales/payments/",
    alias: "sales_payments_list",
    description: `ViewSet للدفعات`,
    requestFormat: "json",
    parameters: [
      {
        name: "invoice",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "is_installment",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "order",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "partner",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "payment_method",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum(["disputed", "paid", "partial", "pending", "refunded"])
          .optional(),
      },
    ],
    response: PaginatedPaymentListList,
  },
  {
    method: "post",
    path: "/api/sales/payments/",
    alias: "sales_payments_create",
    description: `ViewSet للدفعات`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PaymentCreateRequest,
      },
    ],
    response: PaymentCreate,
  },
  {
    method: "get",
    path: "/api/sales/payments/:id/",
    alias: "sales_payments_retrieve",
    description: `ViewSet للدفعات`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Payment,
  },
  {
    method: "put",
    path: "/api/sales/payments/:id/",
    alias: "sales_payments_update",
    description: `ViewSet للدفعات`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PaymentRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Payment,
  },
  {
    method: "patch",
    path: "/api/sales/payments/:id/",
    alias: "sales_payments_partial_update",
    description: `ViewSet للدفعات`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedPaymentRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Payment,
  },
  {
    method: "delete",
    path: "/api/sales/payments/:id/",
    alias: "sales_payments_destroy",
    description: `ViewSet للدفعات`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/sales/payments/:id/mark_completed/",
    alias: "sales_payments_mark_completed_create",
    description: `تحديد الدفعة كمكتملة`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z
          .object({ transaction_id: z.string().min(1) })
          .partial()
          .passthrough(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: MarkCompletedResponse,
  },
  {
    method: "post",
    path: "/api/sales/payments/:id/mark_failed/",
    alias: "sales_payments_mark_failed_create",
    description: `تحديد الدفعة كفاشلة`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z
          .object({ reason: z.string().min(1) })
          .partial()
          .passthrough(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: MarkFailedResponse,
  },
  {
    method: "post",
    path: "/api/sales/payments/:id/refund/",
    alias: "sales_payments_refund_create",
    description: `استرجاع دفعة`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PaymentRefundRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: RefundResponse,
  },
  {
    method: "post",
    path: "/api/sales/payments/bnpl_callback/",
    alias: "sales_payments_bnpl_callback_create",
    description: `Webhook callback من BNPL providers`,
    requestFormat: "json",
    response: z.object({ status: z.string() }).passthrough(),
  },
  {
    method: "get",
    path: "/api/sales/payments/choices/",
    alias: "sales_payments_choices_retrieve",
    description: `الخيارات المتاحة`,
    requestFormat: "json",
    response: PaymentChoices,
  },
  {
    method: "post",
    path: "/api/sales/payments/create_bnpl_session/",
    alias: "sales_payments_create_bnpl_session_create",
    description: `إنشاء جلسة دفع BNPL (Tabby/Tamara)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BNPLSessionRequestRequest,
      },
    ],
    response: BNPLSessionResponse,
  },
  {
    method: "get",
    path: "/api/sales/payments/filter_options/",
    alias: "sales_payments_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Payment,
  },
  {
    method: "get",
    path: "/api/sales/payments/summary/",
    alias: "sales_payments_summary_retrieve",
    description: `ملخص الدفعات`,
    requestFormat: "json",
    parameters: [
      {
        name: "period",
        type: "Query",
        schema: z.enum(["month", "today", "week", "year"]).optional(),
      },
    ],
    response: PaymentSummaryResponse,
  },
  {
    method: "get",
    path: "/api/sales/reports/branch-comparison/",
    alias: "sales_reports_branch_comparison_list",
    description: `Branch Performance Comparison`,
    requestFormat: "json",
    parameters: [
      {
        name: "days",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: z.array(BranchComparisonResponse),
  },
  {
    method: "get",
    path: "/api/sales/reports/financial-dashboard/",
    alias: "sales_reports_financial_dashboard_retrieve",
    description: `Comprehensive Financial Dashboard
Includes:
- Total Invoices
- Total Payments
- Pending Amounts (Unpaid)
- Discounts
- Taxes`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch_id",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "period",
        type: "Query",
        schema: z.enum(["month", "today", "week", "year"]).optional(),
      },
    ],
    response: FinancialDashboardResponse,
  },
  {
    method: "get",
    path: "/api/sales/reports/inventory-summary/",
    alias: "sales_reports_inventory_summary_retrieve",
    description: `Inventory Summary`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch_id",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: InventorySummaryResponse,
  },
  {
    method: "get",
    path: "/api/sales/reports/pending-orders/",
    alias: "sales_reports_pending_orders_retrieve",
    description: `Pending Orders (Not Delivered)`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch_id",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PendingOrdersResponse,
  },
  {
    method: "get",
    path: "/api/sales/reports/receivables-aging/",
    alias: "sales_reports_receivables_aging_retrieve",
    description: `Receivables Aging Report (Due Amounts)
Shows unpaid invoices by age`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch_id",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: ReceivablesAgingResponse,
  },
  {
    method: "get",
    path: "/api/sales/reports/sales-by-date/",
    alias: "sales_reports_sales_by_date_list",
    description: `Sales by Date (for charts)`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch_id",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "days",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: z.array(SalesByDateResponse),
  },
  {
    method: "get",
    path: "/api/sales/reports/sales-summary/",
    alias: "sales_reports_sales_summary_retrieve",
    description: `Sales Summary
Parameters:
    - branch_id: optional
    - from_date: YYYY-MM-DD
    - to_date: YYYY-MM-DD
    - period: today, week, month, year`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch_id",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "from_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "period",
        type: "Query",
        schema: z.enum(["month", "today", "week", "year"]).optional(),
      },
      {
        name: "to_date",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: SalesSummaryResponse,
  },
  {
    method: "get",
    path: "/api/sales/reports/stock-movements/",
    alias: "sales_reports_stock_movements_retrieve",
    description: `Stock Movements Report`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch_id",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "days",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "movement_type",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: StockMovementsReportResponse,
  },
  {
    method: "get",
    path: "/api/sales/reports/top-products/",
    alias: "sales_reports_top_products_list",
    description: `Top Selling Products`,
    requestFormat: "json",
    parameters: [
      {
        name: "branch_id",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "days",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: z.array(TopProductsResponse),
  },
  {
    method: "post",
    path: "/api/sales/wholesale/create-order/",
    alias: "sales_wholesale_create_order_create",
    description: `Create Wholesale Order`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateWholesaleOrderRequestRequest,
      },
    ],
    response: CreateWholesaleOrderResponse,
  },
  {
    method: "post",
    path: "/api/sales/wholesale/customer/:customer_id/credit/",
    alias: "sales_wholesale_customer_credit_create",
    description: `Update Customer Credit`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateCustomerCreditRequestRequest,
      },
      {
        name: "customer_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: UpdateCustomerCreditResponse,
  },
  {
    method: "get",
    path: "/api/sales/wholesale/customer/:customer_id/statement/",
    alias: "sales_wholesale_customer_statement_retrieve",
    description: `Customer Statement`,
    requestFormat: "json",
    parameters: [
      {
        name: "customer_id",
        type: "Path",
        schema: z.number().int(),
      },
      {
        name: "end_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "start_date",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: CustomerStatementResponse,
  },
  {
    method: "get",
    path: "/api/sales/wholesale/customers/",
    alias: "sales_wholesale_customers_list",
    description: `List of Wholesale Customers`,
    requestFormat: "json",
    response: z.array(WholesaleCustomer),
  },
  {
    method: "get",
    path: "/api/sales/wholesale/dashboard/",
    alias: "sales_wholesale_dashboard_retrieve",
    description: `Wholesale Dashboard`,
    requestFormat: "json",
    response: WholesaleDashboardResponse,
  },
  {
    method: "post",
    path: "/api/sales/wholesale/pricing/",
    alias: "sales_wholesale_pricing_create",
    description: `Calculate wholesale pricing for a specific customer`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: GetWholesalePricingRequestRequest,
      },
    ],
    response: GetWholesalePricingResponse,
  },
  {
    method: "post",
    path: "/api/sales/wholesale/validate/",
    alias: "sales_wholesale_validate_create",
    description: `Validate wholesale order before creation`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ValidateWholesaleOrderRequestRequest,
      },
    ],
    response: ValidateWholesaleOrderResponse,
  },
  {
    method: "get",
    path: "/api/tenants/activate/",
    alias: "tenants_activate_retrieve",
    description: `Main algorithm execution with improved flow control`,
    requestFormat: "json",
    parameters: [
      {
        name: "token",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: z.object({ detail: z.string() }).passthrough(),
    errors: [
      {
        status: 400,
        schema: z.object({ detail: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/tenants/clients/",
    alias: "tenants_clients_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedClientList,
  },
  {
    method: "post",
    path: "/api/tenants/clients/",
    alias: "tenants_clients_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ClientRequest,
      },
    ],
    response: Client,
  },
  {
    method: "get",
    path: "/api/tenants/clients/:id/",
    alias: "tenants_clients_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Client,
  },
  {
    method: "put",
    path: "/api/tenants/clients/:id/",
    alias: "tenants_clients_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ClientRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Client,
  },
  {
    method: "patch",
    path: "/api/tenants/clients/:id/",
    alias: "tenants_clients_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedClientRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Client,
  },
  {
    method: "delete",
    path: "/api/tenants/clients/:id/",
    alias: "tenants_clients_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/tenants/clients/filter_options/",
    alias: "tenants_clients_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Client,
  },
  {
    method: "post",
    path: "/api/tenants/create-payment-order/",
    alias: "tenants_create_payment_order_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreatePaymentOrderRequest,
      },
    ],
    response: CreatePaymentOrderResponse,
    errors: [
      {
        status: 400,
        schema: z.object({ detail: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/tenants/domain/",
    alias: "tenants_domain_list",
    description: `ViewSet to manage domains.
Only accessible on the public tenant.
Allows listing, creating, and managing domains and subdomains.`,
    requestFormat: "json",
    parameters: [
      {
        name: "is_primary",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "tenant",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedDomainList,
  },
  {
    method: "post",
    path: "/api/tenants/domain/",
    alias: "tenants_domain_create",
    description: `ViewSet to manage domains.
Only accessible on the public tenant.
Allows listing, creating, and managing domains and subdomains.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DomainRequest,
      },
    ],
    response: Domain,
  },
  {
    method: "get",
    path: "/api/tenants/domain/:id/",
    alias: "tenants_domain_retrieve",
    description: `ViewSet to manage domains.
Only accessible on the public tenant.
Allows listing, creating, and managing domains and subdomains.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Domain,
  },
  {
    method: "put",
    path: "/api/tenants/domain/:id/",
    alias: "tenants_domain_update",
    description: `ViewSet to manage domains.
Only accessible on the public tenant.
Allows listing, creating, and managing domains and subdomains.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DomainRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Domain,
  },
  {
    method: "patch",
    path: "/api/tenants/domain/:id/",
    alias: "tenants_domain_partial_update",
    description: `ViewSet to manage domains.
Only accessible on the public tenant.
Allows listing, creating, and managing domains and subdomains.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedDomainRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Domain,
  },
  {
    method: "delete",
    path: "/api/tenants/domain/:id/",
    alias: "tenants_domain_destroy",
    description: `ViewSet to manage domains.
Only accessible on the public tenant.
Allows listing, creating, and managing domains and subdomains.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/tenants/domain/filter_options/",
    alias: "tenants_domain_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Domain,
  },
  {
    method: "get",
    path: "/api/tenants/payments/",
    alias: "tenants_payments_retrieve",
    requestFormat: "json",
    response: PaymentListResponse,
  },
  {
    method: "get",
    path: "/api/tenants/paypal/cancel/",
    alias: "tenants_paypal_cancel_retrieve",
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 302,
        description: `No response body`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/tenants/paypal/execute/",
    alias: "tenants_paypal_execute_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PayPalExecuteRequestRequest,
      },
    ],
    response: PayPalExecuteSuccessResponse,
    errors: [
      {
        status: 400,
        schema: z.object({ detail: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/tenants/paypal/webhook/",
    alias: "tenants_paypal_webhook_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({}).partial().passthrough(),
      },
    ],
    response: z.object({ status: z.string() }).passthrough(),
  },
  {
    method: "post",
    path: "/api/tenants/register/",
    alias: "tenants_register_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RegisterTenantRequest,
      },
    ],
    response: z.object({ detail: z.string() }).passthrough(),
    errors: [
      {
        status: 400,
        schema: z.object({ detail: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/tenants/registers/",
    alias: "tenants_registers_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "email",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "password",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedRegisterTenantList,
  },
  {
    method: "post",
    path: "/api/tenants/registers/",
    alias: "tenants_registers_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RegisterTenantRequest,
      },
    ],
    response: RegisterTenant,
  },
  {
    method: "get",
    path: "/api/tenants/registers/:id/",
    alias: "tenants_registers_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: RegisterTenant,
  },
  {
    method: "put",
    path: "/api/tenants/registers/:id/",
    alias: "tenants_registers_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RegisterTenantRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: RegisterTenant,
  },
  {
    method: "patch",
    path: "/api/tenants/registers/:id/",
    alias: "tenants_registers_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedRegisterTenantRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: RegisterTenant,
  },
  {
    method: "delete",
    path: "/api/tenants/registers/:id/",
    alias: "tenants_registers_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/tenants/registers/filter_options/",
    alias: "tenants_registers_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: RegisterTenant,
  },
  {
    method: "get",
    path: "/api/tenants/settings/",
    alias: "tenants_settings_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "account_number",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "address",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "bank_name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "business_name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "city",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "client",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "country",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "description",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "email",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "facebook",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "iban",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "instagram",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "is_deleted",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "linkedin",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "phone",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "postal_code",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "seo_description",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "seo_keywords",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "seo_title",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "state",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "swift_code",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "tiktok",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "twitter",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "updated_at",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "website",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "whatsapp",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedPublicTenantSettingsList,
  },
  {
    method: "post",
    path: "/api/tenants/settings/",
    alias: "tenants_settings_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PublicTenantSettingsRequest,
      },
    ],
    response: PublicTenantSettings,
  },
  {
    method: "get",
    path: "/api/tenants/settings/:id/",
    alias: "tenants_settings_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PublicTenantSettings,
  },
  {
    method: "put",
    path: "/api/tenants/settings/:id/",
    alias: "tenants_settings_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PublicTenantSettingsRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PublicTenantSettings,
  },
  {
    method: "patch",
    path: "/api/tenants/settings/:id/",
    alias: "tenants_settings_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedPublicTenantSettingsRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PublicTenantSettings,
  },
  {
    method: "delete",
    path: "/api/tenants/settings/:id/",
    alias: "tenants_settings_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/tenants/settings/filter_options/",
    alias: "tenants_settings_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: PublicTenantSettings,
  },
  {
    method: "get",
    path: "/api/tenants/subscription-plans/",
    alias: "tenants_subscription_plans_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "currency",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "discount",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "duration_months",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "duration_years",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "has_crm_module",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "has_eye_test_module",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "has_hr_module",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "has_inventory_module",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "max_branches",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "max_products",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "max_users",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "month_price",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "year_price",
        type: "Query",
        schema: z.number().optional(),
      },
    ],
    response: PaginatedSubscriptionPlanList,
  },
  {
    method: "post",
    path: "/api/tenants/subscription-plans/",
    alias: "tenants_subscription_plans_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SubscriptionPlanRequest,
      },
    ],
    response: SubscriptionPlan,
  },
  {
    method: "get",
    path: "/api/tenants/subscription-plans/:id/",
    alias: "tenants_subscription_plans_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: SubscriptionPlan,
  },
  {
    method: "put",
    path: "/api/tenants/subscription-plans/:id/",
    alias: "tenants_subscription_plans_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SubscriptionPlanRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: SubscriptionPlan,
  },
  {
    method: "patch",
    path: "/api/tenants/subscription-plans/:id/",
    alias: "tenants_subscription_plans_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedSubscriptionPlanRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: SubscriptionPlan,
  },
  {
    method: "delete",
    path: "/api/tenants/subscription-plans/:id/",
    alias: "tenants_subscription_plans_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/tenants/subscription-plans/filter_options/",
    alias: "tenants_subscription_plans_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: SubscriptionPlan,
  },
  {
    method: "get",
    path: "/api/users/health/",
    alias: "users_health_retrieve",
    description: `Health check endpoint to verify that the API is running.`,
    requestFormat: "json",
    response: z.object({ status: z.string() }).passthrough(),
  },
  {
    method: "post",
    path: "/api/users/login/",
    alias: "users_login_create",
    description: `Login endpoint for users`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: LoginRequest,
      },
    ],
    response: z.object({ detail: z.string() }).passthrough(),
    errors: [
      {
        status: 400,
        schema: LoginBadRequest,
      },
      {
        status: 403,
        schema: z.object({ detail: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/users/logout/",
    alias: "users_logout_create",
    description: `Logout endpoint for users`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({}).partial().passthrough(),
      },
    ],
    response: z.object({ detail: z.string() }).passthrough(),
    errors: [
      {
        status: 401,
        schema: z.object({ detail: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/users/password-reset-confirm/",
    alias: "users_password_reset_confirm_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PasswordResetConfirmRequest,
      },
    ],
    response: z.object({ detail: z.string() }).passthrough(),
  },
  {
    method: "post",
    path: "/api/users/password-reset/",
    alias: "users_password_reset_create",
    description: `Request password reset`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({}).partial().passthrough(),
      },
    ],
    response: z.object({ detail: z.string() }).passthrough(),
    errors: [
      {
        status: 400,
        schema: PasswordResetBadRequest,
      },
    ],
  },
  {
    method: "get",
    path: "/api/users/permissions/",
    alias: "users_permissions_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "code",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "description",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedPermissionList,
  },
  {
    method: "post",
    path: "/api/users/permissions/",
    alias: "users_permissions_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PermissionRequest,
      },
    ],
    response: Permission,
  },
  {
    method: "get",
    path: "/api/users/permissions/:id/",
    alias: "users_permissions_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Permission,
  },
  {
    method: "put",
    path: "/api/users/permissions/:id/",
    alias: "users_permissions_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PermissionRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Permission,
  },
  {
    method: "patch",
    path: "/api/users/permissions/:id/",
    alias: "users_permissions_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedPermissionRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Permission,
  },
  {
    method: "delete",
    path: "/api/users/permissions/:id/",
    alias: "users_permissions_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/users/permissions/filter_options/",
    alias: "users_permissions_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Permission,
  },
  {
    method: "get",
    path: "/api/users/profile/",
    alias: "users_profile_retrieve",
    description: `Get current authenticated user profile data`,
    requestFormat: "json",
    response: User,
    errors: [
      {
        status: 401,
        schema: z.object({ detail: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/users/register/",
    alias: "users_register_create",
    description: `Register endpoint for users`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RegisterRequest,
      },
    ],
    response: RegisterSuccessResponse,
  },
  {
    method: "get",
    path: "/api/users/role-permissions/",
    alias: "users_role_permissions_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "permission",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "role",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedRolePermissionList,
  },
  {
    method: "post",
    path: "/api/users/role-permissions/",
    alias: "users_role_permissions_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RolePermissionRequest,
      },
    ],
    response: RolePermission,
  },
  {
    method: "get",
    path: "/api/users/role-permissions/:id/",
    alias: "users_role_permissions_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: RolePermission,
  },
  {
    method: "put",
    path: "/api/users/role-permissions/:id/",
    alias: "users_role_permissions_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RolePermissionRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: RolePermission,
  },
  {
    method: "patch",
    path: "/api/users/role-permissions/:id/",
    alias: "users_role_permissions_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedRolePermissionRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: RolePermission,
  },
  {
    method: "delete",
    path: "/api/users/role-permissions/:id/",
    alias: "users_role_permissions_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/users/role-permissions/filter_options/",
    alias: "users_role_permissions_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: RolePermission,
  },
  {
    method: "get",
    path: "/api/users/roles/",
    alias: "users_roles_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "description",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_active",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "permissions",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedRoleList,
  },
  {
    method: "post",
    path: "/api/users/roles/",
    alias: "users_roles_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RoleRequest,
      },
    ],
    response: Role,
  },
  {
    method: "get",
    path: "/api/users/roles/:id/",
    alias: "users_roles_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Role,
  },
  {
    method: "put",
    path: "/api/users/roles/:id/",
    alias: "users_roles_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RoleRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Role,
  },
  {
    method: "patch",
    path: "/api/users/roles/:id/",
    alias: "users_roles_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedRoleRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Role,
  },
  {
    method: "delete",
    path: "/api/users/roles/:id/",
    alias: "users_roles_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/users/roles/filter_options/",
    alias: "users_roles_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: Role,
  },
  {
    method: "post",
    path: "/api/users/token/refresh/",
    alias: "users_token_refresh_create",
    requestFormat: "json",
    response: RefreshTokenResponse,
    errors: [
      {
        status: 401,
        schema: z.object({ detail: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/users/users/",
    alias: "users_users_list",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "email__icontains",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "first_name__icontains",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "last_name__icontains",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "phone__icontains",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "username__icontains",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedUserList,
  },
  {
    method: "post",
    path: "/api/users/users/",
    alias: "users_users_create",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UserRequest,
      },
    ],
    response: User,
  },
  {
    method: "get",
    path: "/api/users/users/:id/",
    alias: "users_users_retrieve",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: User,
  },
  {
    method: "put",
    path: "/api/users/users/:id/",
    alias: "users_users_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UserRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: User,
  },
  {
    method: "patch",
    path: "/api/users/users/:id/",
    alias: "users_users_partial_update",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedUserRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: User,
  },
  {
    method: "delete",
    path: "/api/users/users/:id/",
    alias: "users_users_destroy",
    description: `Mixin that dynamically generates filtering options for any ViewSet.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/users/users/filter_options/",
    alias: "users_users_filter_options_retrieve",
    description: `API endpoint to fetch available filtering options (for frontend).`,
    requestFormat: "json",
    response: User,
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
