import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DEFAULT_GOOGLE_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbyiGeHrKk-V-7-vl7o-QYD3bSPrfnJPYNUpHtGGZSmWypFslZCo2CYbU1heYQ3D5HVd8g/exec";

// LeadSquared CRM Lead.Capture API URL
const DEFAULT_LEADSQUARED_URL =
  "https://api-in21.leadsquared.com/v2/LeadManagement.svc/Lead.Capture?accessKey=u$r3040ef6ef283391cca5c19f26c3649eb&secretKey=69aedb87702c8a1f0781c891f02ead4228a924fc";

function formatPhone(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^\d+]/g, "").trim();
  if (cleaned.length === 10 && !cleaned.startsWith("+")) {
    cleaned = "+91" + cleaned;
  } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
    cleaned = "+" + cleaned;
  }
  return cleaned;
}

function normalizeUniversity(rawName: string): string {
  if (!rawName) return "Sikkim Manipal University";
  const lower = rawName.toLowerCase();
  if (lower.includes("smu") || lower.includes("sikkim") || lower.includes("manipal")) return "Sikkim Manipal University";
  if (lower.includes("symbiosis") || lower.includes("ssodl")) return "Symbiosis";
  if (lower.includes("ignou")) return "IGNOU";
  if (lower.includes("du") || lower.includes("delhi")) return "Delhi University (DU SOL)";
  if (lower.includes("mumbai")) return "Mumbai University";
  if (lower.includes("shoolini")) return "Shoolini University";
  if (lower.includes("sharda")) return "Sharda University";
  if (lower.includes("galgotias") || lower.includes("galgotia")) return "Galgotias University";
  if (lower.includes("pune")) return "Pune University";
  if (lower.includes("bharati") || lower.includes("vidyapeeth")) return "Bharati Vidyapeeth University";
  if (lower.includes("christ")) return "Christ University";
  if (lower.includes("punjab") || lower.includes("panjab")) return "Punjab University";
  if (lower.includes("nmims")) return "NMIMS";
  if (lower.includes("lpu") || lower.includes("lovely")) return "LPU";
  if (lower.includes("amity")) return "Amity Online";
  if (lower.includes("bennett")) return "Bennett University";
  if (lower.includes("uttaranchal")) return "Uttaranchal University";
  if (lower.includes("vgu") || lower.includes("vivekananda")) return "VGU";
  if (lower.includes("vit") || lower.includes("vellore")) return "VIT Online";
  return rawName.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Extract client IP address from various standard proxy/CDN headers
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const cfIp = req.headers.get("cf-connecting-ip");
    let clientIp = "127.0.0.1";
    if (cfIp) {
      clientIp = cfIp.trim();
    } else if (forwardedFor) {
      clientIp = forwardedFor.split(",")[0].trim();
    } else if (realIp) {
      clientIp = realIp.trim();
    }

    // Format local IST timestamp
    const now = new Date();
    const istTimestamp = now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const name = (body.name || body.first_name || "").trim();
    const email = (body.email || "").trim();
    const rawPhone = (body.phone || body.mobile || "").trim();
    const formattedPhone = formatPhone(rawPhone);
    const rawCollege = (body.college || body.university || "Sikkim Manipal University").trim();
    const university = normalizeUniversity(rawCollege);
    const course = (body.course || body.program || "Online MBA").trim();
    const state = (body.state || "Delhi").trim();
    const city = (body.city || "").trim();

    // Tracking / UTM attributes
    const utmSource = (body.utm_source || body.source || "Website").trim();
    const utmMedium = (body.utm_medium || body.sourceMedium || "Direct").trim();
    const utmCampaign = (
      body.utm_campaign ||
      body.campaignid ||
      body.sourceCampaign ||
      "Affordable MBA Program"
    ).trim();
    const utmTerm = (
      body.utm_term ||
      body.utm_keyword ||
      body.keyword ||
      ""
    ).trim();
    const utmContent = (body.utm_content || body.sourceContent || "").trim();
    const utmLocation = (body.utm_location || body.location || "").trim();
    const gclid = (body.gclid || "").trim();

    const leadData = {
      timestamp: istTimestamp,
      name,
      email,
      phone: formattedPhone || rawPhone,
      status: (body.status || "Working Professional").trim(),
      college: rawCollege,
      university,
      program: course,
      course,
      state,
      city,
      referCode: (body.referCode || "").trim(),
      ipAddress: clientIp,
      pageUrl: (body.pageUrl || "").trim(),
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_term: utmTerm,
      utm_content: utmContent,
      utm_location: utmLocation,
      gclid,
    };

    // 1. Forward to LeadSquared CRM API
    let crmApiUrl = DEFAULT_LEADSQUARED_URL;
    const envUrl = process.env.LEADSQUARED_API_URL;
    if (
      envUrl &&
      envUrl.includes("3040ef6ef283391cca5c19f26c3649eb") &&
      envUrl.includes("69aedb87702c8a1f0781c891f02ead4228a924fc")
    ) {
      crmApiUrl = envUrl;
    }

    const crmPayload = [
      { Attribute: "FirstName", Value: name },
      { Attribute: "EmailAddress", Value: email },
      { Attribute: "Phone", Value: formattedPhone || rawPhone },
      { Attribute: "mx_State", Value: state },
      { Attribute: "mx_City", Value: city },
      { Attribute: "mx_Course", Value: course },
      { Attribute: "mx_University", Value: university },
      { Attribute: "mx_UTM_Keyword", Value: utmTerm },
      { Attribute: "mx_UTM_Location", Value: utmLocation },
      { Attribute: "Source", Value: utmSource },
      { Attribute: "SourceCampaign", Value: utmCampaign },
      { Attribute: "SourceContent", Value: utmContent },
      { Attribute: "SourceMedium", Value: utmMedium },
      { Attribute: "mx_SourceIPAddress", Value: clientIp },
      { Attribute: "mx_GCLID", Value: gclid },
    ];

    let crmSaved = false;
    let crmResponse: any = null;
    if (crmApiUrl && crmApiUrl.startsWith("http")) {
      try {
        console.log("Submitting to LeadSquared CRM:", JSON.stringify(crmPayload, null, 2));
        const crmRes = await fetch(crmApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(crmPayload),
        });
        if (crmRes.ok) {
          crmResponse = await crmRes.json();
          if (crmResponse && crmResponse.Status === "Success") {
            crmSaved = true;
            console.log("Successfully recorded lead in LeadSquared CRM:", crmResponse);
          } else if (
            crmResponse &&
            crmResponse.ExceptionType === "MXDuplicateEntryException"
          ) {
            crmSaved = true;
            console.log("Lead already exists in LeadSquared CRM (duplicate phone/email):", crmResponse.ExceptionMessage);
          } else {
            console.warn("LeadSquared CRM warning/response:", crmResponse);
          }
        } else {
          console.warn("LeadSquared CRM returned non-OK status:", crmRes.status);
        }
      } catch (crmErr) {
        console.error("Failed to forward lead to LeadSquared CRM:", crmErr);
      }
    }

    // 2. Forward to Google Sheets Web App
    const webhookUrl =
      process.env.GOOGLE_SHEET_WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL ||
      DEFAULT_GOOGLE_SHEET_URL;
    let sheetSaved = false;
    if (webhookUrl && webhookUrl.startsWith("http")) {
      try {
        const sheetRes = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadData),
        });
        if (sheetRes.ok) {
          sheetSaved = true;
          console.log("Successfully forwarded lead to Google Sheet");
        } else {
          console.warn("Google Sheet responded with non-200 status:", sheetRes.status);
        }
      } catch (sheetErr) {
        console.error("Failed to forward lead to Google Sheets webhook:", sheetErr);
      }
    }

    // 3. Local Backup Storage (data/leads.json) to guarantee zero lead loss
    try {
      const dataDir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const leadsFile = path.join(dataDir, "leads.json");
      let existingLeads: any[] = [];
      if (fs.existsSync(leadsFile)) {
        try {
          existingLeads = JSON.parse(fs.readFileSync(leadsFile, "utf8"));
        } catch {
          existingLeads = [];
        }
      }
      existingLeads.unshift(leadData);
      fs.writeFileSync(leadsFile, JSON.stringify(existingLeads, null, 2), "utf8");
    } catch (fsErr) {
      console.error("Local lead backup error:", fsErr);
    }

    return NextResponse.json({
      success: true,
      message: "Lead recorded successfully",
      crmSaved,
      sheetSaved,
      crmResponse: crmResponse?.Status || (crmSaved ? "Saved" : "Failed"),
      data: leadData,
    });
  } catch (error: any) {
    console.error("Error processing lead submission:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process lead" },
      { status: 500 }
    );
  }
}

