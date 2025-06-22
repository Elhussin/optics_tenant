"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.schemas = void 0;
exports.createApiClient = createApiClient;
var core_1 = require("@zodios/core");
var zod_1 = require("zod");
var CurrencyEnum = zod_1.z.enum(["USD", "EUR", "SAR"]);
var Account = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    name: zod_1.z.string().max(255),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    currency: CurrencyEnum.optional(),
    user: zod_1.z.number().int(),
})
    .passthrough();
var AccountRequest = zod_1.z
    .object({
    name: zod_1.z.string().min(1).max(255),
    currency: CurrencyEnum.optional(),
    user: zod_1.z.number().int(),
})
    .passthrough();
var PatchedAccountRequest = zod_1.z
    .object({
    name: zod_1.z.string().min(1).max(255),
    currency: CurrencyEnum,
    user: zod_1.z.number().int(),
})
    .partial()
    .passthrough();
var TransactionTypeEnum = zod_1.z.enum(["income", "expense"]);
var Category = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    name: zod_1.z.string().max(100),
    category_type: TransactionTypeEnum,
    description: zod_1.z.string().nullish(),
    parent: zod_1.z.number().int().nullish(),
})
    .passthrough();
var CategoryRequest = zod_1.z
    .object({
    name: zod_1.z.string().min(1).max(100),
    category_type: TransactionTypeEnum,
    description: zod_1.z.string().nullish(),
    parent: zod_1.z.number().int().nullish(),
})
    .passthrough();
var PatchedCategoryRequest = zod_1.z
    .object({
    name: zod_1.z.string().min(1).max(100),
    category_type: TransactionTypeEnum,
    description: zod_1.z.string().nullable(),
    parent: zod_1.z.number().int().nullable(),
})
    .partial()
    .passthrough();
var FinancialPeriod = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    name: zod_1.z.string().max(50),
    start_date: zod_1.z.string(),
    end_date: zod_1.z.string(),
    is_closed: zod_1.z.boolean().optional(),
})
    .passthrough();
var FinancialPeriodRequest = zod_1.z
    .object({
    name: zod_1.z.string().min(1).max(50),
    start_date: zod_1.z.string(),
    end_date: zod_1.z.string(),
    is_closed: zod_1.z.boolean().optional(),
})
    .passthrough();
var PatchedFinancialPeriodRequest = zod_1.z
    .object({
    name: zod_1.z.string().min(1).max(50),
    start_date: zod_1.z.string(),
    end_date: zod_1.z.string(),
    is_closed: zod_1.z.boolean(),
})
    .partial()
    .passthrough();
var JournalEntry = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    debit_currency: zod_1.z.string(),
    debit: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    credit_currency: zod_1.z.string(),
    credit: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    transaction: zod_1.z.number().int(),
    account: zod_1.z.number().int(),
})
    .passthrough();
var JournalEntryRequest = zod_1.z
    .object({
    debit: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    credit: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    transaction: zod_1.z.number().int(),
    account: zod_1.z.number().int(),
})
    .passthrough();
var PatchedJournalEntryRequest = zod_1.z
    .object({
    debit: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    credit: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    transaction: zod_1.z.number().int(),
    account: zod_1.z.number().int(),
})
    .partial()
    .passthrough();
var IntervalEnum = zod_1.z.enum(["monthly", "yearly"]);
var RecurringTransaction = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    amount_currency: zod_1.z.string(),
    amount: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    transaction_types: TransactionTypeEnum,
    interval: IntervalEnum,
    next_execution: zod_1.z.string(),
    account: zod_1.z.number().int(),
})
    .passthrough();
var RecurringTransactionRequest = zod_1.z
    .object({
    amount: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    transaction_types: TransactionTypeEnum,
    interval: IntervalEnum,
    next_execution: zod_1.z.string(),
    account: zod_1.z.number().int(),
})
    .passthrough();
var PatchedRecurringTransactionRequest = zod_1.z
    .object({
    amount: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    transaction_types: TransactionTypeEnum,
    interval: IntervalEnum,
    next_execution: zod_1.z.string(),
    account: zod_1.z.number().int(),
})
    .partial()
    .passthrough();
var Tax = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    name: zod_1.z.string().max(100),
    rate: zod_1.z.string().regex(/^-?\d{0,3}(?:\.\d{0,2})?$/),
    effective_date: zod_1.z.string(),
    is_active: zod_1.z.boolean().optional(),
    description: zod_1.z.string().nullish(),
})
    .passthrough();
var TaxRequest = zod_1.z
    .object({
    name: zod_1.z.string().min(1).max(100),
    rate: zod_1.z.string().regex(/^-?\d{0,3}(?:\.\d{0,2})?$/),
    effective_date: zod_1.z.string(),
    is_active: zod_1.z.boolean().optional(),
    description: zod_1.z.string().nullish(),
})
    .passthrough();
var PatchedTaxRequest = zod_1.z
    .object({
    name: zod_1.z.string().min(1).max(100),
    rate: zod_1.z.string().regex(/^-?\d{0,3}(?:\.\d{0,2})?$/),
    effective_date: zod_1.z.string(),
    is_active: zod_1.z.boolean(),
    description: zod_1.z.string().nullable(),
})
    .partial()
    .passthrough();
var Transaction = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    date: zod_1.z.string(),
    amount_currency: zod_1.z.string(),
    amount: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    transaction_type: TransactionTypeEnum,
    description: zod_1.z.string().nullish(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    account: zod_1.z.number().int(),
    period: zod_1.z.number().int(),
    category: zod_1.z.number().int().nullish(),
    tax_rate: zod_1.z.number().int().nullish(),
})
    .passthrough();
var TransactionRequest = zod_1.z
    .object({
    date: zod_1.z.string(),
    amount: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    transaction_type: TransactionTypeEnum,
    description: zod_1.z.string().nullish(),
    account: zod_1.z.number().int(),
    period: zod_1.z.number().int(),
    category: zod_1.z.number().int().nullish(),
    tax_rate: zod_1.z.number().int().nullish(),
})
    .passthrough();
var PatchedTransactionRequest = zod_1.z
    .object({
    date: zod_1.z.string(),
    amount: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    transaction_type: TransactionTypeEnum,
    description: zod_1.z.string().nullable(),
    account: zod_1.z.number().int(),
    period: zod_1.z.number().int(),
    category: zod_1.z.number().int().nullable(),
    tax_rate: zod_1.z.number().int().nullable(),
})
    .partial()
    .passthrough();
var BranchUsersRoleEnum = zod_1.z.enum(["manager", "staff"]);
var BranchUsers = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    role: BranchUsersRoleEnum,
    status: zod_1.z.boolean().optional(),
    notes: zod_1.z.string().nullish(),
    branch: zod_1.z.number().int(),
    employee: zod_1.z.number().int(),
})
    .passthrough();
var BranchUsersRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    role: BranchUsersRoleEnum,
    status: zod_1.z.boolean().optional(),
    notes: zod_1.z.string().nullish(),
    branch: zod_1.z.number().int(),
    employee: zod_1.z.number().int(),
})
    .passthrough();
var PatchedBranchUsersRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean(),
    is_deleted: zod_1.z.boolean(),
    role: BranchUsersRoleEnum,
    status: zod_1.z.boolean(),
    notes: zod_1.z.string().nullable(),
    branch: zod_1.z.number().int(),
    employee: zod_1.z.number().int(),
})
    .partial()
    .passthrough();
var BranchTypeEnum = zod_1.z.enum(["store", "branch"]);
var Branch = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    name: zod_1.z.string().max(100),
    branch_code: zod_1.z.string().max(10),
    branch_type: BranchTypeEnum,
    country: zod_1.z.string().optional(),
    city: zod_1.z.string().max(100).optional(),
    address: zod_1.z.string().optional(),
    phone: zod_1.z.string().max(20).optional(),
    email: zod_1.z.string().max(254).email().optional(),
    is_main_branch: zod_1.z.boolean().optional(),
    allows_online_orders: zod_1.z.boolean().optional(),
    operating_hours: zod_1.z.unknown().optional(),
})
    .passthrough();
var BranchRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    name: zod_1.z.string().min(1).max(100),
    branch_code: zod_1.z.string().min(1).max(10),
    branch_type: BranchTypeEnum,
    country: zod_1.z.string().optional(),
    city: zod_1.z.string().max(100).optional(),
    address: zod_1.z.string().optional(),
    phone: zod_1.z.string().max(20).optional(),
    email: zod_1.z.string().max(254).email().optional(),
    is_main_branch: zod_1.z.boolean().optional(),
    allows_online_orders: zod_1.z.boolean().optional(),
    operating_hours: zod_1.z.unknown().optional(),
})
    .passthrough();
var PatchedBranchRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean(),
    is_deleted: zod_1.z.boolean(),
    name: zod_1.z.string().min(1).max(100),
    branch_code: zod_1.z.string().min(1).max(10),
    branch_type: BranchTypeEnum,
    country: zod_1.z.string(),
    city: zod_1.z.string().max(100),
    address: zod_1.z.string(),
    phone: zod_1.z.string().max(20),
    email: zod_1.z.string().max(254).email(),
    is_main_branch: zod_1.z.boolean(),
    allows_online_orders: zod_1.z.boolean(),
    operating_hours: zod_1.z.unknown(),
})
    .partial()
    .passthrough();
var Campaign = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    name: zod_1.z.string().max(255),
    description: zod_1.z.string(),
    start_date: zod_1.z.string(),
    end_date: zod_1.z.string(),
    customers: zod_1.z.array(zod_1.z.number().int()).optional(),
})
    .passthrough();
var CampaignRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    name: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().min(1),
    start_date: zod_1.z.string(),
    end_date: zod_1.z.string(),
    customers: zod_1.z.array(zod_1.z.number().int()).optional(),
})
    .passthrough();
var PatchedCampaignRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean(),
    is_deleted: zod_1.z.boolean(),
    name: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().min(1),
    start_date: zod_1.z.string(),
    end_date: zod_1.z.string(),
    customers: zod_1.z.array(zod_1.z.number().int()),
})
    .partial()
    .passthrough();
var ComplaintStatusEnum = zod_1.z.enum(["open", "resolved"]);
var Complaint = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    description: zod_1.z.string(),
    status: ComplaintStatusEnum.optional(),
    customer: zod_1.z.number().int(),
})
    .passthrough();
var ComplaintRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    description: zod_1.z.string().min(1),
    status: ComplaintStatusEnum.optional(),
    customer: zod_1.z.number().int(),
})
    .passthrough();
var PatchedComplaintRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean(),
    is_deleted: zod_1.z.boolean(),
    description: zod_1.z.string().min(1),
    status: ComplaintStatusEnum,
    customer: zod_1.z.number().int(),
})
    .partial()
    .passthrough();
var CustomerGroup = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    name: zod_1.z.string().max(100),
    description: zod_1.z.string().optional(),
    customers: zod_1.z.array(zod_1.z.number().int()),
})
    .passthrough();
var CustomerGroupRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional(),
    customers: zod_1.z.array(zod_1.z.number().int()),
})
    .passthrough();
var PatchedCustomerGroupRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean(),
    is_deleted: zod_1.z.boolean(),
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string(),
    customers: zod_1.z.array(zod_1.z.number().int()),
})
    .partial()
    .passthrough();
var CustomerTypeEnum = zod_1.z.enum(["individual", "company", "agent", "supplier"]);
var PreferredContactEnum = zod_1.z.enum(["email", "phone", "sms"]);
var Customer = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    first_name: zod_1.z.string().max(100).optional(),
    last_name: zod_1.z.string().max(100).optional(),
    identification_number: zod_1.z.string().min(10).max(20),
    email: zod_1.z.string().max(254).email().optional(),
    phone: zod_1.z.string().max(20).optional(),
    date_of_birth: zod_1.z.string().nullish(),
    customer_type: CustomerTypeEnum.optional(),
    address_line1: zod_1.z.string().max(200).optional(),
    address_line2: zod_1.z.string().max(200).optional(),
    city: zod_1.z.string().max(100).optional(),
    postal_code: zod_1.z.string().max(20).optional(),
    customer_since: zod_1.z.string().datetime({ offset: true }),
    is_vip: zod_1.z.boolean().optional(),
    loyalty_points: zod_1.z
        .number()
        .int()
        .gte(-2147483648)
        .lte(2147483647)
        .optional(),
    accepts_marketing: zod_1.z.boolean().optional(),
    registration_number: zod_1.z.string().max(50).nullish(),
    tax_number: zod_1.z.string().max(50).nullish(),
    preferred_contact: PreferredContactEnum.optional(),
    website: zod_1.z.string().max(200).url().nullish(),
    logo: zod_1.z.string().url().nullish(),
    description: zod_1.z.string().nullish(),
    user: zod_1.z.number().int(),
})
    .passthrough();
var CustomerRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    first_name: zod_1.z.string().max(100).optional(),
    last_name: zod_1.z.string().max(100).optional(),
    identification_number: zod_1.z.string().min(10).max(20),
    email: zod_1.z.string().max(254).email().optional(),
    phone: zod_1.z.string().max(20).optional(),
    date_of_birth: zod_1.z.string().nullish(),
    customer_type: CustomerTypeEnum.optional(),
    address_line1: zod_1.z.string().max(200).optional(),
    address_line2: zod_1.z.string().max(200).optional(),
    city: zod_1.z.string().max(100).optional(),
    postal_code: zod_1.z.string().max(20).optional(),
    is_vip: zod_1.z.boolean().optional(),
    loyalty_points: zod_1.z
        .number()
        .int()
        .gte(-2147483648)
        .lte(2147483647)
        .optional(),
    accepts_marketing: zod_1.z.boolean().optional(),
    registration_number: zod_1.z.string().max(50).nullish(),
    tax_number: zod_1.z.string().max(50).nullish(),
    preferred_contact: PreferredContactEnum.optional(),
    website: zod_1.z.string().max(200).url().nullish(),
    logo: zod_1.z.instanceof(File).nullish(),
    description: zod_1.z.string().nullish(),
    user: zod_1.z.number().int(),
})
    .passthrough();
var PatchedCustomerRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean(),
    is_deleted: zod_1.z.boolean(),
    first_name: zod_1.z.string().max(100),
    last_name: zod_1.z.string().max(100),
    identification_number: zod_1.z.string().min(10).max(20),
    email: zod_1.z.string().max(254).email(),
    phone: zod_1.z.string().max(20),
    date_of_birth: zod_1.z.string().nullable(),
    customer_type: CustomerTypeEnum,
    address_line1: zod_1.z.string().max(200),
    address_line2: zod_1.z.string().max(200),
    city: zod_1.z.string().max(100),
    postal_code: zod_1.z.string().max(20),
    is_vip: zod_1.z.boolean(),
    loyalty_points: zod_1.z.number().int().gte(-2147483648).lte(2147483647),
    accepts_marketing: zod_1.z.boolean(),
    registration_number: zod_1.z.string().max(50).nullable(),
    tax_number: zod_1.z.string().max(50).nullable(),
    preferred_contact: PreferredContactEnum,
    website: zod_1.z.string().max(200).url().nullable(),
    logo: zod_1.z.instanceof(File).nullable(),
    description: zod_1.z.string().nullable(),
    user: zod_1.z.number().int(),
})
    .partial()
    .passthrough();
var Document = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    title: zod_1.z.string().max(255),
    file: zod_1.z.string().url(),
    customer: zod_1.z.number().int().nullish(),
})
    .passthrough();
var DocumentRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    title: zod_1.z.string().min(1).max(255),
    file: zod_1.z.instanceof(File),
    customer: zod_1.z.number().int().nullish(),
})
    .passthrough();
var PatchedDocumentRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean(),
    is_deleted: zod_1.z.boolean(),
    title: zod_1.z.string().min(1).max(255),
    file: zod_1.z.instanceof(File),
    customer: zod_1.z.number().int().nullable(),
})
    .partial()
    .passthrough();
var InteractionTypeEnum = zod_1.z.enum(["call", "email", "meeting"]);
var Interaction = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    interaction_type: InteractionTypeEnum,
    notes: zod_1.z.string().nullish(),
    customer: zod_1.z.number().int(),
})
    .passthrough();
var InteractionRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    interaction_type: InteractionTypeEnum,
    notes: zod_1.z.string().nullish(),
    customer: zod_1.z.number().int(),
})
    .passthrough();
var PatchedInteractionRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean(),
    is_deleted: zod_1.z.boolean(),
    interaction_type: InteractionTypeEnum,
    notes: zod_1.z.string().nullable(),
    customer: zod_1.z.number().int(),
})
    .partial()
    .passthrough();
var StageEnum = zod_1.z.enum([
    "lead",
    "qualified",
    "proposal",
    "negotiation",
    "won",
    "lost",
]);
var Opportunity = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    title: zod_1.z.string().max(255),
    stage: StageEnum.optional(),
    amount: zod_1.z
        .string()
        .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
        .nullish(),
    customer: zod_1.z.number().int(),
})
    .passthrough();
var OpportunityRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    title: zod_1.z.string().min(1).max(255),
    stage: StageEnum.optional(),
    amount: zod_1.z
        .string()
        .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
        .nullish(),
    customer: zod_1.z.number().int(),
})
    .passthrough();
var PatchedOpportunityRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean(),
    is_deleted: zod_1.z.boolean(),
    title: zod_1.z.string().min(1).max(255),
    stage: StageEnum,
    amount: zod_1.z
        .string()
        .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
        .nullable(),
    customer: zod_1.z.number().int(),
})
    .partial()
    .passthrough();
var SubscriptionTypeEnum = zod_1.z.enum(["monthly", "yearly", "lifetime"]);
var Subscription = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    subscription_type: SubscriptionTypeEnum,
    start_date: zod_1.z.string().datetime({ offset: true }),
    end_date: zod_1.z.string().datetime({ offset: true }),
    customer: zod_1.z.number().int(),
})
    .passthrough();
var SubscriptionRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    subscription_type: SubscriptionTypeEnum,
    end_date: zod_1.z.string().datetime({ offset: true }),
    customer: zod_1.z.number().int(),
})
    .passthrough();
var PatchedSubscriptionRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean(),
    is_deleted: zod_1.z.boolean(),
    subscription_type: SubscriptionTypeEnum,
    end_date: zod_1.z.string().datetime({ offset: true }),
    customer: zod_1.z.number().int(),
})
    .partial()
    .passthrough();
var PriorityEnum = zod_1.z.enum(["low", "medium", "high"]);
var Task = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    title: zod_1.z.string().max(255),
    description: zod_1.z.string().nullish(),
    priority: PriorityEnum.optional(),
    due_date: zod_1.z.string().datetime({ offset: true }).nullish(),
    completed: zod_1.z.boolean().optional(),
    customer: zod_1.z.number().int().nullish(),
    opportunity: zod_1.z.number().int().nullish(),
})
    .passthrough();
var TaskRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    title: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().nullish(),
    priority: PriorityEnum.optional(),
    due_date: zod_1.z.string().datetime({ offset: true }).nullish(),
    completed: zod_1.z.boolean().optional(),
    customer: zod_1.z.number().int().nullish(),
    opportunity: zod_1.z.number().int().nullish(),
})
    .passthrough();
var PatchedTaskRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean(),
    is_deleted: zod_1.z.boolean(),
    title: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().nullable(),
    priority: PriorityEnum,
    due_date: zod_1.z.string().datetime({ offset: true }).nullable(),
    completed: zod_1.z.boolean(),
    customer: zod_1.z.number().int().nullable(),
    opportunity: zod_1.z.number().int().nullable(),
})
    .partial()
    .passthrough();
var Attendance = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    date: zod_1.z.string(),
    hours_worked: zod_1.z.number().nullish(),
    check_in: zod_1.z.string().nullish(),
    check_out: zod_1.z.string().nullish(),
    employee: zod_1.z.number().int(),
})
    .passthrough();
var AttendanceRequest = zod_1.z
    .object({
    date: zod_1.z.string(),
    hours_worked: zod_1.z.number().nullish(),
    check_in: zod_1.z.string().nullish(),
    check_out: zod_1.z.string().nullish(),
    employee: zod_1.z.number().int(),
})
    .passthrough();
var PatchedAttendanceRequest = zod_1.z
    .object({
    date: zod_1.z.string(),
    hours_worked: zod_1.z.number().nullable(),
    check_in: zod_1.z.string().nullable(),
    check_out: zod_1.z.string().nullable(),
    employee: zod_1.z.number().int(),
})
    .partial()
    .passthrough();
