import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const CurrencyEnum = z.enum(["USD", "EUR", "SAR"]);
const Account = z
  .object({
    id: z.number().int(),
    name: z.string().max(255),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    currency: CurrencyEnum.optional(),
    user: z.number().int(),
  })
  .passthrough();
const AccountRequest = z
  .object({
    name: z.string().min(1).max(255),
    currency: CurrencyEnum.optional(),
    user: z.number().int(),
  })
  .passthrough();
const PatchedAccountRequest = z
  .object({
    name: z.string().min(1).max(255),
    currency: CurrencyEnum,
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
const BranchUsersRoleEnum = z.enum(["manager", "staff"]);
const BranchUsers = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    role: BranchUsersRoleEnum,
    status: z.boolean().optional(),
    notes: z.string().nullish(),
    branch: z.number().int(),
    employee: z.number().int(),
  })
  .passthrough();
const BranchUsersRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    role: BranchUsersRoleEnum,
    status: z.boolean().optional(),
    notes: z.string().nullish(),
    branch: z.number().int(),
    employee: z.number().int(),
  })
  .passthrough();
const PatchedBranchUsersRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    role: BranchUsersRoleEnum,
    status: z.boolean(),
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
    is_deleted: z.boolean().optional(),
    name: z.string().max(100),
    branch_code: z.string().max(10),
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
    branch_code: z.string().min(1).max(10),
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
    branch_code: z.string().min(1).max(10),
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
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    first_name: z.string().max(100).optional(),
    last_name: z.string().max(100).optional(),
    identification_number: z.string().min(10).max(20),
    email: z.string().max(254).email().optional(),
    phone: z.string().max(20).optional(),
    date_of_birth: z.string().nullish(),
    customer_type: CustomerTypeEnum.optional(),
    address_line1: z.string().max(200).optional(),
    address_line2: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    postal_code: z.string().max(20).optional(),
    customer_since: z.string().datetime({ offset: true }),
    is_vip: z.boolean().optional(),
    loyalty_points: z
      .number()
      .int()
      .gte(-2147483648)
      .lte(2147483647)
      .optional(),
    accepts_marketing: z.boolean().optional(),
    registration_number: z.string().max(50).nullish(),
    tax_number: z.string().max(50).nullish(),
    preferred_contact: PreferredContactEnum.optional(),
    website: z.string().max(200).url().nullish(),
    logo: z.string().url().nullish(),
    description: z.string().nullish(),
    user: z.number().int(),
  })
  .passthrough();
const CustomerRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    first_name: z.string().max(100).optional(),
    last_name: z.string().max(100).optional(),
    identification_number: z.string().min(10).max(20),
    email: z.string().max(254).email().optional(),
    phone: z.string().max(20).optional(),
    date_of_birth: z.string().nullish(),
    customer_type: CustomerTypeEnum.optional(),
    address_line1: z.string().max(200).optional(),
    address_line2: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    postal_code: z.string().max(20).optional(),
    is_vip: z.boolean().optional(),
    loyalty_points: z
      .number()
      .int()
      .gte(-2147483648)
      .lte(2147483647)
      .optional(),
    accepts_marketing: z.boolean().optional(),
    registration_number: z.string().max(50).nullish(),
    tax_number: z.string().max(50).nullish(),
    preferred_contact: PreferredContactEnum.optional(),
    website: z.string().max(200).url().nullish(),
    logo: z.instanceof(File).nullish(),
    description: z.string().nullish(),
    user: z.number().int(),
  })
  .passthrough();
const PatchedCustomerRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    first_name: z.string().max(100),
    last_name: z.string().max(100),
    identification_number: z.string().min(10).max(20),
    email: z.string().max(254).email(),
    phone: z.string().max(20),
    date_of_birth: z.string().nullable(),
    customer_type: CustomerTypeEnum,
    address_line1: z.string().max(200),
    address_line2: z.string().max(200),
    city: z.string().max(100),
    postal_code: z.string().max(20),
    is_vip: z.boolean(),
    loyalty_points: z.number().int().gte(-2147483648).lte(2147483647),
    accepts_marketing: z.boolean(),
    registration_number: z.string().max(50).nullable(),
    tax_number: z.string().max(50).nullable(),
    preferred_contact: PreferredContactEnum,
    website: z.string().max(200).url().nullable(),
    logo: z.instanceof(File).nullable(),
    description: z.string().nullable(),
    user: z.number().int(),
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
const Employee = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    position: z.string().max(100).optional(),
    salary: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    hire_date: z.string(),
    phone: z.string().max(20).optional(),
    user: z.number().int(),
    department: z.number().int().nullish(),
  })
  .passthrough();
