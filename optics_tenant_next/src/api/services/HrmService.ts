/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Attendance } from '../models/Attendance';
import type { AttendanceRequest } from '../models/AttendanceRequest';
import type { Employee } from '../models/Employee';
import type { EmployeeRequest } from '../models/EmployeeRequest';
import type { Leave } from '../models/Leave';
import type { LeaveRequest } from '../models/LeaveRequest';
import type { Notification } from '../models/Notification';
import type { NotificationRequest } from '../models/NotificationRequest';
import type { PatchedAttendanceRequest } from '../models/PatchedAttendanceRequest';
import type { PatchedEmployeeRequest } from '../models/PatchedEmployeeRequest';
import type { PatchedLeaveRequest } from '../models/PatchedLeaveRequest';
import type { PatchedNotificationRequest } from '../models/PatchedNotificationRequest';
import type { PatchedPayrollRequest } from '../models/PatchedPayrollRequest';
import type { PatchedPerformanceReviewRequest } from '../models/PatchedPerformanceReviewRequest';
import type { PatchedTaskRequest } from '../models/PatchedTaskRequest';
import type { Payroll } from '../models/Payroll';
import type { PayrollRequest } from '../models/PayrollRequest';
import type { PerformanceReview } from '../models/PerformanceReview';
import type { PerformanceReviewRequest } from '../models/PerformanceReviewRequest';
import type { Task } from '../models/Task';
import type { TaskRequest } from '../models/TaskRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HrmService {
    /**
     * @returns Attendance
     * @throws ApiError
     */
    public static hrmAttendancesList(): CancelablePromise<Array<Attendance>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/hrm/attendances/',
        });
    }
    /**
     * @param requestBody
     * @returns Attendance
     * @throws ApiError
     */
    public static hrmAttendancesCreate(
        requestBody: AttendanceRequest,
    ): CancelablePromise<Attendance> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/hrm/attendances/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this attendance.
     * @returns Attendance
     * @throws ApiError
     */
    public static hrmAttendancesRetrieve(
        id: number,
    ): CancelablePromise<Attendance> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/hrm/attendances/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this attendance.
     * @param requestBody
     * @returns Attendance
     * @throws ApiError
     */
    public static hrmAttendancesUpdate(
        id: number,
        requestBody: AttendanceRequest,
    ): CancelablePromise<Attendance> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/hrm/attendances/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this attendance.
     * @param requestBody
     * @returns Attendance
     * @throws ApiError
     */
    public static hrmAttendancesPartialUpdate(
        id: number,
        requestBody?: PatchedAttendanceRequest,
    ): CancelablePromise<Attendance> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/hrm/attendances/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this attendance.
     * @returns void
     * @throws ApiError
     */
    public static hrmAttendancesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/hrm/attendances/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Employee
     * @throws ApiError
     */
    public static hrmEmployeesList(): CancelablePromise<Array<Employee>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/hrm/employees/',
        });
    }
    /**
     * @param requestBody
     * @returns Employee
     * @throws ApiError
     */
    public static hrmEmployeesCreate(
        requestBody: EmployeeRequest,
    ): CancelablePromise<Employee> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/hrm/employees/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this employee.
     * @returns Employee
     * @throws ApiError
     */
    public static hrmEmployeesRetrieve(
        id: number,
    ): CancelablePromise<Employee> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/hrm/employees/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this employee.
     * @param requestBody
     * @returns Employee
     * @throws ApiError
     */
    public static hrmEmployeesUpdate(
        id: number,
        requestBody: EmployeeRequest,
    ): CancelablePromise<Employee> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/hrm/employees/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this employee.
     * @param requestBody
     * @returns Employee
     * @throws ApiError
     */
    public static hrmEmployeesPartialUpdate(
        id: number,
        requestBody?: PatchedEmployeeRequest,
    ): CancelablePromise<Employee> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/hrm/employees/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this employee.
     * @returns void
     * @throws ApiError
     */
    public static hrmEmployeesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/hrm/employees/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Leave
     * @throws ApiError
     */
    public static hrmLeavesList(): CancelablePromise<Array<Leave>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/hrm/leaves/',
        });
    }
    /**
     * @param requestBody
     * @returns Leave
     * @throws ApiError
     */
    public static hrmLeavesCreate(
        requestBody: LeaveRequest,
    ): CancelablePromise<Leave> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/hrm/leaves/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this leave.
     * @returns Leave
     * @throws ApiError
     */
    public static hrmLeavesRetrieve(
        id: number,
    ): CancelablePromise<Leave> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/hrm/leaves/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this leave.
     * @param requestBody
     * @returns Leave
     * @throws ApiError
     */
    public static hrmLeavesUpdate(
        id: number,
        requestBody: LeaveRequest,
    ): CancelablePromise<Leave> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/hrm/leaves/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this leave.
     * @param requestBody
     * @returns Leave
     * @throws ApiError
     */
    public static hrmLeavesPartialUpdate(
        id: number,
        requestBody?: PatchedLeaveRequest,
    ): CancelablePromise<Leave> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/hrm/leaves/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this leave.
     * @returns void
     * @throws ApiError
     */
    public static hrmLeavesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/hrm/leaves/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Notification
     * @throws ApiError
     */
    public static hrmNotificationsList(): CancelablePromise<Array<Notification>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/hrm/notifications/',
        });
    }
    /**
     * @param requestBody
     * @returns Notification
     * @throws ApiError
     */
    public static hrmNotificationsCreate(
        requestBody: NotificationRequest,
    ): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/hrm/notifications/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this notification.
     * @returns Notification
     * @throws ApiError
     */
    public static hrmNotificationsRetrieve(
        id: number,
    ): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/hrm/notifications/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this notification.
     * @param requestBody
     * @returns Notification
     * @throws ApiError
     */
    public static hrmNotificationsUpdate(
        id: number,
        requestBody: NotificationRequest,
    ): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/hrm/notifications/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this notification.
     * @param requestBody
     * @returns Notification
     * @throws ApiError
     */
    public static hrmNotificationsPartialUpdate(
        id: number,
        requestBody?: PatchedNotificationRequest,
    ): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/hrm/notifications/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this notification.
     * @returns void
     * @throws ApiError
     */
    public static hrmNotificationsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/hrm/notifications/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Payroll
     * @throws ApiError
     */
    public static hrmPayrollsList(): CancelablePromise<Array<Payroll>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/hrm/payrolls/',
        });
    }
    /**
     * @param requestBody
     * @returns Payroll
     * @throws ApiError
     */
    public static hrmPayrollsCreate(
        requestBody: PayrollRequest,
    ): CancelablePromise<Payroll> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/hrm/payrolls/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this payroll.
     * @returns Payroll
     * @throws ApiError
     */
    public static hrmPayrollsRetrieve(
        id: number,
    ): CancelablePromise<Payroll> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/hrm/payrolls/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this payroll.
     * @param requestBody
     * @returns Payroll
     * @throws ApiError
     */
    public static hrmPayrollsUpdate(
        id: number,
        requestBody: PayrollRequest,
    ): CancelablePromise<Payroll> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/hrm/payrolls/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this payroll.
     * @param requestBody
     * @returns Payroll
     * @throws ApiError
     */
    public static hrmPayrollsPartialUpdate(
        id: number,
        requestBody?: PatchedPayrollRequest,
    ): CancelablePromise<Payroll> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/hrm/payrolls/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this payroll.
     * @returns void
     * @throws ApiError
     */
    public static hrmPayrollsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/hrm/payrolls/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns PerformanceReview
     * @throws ApiError
     */
    public static hrmPerformanceReviewsList(): CancelablePromise<Array<PerformanceReview>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/hrm/performance-reviews/',
        });
    }
    /**
     * @param requestBody
     * @returns PerformanceReview
     * @throws ApiError
     */
    public static hrmPerformanceReviewsCreate(
        requestBody: PerformanceReviewRequest,
    ): CancelablePromise<PerformanceReview> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/hrm/performance-reviews/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this performance review.
     * @returns PerformanceReview
     * @throws ApiError
     */
    public static hrmPerformanceReviewsRetrieve(
        id: number,
    ): CancelablePromise<PerformanceReview> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/hrm/performance-reviews/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this performance review.
     * @param requestBody
     * @returns PerformanceReview
     * @throws ApiError
     */
    public static hrmPerformanceReviewsUpdate(
        id: number,
        requestBody: PerformanceReviewRequest,
    ): CancelablePromise<PerformanceReview> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/hrm/performance-reviews/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this performance review.
     * @param requestBody
     * @returns PerformanceReview
     * @throws ApiError
     */
    public static hrmPerformanceReviewsPartialUpdate(
        id: number,
        requestBody?: PatchedPerformanceReviewRequest,
    ): CancelablePromise<PerformanceReview> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/hrm/performance-reviews/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this performance review.
     * @returns void
     * @throws ApiError
     */
    public static hrmPerformanceReviewsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/hrm/performance-reviews/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Task
     * @throws ApiError
     */
    public static hrmTasksList(): CancelablePromise<Array<Task>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/hrm/tasks/',
        });
    }
    /**
     * @param requestBody
     * @returns Task
     * @throws ApiError
     */
    public static hrmTasksCreate(
        requestBody: TaskRequest,
    ): CancelablePromise<Task> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/hrm/tasks/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this task.
     * @returns Task
     * @throws ApiError
     */
    public static hrmTasksRetrieve(
        id: number,
    ): CancelablePromise<Task> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/hrm/tasks/{id}/',
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
    public static hrmTasksUpdate(
        id: number,
        requestBody: TaskRequest,
    ): CancelablePromise<Task> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/hrm/tasks/{id}/',
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
    public static hrmTasksPartialUpdate(
        id: number,
        requestBody?: PatchedTaskRequest,
    ): CancelablePromise<Task> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/hrm/tasks/{id}/',
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
    public static hrmTasksDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/hrm/tasks/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