var Employee = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    position: zod_1.z.string().max(100).optional(),
    salary: zod_1.z
        .string()
        .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
        .optional(),
    hire_date: zod_1.z.string(),
    phone: zod_1.z.string().max(20).optional(),
    user: zod_1.z.number().int(),
    department: zod_1.z.number().int().nullish(),
})
    .passthrough();
var EmployeeRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    position: zod_1.z.string().max(100).optional(),
    salary: zod_1.z
        .string()
        .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
        .optional(),
    phone: zod_1.z.string().max(20).optional(),
    user: zod_1.z.number().int(),
    department: zod_1.z.number().int().nullish(),
})
    .passthrough();
var PatchedEmployeeRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean(),
    is_deleted: zod_1.z.boolean(),
    position: zod_1.z.string().max(100),
    salary: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    phone: zod_1.z.string().max(20),
    user: zod_1.z.number().int(),
    department: zod_1.z.number().int().nullable(),
})
    .partial()
    .passthrough();
var LeaveTypeEnum = zod_1.z.enum(["sick", "vacation", "personal"]);
var LeaveStatusEnum = zod_1.z.enum(["pending", "approved", "rejected"]);
var Leave = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    leave_type: LeaveTypeEnum,
    start_date: zod_1.z.string(),
    end_date: zod_1.z.string().nullish(),
    status: LeaveStatusEnum.optional(),
    employee: zod_1.z.number().int(),
})
    .passthrough();
var LeaveRequest = zod_1.z
    .object({
    leave_type: LeaveTypeEnum,
    end_date: zod_1.z.string().nullish(),
    status: LeaveStatusEnum.optional(),
    employee: zod_1.z.number().int(),
})
    .passthrough();
var PatchedLeaveRequest = zod_1.z
    .object({
    leave_type: LeaveTypeEnum,
    end_date: zod_1.z.string().nullable(),
    status: LeaveStatusEnum,
    employee: zod_1.z.number().int(),
})
    .partial()
    .passthrough();
var NotificationTypeEnum = zod_1.z.enum(["leave", "task", "payroll"]);
var Notification = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    notification_type: NotificationTypeEnum,
    message: zod_1.z.string().nullish(),
    is_read: zod_1.z.boolean().optional(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    employee: zod_1.z.number().int(),
})
    .passthrough();
var NotificationRequest = zod_1.z
    .object({
    notification_type: NotificationTypeEnum,
    message: zod_1.z.string().nullish(),
    is_read: zod_1.z.boolean().optional(),
    employee: zod_1.z.number().int(),
})
    .passthrough();
var PatchedNotificationRequest = zod_1.z
    .object({
    notification_type: NotificationTypeEnum,
    message: zod_1.z.string().nullable(),
    is_read: zod_1.z.boolean(),
    employee: zod_1.z.number().int(),
})
    .partial()
    .passthrough();
var Payroll = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    month: zod_1.z.string().max(20),
    basic_salary: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    bonuses: zod_1.z
        .string()
        .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
        .optional(),
    deductions: zod_1.z
        .string()
        .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
        .optional(),
    net_salary: zod_1.z
        .string()
        .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
        .nullish(),
    employee: zod_1.z.number().int(),
})
    .passthrough();
var PayrollRequest = zod_1.z
    .object({
    month: zod_1.z.string().min(1).max(20),
    basic_salary: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    bonuses: zod_1.z
        .string()
        .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
        .optional(),
    deductions: zod_1.z
        .string()
        .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
        .optional(),
    net_salary: zod_1.z
        .string()
        .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
        .nullish(),
    employee: zod_1.z.number().int(),
})
    .passthrough();
var PatchedPayrollRequest = zod_1.z
    .object({
    month: zod_1.z.string().min(1).max(20),
    basic_salary: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    bonuses: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    deductions: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    net_salary: zod_1.z
        .string()
        .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
        .nullable(),
    employee: zod_1.z.number().int(),
})
    .partial()
    .passthrough();
var RatingEnum = zod_1.z.union([
    zod_1.z.literal(1),
    zod_1.z.literal(2),
    zod_1.z.literal(3),
    zod_1.z.literal(4),
    zod_1.z.literal(5),
]);
var PerformanceReview = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    review_date: zod_1.z.string(),
    rating: RatingEnum,
    comments: zod_1.z.string().nullish(),
    employee: zod_1.z.number().int(),
})
    .passthrough();
var PerformanceReviewRequest = zod_1.z
    .object({
    rating: RatingEnum,
    comments: zod_1.z.string().nullish(),
    employee: zod_1.z.number().int(),
})
    .passthrough();
var PatchedPerformanceReviewRequest = zod_1.z
    .object({
    rating: RatingEnum,
    comments: zod_1.z.string().nullable(),
    employee: zod_1.z.number().int(),
})
    .partial()
    .passthrough();
var SphericalEnum = zod_1.z.enum([
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
var BlankEnum = zod_1.z.unknown();
var NullEnum = zod_1.z.unknown();
var CylinderEnum = zod_1.z.enum([
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
var AdditionEnum = zod_1.z.enum([
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
var PrescriptionRecord = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    right_sphere: zod_1.z.union([SphericalEnum, BlankEnum, NullEnum]).nullish(),
    right_cylinder: zod_1.z.union([CylinderEnum, BlankEnum, NullEnum]).nullish(),
    right_axis: zod_1.z.number().int().gte(0).lte(180).nullish(),
    left_sphere: zod_1.z.union([SphericalEnum, BlankEnum, NullEnum]).nullish(),
    left_cylinder: zod_1.z.union([CylinderEnum, BlankEnum, NullEnum]).nullish(),
    left_axis: zod_1.z.number().int().gte(0).lte(180).nullish(),
    right_reading_add: zod_1.z.union([AdditionEnum, BlankEnum, NullEnum]).nullish(),
    left_reading_add: zod_1.z.union([AdditionEnum, BlankEnum, NullEnum]).nullish(),
    right_pupillary_distance: zod_1.z
        .number()
        .int()
        .gte(-2147483648)
        .lte(2147483647)
        .nullish(),
    left_pupillary_distance: zod_1.z
        .number()
        .int()
        .gte(-2147483648)
        .lte(2147483647)
        .nullish(),
    sigmant_right: zod_1.z.string().max(20).optional(),
    sigmant_left: zod_1.z.string().max(20).optional(),
    a_v_right: zod_1.z.string().max(20).optional(),
    a_v_left: zod_1.z.string().max(20).optional(),
    doctor_name: zod_1.z.string().max(200).optional(),
    prescription_date: zod_1.z.string(),
    notes: zod_1.z.string().optional(),
    customer: zod_1.z.number().int(),
})
    .passthrough();
var PrescriptionRecordRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    right_sphere: zod_1.z.union([SphericalEnum, BlankEnum, NullEnum]).nullish(),
    right_cylinder: zod_1.z.union([CylinderEnum, BlankEnum, NullEnum]).nullish(),
    right_axis: zod_1.z.number().int().gte(0).lte(180).nullish(),
    left_sphere: zod_1.z.union([SphericalEnum, BlankEnum, NullEnum]).nullish(),
    left_cylinder: zod_1.z.union([CylinderEnum, BlankEnum, NullEnum]).nullish(),
    left_axis: zod_1.z.number().int().gte(0).lte(180).nullish(),
    right_reading_add: zod_1.z.union([AdditionEnum, BlankEnum, NullEnum]).nullish(),
    left_reading_add: zod_1.z.union([AdditionEnum, BlankEnum, NullEnum]).nullish(),
    right_pupillary_distance: zod_1.z
        .number()
        .int()
        .gte(-2147483648)
        .lte(2147483647)
        .nullish(),
    left_pupillary_distance: zod_1.z
        .number()
        .int()
        .gte(-2147483648)
        .lte(2147483647)
        .nullish(),
    sigmant_right: zod_1.z.string().max(20).optional(),
    sigmant_left: zod_1.z.string().max(20).optional(),
    a_v_right: zod_1.z.string().max(20).optional(),
    a_v_left: zod_1.z.string().max(20).optional(),
    doctor_name: zod_1.z.string().max(200).optional(),
    prescription_date: zod_1.z.string(),
    notes: zod_1.z.string().optional(),
    customer: zod_1.z.number().int(),
})
    .passthrough();
var PatchedPrescriptionRecordRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean(),
    is_deleted: zod_1.z.boolean(),
    right_sphere: zod_1.z.union([SphericalEnum, BlankEnum, NullEnum]).nullable(),
    right_cylinder: zod_1.z.union([CylinderEnum, BlankEnum, NullEnum]).nullable(),
    right_axis: zod_1.z.number().int().gte(0).lte(180).nullable(),
    left_sphere: zod_1.z.union([SphericalEnum, BlankEnum, NullEnum]).nullable(),
    left_cylinder: zod_1.z.union([CylinderEnum, BlankEnum, NullEnum]).nullable(),
    left_axis: zod_1.z.number().int().gte(0).lte(180).nullable(),
    right_reading_add: zod_1.z.union([AdditionEnum, BlankEnum, NullEnum]).nullable(),
    left_reading_add: zod_1.z.union([AdditionEnum, BlankEnum, NullEnum]).nullable(),
    right_pupillary_distance: zod_1.z
        .number()
        .int()
        .gte(-2147483648)
        .lte(2147483647)
        .nullable(),
    left_pupillary_distance: zod_1.z
        .number()
        .int()
        .gte(-2147483648)
        .lte(2147483647)
        .nullable(),
    sigmant_right: zod_1.z.string().max(20),
    sigmant_left: zod_1.z.string().max(20),
    a_v_right: zod_1.z.string().max(20),
    a_v_left: zod_1.z.string().max(20),
    doctor_name: zod_1.z.string().max(200),
    prescription_date: zod_1.z.string(),
    notes: zod_1.z.string(),
    customer: zod_1.z.number().int(),
})
    .partial()
    .passthrough();
var Supplier = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    name: zod_1.z.string().max(200),
    contact_person: zod_1.z.string().max(100).optional(),
    email: zod_1.z.string().max(254).email().optional(),
    phone: zod_1.z.string().max(20).optional(),
    address: zod_1.z.string().optional(),
    country: zod_1.z.string().max(50).optional(),
    website: zod_1.z.string().max(200).url().optional(),
    payment_terms: zod_1.z.string().max(100).optional(),
})
    .passthrough();
