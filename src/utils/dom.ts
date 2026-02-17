export const domElementObserver = (selector: keyof HTMLElementTagNameMap | string, onElementObserved: (e: HTMLElement[]) => void) => {

    let elements: Array<HTMLElement> = [];

    const observer = new MutationObserver((mutationsList, _) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {

                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE && node instanceof HTMLElement && node.matches(selector)) {
                        elements.push(node);
                    }
                });

                if (elements.length > 0) {
                    onElementObserved(elements);
                    elements = [];
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}


export function queryForElement(selector: string) {
    return new Promise<HTMLElement>(resolve => {

        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector) as HTMLElement);
        }

        const observer = new MutationObserver(_ => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector) as HTMLElement);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}