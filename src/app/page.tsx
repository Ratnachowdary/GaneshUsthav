"use client";
import { FormEvent, useEffect, useState } from "react";

type Donation = {
  name: string;
  address: string;
  mobile: string;
  amount: string;
  date: string;
};
const defaultMembers: [string, string][] = [
  ["అబ్బూరి రఘు", "ప్రెసిడెంట్"],
  ["కొడాలి రత్న", "వైస్-ప్రెసిడెంట్"],
  ["కూచిపూడి రాంగోపాల్", "కార్యదర్శి"],
  ["పేదర్ల మనోహర్", "కోశాధికారి"],
  ["కొడాలి దీపు", "కమిటీ సభ్యులు"],
  ["కూచిపూడి సాయి", "కమిటీ సభ్యులు"],
  ["మందలపు కోటి", "కమిటీ సభ్యులు"],
  ["కలిదిండి అనిల్", "కమిటీ సభ్యులు"],
  ["యలవర్తి గోపి", "కమిటీ సభ్యులు"],
];
const defaultDetails = {
  eventDate: "06 September 2026",
  immersionDate: "11 September 2026",
  venue: "Gandhinagar, Vijayaarai",
  contact: "+91 98765 43210",
};
const translations = {
  en: { overview: "Overview", details: "Event details", members: "Committee members", gallery: "Gallery", donations: "Donations", signIn: "Sign in", publicAccess: "Public access", adminAccess: "Admin access", continue: "Continue", welcome: "Welcome to", returns: "Our beloved Ganesh returns home.", eventDetails: "View event details", donationDesk: "Donation desk.", eventHeading: "Ten days of devotion.", committeeHeading: "Committee members.", galleryHeading: "Our celebration gallery.", recent: "RECENT CONTRIBUTORS", signOut: "Sign out", adminMode: "Admin mode", publicView: "Public view" },
  te: { overview: "ముఖ్య సమాచారం", details: "కార్యక్రమ వివరాలు", members: "కమిటీ సభ్యులు", gallery: "ఫోటో గ్యాలరీ", donations: "విరాళాలు", signIn: "ప్రవేశించండి", publicAccess: "ప్రజా ప్రవేశం", adminAccess: "అడ్మిన్ ప్రవేశం", continue: "కొనసాగించండి", welcome: "స్వాగతం", returns: "మన గణేశుడు తిరిగి ఇంటికి వస్తున్నాడు.", eventDetails: "కార్యక్రమ వివరాలు చూడండి", donationDesk: "విరాళాల నమోదు.", eventHeading: "భక్తితో పది రోజుల వేడుక.", committeeHeading: "కమిటీ సభ్యులు.", galleryHeading: "మన వేడుక ఫోటోలు.", recent: "ఇటీవల విరాళాలు అందించినవారు", signOut: "నిష్క్రమించండి", adminMode: "అడ్మిన్ మోడ్", publicView: "ప్రజా వీక్షణ" },
};

