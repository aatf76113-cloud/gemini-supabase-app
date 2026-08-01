import React, { useState } from 'react';
import { Language } from '../types';
import { 
  Check, 
  Sparkles, 
  Zap, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  X, 
  ArrowRight,
  Receipt,
  Globe,
  Lock,
  Star,
  Wallet,
  Smartphone
} from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

interface PricingViewProps {
  language: Language;
  onSelectPlan?: (planId: string) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ language, onSelectPlan }) => {
  const isAr = language === 'ar';
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlanModal, setSelectedPlanModal] = useState<any | null>(null);
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'fawry' | 'paymob'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentRefCode, setPaymentRefCode] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      nameAr: 'المجانية (Free)',
      priceMonthly: 0,
      priceAnnual: 0,
      badge: null,
      description: isAr ? 'للمطورين والتجربة الفردية السريعة' : 'For developers & individual testing',
      features: isAr ? [
        '1,000 عملية تشغيل شهرياً',
        '100 رصيد ذكاء اصطناعي (AI Credits)',
        'مساحة عمل واحدة (1 Workspace)',
        'عضوان في الفريق (2 Team Members)',
        'دعم عبر البريد الإلكتروني',
        'معدل طلبات 10 req/min'
      ] : [
        '1,000 Monthly Executions',
        '100 AI Credits',
        '1 Workspace',
        '2 Team Members',
        'Email Support',
        'Rate Limit: 10 req/min'
      ],
      highlight: false
    },
    {
      id: 'starter',
      name: 'Starter',
      nameAr: 'المبتدئ (Starter)',
      priceMonthly: 29,
      priceAnnual: 24,
      badge: null,
      description: isAr ? 'للفرق الصغيرة والشركات الناشئة' : 'For small teams & growing startups',
      features: isAr ? [
        '10,000 عملية تشغيل شهرياً',
        '1,000 رصيد ذكاء اصطناعي (AI Credits)',
        '3 مساحات عمل (3 Workspaces)',
        '5 أعضاء فريق (5 Team Members)',
        'دعم أولوية 24/7',
        'تكاملات Webhooks و API',
        'معدل طلبات 60 req/min'
      ] : [
        '10,000 Monthly Executions',
        '1,000 AI Credits',
        '3 Workspaces',
        '5 Team Members',
        '24/7 Priority Support',
        'Webhooks & REST API Access',
        'Rate Limit: 60 req/min'
      ],
      highlight: false
    },
    {
      id: 'pro',
      name: 'Pro',
      nameAr: 'المحترف (Pro)',
      priceMonthly: 79,
      priceAnnual: 69,
      badge: isAr ? 'الأكثر شعبية' : 'Most Popular',
      description: isAr ? 'للفرق المتوسطة وأقسام الأتمتة المتقدمة' : 'For mid-size power teams',
      features: isAr ? [
        '50,000 عملية تشغيل شهرياً',
        '5,000 رصيد ذكاء اصطناعي (AI Credits)',
        '10 مساحات عمل (10 Workspaces)',
        '20 عضو فريق (20 Team Members)',
        'محرك طابور متوازي (Async Queue)',
        'سجل تدقيق كامل (Audit Logs)',
        'خزنة مفاتيح AES-256',
        'معدل طلبات 300 req/min'
      ] : [
        '50,000 Monthly Executions',
        '5,000 AI Credits',
        '10 Workspaces',
        '20 Team Members',
        'Parallel Execution Engine',
        'Full Audit Logs',
        'AES-256 Vault Keys',
        'Rate Limit: 300 req/min'
      ],
      highlight: true
    },
    {
      id: 'business',
      name: 'Business',
      nameAr: 'الأعمال (Business)',
      priceMonthly: 199,
      priceAnnual: 169,
      badge: null,
      description: isAr ? 'للشركات الكبرى والنمو السريع' : 'For scaling businesses & heavy workloads',
      features: isAr ? [
        '250,000 عملية تشغيل شهرياً',
        '25,000 رصيد ذكاء اصطناعي',
        '25 مساحة عمل (25 Workspaces)',
        'أعضاء فريق غير محدودين (Unlimited Team)',
        'طابور رسائل خطأ DLQ مخصص',
        'مزامنة حية مع Cloud Firestore',
        'مدير حساب مخصص'
      ] : [
        '250,000 Monthly Executions',
        '25,000 AI Credits',
        '25 Workspaces',
        'Unlimited Team Seats',
        'Dedicated DLQ Execution Queue',
        'Live Cloud Firestore Sync',
        'Dedicated Account Manager'
      ],
      highlight: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      nameAr: 'المؤسسات (Enterprise)',
      priceMonthly: 499,
      priceAnnual: 429,
      badge: isAr ? 'حلول مخصصة' : 'Dedicated Cloud',
      description: isAr ? 'للمؤسسات الضخمة بمتطلبات أمان عالية' : 'For large enterprises & custom scale',
      features: isAr ? [
        'عمليات تشغيل غير محدودة',
        'أرصدة ذكاء اصطناعي مخصصة',
        'مساحات عمل مخصصة غير محدودة',
        'أعضاء فريق غير محدودين',
        'ضمان SLA بنسبة 99.99%',
        'نشر على خوادم خاصة (Dedicated Cloud)',
        'تدريب وتكامل مخصص'
      ] : [
        'Unlimited Executions',
        'Custom Dedicated AI Credits',
        'Unlimited Custom Workspaces',
        'Unlimited Seats',
        '99.99% Guaranteed SLA',
        'Dedicated Cloud Deployment',
        'Onboarding & Integration Training'
      ],
      highlight: false
    }
  ];

  const handleOpenCheckout = (plan: any) => {
    if (plan.id === 'free') {
      if (onSelectPlan) onSelectPlan('free');
      return;
    }
    setSelectedPlanModal(plan);
    setPaymentSuccess(false);
    setPaymentRefCode(null);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const amount = isAnnual ? selectedPlanModal.priceAnnual * 12 : selectedPlanModal.priceMonthly;
    let generatedRef = '';

    if (paymentProvider === 'fawry') {
      generatedRef = `FAWRY-${Math.floor(100000000 + Math.random() * 900000000)}`;
    } else if (paymentProvider === 'paymob') {
      generatedRef = `PAYMOB-EGP-${Math.floor(100000 + Math.random() * 900000)}`;
    } else {
      generatedRef = `STRIPE-CH_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
    }

    try {
      // Record Transaction directly in Firestore
      await addDoc(collection(db, 'transactions'), {
        planId: selectedPlanModal.id,
        planName: selectedPlanModal.name,
        amount,
        currency: paymentProvider === 'fawry' || paymentProvider === 'paymob' ? 'EGP' : 'USD',
        provider: paymentProvider,
        referenceCode: generatedRef,
        status: 'completed',
        billingCycle: isAnnual ? 'annual' : 'monthly',
        timestamp: new Date().toISOString(),
        customerEmail: 'user@zainautomation.com'
      });

      // Automatically Upgrade Subscription Record in Firestore
      await setDoc(doc(db, 'subscriptions', 'current_workspace'), {
        planId: selectedPlanModal.id,
        planName: selectedPlanModal.name,
        status: 'active',
        upgradedAt: new Date().toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paymentProvider,
        lastTransactionRef: generatedRef
      }, { merge: true });

    } catch (err) {
      console.warn('Firestore transaction log error:', err);
    }

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setPaymentRefCode(generatedRef);
      if (onSelectPlan && selectedPlanModal) {
        onSelectPlan(selectedPlanModal.id);
      }
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 text-xs font-bold bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>{isAr ? 'الخطط والاشتراكات الرسمية' : 'Subscription Plans'}</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {isAr ? 'اختر الباقة المناسبة لأعمالك وأتمتة مساراتك' : 'Scale your automation with simple, transparent pricing'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {isAr ? 'جميع الخطط تشمل الذكاء الاصطناعي، الأمان العالي، ودعم كامل للغة العربية والإنكليزية.' : 'All plans include Gemini AI execution, end-to-end encryption, and full Arabic/English support.'}
        </p>

        {/* Monthly vs Annual Billing Toggle */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <span className={`text-xs font-semibold ${!isAnnual ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
            {isAr ? 'فوترة شهرية' : 'Monthly'}
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 bg-indigo-600 rounded-full p-1 transition-colors relative focus:outline-none"
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform transform ${isAnnual ? (isAr ? '-translate-x-6' : 'translate-x-6') : ''}`} />
          </button>
          <span className={`text-xs font-semibold flex items-center gap-1.5 ${isAnnual ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
            <span>{isAr ? 'فوترة سنوية' : 'Annual'}</span>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-700 rounded-full font-bold">
              {isAr ? 'خصم 20%' : 'Save 20%'}
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {plans.map((plan) => {
          const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-5 border transition-all relative flex flex-col justify-between ${
                plan.highlight
                  ? 'bg-slate-900 text-white border-indigo-500 shadow-xl ring-2 ring-indigo-500/50'
                  : 'bg-white text-slate-900 border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className={`text-base font-bold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                    {isAr ? plan.nameAr : plan.name}
                  </h3>
                  <p className={`text-[11px] mt-1 leading-snug ${plan.highlight ? 'text-slate-300' : 'text-slate-500'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="py-2 border-y border-slate-200/20">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black font-mono">${price}</span>
                    <span className={`text-xs ${plan.highlight ? 'text-slate-300' : 'text-slate-500'}`}>
                      {isAr ? '/شهرياً' : '/month'}
                    </span>
                  </div>
                  {isAnnual && price > 0 && (
                    <span className={`text-[10px] ${plan.highlight ? 'text-indigo-300' : 'text-indigo-600'} font-semibold block mt-0.5`}>
                      {isAr ? `تُدفع $${price * 12} سنوياً` : `Billed $${price * 12} annually`}
                    </span>
                  )}
                </div>

                <ul className="space-y-2 pt-1 text-[11px]">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.highlight ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      <span className={plan.highlight ? 'text-slate-200' : 'text-slate-700'}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleOpenCheckout(plan)}
                className={`w-full mt-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  plan.highlight
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                }`}
              >
                <span>
                  {plan.id === 'free' 
                    ? (isAr ? 'الخطة الحالية الحرة' : 'Current Plan') 
                    : (isAr ? 'الاشتراك والدفع' : 'Subscribe Now')}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment Checkout Modal */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 relative">
            <button
              onClick={() => setSelectedPlanModal(null)}
              className="absolute top-5 left-5 rtl:left-5 ltr:right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {isAr ? 'تم الاشتراك وترقية الخطة بنجاح!' : 'Subscription Activated & Upgraded!'}
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  {isAr 
                    ? `تم ترقية حسابك تلقائياً إلى خطة ${selectedPlanModal.name}. ورفع حدود الاستهلاك والصلاحيات فورياً.` 
                    : `Your workspace is now upgraded to ${selectedPlanModal.name}. Capacity & permissions updated instantly.`}
                </p>

                {paymentRefCode && (
                  <div className="bg-slate-900 text-white p-4 rounded-2xl text-center space-y-1">
                    <span className="text-[10px] font-mono text-indigo-300 block uppercase">
                      {isAr ? 'رقم عملية الدفع المرجعي (Transaction Ref):' : 'Transaction Reference:'}
                    </span>
                    <span className="text-base font-black font-mono text-emerald-400 tracking-wider block">
                      {paymentRefCode}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setSelectedPlanModal(null)}
                  className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 transition-colors"
                >
                  {isAr ? 'العودة للوحة التحكم' : 'Return to Dashboard'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleProcessPayment} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {isAr ? `تأكيد الاشتراك في خطة ${selectedPlanModal.name}` : `Upgrade to ${selectedPlanModal.name}`}
                    </h2>
                    <p className="text-xs text-slate-500">
                      ${isAnnual ? selectedPlanModal.priceAnnual : selectedPlanModal.priceMonthly} {isAr ? 'شهرياً' : '/month'}
                    </p>
                  </div>
                </div>

                {/* Gateway Selectors */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentProvider('stripe')}
                    className={`p-2.5 rounded-2xl border text-[11px] font-bold transition-all flex flex-col items-center gap-1 ${
                      paymentProvider === 'stripe'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Stripe Global</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentProvider('fawry')}
                    className={`p-2.5 rounded-2xl border text-[11px] font-bold transition-all flex flex-col items-center gap-1 ${
                      paymentProvider === 'fawry'
                        ? 'bg-amber-50 border-amber-500 text-amber-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Receipt className="w-4 h-4" />
                    <span>فوري Fawry</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentProvider('paymob')}
                    className={`p-2.5 rounded-2xl border text-[11px] font-bold transition-all flex flex-col items-center gap-1 ${
                      paymentProvider === 'paymob'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>باي موب Paymob</span>
                  </button>
                </div>

                {/* Form Fields */}
                {paymentProvider === 'stripe' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        {isAr ? 'اسم حامل البطاقة:' : 'Cardholder Name:'}
                      </label>
                      <input
                        type="text"
                        required
                        defaultValue="Ahmad Zain"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        {isAr ? 'رقم البطاقة الائتمانية:' : 'Card Number:'}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          defaultValue="4242 •••• •••• 4242"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute right-3 rtl:left-3 top-2.5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          {isAr ? 'تاريخ الانتهاء:' : 'Expiry Date:'}
                        </label>
                        <input
                          type="text"
                          required
                          defaultValue="12/28"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          CVC / CVC2:
                        </label>
                        <input
                          type="text"
                          required
                          defaultValue="888"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentProvider === 'fawry' && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-2">
                    <p className="text-amber-900 font-semibold">
                      {isAr 
                        ? 'توليد كود فوري مرجعي مصحوب بـ QR Code للدفع المباشر من محفظة الموبايل أو عبر أي أجهزة فوري في مصر.'
                        : 'Instant Fawry reference code generated for mobile wallet or retail store settlement.'}
                    </p>
                    <p className="text-amber-800 text-[11px]">
                      {isAr ? 'المبلغ التقديري: ~ 1,450 ج.م' : 'Equivalent Amount: ~ 1,450 EGP'}
                    </p>
                  </div>
                )}

                {paymentProvider === 'paymob' && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2">
                    <p className="text-emerald-900 font-semibold">
                      {isAr 
                        ? 'الدفع المحلي في مصر عبر المحافظ الإلكترونية (فودافون كاش، أورنج كاش) أو بطاقات ميزة والتقسيط.'
                        : 'Egyptian local checkout via Mobile Wallets (Vodafone Cash, Orange), Meeza cards, or Installments.'}
                    </p>
                    <p className="text-emerald-800 text-[11px]">
                      {isAr ? 'المبلغ التقديري: ~ 1,450 ج.م' : 'Equivalent Amount: ~ 1,450 EGP'}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>
                      {isAr ? 'تأكيد الدفع والترقية الفورية' : 'Confirm & Activate Subscription'}
                    </span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

