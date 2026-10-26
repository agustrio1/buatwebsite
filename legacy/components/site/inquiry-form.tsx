import { Form, useNavigation, useActionData } from "react-router";
import { Send, CheckCircle2 } from "lucide-react";

export function InquiryForm({ services }: { services: { id: string; title: string }[] }) {
  const navigation = useNavigation();
  const actionData = useActionData<{ success?: boolean; error?: string }>();
  const isSubmitting = navigation.state === "submitting";

  if (actionData?.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <CheckCircle2 className="mx-auto text-green-600" size={32} />
        <p className="font-semibold text-green-700 mt-3">Pesan Anda berhasil dikirim</p>
        <p className="text-sm text-green-600 mt-1">
          Tim kami akan menghubungi Anda secepatnya.
        </p>
      </div>
    );
  }

  return (
    <Form method="post" className="space-y-4">
      {actionData?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {actionData.error}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Nama</label>
          <input name="name" required className="w-full border rounded-lg px-3 py-2.5" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Email</label>
          <input name="email" type="email" required className="w-full border rounded-lg px-3 py-2.5" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">No. WhatsApp</label>
          <input name="phone" className="w-full border rounded-lg px-3 py-2.5" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Nama Perusahaan</label>
          <input name="companyName" className="w-full border rounded-lg px-3 py-2.5" />
        </div>
      </div>

      {services.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Layanan yang diminati</label>
          <select name="serviceType" className="w-full border rounded-lg px-3 py-2.5 bg-white">
            <option value="">Pilih layanan (opsional)</option>
            {services.map((s) => (
              <option key={s.id} value={s.title}>{s.title}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1 text-slate-700">Pesan</label>
        <textarea name="message" required rows={4} className="w-full border rounded-lg px-3 py-2.5" />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-full transition-colors"
      >
        <Send size={16} /> {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
      </button>
    </Form>
  );
}