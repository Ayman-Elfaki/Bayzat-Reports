import { CompanyEntity, TicketTypeEntity } from "@/utils/store";
import { fromEventPattern, debounceTime, filter, map, connect, concat, bufferCount, take } from 'rxjs';

type OnUpdatedArgs = Parameters<Parameters<typeof browser.tabs.onUpdated.addListener>[number]>;

type WebNavigationArgs = Parameters<Parameters<typeof browser.webNavigation.onCompleted.addListener>[0]>[0];

export default defineBackground({
  persistent: true,
  main() {

    const optionsRepository = new OptionsRepository();

    fromEventPattern<OnUpdatedArgs>(h => browser.tabs?.onUpdated.addListener(h), h => browser.tabs?.onUpdated.removeListener(h))
      .pipe(map(([tabId, { url }, _]) => ({ tabId, url: url! })))
      .pipe(filter((o) => !!o.url))
      .pipe(connect(value => concat(value.pipe(take(1)), value.pipe(debounceTime(500)))))
      .subscribe(onPageUpdated);

    fromEventPattern<WebNavigationArgs>(h => browser.webNavigation?.onCompleted.addListener(h), h => browser.webNavigation?.onCompleted.removeListener(h))
      .pipe(bufferCount(1))
      .pipe(map(([{ tabId, url }]) => ({ tabId, url })))
      .pipe(filter((o) => !!o.url))
      .pipe(debounceTime(300))
      .subscribe(onPageUpdated);

    onMessage('getCompany', async ({ data: { companyId } }) => {
      return await optionsRepository.getCompany(companyId);
    });

    onMessage('setTicketProperties', async ({ data: { ticketId, companyId, properties } }) => {
      return await optionsRepository.setTicketProperties(ticketId, companyId, properties);
    });

    onMessage('listCompanies', async () => {
      return await optionsRepository.listCompanies();
    });

    onMessage('getTicketType', async ({ data: { ticketId, companyId } }) => {
      return await optionsRepository.getTicketType(ticketId, companyId);
    });

    onMessage('listTicketTypes', async ({ data: { companyId } }) => {
      return await optionsRepository.listTicketTypes(companyId);
    });

    onMessage('generatePdfDocument', async ({ data: { ticketId } }) => {
      await generatePdfDocument({ ticketId });
    });

  },
});


const onPageUpdated = async ({ tabId, url }: { tabId: number, url: string }) => {

  if (!url) return;

  const patterns = [
    new MatchPattern('*://*.bayzat.com/*'),
  ];

  if (patterns.every(u => !u.includes(url))) return;

  await onInitOptions({ tabId });

  await sendMessage('onPageUpdated', { url }, tabId);
}


const onInitOptions = async ({ tabId }: { tabId: number }) => {

  const optionsRepository = new OptionsRepository();

  const userProfile = await sendMessage('getUser', undefined, tabId);

  if (!userProfile) return;

  const storedCompany = await optionsRepository.getCompany(userProfile.companyId);

  if (!storedCompany) {

    const types = await BayzatApi.listTicketTypes(userProfile.companyId, userProfile.token);

    const socialProfile = await BayzatApi.getSocialProfile(userProfile.employeeId, userProfile.companyId, userProfile.token);

    if (!types || !socialProfile) return undefined;

    const companyLogo = await BayzatApi.getCompanyLogo(userProfile.companyId, userProfile.token) ?? undefined;

    const companies: CompanyEntity[] = [{
      id: userProfile.companyId,
      name: socialProfile.company_name,
      logo: companyLogo
    }];

    const ticketTypes: TicketTypeEntity[] = types.map(t => ({
      id: t.id,
      name: t.name,
      companyId: userProfile.companyId,
      properties: Object.entries(t.properties)
        .map(p => ({ id: p[0], name: p[1]?.name ?? '', enabled: true, highlighted: false }))
    }));

    optionsRepository.init(companies, ticketTypes);
  }
}


export const generatePdfDocument = async ({ ticketId }: { ticketId: string }) => {

  const optionsRepository = new OptionsRepository();

  const tabs = (await browser.tabs.query({ active: true, currentWindow: true })).filter(t => t);

  if (tabs.length === 0) return;

  const user = await sendMessage('getUser', undefined, tabs[0].id);

  if (!user) return;

  const ticket = await BayzatApi.getTicket(ticketId, user.companyId, user.token);

  const company = await optionsRepository.getCompany(user.companyId);

  if (!ticket || !company) return;

  const ticketType = await optionsRepository.getTicketType(ticket.ticket_type_id, user.companyId);

  if (!ticketType) return;

  const offscreenUrl = browser.runtime.getURL('/offscreen.html');

  const existing = await browser.offscreen.hasDocument();

  if (existing) return;

  await browser.offscreen.createDocument({ url: offscreenUrl, reasons: ['BLOBS'], justification: 'Create blob URL for download' });

  const link = await sendMessage('getPdfDocumentLink', { ticket, company, ticketType });


  if (link) {
    browser.downloads.download({
      url: link,
      filename: `Bayzats/Ticket-${ticketId}.pdf`,
      saveAs: true
    });
  }

  await browser.offscreen.closeDocument();
}