"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type UploadType = "mcq" | "revision" | "chapters";
type UploadMethod = "paste" | "file";
type PageMode = "upload" | "edit";

interface Chapter {
  id: number;
  chapterNumber: number;
  titleEn: string;
  titleMr: string;
}

interface Revision {
  id: number;
  chapterId: number;
  chapterNumber?: number;
  titleEn: string;
  titleMr: string;
  contentEn: string | null;
  contentMr: string | null;
  imageUrl: string | null;
  qaJson: any;
  order: number;
}

export default function BulkUploadPage() {
  const router = useRouter();
  const [uploadType, setUploadType] = useState<UploadType>("revision");
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>("paste");
  const [file, setFile] = useState<File | null>(null);
  const [jsonContent, setJsonContent] = useState("");
  const [resetIds, setResetIds] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit mode states
  const [pageMode, setPageMode] = useState<PageMode>("upload");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const [editedJson, setEditedJson] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/verify");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        
        const data = await res.json();
        if (!data.user?.isAdmin) {
          router.push("/dashboard");
          return;
        }
      } catch (err) {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  // Load chapters when switching to edit mode
  useEffect(() => {
    if (pageMode === "edit") {
      loadChapters();
    }
  }, [pageMode]);

  // Load revisions when chapter is selected
  useEffect(() => {
    if (selectedChapter && pageMode === "edit") {
      loadRevisions();
    }
  }, [selectedChapter, pageMode]);

  const loadChapters = async () => {
    try {
      const res = await fetch("/api/admin/chapters");
      if (!res.ok) throw new Error("Failed to load chapters");
      const data = await res.json();
      setChapters(data.chapters || []);
    } catch (err) {
      setError("Failed to load chapters");
      console.error(err);
    }
  };

  const loadRevisions = async () => {
    if (!selectedChapter) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/users/revision?chapterId=${selectedChapter}`);
      if (!res.ok) throw new Error("Failed to load revisions");
      
      const data = await res.json();
      setRevisions(data.revisions || []);
      
      if (data.revisions && data.revisions.length > 0) {
        selectRevisionForEdit(data.revisions[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load revisions");
    } finally {
      setLoading(false);
    }
  };

  const selectRevisionForEdit = (revision: Revision) => {
    setSelectedRevision(revision);
    
    // Get chapter number
    const chapter = chapters.find(ch => ch.id === revision.chapterId);
    
    // Create clean JSON for editing (without DB IDs)
    const cleanJson = {
      chapterNumber: chapter?.chapterNumber || revision.chapterNumber,
      titleEn: revision.titleEn,
      titleMr: revision.titleMr,
      contentEn: revision.contentEn,
      contentMr: revision.contentMr,
      imageUrl: revision.imageUrl,
      qaJson: revision.qaJson,
      order: revision.order
    };
    
    setEditedJson(JSON.stringify(cleanJson, null, 2));
  };

  const handleUpdateRevision = async () => {
    setError("");
    setSuccess("");

    if (!editedJson.trim()) {
      setError("JSON content is empty");
      return;
    }

    if (!selectedRevision) {
      setError("No revision selected");
      return;
    }

    if (!confirm("Are you sure you want to update this revision content?")) {
      return;
    }

    try {
      setLoading(true);

      // Validate JSON
      let parsedData;
      try {
        parsedData = JSON.parse(editedJson);
      } catch (parseError) {
        throw new Error(`Invalid JSON: ${parseError instanceof Error ? parseError.message : "Parse failed"}`);
      }

      // Update the existing revision (no delete needed!)
      const res = await fetch(`/api/admin/revision/${selectedRevision.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      setSuccess("✅ Revision updated successfully!");
      
      // Reload revisions to show updated content
      await loadRevisions();
      
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please select a file");
      return;
    }

    // Validate file type
    if (uploadType === "mcq") {
      const validExts = [".csv", ".xlsx", ".xls"];
      const hasValidExt = validExts.some((ext) => file.name.endsWith(ext));
      if (!hasValidExt) {
        setError("Please upload a CSV or Excel file for MCQ questions");
        return;
      }
    } else {
      if (!file.name.endsWith(".json")) {
        setError(`Please upload a JSON file for ${uploadType}`);
        return;
      }
    }

    // Confirm if reset is enabled
    if (resetIds) {
      const warningMessages = {
        chapters:
          "⚠️ WARNING: This will DELETE ALL chapters, questions, and revision content!\n\nAll data will be permanently lost and IDs will reset to 1.\n\nAre you absolutely sure?",
        revision:
          "⚠️ WARNING: This will DELETE ALL revision content!\n\nAll revision notes will be permanently lost and IDs will reset to 1.\n\nAre you absolutely sure?",
        mcq:
          "⚠️ WARNING: This will DELETE ALL questions!\n\nAll MCQ questions will be permanently lost and IDs will reset to 1.\n\nAre you absolutely sure?",
      };

      if (!confirm(warningMessages[uploadType])) {
        return;
      }
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", uploadType);
      formData.append("resetIds", resetIds.toString());

      const res = await fetch("/api/admin/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Format success message with details
      let successMsg = data.message || "Upload successful";

      if (data.details) {
        const details = [];
        if (data.details.inserted !== undefined) {
          details.push(`Inserted: ${data.details.inserted}`);
        }
        if (data.details.insertedOrUpdated !== undefined) {
          details.push(`Inserted/Updated: ${data.details.insertedOrUpdated}`);
        }
        if (data.details.skipped !== undefined && data.details.skipped > 0) {
          details.push(`Skipped: ${data.details.skipped}`);
        }
        if (data.details.availableChapters) {
          details.push(
            `Available Chapters: ${data.details.availableChapters.join(", ")}`
          );
        }

        if (details.length > 0) {
          successMsg += "\n\n" + details.join("\n");
        }

        // Show skipped items if any
        if (
          data.details.skippedItems &&
          data.details.skippedItems.length > 0
        ) {
          successMsg += "\n\nSkipped Items:\n";
          data.details.skippedItems.forEach((item: any, idx: number) => {
            successMsg += `${idx + 1}. ${item.title || item.titleEn || "Unknown"}: ${
              item.reason
            }\n`;
          });
        }
      }

      setSuccess(successMsg);
      setFile(null);
      setJsonContent("");

      // Reset file input
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Clear success message after 10 seconds
      setTimeout(() => setSuccess(""), 10000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleJsonPaste = async () => {
    setError("");
    setSuccess("");

    if (!jsonContent.trim()) {
      setError("Please paste JSON content");
      return;
    }

    // Confirm if reset is enabled
    if (resetIds) {
      const warningMessages = {
        chapters:
          "⚠️ WARNING: This will DELETE ALL chapters, questions, and revision content!\n\nAll data will be permanently lost and IDs will reset to 1.\n\nAre you absolutely sure?",
        revision:
          "⚠️ WARNING: This will DELETE ALL revision content!\n\nAll revision notes will be permanently lost and IDs will reset to 1.\n\nAre you absolutely sure?",
        mcq:
          "⚠️ WARNING: This will DELETE ALL questions!\n\nAll MCQ questions will be permanently lost and IDs will reset to 1.\n\nAre you absolutely sure?",
      };

      if (!confirm(warningMessages[uploadType])) {
        return;
      }
    }

    try {
      setLoading(true);

      // Validate JSON first
      let parsedData;
      try {
        parsedData = JSON.parse(jsonContent);
      } catch (parseError) {
        throw new Error(`Invalid JSON: ${parseError instanceof Error ? parseError.message : "Parse failed"}`);
      }

      const res = await fetch("/api/admin/bulk-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: parsedData,
          type: uploadType,
          resetIds: resetIds.toString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Format success message with details
      let successMsg = data.message || "Upload successful";

      if (data.details) {
        const details = [];
        if (data.details.inserted !== undefined) {
          details.push(`Inserted: ${data.details.inserted}`);
        }
        if (data.details.insertedOrUpdated !== undefined) {
          details.push(`Inserted/Updated: ${data.details.insertedOrUpdated}`);
        }
        if (data.details.converted !== undefined && data.details.converted > 0) {
          details.push(`Auto-converted: ${data.details.converted}`);
        }
        if (data.details.skipped !== undefined && data.details.skipped > 0) {
          details.push(`Skipped: ${data.details.skipped}`);
        }
        if (data.details.availableChapters) {
          details.push(
            `Available Chapters: ${data.details.availableChapters.join(", ")}`
          );
        }

        if (details.length > 0) {
          successMsg += "\n\n" + details.join("\n");
        }

        // Show skipped items if any
        if (
          data.details.skippedItems &&
          data.details.skippedItems.length > 0
        ) {
          successMsg += "\n\nSkipped Items:\n";
          data.details.skippedItems.forEach((item: any, idx: number) => {
            successMsg += `${idx + 1}. ${item.title || item.titleEn || "Unknown"}: ${
              item.reason
            }\n`;
          });
        }
      }

      setSuccess(successMsg);
      setJsonContent("");
      setFile(null);

      // Clear success message after 10 seconds
      setTimeout(() => setSuccess(""), 10000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const acceptTypes =
    uploadType === "mcq"
      ? ".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      : "application/json";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Bulk Upload & Edit</h1>
        <p className="text-gray-600">
          Upload new content or edit existing revision notes
        </p>
      </div>

      {/* MODE TOGGLE */}
      <div className="mb-6">
        <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
          <button
            onClick={() => {
              setPageMode("upload");
              setError("");
              setSuccess("");
            }}
            className={`px-6 py-2 rounded-md font-medium transition ${
              pageMode === "upload"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            📤 Upload New Content
          </button>
          <button
            onClick={() => {
              setPageMode("edit");
              setError("");
              setSuccess("");
            }}
            className={`px-6 py-2 rounded-md font-medium transition ${
              pageMode === "edit"
                ? "bg-green-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            ✏️ Edit Existing Revision
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 mr-2 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <pre className="whitespace-pre-wrap font-sans">{success}</pre>
          </div>
        </div>
      )}

      {/* UPLOAD MODE */}
      {pageMode === "upload" && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Upload Type Selector */}
          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-3">
              Select Upload Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setUploadType("chapters")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  uploadType === "chapters"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold">📚 Chapters</div>
                <div className="text-xs text-gray-600 mt-1">JSON format</div>
              </button>

              <button
                onClick={() => {
                  setUploadType("mcq");
                  setUploadMethod("file");  // ← Add this line
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  uploadType === "mcq"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold">❓ MCQ Questions</div>
                <div className="text-xs text-gray-600 mt-1">CSV / Excel</div>
              </button>

              <button
                onClick={() => setUploadType("revision")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  uploadType === "revision"
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold">📝 Revision Notes</div>
                <div className="text-xs text-gray-600 mt-1">JSON format</div>
              </button>
            </div>
          </div>

          {/* Upload Method Tabs (only for JSON types) */}
          {uploadType !== "mcq" && (
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setUploadMethod("paste")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      uploadMethod === "paste"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    📋 Paste JSON Directly
                  </button>
                  <button
                    onClick={() => setUploadMethod("file")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      uploadMethod === "file"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    📁 Upload File
                  </button>
                </nav>
              </div>
            </div>
          )}

          {/* Paste JSON Content */}
          {uploadMethod === "paste" && uploadType !== "mcq" && (
            <div className="mb-6">
              <label className="block font-semibold text-gray-700 mb-2">
                Paste JSON Content
              </label>
              <textarea
                value={jsonContent}
                onChange={(e) => {
                  setJsonContent(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder={`Paste your JSON here... Example:\n{\n  "chapterNumber": 1,\n  "titleEn": "Introduction to RERA",\n  "titleMr": "रेरा परिचय",\n  ...\n}`}
                className="w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
              />
              <p className="mt-2 text-sm text-gray-500">
                Characters: {jsonContent.length}
              </p>
            </div>
          )}

          {/* File Upload */}
          {(uploadMethod === "file" || uploadType === "mcq") && (
            <div className="mb-6">
              <label className="block font-semibold text-gray-700 mb-2">
                Choose File
              </label>
              <input
                type="file"
                accept={acceptTypes}
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setError("");
                  setSuccess("");
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: <span className="font-medium">{file.name}</span> (
                  {(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          )}

          {/* Reset IDs Warning */}
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={resetIds}
                onChange={(e) => setResetIds(e.target.checked)}
                className="w-5 h-5 mt-1 text-yellow-600 focus:ring-yellow-500"
              />
              <div className="flex-1">
                <span className="font-semibold text-yellow-800 block mb-1">
                  ⚠️ Delete existing data and reset IDs to 1
                </span>
                <p className="text-sm text-yellow-700">
                  {uploadType === "chapters" &&
                    "WARNING: This will delete ALL chapters, questions, and revision content! Use only for initial setup."}
                  {uploadType === "revision" &&
                    "WARNING: This will delete ALL revision content!"}
                  {uploadType === "mcq" &&
                    "WARNING: This will delete ALL questions!"}
                </p>
              </div>
            </label>
          </div>

          {/* Upload Button */}
          <button
            onClick={uploadMethod === "paste" && uploadType !== "mcq" ? handleJsonPaste : handleFileUpload}
            disabled={loading || (uploadMethod === "paste" ? !jsonContent.trim() : !file)}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              loading || (uploadMethod === "paste" ? !jsonContent.trim() : !file)
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </span>
            ) : (
              uploadMethod === "paste" && uploadType !== "mcq" ? "Upload JSON" : "Upload File"
            )}
          </button>

          {/* Info Box */}
          <div className="bg-blue-50 mt-6 p-4 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-800 mb-2">
              📋 Format Requirements:
            </p>

            {uploadType === "mcq" && (
              <div className="text-sm text-blue-700 space-y-2">
                <p>• File: CSV or Excel (.xlsx, .xls)</p>
                <p className="font-semibold mt-2">Required columns:</p>
                <p className="text-xs font-mono bg-white p-2 rounded">
                  chapterNumber, questionEn, optionAEn, optionBEn, optionCEn, optionDEn,
                  correctAnswer
                </p>
                <p className="font-semibold mt-2">Optional columns:</p>
                <p className="text-xs font-mono bg-white p-2 rounded">
                  questionMr, optionAMr, optionBMr, optionCMr, optionDMr, explanationEn, explanationMr, difficulty (EASY,
                  MODERATE, HARD)
                </p>
              </div>
            )}

            {uploadType === "revision" && (
              <div className="text-sm text-blue-700 space-y-2">
                <p>• File: JSON object or array</p>
                <p className="font-semibold mt-2">✅ Required fields:</p>
                <p className="text-xs font-mono bg-white p-2 rounded">
                  chapterNumber, titleEn, titleMr
                </p>
                <p className="font-semibold mt-2">Optional fields:</p>
                <p className="text-xs font-mono bg-white p-2 rounded">
                  contentEn, contentMr, imageUrl, qaJson, order
                </p>
                <p className="text-red-700 font-semibold mt-2">
                  ⚠️ Upload chapters first before revision content!
                </p>
              </div>
            )}

            {uploadType === "chapters" && (
              <div className="text-sm text-blue-700 space-y-2">
                <p>• File: JSON array</p>
                <p className="font-semibold mt-2">Required fields:</p>
                <p className="text-xs font-mono bg-white p-2 rounded">
                  chapterNumber (unique), titleEn
                </p>
                <p className="font-semibold mt-2">Optional fields:</p>
                <p className="text-xs font-mono bg-white p-2 rounded">
                  titleMr, actChapterNameEn, actChapterNameMr, sections,
                  descriptionEn, descriptionMr, mahareraEquivalentEn,
                  mahareraEquivalentMr
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT MODE */}
      {pageMode === "edit" && (
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* LEFT SIDEBAR - Chapters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-6">
              <h2 className="font-bold text-lg mb-3">Select Chapter</h2>
              {chapters.length === 0 ? (
                <p className="text-gray-500 text-sm">Loading chapters...</p>
              ) : (
                <div className="space-y-2">
                  {chapters.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChapter(ch.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition ${
                        selectedChapter === ch.id
                          ? "bg-green-600 text-white shadow-md"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <div className="font-semibold">Ch {ch.chapterNumber}</div>
                      <div className="text-xs mt-1 opacity-90">{ch.titleEn}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT CONTENT - Editor */}
          <div className="lg:col-span-3">
            {!selectedChapter ? (
              <div className="p-12 bg-white shadow rounded-lg text-center">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-2xl font-bold mb-2">Select a Chapter</h3>
                <p className="text-gray-600">Choose a chapter to view and edit its revision notes</p>
              </div>
            ) : loading ? (
              <div className="p-12 bg-white rounded-lg shadow text-center">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-gray-600">Loading revisions...</p>
              </div>
            ) : revisions.length === 0 ? (
              <div className="p-12 bg-white rounded-lg shadow text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold mb-2">No Revisions Yet</h3>
                <p className="text-gray-600 mb-4">
                  No revision notes have been uploaded for this chapter.
                </p>
                <button
                  onClick={() => setPageMode("upload")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  📤 Upload New Content
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                
                {/* Revision Selector */}
                {revisions.length > 1 && (
                  <div className="p-4 border-b">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Revision:
                    </label>
                    <select
                      value={selectedRevision?.id || ""}
                      onChange={(e) => {
                        const rev = revisions.find(r => r.id === Number(e.target.value));
                        if (rev) selectRevisionForEdit(rev);
                      }}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                    >
                      {revisions.map((rev) => (
                        <option key={rev.id} value={rev.id}>
                          {rev.titleEn} (Order: {rev.order})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* JSON Editor */}
                {selectedRevision && (
                  <div className="p-6">
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        ✏️ <strong>Edit the JSON below</strong> and click "Update Revision" to save changes.
                        The old revision will be deleted and replaced with your updated version.
                      </p>
                    </div>
                    
                    <textarea
                      value={editedJson}
                      onChange={(e) => setEditedJson(e.target.value)}
                      className="w-full h-96 border border-gray-300 p-4 rounded-lg font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-y"
                      spellCheck={false}
                    />
                    
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={handleUpdateRevision}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                      >
                        {loading ? "Updating..." : "✅ Update Revision"}
                      </button>
                      <button
                        onClick={() => {
                          if (selectedRevision) {
                            selectRevisionForEdit(selectedRevision);
                          }
                        }}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        🔄 Reset
                      </button>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Tip:</strong> Use VS Code or an online JSON editor to format and validate your JSON before updating.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
