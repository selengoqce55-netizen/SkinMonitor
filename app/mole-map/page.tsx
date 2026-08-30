"use client";

import * as THREE from "three";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
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
  position: [number, number, number];
  records: MoleRecord[];
};

function Mannequin({
  onMark,
  modelPath,
}: {
  onMark: (position: [number, number, number]) => void;
  modelPath: string;
}) {
  const { scene } = useGLTF(modelPath);

  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const material = mesh.material as THREE.MeshStandardMaterial;

      material.color.set("#C58F78");
    }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();

    const point = event.point;

    onMark([point.x, point.y, point.z]);
  };

  return (
    <primitive
      object={scene}
      scale={2.5}
      position={[0, -1.7, 0]}
      onClick={handleClick}
    />
  );
}

function MoleMarker({
  position,
  onClick,
  highlighted,
}: {
  position: [number, number, number];
  onClick: () => void;
  highlighted: boolean;
}) {
  return (
    <mesh
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <sphereGeometry args={[highlighted ? 0.018 : 0.008, 16, 16]} />
      <meshStandardMaterial
        color={highlighted ? "#FF4F9A" : "#480A23"}
        emissive={highlighted ? "#FF4F9A" : "#000000"}
        emissiveIntensity={highlighted ? 1 : 0}
      />
    </mesh>
  );
}

