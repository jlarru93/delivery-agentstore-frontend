import { Injectable } from '@angular/core';

declare var html2pdf: any;

@Injectable({
    providedIn: 'root'
})
export class PrintService {

    constructor() { }

    /**
     * Detecta si el dispositivo es móvil
     */
    isMobile(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
            || (window.innerWidth <= 768);
    }

    /**
     * Detecta si es una PWA instalada
     */
    isPWA(): boolean {
        return window.matchMedia('(display-mode: standalone)').matches 
            || (window.navigator as any).standalone === true;
    }

    /**
     * Verifica si Web Share API está disponible
     */
    canShare(): boolean {
        return navigator.share !== undefined && navigator.canShare !== undefined;
    }

    /**
     * Método principal de impresión
     * - Desktop: Abre pestaña con diálogo de impresión
     * - Móvil PWA: Genera PDF y abre menú compartir
     */
    async print(htmlContent: string, styleContent: string, fileName: string = 'comanda'): Promise<void> {
        // Si es móvil O es PWA → Generar PDF y compartir
        if (this.isMobile() || this.isPWA()) {
            await this.printMobile(htmlContent, styleContent, fileName);
        } else {
            // Desktop → Método tradicional
            this.printDesktop(htmlContent, styleContent);
        }
    }

    /**
     * Impresión tradicional (Desktop)
     * Abre nueva pestaña con diálogo de impresión
     */
    private printDesktop(htmlContent: string, styleContent: string): void {
        const printWindow = window.open('', 'PRINT');
        if (!printWindow) {
            console.error('No se pudo abrir ventana de impresión');
            return;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <style>${styleContent}</style>
                </head>
                <body>${htmlContent}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            // Cerrar ventana después de imprimir (opcional)
            // printWindow.close();
        }, 1000);
    }

    /**
     * Impresión móvil (PWA)
     * Genera PDF y abre menú compartir nativo
     */
    private async printMobile(htmlContent: string, styleContent: string, fileName: string): Promise<void> {
        try {
            // Crear contenedor temporal
            const container = document.createElement('div');
            container.innerHTML = `
                <style>${styleContent}</style>
                ${htmlContent}
            `;
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '0';
            container.style.width = '80mm'; // Ancho típico de ticket térmico
            document.body.appendChild(container);

            // Opciones para PDF tipo ticket
            const options = {
                margin: 2,
                filename: `${fileName}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    letterRendering: true
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: [80, 297], // Ancho 80mm (ticket), alto A4
                    orientation: 'portrait'
                }
            };

            // Generar PDF como Blob
            const pdfBlob = await html2pdf()
                .set(options)
                .from(container)
                .outputPdf('blob');

            // Limpiar contenedor temporal
            document.body.removeChild(container);

            // Crear archivo para compartir
            const file = new File([pdfBlob], `${fileName}.pdf`, { type: 'application/pdf' });

            // Verificar si puede compartir archivos
            if (this.canShare() && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `Comanda ${fileName}`,
                    text: 'Imprimir comanda'
                });
            } else {
                // Fallback: Descargar el PDF
                this.downloadPDF(pdfBlob, `${fileName}.pdf`);
            }

        } catch (error) {
            console.error('Error al generar PDF:', error);
            // Fallback: Intentar método tradicional
            this.printDesktop(htmlContent, styleContent);
        }
    }

    /**
     * Descarga el PDF (fallback si no puede compartir)
     */
    private downloadPDF(blob: Blob, fileName: string): void {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Método alternativo: Solo generar y descargar PDF
     */
    async downloadAsPDF(htmlContent: string, styleContent: string, fileName: string = 'comanda'): Promise<void> {
        try {
            const container = document.createElement('div');
            container.innerHTML = `
                <style>${styleContent}</style>
                ${htmlContent}
            `;
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '0';
            container.style.width = '80mm';
            document.body.appendChild(container);

            const options = {
                margin: 2,
                filename: `${fileName}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true 
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: [80, 297],
                    orientation: 'portrait'
                }
            };

            await html2pdf()
                .set(options)
                .from(container)
                .save();

            document.body.removeChild(container);

        } catch (error) {
            console.error('Error al descargar PDF:', error);
        }
    }
}