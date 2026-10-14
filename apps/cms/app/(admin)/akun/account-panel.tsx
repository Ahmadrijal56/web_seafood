"use client";

import { formatDateTime } from "@sfs/shared";
import { Trash2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useToast } from "@/components/toast";
import { Button, Card, Field, Pill } from "@/components/ui";
import { createAdmin, removeAdmin } from "@/lib/admin-actions";
import { supabaseBrowser } from "@/lib/supabase/client";

export type AdminRow = { user_id: string; email: string; name: string | null; created_at: string };

export function AccountPanel({ admins, currentUserId }: { admins: AdminRow[]; currentUserId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });
  const [adding, setAdding] = useState(false);

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast("Password minimal 8 karakter", "error");
    if (password !== confirmPassword) return toast("Konfirmasi password tidak sama", "error");
    setSavingPassword(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password });
    setSavingPassword(false);
    if (error) return toast(error.message, "error");
    setPassword("");
    setConfirmPassword("");
    toast("Password berhasil diganti");
  }

  async function add(e: FormEvent) {
    e.preventDefault();
    setAdding(true);
    const result = await createAdmin(newAdmin);
    setAdding(false);
    if (!result.ok) return toast(result.message, "error");
    setNewAdmin({ name: "", email: "", password: "" });
    toast("Admin baru ditambahkan");
    router.refresh();
  }

  async function remove(a: AdminRow) {
    if (!confirm(`Hapus akses admin untuk ${a.email}?`)) return;
    const result = await removeAdmin(a.user_id);
    if (!result.ok) return toast(result.message, "error");
    toast("Admin dihapus");
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card title="Daftar admin" className="lg:col-span-2">
        <ul className="divide-y divide-slate-100">
          {admins.map((a) => (
            <li key={a.user_id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-extrabold uppercase text-brand-700">
                {(a.name ?? a.email).charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-bold text-navy">
                  <span className="truncate">{a.name ?? a.email.split("@")[0]}</span>
                  {a.user_id === currentUserId && <Pill tone="brand">Anda</Pill>}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {a.email} · sejak {formatDateTime(a.created_at)}
                </p>
              </div>
              {a.user_id !== currentUserId && (
                <button type="button" onClick={() => remove(a)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Hapus admin">
                  <Trash2 className="size-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Tambah admin">
        <form onSubmit={add} className="space-y-4">
          <Field label="Nama">
            <input className="input" value={newAdmin.name} onChange={(e) => setNewAdmin((s) => ({ ...s, name: e.target.value }))} placeholder="Staf lapak" />
          </Field>
          <Field label="Email">
            <input className="input" type="email" required value={newAdmin.email} onChange={(e) => setNewAdmin((s) => ({ ...s, email: e.target.value }))} />
          </Field>
          <Field label="Password awal" hint="Minimal 8 karakter — minta admin baru menggantinya setelah login">
            <input className="input" type="text" required minLength={8} value={newAdmin.password} onChange={(e) => setNewAdmin((s) => ({ ...s, password: e.target.value }))} />
          </Field>
          <Button type="submit" loading={adding}>
            <UserPlus className="size-4" /> Tambah admin
          </Button>
        </form>
      </Card>

      <Card title="Ganti password saya">
        <form onSubmit={changePassword} className="space-y-4">
          <Field label="Password baru">
            <input className="input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Field label="Ulangi password baru">
            <input className="input" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </Field>
          <Button type="submit" variant="outline" loading={savingPassword}>
            Simpan password
          </Button>
        </form>
      </Card>
    </div>
  );
}
