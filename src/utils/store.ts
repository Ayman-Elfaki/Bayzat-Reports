import { Dexie, type EntityTable } from "dexie"

type CompanyEntity = {
    id: string
    name: string
    logo?: string
}

type TicketTypeEntity = {
    id: string
    companyId: string
    name: string
    properties: Array<{
        id: string
        name: string
        enabled: boolean
        highlighted: boolean
    }>
}


type AppDbContext = Dexie & { companies: EntityTable<CompanyEntity, "id">, ticketTypes: EntityTable<TicketTypeEntity, "id"> }

class OptionsRepository {

    private db: AppDbContext;

    constructor() {
        this.db = new Dexie("bayzat-reports-database") as AppDbContext
        this.db.version(1).stores({ companies: 'id, name', ticketTypes: '[id+companyId], id, companyId, name' });
    }

    init(companies: CompanyEntity[], ticketTypes: TicketTypeEntity[]) {

        companies.forEach(async company => {
            const companyExist = await this.db.companies.where({ id: company.id }).count() > 0;

            if (!companyExist) {
                await this.db.companies.add(company);
            }
        });

        ticketTypes.forEach(async ticketType => {
            const ticketTypesExist = await this.db.ticketTypes
                .where({ id: ticketType.id, companyId: ticketType.companyId }).count() > 0;

            if (!ticketTypesExist) {
                await this.db.ticketTypes.add(ticketType);
            }
        });
    }

    async getCompany(companyId: string) {
        return await this.db.companies.where({ id: companyId }).first() ?? null;
    }

    async listCompanies() {
        return await this.db.companies.toArray();
    }

    async getTicketType(ticketId: string, companyId: string) {
        return await this.db.ticketTypes.where({ id: ticketId, companyId: companyId }).first() ?? null;
    }

    async setTicketProperties(ticketId: string, companyId: string, ticketProperties: TicketTypeEntity['properties']) {
        await this.db.transaction('rw', this.db.ticketTypes, async () => {
            await this.db.ticketTypes.where({ id: ticketId, companyId: companyId }).modify({
                properties: ticketProperties
            });
        });
    }

    async listTicketTypes(companyId: string) {
        return await this.db.ticketTypes.where({ companyId: companyId }).sortBy('name');
    }

}

export { CompanyEntity, TicketTypeEntity, OptionsRepository };