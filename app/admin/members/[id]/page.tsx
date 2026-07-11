"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import {
  ArrowLeft,
  Pencil,
  RefreshCw,
  Trash2,
  Calendar,
  DollarSign,
  Clock,
  UserCheck,
  Mail,
  Phone,
  Activity,
  Dumbbell,
  FileText,
  CheckCircle,
} from "lucide-react";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Tabs from "@/components/admin/ui/Tabs";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { PageSkeleton } from "@/components/admin/ui/Skeleton";
import EmptyState from "@/components/admin/ui/EmptyState";
import { useToast } from "@/components/admin/ui/Toast";
import { ACTIVITIES } from "@/lib/activities";

interface Member {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  dateOfBirth: string | null;
  activity: string;
  category: string | null;
  profileImageUrl: string | null;
  planId: number | null;
  assignedCoachId: number | null;
  subscriptionStartDate: string;
  subscriptionDurationDays: number;
  pricePaid: number;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  plan?: { id: number; name: string; price: number; durationDays: number } | null;
  assignedCoach?: { id: number; name: string; specialty: string; imageUrl: string | null } | null;
}

interface Payment {
  id: number;
  amount: number;
  method: string;
  reference: string | null;
  description: string | null;
  date: string;
}

interface Attendance {
  id: number;
  checkIn: string;
  checkOut: string | null;
  method: string;
  notes: string | null;
}

interface Feedback {
  id: number;
  type: string;
  subject: string;
  message: string;
  status: string;
  reply: string | null;
  createdAt: string;
}

interface Plan {
  id: number;
  name: string;
  price: number;
  durationDays: number;
}

interface Coach {
  id: number;
  fullName: string;
}

const PAYMENT_METHODS: Record<string, string> = {
  CASH: "Espèces",
  CARD: "Carte",
  BANK_TRANSFER: "Virement",
  MOBILE_PAYMENT: "Mobile",
  OTHER: "Autre",
};

const CHECKIN_METHODS: Record<string, string> = {
  MANUAL: "Manuel",
  QR_CODE: "QR Code",
  PHONE_SEARCH: "Téléphone",
};

const FEEDBACK_STATUS: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: "En attente", bg: "bg-[var(--admin-warning)]/10", text: "text-[var(--admin-warning)]" },
  REVIEWED: { label: "Revu", bg: "bg-[var(--admin-info)]/10", text: "text-[var(--admin-info)]" },
  SOLVED: { label: "Résolu", bg: "bg-[var(--admin-success)]/10", text: "text-[var(--admin-success)]" },
  DISMISSED: { label: "Rejeté", bg: "bg-[var(--admin-text-dim)]/10", text: "text-[var(--admin-text-muted)]" },
};

function getMemberStatus(m: { subscriptionStartDate: string; subscriptionDurationDays: number }) {
  const start = new Date(m.subscriptionStartDate);
  const end = new Date(start.getTime() + m.subscriptionDurationDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 7) return "expiring";
  return "active";
}

