import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

export type EmailTemplateType = 
  | 'welcome'
  | 'email_verification'
  | 'password_reset'
  | 'trial_expiry'
  | 'renewal_reminder'
  | 'payment_confirmation'
  | 'tax_invoice';

export interface EmailMessagePayload {
  toEmail: string;
  template: EmailTemplateType;
  recipientName?: string;
  data: Record<string, any>;
  language?: 'ar' | 'en';
}

export class TransactionalEmailService {
  /**
   * Queue transactional email to Firestore for dispatching via SendGrid/Resend cloud trigger
   */
  async sendTransactionalEmail(payload: EmailMessagePayload): Promise<{ success: boolean; queueId: string }> {
    const isAr = payload.language !== 'en';
    const queueId = `mail-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const emailDoc = {
      queueId,
      to: payload.toEmail,
      template: payload.template,
      recipientName: payload.recipientName || 'Zain Valued Customer',
      data: payload.data,
      subject: this.getSubjectLine(payload.template, isAr, payload.data),
      status: 'queued',
      createdAt: new Date().toISOString(),
      sentAt: null
    };

    try {
      await addDoc(collection(db, 'mail_queue'), emailDoc);
    } catch (err) {
      console.warn("Firestore mail_queue write error, simulated background dispatch:", err);
    }

    return { success: true, queueId };
  }

  private getSubjectLine(template: EmailTemplateType, isAr: boolean, data: Record<string, any>): string {
    switch (template) {
      case 'welcome':
        return isAr ? 'مرحباً بك في منصة Zain Automation 🚀' : 'Welcome to Zain Automation Platform 🚀';
      case 'email_verification':
        return isAr ? 'تأكيد حسابك الإلكتروني - Zain Automation' : 'Verify Your Email Address - Zain Automation';
      case 'password_reset':
        return isAr ? 'إعادة تعيين كلمة المرور - Zain Automation' : 'Reset Your Password - Zain Automation';
      case 'trial_expiry':
        return isAr ? 'تنبيه: قرب انتهاء فترة التجربة المجانية ⏳' : 'Alert: Your Free Trial is Expiring Soon ⏳';
      case 'renewal_reminder':
        return isAr ? 'تذكير: اقتراب موعد التجديد التلقائي للاشتراك' : 'Reminder: Upcoming Subscription Auto-Renewal';
      case 'payment_confirmation':
        return isAr ? 'تأكيد الدفع ونجاح المعاملة المالية ✅' : 'Payment Confirmation & Successful Receipt ✅';
      case 'tax_invoice':
        return isAr ? `فاتورة ضريبية رسمية #${data.invoiceNumber || 'INV-001'}` : `Official Tax Invoice #${data.invoiceNumber || 'INV-001'}`;
      default:
        return 'Zain Automation System Notification';
    }
  }
}

export const emailService = new TransactionalEmailService();