var Manufacturer = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    name: zod_1.z.string().max(100),
    country: zod_1.z.string().max(50).optional(),
    website: zod_1.z.string().max(200).url().optional(),
    email: zod_1.z.string().max(254).email().optional(),
    phone: zod_1.z.string().max(20).optional(),
})
    .passthrough();
var Brand = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    name: zod_1.z.string().max(100),
    country: zod_1.z.string().max(50).optional(),
    website: zod_1.z.string().max(200).url().optional(),
    description: zod_1.z.string().optional(),
    logo: zod_1.z.string().url().nullish(),
})
    .passthrough();
var TypeEnum = zod_1.z.enum(["CL", "SL", "SG", "EW", "AX", "OT", "DV"]);
var AttributeValue = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    value: zod_1.z.string().max(100),
    attribute: zod_1.z.number().int(),
})
    .passthrough();
var ProductVariantList = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    sku: zod_1.z.string().max(50),
    usku: zod_1.z.string(),
    frame_color: AttributeValue,
    lens_color: AttributeValue,
    selling_price: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    discount_percentage: zod_1.z
        .string()
        .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
        .optional(),
    discount_price: zod_1.z.number(),
    is_active: zod_1.z.boolean().optional(),
})
    .passthrough();
var Product = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    category: Category,
    supplier: Supplier,
    manufacturer: Manufacturer,
    brand: Brand,
    model: zod_1.z.string().max(50),
    type: TypeEnum,
    name: zod_1.z.string().max(200).nullish(),
    description: zod_1.z.string().optional(),
    main_image: zod_1.z.string().url().nullish(),
    variants: zod_1.z.array(ProductVariantList),
    is_active: zod_1.z.boolean().optional(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
})
    .passthrough();
var LensCoating = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    name: zod_1.z.string().max(100),
    description: zod_1.z.string().optional(),
    is_active: zod_1.z.boolean().optional(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
})
    .passthrough();
var ProductImage = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    variant: zod_1.z.number().int(),
    image: zod_1.z.string().url(),
    alt_text: zod_1.z.string().max(200).optional(),
    order: zod_1.z.number().int().gte(0).lte(2147483647).optional(),
    is_primary: zod_1.z.boolean().optional(),
})
    .passthrough();
var ProductVariant = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    product: Product,
    sku: zod_1.z.string().max(50),
    usku: zod_1.z.string(),
    frame_shape: AttributeValue,
    frame_material: AttributeValue,
    frame_color: AttributeValue,
    temple_length: zod_1.z.number().int().nullish(),
    temple_length_id: zod_1.z.number().int().nullable(),
    bridge_width: zod_1.z.number().int().nullish(),
    bridge_width_id: zod_1.z.number().int().nullable(),
    lens_diameter: zod_1.z.number().int().nullish(),
    lens_diameter_id: zod_1.z.number().int().nullable(),
    lens_color: zod_1.z.number().int().nullish(),
    lens_color_id: zod_1.z.number().int().nullable(),
    lens_material: zod_1.z.number().int().nullish(),
    lens_material_id: zod_1.z.number().int().nullable(),
    lens_base_curve: zod_1.z.number().int().nullish(),
    lens_base_curve_id: zod_1.z.number().int().nullable(),
    lens_water_content: zod_1.z.number().int().nullish(),
    lens_water_content_id: zod_1.z.number().int().nullable(),
    replacement_schedule: zod_1.z.number().int().nullish(),
    replacement_schedule_id: zod_1.z.number().int().nullable(),
    expiration_date: zod_1.z.string().nullish(),
    lens_coatings: zod_1.z.array(LensCoating),
    lens_type: AttributeValue,
    spherical: zod_1.z.union([SphericalEnum, BlankEnum, NullEnum]).nullish(),
    cylinder: zod_1.z.union([CylinderEnum, BlankEnum, NullEnum]).nullish(),
    axis: zod_1.z.number().int().gte(0).lte(180).nullish(),
    addition: zod_1.z.union([AdditionEnum, BlankEnum, NullEnum]).nullish(),
    unit: zod_1.z.number().int().nullish(),
    unit_id: zod_1.z.number().int().nullable(),
    warranty: zod_1.z.number().int().nullish(),
    warranty_id: zod_1.z.number().int().nullable(),
    weight: zod_1.z.number().int().nullish(),
    weight_id: zod_1.z.number().int().nullable(),
    dimensions: zod_1.z.number().int().nullish(),
    dimensions_id: zod_1.z.number().int().nullable(),
    last_purchase_price: zod_1.z
        .string()
        .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
        .nullish(),
    selling_price: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    discount_percentage: zod_1.z
        .string()
        .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
        .optional(),
    discount_price: zod_1.z.string(),
    images: zod_1.z.array(ProductImage),
    is_active: zod_1.z.boolean().optional(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
})
    .passthrough();
var ProductVariantRequest = zod_1.z
    .object({
    product_id: zod_1.z.number().int(),
    sku: zod_1.z.string().min(1).max(50),
    frame_shape_id: zod_1.z.number().int().nullable(),
    frame_material_id: zod_1.z.number().int().nullable(),
    frame_color_id: zod_1.z.number().int().nullable(),
    temple_length: zod_1.z.number().int().nullish(),
    bridge_width: zod_1.z.number().int().nullish(),
    lens_diameter: zod_1.z.number().int().nullish(),
    lens_color: zod_1.z.number().int().nullish(),
    lens_material: zod_1.z.number().int().nullish(),
    lens_base_curve: zod_1.z.number().int().nullish(),
    lens_water_content: zod_1.z.number().int().nullish(),
    replacement_schedule: zod_1.z.number().int().nullish(),
    expiration_date: zod_1.z.string().nullish(),
    lens_coating_ids: zod_1.z.array(zod_1.z.number().int()).optional(),
    lens_type_id: zod_1.z.number().int().nullable(),
    spherical: zod_1.z.union([SphericalEnum, BlankEnum, NullEnum]).nullish(),
    cylinder: zod_1.z.union([CylinderEnum, BlankEnum, NullEnum]).nullish(),
    axis: zod_1.z.number().int().gte(0).lte(180).nullish(),
    addition: zod_1.z.union([AdditionEnum, BlankEnum, NullEnum]).nullish(),
    unit: zod_1.z.number().int().nullish(),
    warranty: zod_1.z.number().int().nullish(),
    weight: zod_1.z.number().int().nullish(),
    dimensions: zod_1.z.number().int().nullish(),
    last_purchase_price: zod_1.z
        .string()
        .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
        .nullish(),
    selling_price: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    discount_percentage: zod_1.z
        .string()
        .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
        .optional(),
    is_active: zod_1.z.boolean().optional(),
})
    .passthrough();
var PatchedProductVariantRequest = zod_1.z
    .object({
    product_id: zod_1.z.number().int(),
    sku: zod_1.z.string().min(1).max(50),
    frame_shape_id: zod_1.z.number().int().nullable(),
    frame_material_id: zod_1.z.number().int().nullable(),
    frame_color_id: zod_1.z.number().int().nullable(),
    temple_length: zod_1.z.number().int().nullable(),
    bridge_width: zod_1.z.number().int().nullable(),
    lens_diameter: zod_1.z.number().int().nullable(),
    lens_color: zod_1.z.number().int().nullable(),
    lens_material: zod_1.z.number().int().nullable(),
    lens_base_curve: zod_1.z.number().int().nullable(),
    lens_water_content: zod_1.z.number().int().nullable(),
    replacement_schedule: zod_1.z.number().int().nullable(),
    expiration_date: zod_1.z.string().nullable(),
    lens_coating_ids: zod_1.z.array(zod_1.z.number().int()),
    lens_type_id: zod_1.z.number().int().nullable(),
    spherical: zod_1.z.union([SphericalEnum, BlankEnum, NullEnum]).nullable(),
    cylinder: zod_1.z.union([CylinderEnum, BlankEnum, NullEnum]).nullable(),
    axis: zod_1.z.number().int().gte(0).lte(180).nullable(),
    addition: zod_1.z.union([AdditionEnum, BlankEnum, NullEnum]).nullable(),
    unit: zod_1.z.number().int().nullable(),
    warranty: zod_1.z.number().int().nullable(),
    weight: zod_1.z.number().int().nullable(),
    dimensions: zod_1.z.number().int().nullable(),
    last_purchase_price: zod_1.z
        .string()
        .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
        .nullable(),
    selling_price: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    discount_percentage: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    is_active: zod_1.z.boolean(),
})
    .partial()
    .passthrough();
var InvoiceItem = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    quantity: zod_1.z.number().int().gte(0).lte(2147483647).optional(),
    unit_price: zod_1.z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    total_price: zod_1.z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    product_variant: zod_1.z.number().int().nullish(),
    invoice: zod_1.z.number().int(),
})
    .passthrough();
var InvoiceTypeEnum = zod_1.z.enum([
    "purchase",
    "sale",
    "return_purchase",
    "return_sale",
]);
var InvoiceStatusEnum = zod_1.z.enum([
    "draft",
    "paid",
    "partially_paid",
    "overdue",
    "confirmed",
]);
var Invoice = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    items: zod_1.z.array(InvoiceItem),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    subtotal: zod_1.z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    tax_rate: zod_1.z
        .string()
        .regex(/^-?\d{0,1}(?:\.\d{0,4})?$/)
        .optional(),
    tax_amount: zod_1.z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    discount_amount: zod_1.z
        .string()
        .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
        .optional(),
    total_amount: zod_1.z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    paid_amount: zod_1.z
        .string()
        .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
        .optional(),
    invoice_number: zod_1.z.string(),
    invoice_type: InvoiceTypeEnum.optional(),
    due_date: zod_1.z.string().nullish(),
    status: InvoiceStatusEnum,
    notes: zod_1.z.string().nullish(),
    branch: zod_1.z.number().int().nullish(),
    customer: zod_1.z.number().int(),
    created_by: zod_1.z.number().int().nullable(),
    order: zod_1.z.number().int().nullish(),
})
    .passthrough();
var InvoiceItemRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    quantity: zod_1.z.number().int().gte(0).lte(2147483647).optional(),
    unit_price: zod_1.z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    product_variant: zod_1.z.number().int().nullish(),
    invoice: zod_1.z.number().int(),
})
    .passthrough();
