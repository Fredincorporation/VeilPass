import QRCode from 'qrcode.react';
import { createRoot } from 'react-dom/client';
import { captureException } from './logger';

export async function downloadTicketAsPrintable(ticket: any, eventName: string, showInfo: (s:string)=>void, showSuccess: (s:string)=>void) {
  try {
    const encryptedPayload = 'placeholder';

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(
      // @ts-ignore - QRCode typing in DOM render
      <QRCode value={encryptedPayload} size={400} level="H" includeMargin={true} />
    );

    const dataUrl: string = await new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        const canvas = container.querySelector('canvas') as HTMLCanvasElement | null;
        if (canvas) {
          try {
            const d = canvas.toDataURL('image/png');
            resolve(d);
          } catch (e) {
            reject(e);
          }
          return;
        }
        if (Date.now() - start > 1000) {
          reject(new Error('Timed out generating QR canvas'));
          return;
        }
        requestAnimationFrame(check);
      };
      check();
    });

    try { root.unmount(); } catch (e) {}
    if (container.parentNode) container.parentNode.removeChild(container);

    const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body><img src="${dataUrl}"/></body></html>`;
    const w = window.open('', '_blank');
    if (!w) {
      showInfo('Popup blocked. Please allow popups for this site to download tickets.');
      return;
    }
    w.document.write(html);
    w.document.close();
    setTimeout(() => { try { w.focus(); w.print(); } catch (e) {} }, 600);
    showSuccess('Opened printable ticket — use Print → Save as PDF (or print) to download.');
  } catch (err) {
    captureException(err);
    showInfo('Failed to open ticket for printing.');
  }
}
