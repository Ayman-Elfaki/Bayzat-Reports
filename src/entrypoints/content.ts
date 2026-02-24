
export default defineContentScript({
  matches: ['*://*.bayzat.com/*'],
  async main() {

    onMessage('getUser', async () => {
      return await handleGetUserProfile();
    });

    onMessage('onPageUpdated', async ({ data: { url } }) => {
      await handleUpdateDomDownloadButtons({ url });
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

const handleUpdateDomDownloadButtons = async ({ url }: { url: string | URL }) => {

  const table = await queryForElement('table[data-external-id="table"]');

  if (table.querySelectorAll('button[data-external-id="print"]').length > 0) return;

  const menuButtons = [...table.querySelectorAll('button[data-external-id="menu-icon-button"]')];

  const iconClass = menuButtons[0].querySelector('svg')?.classList.value;

  menuButtons.filter(m => m instanceof HTMLButtonElement).forEach((menuButton) => {

    const ticketId = menuButton.closest('tr')?.querySelectorAll('a[data-external-id="ticket-id"]')?.[0].textContent;
    const downloadButton = menuButton.cloneNode(true) as HTMLButtonElement;

    if (!ticketId) return;

    downloadButton.setAttribute('data-ticket-id', ticketId);
    downloadButton.setAttribute('data-external-id', 'print');

    downloadButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg"  width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="${iconClass}">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    `;

    downloadButton.addEventListener('click', async () => {

      downloadButton.setAttribute('disabled', 'true');
      downloadButton.classList.add('Mui-disabled');

      await sendMessage('generatePdfDocument', { ticketId });

      downloadButton.removeAttribute('disabled');
      downloadButton.classList.remove('Mui-disabled');

    });

    menuButton.parentElement?.prepend(downloadButton);

  });

}