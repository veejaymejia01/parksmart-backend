import QRCode from 'qrcode';

const generateQR = async (text) => {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1a1a1a',
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (error) {
    console.error('QR Generation Error:', error);
    return '';
  }
};

export default generateQR;

