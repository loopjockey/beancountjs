import { dir } from "console";

export function* streamBeancountFile(chunks: IterableIterator<string>): IterableIterator<string[]> {
    for (const chunk of chunks) {
        // Split the text into lines
        const lineArray = chunk.split('\n');

        for (let line of lineArray) {
            // Remove comments
            const commentIndex = line.indexOf(';');
            if (commentIndex !== -1) {
                line = line.substring(0, commentIndex);
            }

            // Split the line into components, keeping quoted strings together
            const components = line.match(/(?:[^\s"]+|"[^"]*")+/g);

            if (components && components.length > 0) {
                yield components;
            }
        }
    }
}

export const parseDate = (value: string): [Error | null, Date | null] => {
    const parts = value.split('-');
    const [year, month, day] = parts.map(i => Number(i));
    if (Number.isNaN(year)) return [new Error(`The year value ${parts[0]} is not a number`), null];
    if (Number.isNaN(month)) return [new Error(`The month value ${parts[1]} is not a number`), null];
    if (Number.isNaN(day)) return [new Error(`The day value ${parts[2]} is not a number`), null];
    try {
        const date = new Date(year, month, day);
        if (Number.isNaN(date)) return [new Error(`The date value ${value} is not a valid date`), null];
        return [null, new Date(year, month, day)];
    } catch (err) {
        return [err, null];
    }
}

export const parseNumber = (value: string): [Error | null, number | null] => {
    switch (value) {
        case "ZERO": return [null, 0];
        case "ONE": return [null, 1];
        case "HALF": return [null, 0.5];
        default:
            {
                const result = Number(value.replace(/,/g, ""))
                if (Number.isNaN(result)) return [new Error(`${value} is not a number`), null];
                return [null, result];
            }
    }
}

// YYYY-MM-DD open {{ account_name }} [{{ ConstrainCurrency }}]
export type OpenAccount = { type: 'open', date: Date, account: string, currency?: string };

// YYYY-MM-DD close {{ account_name }}
export type CloseAccount = { type: 'close', date: Date, account: string };

// YYYY-MM-DD commodity {{ currency_name }}
export type Commodity = { type: 'commodity', currency: string };

// YYYY-MM-DD * "Transfer from Savings account"
export type Transaction = { type: 'transaction', txn: '*' | '!', date: Date, payee?: string, comment: string, link?: string };

// YYYY-MM-DD balance {{ account_name }} {{ amount }}
export type Balance = { type: 'balance', date: Date, account: string, amount: number };

// YYYY-MM-DD pad {{ account_name }} {{ account_name_to_pad }}
export type Pad = { type: 'pad', date: Date, account: string, target: string };

// YYYY-MM-DD note {{ account_name }} {{ comment }}
export type Note = { type: 'note', date: Date, account: string, comment: string };

// YYYY-MM-DD {{ account_name }} {{ path/to/document }}
export type Document = { type: 'document', date: Date, account: string, path: string };

// option "title" "Beancount Example Ledger"
export type Option = { type: 'option', key: string, val: string };

// pushtag #berlin-trip-2014
export type PushTag = { type: 'pushtag', tag: string };

// poptag #berlin-trip-2014
export type PopTag = { type: 'poptag', tag: string };

// include {{ path/to/file.beancount }}
export type Include = { type: 'include', path: string };

//[!] Assets:MyBank:Checking -400.00 USD
export type TransactionLineItem = { type: 'lineitem', txn?: '!', account: string, amount?: number, currency?: string };

export type Directive =
    OpenAccount | CloseAccount | Commodity | Option |
    PushTag | PopTag | Transaction | TransactionLineItem |
    Balance | Pad | Note | Document | Include;

export const parseLine = (line: string[]) => {
    const [directive] = line;
    if (directive === undefined || !directive.length) return null;
    if (Number.isInteger(Number(directive[0]))) {
        const [dateErr, date] = parseDate(directive);
        if (dateErr) throw dateErr;
        const [_, innerDirective] = line;
        switch (innerDirective) {
            case "open":
            case "close":
            case "commodity":
            case "*":
            case "!":
            case "balance":
            case "pad":
            case "note":
            case "document":
                return '';
        }
    } else {
        switch (directive) {
            case "option":
            case "pushtag":
            case "poptag":
            case "include":
            case "lineitem":
            case "!":
            default:
                // TODO: Handle line item
                return '';
        }
    }
    
}