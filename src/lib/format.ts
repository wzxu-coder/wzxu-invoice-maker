import type { SupportedCurrency } from "@/domain/invoice/types";
export const currencyMinor=(currency:SupportedCurrency)=>currency==="JPY"?0:2;
export function money(minor:number,currency:SupportedCurrency){return new Intl.NumberFormat(currency==="MXN"?"es-MX":"en-US",{style:"currency",currency,minimumFractionDigits:currencyMinor(currency),maximumFractionDigits:currencyMinor(currency)}).format(minor/10**currencyMinor(currency))}
