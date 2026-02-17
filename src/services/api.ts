import { TicketTypesResponse, TicketResponse, SocialProfileResponse } from "@/utils/types";

const API_BASE_URL = 'https://api.bayzat.com';

const API_COMPANY_BASE_URL = `${API_BASE_URL}/companies`;

const API_TICKET_BASE_URL = `${API_BASE_URL}/employee-ticket/companies`;

export const BayzatApi = {
    getSocialProfile: async (employeeId: string, companyId: string, token: string) => {
        const profileUrl = `${API_COMPANY_BASE_URL}/${companyId}/employees/${employeeId}/social-profile`;
        const profileResponse = await fetch(profileUrl, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } });
        if (profileResponse.ok) {
            const ticket = await profileResponse.json() as { payload: { data: SocialProfileResponse } };
            return ticket.payload.data;
        }
        return null;
    },
    getCompanyLogo: async (companyId: string, token: string) => {
        const companyLogoUrl = `${API_COMPANY_BASE_URL}/${companyId}/company-logo-url?filters%5Bresolution%5D=High`;
        const response = await fetch(companyLogoUrl, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } });
        if (response.ok) {
            const logoUrl = await response.text();
            const logoRes = await fetch(logoUrl);
            if (logoRes.ok) {
                const logo = await logoRes.blob();
                return await blobToBase64(logo);
            }
        }
        return null;
    },
    getTicket: async (ticketId: string, companyId: string, token: string) => {
        const ticketUrl = `${API_TICKET_BASE_URL}/${companyId}/tickets/identifier/${ticketId}?viewerTimeZoneOffset=%2B03%3A00`;
        const ticketResponse = await fetch(ticketUrl, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } });
        if (ticketResponse.ok) {
            const ticket = await ticketResponse.json() as { payload: { data: TicketResponse } };
            ticket.payload.data.attachments.forEach(attachment => {
                attachment.source =
                    `${API_TICKET_BASE_URL}/${companyId}/tickets/${ticket.payload.data.id}/attachments/${attachment.id}/download?_t=${token}`;
            });
            return ticket.payload.data;
        }
        return null;
    },
    listTicketTypes: async (companyId: string, token: string) => {
        const ticketsTypesUrl = `${API_TICKET_BASE_URL}/${companyId}/ticket-types`;
        const ticketTypesResponse = await fetch(ticketsTypesUrl, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } });
        if (ticketTypesResponse.ok) {
            const ticketTypes = await ticketTypesResponse.json() as { payload: { data: Array<TicketTypesResponse> } };
            return ticketTypes.payload.data;
        }
        return [];
    }
}