const EmployeeRequest = z
  .object({
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    position: z.string().max(100).optional(),
    salary: z
      .string()
      .regex(/^-?\d{0,8}(?:\.\d{0,2})?$/)
      .optional(),
    phone: z.string().max(20).optional(),
    user: z.number().int(),
    department: z.number().int().nullish(),
  })
  .passthrough();
const PatchedEmployeeRequest = z
  .object({
    is_active: z.boolean(),
    is_deleted: z.boolean(),
    position: z.string().max(100),
    salary: z.string().regex(/^-?\d{0,8}(?:\.\d{0,2})?$/),
    phone: z.string().max(20),
    user: z.number().int(),
    department: z.number().int().nullable(),
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
const Supplier = z
  .object({
    id: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_active: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
    name: z.string().max(200),
    contact_person: z.string().max(100).optional(),
    email: z.string().max(254).email().optional(),
    phone: z.string().max(20).optional(),
    address: z.string().optional(),
    country: z.string().max(50).optional(),
    website: z.string().max(200).url().optional(),
    payment_terms: z.string().max(100).optional(),
  })
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
const TypeEnum = z.enum(["CL", "SL", "SG", "EW", "AX", "OT", "DV"]);
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
const LoginRequest = z
  .object({ username: z.string().min(1), password: z.string().min(1) })
  .passthrough();
const LoginSuccessResponse = z.object({ msg: z.string() }).passthrough();
const LoginBadRequest = z
  .object({ username: z.array(z.string()), password: z.array(z.string()) })
  .partial()
  .passthrough();
const LoginForbidden = z.object({ detail: z.string() }).passthrough();
const UserRoleEnum = z.enum([
  "ADMIN",
  "BRANCH_MANAGER",
  "TECHNICIAN",
  "SALESPERSON",
  "ACCOUNTANT",
  "INVENTORY_MANAGER",
  "RECEPTIONIST",
  "CRM",
]);
const User = z
  .object({
    id: z.number().int(),
    username: z
      .string()
      .max(150)
      .regex(/^[\w.@+-]+$/),
    email: z.string().max(254).email(),
    first_name: z.string().max(150).optional(),
    last_name: z.string().max(150).optional(),
    is_active: z.boolean().optional(),
    is_staff: z.boolean().optional(),
    is_superuser: z.boolean().optional(),
    role: UserRoleEnum.optional(),
  })
  .passthrough();
const RegisterRequest = z
  .object({
    username: z
      .string()
      .min(1)
      .max(150)
      .regex(/^[\w.@+-]+$/),
    email: z.string().max(254).email().optional(),
    password: z.string().min(1),
  })
  .passthrough();
const RefreshTokenResponse = z
  .object({ msg: z.string(), access: z.string() })
  .passthrough();
const TokenRefreshError = z.object({ error: z.string() }).passthrough();
const UserRequest = z
  .object({
    username: z
      .string()
      .min(1)
      .max(150)
      .regex(/^[\w.@+-]+$/),
    email: z.string().min(1).max(254).email(),
    first_name: z.string().max(150).optional(),
    last_name: z.string().max(150).optional(),
    is_active: z.boolean().optional(),
    is_staff: z.boolean().optional(),
    is_superuser: z.boolean().optional(),
    role: UserRoleEnum.optional(),
  })
  .passthrough();
const PatchedUserRequest = z
  .object({
    username: z
      .string()
      .min(1)
      .max(150)
      .regex(/^[\w.@+-]+$/),
    email: z.string().min(1).max(254).email(),
    first_name: z.string().max(150),
    last_name: z.string().max(150),
    is_active: z.boolean(),
    is_staff: z.boolean(),
    is_superuser: z.boolean(),
    role: UserRoleEnum,
  })
  .partial()
  .passthrough();

export const schemas = {
  CurrencyEnum,
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
  BranchUsersRoleEnum,
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
  Supplier,
  Manufacturer,
  Brand,
  TypeEnum,
  AttributeValue,
  ProductVariantList,
  Product,
  LensCoating,
  ProductImage,
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
  LoginRequest,
  LoginSuccessResponse,
  LoginBadRequest,
  LoginForbidden,
  UserRoleEnum,
  User,
  RegisterRequest,
  RefreshTokenResponse,
  TokenRefreshError,
  UserRequest,
  PatchedUserRequest,
};

const endpoints = makeApi([
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
    path: "/api/hrm/employees/",
    alias: "hrm_employees_list",
    requestFormat: "json",
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
        schema: z.number().int(),
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
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/users/profile/",
    alias: "users_profile_retrieve",
    description: `Get current authenticated user profile data`,
    requestFormat: "json",
    response: User,
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
