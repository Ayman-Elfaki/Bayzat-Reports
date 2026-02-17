import { CompanyEntity, TicketTypeEntity } from "@/services/store";
import { defineExtensionMessaging } from "@webext-core/messaging";

interface BackgrondProtocolMap {

    getUser(): UserProfile | null

    getCompany(data: { companyId: string }): CompanyEntity | null
    listCompanies(): Array<CompanyEntity>

    getTicketType(data: { ticketId: string, companyId: string }): TicketTypeEntity | null
    setTicketProperties(data: { ticketId: string, companyId: string, properties: TicketTypeEntity['properties'] }): void
    listTicketTypes(data: { companyId: string }): Array<TicketTypeEntity>

    onPageUpdated(data: { url: string | URL }): void
}

export const { sendMessage, onMessage } = defineExtensionMessaging<BackgrondProtocolMap>();
