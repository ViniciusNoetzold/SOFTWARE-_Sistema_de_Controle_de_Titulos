/**
 * Gerador de Payload PIX Padrão EMV® / Banco Central do Brasil (BR Code)
 */

export function calcCRC16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function normalizeEMV(str: string, maxLen: number): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .toUpperCase()
    .slice(0, maxLen);
}

export function cleanChavePix(key: string): string {
  const trimmed = key.trim();
  if (!trimmed) return '';
  
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 11 || digits.length === 14) {
    return digits;
  }
  
  if ((digits.length === 10 || digits.length === 11) && !trimmed.startsWith('+')) {
    return `+55${digits}`;
  }

  if (trimmed.startsWith('+')) {
    return `+${digits}`;
  }

  return trimmed;
}

export interface PixPayloadParams {
  chave: string;
  favorecido: string;
  cidade?: string;
  valor?: number | string;
  txid?: string;
}

export function generatePixBRCode({
  chave,
  favorecido,
  cidade = 'SAO PAULO',
  valor,
  txid = '***'
}: PixPayloadParams): string {
  const chaveFormatada = cleanChavePix(chave);
  if (!chaveFormatada) return '';

  const favorecidoNorm = normalizeEMV(favorecido, 25) || 'MEZZOLD STUDIOS';
  const cidadeNorm = normalizeEMV(cidade, 15) || 'SAO PAULO';

  let valorFormatted = '';
  if (valor) {
    const num = typeof valor === 'number' ? valor : parseFloat(String(valor).replace(',', '.'));
    if (!isNaN(num) && num > 0) {
      valorFormatted = num.toFixed(2);
    }
  }

  // 00 - Payload Format Indicator
  let payload = "000201";

  // 26 - Merchant Account Information (PIX GUI)
  const gui = "br.gov.bcb.pix";
  const sub00 = `00${gui.length.toString().padStart(2, '0')}${gui}`;
  const sub01 = `01${chaveFormatada.length.toString().padStart(2, '0')}${chaveFormatada}`;
  const merchantAccountVal = sub00 + sub01;
  payload += `26${merchantAccountVal.length.toString().padStart(2, '0')}${merchantAccountVal}`;

  // 52 - Merchant Category Code
  payload += "52040000";

  // 53 - Transaction Currency (986 = BRL)
  payload += "5303986";

  // 54 - Transaction Amount
  if (valorFormatted) {
    payload += `54${valorFormatted.length.toString().padStart(2, '0')}${valorFormatted}`;
  }

  // 58 - Country Code
  payload += "5802BR";

  // 59 - Merchant Name
  payload += `59${favorecidoNorm.length.toString().padStart(2, '0')}${favorecidoNorm}`;

  // 60 - Merchant City
  payload += `60${cidadeNorm.length.toString().padStart(2, '0')}${cidadeNorm}`;

  // 62 - Additional Data Field Template (txid)
  const safeTxid = txid.slice(0, 25) || '***';
  const sub05 = `05${safeTxid.length.toString().padStart(2, '0')}${safeTxid}`;
  payload += `62${sub05.length.toString().padStart(2, '0')}${sub05}`;

  // 63 - CRC16 Checksum
  payload += "6304";
  const crc = calcCRC16(payload);
  return payload + crc;
}
