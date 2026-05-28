"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATS = ["Civil","Electrical","Mechanical","IT & Software","Solar EPC","O&M Services","Logistics","Manpower","Other"];
const STEPS = ["Account","Company","Banking"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [form, setForm]     = useState({ name:"",email:"",password:"",confirm:"",companyName:"",gstNumber:"",panNumber:"",categories:[] as string[],bankName:"",bankAccount:"",bankIfsc:"" });
  const set = (k:string,v:any) => setForm(f=>({...f,[k]:v}));
  const toggleCat = (c:string) => set("categories", form.categories.includes(c) ? form.categories.filter(x=>x!==c) : [...form.categories,c]);

  const next = (e:React.FormEvent) => {
    e.preventDefault();
    if (step===0 && form.password!==form.confirm) { setError("Passwords do not match."); return; }
    setError(""); setStep(s=>s+1);
  };

  const submit = async (e:React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register",{ method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error||"Registration failed."); setLoading(false); return; }
      router.push("/login");
    } catch { setError("Something went wrong."); setLoading(false); }
  };

  return (
    <div className="auth-page" style={{ alignItems: "flex-start", paddingTop: "40px" }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>

        <div className="anim-up" style={{ textAlign: "center", marginBottom: "24px" }}>
          <div className="auth-logo-ring">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <h1 className="auth-title">Vendor Registration</h1>
          <p className="auth-sub">Avaada Auction Platform</p>
        </div>

        {/* Steps */}
        <div className="anim-up d1" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, marginBottom:"20px" }}>
          {STEPS.map((s,i) => (
            <div key={s} style={{ display:"flex", alignItems:"center" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"5px" }}>
                <div style={{ width:"30px",height:"30px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                  background: i<step?"var(--accent)":i===step?"var(--accent-bg)":"var(--bg3)",
                  border: i===step?"1.5px solid var(--accent)":i<step?"1.5px solid var(--accent)":"1px solid var(--border)",
                  color: i<step?"var(--bg)":i===step?"var(--accent)":"var(--text3)",
                  fontSize:"0.78rem",fontWeight:600,transition:"all 0.3s"
                }}>
                  {i<step ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : i+1}
                </div>
                <span style={{ fontSize:"0.68rem",color:i===step?"var(--accent)":"var(--text3)",fontWeight:500 }}>{s}</span>
              </div>
              {i<STEPS.length-1 && <div style={{ width:"60px",height:"1px",background:i<step?"var(--accent)":"var(--border)",margin:"0 6px",marginBottom:"18px",transition:"background 0.3s" }}/>}
            </div>
          ))}
        </div>

        <div className="auth-card anim-up d2" style={{ maxWidth:"100%", padding:"28px" }}>
          {error && <div className="anim-in" style={{ background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:"var(--radius-sm)",padding:"10px 13px",marginBottom:"16px",color:"var(--danger)",fontSize:"0.82rem" }}>{error}</div>}

          {step===0 && (
            <form onSubmit={next} style={{ display:"flex",flexDirection:"column",gap:"14px" }}>
              <h3 style={{ fontSize:"0.9rem",fontWeight:600,color:"var(--text)",marginBottom:"4px" }}>Account Details</h3>
              <div><label className="label">Full Name</label><input className="input" type="text" placeholder="Your full name" value={form.name} onChange={e=>set("name",e.target.value)} required /></div>
              <div><label className="label">Email</label><input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={e=>set("email",e.target.value)} required /></div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px" }}>
                <div><label className="label">Password</label><input className="input" type="password" placeholder="Min 8 chars" value={form.password} onChange={e=>set("password",e.target.value)} required minLength={8} /></div>
                <div><label className="label">Confirm</label><input className="input" type="password" placeholder="Repeat" value={form.confirm} onChange={e=>set("confirm",e.target.value)} required /></div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width:"100%",marginTop:"4px" }}>Continue →</button>
            </form>
          )}

          {step===1 && (
            <form onSubmit={next} style={{ display:"flex",flexDirection:"column",gap:"14px" }}>
              <h3 style={{ fontSize:"0.9rem",fontWeight:600,color:"var(--text)",marginBottom:"4px" }}>Company Details</h3>
              <div><label className="label">Company Name</label><input className="input" type="text" placeholder="Legal company name" value={form.companyName} onChange={e=>set("companyName",e.target.value)} required /></div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px" }}>
                <div><label className="label">GST Number</label><input className="input" type="text" placeholder="22AAAAA0000A1Z5" value={form.gstNumber} onChange={e=>set("gstNumber",e.target.value)} /></div>
                <div><label className="label">PAN Number</label><input className="input" type="text" placeholder="AAAPL1234C" value={form.panNumber} onChange={e=>set("panNumber",e.target.value)} /></div>
              </div>
              <div>
                <label className="label">Work Categories</label>
                <div style={{ display:"flex",flexWrap:"wrap",gap:"6px" }}>
                  {CATS.map(c=>(
                    <button key={c} type="button" onClick={()=>toggleCat(c)} style={{ padding:"5px 12px",borderRadius:"999px",fontSize:"0.78rem",cursor:"pointer",transition:"all 0.15s",
                      background:form.categories.includes(c)?"var(--accent-bg)":"var(--bg3)",
                      border:form.categories.includes(c)?"1px solid var(--accent)":"1px solid var(--border)",
                      color:form.categories.includes(c)?"var(--accent)":"var(--text2)",
                    }}>{c}</button>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex",gap:"8px",marginTop:"4px" }}>
                <button type="button" className="btn btn-ghost" onClick={()=>setStep(0)} style={{ flex:"0 0 auto" }}>← Back</button>
                <button type="submit" className="btn btn-primary" style={{ flex:1 }}>Continue →</button>
              </div>
            </form>
          )}

          {step===2 && (
            <form onSubmit={submit} style={{ display:"flex",flexDirection:"column",gap:"14px" }}>
              <h3 style={{ fontSize:"0.9rem",fontWeight:600,color:"var(--text)",marginBottom:"4px" }}>Bank Details <span style={{ color:"var(--text3)",fontWeight:400,fontSize:"0.78rem" }}>(optional)</span></h3>
              <div><label className="label">Bank Name</label><input className="input" type="text" placeholder="e.g. State Bank of India" value={form.bankName} onChange={e=>set("bankName",e.target.value)} /></div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px" }}>
                <div><label className="label">Account Number</label><input className="input" type="text" value={form.bankAccount} onChange={e=>set("bankAccount",e.target.value)} /></div>
                <div><label className="label">IFSC Code</label><input className="input" type="text" placeholder="SBIN0001234" value={form.bankIfsc} onChange={e=>set("bankIfsc",e.target.value)} /></div>
              </div>
              <div style={{ background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",padding:"12px 14px",fontSize:"0.8rem",color:"var(--text2)" }}>
                <p style={{ color:"var(--accent)",fontWeight:600,fontSize:"0.7rem",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:"6px" }}>Summary</p>
                <p><span style={{ color:"var(--text3)" }}>Name: </span>{form.name}</p>
                <p><span style={{ color:"var(--text3)" }}>Company: </span>{form.companyName}</p>
                <p><span style={{ color:"var(--text3)" }}>Email: </span>{form.email}</p>
              </div>
              <div style={{ display:"flex",gap:"8px",marginTop:"4px" }}>
                <button type="button" className="btn btn-ghost" onClick={()=>setStep(1)} style={{ flex:"0 0 auto" }}>← Back</button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex:1 }}>
                  {loading?"Submitting...":"✓ Submit Registration"}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="anim-up d4" style={{ textAlign:"center",marginTop:"16px",fontSize:"0.8rem",color:"var(--text2)" }}>
          Already registered? <Link href="/login" style={{ color:"var(--accent)",textDecoration:"none",fontWeight:500 }}>Sign in</Link>
        </p>
        <p style={{ textAlign:"center",marginTop:"8px",fontSize:"0.7rem",color:"var(--text3)" }}>
          Applications reviewed within 24 hours by Avaada procurement team
        </p>
      </div>
    </div>
  );
}