export default function Home() {
  const [tab, setTab] = useState("overview");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginRole, setLoginRole] = useState<"public" | "admin">("public");
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [language, setLanguage] = useState<"en" | "te">("en");
  const [details, setDetails] = useState(defaultDetails);
  const [members, setMembers] = useState<[string, string][]>(defaultMembers);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [form, setForm] = useState<Donation>({
    name: "",
    address: "",
    mobile: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
  });
  useEffect(() => {
    const savedDetails = localStorage.getItem("ganesh-details");
    const savedDonations = localStorage.getItem("ganesh-donations");
    const savedGallery = localStorage.getItem("ganesh-gallery");
    const savedMembers = localStorage.getItem("ganesh-members");
    if (savedDetails) setDetails(JSON.parse(savedDetails));
    if (savedDonations) setDonations(JSON.parse(savedDonations));
    if (savedGallery) setGallery(JSON.parse(savedGallery));
    if (savedMembers) setMembers(JSON.parse(savedMembers));
    const savedLanguage = localStorage.getItem("ganesh-language") as "en" | "te" | null;
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);
  const text = translations[language];
  function changeLanguage(nextLanguage: "en" | "te") {
    setLanguage(nextLanguage);
    localStorage.setItem("ganesh-language", nextLanguage);
  }
  function updateDetails(key: keyof typeof details, value: string) {
    const next = { ...details, [key]: value };
    setDetails(next);
    localStorage.setItem("ganesh-details", JSON.stringify(next));
  }
  function updateMember(index: number, field: 0 | 1, value: string) {
    const next = members.map((member, memberIndex) => memberIndex === index ? ([field === 0 ? value : member[0], field === 1 ? value : member[1]] as [string, string]) : member);
    setMembers(next);
    localStorage.setItem("ganesh-members", JSON.stringify(next));
  }
  function addMember() {
    const next = [...members, ["కొత్త సభ్యుడు", "కమిటీ సభ్యులు"] as [string, string]];
    setMembers(next);
    localStorage.setItem("ganesh-members", JSON.stringify(next));
  }
  function removeMember(index: number) {
    const next = members.filter((_, memberIndex) => memberIndex !== index);
    setMembers(next);
    localStorage.setItem("ganesh-members", JSON.stringify(next));
  }
  function addDonation(event: FormEvent) {
    event.preventDefault();
    if (!form.name || !form.amount || !form.mobile) return;
    const next = [...donations, form];
    setDonations(next);
    localStorage.setItem("ganesh-donations", JSON.stringify(next));
    setForm({
      name: "",
      address: "",
      mobile: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
    });
  }
  function addPhoto(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const next = [...gallery, String(reader.result)];
      setGallery(next);
      localStorage.setItem("ganesh-gallery", JSON.stringify(next));
    };
    reader.readAsDataURL(file);
  }
  function signIn(event: FormEvent) {
    event.preventDefault();
    if (
      loginRole === "admin" &&
      (loginName.trim().toLowerCase() !== "admin" || loginPassword !== "ganesh2026")
    ) {
      setLoginError("Use the correct admin username and password.");
      return;
    }
    if (loginRole === "public" && !loginName.trim()) {
      setLoginError("Please enter your name to continue.");
      return;
    }
    setIsAdmin(loginRole === "admin");
    setLoggedIn(true);
    setLoginError("");
  }
  function signOut() {
    setLoggedIn(false);
    setIsAdmin(false);
    setLoginName("");
    setLoginPassword("");
  }
  function downloadReceipt(donation: Donation) {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 780;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#fffaf0";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#d69b32";
    context.lineWidth = 12;
    context.strokeRect(30, 30, 1140, 720);
    context.fillStyle = "#8b241f";
    context.font = "bold 48px Georgia";
    context.textAlign = "center";
    context.fillText("ॐ  GANESH USTHAV  ॐ", 600, 125);
    context.font = "bold 34px Georgia";
    context.fillText("DONATION RECEIPT", 600, 180);
    context.textAlign = "left";
    context.fillStyle = "#332722";
    context.font = "26px Georgia";
    context.fillText(
      `Received with gratitude from: ${donation.name}`,
      120,
      290,
    );
    context.fillText(
      `Address: ${donation.address || "Not provided"}`,
      120,
      355,
    );
    context.fillText(`Mobile: ${donation.mobile}`, 120, 420);
    context.fillText(`Amount: Rs. ${donation.amount}`, 120, 485);
    context.fillText(`Date: ${donation.date}`, 120, 550);
    context.globalAlpha = 0.08;
    context.font = "bold 160px Georgia";
    context.textAlign = "center";
    context.fillText("GANESH", 600, 700);
    context.globalAlpha = 1;
    const link = document.createElement("a");
    link.download = `ganesh-receipt-${donation.name.replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
  if (!loggedIn)
    return (
      <main className="login-shell">
        <div className="login-art">
          <span className="brand-mark">ॐ</span>
          <p className="eyebrow">GANDHINAGAR · VIJAYARAI</p>
          <h1>
            {text.welcome}
            <br />
            <em>Gandhinagar Ganesh Usthav.</em>
          </h1>
          <p>Our community celebration, gathered in one place.</p>
        </div>
        <form className="login-card" onSubmit={signIn}>
          <div className="brand">
            <span className="brand-mark">ॐ</span>
            <div>
              <strong>
                Ganesh<span>Usthav</span>
              </strong>
              <small>Committee portal</small>
            </div>
          </div>
          <h2>{text.signIn}</h2>
          <div className="role-switch">
            <button
              type="button"
              className={loginRole === "public" ? "selected" : ""}
              onClick={() => {
                setLoginRole("public");
                setLoginError("");
              }}
            >
              {text.publicAccess}
            </button>
            <button
              type="button"
              className={loginRole === "admin" ? "selected" : ""}
              onClick={() => {
                setLoginRole("admin");
                setLoginError("");
              }}
            >
              {text.adminAccess}
            </button>
          </div>
          {loginRole === "public" ? (
            <label>
              Your name
              <input
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
              />
            </label>
          ) : (
            <>
              <label>
                Admin username
                <input
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="Committee admin"
                  autoFocus
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter admin password"
                />
              </label>
            </>
          )}
          {loginError && <p className="login-error">{loginError}</p>}
          <button className="primary login-submit" type="submit">
            {text.continue} <span>→</span>
          </button>
          <small className="login-note">
            Public access is read-only. Admin access manages event content.
          </small>
        </form>
      </main>
    );
  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">ॐ</span>
          <div>
            <strong>
              Ganesh<span>Usthav</span>
            </strong>
            <small>Gandhinagar Ganesh Usthav Committee</small>
          </div>
        </div>
        <div className="header-actions"><div className="language-switch"><button className={language === "en" ? "selected" : ""} onClick={() => changeLanguage("en")}>EN</button><button className={language === "te" ? "selected" : ""} onClick={() => changeLanguage("te")}>తెలుగు</button></div><button className="mode-button" onClick={signOut}>{text.signOut} <span className="status-dot" /></button></div>
      </header>
      <section className="hero">
        <div>
          <p className="eyebrow">VIJAYARAI · 2026 CELEBRATION</p>
          <h1>{language === "en" ? <>Our beloved <em>Ganesh</em><br />returns home.</> : <>{text.returns}</>}</h1>
          <p className="hero-copy">
            A ten-day celebration of devotion, community and new beginnings,
            held with love by the people of Gandhinagar.
          </p>
          <button className="primary" onClick={() => setTab("details")}>
            {text.eventDetails} <span>↗</span>
          </button>
        </div>
        <div className="hero-art">
          <img src="/ganesh-logo.png" alt="Gandhinagar Ganesh Usthav Committee logo" />
        </div>
      </section>
      <nav className="tabs">
        {[
          ["overview", text.overview],
          ["details", text.details],
          ["members", text.members],
          ["gallery", text.gallery],
          ["donations", text.donations],
        ].map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "overview" && (
        <>
          <section className="metrics">
            <div>
              <span className="metric-icon">◷</span>
              <small>Ganesh Chaturthi</small>
              <strong>{details.eventDate}</strong>
            </div>
            <div>
              <span className="metric-icon">⌂</span>
              <small>Celebration venue</small>
              <strong>{details.venue}</strong>
            </div>
            <div>
              <span className="metric-icon">✦</span>
              <small>Community so far</small>
              <strong>{donations.length} donors</strong>
            </div>
          </section>
          <section className="overview-grid">
            <div className="intro-panel">
              <p className="eyebrow">A NOTE FROM THE COMMITTEE</p>
              <h2>
                Faith feels brighter
                <br />
                when shared.
              </h2>
              <p>
                Join the families of Vijayaarai as we welcome Lord Ganesha with
                music, prasadam, cultural programs and ten days of togetherness.
              </p>
              <button className="text-button" onClick={() => setTab("members")}>
                Meet the committee <span>→</span>
              </button>
            </div>
            <div className="schedule">
              <p className="eyebrow">SAVE THE DATES</p>
              <div className="date-row">
                <b>01</b>
                <div>
                  <strong>Installation & pooja</strong>
                  <span>{details.eventDate} · 06:00 AM</span>
                </div>
              </div>
              <div className="date-row">
                <b>07</b>
                <div>
                  <strong>Cultural evening</strong>
                  <span>12 September · 06:30 PM</span>
                </div>
              </div>
              <div className="date-row">
                <b>11</b>
                <div>
                  <strong>Immersion procession</strong>
                  <span>{details.immersionDate} · 04:00 PM</span>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
      {tab === "details" && (
        <section className="content-section">
          <p className="eyebrow">EVENT DETAILS</p>
          <h2>{text.eventHeading}</h2>
          <div className="detail-list">
            <div>
              <span>Installation</span>
              <strong>{details.eventDate} · 06:00 AM</strong>
            </div>
            <div>
              <span>Daily aarti</span>
              <strong>06:00 AM & 07:00 PM</strong>
            </div>
            <div>
              <span>Immersion</span>
              <strong>{details.immersionDate} · 04:00 PM</strong>
            </div>
            <div>
              <span>Venue</span>
              <strong>{details.venue}</strong>
            </div>
            <div>
              <span>Contact</span>
              <strong>{details.contact}</strong>
            </div>
          </div>
        </section>
      )}
      {tab === "members" && (
        <section className="content-section">
          <p className="eyebrow">THE PEOPLE BEHIND THE CELEBRATION</p>
          <h2>{text.committeeHeading}</h2>
          <div className="member-grid">
            {members.map(([name, role]) => (
              <div className="member" key={name}>
                <div className="avatar">{name.slice(0, 1)}</div>
                <div>
                  <strong>{name}</strong>
                  <span>{role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {tab === "gallery" && (
        <section className="content-section">
          <p className="eyebrow">MOMENTS TO REMEMBER</p>
          <h2>{text.galleryHeading}</h2>
          {isAdmin && (
            <label className="upload-button">
              Upload photos
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  Array.from(e.target.files || []).forEach(addPhoto)
                }
              />
            </label>
          )}
          <div className="gallery-grid">
            {gallery.length === 0 ? (
              <div className="gallery-empty">
                Photos from the celebration will appear here.
              </div>
            ) : (
              gallery.map((photo, index) => (
                <img
                  src={photo}
                  alt={`Celebration memory ${index + 1}`}
                  key={photo.slice(-20)}
                />
              ))
            )}
          </div>
        </section>
      )}
      {tab === "donations" && (
        <section className="content-section">
          <p className="eyebrow">SEVA & SUPPORT</p>
          <h2>{text.donationDesk}</h2>
          {isAdmin ? (
            <div className="donation-layout">
              <form onSubmit={addDonation} className="donation-form">
                <label>
                  Donor name
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Address
                  <input
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </label>
                <label>
                  Mobile number
                  <input
                    value={form.mobile}
                    onChange={(e) =>
                      setForm({ ...form, mobile: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Amount (INR)
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    required
                  />
                </label>
                <button className="primary" type="submit">
                  Add donation
                </button>
              </form>
              <div className="donation-log">
                <p className="eyebrow">RECEIPTS · {donations.length}</p>
                {donations.length === 0 && (
                  <p className="muted">Your donation register is ready.</p>
                )}
                {donations.map((donation, index) => (
                  <div
                    className="donation-row"
                    key={`${donation.mobile}-${index}`}
                  >
                    <div>
                      <strong>{donation.name}</strong>
                      <span>
                        Rs. {donation.amount} · {donation.date}
                      </span>
                    </div>
                    <button
                      className="receipt-button"
                      onClick={() => downloadReceipt(donation)}
                    >
                      Receipt ↓
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="public-donations">
              <div className="support-note">
                <span className="big-symbol">ॐ</span>
                <div>
                  <h3>Every offering helps the celebration shine.</h3>
                  <p>
                    To contribute to this year&apos;s Ganesh Chaturthi, please
                    contact the committee directly at {details.contact}.
                  </p>
                </div>
              </div>
              <p className="eyebrow donor-heading">
                {text.recent} · {donations.length}
              </p>
              {donations.length === 0 ? (
                <p className="muted">
                  Donation details will appear here after the committee records
                  them.
                </p>
              ) : (
                <div className="public-donor-list">
                  {donations.map((donation, index) => (
                    <div
                      className="public-donor-row"
                      key={`${donation.mobile}-${index}`}
                    >
                      <div>
                        <strong>{donation.name}</strong>
                        <span>{donation.address || "Address not provided"}</span>
                      </div>
                      <div>
                        <strong>Rs. {donation.amount}</strong>
                        <span>{donation.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}
      {isAdmin && tab === "details" && (
        <section className="admin-panel">
          <p className="eyebrow">ADMIN EDITOR · CHANGES SAVE ON THIS DEVICE</p>
          <div className="admin-fields">
            {Object.entries(details).map(([key, value]) => (
              <label key={key}>
                {key.replace(/([A-Z])/g, " $1")}
                <input
                  value={value}
                  onChange={(e) =>
                    updateDetails(key as keyof typeof details, e.target.value)
                  }
                />
              </label>
            ))}
          </div>
        </section>
      )}
      {isAdmin && tab === "members" && (
        <section className="admin-panel">
          <p className="eyebrow">COMMITTEE EDITOR · CHANGES SAVE ON THIS DEVICE</p>
          <div className="member-admin">
            <div className="member-admin-heading"><p className="eyebrow">COMMITTEE ROSTER</p><button className="receipt-button" onClick={addMember}>+ Add member</button></div>
            {members.map(([name, role], index) => (
              <div className="member-admin-row" key={`${name}-${index}`}>
                <input aria-label={`Member ${index + 1} name`} value={name} onChange={(e) => updateMember(index, 0, e.target.value)} />
                <input aria-label={`Member ${index + 1} role`} value={role} onChange={(e) => updateMember(index, 1, e.target.value)} />
                <button className="remove-button" onClick={() => removeMember(index)} aria-label={`Remove ${name}`}>Remove</button>
              </div>
            ))}
          </div>
        </section>
      )}
      <footer>
        <span>ॐ GaneshUsthav</span>
        <span>Made for Gandhinagar · Vijayaarai</span>
        <span>© 2026 Committee</span>
      </footer>
    </main>
  );
}
