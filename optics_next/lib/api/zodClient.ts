import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const AccountCurrencyEnum = z.enum(["USD", "EUR", "SAR"]);
const Account = z
  .object({
    id: z.number().int(),
    name: z.string().max(255),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    currency: AccountCurrencyEnum.optional(),
    user: z.number().int(),
  })
  .passthrough();
const AccountRequest = z
  .object({
    name: z.string().min(1).max(255),
    currency: AccountCurrencyEnum.optional(),
    user: z.number().int(),
  })
  .passthrough();
const PatchedAccountRequest = z
  .object({
    name: z.string().min(1).max(255),
    currency: AccountCurrencyEnum,
    user: z.number().int(),
  })
  .partial()
  .passthrough();
const TransactionTypeEnum = z.enum(["income", "expense"]);
const Category = z
  .object({
    id: z.number().int(),
    name: z.string().max(100),
    category_type: TransactionTypeEnum,
    description: z.string().nullish(),
    parent: z.number().int().nullish(),
  })
  .passthrough();
const CategoryRequest = z
  .object({
    name: z.string().min(1).max(100),
    category_type: TransactionTypeEnum,
    description: z.string().nullish(),
    parent: z.number().int().nullish(),
  })
  .passthrough();
const PatchedCategoryRequest = z
  .object({
    name: z.string().min(1).max(100),
    category_type: TransactionTypeEnum,
    description: z.string().nullable(),
    parent: z.number().int().nullable(),
  })
  .partial()
  .passthrough();
const FinancialPeriod = z
  .object({
    id: z.number().int(),
    name: z.string().max(50),
    start_date: z.string(),
    end_date: z.string(),
    is_closed: z.boolean().optional(),
  })
  .passthrough();
const FinancialPeriodRequest = z
  .object({
    name: z.string().min(1).max(50),
    start_date: z.string(),
    end_date: z.string(),
    is_closed: z.boolean().optional(),
  })
  .passthrough();
const PatchedFinancialPeriodRequest = z
  .object({
    name: z.string().min(1).max(50),
    start_date: z.string(),
    end_date: z.string(),
    is_closed: z.boolean(),
  })
  .partial()
  .passthrough();
const JournalEntry = z
  .object({
    id: z.number().int(),
    debit_currency: z.string(),
    debit: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    credit_currency: z.string(),
    credit: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    transaction: z.number().int(),
    account: z.number().int(),
  })
  .passthrough();
const JournalEntryRequest = z
  .object({
    debit: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    credit: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    transaction: z.number().int(),
    account: z.number().int(),
  })
  .passthrough();
const PatchedJournalEntryRequest = z
  .object({
    debit: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    credit: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    transaction: z.number().int(),
    account: z.number().int(),
  })
  .partial()
  .passthrough();
const IntervalEnum = z.enum(["monthly", "yearly"]);
const RecurringTransaction = z
  .object({
    id: z.number().int(),
    amount_currency: z.string(),
    amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    transaction_types: TransactionTypeEnum,
    interval: IntervalEnum,
    next_execution: z.string(),
    account: z.number().int(),
  })
  .passthrough();
const RecurringTransactionRequest = z
  .object({
    amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    transaction_types: TransactionTypeEnum,
    interval: IntervalEnum,
    next_execution: z.string(),
    account: z.number().int(),
  })
  .passthrough();
const PatchedRecurringTransactionRequest = z
  .object({
    amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    transaction_types: TransactionTypeEnum,
    interval: IntervalEnum,
    next_execution: z.string(),
    account: z.number().int(),
  })
  .partial()
  .passthrough();
const Tax = z
  .object({
    id: z.number().int(),
    name: z.string().max(100),
    rate: z.string().regex(/^-?\d{0,3}(?:\.\d{0,2})?$/),
    effective_date: z.string(),
    is_active: z.boolean().optional(),
    description: z.string().nullish(),
  })
  .passthrough();
const TaxRequest = z
  .object({
    name: z.string().min(1).max(100),
    rate: z.string().regex(/^-?\d{0,3}(?:\.\d{0,2})?$/),
    effective_date: z.string(),
    is_active: z.boolean().optional(),
    description: z.string().nullish(),
  })
  .passthrough();
const PatchedTaxRequest = z
  .object({
    name: z.string().min(1).max(100),
    rate: z.string().regex(/^-?\d{0,3}(?:\.\d{0,2})?$/),
    effective_date: z.string(),
    is_active: z.boolean(),
    description: z.string().nullable(),
  })
  .partial()
  .passthrough();
const Transaction = z
  .object({
    id: z.number().int(),
    date: z.string(),
    amount_currency: z.string(),
    amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    transaction_type: TransactionTypeEnum,
    description: z.string().nullish(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    account: z.number().int(),
    period: z.number().int(),
    category: z.number().int().nullish(),
    tax_rate: z.number().int().nullish(),
  })
  .passthrough();
const TransactionRequest = z
  .object({
    date: z.string(),
    amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    transaction_type: TransactionTypeEnum,
    description: z.string().nullish(),
    account: z.number().int(),
    period: z.number().int(),
    category: z.number().int().nullish(),
    tax_rate: z.number().int().nullish(),
  })
  .passthrough();
const PatchedTransactionRequest = z
  .object({
    date: z.string(),
    amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    transaction_type: TransactionTypeEnum,
    description: z.string().nullable(),
    account: z.number().int(),
    period: z.number().int(),
    category: z.number().int().nullable(),
    tax_rate: z.number().int().nullable(),
  })
  .partial()
  .passthrough();
const BranchUsers = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    status: z.boolean().optional(),
    notes: z.string().nullish(),
    branch_id: z.number().int(),
    employee_id: z.number().int(),
  })
  .passthrough();
const BranchUsersRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    status: z.boolean().optional(),
    notes: z.string().nullish(),
    branch_id: z.number().int(),
    employee_id: z.number().int(),
  })
  .passthrough();
const PatchedBranchUsersRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    status: z.boolean(),
    notes: z.string().nullable(),
    branch_id: z.number().int(),
    employee_id: z.number().int(),
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
    is_deleted: z.boolean().optional(),
    name: z.string().max(100),
    branch_code: z.string(),
    branch_type: BranchTypeEnum,
    country: z.string().optional(),
    city: z.string().max(100).optional(),
    address: z.string().optional(),
    phone: z.string().max(20).optional(),
    email: z.string().max(254).email().optional(),
    is_main_branch: z.boolean().optional(),
    allows_online_orders: z.boolean().optional(),
    operating_hours: z.unknown().optional(),
  })
  .passthrough();
const BranchRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    name: z.string().min(1).max(100),
    branch_type: BranchTypeEnum,
    country: z.string().optional(),
    city: z.string().max(100).optional(),
    address: z.string().optional(),
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
    is_deleted: z.boolean(),
    name: z.string().min(1).max(100),
    branch_type: BranchTypeEnum,
    country: z.string(),
    city: z.string().max(100),
    address: z.string(),
    phone: z.string().max(20),
    email: z.string().max(254).email(),
    is_main_branch: z.boolean(),
    allows_online_orders: z.boolean(),
    operating_hours: z.unknown(),
  })
  .partial()
  .passthrough();
const Campaign = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    name: z.string().max(255),
    description: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    customers: z.array(z.number().int()).optional(),
  })
  .passthrough();
const CampaignRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
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
    is_deleted: z.boolean(),
    name: z.string().min(1).max(255),
    description: z.string().min(1),
    start_date: z.string(),
    end_date: z.string(),
    customers: z.array(z.number().int()),
  })
  .partial()
  .passthrough();
const ComplaintStatusEnum = z.enum(["open", "resolved"]);
const Complaint = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    description: z.string(),
    status: ComplaintStatusEnum.optional(),
    customer: z.number().int(),
  })
  .passthrough();
const ComplaintRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    description: z.string().min(1),
    status: ComplaintStatusEnum.optional(),
    customer: z.number().int(),
  })
  .passthrough();
const PatchedComplaintRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
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
    is_deleted: z.boolean().optional(),
    email: z.string().max(254).email(),
    phone: z.string().max(20),
    name: z.string().max(100),
    message: z.string().max(500),
  })
  .passthrough();
const ContactRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    email: z.string().min(1).max(254).email(),
    phone: z.string().min(1).max(20),
    name: z.string().min(1).max(100),
    message: z.string().min(1).max(500),
  })
  .passthrough();
const PatchedContactRequest = z
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
const CustomerGroup = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    name: z.string().max(100),
    description: z.string().optional(),
    customers: z.array(z.number().int()),
  })
  .passthrough();
const CustomerGroupRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    customers: z.array(z.number().int()),
  })
  .passthrough();
const PatchedCustomerGroupRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    name: z.string().min(1).max(100),
    description: z.string(),
    customers: z.array(z.number().int()),
  })
  .partial()
  .passthrough();
const CustomerTypeEnum = z.enum(["individual", "company", "agent", "supplier"]);
const PreferredContactEnum = z.enum(["email", "phone", "sms"]);
const Customer = z
  .object({
    id: z.number().int(),
    phone: z.string().max(20).optional(),
    identification_number: z.string().min(10).max(20),
    first_name: z.string().max(100).optional(),
    last_name: z.string().max(100).optional(),
    email: z.string().max(254).email().optional(),
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
const CustomerRequest = z
  .object({
    phone: z.string().max(20).optional(),
    identification_number: z.string().min(10).max(20),
    first_name: z.string().max(100).optional(),
    last_name: z.string().max(100).optional(),
    email: z.string().max(254).email().optional(),
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
    phone: z.string().max(20),
    identification_number: z.string().min(10).max(20),
    first_name: z.string().max(100),
    last_name: z.string().max(100),
    email: z.string().max(254).email(),
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
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    title: z.string().max(255),
    file: z.string().url(),
    customer: z.number().int().nullish(),
  })
  .passthrough();
const DocumentRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    title: z.string().min(1).max(255),
    file: z.instanceof(File),
    customer: z.number().int().nullish(),
  })
  .passthrough();
const PatchedDocumentRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    title: z.string().min(1).max(255),
    file: z.instanceof(File),
    customer: z.number().int().nullable(),
  })
  .partial()
  .passthrough();
const InteractionTypeEnum = z.enum(["call", "email", "meeting"]);
const Interaction = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    interaction_type: InteractionTypeEnum,
    notes: z.string().nullish(),
    customer: z.number().int(),
  })
  .passthrough();
const InteractionRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    interaction_type: InteractionTypeEnum,
    notes: z.string().nullish(),
    customer: z.number().int(),
  })
  .passthrough();
const PatchedInteractionRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
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
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    title: z.string().max(255),
    stage: StageEnum.optional(),
    amount: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullish(),
    customer: z.number().int(),
  })
  .passthrough();
const OpportunityRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
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
    is_deleted: z.boolean(),
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
const SubscriptionTypeEnum = z.enum(["monthly", "yearly", "lifetime"]);
const Subscription = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    subscription_type: SubscriptionTypeEnum,
    start_date: z.string().datetime({ offset: true }),
    end_date: z.string().datetime({ offset: true }),
    customer: z.number().int(),
  })
  .passthrough();
const SubscriptionRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    subscription_type: SubscriptionTypeEnum,
    end_date: z.string().datetime({ offset: true }),
    customer: z.number().int(),
  })
  .passthrough();
const PatchedSubscriptionRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    subscription_type: SubscriptionTypeEnum,
    end_date: z.string().datetime({ offset: true }),
    customer: z.number().int(),
  })
  .partial()
  .passthrough();
const PriorityEnum = z.enum(["low", "medium", "high"]);
const Task = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    title: z.string().max(255),
    description: z.string().nullish(),
    priority: PriorityEnum.optional(),
    due_date: z.string().datetime({ offset: true }).nullish(),
    completed: z.boolean().optional(),
    customer: z.number().int().nullish(),
    opportunity: z.number().int().nullish(),
  })
  .passthrough();
const TaskRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
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
    is_deleted: z.boolean(),
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
    date: z.string(),
    hours_worked: z.number().nullish(),
    check_in: z.string().nullish(),
    check_out: z.string().nullish(),
    employee: z.number().int(),
  })
  .passthrough();
const AttendanceRequest = z
  .object({
    date: z.string(),
    hours_worked: z.number().nullish(),
    check_in: z.string().nullish(),
    check_out: z.string().nullish(),
    employee: z.number().int(),
  })
  .passthrough();
const PatchedAttendanceRequest = z
  .object({
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
    user_id: z.number().int(),
    department_id: z.number().int().nullish(),
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
const EmployeeRequest = z
  .object({
    user_id: z.number().int(),
    department_id: z.number().int().nullish(),
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
    user_id: z.number().int(),
    department_id: z.number().int().nullable(),
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
    leave_type: LeaveTypeEnum,
    start_date: z.string(),
    end_date: z.string().nullish(),
    status: LeaveStatusEnum.optional(),
    employee: z.number().int(),
  })
  .passthrough();
const LeaveRequest = z
  .object({
    leave_type: LeaveTypeEnum,
    end_date: z.string().nullish(),
    status: LeaveStatusEnum.optional(),
    employee: z.number().int(),
  })
  .passthrough();
const PatchedLeaveRequest = z
  .object({
    leave_type: LeaveTypeEnum,
    end_date: z.string().nullable(),
    status: LeaveStatusEnum,
    employee: z.number().int(),
  })
  .partial()
  .passthrough();
const NotificationTypeEnum = z.enum(["leave", "task", "payroll"]);
const Notification = z
  .object({
    id: z.number().int(),
    notification_type: NotificationTypeEnum,
    message: z.string().nullish(),
    is_read: z.boolean().optional(),
    created_at: z.string().datetime({ offset: true }),
    employee: z.number().int(),
  })
  .passthrough();
const NotificationRequest = z
  .object({
    notification_type: NotificationTypeEnum,
    message: z.string().nullish(),
    is_read: z.boolean().optional(),
    employee: z.number().int(),
  })
  .passthrough();
const PatchedNotificationRequest = z
  .object({
    notification_type: NotificationTypeEnum,
    message: z.string().nullable(),
    is_read: z.boolean(),
    employee: z.number().int(),
  })
  .partial()
  .passthrough();
const Payroll = z
  .object({
    id: z.number().int(),
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
    employee: z.number().int(),
  })
  .passthrough();
const PayrollRequest = z
  .object({
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
    employee: z.number().int(),
  })
  .passthrough();
const PatchedPayrollRequest = z
  .object({
    month: z.string().min(1).max(20),
    basic_salary: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    bonuses: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    deductions: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    net_salary: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullable(),
    employee: z.number().int(),
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
    review_date: z.string(),
    rating: RatingEnum,
    comments: z.string().nullish(),
    employee: z.number().int(),
  })
  .passthrough();
const PerformanceReviewRequest = z
  .object({
    rating: RatingEnum,
    comments: z.string().nullish(),
    employee: z.number().int(),
  })
  .passthrough();
const PatchedPerformanceReviewRequest = z
  .object({
    rating: RatingEnum,
    comments: z.string().nullable(),
    employee: z.number().int(),
  })
  .partial()
  .passthrough();
const SphericalEnum = z.enum([
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
const BlankEnum = z.unknown();
const NullEnum = z.unknown();
const CylinderEnum = z.enum([
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
const AdditionEnum = z.enum([
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
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    right_sphere: z.union([SphericalEnum, BlankEnum, NullEnum]).nullish(),
    right_cylinder: z.union([CylinderEnum, BlankEnum, NullEnum]).nullish(),
    right_axis: z.number().int().gte(0).lte(180).nullish(),
    left_sphere: z.union([SphericalEnum, BlankEnum, NullEnum]).nullish(),
    left_cylinder: z.union([CylinderEnum, BlankEnum, NullEnum]).nullish(),
    left_axis: z.number().int().gte(0).lte(180).nullish(),
    right_reading_add: z.union([AdditionEnum, BlankEnum, NullEnum]).nullish(),
    left_reading_add: z.union([AdditionEnum, BlankEnum, NullEnum]).nullish(),
    right_pupillary_distance: z
      .number()
      .int()
      .gte(-2147483648)
      .lte(2147483647)
      .nullish(),
    left_pupillary_distance: z
      .number()
      .int()
      .gte(-2147483648)
      .lte(2147483647)
      .nullish(),
    sigmant_right: z.string().max(20).optional(),
    sigmant_left: z.string().max(20).optional(),
    a_v_right: z.string().max(20).optional(),
    a_v_left: z.string().max(20).optional(),
    doctor_name: z.string().max(200).optional(),
    prescription_date: z.string(),
    notes: z.string().optional(),
    customer: z.number().int(),
  })
  .passthrough();
const PrescriptionRecordRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    right_sphere: z.union([SphericalEnum, BlankEnum, NullEnum]).nullish(),
    right_cylinder: z.union([CylinderEnum, BlankEnum, NullEnum]).nullish(),
    right_axis: z.number().int().gte(0).lte(180).nullish(),
    left_sphere: z.union([SphericalEnum, BlankEnum, NullEnum]).nullish(),
    left_cylinder: z.union([CylinderEnum, BlankEnum, NullEnum]).nullish(),
    left_axis: z.number().int().gte(0).lte(180).nullish(),
    right_reading_add: z.union([AdditionEnum, BlankEnum, NullEnum]).nullish(),
    left_reading_add: z.union([AdditionEnum, BlankEnum, NullEnum]).nullish(),
    right_pupillary_distance: z
      .number()
      .int()
      .gte(-2147483648)
      .lte(2147483647)
      .nullish(),
    left_pupillary_distance: z
      .number()
      .int()
      .gte(-2147483648)
      .lte(2147483647)
      .nullish(),
    sigmant_right: z.string().max(20).optional(),
    sigmant_left: z.string().max(20).optional(),
    a_v_right: z.string().max(20).optional(),
    a_v_left: z.string().max(20).optional(),
    doctor_name: z.string().max(200).optional(),
    prescription_date: z.string(),
    notes: z.string().optional(),
    customer: z.number().int(),
  })
  .passthrough();
const PatchedPrescriptionRecordRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    right_sphere: z.union([SphericalEnum, BlankEnum, NullEnum]).nullable(),
    right_cylinder: z.union([CylinderEnum, BlankEnum, NullEnum]).nullable(),
    right_axis: z.number().int().gte(0).lte(180).nullable(),
    left_sphere: z.union([SphericalEnum, BlankEnum, NullEnum]).nullable(),
    left_cylinder: z.union([CylinderEnum, BlankEnum, NullEnum]).nullable(),
    left_axis: z.number().int().gte(0).lte(180).nullable(),
    right_reading_add: z.union([AdditionEnum, BlankEnum, NullEnum]).nullable(),
    left_reading_add: z.union([AdditionEnum, BlankEnum, NullEnum]).nullable(),
    right_pupillary_distance: z
      .number()
      .int()
      .gte(-2147483648)
      .lte(2147483647)
      .nullable(),
    left_pupillary_distance: z
      .number()
      .int()
      .gte(-2147483648)
      .lte(2147483647)
      .nullable(),
    sigmant_right: z.string().max(20),
    sigmant_left: z.string().max(20),
    a_v_right: z.string().max(20),
    a_v_left: z.string().max(20),
    doctor_name: z.string().max(200),
    prescription_date: z.string(),
    notes: z.string(),
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
    question: z.number().int(),
    answered_by: z.number().int(),
  })
  .passthrough();
const ProductVariantAnswerRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    answer: z.string().min(1),
    question: z.number().int(),
    answered_by: z.number().int(),
  })
  .passthrough();
const PatchedProductVariantAnswerRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    answer: z.string().min(1),
    question: z.number().int(),
    answered_by: z.number().int(),
  })
  .partial()
  .passthrough();
const AttributeValue = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    value: z.string().max(100),
    attribute: z.number().int(),
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
const Attributes = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    name: z.string().max(100),
  })
  .passthrough();
const AttributesRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    name: z.string().min(1).max(100),
  })
  .passthrough();
const PatchedAttributesRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    name: z.string().min(1).max(100),
  })
  .partial()
  .passthrough();
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
    logo: z.string().url().nullish(),
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
    logo: z.instanceof(File).nullable(),
  })
  .partial()
  .passthrough();
const FlexiblePrice = z
  .object({
    id: z.number().int(),
    variant: z.number().int(),
    customer: z.number().int().nullable(),
    customer_group: CustomerGroup,
    branch: Branch,
    special_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    start_date: z.string().nullish(),
    end_date: z.string().nullish(),
    min_quantity: z.number().int().gte(0).lte(2147483647).optional(),
    currency: z.string().max(10).optional(),
    priority: z.number().int().gte(0).lte(2147483647).optional(),
  })
  .passthrough();
const FlexiblePriceRequest = z
  .object({
    variant: z.number().int(),
    customer: z.number().int().nullable(),
    customer_group_id: z.number().int().nullable(),
    branch_id: z.number().int().nullable(),
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
    customer: z.number().int().nullable(),
    customer_group_id: z.number().int().nullable(),
    branch_id: z.number().int().nullable(),
    special_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    start_date: z.string().nullable(),
    end_date: z.string().nullable(),
    min_quantity: z.number().int().gte(0).lte(2147483647),
    currency: z.string().min(1).max(10),
    priority: z.number().int().gte(0).lte(2147483647),
  })
  .partial()
  .passthrough();
const LensCoating = z
  .object({
    id: z.number().int(),
    name: z.string().max(100),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const LensCoatingRequest = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
  })
  .passthrough();
const PatchedLensCoatingRequest = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string(),
    is_active: z.boolean(),
  })
  .partial()
  .passthrough();
const Manufacturer = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    name: z.string().max(100),
    country: z.string().max(50).optional(),
    website: z.string().max(200).url().optional(),
    email: z.string().max(254).email().optional(),
    phone: z.string().max(20).optional(),
  })
  .passthrough();
const ManufacturerRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
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
    is_deleted: z.boolean(),
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
    offer: z.string().max(100),
    start_date: z.string(),
    end_date: z.string(),
    ProductVariant: z.number().int(),
  })
  .passthrough();
const ProductVariantOfferRequest = z
  .object({
    offer: z.string().min(1).max(100),
    start_date: z.string(),
    end_date: z.string(),
    ProductVariant: z.number().int(),
  })
  .passthrough();
const PatchedProductVariantOfferRequest = z
  .object({
    offer: z.string().min(1).max(100),
    start_date: z.string(),
    end_date: z.string(),
    ProductVariant: z.number().int(),
  })
  .partial()
  .passthrough();
const ProductImage = z
  .object({
    id: z.number().int(),
    variant: z.number().int(),
    image: z.string().url(),
    alt_text: z.string().max(200).optional(),
    order: z.number().int().gte(0).lte(2147483647).optional(),
    is_primary: z.boolean().optional(),
  })
  .passthrough();
const ProductImageRequest = z
  .object({
    variant: z.number().int(),
    image: z.instanceof(File),
    alt_text: z.string().max(200).optional(),
    order: z.number().int().gte(0).lte(2147483647).optional(),
    is_primary: z.boolean().optional(),
  })
  .passthrough();
const PatchedProductImageRequest = z
  .object({
    variant: z.number().int(),
    image: z.instanceof(File),
    alt_text: z.string().max(200),
    order: z.number().int().gte(0).lte(2147483647),
    is_primary: z.boolean(),
  })
  .partial()
  .passthrough();
const Supplier = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    name: z.string().max(50),
    contact_person: z.string().max(100).optional(),
    email: z.string().max(254).email().optional(),
    phone: z.string().max(20).optional(),
    address: z.string().optional(),
    country: z.string().max(50).optional(),
    website: z.string().max(200).url().optional(),
    payment_terms: z.string().max(100).optional(),
  })
  .passthrough();
const TypeEnum = z.enum(["CL", "SL", "SG", "EW", "AX", "OT", "DV"]);
const ProductVariantList = z
  .object({
    id: z.number().int(),
    sku: z.string().max(50),
    usku: z.string(),
    frame_color: AttributeValue,
    lens_color: AttributeValue,
    selling_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    discount_percentage: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    discount_price: z.number(),
    is_active: z.boolean().optional(),
  })
  .passthrough();
const Product = z
  .object({
    id: z.number().int(),
    category: Category,
    supplier: Supplier,
    manufacturer: Manufacturer,
    brand: Brand,
    model: z.string().max(50),
    type: TypeEnum,
    name: z.string().max(200).nullish(),
    description: z.string().optional(),
    main_image: z.string().url().nullish(),
    variants: z.array(ProductVariantList),
    is_active: z.boolean().optional(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const ProductRequest = z
  .object({
    category_id: z.number().int(),
    supplier_id: z.number().int(),
    manufacturer_id: z.number().int(),
    brand_id: z.number().int(),
    model: z.string().min(1).max(50),
    type: TypeEnum,
    name: z.string().max(200).nullish(),
    description: z.string().optional(),
    main_image: z.instanceof(File).nullish(),
    is_active: z.boolean().optional(),
  })
  .passthrough();
const PatchedProductRequest = z
  .object({
    category_id: z.number().int(),
    supplier_id: z.number().int(),
    manufacturer_id: z.number().int(),
    brand_id: z.number().int(),
    model: z.string().min(1).max(50),
    type: TypeEnum,
    name: z.string().max(200).nullable(),
    description: z.string(),
    main_image: z.instanceof(File).nullable(),
    is_active: z.boolean(),
  })
  .partial()
  .passthrough();
const ProductVariantQuestion = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    question: z.string(),
    ProductVariant: z.number().int(),
    asked_by: z.number().int(),
  })
  .passthrough();
const ProductVariantQuestionRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    question: z.string().min(1),
    ProductVariant: z.number().int(),
    asked_by: z.number().int(),
  })
  .passthrough();
const PatchedProductVariantQuestionRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    question: z.string().min(1),
    ProductVariant: z.number().int(),
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
    ProductVariant: z.number().int(),
    reviewed_by: z.number().int(),
  })
  .passthrough();
const ProductVariantReviewRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    rating: z.number().int().gte(0).lte(32767),
    review: z.string().min(1),
    ProductVariant: z.number().int(),
    reviewed_by: z.number().int(),
  })
  .passthrough();
const PatchedProductVariantReviewRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    rating: z.number().int().gte(0).lte(32767),
    review: z.string().min(1),
    ProductVariant: z.number().int(),
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
  "reserve",
  "release",
]);
const StockMovements = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    movement_type: MovementTypeEnum,
    quantity: z.number().int().gte(-2147483648).lte(2147483647),
    quantity_before: z.number().int().gte(0).lte(2147483647),
    quantity_after: z.number().int().gte(0).lte(2147483647),
    reference_number: z.string().max(50).optional(),
    notes: z.string().optional(),
    movement_date: z.string().datetime({ offset: true }),
    cost_per_unit: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    stocks: z.number().int(),
  })
  .passthrough();
const StockMovementsRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    movement_type: MovementTypeEnum,
    quantity: z.number().int().gte(-2147483648).lte(2147483647),
    quantity_before: z.number().int().gte(0).lte(2147483647),
    quantity_after: z.number().int().gte(0).lte(2147483647),
    reference_number: z.string().max(50).optional(),
    notes: z.string().optional(),
    cost_per_unit: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    stocks: z.number().int(),
  })
  .passthrough();
const PatchedStockMovementsRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    movement_type: MovementTypeEnum,
    quantity: z.number().int().gte(-2147483648).lte(2147483647),
    quantity_before: z.number().int().gte(0).lte(2147483647),
    quantity_after: z.number().int().gte(0).lte(2147483647),
    reference_number: z.string().max(50),
    notes: z.string(),
    cost_per_unit: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    stocks: z.number().int(),
  })
  .partial()
  .passthrough();
const StockTransferItem = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    quantity_requested: z.number().int().gte(0).lte(2147483647),
    quantity_sent: z.number().int().gte(0).lte(2147483647).optional(),
    quantity_received: z.number().int().gte(0).lte(2147483647).optional(),
    unit_cost: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    notes: z.string().optional(),
    transfer: z.number().int(),
    variant: z.number().int(),
  })
  .passthrough();
const StockTransferItemRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    quantity_requested: z.number().int().gte(0).lte(2147483647),
    quantity_sent: z.number().int().gte(0).lte(2147483647).optional(),
    quantity_received: z.number().int().gte(0).lte(2147483647).optional(),
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
    is_deleted: z.boolean(),
    quantity_requested: z.number().int().gte(0).lte(2147483647),
    quantity_sent: z.number().int().gte(0).lte(2147483647),
    quantity_received: z.number().int().gte(0).lte(2147483647),
    unit_cost: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    notes: z.string(),
    transfer: z.number().int(),
    variant: z.number().int(),
  })
  .partial()
  .passthrough();
