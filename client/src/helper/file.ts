import {toast} from "react-toastify";

const file = {
    /**
     * Cette fonction permet de télécharger un fichier PDF
     * @param pdfBase64 {string} - Le contenu du fichier PDF en base64
     * @param pdfName {string} - Le nom du fichier PDF
     */
    handleDownloadPdf: (pdfBase64: string, pdfName: string) => {
        try {
            const byteCharacters = atob(pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', pdfName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            if (error instanceof Error) {
                toast.error('Erreur lors du téléchargement du PDF : ' + error.message, {
                    position: "bottom-center"
                });
            } else {
                toast.error('Erreur inconnue lors du téléchargement du PDF.', {
                    position: "bottom-center"
                });
            }
        }
    }
}

export default file;