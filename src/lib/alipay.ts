import { AlipaySdk } from "alipay-sdk";

let alipayInstance: AlipaySdk | null = null;

export function getAlipay(): AlipaySdk {
  if (!alipayInstance) {
    alipayInstance = new AlipaySdk({
      appId: process.env.ALIPAY_APP_ID!,
      privateKey: process.env.ALIPAY_PRIVATE_KEY!,
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY!,
    });
  }
  return alipayInstance;
}

export interface AlipayTradePagePayParams {
  outTradeNo: string;
  totalAmount: string;
  subject: string;
  returnUrl: string;
  notifyUrl: string;
}

export async function createAlipayPageUrl(params: AlipayTradePagePayParams): Promise<string> {
  const alipay = getAlipay();

  const result = await alipay.pageExec("alipay.trade.page.pay", {
    bizContent: {
      out_trade_no: params.outTradeNo,
      total_amount: params.totalAmount,
      subject: params.subject,
      product_code: "FAST_INSTANT_TRADE_PAY",
    },
    returnUrl: params.returnUrl,
    notifyUrl: params.notifyUrl,
  });

  return result as unknown as string;
}
