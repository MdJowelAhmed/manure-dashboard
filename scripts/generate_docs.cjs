const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
} = require('docx');

async function generateDocx() {
  const primaryColor = '0F172A';
  const secondaryColor = '334155';
  const accentColor = '526B83';
  const successColor = '166534';
  const lightBg = 'F1F5F9';

  const doc = new Document({
    creator: 'Meridian Agri-Trade Ltd.',
    title: 'Meridian Business - System Documentation & User Guide (Bengali)',
    description: 'Fertilizer Import & Local Sales Management Dashboard User Guide',
    styles: {
      default: {
        document: {
          run: {
            font: 'Segoe UI',
            size: 22, // 11pt
            color: secondaryColor,
          },
          paragraph: {
            spacing: { line: 320, after: 120 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          // Header / Title block
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: 'মেরিডিয়ান বিজনেস (Meridian Business)',
                size: 44, // 22pt
                bold: true,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'প্রিমিয়াম সার আমদানি ও স্থানীয় পাইকারি বিক্রয় ব্যবস্থাপনা ড্যাশবোর্ড',
                size: 26,
                bold: true,
                color: accentColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: 'প্রতিষ্ঠান: Meridian Agri-Trade Ltd. (চট্টগ্রাম, বাংলাদেশ)  |  একক ডিপো: খাতুনগঞ্জ সেন্ট্রাল ডিপো\nকারেন্সি: BDT (৳)  |  সংস্করণ: ১.০ (বাংলা নির্দেশিকা)',
                size: 20,
                color: '64748B',
              }),
            ],
          }),

          // Divider
          new Paragraph({
            spacing: { after: 300 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 12, color: 'CBD5E1' },
            },
          }),

          // Section 1: Business Context
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 140 },
            children: [
              new TextRun({
                text: '১. ভূমিকা ও ব্যবসায়িক প্রেক্ষাপট (Business Context)',
                size: 30,
                bold: true,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'এই অ্যাপ্লিকেশনটি আন্তর্জাতিক সার সরবরাহকারীদের থেকে বাল্ক সার আমদানি করে চট্টগ্রাম বন্দর দিয়ে খালাসপূর্বক দেশের অভ্যন্তরীণ বাজারে ডিলারদের কাছে পাইকারি বিক্রয়ের সম্পূর্ণ ব্যবসায়িক কার্যপ্রণালী সুচারুভাবে পরিচালনার জন্য প্রস্তুত করা হয়েছে।',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• আন্তর্জাতিক আমদানি ও এলসি: ', bold: true, color: primaryColor }),
              new TextRun({ text: 'সৌদি আরব (SABIC), মরক্কো (OCP Group), চীন (Sinofert) ও অন্যান্য বৈশ্বিক সরবরাহকারীদের থেকে সরাসরি জাহাজযোগে সার আমদানি।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• একক ডিপো মডেল: ', bold: true, color: primaryColor }),
              new TextRun({ text: 'আমদানিকৃত সমস্ত সার সরাসরি চট্টগ্রামস্থ "খাতুনগঞ্জ সেন্ট্রাল ডিপো" (ধারণক্ষমতা ১৫,০০০ মেট্রিক টন)-তে জমা হয়।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• স্থানীয় বিক্রয় ও বিতরণ: ', bold: true, color: primaryColor }),
              new TextRun({ text: 'বগুড়া, যশোর, কুমিল্লা, দিনাজপুরসহ দেশের কৃষিপ্রধান অঞ্চলের অনুমোদিত ডিলারদের কাছে পাইকারি চালান ইস্যু ও সরবরাহ।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ল্যান্ডেড কস্টিং (Landed Costing): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'পণ্যের ক্রয়মূল্যের সাথে আন্তর্জাতিক ফ্রেইট, মেরিন ইন্স্যুরেন্স, এনবিআর কাস্টমস শুল্ক ও পোর্ট চার্জ যুক্ত করে প্রতি টনের আসল খরচ নির্ধারণ।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ডাবল-এন্ট্রি হিসাবরক্ষণ: ', bold: true, color: primaryColor }),
              new TextRun({ text: 'প্রতিটি চালানের বিপরীতে স্বয়ংক্রিয় সাধারণ জাবেদা, খতিয়ান এবং জিরো-ডিফারেন্স রেওয়ামিল (Trial Balance) ও ব্যালেন্স শিট প্রস্তুতকরণ।' }),
            ],
          }),

          // Section 2: Detailed Navigation Guide
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 140 },
            children: [
              new TextRun({
                text: '২. সাইডবার ন্যাভিগেশন অনুযায়ী প্রতিটি পেজের কাজ ও প্রয়োজনীয়তা',
                size: 30,
                bold: true,
                color: primaryColor,
              }),
            ],
          }),

          // Overview: Dashboard
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: 'ক. ড্যাশবোর্ড (Dashboard — /dashboard)', size: 24, bold: true, color: accentColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'কাজের বিবরণ: ', bold: true, color: primaryColor }),
              new TextRun({ text: 'এটি পুরো ব্যবসায়ের কেন্দ্রীয় কমান্ড সেন্টার। এক নজরে মোট বিক্রয় (Total Sales), মোট লাভ (Gross Profit), পরিচালন ব্যয় (Operating Expenses), বাজারে ডিলারদের কাছে পাওনা টাকা (Accounts Receivable), সরবরাহকারীদের এলসি দেনা (Accounts Payable) এবং ডিপোতে থাকা মালের আর্থিক মূল্য (Inventory Value) প্রদর্শন করে।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'কেন ব্যবহার করবেন: ', bold: true, color: primaryColor }),
              new TextRun({ text: 'মালিক বা ব্যবস্থাপক যেন সফটওয়্যারে ঢুকেই কয়েক সেকেন্ডে ব্যবসায়িক অবস্থা উপলব্ধি করতে পারেন। পেজের ওপরের Quick Actions বাটন দিয়ে সরাসরি নতুন চালান, ইনভয়েস বা খরচ রেকর্ড করা যায়।' }),
            ],
          }),

          // Trade & Logistics
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({ text: 'খ. বাণিজ্য ও লজিস্টিকস (Trade & Logistics)', size: 24, bold: true, color: accentColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '১. আমদানি চালানসমূহ (Import Shipments — /imports): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'বিদেশ থেকে আসা প্রতিটি শিপমেন্টের বিস্তারিত রেকর্ড। চালানের রেফারেন্স নম্বর, বিদেশি সাপ্লায়ারের নাম, জাহাজের নাম (Vessel), সম্ভাব্য পৌঁছানোর তারিখ ও বর্তমান স্ট্যাটাস (Draft, Ordered, In Transit, Received) দেখায়।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '২. নতুন আমদানি এন্ট্রি (New Import — /imports/new): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'নতুন আমদানি চুক্তির ডাটা এন্ট্রি পেজ। পণ্যের লাইন আইটেম, টন, ক্রয়মূল্য, আন্তর্জাতিক ফ্রেইট, মেরিন ইন্স্যুরেন্স, শুল্ক ও পোর্ট চার্জ ইনপুট দিলে সিস্টেম স্বয়ংক্রিয়ভাবে লাইভ Landed Cost Calculator-এর মাধ্যমে প্রতি টনের প্রকৃত মোট খরচ হিসাব করে দেয়।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '৩. ক্রয়াদেশ (Purchase Orders — /purchase-orders): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'আন্তর্জাতিক সাপ্লায়ারদের অনুকূলে পাঠানো ফরমাল ক্রয়াদেশ এবং খোলা এলসি-র রেফারেন্স ট্র্যাক করার জন্য ব্যবহৃত হয়।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '৪. মালামাল প্রাপ্তি রসিদ (Goods Receipts / GRN — /goods-receipts): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'জাহাজ থেকে সার খালাস হয়ে যখন ট্রাকযোগে খাতুনগঞ্জ ডিপোতে ঢোকে, তখন গুদাম ইনচার্জ এই রসিদ তৈরি করেন। কত টন অক্ষত এসেছে এবং কত বস্তা ড্যামেজ বা ঘাটতি হয়েছে তা লিপিবদ্ধ হয়। এটি নিশ্চিত করলেই ডিপোর আসল স্টক বৃদ্ধি পায়।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '৫. গুদাম ইনভেন্টরি ও মজুত (Inventory & Stock — /inventory): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'খাতুনগঞ্জ ডিপোর বর্তমান সারের মজুত পরিস্থিতি। প্রতিটি সারের এসকেইউ কোড, নাম, ক্যাটাগরি, স্টক (MT), গড় ক্রয়মূল্য এবং রি-অর্ডার লেভেল দেখায়। সাথে রয়েছে মেট্রিক টন, ব্যাগ ও কেজির রূপান্তর ম্যাট্রিক্স (১ মে.টন = ২০টি ৫০ কেজির ব্যাগ = ১,০০০ কেজি)।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '৬. স্টক মুভমেন্ট লগ (Stock Movements — /inventory/movements): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'গুদামে সার আসা ও ডেলিভারি হয়ে বের হয়ে যাওয়ার অডিট ট্রেইল। কোনো হিসাব যাচাইয়ে কোন গাড়ি দিয়ে কার কাছে কত টন গেল তা সহজেই বের করা যায়।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '৭. স্টক সমন্বয় (Stock Adjustments — /inventory/adjustments): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'গুদাম অডিটে আর্দ্রতা হ্রাস (Moisture Loss) বা বস্তা ছিঁড়ে নষ্ট হওয়া সারের হিসাব সমন্বয় করে খাতার স্টক ও গুদামের বাস্তব স্টক সমান রাখা হয়।' }),
            ],
          }),

          // Sales & Distribution
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({ text: 'গ. বিক্রয় ও বিতরণ (Sales & Distribution)', size: 24, bold: true, color: accentColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '১. বিক্রয় চালানসমূহ (Sales Invoices — /sales): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'ডিলারদের নামে তৈরি সমস্ত ইনভয়েস, মোট বিল, কত টাকা জমা হয়েছে এবং কত বকেয়া রয়েছে তার সার্বিক তালিকা।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '২. নতুন বিক্রয় চালান তৈরি (New Invoice — /sales/new): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'ডিলারের কাছে সার বিক্রির বিলিং স্ক্রিন। ডিলারের পূর্বের বাকি দেখায় এবং ডিপোতে পর্যাপ্ত মাল আছে কি না লাইভ যাচাই করে। স্টক না থাকলে সিস্টেম বিল আটকায়, ফলে অতিরিক্ত বিক্রির ঝুঁকি থাকে না।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '৩. বাণিজ্যিক ইনভয়েস প্রিন্ট ভিউ (Invoice Detail — /sales/:id): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'বাংলাদেশের কমার্শিয়াল ফরম্যাট অনুযায়ী তৈরি প্রিমিয়াম প্রিন্টেবল ইনভয়েস। প্রতিষ্ঠানের নাম, ট্রেড লাইসেন্স, টিআইএন/বিন, ডেলিভারি চালান নম্বর ও অথরাইজড স্বাক্ষর ব্লকসহ সরাসরি A4 পেপারে প্রিন্ট বা পিডিএফ সেভ করা যায়।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '৪. বিক্রয় ফেরত (Sales Returns — /sales-returns): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'ডিলার কোনো ক্ষতিগ্রস্ত সার ফেরত দিলে ক্রেডিট নোট ইস্যু করে গ্রাহকের বকেয়া কমানো এবং পণ্য পুনরায় স্টকে যোগ করা হয়।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '৫. গ্রাহক ও ডিলার ডিরেক্টরি (Customers — /customers): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'অনুমোদিত ডিলারদের প্রোফাইল, ফোন নম্বর ও বকেয়া ব্যালেন্সের তালিকা। এখান থেকে ডিলারের সম্পূর্ণ লেজার স্টেটমেন্ট (Statement of Account) প্রিন্ট করা যায়।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '৬. আন্তর্জাতিক সরবরাহকারী (Suppliers — /suppliers): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'বৈশ্বিক সার উৎপাদনকারী প্রতিষ্ঠানগুলোর প্রোফাইল, ব্যাংক সুইফট কোড এবং তাদের এলসি পাওনা ব্যালেন্স তদারকির পেজ।' }),
            ],
          }),

          // Treasury & Expense
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({ text: 'ঘ. ট্রেজারি ও ব্যয় ব্যবস্থাপনা (Treasury & Expense)', size: 24, bold: true, color: accentColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '১. অর্থ গ্রহণ ও পরিশোধ (Payments & Receipts — /payments): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'গ্রাহকদের জমা (Customer Receipt) এবং সরবরাহকারীদের এলসি পরিশোধ (Supplier Payment) লিপিবদ্ধ করা। একটি জমার মাধ্যমে একাধিক চালানের বকেয়া এক ক্লিকে সমন্বয় করা যায়।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '২. ব্যাংক ও ক্যাশ অ্যাকাউন্ট (Cash & Bank Accounts — /cash-bank): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'ইস্টার্ন ব্যাংক ও ইসলামী ব্যাংকের অ্যাকাউন্টে বর্তমান স্থিতি (Liquid Balance) ও সাম্প্রতিক লেনদেন পর্যবেক্ষণ।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '৩. পরিচালন ব্যয় (Operating Expenses — /expenses): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'খাতুনগঞ্জ ডিপোর গুদাম ভাড়া, বিদ্যুৎ বিল, কর্মচারীদের বেতন, আনলোডিং লেবার খরচ ইত্যাদির হিসাব সংরক্ষণ। আমদানি খরচের সাথে অফিসের সাধারণ পরিচালন ব্যয় পৃথক রাখতে এটি অপরিহার্য।' }),
            ],
          }),

          // Double-Entry Accounting
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({ text: 'ঙ. ডাবল-এন্ট্রি অ্যাকাউন্টিং (Double-Entry Accounting)', size: 24, bold: true, color: accentColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '১. চার্ট অব অ্যাকাউন্টস (Chart of Accounts — /accounting/chart-of-accounts): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'কোম্পানির সমস্ত খতিয়ান হিসাবের মাস্টার তালিকা (Assets, Liabilities, Equity, Revenue, Expense) এবং চার অঙ্কের কোড কাঠামো।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '২. জাবেদা দাখিলা (Journal Entries — /accounting/journals): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'সমস্ত সাধারণ জাবেদা ভাউচার। এতে কঠোর ম্যাথমেটিক্যাল চেক রয়েছে: মোট ডেবিট এবং মোট ক্রেডিট সমান না হলে সিস্টেম পোস্টিং আটকে দেয়।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '৩. সাধারণ খতিয়ান বহী (General Ledger — /accounting/general-ledger): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'যেকোনো নির্দিষ্ট হিসাবের বিস্তারিত লেনদেন ও রানিং ব্যালেন্স দেখার পূর্ণাঙ্গ অডিট পেজ।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '৪. রেওয়ামিল (Trial Balance — /accounting/trial-balance): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'মোট ডেবিট ব্যালেন্স ও মোট ক্রেডিট ব্যালেন্স শূন্য পার্থক্যে (Zero Variance) মিলেছে কি না তা যাচাইয়ের পেজ।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '৫. হিসাবকাল নিয়ন্ত্রণ (Accounting Periods — /accounting/periods): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'বিগত মাসের হিসাব অডিট শেষে লক করে রাখা, যাতে কেউ পেছনের তারিখে অননুমোদিত এন্ট্রি না দিতে পারে।' }),
            ],
          }),

          // Intelligence & Reports
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({ text: 'চ. প্রাতিষ্ঠানিক রিপোর্ট ও সেটিংস (Reports & Settings)', size: 24, bold: true, color: accentColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '১. লাভ-ক্ষতি বিবরণী (Profit & Loss — /reports/profit-loss): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'মোট রাজস্ব, বিক্রিত সারের ক্রয়মূল্য (COGS), গ্রস প্রফিট, অপারেটিং খরচ ও নিট লাভ প্রদর্শন।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '২. উদ্বৃত্তপত্র (Balance Sheet — /reports/balance-sheet): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'সম্পদ = দায় + মালিকানাস্বত্ব (Assets = Liabilities + Equity) সমীকরণ মিলিয়ে তৈরি ব্যালেন্স শিট।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '৩. বকেয়া বয়সভিত্তিক তালিকা (Receivables & Payables Aging): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'ডিলারদের বাকি টাকা কত দিনের পুরোনো (১-৩০ দিন, ৩১-৬০ দিন, ৯০+ দিন) তা অগ্রাধিকার ভিত্তিতে আদায়ের জন্য তালিকা।' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '৪. প্রতিষ্ঠান সেটিংস (Company Settings — /settings): ', bold: true, color: primaryColor }),
              new TextRun({ text: 'কোম্পানির নাম, ট্রেড লাইসেন্স নম্বর, টিন/বিন, খাতুনগঞ্জ ডিপোর তথ্য এবং ডাটা ব্যাকআপ এক্সপোর্ট করার সুবিধা।' }),
            ],
          }),

          // Section 3: Summary Table
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 140 },
            children: [
              new TextRun({
                text: '৩. সারসংক্ষেপ সারণী (Quick Reference Table)',
                size: 30,
                bold: true,
                color: primaryColor,
              }),
            ],
          }),

          // Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.CLEAR, fill: lightBg },
                    children: [new Paragraph({ children: [new TextRun({ text: 'সেকশন নাম', bold: true, color: primaryColor })] })],
                  }),
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.CLEAR, fill: lightBg },
                    children: [new Paragraph({ children: [new TextRun({ text: 'মূল উদ্দেশ্য ও ব্যবসায়িক কাজ', bold: true, color: primaryColor })] })],
                  }),
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.CLEAR, fill: lightBg },
                    children: [new Paragraph({ children: [new TextRun({ text: 'ওয়েব রুট (URL)', bold: true, color: primaryColor })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'ড্যাশবোর্ড', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: 'সার্বিক আর্থিক পর্যবেক্ষণ ও তাৎক্ষণিক কুইক অ্যাকশন' })] }),
                  new TableCell({ children: [new Paragraph({ text: '/dashboard' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'আমদানি চালান', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: 'এলসি ট্র্যাকিং ও ফ্রেইট/শুল্কসহ আসল ল্যান্ডেড কস্টিং' })] }),
                  new TableCell({ children: [new Paragraph({ text: '/imports, /imports/new' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'পণ্য রসিদ (GRN)', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: 'বন্দর থেকে খাতুনগঞ্জ গুদামে সার রিসিভ ও স্টক ইন' })] }),
                  new TableCell({ children: [new Paragraph({ text: '/goods-receipts' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'গুদাম ইনভেন্টরি', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: 'সারের মজুত, ব্যাগ কনভার্সন (MT/ব্যাগ) ও অডিট লগ' })] }),
                  new TableCell({ children: [new Paragraph({ text: '/inventory, /inventory/movements' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'বিক্রয় ও চালান', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: 'ডিলারদের ইনভয়েস তৈরি ও কমার্শিয়াল চালান প্রিন্ট' })] }),
                  new TableCell({ children: [new Paragraph({ text: '/sales, /sales/new' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'ডিলার ও লেজার', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: 'ডিলারদের পাওনা বকেয়া ও স্টেটমেন্ট প্রিন্ট' })] }),
                  new TableCell({ children: [new Paragraph({ text: '/customers, /customers/:id' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'ট্রেজারি ও ব্যাংক', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: 'কাস্টমার রসিদ, এলসি পেমেন্ট ও ব্যাংক ব্যালেন্স' })] }),
                  new TableCell({ children: [new Paragraph({ text: '/payments, /cash-bank' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'অ্যাকাউন্টিং', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: 'জাবেদা দাখিলা ও জিরো-ডিফারেন্স রেওয়ামিল' })] }),
                  new TableCell({ children: [new Paragraph({ text: '/accounting/trial-balance' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'আর্থিক রিপোর্ট', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: 'লাভ-ক্ষতি বিবরণী (P&L) ও উদ্বৃত্তপত্র (Balance Sheet)' })] }),
                  new TableCell({ children: [new Paragraph({ text: '/reports/profit-loss, /reports/balance-sheet' })] }),
                ],
              }),
            ],
          }),

          // Footer
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 500 },
            children: [
              new TextRun({
                text: '— প্রস্তুতকারী: Meridian Agri-Trade IT Systems —\nফোন: +880 1711-234567 | ইমেইল: info@meridianagri.com.bd',
                size: 18,
                color: '94A3B8',
                italics: true,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath1 = path.join(__dirname, '..', 'Meridian_Business_Documentation_BN.docx');
  const outPath2 = path.join(__dirname, '..', 'public', 'Meridian_Business_Documentation_BN.docx');

  fs.writeFileSync(outPath1, buffer);
  fs.writeFileSync(outPath2, buffer);
  console.log('Successfully generated Word documents:');
  console.log('1.', outPath1);
  console.log('2.', outPath2);
}

generateDocx().catch((err) => {
  console.error('Error generating docx:', err);
  process.exit(1);
});
