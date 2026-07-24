import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

interface FullscreenQrModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientName: string;
    patientPhone: string;
    clinicName?: string;
}

const FullscreenQrModal: React.FC<FullscreenQrModalProps> = ({
    open,
    onOpenChange,
    patientName,
    patientPhone,
    clinicName = 'PasseVite',
}) => {
    const qrData = `PV:${patientPhone}:${patientName}`;

    const handleDownload = () => {
        const svg = document.querySelector('.qr-code-svg') as SVGSVGElement;
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            canvas.width = 800;
            canvas.height = 800;
            ctx?.fillRect(0, 0, 800, 800);
            ctx?.drawImage(img, 0, 0, 800, 800);

            const link = document.createElement('a');
            link.download = `QR-${patientName}-${patientPhone}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            URL.revokeObjectURL(url);
        };

        img.src = url;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 overflow-hidden bg-black/95 border-0">
                <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
                    {/* Close Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 h-12 w-12 text-white hover:bg-white/10 rounded-full"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-6 w-6" />
                    </Button>

                    {/* QR Code */}
                    <div className="bg-white p-8 rounded-3xl shadow-2xl">
                        <QRCodeSVG
                            value={qrData}
                            size={400}
                            level="M"
                            includeMargin={true}
                            className="qr-code-svg"
                        />
                    </div>

                    {/* Patient Info */}
                    <div className="mt-8 text-center text-white">
                        <h2 className="text-3xl font-black italic mb-2">{patientName}</h2>
                        <p className="text-lg text-white/70 flex items-center justify-center gap-2">
                            {patientPhone}
                        </p>
                        <p className="text-sm text-white/50 mt-1">{clinicName}</p>
                    </div>

                    {/* Download Button */}
                    <Button
                        onClick={handleDownload}
                        className="mt-8 h-12 px-8 rounded-xl bg-white text-black hover:bg-white/90 font-bold gap-2"
                    >
                        <Download className="h-5 w-5" />
                        Télécharger le QR Code
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FullscreenQrModal;