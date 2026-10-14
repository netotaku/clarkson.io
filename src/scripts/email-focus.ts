function initialiseEmailFocus() {
    const frame = document.querySelector<HTMLIFrameElement>('#frame');
    if (!frame || frame.dataset.focusInitialised === 'true') return;
    frame.dataset.focusInitialised = 'true';
    const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-email-link]')];

    const updateFocus = () => {
        let path: string;
        try { path = frame.contentWindow!.location.pathname.replace(/\/$/, ''); }
        catch { return; } // An external link may have navigated the iframe away.
        const selected = links.find((link) => new URL(link.href).pathname.replace(/\/$/, '') === path);
        if (!selected) return;
        for (const [selector, value] of [
            ['[data-email-campaign]', selected.dataset.campaign],
            ['[data-email-subject]', selected.dataset.subject],
            ['[data-email-segment]', selected.dataset.segment],
            ['[data-email-sent-date]', selected.dataset.sentDate],
        ]) {
            const field = document.querySelector(selector!);
            if (field) field.textContent = value ?? 'Not supplied';
        }
        const newWindow = document.querySelector<HTMLAnchorElement>('[data-email-new-window]');
        if (newWindow) newWindow.href = selected.href;
        links.forEach((link) => {
            const active = link === selected;
            link.classList.toggle('selected', active);
            if (active) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
        });
    };
    frame.addEventListener('load', updateFocus);
    updateFocus();
}

initialiseEmailFocus();
document.addEventListener('astro:page-load', initialiseEmailFocus);
