"use client";
import { FormEvent, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type Donation = {
  id?: string;
  name: string;
  address: string;
  mobile: string;
  amount: string;
  date: string;
};

type EventRow = {
  id?: string;
  title: string;
  date: string;
  time: string;
};

type Expenditure = {
  id?: string;
  title: string;
  cost: string;
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
  culturalDate: "12 September 2026",
  culturalTime: "06:30 PM",
  venue: "Gandhinagar, Vijayarai",
  contact: "+91 98765 43210",
};

const defaultEventRows: EventRow[] = [
  { title: "Installation", date: "06 September 2026", time: "06:00 AM" },
  { title: "Daily aarti", date: "Every day", time: "06:00 AM & 07:00 PM" },
  { title: "Cultural Event", date: "12 September 2026", time: "06:30 PM" },
  { title: "Immersion", date: "11 September 2026", time: "04:00 PM" },
];

const translations = {
  en: {
    overview: "Overview",
    details: "Event details",
    members: "Committee members",
    gallery: "Gallery",
    donations: "Donations",
    expenditure: "Expenditure",
    signIn: "Sign in",
    publicAccess: "Public access",
    adminAccess: "Admin access",
    continue: "Continue",
    welcome: "Welcome to",
    returns: "Our beloved Ganesh returns home.",
    eventDetails: "View event details",
    donationDesk: "Donation desk.",
    eventHeading: "Ten days of devotion.",
    committeeHeading: "Committee members.",
    galleryHeading: "Our celebration gallery.",
    recent: "RECENT CONTRIBUTORS",
    signOut: "Sign out",
    adminMode: "Admin mode",
    publicView: "Public view",
  },
  te: {
    overview: "ముఖ్య సమాచారం",
    details: "కార్యక్రమ వివరాలు",
    members: "కమిటీ సభ్యులు",
    gallery: "ఫోటో గ్యాలరీ",
    donations: "విరాళాలు",
    expenditure: "ఖర్చులు",
    signIn: "ప్రవేశించండి",
    publicAccess: "ప్రజా ప్రవేశం",
    adminAccess: "అడ్మిన్ ప్రవేశం",
    continue: "కొనసాగించండి",
    welcome: "స్వాగతం",
    returns: "మన గణేశుడు తిరిగి ఇంటికి వస్తున్నాడు.",
    eventDetails: "కార్యక్రమ వివరాలు చూడండి",
    donationDesk: "విరాళాల నమోదు.",
    eventHeading: "భక్తితో పది రోజుల వేడుక.",
    committeeHeading: "కమిటీ సభ్యులు.",
    galleryHeading: "మన వేడుక ఫోటోలు.",
    recent: "ఇటీవల విరాళాలు అందించినవారు",
    signOut: "నిష్క్రమించండి",
    adminMode: "అడ్మిన్ మోడ్",
    publicView: "ప్రజా వీక్షణ",
  },
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
  const [eventRows, setEventRows] = useState<EventRow[]>(defaultEventRows);
  const [members, setMembers] = useState<[string, string][]>(defaultMembers);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donationError, setDonationError] = useState("");
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [expenditureError, setExpenditureError] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Donation>({
    name: "",
    address: "",
    mobile: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [expenditureForm, setExpenditureForm] = useState<Expenditure>({
    title: "",
    cost: "",
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      if (localStorage.getItem("ganesh-public-session") === "true") {
        setLoggedIn(true);
      }
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) {
        setIsAdmin(true);
        setLoggedIn(true);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setIsAdmin(true);
          setLoggedIn(true);
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      const saved = (key: string) => {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      };

      if (!isSupabaseConfigured) {
        const savedDetails = saved("ganesh-details");
        const savedEventRows = saved("ganesh-event-rows");
        const savedMembers = saved("ganesh-members");
        const savedDonations = saved("ganesh-donations");
        const savedExpenditures = saved("ganesh-expenditures");
        const savedGallery = saved("ganesh-gallery");
        if (savedDetails) setDetails(savedDetails);
        if (savedEventRows) setEventRows(savedEventRows);
        if (savedMembers) setMembers(savedMembers);
        if (savedDonations) setDonations(savedDonations);
        if (savedExpenditures) setExpenditures(savedExpenditures);
        if (savedGallery) setGallery(savedGallery);
        setLoading(false);
        return;
      }

      const detailsResult = await supabase.from("event_details").select("*").limit(1).maybeSingle();
      if (detailsResult.error) {
        console.error("Error loading event details:", detailsResult.error);
        const savedDetails = saved("ganesh-details");
        if (savedDetails) setDetails(savedDetails);
      } else if (detailsResult.data) {
        const eventData = detailsResult.data;
        setDetails({
          eventDate: eventData.event_date || defaultDetails.eventDate,
          immersionDate: eventData.immersion_date || defaultDetails.immersionDate,
          culturalDate: eventData.cultural_date || defaultDetails.culturalDate,
          culturalTime: eventData.cultural_time || defaultDetails.culturalTime,
          venue: eventData.venue || defaultDetails.venue,
          contact: eventData.contact || defaultDetails.contact,
        });
      }

      const eventRowsResult = await supabase
        .from("event_rows")
        .select("id, title, date, time")
        .order("order_index");
      if (eventRowsResult.error) {
        console.error("Error loading event rows:", eventRowsResult.error);
        const savedEventRows = saved("ganesh-event-rows");
        if (savedEventRows) setEventRows(savedEventRows);
      } else if (eventRowsResult.data && eventRowsResult.data.length > 0) {
        setEventRows(eventRowsResult.data);
      }

      const membersResult = await supabase.from("members").select("*").order("order_index");
      if (membersResult.error) {
        console.error("Error loading members:", membersResult.error);
        const savedMembers = saved("ganesh-members");
        if (savedMembers) setMembers(savedMembers);
      } else if (membersResult.data && membersResult.data.length > 0) {
        setMembers(membersResult.data.map((member: any) => [member.name, member.role]));
      }

      const donationsResult = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });
      if (donationsResult.error) {
        console.error("Error loading donations:", donationsResult.error);
        const savedDonations = saved("ganesh-donations");
        if (savedDonations) setDonations(savedDonations);
      } else if (donationsResult.data) {
        setDonations(donationsResult.data.map((donation: any) => ({
          id: donation.id,
          name: donation.name,
          address: donation.address || "",
          mobile: donation.mobile || "",
          amount: donation.amount,
          date: donation.date,
        })));
      }

      const expendituresResult = await supabase
        .from("expenditures")
        .select("id, title, cost")
        .order("created_at", { ascending: false });
      if (expendituresResult.error) {
        console.error("Error loading expenditures:", expendituresResult.error);
        const savedExpenditures = saved("ganesh-expenditures");
        if (savedExpenditures) setExpenditures(savedExpenditures);
      } else if (expendituresResult.data) {
        setExpenditures(expendituresResult.data);
      }

      const galleryResult = await supabase
        .from("gallery_images")
        .select("image_url")
        .order("created_at", { ascending: false });
      if (galleryResult.error) {
        console.error("Error loading gallery:", galleryResult.error);
        const savedGallery = saved("ganesh-gallery");
        if (savedGallery) setGallery(savedGallery);
      } else if (galleryResult.data) {
        setGallery(galleryResult.data.map((image: any) => image.image_url));
      }

      const savedLanguage = localStorage.getItem("ganesh-language") as
        | "en"
        | "te"
        | null;
      if (savedLanguage) setLanguage(savedLanguage);
      setLoading(false);
    };

    loadData();
  }, []);

  const text = translations[language];
  const totalDonationAmount = donations.reduce(
    (total, donation) => total + (Number(donation.amount) || 0),
    0
  );
  const totalExpenditureAmount = expenditures.reduce(
    (total, expenditure) => total + (Number(expenditure.cost) || 0),
    0
  );

  function changeLanguage(nextLanguage: "en" | "te") {
    setLanguage(nextLanguage);
    localStorage.setItem("ganesh-language", nextLanguage);
  }

  function updateDetails(key: keyof typeof details, value: string) {
    const next = { ...details, [key]: value };
    setDetails(next);
    localStorage.setItem("ganesh-details", JSON.stringify(next));
  }

  async function saveDetails(key: keyof typeof details, value: string) {
    const updateData: any = {};
    if (key === "eventDate") updateData.event_date = value;
    if (key === "immersionDate") updateData.immersion_date = value;
    if (key === "culturalDate") updateData.cultural_date = value;
    if (key === "culturalTime") updateData.cultural_time = value;
    if (key === "venue") updateData.venue = value;
    if (key === "contact") updateData.contact = value;

    try {
      const { data: eventRow, error: findError } = await supabase
        .from("event_details")
        .select("id")
        .limit(1)
        .maybeSingle();
      if (findError) throw findError;

      const result = eventRow
        ? await supabase
            .from("event_details")
            .update(updateData)
            .eq("id", eventRow.id)
        : await supabase.from("event_details").insert(updateData);
      if (result.error) throw result.error;
    } catch (error: any) {
      console.error("Error updating details:", error);
    }
  }

  async function saveAllDetails() {
    await Promise.all(
      (Object.keys(details) as (keyof typeof details)[]).map((key) =>
        saveDetails(key, details[key])
      )
    );
  }

  function updateEventRow(index: number, field: keyof EventRow, value: string) {
    const next = eventRows.map((row, rowIndex) =>
      rowIndex === index ? { ...row, [field]: value } : row
    );
    setEventRows(next);
    localStorage.setItem("ganesh-event-rows", JSON.stringify(next));
  }

  async function saveAllEventRows() {
    const { data: existingRows, error: loadError } = await supabase
      .from("event_rows")
      .select("id")
      .order("order_index");
    if (loadError) {
      console.error("Error loading event rows:", loadError);
      return;
    }

    for (const [index, row] of eventRows.entries()) {
      const payload = {
        title: row.title,
        date: row.date,
        time: row.time,
        order_index: index,
      };
      const result = row.id
        ? await supabase.from("event_rows").update(payload).eq("id", row.id)
        : await supabase.from("event_rows").insert(payload);
      if (result.error) console.error("Error saving event row:", result.error);
    }

    const currentIds = eventRows.map((row) => row.id).filter(Boolean);
    const removedIds = (existingRows || [])
      .map((row) => row.id)
      .filter((id) => !currentIds.includes(id));
    if (removedIds.length > 0) {
      const { error } = await supabase
        .from("event_rows")
        .delete()
        .in("id", removedIds);
      if (error) console.error("Error removing event rows:", error);
    }
  }

  function addEventRow() {
    const next = [
      ...eventRows,
      { title: "New Event", date: "", time: "" },
    ];
    setEventRows(next);
    localStorage.setItem("ganesh-event-rows", JSON.stringify(next));
  }

  function removeEventRow(index: number) {
    const next = eventRows.filter((_, rowIndex) => rowIndex !== index);
    setEventRows(next);
    localStorage.setItem("ganesh-event-rows", JSON.stringify(next));
  }

  function updateMember(index: number, field: 0 | 1, value: string) {
    const next = members.map((member, memberIndex) =>
      memberIndex === index
        ? ([
            field === 0 ? value : member[0],
            field === 1 ? value : member[1],
          ] as [string, string])
        : member
    );
    setMembers(next);
    localStorage.setItem("ganesh-members", JSON.stringify(next));

  }

  async function saveMember(index: number) {
    const memberName = members[index][0];
    const memberRole = members[index][1];
    try {
      const { error } = await supabase
        .from("members")
        .update({
          name: memberName,
          role: memberRole,
          order_index: index,
        })
        .eq("order_index", index);
      if (error) throw error;
    } catch (error: any) {
      console.error("Error updating member:", error);
    }
  }

  async function saveAllMembers() {
    await Promise.all(members.map((_, index) => saveMember(index)));
  }

  async function addMember() {
    const newMember = [
      "కొత్త సభ్యుడు",
      "కమిటీ సభ్యులు",
    ] as [string, string];
    const next = [...members, newMember];
    setMembers(next);
    localStorage.setItem("ganesh-members", JSON.stringify(next));

    try {
      const { error } = await supabase.from("members").insert({
        name: newMember[0],
        role: newMember[1],
        order_index: members.length,
      });
      if (error) console.error("Error adding member:", error);
    } catch (error: any) {
      console.error("Error adding member:", error);
    }
  }

  async function removeMember(index: number) {
    const memberToRemove = members[index];
    const next = members.filter((_, memberIndex) => memberIndex !== index);
    setMembers(next);
    localStorage.setItem("ganesh-members", JSON.stringify(next));

    try {
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("order_index", index);
      if (error) console.error("Error removing member:", error);
    } catch (error: any) {
      console.error("Error removing member:", error);
    }
  }

  async function addDonation(event: FormEvent) {
    event.preventDefault();
    if (!form.name || !form.amount || !form.mobile) return;
    setDonationError("");

    try {
      const { data, error } = await supabase.from("donations").insert({
        name: form.name,
        address: form.address,
        mobile: form.mobile,
        amount: form.amount,
        date: form.date,
      }).select("id, name, address, mobile, amount, date").single();

      if (!error) {
        const next = [data, ...donations];
        setDonations(next);
        localStorage.setItem("ganesh-donations", JSON.stringify(next));
        setForm({
          name: "",
          address: "",
          mobile: "",
          amount: "",
          date: new Date().toISOString().slice(0, 10),
        });
        setDonationError("");
      } else {
        const message = [error.message, error.details, error.hint]
          .filter(Boolean)
          .join(" ");
        console.error("Error adding donation:", message || error);
        setDonationError(
          message || "Could not save donation. Check the Supabase table and admin permissions."
        );
      }
    } catch (error: any) {
      console.error("Error adding donation:", error);
      setDonationError(error?.message || "Could not save donation.");
    }
  }

  async function removeDonation(id: string | undefined) {
    if (!id) return;
    const { error } = await supabase.from("donations").delete().eq("id", id);
    if (error) {
      console.error("Error removing donation:", error);
      setDonationError(error.message || "Could not remove donation.");
      return;
    }
    const next = donations.filter((donation) => donation.id !== id);
    setDonations(next);
    localStorage.setItem("ganesh-donations", JSON.stringify(next));
  }

  async function addExpenditure(event: FormEvent) {
    event.preventDefault();
    if (!expenditureForm.title || !expenditureForm.cost) return;
    setExpenditureError("");

    const { data, error } = await supabase
      .from("expenditures")
      .insert({
        title: expenditureForm.title,
        cost: expenditureForm.cost,
      })
      .select("id, title, cost")
      .single();
    if (error) {
      const message = [error.message, error.details, error.hint]
        .filter(Boolean)
        .join(" ");
      console.error("Error adding expenditure:", message || error);
      setExpenditureError(
        message || "Could not save expenditure. Check the Supabase table and admin permissions."
      );
      return;
    }

    const next = [data, ...expenditures];
    setExpenditures(next);
    localStorage.setItem("ganesh-expenditures", JSON.stringify(next));
    setExpenditureForm({ title: "", cost: "" });
    setExpenditureError("");
  }

  async function removeExpenditure(id: string | undefined) {
    if (!id) return;
    const { error } = await supabase.from("expenditures").delete().eq("id", id);
    if (error) {
      console.error("Error removing expenditure:", error);
      return;
    }
    const next = expenditures.filter((expenditure) => expenditure.id !== id);
    setExpenditures(next);
    localStorage.setItem("ganesh-expenditures", JSON.stringify(next));
  }

  async function addPhoto(file: File) {
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        // Fall back to base64
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = String(reader.result);
          const next = [...gallery, base64];
          setGallery(next);
          localStorage.setItem("ganesh-gallery", JSON.stringify(next));
        };
        reader.readAsDataURL(file);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("gallery")
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      await supabase.from("gallery_images").insert({
        image_url: imageUrl,
      });

      const next = [...gallery, imageUrl];
      setGallery(next);
      localStorage.setItem("ganesh-gallery", JSON.stringify(next));
    } catch (error: any) {
      console.error("Error uploading photo:", error);
    }
  }

  async function signIn(event: FormEvent) {
    event.preventDefault();

    if (loginRole === "public") {
      if (!loginName.trim()) {
        setLoginError("Please enter your name to continue.");
        return;
      }
      setIsAdmin(false);
      setLoggedIn(true);
      localStorage.setItem("ganesh-public-session", "true");
      setLoginError("");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginName.trim(),
        password: loginPassword,
      });

      if (error) {
        console.error("Supabase login error:", error.message);
        setLoginError(error.message || "Unable to sign in.");
      } else {
        setIsAdmin(true);
        setLoggedIn(true);
        setLoginError("");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError("An error occurred. Please try again.");
    }
  }

  async function signOut() {
    if (isAdmin) {
      await supabase.auth.signOut();
    }
    setLoggedIn(false);
    setIsAdmin(false);
    localStorage.removeItem("ganesh-public-session");
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

  if (loading)
    return (
      <main className="shell" style={{ textAlign: "center", paddingTop: "100px" }}>
        <p>Loading...</p>
      </main>
    );

  if (!loggedIn)
    return (
      <main className="login-shell">
        <div className="login-art">
          <img className="brand-logo" src="/ganesh-logo.png" alt="Ganesh Usthav logo" />
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
            <img className="brand-logo" src="/ganesh-logo.png" alt="Ganesh Usthav logo" />
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
                Admin email
                <input
                  type="email"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="admin@example.com"
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
          <img className="brand-logo" src="/ganesh-logo.png" alt="Ganesh Usthav logo" />
          <div>
            <strong>
              Ganesh<span>Usthav</span>
            </strong>
            <small>Gandhinagar Ganesh Usthav Committee</small>
          </div>
        </div>
        <div className="header-actions">
          <div className="language-switch">
            <button
              className={language === "en" ? "selected" : ""}
              onClick={() => changeLanguage("en")}
            >
              EN
            </button>
            <button
              className={language === "te" ? "selected" : ""}
              onClick={() => changeLanguage("te")}
            >
              తెలుగు
            </button>
          </div>
          <button className="mode-button" onClick={signOut}>
            {text.signOut} <span className="status-dot" />
          </button>
        </div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">VIJAYARAI · 2026 CELEBRATION</p>
          <h1>
            {language === "en" ? (
              <>
                Our beloved <em>Ganesh</em>
                <br />
                returns home.
              </>
            ) : (
              <>{text.returns}</>
            )}
          </h1>
          <p className="hero-copy">
            A Seven-day celebration of devotion, community and new beginnings,
            held with love by the people of Vijayarai.
          </p>
          <button className="primary" onClick={() => setTab("details")}>
            {text.eventDetails} <span>↗</span>
          </button>
        </div>
        <div className="hero-art">
          <img
            src="/ganesh-logo.png"
            alt="Gandhinagar Ganesh Usthav Committee logo"
          />
        </div>
      </section>

      <nav className="tabs">
        {[
          ["overview", text.overview],
          ["details", text.details],
          ["members", text.members],
          ["gallery", text.gallery],
          ["donations", text.donations],
          ["expenditure", text.expenditure],
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
                Join the families of Vijayarai as we welcome Lord Ganesha with
                music, prasadam, cultural programs and seven days of togetherness.
              </p>
              <button
                className="text-button"
                onClick={() => setTab("members")}
              >
                Meet the committee <span>→</span>
              </button>
            </div>
            <div className="schedule">
              <p className="eyebrow">SAVE THE DATES</p>
              {eventRows.map((row, index) => (
                <div className="date-row" key={row.id || `${row.title}-${index}`}>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  <div>
                    <strong>{row.title}</strong>
                    <span>{row.date} · {row.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {tab === "details" && (
        <section className="content-section">
          <p className="eyebrow">EVENT DETAILS</p>
          <h2>{text.eventHeading}</h2>
          <div className="detail-list">
            {eventRows.map((row, index) => (
              <div key={row.id || `${row.title}-${index}`}>
                <span>{row.title}</span>
                <strong>{row.date} · {row.time}</strong>
              </div>
            ))}
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
          <p className="donation-total">
            Total collected: <strong>Rs. {totalDonationAmount.toLocaleString("en-IN")}</strong>
          </p>
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
                {donationError && <p className="login-error">{donationError}</p>}
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
                    <button
                      className="remove-button"
                      type="button"
                      onClick={() => removeDonation(donation.id)}
                      disabled={!donation.id}
                    >
                      Remove
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
                        <span>
                          {donation.address || "Address not provided"}
                        </span>
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

      {tab === "expenditure" && (
        <section className="content-section">
          <p className="eyebrow">EVENT EXPENDITURE</p>
          <h2>Expenditure</h2>
          <p className="donation-total">
            Total expenditure: <strong>Rs. {totalExpenditureAmount.toLocaleString("en-IN")}</strong>
          </p>
          {isAdmin && (
            <form onSubmit={addExpenditure} className="expenditure-form">
              <label>
                Title
                <input
                  value={expenditureForm.title}
                  onChange={(e) =>
                    setExpenditureForm({ ...expenditureForm, title: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Cost (INR)
                <input
                  type="number"
                  min="0"
                  value={expenditureForm.cost}
                  onChange={(e) =>
                    setExpenditureForm({ ...expenditureForm, cost: e.target.value })
                  }
                  required
                />
              </label>
              <button className="primary" type="submit">Add expenditure</button>
            </form>
          )}
          {expenditureError && <p className="login-error">{expenditureError}</p>}
          <div className="expenditure-table">
            <div className="expenditure-row expenditure-heading">
              <strong>Title</strong>
              <strong>Cost</strong>
              {isAdmin && <span />}
            </div>
            {expenditures.length === 0 ? (
              <p className="muted">No expenditure recorded yet.</p>
            ) : (
              expenditures.map((expenditure) => (
                <div className="expenditure-row" key={expenditure.id || expenditure.title}>
                  <span>{expenditure.title}</span>
                  <strong>Rs. {Number(expenditure.cost || 0).toLocaleString("en-IN")}</strong>
                  {isAdmin && (
                    <button
                      className="remove-button"
                      type="button"
                      onClick={() => removeExpenditure(expenditure.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {isAdmin && tab === "details" && (
        <section className="admin-panel">
          <p className="eyebrow">ADMIN EDITOR · SYNCED TO SUPABASE</p>
          <div className="admin-fields">
            <label>
              Event Date
              <input
                value={details.eventDate}
                onChange={(e) => updateDetails("eventDate", e.target.value)}
                onBlur={(e) => saveDetails("eventDate", e.target.value)}
              />
            </label>
            <label>
              Immersion Date
              <input
                value={details.immersionDate}
                onChange={(e) => updateDetails("immersionDate", e.target.value)}
                onBlur={(e) => saveDetails("immersionDate", e.target.value)}
              />
            </label>
            <label>
              Cultural Date
              <input
                value={details.culturalDate}
                onChange={(e) => updateDetails("culturalDate", e.target.value)}
                onBlur={(e) => saveDetails("culturalDate", e.target.value)}
              />
            </label>
            <label>
              Cultural Time
              <input
                value={details.culturalTime}
                onChange={(e) => updateDetails("culturalTime", e.target.value)}
                onBlur={(e) => saveDetails("culturalTime", e.target.value)}
              />
            </label>
            <label>
              Venue
              <input
                value={details.venue}
                onChange={(e) => updateDetails("venue", e.target.value)}
                onBlur={(e) => saveDetails("venue", e.target.value)}
              />
            </label>
            <label>
              Contact
              <input
                value={details.contact}
                onChange={(e) => updateDetails("contact", e.target.value)}
                onBlur={(e) => saveDetails("contact", e.target.value)}
              />
            </label>
          </div>
          <button className="primary" type="button" onClick={saveAllDetails}>
            Save event details
          </button>
          <div className="event-row-admin">
            <div className="member-admin-heading">
              <p className="eyebrow">EVENT SCHEDULE</p>
              <button className="receipt-button" type="button" onClick={addEventRow}>
                + Add event
              </button>
            </div>
            {eventRows.map((row, index) => (
              <div className="event-row-admin-item" key={row.id || index}>
                <input
                  aria-label={`Event ${index + 1} title`}
                  value={row.title}
                  onChange={(e) => updateEventRow(index, "title", e.target.value)}
                />
                <input
                  aria-label={`Event ${index + 1} date`}
                  value={row.date}
                  onChange={(e) => updateEventRow(index, "date", e.target.value)}
                />
                <input
                  aria-label={`Event ${index + 1} time`}
                  value={row.time}
                  onChange={(e) => updateEventRow(index, "time", e.target.value)}
                />
                <button
                  className="remove-button"
                  type="button"
                  onClick={() => removeEventRow(index)}
                  aria-label={`Remove ${row.title}`}
                >
                  Remove
                </button>
              </div>
            ))}
            <button className="primary" type="button" onClick={saveAllEventRows}>
              Save event schedule
            </button>
          </div>
        </section>
      )}

      {isAdmin && tab === "members" && (
        <section className="admin-panel">
          <p className="eyebrow">COMMITTEE EDITOR · SYNCED TO SUPABASE</p>
          <div className="member-admin">
            <div className="member-admin-heading">
              <p className="eyebrow">COMMITTEE ROSTER</p>
              <button className="receipt-button" onClick={addMember}>
                + Add member
              </button>
            </div>
            {members.map(([name, role], index) => (
              <div className="member-admin-row" key={`${name}-${index}`}>
                <input
                  aria-label={`Member ${index + 1} name`}
                  value={name}
                  onChange={(e) => updateMember(index, 0, e.target.value)}
                  onBlur={() => saveMember(index)}
                />
                <input
                  aria-label={`Member ${index + 1} role`}
                  value={role}
                  onChange={(e) => updateMember(index, 1, e.target.value)}
                  onBlur={() => saveMember(index)}
                />
                <button
                  className="remove-button"
                  onClick={() => removeMember(index)}
                  aria-label={`Remove ${name}`}
                >
                  Remove
                </button>
              </div>
            ))}
            <button className="primary" type="button" onClick={saveAllMembers}>
              Save committee members
            </button>
          </div>
        </section>
      )}

      <footer>
        <span>ॐ GaneshUsthav</span>
        <span>Made for Gandhinagar · Vijayarai</span>
        <span>© 2026 Committee</span>
      </footer>
    </main>
  );
}