var InvoiceRequest = zod_1.z
    .object({
    items: zod_1.z.array(InvoiceItemRequest),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    tax_rate: zod_1.z
        .string()
        .regex(/^-?\d{0,1}(?:\.\d{0,4})?$/)
        .optional(),
    discount_amount: zod_1.z
        .string()
        .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
        .optional(),
    paid_amount: zod_1.z
        .string()
        .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
        .optional(),
    invoice_type: InvoiceTypeEnum.optional(),
    due_date: zod_1.z.string().nullish(),
    notes: zod_1.z.string().nullish(),
    branch: zod_1.z.number().int().nullish(),
    customer: zod_1.z.number().int(),
    order: zod_1.z.number().int().nullish(),
})
    .passthrough();
var PatchedInvoiceRequest = zod_1.z
    .object({
    items: zod_1.z.array(InvoiceItemRequest),
    is_active: zod_1.z.boolean(),
    is_deleted: zod_1.z.boolean(),
    tax_rate: zod_1.z.string().regex(/^-?\d{0,1}(?:\.\d{0,4})?$/),
    discount_amount: zod_1.z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    paid_amount: zod_1.z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    invoice_type: InvoiceTypeEnum,
    due_date: zod_1.z.string().nullable(),
    notes: zod_1.z.string().nullable(),
    branch: zod_1.z.number().int().nullable(),
    customer: zod_1.z.number().int(),
    order: zod_1.z.number().int().nullable(),
})
    .partial()
    .passthrough();
var OrderItem = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    quantity: zod_1.z.number().int().gte(0).lte(2147483647).optional(),
    unit_price: zod_1.z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    total_price: zod_1.z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    product_variant: zod_1.z.number().int().nullish(),
    order: zod_1.z.number().int(),
    prescription: zod_1.z.number().int().nullish(),
})
    .passthrough();
var OrderTypeEnum = zod_1.z.enum(["cash", "credit", "insurance"]);
var OrderStatusEnum = zod_1.z.enum([
    "pending",
    "confirmed",
    "ready",
    "delivered",
    "cancelled",
]);
var PaymentStatusEnum = zod_1.z.enum([
    "pending",
    "partial",
    "paid",
    "refunded",
    "disputed",
]);
var PaymentTypeEnum = zod_1.z.enum(["cash", "credit", "insurance"]);
var Order = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    items: zod_1.z.array(OrderItem),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    subtotal: zod_1.z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    tax_rate: zod_1.z
        .string()
        .regex(/^-?\d{0,1}(?:\.\d{0,4})?$/)
        .optional(),
    tax_amount: zod_1.z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    discount_amount: zod_1.z
        .string()
        .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
        .optional(),
    total_amount: zod_1.z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    paid_amount: zod_1.z
        .string()
        .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
        .optional(),
    order_type: OrderTypeEnum.optional(),
    order_number: zod_1.z.string(),
    status: OrderStatusEnum.optional(),
    payment_status: PaymentStatusEnum.optional(),
    payment_type: PaymentTypeEnum.optional(),
    notes: zod_1.z.string().optional(),
    internal_notes: zod_1.z.string().optional(),
    confirmed_at: zod_1.z.string().datetime({ offset: true }).nullable(),
    delivered_at: zod_1.z.string().datetime({ offset: true }).nullable(),
    expected_delivery: zod_1.z.string().datetime({ offset: true }).nullish(),
    branch: zod_1.z.number().int().nullish(),
    customer: zod_1.z.number().int(),
    sales_person: zod_1.z.number().int().nullish(),
})
    .passthrough();
var OrderItemRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    quantity: zod_1.z.number().int().gte(0).lte(2147483647).optional(),
    unit_price: zod_1.z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    product_variant: zod_1.z.number().int().nullish(),
    order: zod_1.z.number().int(),
    prescription: zod_1.z.number().int().nullish(),
})
    .passthrough();
var OrderRequest = zod_1.z
    .object({
    items: zod_1.z.array(OrderItemRequest),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    tax_rate: zod_1.z
        .string()
        .regex(/^-?\d{0,1}(?:\.\d{0,4})?$/)
        .optional(),
    discount_amount: zod_1.z
        .string()
        .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
        .optional(),
    paid_amount: zod_1.z
        .string()
        .regex(/^-?\d{0,10}(?:\.\d{0,2})?$/)
        .optional(),
    order_type: OrderTypeEnum.optional(),
    status: OrderStatusEnum.optional(),
    payment_status: PaymentStatusEnum.optional(),
    payment_type: PaymentTypeEnum.optional(),
    notes: zod_1.z.string().optional(),
    internal_notes: zod_1.z.string().optional(),
    expected_delivery: zod_1.z.string().datetime({ offset: true }).nullish(),
    branch: zod_1.z.number().int().nullish(),
    customer: zod_1.z.number().int(),
    sales_person: zod_1.z.number().int().nullish(),
})
    .passthrough();
var PatchedOrderRequest = zod_1.z
    .object({
    items: zod_1.z.array(OrderItemRequest),
    is_active: zod_1.z.boolean(),
    is_deleted: zod_1.z.boolean(),
    tax_rate: zod_1.z.string().regex(/^-?\d{0,1}(?:\.\d{0,4})?$/),
    discount_amount: zod_1.z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    paid_amount: zod_1.z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    order_type: OrderTypeEnum,
    status: OrderStatusEnum,
    payment_status: PaymentStatusEnum,
    payment_type: PaymentTypeEnum,
    notes: zod_1.z.string(),
    internal_notes: zod_1.z.string(),
    expected_delivery: zod_1.z.string().datetime({ offset: true }).nullable(),
    branch: zod_1.z.number().int().nullable(),
    customer: zod_1.z.number().int(),
    sales_person: zod_1.z.number().int().nullable(),
})
    .partial()
    .passthrough();
var PaymentMethodEnum = zod_1.z.enum(["cash", "card"]);
var Payment = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    created_at: zod_1.z.string().datetime({ offset: true }),
    updated_at: zod_1.z.string().datetime({ offset: true }),
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    amount: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    payment_method: PaymentMethodEnum,
    invoice: zod_1.z.number().int(),
})
    .passthrough();
var PaymentRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean().optional(),
    is_deleted: zod_1.z.boolean().optional(),
    amount: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    payment_method: PaymentMethodEnum,
    invoice: zod_1.z.number().int(),
})
    .passthrough();
var PatchedPaymentRequest = zod_1.z
    .object({
    is_active: zod_1.z.boolean(),
    is_deleted: zod_1.z.boolean(),
    amount: zod_1.z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    payment_method: PaymentMethodEnum,
    invoice: zod_1.z.number().int(),
})
    .partial()
    .passthrough();
var UserRoleEnum = zod_1.z.enum([
    "ADMIN",
    "BRANCH_MANAGER",
    "TECHNICIAN",
    "SALESPERSON",
    "ACCOUNTANT",
    "INVENTORY_MANAGER",
    "RECEPTIONIST",
    "CRM",
]);
var User = zod_1.z
    .object({
    id: zod_1.z.number().int(),
    password: zod_1.z.string().max(128),
    last_login: zod_1.z.string().datetime({ offset: true }).nullish(),
    is_superuser: zod_1.z.boolean().optional(),
    username: zod_1.z
        .string()
        .max(150)
        .regex(/^[\w.@+-]+$/),
    first_name: zod_1.z.string().max(150).optional(),
    last_name: zod_1.z.string().max(150).optional(),
    email: zod_1.z.string().max(254).email().optional(),
    is_staff: zod_1.z.boolean().optional(),
    is_active: zod_1.z.boolean().optional(),
    date_joined: zod_1.z.string().datetime({ offset: true }).optional(),
    role: UserRoleEnum.optional(),
    phone: zod_1.z.string().max(20).nullish(),
    groups: zod_1.z.array(zod_1.z.number().int()).optional(),
    user_permissions: zod_1.z.array(zod_1.z.number().int()).optional(),
})
    .passthrough();
var UserRequest = zod_1.z
    .object({
    password: zod_1.z.string().min(1).max(128),
    last_login: zod_1.z.string().datetime({ offset: true }).nullish(),
    is_superuser: zod_1.z.boolean().optional(),
    username: zod_1.z
        .string()
        .min(1)
        .max(150)
        .regex(/^[\w.@+-]+$/),
    first_name: zod_1.z.string().max(150).optional(),
    last_name: zod_1.z.string().max(150).optional(),
    email: zod_1.z.string().max(254).email().optional(),
    is_staff: zod_1.z.boolean().optional(),
    is_active: zod_1.z.boolean().optional(),
    date_joined: zod_1.z.string().datetime({ offset: true }).optional(),
    role: UserRoleEnum.optional(),
    phone: zod_1.z.string().max(20).nullish(),
    groups: zod_1.z.array(zod_1.z.number().int()).optional(),
    user_permissions: zod_1.z.array(zod_1.z.number().int()).optional(),
})
    .passthrough();
var PatchedUserRequest = zod_1.z
    .object({
    password: zod_1.z.string().min(1).max(128),
    last_login: zod_1.z.string().datetime({ offset: true }).nullable(),
    is_superuser: zod_1.z.boolean(),
    username: zod_1.z
        .string()
        .min(1)
        .max(150)
        .regex(/^[\w.@+-]+$/),
    first_name: zod_1.z.string().max(150),
    last_name: zod_1.z.string().max(150),
    email: zod_1.z.string().max(254).email(),
    is_staff: zod_1.z.boolean(),
    is_active: zod_1.z.boolean(),
    date_joined: zod_1.z.string().datetime({ offset: true }),
    role: UserRoleEnum,
    phone: zod_1.z.string().max(20).nullable(),
    groups: zod_1.z.array(zod_1.z.number().int()),
    user_permissions: zod_1.z.array(zod_1.z.number().int()),
})
    .partial()
    .passthrough();
