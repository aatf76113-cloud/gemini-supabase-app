import { db } from './firebase';
import { collection, doc, setDoc, getDocs, addDoc } from 'firebase/firestore';

export type PaymentGateway = 'stripe' | 'paypal' | 'fawry' | 'paymob' | 'apple_pay' | 'google_pay';

export interface CouponCode {
  id: string;
  code: string;
  discountPercent: number; // e.g. 20 for 20% off
  validUntil: string;
  maxUses: number;
  currentUses: number;
  status: 'active' | 'expired' | 'disabled';
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  workspaceId: string;
  customerEmail: string;
  planName: string;
  amountUsd: number;
  gatewayUsed: PaymentGateway;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  pdfUrl?: string;
  createdAt: string;
}

export class BillingService {
  private LOCAL_COUPONS_KEY = 'zain_coupons_v1';
  private LOCAL_INVOICES_KEY = 'zain_invoices_v1';

  /**
   * Get all active coupon codes
   */
  async getCoupons(): Promise<CouponCode[]> {
    try {
      const snap = await getDocs(collection(db, 'coupons'));
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as CouponCode);
      }
    } catch (e) {
      console.warn("Firestore coupon read error, using fallback coupons:", e);
    }

    // Default system coupons
    return [
      { id: 'c-zain20', code: 'ZAIN20', discountPercent: 20, validUntil: '2026-12-31', maxUses: 1000, currentUses: 45, status: 'active' },
      { id: 'c-launch50', code: 'LAUNCH50', discountPercent: 50, validUntil: '2026-09-01', maxUses: 500, currentUses: 120, status: 'active' },
      { id: 'c-egypt30', code: 'EGYPT30', discountPercent: 30, validUntil: '2026-12-31', maxUses: 2000, currentUses: 310, status: 'active' }
    ];
  }

  /**
   * Validate a coupon code
   */
  async validateCoupon(code: string): Promise<{ valid: boolean; discountPercent: number; message: string }> {
    const coupons = await this.getCoupons();
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find(c => c.code === cleanCode && c.status === 'active');

    if (!found) {
      return { valid: false, discountPercent: 0, message: 'كود الخصم غير صحيح أو منتهي الصلاحية | Invalid or expired coupon code' };
    }

    return {
      valid: true,
      discountPercent: found.discountPercent,
      message: `تم تفعيل كود الخصم! خصم ${found.discountPercent}% | Coupon applied! ${found.discountPercent}% OFF`
    };
  }

  /**
   * Create a new coupon code (Admin feature)
   */
  async createCoupon(code: string, discountPercent: number, maxUses: number = 500): Promise<CouponCode> {
    const newCoupon: CouponCode = {
      id: `c-${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountPercent,
      validUntil: '2027-12-31',
      maxUses,
      currentUses: 0,
      status: 'active'
    };

    try {
      await setDoc(doc(db, 'coupons', newCoupon.id), newCoupon);
    } catch (e) {
      console.warn("Firestore error creating coupon:", e);
    }

    return newCoupon;
  }

  /**
   * Process Checkout Payment simulation across any of the 6 supported gateways
   */
  async processCheckoutPayment(payload: {
    workspaceId: string;
    customerEmail: string;
    planName: string;
    amountUsd: number;
    gateway: PaymentGateway;
    couponCode?: string;
  }): Promise<{ success: boolean; invoice: BillingInvoice; referenceNumber: string }> {
    let finalAmount = payload.amountUsd;

    if (payload.couponCode) {
      const check = await this.validateCoupon(payload.couponCode);
      if (check.valid) {
        finalAmount = Number((finalAmount * (1 - check.discountPercent / 100)).toFixed(2));
      }
    }

    const referenceNumber = `${payload.gateway.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const invoice: BillingInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      workspaceId: payload.workspaceId,
      customerEmail: payload.customerEmail,
      planName: payload.planName,
      amountUsd: finalAmount,
      gatewayUsed: payload.gateway,
      status: 'paid',
      pdfUrl: `https://zainauto.io/invoices/${invoiceNumber}.pdf`,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'invoices'), invoice);
    } catch (e) {
      console.warn("Firestore error saving invoice:", e);
    }

    return {
      success: true,
      invoice,
      referenceNumber
    };
  }

  /**
   * Get invoice history for a workspace
   */
  async getWorkspaceInvoices(workspaceId: string): Promise<BillingInvoice[]> {
    try {
      const snap = await getDocs(collection(db, 'invoices'));
      if (!snap.empty) {
        return snap.docs
          .map(d => d.data() as BillingInvoice)
          .filter(inv => inv.workspaceId === workspaceId || workspaceId === 'ws-primary');
      }
    } catch (e) {
      console.warn("Firestore read error for invoices:", e);
    }

    // Default sample invoices
    return [
      {
        id: 'inv-101',
        invoiceNumber: 'INV-2026-8801',
        workspaceId,
        customerEmail: 'ahmed@zainauto.io',
        planName: 'Pro Plan (Monthly)',
        amountUsd: 79.00,
        gatewayUsed: 'stripe',
        status: 'paid',
        pdfUrl: 'https://zainauto.io/invoices/INV-2026-8801.pdf',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
      },
      {
        id: 'inv-102',
        invoiceNumber: 'INV-2026-8802',
        workspaceId,
        customerEmail: 'ahmed@zainauto.io',
        planName: 'Pro Plan (Monthly)',
        amountUsd: 79.00,
        gatewayUsed: 'fawry',
        status: 'paid',
        pdfUrl: 'https://zainauto.io/invoices/INV-2026-8802.pdf',
        createdAt: new Date().toISOString()
      }
    ];
  }
}

export const billingService = new BillingService();
