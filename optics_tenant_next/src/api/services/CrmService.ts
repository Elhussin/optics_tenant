/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Campaign } from '../models/Campaign';
import type { CampaignRequest } from '../models/CampaignRequest';
import type { Complaint } from '../models/Complaint';
import type { ComplaintRequest } from '../models/ComplaintRequest';
import type { Customer } from '../models/Customer';
import type { CustomerGroup } from '../models/CustomerGroup';
import type { CustomerGroupRequest } from '../models/CustomerGroupRequest';
import type { CustomerRequest } from '../models/CustomerRequest';
import type { Document } from '../models/Document';
import type { DocumentRequest } from '../models/DocumentRequest';
import type { Interaction } from '../models/Interaction';
import type { InteractionRequest } from '../models/InteractionRequest';
import type { Opportunity } from '../models/Opportunity';
import type { OpportunityRequest } from '../models/OpportunityRequest';
import type { PatchedCampaignRequest } from '../models/PatchedCampaignRequest';
import type { PatchedComplaintRequest } from '../models/PatchedComplaintRequest';
import type { PatchedCustomerGroupRequest } from '../models/PatchedCustomerGroupRequest';
import type { PatchedCustomerRequest } from '../models/PatchedCustomerRequest';
import type { PatchedDocumentRequest } from '../models/PatchedDocumentRequest';
import type { PatchedInteractionRequest } from '../models/PatchedInteractionRequest';
import type { PatchedOpportunityRequest } from '../models/PatchedOpportunityRequest';
import type { PatchedSubscriptionRequest } from '../models/PatchedSubscriptionRequest';
import type { PatchedTaskRequest } from '../models/PatchedTaskRequest';
import type { Subscription } from '../models/Subscription';
import type { SubscriptionRequest } from '../models/SubscriptionRequest';
import type { Task } from '../models/Task';
import type { TaskRequest } from '../models/TaskRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CrmService {
    /**
     * @returns Campaign
     * @throws ApiError
     */
    public static crmCampaignsList(): CancelablePromise<Array<Campaign>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crm/campaigns/',
        });
    }
    /**
     * @param requestBody
     * @returns Campaign
     * @throws ApiError
     */
    public static crmCampaignsCreate(
        requestBody: CampaignRequest,
    ): CancelablePromise<Campaign> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/crm/campaigns/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this campaign.
     * @returns Campaign
     * @throws ApiError
     */
    public static crmCampaignsRetrieve(
        id: number,
    ): CancelablePromise<Campaign> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crm/campaigns/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this campaign.
     * @param requestBody
     * @returns Campaign
     * @throws ApiError
     */
    public static crmCampaignsUpdate(
        id: number,
        requestBody: CampaignRequest,
    ): CancelablePromise<Campaign> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/crm/campaigns/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this campaign.
     * @param requestBody
     * @returns Campaign
     * @throws ApiError
     */
    public static crmCampaignsPartialUpdate(
        id: number,
        requestBody?: PatchedCampaignRequest,
    ): CancelablePromise<Campaign> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/crm/campaigns/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this campaign.
     * @returns void
     * @throws ApiError
     */
    public static crmCampaignsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/crm/campaigns/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Complaint
     * @throws ApiError
     */
    public static crmComplaintsList(): CancelablePromise<Array<Complaint>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crm/complaints/',
        });
    }
    /**
     * @param requestBody
     * @returns Complaint
     * @throws ApiError
     */
    public static crmComplaintsCreate(
        requestBody: ComplaintRequest,
    ): CancelablePromise<Complaint> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/crm/complaints/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this complaint.
     * @returns Complaint
     * @throws ApiError
     */
    public static crmComplaintsRetrieve(
        id: number,
    ): CancelablePromise<Complaint> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crm/complaints/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this complaint.
     * @param requestBody
     * @returns Complaint
     * @throws ApiError
     */
    public static crmComplaintsUpdate(
        id: number,
        requestBody: ComplaintRequest,
    ): CancelablePromise<Complaint> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/crm/complaints/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this complaint.
     * @param requestBody
     * @returns Complaint
     * @throws ApiError
     */
    public static crmComplaintsPartialUpdate(
        id: number,
        requestBody?: PatchedComplaintRequest,
    ): CancelablePromise<Complaint> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/crm/complaints/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this complaint.
     * @returns void
     * @throws ApiError
     */
    public static crmComplaintsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/crm/complaints/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns CustomerGroup
     * @throws ApiError
     */
    public static crmCustomerGroupsList(): CancelablePromise<Array<CustomerGroup>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crm/customer-groups/',
        });
    }
    /**
     * @param requestBody
     * @returns CustomerGroup
     * @throws ApiError
     */
    public static crmCustomerGroupsCreate(
        requestBody: CustomerGroupRequest,
    ): CancelablePromise<CustomerGroup> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/crm/customer-groups/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this Customer Group.
     * @returns CustomerGroup
     * @throws ApiError
     */
    public static crmCustomerGroupsRetrieve(
        id: number,
    ): CancelablePromise<CustomerGroup> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crm/customer-groups/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this Customer Group.
     * @param requestBody
     * @returns CustomerGroup
     * @throws ApiError
     */
    public static crmCustomerGroupsUpdate(
        id: number,
        requestBody: CustomerGroupRequest,
    ): CancelablePromise<CustomerGroup> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/crm/customer-groups/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this Customer Group.
     * @param requestBody
     * @returns CustomerGroup
     * @throws ApiError
     */
    public static crmCustomerGroupsPartialUpdate(
        id: number,
        requestBody?: PatchedCustomerGroupRequest,
    ): CancelablePromise<CustomerGroup> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/crm/customer-groups/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this Customer Group.
     * @returns void
     * @throws ApiError
     */
    public static crmCustomerGroupsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/crm/customer-groups/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Customer
     * @throws ApiError
     */
    public static crmCustomersList(): CancelablePromise<Array<Customer>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crm/customers/',
        });
    }
    /**
     * @param requestBody
     * @returns Customer
     * @throws ApiError
     */
    public static crmCustomersCreate(
        requestBody: CustomerRequest,
    ): CancelablePromise<Customer> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/crm/customers/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this customer.
     * @returns Customer
     * @throws ApiError
     */
    public static crmCustomersRetrieve(
        id: number,
    ): CancelablePromise<Customer> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crm/customers/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this customer.
     * @param requestBody
     * @returns Customer
     * @throws ApiError
     */
    public static crmCustomersUpdate(
        id: number,
        requestBody: CustomerRequest,
    ): CancelablePromise<Customer> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/crm/customers/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this customer.
     * @param requestBody
     * @returns Customer
     * @throws ApiError
     */
    public static crmCustomersPartialUpdate(
        id: number,
        requestBody?: PatchedCustomerRequest,
    ): CancelablePromise<Customer> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/crm/customers/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this customer.
     * @returns void
     * @throws ApiError
     */
    public static crmCustomersDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/crm/customers/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Document
     * @throws ApiError
     */
    public static crmDocumentsList(): CancelablePromise<Array<Document>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crm/documents/',
        });
    }
    /**
     * @param requestBody
     * @returns Document
     * @throws ApiError
     */
    public static crmDocumentsCreate(
        requestBody: DocumentRequest,
    ): CancelablePromise<Document> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/crm/documents/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this document.
     * @returns Document
     * @throws ApiError
     */
    public static crmDocumentsRetrieve(
        id: number,
    ): CancelablePromise<Document> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crm/documents/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this document.
     * @param requestBody
     * @returns Document
     * @throws ApiError
     */
    public static crmDocumentsUpdate(
        id: number,
        requestBody: DocumentRequest,
    ): CancelablePromise<Document> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/crm/documents/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this document.
     * @param requestBody
     * @returns Document
     * @throws ApiError
     */
    public static crmDocumentsPartialUpdate(
        id: number,
        requestBody?: PatchedDocumentRequest,
    ): CancelablePromise<Document> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/crm/documents/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this document.
     * @returns void
     * @throws ApiError
     */
    public static crmDocumentsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/crm/documents/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Interaction
     * @throws ApiError
     */
    public static crmInteractionsList(): CancelablePromise<Array<Interaction>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crm/interactions/',
        });
    }
    /**
     * @param requestBody
     * @returns Interaction
     * @throws ApiError
     */
    public static crmInteractionsCreate(
        requestBody: InteractionRequest,
    ): CancelablePromise<Interaction> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/crm/interactions/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this interaction.
     * @returns Interaction
     * @throws ApiError
     */
    public static crmInteractionsRetrieve(
        id: number,
    ): CancelablePromise<Interaction> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crm/interactions/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this interaction.
     * @param requestBody
     * @returns Interaction
     * @throws ApiError
     */
    public static crmInteractionsUpdate(
        id: number,
        requestBody: InteractionRequest,
    ): CancelablePromise<Interaction> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/crm/interactions/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this interaction.
     * @param requestBody
     * @returns Interaction
     * @throws ApiError
     */
    public static crmInteractionsPartialUpdate(
        id: number,
        requestBody?: PatchedInteractionRequest,
    ): CancelablePromise<Interaction> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/crm/interactions/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this interaction.
     * @returns void
     * @throws ApiError
     */
    public static crmInteractionsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/crm/interactions/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Opportunity
     * @throws ApiError
     */
    public static crmOpportunitiesList(): CancelablePromise<Array<Opportunity>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crm/opportunities/',
        });
    }
    /**
     * @param requestBody
     * @returns Opportunity
     * @throws ApiError
     */
    public static crmOpportunitiesCreate(
        requestBody: OpportunityRequest,
    ): CancelablePromise<Opportunity> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/crm/opportunities/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this opportunity.
     * @returns Opportunity
     * @throws ApiError
     */
    public static crmOpportunitiesRetrieve(
        id: number,
    ): CancelablePromise<Opportunity> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crm/opportunities/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this opportunity.
     * @param requestBody
     * @returns Opportunity
     * @throws ApiError
     */
    public static crmOpportunitiesUpdate(
        id: number,
        requestBody: OpportunityRequest,
    ): CancelablePromise<Opportunity> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/crm/opportunities/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this opportunity.
     * @param requestBody
     * @returns Opportunity
     * @throws ApiError
     */
    public static crmOpportunitiesPartialUpdate(
        id: number,
        requestBody?: PatchedOpportunityRequest,
    ): CancelablePromise<Opportunity> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/crm/opportunities/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this opportunity.
     * @returns void
     * @throws ApiError
     */
    public static crmOpportunitiesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/crm/opportunities/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Subscription
     * @throws ApiError
     */
    public static crmSubscriptionsList(): CancelablePromise<Array<Subscription>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crm/subscriptions/',
        });
    }
    /**
     * @param requestBody
     * @returns Subscription
     * @throws ApiError
     */
    public static crmSubscriptionsCreate(
        requestBody: SubscriptionRequest,
    ): CancelablePromise<Subscription> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/crm/subscriptions/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this Subscription.
     * @returns Subscription
     * @throws ApiError
     */
    public static crmSubscriptionsRetrieve(
        id: number,
    ): CancelablePromise<Subscription> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crm/subscriptions/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this Subscription.
     * @param requestBody
     * @returns Subscription
     * @throws ApiError
     */
    public static crmSubscriptionsUpdate(
        id: number,
        requestBody: SubscriptionRequest,
    ): CancelablePromise<Subscription> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/crm/subscriptions/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this Subscription.
     * @param requestBody
     * @returns Subscription
     * @throws ApiError
     */
    public static crmSubscriptionsPartialUpdate(
        id: number,
        requestBody?: PatchedSubscriptionRequest,
    ): CancelablePromise<Subscription> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/crm/subscriptions/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this Subscription.
     * @returns void
     * @throws ApiError
     */
    public static crmSubscriptionsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/crm/subscriptions/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Task
     * @throws ApiError
     */
    public static crmTasksList(): CancelablePromise<Array<Task>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crm/tasks/',
        });
    }
    /**
     * @param requestBody
     * @returns Task
     * @throws ApiError
     */
    public static crmTasksCreate(
        requestBody: TaskRequest,
    ): CancelablePromise<Task> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/crm/tasks/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this task.
     * @returns Task
     * @throws ApiError
     */
    public static crmTasksRetrieve(
        id: number,
    ): CancelablePromise<Task> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crm/tasks/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this task.
     * @param requestBody
     * @returns Task
     * @throws ApiError
     */
    public static crmTasksUpdate(
        id: number,
        requestBody: TaskRequest,
    ): CancelablePromise<Task> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/crm/tasks/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this task.
     * @param requestBody
     * @returns Task
     * @throws ApiError
     */
    public static crmTasksPartialUpdate(
        id: number,
        requestBody?: PatchedTaskRequest,
    ): CancelablePromise<Task> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/crm/tasks/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this task.
     * @returns void
     * @throws ApiError
     */
    public static crmTasksDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/crm/tasks/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
