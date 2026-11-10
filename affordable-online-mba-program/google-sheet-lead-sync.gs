/**
 * Google Apps Script for mbaonline.online Lead Capture & CRM Sync
 * 
 * INSTRUCTIONS TO DEPLOY:
 * 1. Open Google Sheets (create a new blank spreadsheet or use your existing leads sheet).
 * 2. In Google Sheets menu, click: Extensions -> Apps Script.
 * 3. Delete any code in the editor and PASTE this entire script.
 * 4. Click the "Save" icon (Ctrl + S).
 * 5. Click "Deploy" -> "New deployment".
 * 6. Under "Select type", choose "Web app" (click gear icon next to "Select type").
 * 7. Set the following options:
 *    - Description: "MBA Online Lead Webhook"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone" (CRITICAL: Must be Anyone so web forms can submit leads!)
 * 8. Click "Deploy".
 * 9. Review and grant permissions if prompted.
 * 10. COPY the "Web app URL" (it looks like: https://script.google.com/macros/s/AKfycb.../exec).
 * 11. Paste that URL into index.html where it says:
 *     const GOOGLE_SHEET_WEBHOOK_URL = "YOUR_COPIED_URL_HERE";
 */

// LeadSquared CRM API URL with credentials
var LEADSQUARED_API_URL = "https://api-in21.leadsquared.com/v2/LeadManagement.svc/Lead.Capture?accessKey=u$r3040ef6ef283391cca5c19f26c3649eb&secretKey=69aedb87702c8a1f0781c891f02ead4228a924fc";

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 10 seconds for concurrent submissions
  lock.tryLock(10000);
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};
    
    // Parse incoming JSON body or URL-encoded form data
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }
    
    // If the sheet is empty, auto-create styled column headers
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Timestamp (IST)",
        "Full Name",
        "Phone Number",
        "Email Address",
        "Program / Course",
        "University / College",
        "State",
        "City",
        "Status",
        "UTM Source",
        "UTM Medium",
        "UTM Campaign",
        "UTM Term / Keyword",
        "UTM Content",
        "UTM Location",
        "GCLID",
        "LeadSquared Status",
        "Page URL"
      ];
      sheet.appendRow(headers);
      
      // Style the header row (Navy blue background with bold white text)
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#022C58");
      headerRange.setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }
    
    // Format timestamp in IST (Asia/Kolkata)
    var timestamp = data.timestamp || Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy, hh:mm:ss a");
    var name = (data.name || "").trim();
    var phone = (data.phone || "").trim();
    var email = (data.email || "").trim();
    var program = (data.course || data.program || "").trim();
    var university = (data.university || data.college || "").trim();
    var state = (data.state || "").trim();
    var city = (data.city || "").trim();
    var status = (data.status || "Working Professional").trim();
    var source = (data.utm_source || data.source || "Website").trim();
    var medium = (data.utm_medium || "Direct").trim();
    var campaign = (data.utm_campaign || "Affordable MBA Program").trim();
    var term = (data.utm_term || data.utm_keyword || "").trim();
    var content = (data.utm_content || "").trim();
    var location = (data.utm_location || "").trim();
    var gclid = (data.gclid || "").trim();
    var pageUrl = (data.pageUrl || "").trim();
    
    // Server-to-server forward to LeadSquared CRM API
    var lsqStatus = "Not Sent";
    try {
      var crmPayload = [
        { "Attribute": "FirstName", "Value": name },
        { "Attribute": "EmailAddress", "Value": email },
        { "Attribute": "Phone", "Value": phone },
        { "Attribute": "mx_State", "Value": state },
        { "Attribute": "mx_City", "Value": city },
        { "Attribute": "mx_Course", "Value": program },
        { "Attribute": "mx_University", "Value": university },
        { "Attribute": "mx_UTM_Keyword", "Value": term },
        { "Attribute": "mx_UTM_Location", "Value": location },
        { "Attribute": "Source", "Value": source },
        { "Attribute": "SourceCampaign", "Value": campaign },
        { "Attribute": "SourceContent", "Value": content },
        { "Attribute": "SourceMedium", "Value": medium },
        { "Attribute": "mx_GCLID", "Value": gclid }
      ];
      
      var options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(crmPayload),
        muteHttpExceptions: true
      };
      
      var response = UrlFetchApp.fetch(LEADSQUARED_API_URL, options);
      var resCode = response.getResponseCode();
      var resText = response.getContentText();
      
      if (resCode >= 200 && resCode < 300) {
        var resJson = JSON.parse(resText);
        if (resJson.Status === "Success") {
          lsqStatus = "Synced (ID: " + (resJson.Message ? resJson.Message.Id : "OK") + ")";
        } else if (resJson.ExceptionType === "MXDuplicateEntryException") {
          lsqStatus = "Synced (Duplicate/Updated)";
        } else {
          lsqStatus = "Warning: " + (resJson.ExceptionMessage || resText);
        }
      } else {
        lsqStatus = "HTTP " + resCode;
      }
    } catch (crmErr) {
      lsqStatus = "Error: " + crmErr.toString();
    }
    
    // Append lead to Google Sheet (using apostrophe before phone so Sheets preserves +91 and 10 digits as text)
    sheet.appendRow([
      timestamp,
      name,
      "'" + phone,
      email,
      program,
      university,
      state,
      city,
      status,
      source,
      medium,
      campaign,
      term,
      content,
      location,
      gclid,
      lsqStatus,
      pageUrl
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Lead recorded in Google Sheet and LeadSquared",
      lsqStatus: lsqStatus
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("MBA Online Google Sheet Webhook is active and waiting for POST submissions!").setMimeType(ContentService.MimeType.TEXT);
}

