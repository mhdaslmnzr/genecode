"use client";

import { useEffect, useRef, useState } from "react";

type FormAction = (formData: FormData) => void | Promise<void>;
type Step = "details" | "preview";

function useImagePreview(file: File | null) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!file) {
      setUrl("");
      return;
    }
    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);
  return url;
}

export function AddDropForm({ action }: { action: FormAction }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("details");
  const [number, setNumber] = useState("");
  const [label, setLabel] = useState("");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");

  function resetAndClose() {
    formRef.current?.reset();
    setNumber(""); setLabel(""); setName(""); setTagline("");
    setStep("details");
    setOpen(false);
  }

  function showPreview() {
    if (formRef.current?.reportValidity()) setStep("preview");
  }

  async function publish(formData: FormData) {
    await action(formData);
    resetAndClose();
  }

  return <>
    <button className="admin-btn admin-add-trigger" type="button" onClick={() => setOpen(true)}>Add new drop</button>
    {open && <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="add-drop-title">
      <button className="admin-modal__backdrop" type="button" aria-label="Close" onClick={resetAndClose} />
      <div className="admin-modal__panel">
        <button className="admin-modal__close" type="button" aria-label="Close" onClick={resetAndClose}>×</button>
        <form ref={formRef} action={publish} className="admin-upload-card admin-catalog-form">
          <h2 id="add-drop-title">Add a new drop</h2>
          <div className={step === "details" ? "admin-form-step" : "admin-form-step"} hidden={step !== "details"}>
            <input name="id" placeholder="ID, e.g. 2026-02" required />
            <input name="year" type="number" placeholder="Year" required />
            <input name="number" placeholder="Drop number, e.g. 02" value={number} onChange={(e) => setNumber(e.target.value)} required />
            <input name="label" placeholder="Label, e.g. DROP 02" value={label} onChange={(e) => setLabel(e.target.value)} required />
            <input name="name" placeholder="Drop name" value={name} onChange={(e) => setName(e.target.value)} />
            <input name="tagline" placeholder="Tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
            <button className="admin-btn" type="button" onClick={showPreview}>Preview drop</button>
          </div>
          <div className="admin-form-step" hidden={step !== "preview"}>
            <div className="admin-live-preview" aria-live="polite">
              <span className="admin-live-preview__label">Preview</span>
              <strong>{label || (number ? `DROP ${number}` : "DROP 00")}</strong>
              <h3>{name || "Drop name"}</h3>
              <p>{tagline || "Drop tagline will appear here."}</p>
            </div>
            <div className="admin-modal__actions">
              <button className="admin-btn admin-btn--ghost" type="button" onClick={() => setStep("details")}>Go back</button>
              <button className="admin-btn" type="submit">Publish drop</button>
            </div>
          </div>
        </form>
      </div>
    </div>}
  </>;
}

export function AddShirtForm({ action, dropId, dropLabel }: { action: FormAction; dropId: string; dropLabel: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("details");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [price, setPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const imageUrl = useImagePreview(imageFile);

  function resetAndClose() {
    formRef.current?.reset();
    setCode(""); setName(""); setTagline(""); setPrice(""); setDiscountedPrice(""); setImageFile(null);
    setStep("details");
    setOpen(false);
  }

  function showPreview() {
    if (formRef.current?.reportValidity()) setStep("preview");
  }

  async function publish(formData: FormData) {
    await action(formData);
    resetAndClose();
  }

  return <>
    <button className="admin-btn admin-add-trigger" type="button" onClick={() => setOpen(true)}>Add shirt</button>
    {open && <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby={`add-shirt-${dropId}`}>
      <button className="admin-modal__backdrop" type="button" aria-label="Close" onClick={resetAndClose} />
      <div className="admin-modal__panel">
        <button className="admin-modal__close" type="button" aria-label="Close" onClick={resetAndClose}>×</button>
        <form ref={formRef} action={publish} className="admin-upload-card admin-catalog-form">
          <h3 id={`add-shirt-${dropId}`}>Add shirt to {dropLabel}</h3>
          <input type="hidden" name="dropId" value={dropId} />
          <div className="admin-form-step" hidden={step !== "details"}>
            <input name="code" placeholder="Code, e.g. GC07" value={code} onChange={(e) => setCode(e.target.value)} required />
            <input name="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input name="tagline" placeholder="Tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
            <input name="price" type="number" min="0" step="1" inputMode="numeric" placeholder="Original price, e.g. 999" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <input name="discountedPrice" type="number" min="0" step="1" inputMode="numeric" placeholder="Discounted price (optional)" value={discountedPrice} onChange={(e) => setDiscountedPrice(e.target.value)} />
            <label>Product image<input name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImageFile(e.target.files?.[0] || null)} required /></label>
            <p className="admin-hint">Sizes S, M, L, and XL are added automatically.</p>
            <button className="admin-btn" type="button" onClick={showPreview}>Preview shirt</button>
          </div>
          <div className="admin-form-step" hidden={step !== "preview"}>
            <div className="admin-live-preview admin-live-preview--shirt" aria-live="polite">
              <span className="admin-live-preview__label">Preview</span>
              <div className="admin-live-preview__media">{imageUrl ? <img src={imageUrl} alt="Selected shirt preview" /> : null}</div>
              <strong>{code.trim().toUpperCase()}</strong>
              <h3>{name || "Shirt name"}</h3>
              <p>{tagline || "Shirt tagline will appear here."}</p>
              <div className="admin-live-preview__prices">
                <b className={discountedPrice ? "price--original" : ""}>{price ? `₹${price}` : "Price"}</b>
                {discountedPrice && <b>₹{discountedPrice}</b>}
              </div>
            </div>
            <div className="admin-modal__actions">
              <button className="admin-btn admin-btn--ghost" type="button" onClick={() => setStep("details")}>Go back</button>
              <button className="admin-btn" type="submit">Publish shirt</button>
            </div>
          </div>
        </form>
      </div>
    </div>}
  </>;
}
