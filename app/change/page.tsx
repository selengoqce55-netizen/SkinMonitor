"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type MoleRecord = {
  id: number;
  date: string;
  diameter: string;
  shape: string;
  symmetry: string;
  border: string;
  color: string;
  elevation: string;
  notes: string;
};

type Mole = {
  id: number;
  records: MoleRecord[];
};

type Change = {
  moleId: number;
  moleNumber: number;
  changes: string[];
};

export default function ChangePage() {
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChanges = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("moles")
        .select("id, records")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading changes:", error);
        setLoading(false);
        return;
      }

      const detectedChanges: Change[] = [];

      (data || []).forEach((mole: Mole, index: number) => {
        const records = Array.isArray(mole.records)
          ? mole.records
          : [];

        if (records.length < 2) return;

        const previous =
          records[records.length - 2];

        const latest =
          records[records.length - 1];

        const moleChanges: string[] = [];

        if (previous.diameter !== latest.diameter) {
          moleChanges.push(
            `Diameter: ${previous.diameter || "—"} → ${
              latest.diameter || "—"
            } mm`
          );
        }

        if (previous.shape !== latest.shape) {
          moleChanges.push(
            `Shape: ${previous.shape || "—"} → ${
              latest.shape || "—"
            }`
          );
        }

        if (previous.symmetry !== latest.symmetry) {
          moleChanges.push(
            `Symmetry: ${previous.symmetry || "—"} → ${
              latest.symmetry || "—"
            }`
          );
        }

        if (previous.border !== latest.border) {
          moleChanges.push(
            `Border: ${previous.border || "—"} → ${
              latest.border || "—"
            }`
          );
        }

        if (previous.color !== latest.color) {
          moleChanges.push(
            `Color: ${previous.color || "—"} → ${
              latest.color || "—"
            }`
          );
        }

        if (previous.elevation !== latest.elevation) {
          moleChanges.push(
            `Elevation: ${previous.elevation || "—"} → ${
              latest.elevation || "—"
            }`
          );
        }

        if (moleChanges.length > 0) {
          detectedChanges.push({
            moleId: mole.id,
            moleNumber: index + 1,
            changes: moleChanges,
          });
        }
      });

      setChanges(detectedChanges);
      setLoading(false);
    };

    loadChanges();
  }, []);

  return (
    <main className="min-h-screen bg-[#FFF5F9] text-[#480A23] px-6 py-12">

      {/* HEADER */}

      <div className="mx-auto max-w-4xl text-center">

        <h1 className="text-5xl font-semibold">
          Change Analysis
        </h1>

        <p className="mt-4 text-[#480A23]/70">
          Review changes between your latest mole records.
        </p>

      </div>

      {/* CONTENT */}

      <div className="mx-auto mt-12 max-w-4xl">

        {loading && (
          <div className="rounded-3xl bg-white p-8 text-center">
            <p className="text-[#480A23]/60">
              Checking your records...
            </p>
          </div>
        )}

        {!loading && changes.length === 0 && (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">

            <h2 className="text-2xl font-semibold">
              No changes detected
            </h2>

            <p className="mt-3 text-[#480A23]/60">
              There are no differences between your latest
              mole records.
            </p>

            <Link
              href="/mole-map"
              className="mt-6 inline-block rounded-full bg-[#9C526F] px-8 py-3 font-medium text-white hover:bg-[#480A23]"
            >
              View My Mole Map
            </Link>

          </div>
        )}

        {!loading && changes.length > 0 && (
          <div className="space-y-5">

            {changes.map((change) => (

              <Link
                key={change.moleId}
                href={`/mole-map?mole=${change.moleId}`}
                className="block rounded-3xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm font-medium uppercase tracking-wide text-[#9C526F]">
                      Change Detected
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold">
                      Mole #{change.moleNumber}
                    </h2>

                  </div>

                  <span className="text-2xl text-[#480A23]/40">
                    →
                  </span>

                </div>

                <div className="mt-5 space-y-2">

                  {change.changes.map(
                    (item, changeIndex) => (

                      <div
                        key={changeIndex}
                        className="rounded-xl bg-[#FFF5F9] px-4 py-3 text-sm"
                      >
                        {item}
                      </div>

                    )
                  )}

                </div>

                <p className="mt-5 text-sm font-medium text-[#9C526F]">
                  View this mole on My Mole Map →
                </p>

              </Link>

            ))}

          </div>
        )}

      </div>

    </main>
  );
}