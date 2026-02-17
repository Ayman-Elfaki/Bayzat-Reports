import { Ticket } from "@/components/Ticket";
import { BayzatApi } from "@/services/api";
import ReactPDF from '@react-pdf/renderer';
import { onMessage, sendMessage } from "@/services/messenger";

import { CompanyEntity, TicketTypeEntity } from "@/services/store";

export default defineContentScript({
  matches: ['*://*.bayzat.com/*'],
  async main() {

    onMessage('getUser', async () => {
      return await handleGetUserProfile();
    });

    onMessage('onPageUpdated', async ({ data: { url } }) => {
      await handleCreatePrintButtons({ url });
    });

  }
});


const handleGetUserProfile = async () => {
  const rawUserData = localStorage.getItem('_bayzat_auth_token_map');
  const userDataArray = (JSON.parse(rawUserData ?? "[]") as []).flat();
  const user = userDataArray[1] as BayzatAuthTokenMap;
  if (!user) return null;
  return { token: user.token, companyId: user.companyId, employeeId: user.employeeId } as UserProfile;
}

const handleCreatePrintButtons = async ({ url }: { url: string | URL }) => {

  const patterns = [
    new MatchPattern('*://*.bayzat.com/enterprise/dashboard/employee-tickets/*'),
  ];

  if (patterns.every(u => !u.includes(url))) return;

  const table = await queryForElement('table[data-external-id="table"]');

  if (table.querySelectorAll('button[data-external-id="print"]').length > 0) return;

  const menuButtons = [...table.querySelectorAll('button[data-external-id="menu-icon-button"]')];

  const iconClass = menuButtons[0].querySelector('svg')?.classList.value;

  menuButtons.filter(m => m instanceof HTMLButtonElement).forEach((menuButton, idx) => {

    const ticketId = menuButton.closest('tr')?.querySelectorAll('a[data-external-id="ticket-id"]')?.[0].textContent;
    const printButton = menuButton.cloneNode(true) as HTMLButtonElement;

    if (!ticketId) return;

    printButton.setAttribute('data-ticket-id', ticketId);
    printButton.setAttribute('data-external-id', 'print');

    printButton.innerHTML = `
       <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" class="${iconClass}">
          <path fill="currentColor" d="M17 7.846H7v-3.23h10zm.616 4.27q.425 0 .712-.288t.288-.712t-.288-.713t-.712-.288t-.713.288t-.287.713t.287.712t.713.288M16 19v-4.538H8V19zm1 1H7v-4H3.577v-5.384q0-.85.577-1.425t1.423-.576h12.846q.85 0 1.425.576t.575 1.424V16H17z"/>
        </svg>
    `;

    printButton.addEventListener('click', async () => {

      printButton.setAttribute('disabled', 'true');
      printButton.classList.add('Mui-disabled');

      const user = await handleGetUserProfile();
      if (!user) return;

      const ticket = await BayzatApi.getTicket(ticketId, user.companyId, user.token);
      const company = await sendMessage('getCompany', { companyId: user.companyId });

      if (!ticket || !company) return;

      const ticketType = await sendMessage('getTicketType', { ticketId: ticket.ticket_type_id, companyId: user.companyId });

      if (!ticketType) return;

      await handlePrint({ ticket, company, ticketType })

      printButton.removeAttribute('disabled');
      printButton.classList.remove('Mui-disabled');

    });

    menuButton.parentElement?.prepend(printButton);

  });

}



export const handlePrint = async ({ ticket, company, ticketType }: { ticket: TicketResponse, company: CompanyEntity, ticketType: TicketTypeEntity }) => {

  const pdfDocument = ReactPDF.pdf(Ticket({ ticket, company, ticketType }));

  let blobURL: string | null = null;

  try {

    ticket.attachments.forEach(async attachment => {

      if (attachment.source) {
        const response = await fetch(attachment.source, { method: 'GET' });
        const blob = await response.blob();
        attachment.source = URL.createObjectURL(blob);
      }

    });

    const blob = await pdfDocument.toBlob();
    blobURL = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframe.style.display = 'none';
    iframe.src = blobURL;
    iframe.onload = () => {
      setTimeout(() => {
        iframe.focus();
        iframe.contentWindow?.print();
      }, 1);
    };

  }
  catch (e) {
    window.location.reload();
  }
  finally {

    if (blobURL) URL.revokeObjectURL(blobURL);

    ticket.attachments.forEach(attachment => {
      if (attachment.source) URL.revokeObjectURL(attachment.source);
    });

  }

}

