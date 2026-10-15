import { Transaction } from '../types/transaction';

export interface CSVParseResult {
  success: boolean;
  transactions: Transaction[];
  errors: string[];
  warnings: string[];
  rowCount: number;
}

/**
 * Parses and validates CSV transaction data for graph construction.
 * Supports standard CSV formatting with headers: sender, receiver, amount, timestamp, description, type.
 */
export function parseTransactionCSV(csvContent: string): CSVParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const transactions: Transaction[] = [];

  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return {
      success: false,
      transactions: [],
      errors: ['CSV file is empty or missing data rows.'],
      warnings: [],
      rowCount: 0,
    };
  }

  // Parse header
  const headerLine = lines[0];
  const headers = headerLine
    .split(',')
    .map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));

  const senderIdx = headers.findIndex((h) => h === 'sender' || h === 'from' || h === 'source');
  const receiverIdx = headers.findIndex((h) => h === 'receiver' || h === 'to' || h === 'target' || h === 'destination');
  const amountIdx = headers.findIndex((h) => h === 'amount' || h === 'value');
  const timestampIdx = headers.findIndex((h) => h === 'timestamp' || h === 'date' || h === 'time');
  const descIdx = headers.findIndex((h) => h === 'description' || h === 'desc' || h === 'notes');
  const typeIdx = headers.findIndex((h) => h === 'type' || h === 'channel');
  const idIdx = headers.findIndex((h) => h === 'id' || h === 'txid' || h === 'transactionid');

  if (senderIdx === -1 || receiverIdx === -1 || amountIdx === -1) {
    const missing: string[] = [];
    if (senderIdx === -1) missing.push('sender');
    if (receiverIdx === -1) missing.push('receiver');
    if (amountIdx === -1) missing.push('amount');
    return {
      success: false,
      transactions: [],
      errors: [`Required CSV column header(s) missing: ${missing.join(', ')}. Expected: sender,receiver,amount,timestamp`],
      warnings: [],
      rowCount: lines.length - 1,
    };
  }

  for (let i = 1; i < lines.length; i++) {
    const lineNum = i + 1;
    const rawLine = lines[i];

    // Simple CSV row parser (handles optional quotes)
    const values = parseCSVRow(rawLine);

    if (values.length < 3) {
      errors.push(`Row ${lineNum}: Incomplete data row (${values.length} fields found, expected at least 3).`);
      continue;
    }

    const sender = (values[senderIdx] || '').trim().toUpperCase();
    const receiver = (values[receiverIdx] || '').trim().toUpperCase();
    const rawAmount = (values[amountIdx] || '').trim().replace(/[^0-9.-]+/g, '');
    const rawTimestamp = timestampIdx !== -1 && values[timestampIdx] ? values[timestampIdx].trim() : '';
    const description = descIdx !== -1 && values[descIdx] ? values[descIdx].trim() : 'CSV Ingested Transfer';
    const rawType = typeIdx !== -1 && values[typeIdx] ? values[typeIdx].trim().toUpperCase() : 'TRANSFER';
    const txId = idIdx !== -1 && values[idIdx] ? values[idIdx].trim().toUpperCase() : `TX-CSV-${1000 + i}`;

    if (!sender) {
      errors.push(`Row ${lineNum}: Missing sender account ID.`);
      continue;
    }

    if (!receiver) {
      errors.push(`Row ${lineNum}: Missing receiver account ID.`);
      continue;
    }

    if (sender === receiver) {
      warnings.push(`Row ${lineNum}: Sender and receiver accounts are identical (${sender}). Created self-loop edge.`);
    }

    const amount = parseFloat(rawAmount);
    if (isNaN(amount) || amount <= 0) {
      errors.push(`Row ${lineNum}: Invalid transaction amount "${values[amountIdx]}". Must be a positive number.`);
      continue;
    }

    let timestamp = new Date().toISOString();
    if (rawTimestamp) {
      const parsedDate = new Date(rawTimestamp);
      if (isNaN(parsedDate.getTime())) {
        warnings.push(`Row ${lineNum}: Invalid timestamp "${rawTimestamp}". Fallback to current timestamp.`);
      } else {
        timestamp = parsedDate.toISOString();
      }
    }

    const validTypes: Transaction['type'][] = ['TRANSFER', 'WIRE', 'ATM', 'MERCHANT', 'PAYROLL', 'INTERNAL'];
    const type = (validTypes.includes(rawType as Transaction['type']) ? rawType : 'TRANSFER') as Transaction['type'];

    transactions.push({
      id: txId,
      sender,
      receiver,
      amount,
      timestamp,
      description,
      type,
      status: 'COMPLETED',
    });
  }

  const success = errors.length === 0 && transactions.length > 0;

  return {
    success,
    transactions,
    errors,
    warnings,
    rowCount: lines.length - 1,
  };
}

function parseCSVRow(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Generates sample CSV template content with synthetic test records.
 */
export function generateSampleCSVTemplate(): string {
  return `id,sender,receiver,amount,timestamp,description,type
TX8001,ACC-ALPHA,ACC-BETA,185000,2026-09-01T10:00:00Z,Syndicate Layering Leg 1,WIRE
TX8002,ACC-BETA,ACC-GAMMA,182000,2026-09-01T10:30:00Z,Syndicate Layering Leg 2,TRANSFER
TX8003,ACC-GAMMA,ACC-DELTA,180000,2026-09-01T11:00:00Z,Syndicate Layering Leg 3,TRANSFER
TX8004,ACC-DELTA,ACC-ALPHA,178000,2026-09-01T11:45:00Z,Circular Route Return,WIRE
TX8005,CORP-TREASURY,VENDOR-LOGISTICS,45000,2026-09-01T12:00:00Z,Standard Commercial Freight,TRANSFER
TX8006,DISCONNECTED-HUB,DISCONNECTED-VAULT,92000,2026-09-01T13:00:00Z,Isolated Subnet Movement,WIRE`;
}
