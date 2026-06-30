import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

function getClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });
}

// Lazy singletons: instâncias criadas apenas no primeiro uso (não durante o build)
let _preference: Preference | undefined;
let _payment: Payment | undefined;

export function getPreference(): Preference {
  return _preference ??= new Preference(getClient());
}

export function getPayment(): Payment {
  return _payment ??= new Payment(getClient());
}

// Re-exporta como objetos para compatibilidade com os imports existentes
export const preference = {
  create: (...args: Parameters<Preference['create']>) => getPreference().create(...args),
} as Pick<Preference, 'create'>;

export const payment = {
  get: (...args: Parameters<Payment['get']>) => getPayment().get(...args),
} as Pick<Payment, 'get'>;
