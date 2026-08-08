
const http = require("http");

async function request(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 8080,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };
    if (token) options.headers["Authorization"] = "Bearer " + token;

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body ? JSON.parse(body) : null);
        } else {
          reject(new Error("HTTP " + res.statusCode + ": " + body));
        }
      });
    });
    req.on("error", reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  try {
    console.log("Logging in...");
    const loginRes = await request("POST", "/api/v1/auth/login", { email: "admin@knoweb.lk", password: "Admin1234" });
    const token = loginRes.accessToken;

    console.log("Fetching a client ID...");
    const clients = await request("GET", "/api/v1/clients?page=0&size=1", null, token);
    const clientId = (clients.content ? clients.content[0].id : clients[0].id);

    console.log("Fetching a product category ID...");
    const categories = await request("GET", "/api/v1/product-categories", null, token);
    const categoryId = (categories.content ? categories.content[0].id : categories[0].id);

    console.log("Fetching an employee ID...");
    const employees = await request("GET", "/api/v1/employees?page=0&size=10", null, token);
    const empArr = employees.content || employees;
    const salesOfficerId = empArr[0].id;

    console.log("Creating a Lead...");
    const lead = await request("POST", "/api/v1/leads", {
      clientId, title: "Test Flow Lead", estimatedValue: 10000, expectedCloseDate: "2026-12-31",
      status: "NEW", inquirySource: "WEBSITE"
    }, token);
    console.log("Lead ID:", lead.id);

    console.log("Qualifying the Lead...");
    await request("PATCH", "/api/v1/leads/" + lead.id + "/status", { status: "QUALIFIED" }, token);

    console.log("Converting to Opportunity...");
    const convertReq = {
      title: "Test Flow Opportunity",
      productCategoryId: categoryId,
      assignedSalesOfficerId: salesOfficerId,
      estimatedValue: 10000,
      expectedCloseDate: "2026-12-31",
      currency: "USD",
      confidenceLevel: "HIGH"
    };
    const opp1 = await request("POST", "/api/v1/leads/" + lead.id + "/convert-to-opportunity", convertReq, token);
    console.log("Opportunity created:", opp1.id);
    
    console.log("Fetching Opportunity immediately...");
    const oppFetched1 = await request("GET", "/api/v1/opportunities/" + opp1.id, null, token);
    const pbId1 = (oppFetched1.projectBrief && oppFetched1.projectBrief.id) ? oppFetched1.projectBrief.id : "null";
    console.log("Before creating brief -> projectBrief.id:", pbId1);
    const hasProjectBrief1 = Boolean(oppFetched1.projectBriefId) || Boolean(oppFetched1.projectBrief?.id);
    console.log("Before creating brief -> button shows:", hasProjectBrief1 ? "View Project Brief" : "Open Project Brief");

    console.log("Creating Project Brief (initializing)...");
    const brief = await request("POST", "/api/v1/opportunities/" + opp1.id + "/project-brief/initialize", null, token);
    console.log("Brief initialized with ID:", brief.id);

    console.log("Fetching Opportunity again...");
    const oppFetched2 = await request("GET", "/api/v1/opportunities/" + opp1.id, null, token);
    const pbId2 = (oppFetched2.projectBrief && oppFetched2.projectBrief.id) ? oppFetched2.projectBrief.id : "null";
    console.log("After creating brief -> projectBrief.id:", pbId2);
    const hasProjectBrief2 = Boolean(oppFetched2.projectBriefId) || Boolean(oppFetched2.projectBrief?.id);
    console.log("After creating brief -> button shows:", hasProjectBrief2 ? "View Project Brief" : "Open Project Brief");

  } catch (err) {
    console.error(err);
  }
}

run();

