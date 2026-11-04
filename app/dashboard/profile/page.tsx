"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import BackButton from "@/components/ui/BackButton";
import { FormField } from "@/components/ui/FormField";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { Select } from "@/components/ui/Select";
import { createClient } from "@/lib/supabase/client";
import { useFormState } from "@/lib/hooks/useFormState";
import { CATEGORY_OPTIONS, COUNTRY_OPTIONS } from "@/lib/options";
import { fetchProfile, updateProfile } from "@/lib/userData";

const EMPTY_FORM = {
  fullName: "",
  homeCountry: "",
  currentCountry: "",
  profession: "",
  dob: "",
};

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { form, setForm, formError, setFormError, handleChange, bindValue } =
    useFormState(EMPTY_FORM);
  const [status, setStatus] = useState<"loading" | "ready" | "saving">("loading");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?redirect=/dashboard/profile");
      return;
    }
    fetchProfile(user.id)
      .then((profile) => {
        setForm({
          fullName: profile?.full_name ?? "",
          homeCountry: profile?.home_country ?? "",
          currentCountry: profile?.current_country ?? "",
          profession: profile?.profession ?? "",
          dob: profile?.date_of_birth ?? "",
        });
      })
      .catch((err) => {
        console.error(err);
        setFormError("We couldn't load your profile. You can still edit and save it.");
      })
      .finally(() => setStatus("ready"));
  }, [user, loading, router, setForm, setFormError]);

  // Any edit hides the "Profile saved" message.
  useEffect(() => setSaved(false), [form]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setFormError("");

    const fullName = form.fullName.trim();
    if (!fullName) {
      setFormError("Please enter your name.");
      return;
    }

    try {
      setStatus("saving");
      await updateProfile(user.id, {
        full_name: fullName,
        home_country: form.homeCountry || null,
        current_country: form.currentCountry || null,
        profession: form.profession || null,
        date_of_birth: form.dob || null,
      });
      // Keep the navbar greeting (reads auth metadata) in sync.
      await createClient().auth.updateUser({ data: { full_name: fullName } });
      setSaved(true);
    } catch (err) {
      console.error(err);
      setFormError("Something went wrong saving your profile. Please try again.");
    } finally {
      setStatus("ready");
    }
  };

  if (loading || status === "loading") {
    return <LoadingCard message="Loading your profile…" />;
  }

  return (
    <div className="page-auth">
      <div className="auth-card wide">
        <BackButton href="/dashboard" label="Back to dashboard" />
        <h1>Edit profile</h1>
        <p className="auth-subtext">
          Your home country and profession are used to pre-fill new relocation plans.
        </p>

        {formError && <div className="form-error">{formError}</div>}
        {saved && (
          <div className="form-success" role="status">
            Profile saved. <Link href="/dashboard">Back to my dashboard</Link>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="Full name"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            autoComplete="name"
            required
          />
          <FormField label="Email" type="email" value={user?.email ?? ""} disabled />
          <Select
            label="Home country"
            value={form.homeCountry}
            onChange={bindValue("homeCountry")}
            options={COUNTRY_OPTIONS}
            placeholder="Select your home country"
          />
          <Select
            label="Where you live now"
            value={form.currentCountry}
            onChange={bindValue("currentCountry")}
            options={COUNTRY_OPTIONS}
            placeholder="Not specified"
          />
          <Select
            label="Profession (CSME category)"
            value={form.profession}
            onChange={bindValue("profession")}
            options={CATEGORY_OPTIONS}
            placeholder="Select your category"
          />
          <FormField
            label="Date of birth"
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="btn-primary full-width"
            disabled={status === "saving"}
          >
            {status === "saving" ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
