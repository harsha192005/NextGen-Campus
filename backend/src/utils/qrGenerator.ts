import QRCode from 'qrcode';

export const generateQrCode = async (payload: unknown) => {
  return QRCode.toDataURL(JSON.stringify(payload));
};