export default function MoleMap() {
  const [moles, setMoles] = useState<Mole[]>([]);
  const [bodyType, setBodyType] = useState<"female" | "male">("female");
  const modelPath =
  bodyType === "female"
    ? "/models/free_human_body_base_mesh_female.glb"
    : "/models/human_body_base_mesh_male.glb";
  const [selectedMole, setSelectedMole] = useState<number | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(
    null
  );

  const [diameter, setDiameter] = useState("");
  const [shape, setShape] = useState("");
  const [symmetry, setSymmetry] = useState("");
  const [border, setBorder] = useState("");
  const [color, setColor] = useState("");
  const [elevation, setElevation] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /*
    This is the mole that came from the Changes page.

    Example:
    /mole-map?mole=123
  */

  const [highlightedMole, setHighlightedMole] = useState<number | null>(
    null
  );

  // =========================
  // LOCAL DATE
  // =========================

  const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const today = getToday();

  // =========================
  // CLEAR FORM
  // =========================

  const clearForm = () => {
    setDiameter("");
    setShape("");
    setSymmetry("");
    setBorder("");
    setColor("");
    setElevation("");
    setNotes("");
  };

  // =========================
  // LOAD MOLES
  // =========================

  useEffect(() => {
    const loadMoles = async () => {
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
        .select("id, x, y, z, records")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading moles:", error);
        setLoading(false);
        return;
      }

      const loadedMoles: Mole[] = (data || []).map((mole) => ({
        id: mole.id,
        position: [mole.x, mole.y, mole.z],
        records: Array.isArray(mole.records) ? mole.records : [],
      }));

      setMoles(loadedMoles);

      /*
        CHECK URL FOR HIGHLIGHTED MOLE

        If the user came from:
        /changes

        and clicked:
        Mole #2

        the URL becomes:
        /mole-map?mole=ID

        We read that ID here.
      */

      const params = new URLSearchParams(window.location.search);
      const moleIdFromUrl = params.get("mole");

      if (moleIdFromUrl) {
        const targetMoleId = Number(moleIdFromUrl);

        const targetMole = loadedMoles.find(
          (mole) => mole.id === targetMoleId
        );

        if (targetMole) {
          // Highlight the mole
          setHighlightedMole(targetMole.id);

          // Automatically open its details
          setSelectedMole(targetMole.id);

          // Show its latest record
          const latestRecord =
            targetMole.records[targetMole.records.length - 1];

          if (latestRecord) {
            setDiameter(latestRecord.diameter);
            setShape(latestRecord.shape);
            setSymmetry(latestRecord.symmetry);
            setBorder(latestRecord.border);
            setColor(latestRecord.color);
            setElevation(latestRecord.elevation);
            setNotes(latestRecord.notes);
          } else {
            clearForm();
          }
        }
      }

      setLoading(false);
    };

    loadMoles();
  }, []);

  // =========================
  // ADD NEW MOLE
  // =========================

  const addMole = async (
    position: [number, number, number]
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in first.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("moles")
      .insert({
        user_id: user.id,
        x: position[0],
        y: position[1],
        z: position[2],
        records: [],
      })
      .select("id, x, y, z, records")
      .single();

    if (error) {
      console.error("Error creating mole:", error);
      alert("Could not save the mole.");
      setSaving(false);
      return;
    }

    const newMole: Mole = {
      id: data.id,
      position: [data.x, data.y, data.z],
      records: Array.isArray(data.records)
        ? data.records
        : [],
    };

    setMoles((prev) => [...prev, newMole]);

    setSelectedMole(newMole.id);

    // Highlight newly created mole
    setHighlightedMole(newMole.id);

    clearForm();

    setIsEditing(true);
    setEditingRecordId(null);

    setSaving(false);
  };

  // =========================
  // SELECT MOLE
  // =========================

  const selectMole = (mole: Mole) => {
    setSelectedMole(mole.id);

    // Highlight selected mole
    setHighlightedMole(mole.id);

    setIsEditing(false);
    setEditingRecordId(null);

    const latestRecord =
      mole.records[mole.records.length - 1];

    if (latestRecord) {
      setDiameter(latestRecord.diameter);
      setShape(latestRecord.shape);
      setSymmetry(latestRecord.symmetry);
      setBorder(latestRecord.border);
      setColor(latestRecord.color);
      setElevation(latestRecord.elevation);
      setNotes(latestRecord.notes);
    } else {
      clearForm();
    }
  };

  // =========================
  // START UPDATE
  // =========================

  const startUpdate = () => {
    if (selectedMole === null) return;

    const mole = moles.find(
      (mole) => mole.id === selectedMole
    );

    if (!mole) return;

    const latestRecord =
      mole.records[mole.records.length - 1];

    if (latestRecord) {
      setDiameter(latestRecord.diameter);
      setShape(latestRecord.shape);
      setSymmetry(latestRecord.symmetry);
      setBorder(latestRecord.border);
      setColor(latestRecord.color);
      setElevation(latestRecord.elevation);
      setNotes(latestRecord.notes);
    } else {
      clearForm();
    }

    setIsEditing(true);
    setEditingRecordId(null);
  };

  // =========================
  // SAVE NEW RECORD
  // =========================

  const saveNewRecord = async () => {
    if (selectedMole === null) return;

    const mole = moles.find(
      (mole) => mole.id === selectedMole
    );

    if (!mole) return;

    const newRecord: MoleRecord = {
      id: Date.now(),
      date: today,
      diameter,
      shape,
      symmetry,
      border,
      color,
      elevation,
      notes,
    };

    const updatedRecords = [
      ...mole.records,
      newRecord,
    ];

    setSaving(true);

    const { error } = await supabase
      .from("moles")
      .update({
        records: updatedRecords,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedMole);

    if (error) {
      console.error("Error saving record:", error);
      alert("Could not save the record.");
      setSaving(false);
      return;
    }

    setMoles((prev) =>
      prev.map((mole) =>
        mole.id === selectedMole
          ? {
              ...mole,
              records: updatedRecords,
            }
          : mole
      )
    );

    setIsEditing(false);
    setEditingRecordId(null);
    setSaving(false);
  };

  // =========================
  // EDIT EXISTING RECORD
  // =========================

  const startEditRecord = (
    record: MoleRecord
  ) => {
    setEditingRecordId(record.id);

    setDiameter(record.diameter);
    setShape(record.shape);
    setSymmetry(record.symmetry);
    setBorder(record.border);
    setColor(record.color);
    setElevation(record.elevation);
    setNotes(record.notes);

    setIsEditing(true);
  };

  // =========================
  // SAVE EDITED RECORD
  // =========================

  const saveEditedRecord = async () => {
    if (
      selectedMole === null ||
      editingRecordId === null
    ) {
      return;
    }

    const mole = moles.find(
      (mole) => mole.id === selectedMole
    );

    if (!mole) return;

    const updatedRecords = mole.records.map(
      (record) =>
        record.id === editingRecordId
          ? {
              ...record,
              diameter,
              shape,
              symmetry,
              border,
              color,
              elevation,
              notes,
            }
          : record
    );

    setSaving(true);

    const { error } = await supabase
      .from("moles")
      .update({
        records: updatedRecords,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedMole);

    if (error) {
      console.error(
        "Error editing record:",
        error
      );
      alert("Could not save changes.");
      setSaving(false);
      return;
    }

    setMoles((prev) =>
      prev.map((mole) =>
        mole.id === selectedMole
          ? {
              ...mole,
              records: updatedRecords,
            }
          : mole
      )
    );

    setIsEditing(false);
    setEditingRecordId(null);
    setSaving(false);
  };

  // =========================
  // DELETE RECORD
  // =========================

  const deleteRecord = async (
    recordId: number
  ) => {
    if (selectedMole === null) return;

    const mole = moles.find(
      (mole) => mole.id === selectedMole
    );

    if (!mole) return;

    const updatedRecords = mole.records.filter(
      (record) => record.id !== recordId
    );

    setSaving(true);

    const { error } = await supabase
      .from("moles")
      .update({
        records: updatedRecords,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedMole);

    if (error) {
      console.error(
        "Error deleting record:",
        error
      );
      alert("Could not delete the record.");
      setSaving(false);
      return;
    }

    setMoles((prev) =>
      prev.map((mole) =>
        mole.id === selectedMole
          ? {
              ...mole,
              records: updatedRecords,
            }
          : mole
      )
    );

    if (editingRecordId === recordId) {
      setEditingRecordId(null);
      setIsEditing(false);
      clearForm();
    }

    setSaving(false);
  };
const deleteAllMoles = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Please log in first.");
    return;
  }

  const confirmed = window.confirm(
    "Delete ALL marked moles and their records?"
  );

  if (!confirmed) return;

  setSaving(true);

  const { error } = await supabase
    .from("moles")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting all moles:", error);
    alert("Could not delete all moles.");
    setSaving(false);
    return;
  }

  setMoles([]);
  setSelectedMole(null);
  setHighlightedMole(null);
  setIsEditing(false);
  setEditingRecordId(null);
  clearForm();

  setSaving(false);
};
  // =========================
  // DELETE ENTIRE MOLE
  // =========================

  const deleteMole = async () => {
    if (selectedMole === null) return;

    const confirmed = window.confirm(
      "Delete this mole and all of its records?"
    );

    if (!confirmed) return;

    setSaving(true);

    const { error } = await supabase
      .from("moles")
      .delete()
      .eq("id", selectedMole);

    if (error) {
      console.error(
        "Error deleting mole:",
        error
      );
      alert("Could not delete the mole.");
      setSaving(false);
      return;
    }

    setMoles((prev) =>
      prev.filter(
        (mole) => mole.id !== selectedMole
      )
    );

    setSelectedMole(null);
    setHighlightedMole(null);
    setIsEditing(false);
    setEditingRecordId(null);

    clearForm();

    setSaving(false);
  };

  // =========================
  // SELECTED MOLE DATA
  // =========================

  const selectedMoleData = moles.find(
    (mole) => mole.id === selectedMole
  );

  const latestRecord =
    selectedMoleData &&
    selectedMoleData.records[
      selectedMoleData.records.length - 1
    ];

  // =========================
  // RETURN
  // =========================

  return (
    <main className="min-h-screen bg-[#FFF5F9] text-[#480A23] px-6 py-12">
<nav className="mx-auto mb-8 flex max-w-6xl justify-center gap-3">
  <Link
    href="/dashboard"
    className="rounded-full bg-white px-5 py-2 text-sm font-medium hover:bg-[#9C526F] hover:text-white"
  >
    Dashboard
  </Link>

  <Link
    href="/mole-map"
    className="rounded-full bg-[#480A23] px-5 py-2 text-sm font-medium text-white"
  >
    My Mole Map
  </Link>

  <Link
    href="/change"
    className="rounded-full bg-white px-5 py-2 text-sm font-medium hover:bg-[#9C526F] hover:text-white"
  >
    Changes
  </Link>

  <Link
    href="/uv-exposure"
    className="rounded-full bg-white px-5 py-2 text-sm font-medium hover:bg-[#9C526F] hover:text-white"
  >
    UV Exposure
  </Link>

  <Link
    href="/meaning-of-project"
    className="rounded-full bg-white px-5 py-2 text-sm font-medium hover:bg-[#9C526F] hover:text-white"
  >
    Meaning of Project
  </Link>
</nav>
      {/* HEADER */}

      <h1 className="text-center text-5xl font-semibold">
        My Mole Map
      </h1>

      <p className="mt-4 text-center text-[#480A23]/70">
        Click on the body to mark a mole • Click a mole to view its record • Left-click and drag to rotate • Right-click and drag to move the view
      </p>

      {loading && (
        <p className="mt-6 text-center text-sm text-[#480A23]/60">
          Loading your mole map...
        </p>
      )}

      {saving && (
        <p className="mt-2 text-center text-sm text-[#9C526F]">
          Saving...
        </p>
      )}

      {/* MAIN AREA */}

      <div className="mx-auto mt-10 flex max-w-6xl gap-6">

        {/* 3D MODEL */}
<div className="relative h-[600px] flex-1 overflow-hidden rounded-3xl bg-white">

  {/* BODY TYPE BUTTONS */}

  <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 gap-2">

    <button
      type="button"
      onClick={() => setBodyType("female")}
      className={`rounded-full px-5 py-2 text-sm font-medium shadow-sm ${
        bodyType === "female"
          ? "bg-[#480A23] text-white"
          : "bg-white text-[#480A23]"
      }`}
    >
      Female
    </button>

    <button
      type="button"
      onClick={() => setBodyType("male")}
      className={`rounded-full px-5 py-2 text-sm font-medium shadow-sm ${
        bodyType === "male"
          ? "bg-[#480A23] text-white"
          : "bg-white text-[#480A23]"
      }`}
    >
      Male
    </button>

  </div>

  {/* 3D CANVAS */}

  <Canvas
    camera={{
      position: [0, 1, 7],
      fov: 45,
    }}
  >

    <ambientLight intensity={1.5} />

    <directionalLight
      position={[5, 5, 5]}
      intensity={2}
    />

    <Mannequin
      onMark={addMole}
      modelPath={modelPath}
    />

    {moles.map((mole) => (
      <MoleMarker
        key={mole.id}
        position={mole.position}
        highlighted={highlightedMole === mole.id}
        onClick={() => selectMole(mole)}
      />
    ))}

    <OrbitControls
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={2}
      maxDistance={12}
    />

  </Canvas>

</div>
        {/* SIDE PANEL */}

        {selectedMole !== null &&
          selectedMoleData && (

          <div className="w-[390px] rounded-3xl bg-white p-6 shadow-sm">

            {/* HEADER */}

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-semibold">
                  Mole Details
                </h2>

                <p className="mt-1 text-sm text-[#480A23]/60">
                  Mole #
                  {moles.findIndex(
                    (mole) =>
                      mole.id === selectedMole
                  ) + 1}
                </p>

              </div>

              <button
                onClick={() => {
                  setSelectedMole(null);
                  setHighlightedMole(null);
                  setIsEditing(false);
                  setEditingRecordId(null);
                }}
                className="text-2xl text-[#480A23]/50 hover:text-[#480A23]"
              >
                ×
              </button>

            </div>

            {/* EDIT / NEW RECORD FORM */}

            {isEditing && (

              <div className="mt-6">

                <div className="rounded-2xl bg-[#FFF5F9] p-4">

                  <p className="text-xs uppercase tracking-wide text-[#480A23]/50">

                    {editingRecordId !== null
                      ? "Editing record"
                      : "New record"}

                  </p>

                  <p className="mt-1 font-medium">

                    {editingRecordId !== null
                      ? selectedMoleData.records.find(
                          (record) =>
                            record.id ===
                            editingRecordId
                        )?.date
                      : today}

                  </p>

                </div>

                {/* DIAMETER */}

                <label className="mt-5 block text-sm font-medium">
                  Diameter (mm)
                </label>

                <input
                  type="number"
                  step="0.1"
                  value={diameter}
                  onChange={(e) =>
                    setDiameter(e.target.value)
                  }
                  placeholder="e.g. 4.2"
                  className="mt-2 w-full rounded-xl border border-[#480A23]/20 px-4 py-3 outline-none focus:border-[#9C526F]"
                />

                {/* SHAPE */}

                <label className="mt-5 block text-sm font-medium">
                  Shape
                </label>

                <select
                  value={shape}
                  onChange={(e) =>
                    setShape(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#480A23]/20 px-4 py-3"
                >
                  <option value="">
                    Select shape
                  </option>

                  <option value="Round">
                    Round
                  </option>

                  <option value="Oval">
                    Oval
                  </option>

                  <option value="Irregular">
                    Irregular
                  </option>
                </select>

                {/* SYMMETRY */}

                <label className="mt-5 block text-sm font-medium">
                  Symmetry
                </label>

                <select
                  value={symmetry}
                  onChange={(e) =>
                    setSymmetry(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#480A23]/20 px-4 py-3"
                >
                  <option value="">
                    Select symmetry
                  </option>

                  <option value="Symmetric">
                    Symmetric
                  </option>

                  <option value="Slightly asymmetric">
                    Slightly asymmetric
                  </option>

                  <option value="Asymmetric">
                    Asymmetric
                  </option>
                </select>

                {/* BORDER */}

                <label className="mt-5 block text-sm font-medium">
                  Border
                </label>

                <select
                  value={border}
                  onChange={(e) =>
                    setBorder(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#480A23]/20 px-4 py-3"
                >
                  <option value="">
                    Select border
                  </option>

                  <option value="Regular">
                    Regular
                  </option>

                  <option value="Slightly irregular">
                    Slightly irregular
                  </option>

                  <option value="Irregular">
                    Irregular
                  </option>
                </select>

                {/* COLOR */}

                <label className="mt-5 block text-sm font-medium">
                  Color
                </label>

                <select
                  value={color}
                  onChange={(e) =>
                    setColor(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#480A23]/20 px-4 py-3"
                >
                  <option value="">
                    Select color
                  </option>

                  <option value="Light brown">
                    Light brown
                  </option>

                  <option value="Brown">
                    Brown
                  </option>

                  <option value="Dark brown">
                    Dark brown
                  </option>

                  <option value="Multiple colors">
                    Multiple colors
                  </option>
                </select>

                {/* ELEVATION */}

                <label className="mt-5 block text-sm font-medium">
                  Elevation
                </label>

                <select
                  value={elevation}
                  onChange={(e) =>
                    setElevation(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#480A23]/20 px-4 py-3"
                >
                  <option value="">
                    Select elevation
                  </option>

                  <option value="Flat">
                    Flat
                  </option>

                  <option value="Raised">
                    Raised
                  </option>
                </select>

                {/* NOTES */}

                <label className="mt-5 block text-sm font-medium">
                  Notes
                </label>

                <textarea
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                  placeholder="Add notes about this mole..."
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-[#480A23]/20 px-4 py-3 outline-none focus:border-[#9C526F]"
                />

                {/* SAVE */}

                <button
                  onClick={
                    editingRecordId !== null
                      ? saveEditedRecord
                      : saveNewRecord
                  }
                  disabled={saving}
                  className="mt-6 w-full rounded-xl bg-[#480A23] px-4 py-3 font-medium text-white hover:bg-[#5c1231] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingRecordId !== null
                    ? "Save Changes"
                    : "Save Record"}
                </button>

                {/* CANCEL */}

                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingRecordId(null);
                  }}
                  className="mt-3 w-full rounded-xl border border-[#480A23]/20 px-4 py-3"
                >
                  Cancel
                </button>

              </div>
            )}

            {/* VIEW RECORDS */}

            {!isEditing && latestRecord && (

              <>

                {/* LAST UPDATED */}

                <div className="mt-6 rounded-2xl bg-[#FFF5F9] p-4">

                  <p className="text-xs uppercase tracking-wide text-[#480A23]/50">
                    Last recorded
                  </p>

                  <p className="mt-1 font-medium">
                    {latestRecord.date}
                  </p>

                </div>

                {/* CURRENT CHARACTERISTICS */}

                <div className="mt-5 space-y-3 text-sm">

                  <div className="flex justify-between">
                    <span className="text-[#480A23]/60">
                      Diameter
                    </span>

                    <span className="font-medium">
                      {latestRecord.diameter || "—"} mm
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#480A23]/60">
                      Shape
                    </span>

                    <span className="font-medium">
                      {latestRecord.shape || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#480A23]/60">
                      Symmetry
                    </span>

                    <span className="font-medium">
                      {latestRecord.symmetry || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#480A23]/60">
                      Border
                    </span>

                    <span className="font-medium">
                      {latestRecord.border || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#480A23]/60">
                      Color
                    </span>

                    <span className="font-medium">
                      {latestRecord.color || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#480A23]/60">
                      Elevation
                    </span>

                    <span className="font-medium">
                      {latestRecord.elevation || "—"}
                    </span>
                  </div>

                </div>

                {/* NOTES */}

                {latestRecord.notes && (

                  <div className="mt-5 rounded-2xl border border-[#480A23]/10 p-4">

                    <p className="text-xs uppercase tracking-wide text-[#480A23]/50">
                      Notes
                    </p>

                    <p className="mt-1 text-sm">
                      {latestRecord.notes}
                    </p>

                  </div>

                )}

                {/* HISTORY */}

                <div className="mt-6">

                  <div className="flex items-center justify-between">

                    <h3 className="font-semibold">
                      History
                    </h3>

                    <span className="text-xs text-[#480A23]/50">
                      {selectedMoleData.records.length}{" "}
                      record
                      {selectedMoleData.records.length !== 1
                        ? "s"
                        : ""}
                    </span>

                  </div>

                  <div className="mt-3 max-h-[230px] space-y-2 overflow-y-auto">

                    {selectedMoleData.records
                      .slice()
                      .reverse()
                      .map((record) => (

                        <div
                          key={record.id}
                          className="rounded-xl bg-[#FFF5F9] p-3"
                        >

                          <div className="flex items-center justify-between">

                            <p className="text-sm font-medium">
                              {record.date}
                            </p>

                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                  startEditRecord(record)
                                }
                                className="text-xs font-medium text-[#9C526F] hover:underline"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  deleteRecord(record.id)
                                }
                                className="text-xs font-medium text-red-500 hover:underline"
                              >
                                Delete
                              </button>

                            </div>

                          </div>

                          <p className="mt-1 text-xs text-[#480A23]/60">

                            {record.diameter
                              ? `${record.diameter} mm`
                              : "No diameter"}

                            {" · "}

                            {record.shape ||
                              "No shape"}

                            {" · "}

                            {record.symmetry ||
                              "No symmetry"}

                          </p>

                        </div>

                      ))}

                  </div>

                </div>

                {/* UPDATE */}

                <button
                  onClick={startUpdate}
                  className="mt-6 w-full rounded-xl bg-[#480A23] px-4 py-3 font-medium text-white hover:bg-[#5c1231]"
                >
                  Update Mole
                </button>

                {/* DELETE MOLE */}

                <button
                  onClick={deleteMole}
                  className="mt-3 w-full rounded-xl border border-red-200 px-4 py-3 text-red-600 hover:bg-red-50"
                >
                  Delete Mole
                </button>

              </>

            )}

            {/* NO RECORD YET */}

            {!isEditing &&
              selectedMoleData.records.length === 0 && (

                <div className="mt-6">

                  <p className="text-sm text-[#480A23]/60">
                    This mole has not been recorded yet.
                  </p>

                  <button
                    onClick={startUpdate}
                    className="mt-5 w-full rounded-xl bg-[#480A23] px-4 py-3 font-medium text-white"
                  >
                    Add First Record
                  </button>

                  <button
                    onClick={deleteMole}
                    className="mt-3 w-full rounded-xl border border-red-200 px-4 py-3 text-red-600 hover:bg-red-50"
                  >
                    Delete Mole
                  </button>

                </div>

              )}

          </div>
        )}

      </div>

      {/* MOLE COUNT */}

      <div className="mx-auto mt-6 max-w-6xl rounded-2xl bg-white p-5">

        <h2 className="text-xl font-semibold">
          Marked Moles
        </h2>

        <p className="mt-2 text-[#480A23]/70">

          {moles.length === 0
            ? "No moles marked yet."
            : `${moles.length} mole${
                moles.length > 1 ? "s" : ""
              } marked.`}

        </p>
        <button
  onClick={deleteAllMoles}
  disabled={saving || moles.length === 0}
  className="mt-4 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
>
  Delete All Moles
</button>

      </div>

    </main>
  );
}