exports.schemas = {
    CurrencyEnum: CurrencyEnum,
    Account: Account,
    AccountRequest: AccountRequest,
    PatchedAccountRequest: PatchedAccountRequest,
    TransactionTypeEnum: TransactionTypeEnum,
    Category: Category,
    CategoryRequest: CategoryRequest,
    PatchedCategoryRequest: PatchedCategoryRequest,
    FinancialPeriod: FinancialPeriod,
    FinancialPeriodRequest: FinancialPeriodRequest,
    PatchedFinancialPeriodRequest: PatchedFinancialPeriodRequest,
    JournalEntry: JournalEntry,
    JournalEntryRequest: JournalEntryRequest,
    PatchedJournalEntryRequest: PatchedJournalEntryRequest,
    IntervalEnum: IntervalEnum,
    RecurringTransaction: RecurringTransaction,
    RecurringTransactionRequest: RecurringTransactionRequest,
    PatchedRecurringTransactionRequest: PatchedRecurringTransactionRequest,
    Tax: Tax,
    TaxRequest: TaxRequest,
    PatchedTaxRequest: PatchedTaxRequest,
    Transaction: Transaction,
    TransactionRequest: TransactionRequest,
    PatchedTransactionRequest: PatchedTransactionRequest,
    BranchUsersRoleEnum: BranchUsersRoleEnum,
    BranchUsers: BranchUsers,
    BranchUsersRequest: BranchUsersRequest,
    PatchedBranchUsersRequest: PatchedBranchUsersRequest,
    BranchTypeEnum: BranchTypeEnum,
    Branch: Branch,
    BranchRequest: BranchRequest,
    PatchedBranchRequest: PatchedBranchRequest,
    Campaign: Campaign,
    CampaignRequest: CampaignRequest,
    PatchedCampaignRequest: PatchedCampaignRequest,
    ComplaintStatusEnum: ComplaintStatusEnum,
    Complaint: Complaint,
    ComplaintRequest: ComplaintRequest,
    PatchedComplaintRequest: PatchedComplaintRequest,
    CustomerGroup: CustomerGroup,
    CustomerGroupRequest: CustomerGroupRequest,
    PatchedCustomerGroupRequest: PatchedCustomerGroupRequest,
    CustomerTypeEnum: CustomerTypeEnum,
    PreferredContactEnum: PreferredContactEnum,
    Customer: Customer,
    CustomerRequest: CustomerRequest,
    PatchedCustomerRequest: PatchedCustomerRequest,
    Document: Document,
    DocumentRequest: DocumentRequest,
    PatchedDocumentRequest: PatchedDocumentRequest,
    InteractionTypeEnum: InteractionTypeEnum,
    Interaction: Interaction,
    InteractionRequest: InteractionRequest,
    PatchedInteractionRequest: PatchedInteractionRequest,
    StageEnum: StageEnum,
    Opportunity: Opportunity,
    OpportunityRequest: OpportunityRequest,
    PatchedOpportunityRequest: PatchedOpportunityRequest,
    SubscriptionTypeEnum: SubscriptionTypeEnum,
    Subscription: Subscription,
    SubscriptionRequest: SubscriptionRequest,
    PatchedSubscriptionRequest: PatchedSubscriptionRequest,
    PriorityEnum: PriorityEnum,
    Task: Task,
    TaskRequest: TaskRequest,
    PatchedTaskRequest: PatchedTaskRequest,
    Attendance: Attendance,
    AttendanceRequest: AttendanceRequest,
    PatchedAttendanceRequest: PatchedAttendanceRequest,
    Employee: Employee,
    EmployeeRequest: EmployeeRequest,
    PatchedEmployeeRequest: PatchedEmployeeRequest,
    LeaveTypeEnum: LeaveTypeEnum,
    LeaveStatusEnum: LeaveStatusEnum,
    Leave: Leave,
    LeaveRequest: LeaveRequest,
    PatchedLeaveRequest: PatchedLeaveRequest,
    NotificationTypeEnum: NotificationTypeEnum,
    Notification: Notification,
    NotificationRequest: NotificationRequest,
    PatchedNotificationRequest: PatchedNotificationRequest,
    Payroll: Payroll,
    PayrollRequest: PayrollRequest,
    PatchedPayrollRequest: PatchedPayrollRequest,
    RatingEnum: RatingEnum,
    PerformanceReview: PerformanceReview,
    PerformanceReviewRequest: PerformanceReviewRequest,
    PatchedPerformanceReviewRequest: PatchedPerformanceReviewRequest,
    SphericalEnum: SphericalEnum,
    BlankEnum: BlankEnum,
    NullEnum: NullEnum,
    CylinderEnum: CylinderEnum,
    AdditionEnum: AdditionEnum,
    PrescriptionRecord: PrescriptionRecord,
    PrescriptionRecordRequest: PrescriptionRecordRequest,
    PatchedPrescriptionRecordRequest: PatchedPrescriptionRecordRequest,
    Supplier: Supplier,
    Manufacturer: Manufacturer,
    Brand: Brand,
    TypeEnum: TypeEnum,
    AttributeValue: AttributeValue,
    ProductVariantList: ProductVariantList,
    Product: Product,
    LensCoating: LensCoating,
    ProductImage: ProductImage,
    ProductVariant: ProductVariant,
    ProductVariantRequest: ProductVariantRequest,
    PatchedProductVariantRequest: PatchedProductVariantRequest,
    InvoiceItem: InvoiceItem,
    InvoiceTypeEnum: InvoiceTypeEnum,
    InvoiceStatusEnum: InvoiceStatusEnum,
    Invoice: Invoice,
    InvoiceItemRequest: InvoiceItemRequest,
    InvoiceRequest: InvoiceRequest,
    PatchedInvoiceRequest: PatchedInvoiceRequest,
    OrderItem: OrderItem,
    OrderTypeEnum: OrderTypeEnum,
    OrderStatusEnum: OrderStatusEnum,
    PaymentStatusEnum: PaymentStatusEnum,
    PaymentTypeEnum: PaymentTypeEnum,
    Order: Order,
    OrderItemRequest: OrderItemRequest,
    OrderRequest: OrderRequest,
    PatchedOrderRequest: PatchedOrderRequest,
    PaymentMethodEnum: PaymentMethodEnum,
    Payment: Payment,
    PaymentRequest: PaymentRequest,
    PatchedPaymentRequest: PatchedPaymentRequest,
    UserRoleEnum: UserRoleEnum,
    User: User,
    UserRequest: UserRequest,
    PatchedUserRequest: PatchedUserRequest,
};
var endpoints = (0, core_1.makeApi)([
    {
        method: "get",
        path: "/api/accounting/accounts/",
        alias: "accounting_accounts_list",
        requestFormat: "json",
        response: zod_1.z.array(Account),
    },
    {
        method: "post",
        path: "/api/accounting/accounts/",
        alias: "accounting_accounts_create",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: AccountRequest,
            },
        ],
        response: Account,
    },
    {
        method: "get",
        path: "/api/accounting/accounts/:id/",
        alias: "accounting_accounts_retrieve",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Account,
    },
    {
        method: "put",
        path: "/api/accounting/accounts/:id/",
        alias: "accounting_accounts_update",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: AccountRequest,
            },
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Account,
    },
    {
        method: "patch",
        path: "/api/accounting/accounts/:id/",
        alias: "accounting_accounts_partial_update",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: PatchedAccountRequest,
            },
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Account,
    },
    {
        method: "delete",
        path: "/api/accounting/accounts/:id/",
        alias: "accounting_accounts_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/accounting/categories/",
        alias: "accounting_categories_list",
        requestFormat: "json",
        response: zod_1.z.array(Category),
    },
    {
        method: "post",
        path: "/api/accounting/categories/",
        alias: "accounting_categories_create",
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
        path: "/api/accounting/categories/:id/",
        alias: "accounting_categories_retrieve",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Category,
    },
    {
        method: "put",
        path: "/api/accounting/categories/:id/",
        alias: "accounting_categories_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Category,
    },
    {
        method: "patch",
        path: "/api/accounting/categories/:id/",
        alias: "accounting_categories_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Category,
    },
    {
        method: "delete",
        path: "/api/accounting/categories/:id/",
        alias: "accounting_categories_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/accounting/financial-periods/",
        alias: "accounting_financial_periods_list",
        requestFormat: "json",
        response: zod_1.z.array(FinancialPeriod),
    },
    {
        method: "post",
        path: "/api/accounting/financial-periods/",
        alias: "accounting_financial_periods_create",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: FinancialPeriodRequest,
            },
        ],
        response: FinancialPeriod,
    },
    {
        method: "get",
        path: "/api/accounting/financial-periods/:id/",
        alias: "accounting_financial_periods_retrieve",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: FinancialPeriod,
    },
    {
        method: "put",
        path: "/api/accounting/financial-periods/:id/",
        alias: "accounting_financial_periods_update",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: FinancialPeriodRequest,
            },
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: FinancialPeriod,
    },
    {
        method: "patch",
        path: "/api/accounting/financial-periods/:id/",
        alias: "accounting_financial_periods_partial_update",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: PatchedFinancialPeriodRequest,
            },
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: FinancialPeriod,
    },
    {
        method: "delete",
        path: "/api/accounting/financial-periods/:id/",
        alias: "accounting_financial_periods_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/accounting/journal-entries/",
        alias: "accounting_journal_entries_list",
        requestFormat: "json",
        response: zod_1.z.array(JournalEntry),
    },
    {
        method: "post",
        path: "/api/accounting/journal-entries/",
        alias: "accounting_journal_entries_create",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: JournalEntryRequest,
            },
        ],
        response: JournalEntry,
    },
    {
        method: "get",
        path: "/api/accounting/journal-entries/:id/",
        alias: "accounting_journal_entries_retrieve",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: JournalEntry,
    },
    {
        method: "put",
        path: "/api/accounting/journal-entries/:id/",
        alias: "accounting_journal_entries_update",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: JournalEntryRequest,
            },
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: JournalEntry,
    },
    {
        method: "patch",
        path: "/api/accounting/journal-entries/:id/",
        alias: "accounting_journal_entries_partial_update",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: PatchedJournalEntryRequest,
            },
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: JournalEntry,
    },
    {
        method: "delete",
        path: "/api/accounting/journal-entries/:id/",
        alias: "accounting_journal_entries_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/accounting/recurring-transactions/",
        alias: "accounting_recurring_transactions_list",
        requestFormat: "json",
        response: zod_1.z.array(RecurringTransaction),
    },
    {
        method: "post",
        path: "/api/accounting/recurring-transactions/",
        alias: "accounting_recurring_transactions_create",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: RecurringTransactionRequest,
            },
        ],
        response: RecurringTransaction,
    },
    {
        method: "get",
        path: "/api/accounting/recurring-transactions/:id/",
        alias: "accounting_recurring_transactions_retrieve",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: RecurringTransaction,
    },
    {
        method: "put",
        path: "/api/accounting/recurring-transactions/:id/",
        alias: "accounting_recurring_transactions_update",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: RecurringTransactionRequest,
            },
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: RecurringTransaction,
    },
    {
        method: "patch",
        path: "/api/accounting/recurring-transactions/:id/",
        alias: "accounting_recurring_transactions_partial_update",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: PatchedRecurringTransactionRequest,
            },
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: RecurringTransaction,
    },
    {
        method: "delete",
        path: "/api/accounting/recurring-transactions/:id/",
        alias: "accounting_recurring_transactions_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/accounting/taxes/",
        alias: "accounting_taxes_list",
        requestFormat: "json",
        response: zod_1.z.array(Tax),
    },
    {
        method: "post",
        path: "/api/accounting/taxes/",
        alias: "accounting_taxes_create",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: TaxRequest,
            },
        ],
        response: Tax,
    },
    {
        method: "get",
        path: "/api/accounting/taxes/:id/",
        alias: "accounting_taxes_retrieve",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Tax,
    },
    {
        method: "put",
        path: "/api/accounting/taxes/:id/",
        alias: "accounting_taxes_update",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: TaxRequest,
            },
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Tax,
    },
    {
        method: "patch",
        path: "/api/accounting/taxes/:id/",
        alias: "accounting_taxes_partial_update",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: PatchedTaxRequest,
            },
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Tax,
    },
    {
        method: "delete",
        path: "/api/accounting/taxes/:id/",
        alias: "accounting_taxes_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/accounting/transactions/",
        alias: "accounting_transactions_list",
        requestFormat: "json",
        response: zod_1.z.array(Transaction),
    },
    {
        method: "post",
        path: "/api/accounting/transactions/",
        alias: "accounting_transactions_create",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: TransactionRequest,
            },
        ],
        response: Transaction,
    },
    {
        method: "get",
        path: "/api/accounting/transactions/:id/",
        alias: "accounting_transactions_retrieve",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Transaction,
    },
    {
        method: "put",
        path: "/api/accounting/transactions/:id/",
        alias: "accounting_transactions_update",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: TransactionRequest,
            },
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Transaction,
    },
    {
        method: "patch",
        path: "/api/accounting/transactions/:id/",
        alias: "accounting_transactions_partial_update",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: PatchedTransactionRequest,
            },
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Transaction,
    },
    {
        method: "delete",
        path: "/api/accounting/transactions/:id/",
        alias: "accounting_transactions_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/branches/branch-users/",
        alias: "branches_branch_users_list",
        requestFormat: "json",
        response: zod_1.z.array(BranchUsers),
    },
    {
        method: "post",
        path: "/api/branches/branch-users/",
        alias: "branches_branch_users_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: BranchUsers,
    },
    {
        method: "put",
        path: "/api/branches/branch-users/:id/",
        alias: "branches_branch_users_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: BranchUsers,
    },
    {
        method: "patch",
        path: "/api/branches/branch-users/:id/",
        alias: "branches_branch_users_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: BranchUsers,
    },
    {
        method: "delete",
        path: "/api/branches/branch-users/:id/",
        alias: "branches_branch_users_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/branches/branches/",
        alias: "branches_branches_list",
        requestFormat: "json",
        response: zod_1.z.array(Branch),
    },
    {
        method: "post",
        path: "/api/branches/branches/",
        alias: "branches_branches_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Branch,
    },
    {
        method: "put",
        path: "/api/branches/branches/:id/",
        alias: "branches_branches_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Branch,
    },
    {
        method: "patch",
        path: "/api/branches/branches/:id/",
        alias: "branches_branches_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Branch,
    },
    {
        method: "delete",
        path: "/api/branches/branches/:id/",
        alias: "branches_branches_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "post",
        path: "/api/core/import-csv/",
        alias: "core_import_csv_create",
        requestFormat: "json",
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/crm/campaigns/",
        alias: "crm_campaigns_list",
        requestFormat: "json",
        response: zod_1.z.array(Campaign),
    },
    {
        method: "post",
        path: "/api/crm/campaigns/",
        alias: "crm_campaigns_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Campaign,
    },
    {
        method: "put",
        path: "/api/crm/campaigns/:id/",
        alias: "crm_campaigns_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Campaign,
    },
    {
        method: "patch",
        path: "/api/crm/campaigns/:id/",
        alias: "crm_campaigns_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Campaign,
    },
    {
        method: "delete",
        path: "/api/crm/campaigns/:id/",
        alias: "crm_campaigns_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/crm/complaints/",
        alias: "crm_complaints_list",
        requestFormat: "json",
        response: zod_1.z.array(Complaint),
    },
    {
        method: "post",
        path: "/api/crm/complaints/",
        alias: "crm_complaints_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Complaint,
    },
    {
        method: "put",
        path: "/api/crm/complaints/:id/",
        alias: "crm_complaints_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Complaint,
    },
    {
        method: "patch",
        path: "/api/crm/complaints/:id/",
        alias: "crm_complaints_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Complaint,
    },
    {
        method: "delete",
        path: "/api/crm/complaints/:id/",
        alias: "crm_complaints_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/crm/customer-groups/",
        alias: "crm_customer_groups_list",
        requestFormat: "json",
        response: zod_1.z.array(CustomerGroup),
    },
    {
        method: "post",
        path: "/api/crm/customer-groups/",
        alias: "crm_customer_groups_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: CustomerGroup,
    },
    {
        method: "put",
        path: "/api/crm/customer-groups/:id/",
        alias: "crm_customer_groups_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: CustomerGroup,
    },
    {
        method: "patch",
        path: "/api/crm/customer-groups/:id/",
        alias: "crm_customer_groups_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: CustomerGroup,
    },
    {
        method: "delete",
        path: "/api/crm/customer-groups/:id/",
        alias: "crm_customer_groups_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/crm/customers/",
        alias: "crm_customers_list",
        requestFormat: "json",
        response: zod_1.z.array(Customer),
    },
    {
        method: "post",
        path: "/api/crm/customers/",
        alias: "crm_customers_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Customer,
    },
    {
        method: "put",
        path: "/api/crm/customers/:id/",
        alias: "crm_customers_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Customer,
    },
    {
        method: "patch",
        path: "/api/crm/customers/:id/",
        alias: "crm_customers_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Customer,
    },
    {
        method: "delete",
        path: "/api/crm/customers/:id/",
        alias: "crm_customers_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/crm/documents/",
        alias: "crm_documents_list",
        requestFormat: "json",
        response: zod_1.z.array(Document),
    },
    {
        method: "post",
        path: "/api/crm/documents/",
        alias: "crm_documents_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Document,
    },
    {
        method: "put",
        path: "/api/crm/documents/:id/",
        alias: "crm_documents_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Document,
    },
    {
        method: "patch",
        path: "/api/crm/documents/:id/",
        alias: "crm_documents_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Document,
    },
    {
        method: "delete",
        path: "/api/crm/documents/:id/",
        alias: "crm_documents_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/crm/interactions/",
        alias: "crm_interactions_list",
        requestFormat: "json",
        response: zod_1.z.array(Interaction),
    },
    {
        method: "post",
        path: "/api/crm/interactions/",
        alias: "crm_interactions_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Interaction,
    },
    {
        method: "put",
        path: "/api/crm/interactions/:id/",
        alias: "crm_interactions_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Interaction,
    },
    {
        method: "patch",
        path: "/api/crm/interactions/:id/",
        alias: "crm_interactions_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Interaction,
    },
    {
        method: "delete",
        path: "/api/crm/interactions/:id/",
        alias: "crm_interactions_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/crm/opportunities/",
        alias: "crm_opportunities_list",
        requestFormat: "json",
        response: zod_1.z.array(Opportunity),
    },
    {
        method: "post",
        path: "/api/crm/opportunities/",
        alias: "crm_opportunities_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Opportunity,
    },
    {
        method: "put",
        path: "/api/crm/opportunities/:id/",
        alias: "crm_opportunities_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Opportunity,
    },
    {
        method: "patch",
        path: "/api/crm/opportunities/:id/",
        alias: "crm_opportunities_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Opportunity,
    },
    {
        method: "delete",
        path: "/api/crm/opportunities/:id/",
        alias: "crm_opportunities_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/crm/subscriptions/",
        alias: "crm_subscriptions_list",
        requestFormat: "json",
        response: zod_1.z.array(Subscription),
    },
    {
        method: "post",
        path: "/api/crm/subscriptions/",
        alias: "crm_subscriptions_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Subscription,
    },
    {
        method: "put",
        path: "/api/crm/subscriptions/:id/",
        alias: "crm_subscriptions_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Subscription,
    },
    {
        method: "patch",
        path: "/api/crm/subscriptions/:id/",
        alias: "crm_subscriptions_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Subscription,
    },
    {
        method: "delete",
        path: "/api/crm/subscriptions/:id/",
        alias: "crm_subscriptions_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/crm/tasks/",
        alias: "crm_tasks_list",
        requestFormat: "json",
        response: zod_1.z.array(Task),
    },
    {
        method: "post",
        path: "/api/crm/tasks/",
        alias: "crm_tasks_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Task,
    },
    {
        method: "put",
        path: "/api/crm/tasks/:id/",
        alias: "crm_tasks_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Task,
    },
    {
        method: "patch",
        path: "/api/crm/tasks/:id/",
        alias: "crm_tasks_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Task,
    },
    {
        method: "delete",
        path: "/api/crm/tasks/:id/",
        alias: "crm_tasks_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/hrm/attendances/",
        alias: "hrm_attendances_list",
        requestFormat: "json",
        response: zod_1.z.array(Attendance),
    },
    {
        method: "post",
        path: "/api/hrm/attendances/",
        alias: "hrm_attendances_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Attendance,
    },
    {
        method: "put",
        path: "/api/hrm/attendances/:id/",
        alias: "hrm_attendances_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Attendance,
    },
    {
        method: "patch",
        path: "/api/hrm/attendances/:id/",
        alias: "hrm_attendances_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Attendance,
    },
    {
        method: "delete",
        path: "/api/hrm/attendances/:id/",
        alias: "hrm_attendances_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/hrm/employees/",
        alias: "hrm_employees_list",
        requestFormat: "json",
        response: zod_1.z.array(Employee),
    },
    {
        method: "post",
        path: "/api/hrm/employees/",
        alias: "hrm_employees_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Employee,
    },
    {
        method: "put",
        path: "/api/hrm/employees/:id/",
        alias: "hrm_employees_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Employee,
    },
    {
        method: "patch",
        path: "/api/hrm/employees/:id/",
        alias: "hrm_employees_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Employee,
    },
    {
        method: "delete",
        path: "/api/hrm/employees/:id/",
        alias: "hrm_employees_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/hrm/leaves/",
        alias: "hrm_leaves_list",
        requestFormat: "json",
        response: zod_1.z.array(Leave),
    },
    {
        method: "post",
        path: "/api/hrm/leaves/",
        alias: "hrm_leaves_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Leave,
    },
    {
        method: "put",
        path: "/api/hrm/leaves/:id/",
        alias: "hrm_leaves_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Leave,
    },
    {
        method: "patch",
        path: "/api/hrm/leaves/:id/",
        alias: "hrm_leaves_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Leave,
    },
    {
        method: "delete",
        path: "/api/hrm/leaves/:id/",
        alias: "hrm_leaves_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/hrm/notifications/",
        alias: "hrm_notifications_list",
        requestFormat: "json",
        response: zod_1.z.array(Notification),
    },
    {
        method: "post",
        path: "/api/hrm/notifications/",
        alias: "hrm_notifications_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Notification,
    },
    {
        method: "put",
        path: "/api/hrm/notifications/:id/",
        alias: "hrm_notifications_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Notification,
    },
    {
        method: "patch",
        path: "/api/hrm/notifications/:id/",
        alias: "hrm_notifications_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Notification,
    },
    {
        method: "delete",
        path: "/api/hrm/notifications/:id/",
        alias: "hrm_notifications_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/hrm/payrolls/",
        alias: "hrm_payrolls_list",
        requestFormat: "json",
        response: zod_1.z.array(Payroll),
    },
    {
        method: "post",
        path: "/api/hrm/payrolls/",
        alias: "hrm_payrolls_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Payroll,
    },
    {
        method: "put",
        path: "/api/hrm/payrolls/:id/",
        alias: "hrm_payrolls_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Payroll,
    },
    {
        method: "patch",
        path: "/api/hrm/payrolls/:id/",
        alias: "hrm_payrolls_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Payroll,
    },
    {
        method: "delete",
        path: "/api/hrm/payrolls/:id/",
        alias: "hrm_payrolls_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/hrm/performance-reviews/",
        alias: "hrm_performance_reviews_list",
        requestFormat: "json",
        response: zod_1.z.array(PerformanceReview),
    },
    {
        method: "post",
        path: "/api/hrm/performance-reviews/",
        alias: "hrm_performance_reviews_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: PerformanceReview,
    },
    {
        method: "put",
        path: "/api/hrm/performance-reviews/:id/",
        alias: "hrm_performance_reviews_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: PerformanceReview,
    },
    {
        method: "patch",
        path: "/api/hrm/performance-reviews/:id/",
        alias: "hrm_performance_reviews_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: PerformanceReview,
    },
    {
        method: "delete",
        path: "/api/hrm/performance-reviews/:id/",
        alias: "hrm_performance_reviews_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/hrm/tasks/",
        alias: "hrm_tasks_list",
        requestFormat: "json",
        response: zod_1.z.array(Task),
    },
    {
        method: "post",
        path: "/api/hrm/tasks/",
        alias: "hrm_tasks_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Task,
    },
    {
        method: "put",
        path: "/api/hrm/tasks/:id/",
        alias: "hrm_tasks_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Task,
    },
    {
        method: "patch",
        path: "/api/hrm/tasks/:id/",
        alias: "hrm_tasks_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Task,
    },
    {
        method: "delete",
        path: "/api/hrm/tasks/:id/",
        alias: "hrm_tasks_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/prescriptions/prescription/",
        alias: "prescriptions_prescription_list",
        requestFormat: "json",
        response: zod_1.z.array(PrescriptionRecord),
    },
    {
        method: "post",
        path: "/api/prescriptions/prescription/",
        alias: "prescriptions_prescription_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: PrescriptionRecord,
    },
    {
        method: "put",
        path: "/api/prescriptions/prescription/:id/",
        alias: "prescriptions_prescription_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: PrescriptionRecord,
    },
    {
        method: "patch",
        path: "/api/prescriptions/prescription/:id/",
        alias: "prescriptions_prescription_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: PrescriptionRecord,
    },
    {
        method: "delete",
        path: "/api/prescriptions/prescription/:id/",
        alias: "prescriptions_prescription_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/products/variants/",
        alias: "products_variants_list",
        requestFormat: "json",
        response: zod_1.z.array(ProductVariant),
    },
    {
        method: "post",
        path: "/api/products/variants/",
        alias: "products_variants_create",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: ProductVariantRequest,
            },
        ],
        response: ProductVariant,
    },
    {
        method: "get",
        path: "/api/products/variants/:id/",
        alias: "products_variants_retrieve",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: ProductVariant,
    },
    {
        method: "put",
        path: "/api/products/variants/:id/",
        alias: "products_variants_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: ProductVariant,
    },
    {
        method: "patch",
        path: "/api/products/variants/:id/",
        alias: "products_variants_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: ProductVariant,
    },
    {
        method: "delete",
        path: "/api/products/variants/:id/",
        alias: "products_variants_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "post",
        path: "/api/products/variants/:id/calculate-price/",
        alias: "products_variants_calculate_price_create",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: ProductVariant,
    },
    {
        method: "get",
        path: "/api/products/variants/search/",
        alias: "products_variants_search_retrieve",
        requestFormat: "json",
        response: ProductVariant,
    },
    {
        method: "get",
        path: "/api/sales/invoices/",
        alias: "sales_invoices_list",
        requestFormat: "json",
        response: zod_1.z.array(Invoice),
    },
    {
        method: "post",
        path: "/api/sales/invoices/",
        alias: "sales_invoices_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Invoice,
    },
    {
        method: "put",
        path: "/api/sales/invoices/:id/",
        alias: "sales_invoices_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Invoice,
    },
    {
        method: "patch",
        path: "/api/sales/invoices/:id/",
        alias: "sales_invoices_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Invoice,
    },
    {
        method: "delete",
        path: "/api/sales/invoices/:id/",
        alias: "sales_invoices_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "post",
        path: "/api/sales/invoices/:id/calculate_totals/",
        alias: "sales_invoices_calculate_totals_create",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Invoice,
    },
    {
        method: "post",
        path: "/api/sales/invoices/:id/confirm/",
        alias: "sales_invoices_confirm_create",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Invoice,
    },
    {
        method: "get",
        path: "/api/sales/invoices/choices/",
        alias: "sales_invoices_choices_retrieve",
        requestFormat: "json",
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/sales/orders/",
        alias: "sales_orders_list",
        requestFormat: "json",
        response: zod_1.z.array(Order),
    },
    {
        method: "post",
        path: "/api/sales/orders/",
        alias: "sales_orders_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Order,
    },
    {
        method: "put",
        path: "/api/sales/orders/:id/",
        alias: "sales_orders_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Order,
    },
    {
        method: "patch",
        path: "/api/sales/orders/:id/",
        alias: "sales_orders_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Order,
    },
    {
        method: "delete",
        path: "/api/sales/orders/:id/",
        alias: "sales_orders_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "post",
        path: "/api/sales/orders/:id/calculate_totals/",
        alias: "sales_orders_calculate_totals_create",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Order,
    },
    {
        method: "post",
        path: "/api/sales/orders/:id/cancel/",
        alias: "sales_orders_cancel_create",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Order,
    },
    {
        method: "post",
        path: "/api/sales/orders/:id/confirm/",
        alias: "sales_orders_confirm_create",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Order,
    },
    {
        method: "get",
        path: "/api/sales/orders/choices/",
        alias: "sales_orders_choices_retrieve",
        requestFormat: "json",
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/sales/payments/",
        alias: "sales_payments_list",
        requestFormat: "json",
        response: zod_1.z.array(Payment),
    },
    {
        method: "post",
        path: "/api/sales/payments/",
        alias: "sales_payments_create",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: PaymentRequest,
            },
        ],
        response: Payment,
    },
    {
        method: "get",
        path: "/api/sales/payments/:id/",
        alias: "sales_payments_retrieve",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: Payment,
    },
    {
        method: "put",
        path: "/api/sales/payments/:id/",
        alias: "sales_payments_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Payment,
    },
    {
        method: "patch",
        path: "/api/sales/payments/:id/",
        alias: "sales_payments_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: Payment,
    },
    {
        method: "delete",
        path: "/api/sales/payments/:id/",
        alias: "sales_payments_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
    {
        method: "post",
        path: "/api/users//refresh-token/",
        alias: "users_refresh_token_create",
        requestFormat: "json",
        response: zod_1.z.void(),
    },
    {
        method: "post",
        path: "/api/users/login/",
        alias: "users_login_create",
        requestFormat: "json",
        response: zod_1.z.void(),
    },
    {
        method: "post",
        path: "/api/users/logout/",
        alias: "users_logout_create",
        requestFormat: "json",
        response: zod_1.z.void(),
    },
    {
        method: "post",
        path: "/api/users/register/",
        alias: "users_register_create",
        requestFormat: "json",
        response: zod_1.z.void(),
    },
    {
        method: "post",
        path: "/api/users/update-profile/",
        alias: "users_update_profile_create",
        requestFormat: "json",
        response: zod_1.z.void(),
    },
    {
        method: "get",
        path: "/api/users/users/",
        alias: "users_users_list",
        requestFormat: "json",
        response: zod_1.z.array(User),
    },
    {
        method: "post",
        path: "/api/users/users/",
        alias: "users_users_create",
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
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: User,
    },
    {
        method: "put",
        path: "/api/users/users/:id/",
        alias: "users_users_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: User,
    },
    {
        method: "patch",
        path: "/api/users/users/:id/",
        alias: "users_users_partial_update",
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
                schema: zod_1.z.number().int(),
            },
        ],
        response: User,
    },
    {
        method: "delete",
        path: "/api/users/users/:id/",
        alias: "users_users_destroy",
        requestFormat: "json",
        parameters: [
            {
                name: "id",
                type: "Path",
                schema: zod_1.z.number().int(),
            },
        ],
        response: zod_1.z.void(),
    },
]);
exports.api = new core_1.Zodios(endpoints);
function createApiClient(baseUrl, options) {
    return new core_1.Zodios(baseUrl, endpoints, options);
}