const StockTransferStatusEnum = z.enum([
  "pending",
  "in_transit",
  "completed",
  "cancelled",
]);
const StockTransfer = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    transfer_number: z.string(),
    status: StockTransferStatusEnum.optional(),
    requested_by: z.string().max(100).optional(),
    approved_by: z.string().max(100).optional(),
    requested_date: z.string().datetime({ offset: true }),
    approved_date: z.string().datetime({ offset: true }).nullish(),
    shipped_date: z.string().datetime({ offset: true }).nullish(),
    received_date: z.string().datetime({ offset: true }).nullish(),
    notes: z.string().optional(),
    from_branch: z.number().int(),
    to_branch: z.number().int(),
  })
  .passthrough();
const StockTransferRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    status: StockTransferStatusEnum.optional(),
    requested_by: z.string().max(100).optional(),
    approved_by: z.string().max(100).optional(),
    approved_date: z.string().datetime({ offset: true }).nullish(),
    shipped_date: z.string().datetime({ offset: true }).nullish(),
    received_date: z.string().datetime({ offset: true }).nullish(),
    notes: z.string().optional(),
    from_branch: z.number().int(),
    to_branch: z.number().int(),
  })
  .passthrough();
const PatchedStockTransferRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    status: StockTransferStatusEnum,
    requested_by: z.string().max(100),
    approved_by: z.string().max(100),
    approved_date: z.string().datetime({ offset: true }).nullable(),
    shipped_date: z.string().datetime({ offset: true }).nullable(),
    received_date: z.string().datetime({ offset: true }).nullable(),
    notes: z.string(),
    from_branch: z.number().int(),
    to_branch: z.number().int(),
  })
  .partial()
  .passthrough();
const Stocks = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    quantity_in_stock: z.number().int().gte(0).lte(2147483647).optional(),
    reserved_quantity: z.number().int().gte(0).lte(2147483647).optional(),
    reorder_level: z.number().int().gte(0).lte(2147483647).optional(),
    max_stock_level: z.number().int().gte(0).lte(2147483647).optional(),
    min_stock_level: z.number().int().gte(0).lte(2147483647).optional(),
    average_cost: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    last_restocked: z.string().datetime({ offset: true }).nullish(),
    last_sale: z.string().datetime({ offset: true }).nullish(),
    allow_backorder: z.boolean().optional(),
    branch: z.number().int(),
    variant: z.number().int(),
  })
  .passthrough();
const StocksRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    quantity_in_stock: z.number().int().gte(0).lte(2147483647).optional(),
    reserved_quantity: z.number().int().gte(0).lte(2147483647).optional(),
    reorder_level: z.number().int().gte(0).lte(2147483647).optional(),
    max_stock_level: z.number().int().gte(0).lte(2147483647).optional(),
    min_stock_level: z.number().int().gte(0).lte(2147483647).optional(),
    average_cost: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    last_restocked: z.string().datetime({ offset: true }).nullish(),
    last_sale: z.string().datetime({ offset: true }).nullish(),
    allow_backorder: z.boolean().optional(),
    branch: z.number().int(),
    variant: z.number().int(),
  })
  .passthrough();
const PatchedStocksRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    quantity_in_stock: z.number().int().gte(0).lte(2147483647),
    reserved_quantity: z.number().int().gte(0).lte(2147483647),
    reorder_level: z.number().int().gte(0).lte(2147483647),
    max_stock_level: z.number().int().gte(0).lte(2147483647),
    min_stock_level: z.number().int().gte(0).lte(2147483647),
    average_cost: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    last_restocked: z.string().datetime({ offset: true }).nullable(),
    last_sale: z.string().datetime({ offset: true }).nullable(),
    allow_backorder: z.boolean(),
    branch: z.number().int(),
    variant: z.number().int(),
  })
  .partial()
  .passthrough();
const SupplierRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    name: z.string().min(1).max(50),
    contact_person: z.string().max(100).optional(),
    email: z.string().max(254).email().optional(),
    phone: z.string().max(20).optional(),
    address: z.string().optional(),
    country: z.string().max(50).optional(),
    website: z.string().max(200).url().optional(),
    payment_terms: z.string().max(100).optional(),
  })
  .passthrough();
const PatchedSupplierRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    name: z.string().min(1).max(50),
    contact_person: z.string().max(100),
    email: z.string().max(254).email(),
    phone: z.string().max(20),
    address: z.string(),
    country: z.string().max(50),
    website: z.string().max(200).url(),
    payment_terms: z.string().max(100),
  })
  .partial()
  .passthrough();
const ProductVariant = z
  .object({
    id: z.number().int(),
    product: Product,
    sku: z.string().max(50),
    usku: z.string(),
    frame_shape: AttributeValue,
    frame_material: AttributeValue,
    frame_color: AttributeValue,
    temple_length: z.number().int().nullish(),
    temple_length_id: z.number().int().nullable(),
    bridge_width: z.number().int().nullish(),
    bridge_width_id: z.number().int().nullable(),
    lens_diameter: z.number().int().nullish(),
    lens_diameter_id: z.number().int().nullable(),
    lens_color: z.number().int().nullish(),
    lens_color_id: z.number().int().nullable(),
    lens_material: z.number().int().nullish(),
    lens_material_id: z.number().int().nullable(),
    lens_base_curve: z.number().int().nullish(),
    lens_base_curve_id: z.number().int().nullable(),
    lens_water_content: z.number().int().nullish(),
    lens_water_content_id: z.number().int().nullable(),
    replacement_schedule: z.number().int().nullish(),
    replacement_schedule_id: z.number().int().nullable(),
    expiration_date: z.string().nullish(),
    lens_coatings: z.array(LensCoating),
    lens_type: AttributeValue,
    spherical: z.union([SphericalEnum, BlankEnum, NullEnum]).nullish(),
    cylinder: z.union([CylinderEnum, BlankEnum, NullEnum]).nullish(),
    axis: z.number().int().gte(0).lte(180).nullish(),
    addition: z.union([AdditionEnum, BlankEnum, NullEnum]).nullish(),
    unit: z.number().int().nullish(),
    unit_id: z.number().int().nullable(),
    warranty: z.number().int().nullish(),
    warranty_id: z.number().int().nullable(),
    weight: z.number().int().nullish(),
    weight_id: z.number().int().nullable(),
    dimensions: z.number().int().nullish(),
    dimensions_id: z.number().int().nullable(),
    last_purchase_price: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullish(),
    selling_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    discount_percentage: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    discount_price: z.string(),
    images: z.array(ProductImage),
    is_active: z.boolean().optional(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const ProductVariantRequest = z
  .object({
    product_id: z.number().int(),
    sku: z.string().min(1).max(50),
    frame_shape_id: z.number().int().nullable(),
    frame_material_id: z.number().int().nullable(),
    frame_color_id: z.number().int().nullable(),
    temple_length: z.number().int().nullish(),
    bridge_width: z.number().int().nullish(),
    lens_diameter: z.number().int().nullish(),
    lens_color: z.number().int().nullish(),
    lens_material: z.number().int().nullish(),
    lens_base_curve: z.number().int().nullish(),
    lens_water_content: z.number().int().nullish(),
    replacement_schedule: z.number().int().nullish(),
    expiration_date: z.string().nullish(),
    lens_coating_ids: z.array(z.number().int()).optional(),
    lens_type_id: z.number().int().nullable(),
    spherical: z.union([SphericalEnum, BlankEnum, NullEnum]).nullish(),
    cylinder: z.union([CylinderEnum, BlankEnum, NullEnum]).nullish(),
    axis: z.number().int().gte(0).lte(180).nullish(),
    addition: z.union([AdditionEnum, BlankEnum, NullEnum]).nullish(),
    unit: z.number().int().nullish(),
    warranty: z.number().int().nullish(),
    weight: z.number().int().nullish(),
    dimensions: z.number().int().nullish(),
    last_purchase_price: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullish(),
    selling_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    discount_percentage: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    is_active: z.boolean().optional(),
  })
  .passthrough();
const PatchedProductVariantRequest = z
  .object({
    product_id: z.number().int(),
    sku: z.string().min(1).max(50),
    frame_shape_id: z.number().int().nullable(),
    frame_material_id: z.number().int().nullable(),
    frame_color_id: z.number().int().nullable(),
    temple_length: z.number().int().nullable(),
    bridge_width: z.number().int().nullable(),
    lens_diameter: z.number().int().nullable(),
    lens_color: z.number().int().nullable(),
    lens_material: z.number().int().nullable(),
    lens_base_curve: z.number().int().nullable(),
    lens_water_content: z.number().int().nullable(),
    replacement_schedule: z.number().int().nullable(),
    expiration_date: z.string().nullable(),
    lens_coating_ids: z.array(z.number().int()),
    lens_type_id: z.number().int().nullable(),
    spherical: z.union([SphericalEnum, BlankEnum, NullEnum]).nullable(),
    cylinder: z.union([CylinderEnum, BlankEnum, NullEnum]).nullable(),
    axis: z.number().int().gte(0).lte(180).nullable(),
    addition: z.union([AdditionEnum, BlankEnum, NullEnum]).nullable(),
    unit: z.number().int().nullable(),
    warranty: z.number().int().nullable(),
    weight: z.number().int().nullable(),
    dimensions: z.number().int().nullable(),
    last_purchase_price: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .nullable(),
    selling_price: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    discount_percentage: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
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
    is_deleted: z.boolean().optional(),
    quantity: z.number().int().gte(0).lte(2147483647).optional(),
    unit_price: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    total_price: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    product_variant: z.number().int().nullish(),
    invoice: z.number().int(),
  })
  .passthrough();
const InvoiceTypeEnum = z.enum([
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
]);
const Invoice = z
  .object({
    id: z.number().int(),
    items: z.array(InvoiceItem),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
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
    invoice_number: z.string(),
    invoice_type: InvoiceTypeEnum.optional(),
    due_date: z.string().nullish(),
    status: InvoiceStatusEnum,
    notes: z.string().nullish(),
    branch: z.number().int().nullish(),
    customer: z.number().int(),
    created_by: z.number().int().nullable(),
    order: z.number().int().nullish(),
  })
  .passthrough();
const InvoiceItemRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    quantity: z.number().int().gte(0).lte(2147483647).optional(),
    unit_price: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    product_variant: z.number().int().nullish(),
    invoice: z.number().int(),
  })
  .passthrough();
const InvoiceRequest = z
  .object({
    items: z.array(InvoiceItemRequest),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
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
    invoice_type: InvoiceTypeEnum.optional(),
    due_date: z.string().nullish(),
    notes: z.string().nullish(),
    branch: z.number().int().nullish(),
    customer: z.number().int(),
    order: z.number().int().nullish(),
  })
  .passthrough();
const PatchedInvoiceRequest = z
  .object({
    items: z.array(InvoiceItemRequest),
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    tax_rate: z.string().regex(/^-?\d{0,1}(?:\.\d{0,4})?$/),
    discount_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    paid_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    invoice_type: InvoiceTypeEnum,
    due_date: z.string().nullable(),
    notes: z.string().nullable(),
    branch: z.number().int().nullable(),
    customer: z.number().int(),
    order: z.number().int().nullable(),
  })
  .partial()
  .passthrough();
const OrderItem = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    quantity: z.number().int().gte(0).lte(2147483647).optional(),
    unit_price: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    total_price: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    product_variant: z.number().int().nullish(),
    order: z.number().int(),
    prescription: z.number().int().nullish(),
  })
  .passthrough();
