
export type UserProfile = {
    token: string
    employeeId: string
    companyId: string
}

export type BayzatAuthTokenMap = {
    token: string
    employeeId: string
    userId: string
    companyId: string
    employeeFirstName: string
    employeeLastName: string
    extendedExpiration: boolean
    notificationBadgeCount: number
    isExpired: boolean
}

export interface TicketResponse {
    id: string;
    created_at: number;
    type: string;
    ticket_type_id: string;
    identifier: string;
    approval_status: string;
    approved_or_rejected_at: number;
    data: {
        [key: string]: {
            id: string;
            value: {
                code: string;
                translations: Array<{
                    language: string;
                    value: string;
                }>;
            };
        } | string;
    };
    translated_data: Array<{
        first: string;
        second: string;
    }>;
    translated_data_with_keys: Array<{
        key: string;
        translated_name: string;
        value: string;
        status: string;
    }>;
    employee: {
        id: string;
        first_name: string;
        last_name: string;
        identifier: string;
        username: string;
        work_email: string;
        office_id: string;
        reports_to_first_name: string;
        reports_to_last_name: string;
        line_manager_id: string;
        gender: string;
        country_of_residence: string;
        status: string;
        marital_status: string;
        user_id: string;
        registered: boolean;
        reports_to_name: string;
    };
    line_manager: {
        id: string,
        first_name: string,
        last_name: string,
        identifier: string,
        username: string,
        work_email: string,
        office_id: string,
        reports_to_first_name: string,
        reports_to_last_name: string,
        line_manager_id: string,
        gender: string,
        country_of_residence: string,
        status: string,
        marital_status: string,
        user_id: string,
        registered: boolean,
        reports_to_name: string
    };
    creator: {
        id: string,
        first_name: string,
        last_name: string,
        identifier: string,
        username: string,
        work_email: string,
        office_id: string,
        reports_to_first_name: string,
        reports_to_last_name: string,
        line_manager_id: string,
        gender: string,
        country_of_residence: string,
        status: string,
        marital_status: string,
        user_id: string,
        registered: boolean,
        reports_to_name: string
    }
    approvers: Array<{
        role_id: string,
        role_name: string,
        employee_id: string,
        employee_full_name: string,
        status: string,
        timestamp: number
    }>
    activities: Array<{
        id: any;
        company_id: any;
        activity_type: any;
        author: {
            id: any;
            company_id: any;
            first_name: any;
            last_name: any;
        },
        unread: boolean;
        edited: boolean;
        deleted: boolean;
        created_at: number;
        updated_at: number;
        mentioned_employee_details: Array<any>
    }>
    domain_data: {
        domain_data: Array<any>,
        highlighted_data: Array<any>,
        sections: Array<any>,
        property_level_data: Array<any>
    },
    actions: Array<string>,
    available_actions: Array<{
        id: string
        name: string
        type: string
    }>,
    creator_time_zone_offset: string,
    attachments: Array<{
        id: string;
        name: string;
        source: string | undefined;
        mime_type: string;
        created_at: number;
        updated_at: number;
        deletable: boolean;
    }>,
    can_modify_ticket: boolean,
    priority: string,
    category_name: string,
    category_id: string
}

export interface TicketTypesResponse {
    id: string;
    name: string;
    name_translation: {
        translations: Array<{ language: string; value: string; }>
    };
    description: string;
    description_translation: {
        translations: Array<{ language: string; value: string; }>
    };
    builtin: boolean;
    default_ticket_priority: string;
    properties: {
        [key: string]: {
            type: string;
            name: string;
            name_translation?: {
                translations: Array<{ language: string; value: string; }>
            };
            mandatory?: boolean;
            calculated?: boolean;
            status?: string;
            supplier_type?: string;
            text_validation?: {
                max_length?: number
            };
        } | undefined;
    };
    enrichment_trigger_property_groups: string[][];
    category_name: string;
    category_description: string;
    category_id: string;
    is_attachment_mandatory: boolean;
}

export type SocialProfileResponse = {
    name: string
    day_of_birth: number
    month_of_birth: number
    mobile_number: string
    work_email: string
    company_name: string
    profile_completion: number
    missing_fields: Array<string>
    all_required_fields: Array<string>
    avatar_uploaded: boolean
    avatar_uploaded_at: number
    recruitment_info: {
        created_at: number
    }
    status: string
}