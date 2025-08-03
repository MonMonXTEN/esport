/* app/tournaments/new/page.tsx  — ไม่ใช้ TeamSelect แล้ว */
"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { toast } from "sonner";

/* ---------------- schema ---------------- */
const schema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อทัวร์นาเมนต์"),
  teamIds: z
    .array(z.number().int().positive())
    .min(2, "ต้องเลือกอย่างน้อย 2 ทีม")
    .max(32, "เลือกได้สูงสุด 32 ทีม"),
});
type FormData = z.infer<typeof schema>;

type Team = { id: number; name: string };

/* --------------- page ------------------- */
export default function CreateTournamentPage() {
  const { register, handleSubmit, setValue, watch, formState } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: { name: "", teamIds: [] },
    });
  const { errors } = formState;

  /* --- โหลดรายชื่อทีมครั้งเดียว --- */
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((data: Team[]) => setTeams(data))
      .catch(() => toast.error("โหลดทีมไม่สำเร็จ"))
      .finally(() => setLoadingTeams(false));
  }, []);

  const teamIds = watch("teamIds");

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("/api/tournaments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("สร้างทัวร์นาเมนต์สำเร็จ");
    } catch (e: unknown) {
      toast.error((e as Error).message || "สร้างไม่สำเร็จ");
    }
  };

  /* --- แปลงทีมเป็น options สำหรับ MultiSelect --- */
  const teamOptions = teams.map((t) => ({
    label: t.name,
    value: t.id.toString(),
  }));

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex max-w-lg flex-col gap-6 p-6"
    >
      <div className="space-y-2">
        <label className="block text-sm font-medium">ชื่อทัวร์นาเมนต์</label>
        <Input
          placeholder="ROV Campus Cup 2025"
          {...register("name")}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          เลือกทีม (สูงสุด 32)
        </label>
        {loadingTeams ? (
          <p className="text-sm text-muted-foreground">กำลังโหลดทีม…</p>
        ) : (
          <MultiSelect
            variant="secondary"
            options={teamOptions}
            defaultValue={teamIds.map(String)}
            onValueChange={(ids) => {
              setValue("teamIds", ids.map(Number), { shouldValidate: true })
            }}
            maxCount={3}
            placeholder="เลือกทีม"
            className="w-full"

          />
        )}
        {errors.teamIds && (
          <p className="text-sm text-destructive">{errors.teamIds.message}</p>
        )}
      </div>

      <Button type="submit">สร้างทัวร์นาเมนต์</Button>
    </form>
    
  );
}