const OrderTypeEnum = z.enum(["cash", "credit", "insurance"]);
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
const PaymentTypeEnum = z.enum(["cash", "credit", "insurance"]);
const Order = z
  .object({
    id: z.number().int(),
    items: z.array(OrderItem),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
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
    order_type: OrderTypeEnum.optional(),
    order_number: z.string(),
    status: OrderStatusEnum.optional(),
    payment_status: PaymentStatusEnum.optional(),
    payment_type: PaymentTypeEnum.optional(),
    notes: z.string().optional(),
    internal_notes: z.string().optional(),
    confirmed_at: z.string().datetime({ offset: true }).nullable(),
    delivered_at: z.string().datetime({ offset: true }).nullable(),
    expected_delivery: z.string().datetime({ offset: true }).nullish(),
    branch: z.number().int().nullish(),
    customer: z.number().int(),
    sales_person: z.number().int().nullish(),
  })
  .passthrough();
const OrderItemRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    quantity: z.number().int().gte(0).lte(2147483647).optional(),
    unit_price: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    product_variant: z.number().int().nullish(),
    order: z.number().int(),
    prescription: z.number().int().nullish(),
  })
  .passthrough();
const OrderRequest = z
  .object({
    items: z.array(OrderItemRequest),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
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
    order_type: OrderTypeEnum.optional(),
    status: OrderStatusEnum.optional(),
    payment_status: PaymentStatusEnum.optional(),
    payment_type: PaymentTypeEnum.optional(),
    notes: z.string().optional(),
    internal_notes: z.string().optional(),
    expected_delivery: z.string().datetime({ offset: true }).nullish(),
    branch: z.number().int().nullish(),
    customer: z.number().int(),
    sales_person: z.number().int().nullish(),
  })
  .passthrough();
const PatchedOrderRequest = z
  .object({
    items: z.array(OrderItemRequest),
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    tax_rate: z.string().regex(/^-?\d{0,1}(?:\.\d{0,4})?$/),
    discount_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    paid_amount: z.string().regex(/^-?\d{0,10}(?:\.\d{0,2})?$/),
    order_type: OrderTypeEnum,
    status: OrderStatusEnum,
    payment_status: PaymentStatusEnum,
    payment_type: PaymentTypeEnum,
    notes: z.string(),
    internal_notes: z.string(),
    expected_delivery: z.string().datetime({ offset: true }).nullable(),
    branch: z.number().int().nullable(),
    customer: z.number().int(),
    sales_person: z.number().int().nullable(),
  })
  .partial()
  .passthrough();
const PaymentMethodEnum = z.enum(["cash", "card"]);
const Payment = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    payment_method: PaymentMethodEnum,
    invoice: z.number().int(),
  })
  .passthrough();
const PaymentRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    payment_method: PaymentMethodEnum,
    invoice: z.number().int(),
  })
  .passthrough();
const PatchedPaymentRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    amount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    payment_method: PaymentMethodEnum,
    invoice: z.number().int(),
  })
  .partial()
  .passthrough();
const SubscriptionPlanCurrencyEnum = z.enum([
  "usd",
  "egp",
  "sar",
  "aud",
  "eur",
]);
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
    currency: SubscriptionPlanCurrencyEnum.optional(),
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
    currency: SubscriptionPlanCurrencyEnum.optional(),
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
    currency: SubscriptionPlanCurrencyEnum,
    discount: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
  })
  .partial()
  .passthrough();
const ContactUs = z
  .object({
    email: z.string().max(254).email(),
    phone: z.string().max(20),
    name: z.string().max(100),
    message: z.string().max(500),
  })
  .passthrough();
const ContactUsRequest = z
  .object({
    email: z.string().min(1).max(254).email(),
    phone: z.string().min(1).max(20),
    name: z.string().min(1).max(100),
    message: z.string().min(1).max(500),
  })
  .passthrough();
const PatchedContactUsRequest = z
  .object({
    email: z.string().min(1).max(254).email(),
    phone: z.string().min(1).max(20),
    name: z.string().min(1).max(100),
    message: z.string().min(1).max(500),
  })
  .partial()
  .passthrough();
const LoginRequest = z
  .object({ username: z.string().min(1), password: z.string().min(1) })
  .passthrough();
const LoginSuccessResponse = z.object({ msg: z.string() }).passthrough();
const LoginBadRequest = z
  .object({ username: z.array(z.string()), password: z.array(z.string()) })
  .partial()
  .passthrough();
const LoginForbidden = z.object({ detail: z.string() }).passthrough();
const LogoutResponse = z.object({ msg: z.string() }).passthrough();
const TokenRefreshError = z.object({ error: z.string() }).passthrough();
const LanguageEnum = z.enum(["en", "ar"]);
const PageContent = z
  .object({
    id: z.number().int(),
    page: z.number().int(),
    language: LanguageEnum,
    title: z.string().max(255),
    content: z.string().nullish(),
    seo_title: z.string().max(255).nullish(),
    meta_description: z.string().nullish(),
    meta_keywords: z.string().max(255).nullish(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PageContentRequest = z
  .object({
    page: z.number().int(),
    language: LanguageEnum,
    title: z.string().min(1).max(255),
    content: z.string().nullish(),
    seo_title: z.string().max(255).nullish(),
    meta_description: z.string().nullish(),
    meta_keywords: z.string().max(255).nullish(),
  })
  .passthrough();
const PatchedPageContentRequest = z
  .object({
    page: z.number().int(),
    language: LanguageEnum,
    title: z.string().min(1).max(255),
    content: z.string().nullable(),
    seo_title: z.string().max(255).nullable(),
    meta_description: z.string().nullable(),
    meta_keywords: z.string().max(255).nullable(),
  })
  .partial()
  .passthrough();
const PageStatusEnum = z.enum(["draft", "published"]);
const Page = z
  .object({
    id: z.number().int(),
    slug: z
      .string()
      .max(50)
      .regex(/^[-a-zA-Z0-9_]+$/),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    status: PageStatusEnum.optional(),
    title: z.string().max(255),
    content: z.string().nullish(),
    seo_title: z.string().max(255).nullish(),
    meta_description: z.string().nullish(),
    meta_keywords: z.string().max(255).nullish(),
    author: z.number().int(),
  })
  .passthrough();
const PageRequest = z
  .object({
    slug: z
      .string()
      .min(1)
      .max(50)
      .regex(/^[-a-zA-Z0-9_]+$/),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    status: PageStatusEnum.optional(),
    title: z.string().min(1).max(255),
    content: z.string().nullish(),
    seo_title: z.string().max(255).nullish(),
    meta_description: z.string().nullish(),
    meta_keywords: z.string().max(255).nullish(),
  })
  .passthrough();
const PatchedPageRequest = z
  .object({
    slug: z
      .string()
      .min(1)
      .max(50)
      .regex(/^[-a-zA-Z0-9_]+$/),
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    status: PageStatusEnum,
    title: z.string().min(1).max(255),
    content: z.string().nullable(),
    seo_title: z.string().max(255).nullable(),
    meta_description: z.string().nullable(),
    meta_keywords: z.string().max(255).nullable(),
  })
  .partial()
  .passthrough();
const PasswordResetSuccessResponse = z
  .object({ detail: z.string() })
  .passthrough();
const PasswordResetBadRequest = z
  .object({ email: z.array(z.string()) })
  .partial()
  .passthrough();
const Permission = z
  .object({
    id: z.number().int(),
    code: z.string().max(100),
    description: z.string().optional(),
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
const Role = z
  .object({
    id: z.number().int(),
    name: z.string().max(50),
    permissions: z.array(Permission),
  })
  .passthrough();
const User = z
  .object({
    id: z.number().int(),
    username: z.string().min(5).max(50),
    email: z.string().email(),
    first_name: z.string().max(30),
    last_name: z.string().max(30),
    is_active: z.boolean().optional(),
    is_staff: z.boolean().optional(),
    role: Role,
    is_deleted: z.boolean().optional(),
    deleted_at: z.string().datetime({ offset: true }).nullable(),
    phone: z.string().regex(/^\+?\d{7,15}$/),
    client: z.number().int().nullable(),
  })
  .passthrough();
const Unauthorized = z.object({ error: z.string() }).passthrough();
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
  .object({ msg: z.string(), user: User })
  .passthrough();
const RolePermission = z
  .object({
    id: z.number().int(),
    role: z.number().int(),
    permission: z.number().int(),
  })
  .passthrough();
const RolePermissionRequest = z
  .object({ role: z.number().int(), permission: z.number().int() })
  .passthrough();
const PatchedRolePermissionRequest = z
  .object({ role: z.number().int(), permission: z.number().int() })
  .partial()
  .passthrough();
const RoleRequest = z.object({ name: z.string().min(1).max(50) }).passthrough();
const PatchedRoleRequest = z
  .object({ name: z.string().min(1).max(50) })
  .partial()
  .passthrough();
const TenantSettings = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    business_name: z.string().max(255).optional(),
    logo: z.string().url().nullish(),
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
    primary_color: z.string().max(7).optional(),
    secondary_color: z.string().max(7).optional(),
    seo_title: z.string().max(255).optional(),
    seo_description: z.string().optional(),
    seo_keywords: z.string().max(255).optional(),
    timezone: z.string().max(50).optional(),
    currency: z.string().max(10).optional(),
    date_format: z.string().max(20).optional(),
    time_format: z.string().max(20).optional(),
    address: z.string().max(255).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    postal_code: z.string().max(20).optional(),
    country: z.string().max(100).optional(),
    bank_name: z.string().max(100).optional(),
    account_number: z.string().max(100).optional(),
    iban: z.string().max(100).optional(),
    swift_code: z.string().max(100).optional(),
  })
  .passthrough();
const TenantSettingsRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    business_name: z.string().min(1).max(255),
    logo: z.instanceof(File).nullable(),
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
    primary_color: z.string().max(7),
    secondary_color: z.string().max(7),
    seo_title: z.string().max(255),
    seo_description: z.string(),
    seo_keywords: z.string().max(255),
    timezone: z.string().max(50),
    currency: z.string().max(10),
    date_format: z.string().max(20),
    time_format: z.string().max(20),
    address: z.string().max(255),
    city: z.string().max(100),
    state: z.string().max(100),
    postal_code: z.string().max(20),
    country: z.string().max(100),
    bank_name: z.string().max(100),
    account_number: z.string().max(100),
    iban: z.string().max(100),
    swift_code: z.string().max(100),
  })
  .partial()
  .passthrough();
const PatchedTenantSettingsRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    business_name: z.string().min(1).max(255),
    logo: z.instanceof(File).nullable(),
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
    primary_color: z.string().max(7),
    secondary_color: z.string().max(7),
    seo_title: z.string().max(255),
    seo_description: z.string(),
    seo_keywords: z.string().max(255),
    timezone: z.string().max(50),
    currency: z.string().max(10),
    date_format: z.string().max(20),
    time_format: z.string().max(20),
    address: z.string().max(255),
    city: z.string().max(100),
    state: z.string().max(100),
    postal_code: z.string().max(20),
    country: z.string().max(100),
    bank_name: z.string().max(100),
    account_number: z.string().max(100),
    iban: z.string().max(100),
    swift_code: z.string().max(100),
  })
  .partial()
  .passthrough();