function getDaysLeft(m: { subscriptionStartDate: string; subscriptionDurationDays: number }) {
  const start = new Date(m.subscriptionStartDate);
  const end = new Date(start.getTime() + m.subscriptionDurationDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calcDuration(checkIn: string, checkOut: string | null) {
  if (!checkOut) return null;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
  return `${mins}m`;
}

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const id = params.id as string;

  const [member, setMember] = useState<Member | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [showEdit, setShowEdit] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    activity: "",
    category: "",
    planId: "",
    assignedCoachId: "",
    subscriptionStartDate: "",
    subscriptionDurationDays: "30",
    pricePaid: "",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [memberRes, paymentsRes, attendancesRes] = await Promise.all([
          adminFetch(`/api/admin/clients/${id}`),
          adminFetch(`/api/admin/clients/${id}/payments`),
          adminFetch(`/api/admin/clients/${id}/attendances`),
        ]);

        if (!memberRes.ok) throw new Error("Membre non trouvé");
        const memberData = await memberRes.json();
        setMember(memberData);

        if (paymentsRes.ok) setPayments(await paymentsRes.json());
        if (attendancesRes.ok) setAttendances(await attendancesRes.json());

        if (memberData.feedbacks) setFeedbacks(memberData.feedbacks);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    adminFetch("/api/admin/subscription-plans?page=1&limit=100")
      .then((r) => r.json())
      .then((d) => setPlans(d.data || d || []))
      .catch(() => {});
    adminFetch("/api/admin/coaches?page=1&limit=100")
      .then((r) => r.json())
      .then((d) => setCoaches(d.data || d || []))
      .catch(() => {});
  }, []);

  const openEdit = () => {
    if (!member) return;
    setForm({
      fullName: member.fullName,
      phone: member.phone,
      email: member.email || "",
      dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split("T")[0] : "",
      activity: member.activity,
      category: member.category || "",
      planId: member.planId ? String(member.planId) : "",
      assignedCoachId: member.assignedCoachId ? String(member.assignedCoachId) : "",
      subscriptionStartDate: member.subscriptionStartDate.split("T")[0],
      subscriptionDurationDays: String(member.subscriptionDurationDays),
      pricePaid: String(member.pricePaid),
      notes: member.notes || "",
    });
    setShowEdit(true);
  };

  const handlePlanChange = (planId: string) => {
    const plan = plans.find((p) => p.id === Number(planId));
    if (plan) {
      setForm((prev) => ({
        ...prev,
        planId,
        pricePaid: String(plan.price),
        subscriptionDurationDays: String(plan.durationDays),
      }));
    } else {
      setForm((prev) => ({ ...prev, planId }));
    }
  };

  const handleSave = async () => {
    if (!form.fullName || !form.phone || !form.activity || !form.pricePaid) {
      addToast("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }
    setSaving(true);
    const body: Record<string, string | number | boolean | null | undefined> = {
      fullName: form.fullName,
      phone: form.phone,
      email: form.email || null,
      dateOfBirth: form.dateOfBirth || null,
      activity: form.activity,
      category: form.category || null,
      planId: form.planId ? Number(form.planId) : null,
      assignedCoachId: form.assignedCoachId ? Number(form.assignedCoachId) : null,
      subscriptionStartDate: form.subscriptionStartDate || undefined,
      subscriptionDurationDays: parseInt(form.subscriptionDurationDays) || 30,
      pricePaid: parseFloat(form.pricePaid),
      notes: form.notes || null,
    };

    const res = await adminFetch(`/api/admin/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      addToast("Membre mis à jour", "success");
      setShowEdit(false);
      const updated = await res.json();
      setMember((prev) => (prev ? { ...prev, ...updated } : prev));
    } else {
      addToast("Erreur lors de l'enregistrement", "error");
    }
    setSaving(false);
  };

  const handleRenew = async () => {
    setSaving(true);
    const res = await adminFetch(`/api/admin/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscriptionStartDate: new Date().toISOString().split("T")[0],
      }),
    });
    if (res.ok) {
      addToast("Abonnement renouvelé", "success");
      setShowRenew(false);
      const updated = await res.json();
      setMember((prev) => (prev ? { ...prev, ...updated } : prev));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await adminFetch(`/api/admin/clients/${id}`, { method: "DELETE" });
    if (res.ok) {
      addToast("Membre supprimé", "success");
      router.push("/admin/members");
    } else {
      addToast("Erreur lors de la suppression", "error");
    }
    setDeleting(false);
  };

  if (loading) return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Chargement...</h1>
        </div>
      </div>
      <PageSkeleton />
    </div>
  );
  if (error || !member) {
    return (
      <div className="admin-animate-fade-in flex flex-col items-center justify-center py-20">
        <p className="mb-4 text-sm text-[var(--admin-danger)]">{error || "Membre non trouvé"}</p>
        <button
          onClick={() => router.push("/admin/members")}
          className="admin-btn-gold rounded-xl px-4 py-2 text-sm font-medium"
        >
          Retour aux membres
        </button>
      </div>
    );
  }

  const status = getMemberStatus(member);
  const daysLeft = getDaysLeft(member);
  const endDate = new Date(
    new Date(member.subscriptionStartDate).getTime() + member.subscriptionDurationDays * 24 * 60 * 60 * 1000,
  );

  const initials = member.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const tabs = [
    { key: "overview", label: "Aperçu" },
    { key: "payments", label: "Paiements", count: payments.length },
    { key: "attendance", label: "Présence", count: attendances.length },
    { key: "activity", label: "Activité", count: feedbacks.length },
  ];

  return (
    <div className="admin-animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/members")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--admin-border)] text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-surface-hover)] hover:text-[var(--admin-text)]"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            {member.profileImageUrl ? (
              <img
                src={member.profileImageUrl}
                alt={member.fullName}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-[var(--admin-gold)]/20"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--admin-gold)]/10 text-xl font-bold text-[var(--admin-gold)]">
                {initials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{member.fullName}</h1>
                <StatusBadge status={status} size="md" />
              </div>
              <p className="mt-1 flex items-center gap-2 text-sm text-[var(--admin-text-muted)]">
                <Phone size={14} />
                {member.phone}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openEdit}
            className="admin-btn-ghost flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <Pencil size={15} />
            Modifier
          </button>
          <button
            onClick={() => setShowRenew(true)}
            className="admin-btn-gold flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <RefreshCw size={15} />
            Renouveler
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-2 rounded-xl border border-[var(--admin-danger)]/20 px-4 py-2.5 text-sm font-medium text-[var(--admin-danger)] transition-colors hover:bg-[var(--admin-danger)]/10"
          >
            <Trash2 size={15} />
            Supprimer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="admin-card rounded-xl p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--admin-gold)]/10">
            <Calendar size={20} className="text-[var(--admin-gold)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--admin-text)]">
            {daysLeft >= 0 ? daysLeft : 0}
          </p>
          <p className="text-xs text-[var(--admin-text-muted)]">Jours restants</p>
        </div>
        <div className="admin-card rounded-xl p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--admin-success)]/10">
            <DollarSign size={20} className="text-[var(--admin-success)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--admin-text)]">
            {member.pricePaid} TND
          </p>
          <p className="text-xs text-[var(--admin-text-muted)]">Total paiements</p>
        </div>
        <div className="admin-card rounded-xl p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--admin-info)]/10">
            <UserCheck size={20} className="text-[var(--admin-info)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--admin-text)]">
            {attendances.length}
          </p>
          <p className="text-xs text-[var(--admin-text-muted)]">Présences</p>
        </div>
        <div className="admin-card rounded-xl p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--admin-warning)]/10">
            <Clock size={20} className="text-[var(--admin-warning)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--admin-text)]">
            {formatDate(member.createdAt)}
          </p>
          <p className="text-xs text-[var(--admin-text-muted)]">Membre depuis</p>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === "overview" && (
          <div className="admin-animate-fade-in grid gap-6 lg:grid-cols-2">
            {/* Personal info */}
            <div className="admin-card rounded-xl p-6">
              <h3 className="mb-4 text-lg font-semibold text-[var(--admin-text)]">Informations personnelles</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-[var(--admin-text-dim)]" />
                  <div>
                    <p className="text-xs text-[var(--admin-text-dim)]">Email</p>
                    <p className="text-sm text-[var(--admin-text)]">{member.email || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-[var(--admin-text-dim)]" />
                  <div>
                    <p className="text-xs text-[var(--admin-text-dim)]">Téléphone</p>
                    <p className="text-sm text-[var(--admin-text)]">{member.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-[var(--admin-text-dim)]" />
                  <div>
                    <p className="text-xs text-[var(--admin-text-dim)]">Date de naissance</p>
                    <p className="text-sm text-[var(--admin-text)]">
                      {member.dateOfBirth ? formatDate(member.dateOfBirth) : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Activity size={16} className="text-[var(--admin-text-dim)]" />
                  <div>
                    <p className="text-xs text-[var(--admin-text-dim)]">Activité</p>
                    <p className="text-sm text-[var(--admin-text)]">{member.activity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Dumbbell size={16} className="text-[var(--admin-text-dim)]" />
                  <div>
                    <p className="text-xs text-[var(--admin-text-dim)]">Entraîneur assigné</p>
                    <p className="text-sm text-[var(--admin-text)]">
                      {member.assignedCoach ? member.assignedCoach.name : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Membership info */}
            <div className="admin-card rounded-xl p-6">
              <h3 className="mb-4 text-lg font-semibold text-[var(--admin-text)]">Abonnement</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Dumbbell size={16} className="text-[var(--admin-text-dim)]" />
                  <div>
                    <p className="text-xs text-[var(--admin-text-dim)]">Plan</p>
                    <p className="text-sm text-[var(--admin-text)]">
                      {member.plan ? member.plan.name : "Personnalisé"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-[var(--admin-text-dim)]" />
                  <div>
                    <p className="text-xs text-[var(--admin-text-dim)]">Date de début</p>
                    <p className="text-sm text-[var(--admin-text)]">
                      {formatDate(member.subscriptionStartDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-[var(--admin-text-dim)]" />
                  <div>
                    <p className="text-xs text-[var(--admin-text-dim)]">Durée</p>
                    <p className="text-sm text-[var(--admin-text)]">
                      {member.subscriptionDurationDays} jours
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-[var(--admin-text-dim)]" />
                  <div>
                    <p className="text-xs text-[var(--admin-text-dim)]">Date de fin</p>
                    <p className="text-sm text-[var(--admin-text)]">
                      {formatDate(endDate.toISOString())}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign size={16} className="text-[var(--admin-text-dim)]" />
                  <div>
                    <p className="text-xs text-[var(--admin-text-dim)]">Prix payé</p>
                    <p className="text-sm text-[var(--admin-text)]">{member.pricePaid} TND</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {member.notes && (
              <div className="admin-card rounded-xl p-6 lg:col-span-2">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--admin-text)]">
                  <FileText size={18} />
                  Notes
                </h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--admin-text-muted)]">
                  {member.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "payments" && (
          <div className="admin-animate-fade-in">
            {payments.length === 0 ? (
              <EmptyState
                icon={<DollarSign size={28} className="text-[var(--admin-text-dim)]" />}
                title="Aucun paiement"
                description="Aucun paiement enregistré pour ce membre"
              />
            ) : (
              <div className="admin-card overflow-x-auto rounded-2xl">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Date</th>
                      <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Montant</th>
                      <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Méthode</th>
                      <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Référence</th>
                      <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-3 text-[var(--admin-text)]">{formatDate(p.date)}</td>
                        <td className="px-4 py-3 font-medium text-[var(--admin-success)]">{p.amount} TND</td>
                        <td className="px-4 py-3 text-[var(--admin-text-muted)]">
                          {PAYMENT_METHODS[p.method] || p.method}
                        </td>
                        <td className="px-4 py-3 text-[var(--admin-text-muted)]">{p.reference || "—"}</td>
                        <td className="px-4 py-3 text-[var(--admin-text-muted)]">{p.description || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="admin-animate-fade-in">
            {attendances.length === 0 ? (
              <EmptyState
                icon={<CheckCircle size={28} className="text-[var(--admin-text-dim)]" />}
                title="Aucune présence"
                description="Aucun enregistrement de présence pour ce membre"
              />
            ) : (
              <div className="admin-card overflow-x-auto rounded-2xl">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Arrivée</th>
                      <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Départ</th>
                      <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Durée</th>
                      <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Méthode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendances.map((a) => (
                      <tr
                        key={a.id}
                        className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-3 text-[var(--admin-text)]">{formatDateTime(a.checkIn)}</td>
                        <td className="px-4 py-3 text-[var(--admin-text-muted)]">
                          {a.checkOut ? formatDateTime(a.checkOut) : "—"}
                        </td>
                        <td className="px-4 py-3 text-[var(--admin-text-muted)]">
                          {calcDuration(a.checkIn, a.checkOut) || "—"}
                        </td>
                        <td className="px-4 py-3 text-[var(--admin-text-muted)]">
                          {CHECKIN_METHODS[a.method] || a.method}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="admin-animate-fade-in">
            {feedbacks.length === 0 ? (
              <EmptyState
                icon={<Activity size={28} className="text-[var(--admin-text-dim)]" />}
                title="Aucune activité"
                description="Aucun feedback ou avis pour ce membre"
              />
            ) : (
              <div className="space-y-4">
                {feedbacks.map((f) => {
                  const fs = FEEDBACK_STATUS[f.status] || FEEDBACK_STATUS.PENDING;
                  return (
                    <div key={f.id} className="admin-card rounded-xl p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-[var(--admin-text)]">{f.subject}</h4>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${fs.bg} ${fs.text}`}>
                            {fs.label}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--admin-text-dim)]">
                          {formatDate(f.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--admin-text-muted)]">{f.message}</p>
                      {f.reply && (
                        <div className="mt-3 rounded-lg bg-[var(--admin-surface-hover)] p-3">
                          <p className="mb-1 text-xs font-medium text-[var(--admin-gold)]">Réponse</p>
                          <p className="text-sm text-[var(--admin-text-muted)]">{f.reply}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Modifier le membre">
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
              Nom complet *
            </label>
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="admin-input w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Téléphone *
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="admin-input w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Date de naissance
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Activité *
              </label>
              <select
                value={form.activity}
                onChange={(e) => setForm({ ...form, activity: e.target.value })}
                className="admin-select w-full"
              >
                <option value="">— Sélectionner —</option>
                {ACTIVITIES.map((a) => (
                  <option key={a.slug} value={a.nameFr}>
                    {a.nameFr}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Abonnement
              </label>
              <select
                value={form.planId}
                onChange={(e) => handlePlanChange(e.target.value)}
                className="admin-select w-full"
              >
                <option value="">— Personnalisé —</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.price} TND ({p.durationDays}j)
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Entraîneur assigné
              </label>
              <select
                value={form.assignedCoachId}
                onChange={(e) => setForm({ ...form, assignedCoachId: e.target.value })}
                className="admin-select w-full"
              >
                <option value="">— Aucun —</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Date de début
              </label>
              <input
                type="date"
                value={form.subscriptionStartDate}
                onChange={(e) => setForm({ ...form, subscriptionStartDate: e.target.value })}
                className="admin-input w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Durée (jours)
              </label>
              <select
                value={form.subscriptionDurationDays}
                onChange={(e) => setForm({ ...form, subscriptionDurationDays: e.target.value })}
                className="admin-select w-full"
              >
                <option value="30">30 jours</option>
                <option value="90">90 jours</option>
                <option value="180">180 jours</option>
                <option value="365">365 jours</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Prix payé (TND) *
              </label>
              <input
                type="number"
                step="0.01"
                value={form.pricePaid}
                onChange={(e) => setForm({ ...form, pricePaid: e.target.value })}
                className="admin-input w-full"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="admin-input w-full"
            />
          </div>
          <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
            <button
              onClick={() => setShowEdit(false)}
              className="admin-btn-ghost rounded-lg px-4 py-2.5 text-sm font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="admin-btn-gold rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Renew Confirm */}
      <Modal isOpen={showRenew} onClose={() => setShowRenew(false)} title="Renouveler l'abonnement">
        <p className="mb-6 text-sm text-[var(--admin-text-muted)]">
          L&apos;abonnement de <span className="font-medium text-[var(--admin-text)]">{member.fullName}</span> sera
          renouvelé à partir d&apos;aujourd&apos;hui.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowRenew(false)}
            className="admin-btn-ghost rounded-lg px-4 py-2.5 text-sm font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleRenew}
            disabled={saving}
            className="admin-btn-gold rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Renouvellement..." : "Confirmer"}
          </button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Supprimer le membre"
        message={`Cette action est irréversible. Voulez-vous vraiment supprimer ${member.fullName} ?`}
        loading={deleting}
      />
    </div>
  );
}
