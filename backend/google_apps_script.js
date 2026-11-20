/**
 * VidCare Google Apps Script Backend (Database for Patient, Doctor, Admin)
 * 
 * Instructions:
 * 1. Open Google Sheets (create a new spreadsheet named "VidCare Database").
 * 2. Go to Extensions -> Apps Script.
 * 3. Delete any default code and paste this entire file.
 * 4. Click Deploy -> New Deployment -> Select Type: "Web App".
 * 5. Set:
 *    - Description: "VidCare Auth & Data API"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (crucial for API calls).
 * 6. Click "Deploy" and copy the Web App URL.
 * 7. Paste that URL in your backend .env as GOOGLE_APPS_SCRIPT_URL=<YOUR_COPIED_URL>
 */

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Users Sheet
  let usersSheet = ss.getSheetByName("Users");
  if (!usersSheet) {
    usersSheet = ss.insertSheet("Users");
    usersSheet.appendRow(["ID", "Name", "Email", "Password", "Role", "CreatedAt"]);
    // Seed default admin and doctor
    usersSheet.appendRow(["USR-1", "System Admin", "admin@vidcare.ai", "admin123", "admin", new Date().toISOString()]);
    usersSheet.appendRow(["USR-2", "Dr. Sarah Jenkins", "doctor@vidcare.ai", "doctor123", "doctor", new Date().toISOString()]);
    usersSheet.appendRow(["USR-3", "John Doe", "patient@vidcare.ai", "patient123", "patient", new Date().toISOString()]);
  }

  // 2. Consultations Sheet
  let consultSheet = ss.getSheetByName("Consultations");
  if (!consultSheet) {
    consultSheet = ss.insertSheet("Consultations");
    consultSheet.appendRow(["AppointmentID", "PatientName", "DoctorName", "Date", "Time", "Status", "MeetLink"]);
  }

  // 3. Diagnostic Logs
  let diagSheet = ss.getSheetByName("DiagnosticLogs");
  if (!diagSheet) {
    diagSheet = ss.insertSheet("DiagnosticLogs");
    diagSheet.appendRow(["LogID", "UserEmail", "ToolType", "Result", "Confidence", "Timestamp"]);
  }
}

function doPost(e) {
  try {
    setupDatabase();
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const usersSheet = ss.getSheetByName("Users");

    if (action === "register") {
      const email = (data.email || "").trim().toLowerCase();
      const name = data.name || "User";
      const password = data.password || "";
      const role = (data.role || "patient").toLowerCase();

      // Check if user already exists
      const rows = usersSheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][2].toString().toLowerCase() === email) {
          return createJsonResponse({ status: "error", message: "User already exists with this email." });
        }
      }

      const id = "USR-" + (rows.length);
      usersSheet.appendRow([id, name, email, password, role, new Date().toISOString()]);

      return createJsonResponse({
        status: "success",
        message: "Registration successful!",
        user: { id: id, name: name, email: email, role: role }
      });
    }

    if (action === "login") {
      const email = (data.email || "").trim().toLowerCase();
      const password = data.password || "";
      const expectedRole = (data.role || "").toLowerCase();

      const rows = usersSheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        const rowId = rows[i][0];
        const rowName = rows[i][1];
        const rowEmail = rows[i][2].toString().toLowerCase();
        const rowPassword = rows[i][3].toString();
        const rowRole = rows[i][4].toString().toLowerCase();

        if (rowEmail === email && rowPassword === password) {
          if (expectedRole && rowRole !== expectedRole) {
            return createJsonResponse({
              status: "error",
              message: "Role mismatch. You are registered as " + rowRole + ", but tried logging in as " + expectedRole + "."
            });
          }

          return createJsonResponse({
            status: "success",
            message: "Login successful!",
            user: { id: rowId, name: rowName, email: rowEmail, role: rowRole }
          });
        }
      }

      return createJsonResponse({ status: "error", message: "Invalid email or password." });
    }

    if (action === "get_users") {
      const rows = usersSheet.getDataRange().getValues();
      const users = [];
      for (let i = 1; i < rows.length; i++) {
        users.push({
          id: rows[i][0],
          name: rows[i][1],
          email: rows[i][2],
          role: rows[i][4],
          createdAt: rows[i][5]
        });
      }
      return createJsonResponse({ status: "success", users: users });
    }

    return createJsonResponse({ status: "error", message: "Unknown action: " + action });

  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

function doGet(e) {
  return createJsonResponse({ status: "ok", message: "VidCare Google Apps Script Service is Active." });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