const RefreshTokenResponse = z
  .object({ msg: z.string(), access: z.string() })
  .passthrough();
const UserRequest = z
  .object({
    username: z.string().min(5).max(50),
    email: z.string().min(1).email(),
    first_name: z.string().min(1).max(30),
    last_name: z.string().min(1).max(30),
    role_id: z.number().int(),
    is_active: z.boolean().optional(),
    is_staff: z.boolean().optional(),
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/),
    is_deleted: z.boolean().optional(),
    phone: z
      .string()
      .min(1)
      .regex(/^\+?\d{7,15}$/),
  })
  .passthrough();
const PatchedUserRequest = z
  .object({
    username: z.string().min(5).max(50),
    email: z.string().min(1).email(),
    first_name: z.string().min(1).max(30),
    last_name: z.string().min(1).max(30),
    role_id: z.number().int(),
    is_active: z.boolean(),
    is_staff: z.boolean(),
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/),
    is_deleted: z.boolean(),
    phone: z
      .string()
      .min(1)
      .regex(/^\+?\d{7,15}$/),
  })
  .partial()
  .passthrough();

export const schemas = {
  AccountCurrencyEnum,
  Account,
  AccountRequest,
  PatchedAccountRequest,
  TransactionTypeEnum,
  Category,
  CategoryRequest,
  PatchedCategoryRequest,
  FinancialPeriod,
  FinancialPeriodRequest,
  PatchedFinancialPeriodRequest,
  JournalEntry,
  JournalEntryRequest,
  PatchedJournalEntryRequest,
  IntervalEnum,
  RecurringTransaction,
  RecurringTransactionRequest,
  PatchedRecurringTransactionRequest,
  Tax,
  TaxRequest,
  PatchedTaxRequest,
  Transaction,
  TransactionRequest,
  PatchedTransactionRequest,
  BranchUsers,
  BranchUsersRequest,
  PatchedBranchUsersRequest,
  BranchTypeEnum,
  Branch,
  BranchRequest,
  PatchedBranchRequest,
  Campaign,
  CampaignRequest,
  PatchedCampaignRequest,
  ComplaintStatusEnum,
  Complaint,
  ComplaintRequest,
  PatchedComplaintRequest,
  Contact,
  ContactRequest,
  PatchedContactRequest,
  CustomerGroup,
  CustomerGroupRequest,
  PatchedCustomerGroupRequest,
  CustomerTypeEnum,
  PreferredContactEnum,
  Customer,
  CustomerRequest,
  PatchedCustomerRequest,
  Document,
  DocumentRequest,
  PatchedDocumentRequest,
  InteractionTypeEnum,
  Interaction,
  InteractionRequest,
  PatchedInteractionRequest,
  StageEnum,
  Opportunity,
  OpportunityRequest,
  PatchedOpportunityRequest,
  SubscriptionTypeEnum,
  Subscription,
  SubscriptionRequest,
  PatchedSubscriptionRequest,
  PriorityEnum,
  Task,
  TaskRequest,
  PatchedTaskRequest,
  Attendance,
  AttendanceRequest,
  PatchedAttendanceRequest,
  Department,
  DepartmentRequest,
  PatchedDepartmentRequest,
  PositionEnum,
  Employee,
  EmployeeRequest,
  PatchedEmployeeRequest,
  LeaveTypeEnum,
  LeaveStatusEnum,
  Leave,
  LeaveRequest,
  PatchedLeaveRequest,
  NotificationTypeEnum,
  Notification,
  NotificationRequest,
  PatchedNotificationRequest,
  Payroll,
  PayrollRequest,
  PatchedPayrollRequest,
  RatingEnum,
  PerformanceReview,
  PerformanceReviewRequest,
  PatchedPerformanceReviewRequest,
  SphericalEnum,
  BlankEnum,
  NullEnum,
  CylinderEnum,
  AdditionEnum,
  PrescriptionRecord,
  PrescriptionRecordRequest,
  PatchedPrescriptionRecordRequest,
  ProductVariantAnswer,
  ProductVariantAnswerRequest,
  PatchedProductVariantAnswerRequest,
  AttributeValue,
  AttributeValueRequest,
  PatchedAttributeValueRequest,
  Attributes,
  AttributesRequest,
  PatchedAttributesRequest,
  Brand,
  BrandRequest,
  PatchedBrandRequest,
  FlexiblePrice,
  FlexiblePriceRequest,
  PatchedFlexiblePriceRequest,
  LensCoating,
  LensCoatingRequest,
  PatchedLensCoatingRequest,
  Manufacturer,
  ManufacturerRequest,
  PatchedManufacturerRequest,
  GenderEnum,
  AgeGroupEnum,
  ProductVariantMarketing,
  ProductVariantMarketingRequest,
  PatchedProductVariantMarketingRequest,
  ProductVariantOffer,
  ProductVariantOfferRequest,
  PatchedProductVariantOfferRequest,
  ProductImage,
  ProductImageRequest,
  PatchedProductImageRequest,
  Supplier,
  TypeEnum,
  ProductVariantList,
  Product,
  ProductRequest,
  PatchedProductRequest,
  ProductVariantQuestion,
  ProductVariantQuestionRequest,
  PatchedProductVariantQuestionRequest,
  ProductVariantReview,
  ProductVariantReviewRequest,
  PatchedProductVariantReviewRequest,
  MovementTypeEnum,
  StockMovements,
  StockMovementsRequest,
  PatchedStockMovementsRequest,
  StockTransferItem,
  StockTransferItemRequest,
  PatchedStockTransferItemRequest,
  StockTransferStatusEnum,
  StockTransfer,
  StockTransferRequest,
  PatchedStockTransferRequest,
  Stocks,
  StocksRequest,
  PatchedStocksRequest,
  SupplierRequest,
  PatchedSupplierRequest,
  ProductVariant,
  ProductVariantRequest,
  PatchedProductVariantRequest,
  InvoiceItem,
  InvoiceTypeEnum,
  InvoiceStatusEnum,
  Invoice,
  InvoiceItemRequest,
  InvoiceRequest,
  PatchedInvoiceRequest,
  OrderItem,
  OrderTypeEnum,
  OrderStatusEnum,
  PaymentStatusEnum,
  PaymentTypeEnum,
  Order,
  OrderItemRequest,
  OrderRequest,
  PatchedOrderRequest,
  PaymentMethodEnum,
  Payment,
  PaymentRequest,
  PatchedPaymentRequest,
  SubscriptionPlanCurrencyEnum,
  SubscriptionPlan,
  Client,
  ClientRequest,
  PatchedClientRequest,
  SubscriptionPlanRequest,
  PatchedSubscriptionPlanRequest,
  ContactUs,
  ContactUsRequest,
  PatchedContactUsRequest,
  LoginRequest,
  LoginSuccessResponse,
  LoginBadRequest,
  LoginForbidden,
  LogoutResponse,
  TokenRefreshError,
  LanguageEnum,
  PageContent,
  PageContentRequest,
  PatchedPageContentRequest,
  PageStatusEnum,
  Page,
  PageRequest,
  PatchedPageRequest,
  PasswordResetSuccessResponse,
  PasswordResetBadRequest,
  Permission,
  PermissionRequest,
  PatchedPermissionRequest,
  Role,
  User,
  Unauthorized,
  RegisterRequest,
  RegisterSuccessResponse,
  RolePermission,
  RolePermissionRequest,
  PatchedRolePermissionRequest,
  RoleRequest,
  PatchedRoleRequest,
  TenantSettings,
  TenantSettingsRequest,
  PatchedTenantSettingsRequest,
  RefreshTokenResponse,
  UserRequest,
  PatchedUserRequest,
};

