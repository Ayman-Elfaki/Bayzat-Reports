import { OptionsRepository, CompanyEntity, TicketTypeEntity } from "@/services/store";
import { onMessage, sendMessage } from "@/services/messenger";
import { fromEventPattern, debounceTime, filter, map, connect, concat, bufferCount, take } from 'rxjs';
import { BayzatApi } from "@/services/api";

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
      .pipe(connect(value => concat(value.pipe(take(1)), value.pipe(debounceTime(500)))))
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