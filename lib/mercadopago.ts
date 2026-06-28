import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

function getClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });
}

// Lazy: instâncias criadas só no primeiro uso (não durante o build)
export const preference = new Proxy({} as Preference, {
  get(_: Preference, prop: string | symbol): unknown {
    return Reflect.get(new Preference(getClient()), prop);
  },
});

export const payment = new Proxy({} as Payment, {
  get(_: Payment, prop: string | symbol): unknown {
    return Reflect.get(new Payment(getClient()), prop);
  },
});