export const endpoints = makeApi([
  {
    method: "get",
    path: "/api/accounting/accounts/",
    alias: "accounting_accounts_list",
    requestFormat: "json",
    response: z.array(Account),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/accounting/categories/",
    alias: "accounting_categories_list",
    requestFormat: "json",
    response: z.array(Category),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/accounting/financial-periods/",
    alias: "accounting_financial_periods_list",
    requestFormat: "json",
    response: z.array(FinancialPeriod),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/accounting/journal-entries/",
    alias: "accounting_journal_entries_list",
    requestFormat: "json",
    response: z.array(JournalEntry),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/accounting/recurring-transactions/",
    alias: "accounting_recurring_transactions_list",
    requestFormat: "json",
    response: z.array(RecurringTransaction),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/accounting/taxes/",
    alias: "accounting_taxes_list",
    requestFormat: "json",
    response: z.array(Tax),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/accounting/transactions/",
    alias: "accounting_transactions_list",
    requestFormat: "json",
    response: z.array(Transaction),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/branches/branch-users/",
    alias: "branches_branch_users_list",
    requestFormat: "json",
    response: z.array(BranchUsers),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/branches/branches/",
    alias: "branches_branches_list",
    requestFormat: "json",
    response: z.array(Branch),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/core/import-csv/",
    alias: "core_import_csv_create",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/campaigns/",
    alias: "crm_campaigns_list",
    requestFormat: "json",
    response: z.array(Campaign),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/complaints/",
    alias: "crm_complaints_list",
    requestFormat: "json",
    response: z.array(Complaint),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/contact-us/",
    alias: "crm_contact_us_list",
    requestFormat: "json",
    response: z.array(Contact),
  },
  {
    method: "post",
    path: "/api/crm/contact-us/",
    alias: "crm_contact_us_create",
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
    path: "/api/crm/customer-groups/",
    alias: "crm_customer_groups_list",
    requestFormat: "json",
    response: z.array(CustomerGroup),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/customers/",
    alias: "crm_customers_list",
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
        name: "phone",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.array(Customer),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/documents/",
    alias: "crm_documents_list",
    requestFormat: "json",
    response: z.array(Document),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/interactions/",
    alias: "crm_interactions_list",
    requestFormat: "json",
    response: z.array(Interaction),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/opportunities/",
    alias: "crm_opportunities_list",
    requestFormat: "json",
    response: z.array(Opportunity),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/subscriptions/",
    alias: "crm_subscriptions_list",
    requestFormat: "json",
    response: z.array(Subscription),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/crm/tasks/",
    alias: "crm_tasks_list",
    requestFormat: "json",
    response: z.array(Task),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/hrm/attendances/",
    alias: "hrm_attendances_list",
    requestFormat: "json",
    response: z.array(Attendance),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/hrm/departments/",
    alias: "hrm_departments_list",
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
    ],
    response: z.array(Department),
  },
  {
    method: "post",
    path: "/api/hrm/departments/",
    alias: "hrm_departments_create",
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
    path: "/api/hrm/employee-form-options/",
    alias: "hrm_employee_form_options_retrieve",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/hrm/employees/",
    alias: "hrm_employees_list",
    requestFormat: "json",
    parameters: [
      {
        name: "department",
        type: "Query",
        schema: z.string().optional(),
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
    response: z.array(Employee),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/hrm/leaves/",
    alias: "hrm_leaves_list",
    requestFormat: "json",
    response: z.array(Leave),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/hrm/notifications/",
    alias: "hrm_notifications_list",
    requestFormat: "json",
    response: z.array(Notification),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/hrm/payrolls/",
    alias: "hrm_payrolls_list",
    requestFormat: "json",
    response: z.array(Payroll),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/hrm/performance-reviews/",
    alias: "hrm_performance_reviews_list",
    requestFormat: "json",
    response: z.array(PerformanceReview),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/hrm/tasks/",
    alias: "hrm_tasks_list",
    requestFormat: "json",
    response: z.array(Task),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/prescriptions/prescription/",
    alias: "prescriptions_prescription_list",
    requestFormat: "json",
    response: z.array(PrescriptionRecord),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/products/answers/",
    alias: "products_answers_list",
    requestFormat: "json",
    response: z.array(ProductVariantAnswer),
  },
  {
    method: "post",
    path: "/api/products/answers/",
    alias: "products_answers_create",
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
    path: "/api/products/attribute-values/",
    alias: "products_attribute_values_list",
    requestFormat: "json",
    response: z.array(AttributeValue),
  },
  {
    method: "post",
    path: "/api/products/attribute-values/",
    alias: "products_attribute_values_create",
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
    path: "/api/products/attributes/",
    alias: "products_attributes_list",
    requestFormat: "json",
    response: z.array(Attributes),
  },
  {
    method: "post",
    path: "/api/products/attributes/",
    alias: "products_attributes_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AttributesRequest,
      },
    ],
    response: Attributes,
  },
  {
    method: "get",
    path: "/api/products/attributes/:id/",
    alias: "products_attributes_retrieve",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Attributes,
  },
  {
    method: "put",
    path: "/api/products/attributes/:id/",
    alias: "products_attributes_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AttributesRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Attributes,
  },
  {
    method: "patch",
    path: "/api/products/attributes/:id/",
    alias: "products_attributes_partial_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedAttributesRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Attributes,
  },
  {
    method: "delete",
    path: "/api/products/attributes/:id/",
    alias: "products_attributes_destroy",
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
    path: "/api/products/brands/",
    alias: "products_brands_list",
    requestFormat: "json",
    response: z.array(Brand),
  },
  {
    method: "post",
    path: "/api/products/brands/",
    alias: "products_brands_create",
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
    path: "/api/products/categories/",
    alias: "products_categories_list",
    requestFormat: "json",
    response: z.array(Category),
  },
  {
    method: "post",
    path: "/api/products/categories/",
    alias: "products_categories_create",
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
    path: "/api/products/flexible-prices/",
    alias: "products_flexible_prices_list",
    requestFormat: "json",
    response: z.array(FlexiblePrice),
  },
  {
    method: "post",
    path: "/api/products/flexible-prices/",
    alias: "products_flexible_prices_create",
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
    path: "/api/products/lens-coatings/",
    alias: "products_lens_coatings_list",
    requestFormat: "json",
    response: z.array(LensCoating),
  },
  {
    method: "post",
    path: "/api/products/lens-coatings/",
    alias: "products_lens_coatings_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: LensCoatingRequest,
      },
    ],
    response: LensCoating,
  },
  {
    method: "get",
    path: "/api/products/lens-coatings/:id/",
    alias: "products_lens_coatings_retrieve",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: LensCoating,
  },
  {
    method: "put",
    path: "/api/products/lens-coatings/:id/",
    alias: "products_lens_coatings_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: LensCoatingRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: LensCoating,
  },
  {
    method: "patch",
    path: "/api/products/lens-coatings/:id/",
    alias: "products_lens_coatings_partial_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedLensCoatingRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: LensCoating,
  },
  {
    method: "delete",
    path: "/api/products/lens-coatings/:id/",
    alias: "products_lens_coatings_destroy",
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
    path: "/api/products/manufacturers/",
    alias: "products_manufacturers_list",
    requestFormat: "json",
    response: z.array(Manufacturer),
  },
  {
    method: "post",
    path: "/api/products/manufacturers/",
    alias: "products_manufacturers_create",
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
    path: "/api/products/marketing/",
    alias: "products_marketing_list",
    requestFormat: "json",
    response: z.array(ProductVariantMarketing),
  },
  {
    method: "post",
    path: "/api/products/marketing/",
    alias: "products_marketing_create",
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
    path: "/api/products/offers/",
    alias: "products_offers_list",
    requestFormat: "json",
    response: z.array(ProductVariantOffer),
  },
  {
    method: "post",
    path: "/api/products/offers/",
    alias: "products_offers_create",
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
    requestFormat: "json",
    response: z.array(ProductImage),
  },
  {
    method: "post",
    path: "/api/products/product-images/",
    alias: "products_product_images_create",
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
    path: "/api/products/products/",
    alias: "products_products_list",
    requestFormat: "json",
    response: z.array(Product),
  },
  {
    method: "post",
    path: "/api/products/products/",
    alias: "products_products_create",
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
    path: "/api/products/questions/",
    alias: "products_questions_list",
    requestFormat: "json",
    response: z.array(ProductVariantQuestion),
  },
  {
    method: "post",
    path: "/api/products/questions/",
    alias: "products_questions_create",
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
    path: "/api/products/reviews/",
    alias: "products_reviews_list",
    requestFormat: "json",
    response: z.array(ProductVariantReview),
  },
  {
    method: "post",
    path: "/api/products/reviews/",
    alias: "products_reviews_create",
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
    path: "/api/products/stock-movements/",
    alias: "products_stock_movements_list",
    requestFormat: "json",
    response: z.array(StockMovements),
  },
  {
    method: "post",
    path: "/api/products/stock-movements/",
    alias: "products_stock_movements_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StockMovementsRequest,
      },
    ],
    response: StockMovements,
  },
  {
    method: "get",
    path: "/api/products/stock-movements/:id/",
    alias: "products_stock_movements_retrieve",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StockMovements,
  },
  {
    method: "put",
    path: "/api/products/stock-movements/:id/",
    alias: "products_stock_movements_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StockMovementsRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StockMovements,
  },
  {
    method: "patch",
    path: "/api/products/stock-movements/:id/",
    alias: "products_stock_movements_partial_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedStockMovementsRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StockMovements,
  },
  {
    method: "delete",
    path: "/api/products/stock-movements/:id/",
    alias: "products_stock_movements_destroy",
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
    path: "/api/products/stock-transfer-items/",
    alias: "products_stock_transfer_items_list",
    requestFormat: "json",
    response: z.array(StockTransferItem),
  },
  {
    method: "post",
    path: "/api/products/stock-transfer-items/",
    alias: "products_stock_transfer_items_create",
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
    path: "/api/products/stock-transfers/",
    alias: "products_stock_transfers_list",
    requestFormat: "json",
    response: z.array(StockTransfer),
  },
  {
    method: "post",
    path: "/api/products/stock-transfers/",
    alias: "products_stock_transfers_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StockTransferRequest,
      },
    ],
    response: StockTransfer,
  },
  {
    method: "get",
    path: "/api/products/stock-transfers/:id/",
    alias: "products_stock_transfers_retrieve",
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
    path: "/api/products/stocks/",
    alias: "products_stocks_list",
    requestFormat: "json",
    response: z.array(Stocks),
  },
  {
    method: "post",
    path: "/api/products/stocks/",
    alias: "products_stocks_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StocksRequest,
      },
    ],
    response: Stocks,
  },
  {
    method: "get",
    path: "/api/products/stocks/:id/",
    alias: "products_stocks_retrieve",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Stocks,
  },
  {
    method: "put",
    path: "/api/products/stocks/:id/",
    alias: "products_stocks_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StocksRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Stocks,
  },
  {
    method: "patch",
    path: "/api/products/stocks/:id/",
    alias: "products_stocks_partial_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedStocksRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Stocks,
  },
  {
    method: "delete",
    path: "/api/products/stocks/:id/",
    alias: "products_stocks_destroy",
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
    path: "/api/products/suppliers/",
    alias: "products_suppliers_list",
    requestFormat: "json",
    response: z.array(Supplier),
  },
  {
    method: "post",
    path: "/api/products/suppliers/",
    alias: "products_suppliers_create",
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
    path: "/api/products/variants/",
    alias: "products_variants_list",
    requestFormat: "json",
    response: z.array(ProductVariant),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/sales/invoices/",
    alias: "sales_invoices_list",
    requestFormat: "json",
    response: z.array(Invoice),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: Invoice,
  },
  {
    method: "get",
    path: "/api/sales/invoices/choices/",
    alias: "sales_invoices_choices_retrieve",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/sales/orders/",
    alias: "sales_orders_list",
    requestFormat: "json",
    response: z.array(Order),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: Order,
  },
  {
    method: "get",
    path: "/api/sales/orders/choices/",
    alias: "sales_orders_choices_retrieve",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/sales/payments/",
    alias: "sales_payments_list",
    requestFormat: "json",
    response: z.array(Payment),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/tenants/activate/",
    alias: "tenants_activate_retrieve",
    description: `Main algorithm execution with improved flow control`,
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/tenants/clients/",
    alias: "tenants_clients_list",
    requestFormat: "json",
    response: z.array(Client),
  },
  {
    method: "post",
    path: "/api/tenants/clients/",
    alias: "tenants_clients_create",
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
    method: "post",
    path: "/api/tenants/create-payment-order/",
    alias: "tenants_create_payment_order_create",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/tenants/domain/",
    alias: "tenants_domain_retrieve",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/tenants/paypal/cancel/",
    alias: "tenants_paypal_cancel_retrieve",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/tenants/paypal/execute/",
    alias: "tenants_paypal_execute_create",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/tenants/paypal/webhook/",
    alias: "tenants_paypal_webhook_create",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/tenants/register/",
    alias: "tenants_register_create",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/tenants/subscription-plans/",
    alias: "tenants_subscription_plans_list",
    requestFormat: "json",
    response: z.array(SubscriptionPlan),
  },
  {
    method: "post",
    path: "/api/tenants/subscription-plans/",
    alias: "tenants_subscription_plans_create",
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
    path: "/api/users/contact-us/",
    alias: "users_contact_us_list",
    requestFormat: "json",
    response: z.array(ContactUs),
  },
  {
    method: "post",
    path: "/api/users/contact-us/",
    alias: "users_contact_us_create",
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
    path: "/api/users/contact-us/:id/",
    alias: "users_contact_us_retrieve",
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
    path: "/api/users/contact-us/:id/",
    alias: "users_contact_us_update",
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
    path: "/api/users/contact-us/:id/",
    alias: "users_contact_us_partial_update",
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
    path: "/api/users/contact-us/:id/",
    alias: "users_contact_us_destroy",
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
    response: z.object({ msg: z.string() }).passthrough(),
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
    response: z.object({ msg: z.string() }).passthrough(),
    errors: [
      {
        status: 401,
        schema: z.object({ error: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/users/page-contents/",
    alias: "users_page_contents_list",
    requestFormat: "json",
    response: z.array(PageContent),
  },
  {
    method: "post",
    path: "/api/users/page-contents/",
    alias: "users_page_contents_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PageContentRequest,
      },
    ],
    response: PageContent,
  },
  {
    method: "get",
    path: "/api/users/page-contents/:id/",
    alias: "users_page_contents_retrieve",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PageContent,
  },
  {
    method: "put",
    path: "/api/users/page-contents/:id/",
    alias: "users_page_contents_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PageContentRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PageContent,
  },
  {
    method: "patch",
    path: "/api/users/page-contents/:id/",
    alias: "users_page_contents_partial_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedPageContentRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PageContent,
  },
  {
    method: "delete",
    path: "/api/users/page-contents/:id/",
    alias: "users_page_contents_destroy",
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
    path: "/api/users/pages/",
    alias: "users_pages_list",
    requestFormat: "json",
    response: z.array(Page),
  },
  {
    method: "post",
    path: "/api/users/pages/",
    alias: "users_pages_create",
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
    path: "/api/users/pages/:slug/",
    alias: "users_pages_retrieve",
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
    method: "put",
    path: "/api/users/pages/:slug/",
    alias: "users_pages_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PageRequest,
      },
      {
        name: "slug",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Page,
  },
  {
    method: "patch",
    path: "/api/users/pages/:slug/",
    alias: "users_pages_partial_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedPageRequest,
      },
      {
        name: "slug",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Page,
  },
  {
    method: "delete",
    path: "/api/users/pages/:slug/",
    alias: "users_pages_destroy",
    requestFormat: "json",
    parameters: [
      {
        name: "slug",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/users/password-reset-confirm/",
    alias: "users_password_reset_confirm_create",
    requestFormat: "json",
    response: z.void(),
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
    requestFormat: "json",
    response: z.array(Permission),
  },
  {
    method: "post",
    path: "/api/users/permissions/",
    alias: "users_permissions_create",
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
    path: "/api/users/profile/",
    alias: "users_profile_retrieve",
    description: `Get current authenticated user profile data`,
    requestFormat: "json",
    response: User,
    errors: [
      {
        status: 401,
        schema: z.object({ error: z.string() }).passthrough(),
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
    requestFormat: "json",
    response: z.array(RolePermission),
  },
  {
    method: "post",
    path: "/api/users/role-permissions/",
    alias: "users_role_permissions_create",
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
    path: "/api/users/roles/",
    alias: "users_roles_list",
    requestFormat: "json",
    response: z.array(Role),
  },
  {
    method: "post",
    path: "/api/users/roles/",
    alias: "users_roles_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ name: z.string().min(1).max(50) }).passthrough(),
      },
    ],
    response: Role,
  },
  {
    method: "get",
    path: "/api/users/roles/:id/",
    alias: "users_roles_retrieve",
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
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ name: z.string().min(1).max(50) }).passthrough(),
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
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z
          .object({ name: z.string().min(1).max(50) })
          .partial()
          .passthrough(),
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
    path: "/api/users/tenant-settings/",
    alias: "users_tenant_settings_list",
    requestFormat: "json",
    response: z.array(TenantSettings),
  },
  {
    method: "post",
    path: "/api/users/tenant-settings/",
    alias: "users_tenant_settings_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: TenantSettingsRequest,
      },
    ],
    response: TenantSettings,
  },
  {
    method: "get",
    path: "/api/users/tenant-settings/:id/",
    alias: "users_tenant_settings_retrieve",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: TenantSettings,
  },
  {
    method: "put",
    path: "/api/users/tenant-settings/:id/",
    alias: "users_tenant_settings_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: TenantSettingsRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: TenantSettings,
  },
  {
    method: "patch",
    path: "/api/users/tenant-settings/:id/",
    alias: "users_tenant_settings_partial_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedTenantSettingsRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: TenantSettings,
  },
  {
    method: "delete",
    path: "/api/users/tenant-settings/:id/",
    alias: "users_tenant_settings_destroy",
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
    path: "/api/users/token/refresh/",
    alias: "users_token_refresh_create",
    requestFormat: "json",
    response: RefreshTokenResponse,
    errors: [
      {
        status: 401,
        schema: z.object({ error: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/users/users/",
    alias: "users_users_list",
    requestFormat: "json",
    parameters: [
      {
        name: "email",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "phone",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "role",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "username",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.array(User),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
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
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
