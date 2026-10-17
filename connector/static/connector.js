(() => {
  "use strict";

  /* =========================================================
     SENTINAL AI CONNECTOR
     ========================================================= */

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];


  /* =========================================================
     API CONFIGURATION
     ========================================================= */

  /*
   * Automatically use the current Connector domain.
   * Works with localhost, a public domain, or a deployment URL
   * when this JavaScript is served by the Connector itself.
   */

  const API_BASE = (() => {
    const { port, origin } = window.location;

    // Connector opened directly on port 9000
    if (port === "9000") {
        return origin;
    }

    // Connector accessed through Django on port 7001
    if (port === "7001") {
        return `${origin}/connector`;
    }

    return origin;
})();

  /* API key stored for this browser session only */
  const KEY_HEADER = "X-Sentinal-API-Key";
  const KEY_STORE = "sentinal_api_key";
  const KEY_VERIFY_PATH = "/api/v1/auth/verify";
  const KEY_REVOKE_PATH = "/api/v1/auth/revoke";
  const FLUSH_PATH = "/api/v1/maintenance/flush";

  function getStoredKey() {
    try {
      return sessionStorage.getItem(KEY_STORE) || "";
    } catch {
      return "";
    }
  }


  async function api(path, options = {}) {
    const config = {
      ...options,
      headers: {
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...(getStoredKey()
          ? { [KEY_HEADER]: getStoredKey() }
          : {}),
        ...(options.headers || {})
      }
    };

    const response = await fetch(
      `${API_BASE}${path}`,
      config
    );

    const contentType =
      response.headers.get("content-type") || "";

    let data;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const message =
        typeof data === "object"
          ? data.detail || data.message
          : data;

      throw new Error(
        message || `HTTP ${response.status}`
      );
    }

    return data;
  }


  /* =========================================================
     UTILITY FUNCTIONS
     ========================================================= */

  function setText(id, value) {
    const element = document.getElementById(id);

    if (!element) return;

    element.textContent =
      value === undefined ||
      value === null ||
      value === ""
        ? "-"
        : value;
  }


  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  function formatTime(value) {
    if (!value) return "-";

    try {
      return new Date(value).toLocaleString();
    } catch {
      return String(value);
    }
  }


  function toast(message) {
    const existing = document.querySelector(".toast");

    if (existing) {
      existing.remove();
    }

    const element = document.createElement("div");

    element.className = "toast";
    element.textContent = message;

    document.body.appendChild(element);

    setTimeout(() => {
      element.remove();
    }, 2500);
  }


  /* =========================================================
     SIDEBAR
     ========================================================= */

  const body = document.body;
  const menuBtn = $("#menu-btn");


  function isMobile() {
    return window.matchMedia(
      "(max-width:900px)"
    ).matches;
  }


  function sidebarIsOpen() {
    if (isMobile()) {
      return body.classList.contains("nav-open");
    }

    return !body.classList.contains("collapsed");
  }


  function syncSidebar() {
    if (!menuBtn) return;

    menuBtn.setAttribute(
      "aria-expanded",
      String(sidebarIsOpen())
    );

    const icon = menuBtn.firstElementChild;

    if (icon) {
      icon.textContent =
        sidebarIsOpen()
          ? "menu_open"
          : "menu";
    }
  }


  try {
    if (localStorage.getItem("sidebar") === "closed") {
      body.classList.add("collapsed");
    }
  } catch {}


  menuBtn?.addEventListener("click", () => {
    if (isMobile()) {
      body.classList.toggle("nav-open");
    } else {
      body.classList.toggle("collapsed");

      try {
        localStorage.setItem(
          "sidebar",
          body.classList.contains("collapsed")
            ? "closed"
            : "open"
        );
      } catch {}
    }

    syncSidebar();
  });


  $("#overlay")?.addEventListener("click", () => {
    body.classList.remove("nav-open");
    syncSidebar();
  });


  document.addEventListener("keydown", event => {
    if (
      event.key === "Escape" &&
      body.classList.contains("nav-open")
    ) {
      body.classList.remove("nav-open");
      syncSidebar();
    }
  });


  window
    .matchMedia("(max-width:900px)")
    .addEventListener("change", () => {
      body.classList.remove("nav-open");
      syncSidebar();
    });


  syncSidebar();


  /* =========================================================
     LOGOUT
     ========================================================= */

  function logout() {
    if (!confirm("Log out of Sentinal Connector?")) {
      return;
    }

    body.classList.remove("nav-open");

    const overlay = $("#signed-out");

    if (overlay) {
      overlay.hidden = false;
    }
  }


  $("#logout-btn")?.addEventListener("click", logout);
  $("#logout-top")?.addEventListener("click", logout);


  $("#signin-btn")?.addEventListener("click", () => {
    const overlay = $("#signed-out");

    if (overlay) {
      overlay.hidden = true;
    }
  });


  /* =========================================================
     PAGE NAVIGATION
     ========================================================= */

  const pages = {
    overview: "page-overview",
    applications: "page-applications",
    setup: "page-setup",
    keys: "page-keys",
    events: "page-events",
    logs: "page-logs",
    settings: "page-settings"
  };


  function showPage(page, label = "") {
    console.log("[Sentinal] Opening:", page);

    /* Hide all pages */
    $$(".page").forEach(element => {
      element.classList.remove("active");
    });

    /* Show requested page */
    const pageId = pages[page];

    if (pageId) {
      const target = document.getElementById(pageId);

      if (target) {
        target.classList.add("active");
      } else {
        console.error(
          "[Sentinal] Missing page:",
          pageId
        );
      }
    } else {
      const placeholder = $("#page-placeholder");

      if (placeholder) {
        placeholder.classList.add("active");
        setText("ph-title", label);
      }
    }

    /* Update sidebar active state */
    $$("#nav a").forEach(link => {
      link.classList.toggle(
        "active",
        link.dataset.page === page
      );
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    if (isMobile()) {
      body.classList.remove("nav-open");
      syncSidebar();
    }

    loadPageData(page);
  }


  /* Sidebar click handler */
  $("#nav")?.addEventListener("click", event => {
    const link = event.target.closest("a");

    if (!link) return;

    event.preventDefault();

    const page = link.dataset.page;

    if (!page) return;

    showPage(page, link.textContent.trim());
  });


  /* Buttons with data-go can navigate */
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-go]");

    if (!button) return;

    const page = button.dataset.go;

    if (!pages[page]) return;

    const link = $(`#nav a[data-page="${page}"]`);

    showPage(
      page,
      link ? link.textContent.trim() : page
    );
  });


  /* =========================================================
     OVERVIEW
     ========================================================= */

  async function loadOverview() {
    try {
      const [
        status,
        applications,
        events,
        incidents
      ] = await Promise.all([
        api("/security/status"),
        api("/api/v1/applications"),
        api("/api/v1/events"),
        api("/api/v1/incidents")
      ]);

      setText(
        "connector-status",
        status.connected ? "CONNECTED" : "DISCONNECTED"
      );

      setText(
        "events-count",
        events.total ?? 0
      );

      setText(
        "incident-count",
        incidents.total ?? 0
      );

      setText(
        "application-count",
        applications.total ??
          applications.applications?.length ??
          0
      );

      setText(
        "application-name",
        status.application || "External Application"
      );

      const eventList = events.events || [];

      if (eventList.length) {
        const last = eventList[eventList.length - 1];

        setText(
          "last-event",
          last.event || "UNKNOWN"
        );
      } else {
        setText("last-event", "No events");
      }

    } catch (error) {
      console.error(
        "[Sentinal] Overview:",
        error
      );

      setText("connector-status", "OFFLINE");
    }
  }


  /* =========================================================
     APPLICATIONS
     ========================================================= */

  async function loadApplications() {
    try {
      const data = await api("/api/v1/applications");

      const applications = data.applications || [];

      const container =
        $("#applications-list") ||
        $("#application-list");

      if (!container) return;

      if (!applications.length) {
        container.innerHTML = `
          <div class="empty-state">
            No applications connected.
          </div>
        `;

        return;
      }

      container.innerHTML = applications
        .map(application => `
          <div class="application-item">
            <div>
              <strong>
                ${escapeHtml(
                  application.name ||
                  application.application_name ||
                  application.application ||
                  "Application"
                )}
              </strong>

              <small>
                ${escapeHtml(
                  application.status || "REGISTERED"
                )}
              </small>
            </div>

            <span>
              ${escapeHtml(
                application.last_event || "No events"
              )}
            </span>
          </div>
        `)
        .join("");

    } catch (error) {
      console.error(
        "[Sentinal] Applications:",
        error
      );
    }
  }


  /* =========================================================
     EVENTS
     ========================================================= */

  async function loadEvents() {
    try {
      const data = await api("/api/v1/events");

      renderEvents(data.events || []);

    } catch (error) {
      console.error(
        "[Sentinal] Events:",
        error
      );
    }
  }


  function renderEvents(events) {
    const container =
      $("#events-list") ||
      $("#event-list") ||
      $("#live-events");

    if (!container) return;

    if (!events.length) {
      container.innerHTML = `
        <div class="empty-state">
          No security events received yet.
        </div>
      `;

      return;
    }

    container.innerHTML = events
      .slice()
      .reverse()
      .map(event => {
        const timestamp =
          event.details?.timestamp ||
          event.timestamp ||
          "-";

        return `
          <div class="event-row">
            <div class="event-main">
              <strong>
                ${escapeHtml(event.event || "UNKNOWN_EVENT")}
              </strong>

              <span>
                ${escapeHtml(event.source || "unknown")}
              </span>
            </div>

            <div class="event-details">
              <span>
                User: ${escapeHtml(event.username || "-")}
              </span>

              <span>
                IP: ${escapeHtml(event.source_ip || "-")}
              </span>

              <span>
                Path: ${escapeHtml(event.path || "-")}
              </span>
            </div>

            <div class="event-time">
              ${escapeHtml(formatTime(timestamp))}
            </div>
          </div>
        `;
      })
      .join("");
  }


  /* =========================================================
     INCIDENTS
     ========================================================= */

  async function loadIncidents() {
    try {
      const data = await api("/api/v1/incidents");

      const incidents = data.incidents || [];

      const container =
        $("#incidents-list") ||
        $("#incident-list");

      if (!container) return;

      if (!incidents.length) {
        container.innerHTML = `
          <div class="empty-state">
            No active incidents.
          </div>
        `;

        return;
      }

      container.innerHTML = incidents
        .slice()
        .reverse()
        .map(incident => `
          <div class="incident-row">
            <div>
              <strong>
                ${escapeHtml(
                  incident.threat || "Security Incident"
                )}
              </strong>

              <span>
                ${escapeHtml(
                  incident.risk_level || "UNKNOWN"
                )}
              </span>
            </div>

            <div>
              Risk:
              ${escapeHtml(
                String(incident.risk_score ?? 0)
              )}
            </div>
          </div>
        `)
        .join("");

    } catch (error) {
      console.error(
        "[Sentinal] Incidents:",
        error
      );
    }
  }
    /* =========================================================
     LOGS
     ========================================================= */

  let logs = [];
  let logFilter = "ALL";
  let rowNumber = 0;

  const terminal = $("#terminal");


  function normalizeLog(log) {
    return {
      timestamp:
        log.timestamp ||
        log.time ||
        log.created_at ||
        new Date().toLocaleTimeString(),

      level:
        log.level ||
        log.severity ||
        "INFO",

      tag:
        log.tag ||
        log.category ||
        log.source ||
        "SYSTEM",

      module:
        log.module ||
        log.source ||
        "connector",

      message:
        log.message ||
        log.event ||
        log.details?.message ||
        "Event received"
    };
  }


  function addLogRow(rawLog, prepend = false) {
    if (!terminal) return;

    const log = normalizeLog(rawLog);
    const row = document.createElement("div");

    rowNumber++;

    row.className =
      "log" +
      (rowNumber % 2 ? " alt" : "") +
      (log.level === "ERROR" ? " is-err" : "");

    row.dataset.level = log.level;
    row.dataset.tag = log.tag;
    row.tabIndex = 0;

    row.innerHTML = `
      <span class="ln">
        ${String(rowNumber).padStart(2, "0")}
      </span>

      <span class="ts">
        ${escapeHtml(log.timestamp)}
      </span>

      <span class="lvl ${escapeHtml(log.level)}">
        ${escapeHtml(log.level)}
      </span>

      <span class="mod">
        [${escapeHtml(log.module)}]
      </span>

      <span class="msg">
        ${escapeHtml(log.message)}
      </span>
    `;

    if (prepend) {
      terminal.prepend(row);
    } else {
      terminal.appendChild(row);
    }
  }


  function renderLogs() {
    if (!terminal) return;

    terminal.innerHTML = "";
    rowNumber = 0;

    logs.forEach(log => addLogRow(log));

    applyLogFilters();
  }


  function applyLogFilters() {
    if (!terminal) return;

    const search =
      ($("#search")?.value || "")
        .toLowerCase()
        .trim();

    let visible = 0;

    $$(".log", terminal).forEach(row => {
      const level = row.dataset.level || "";
      const tag = row.dataset.tag || "";

      const filterOK =
        logFilter === "ALL" ||
        level === logFilter ||
        tag.includes(logFilter);

      const searchOK =
        !search ||
        row.textContent.toLowerCase().includes(search);

      const show = filterOK && searchOK;

      row.style.display = show ? "flex" : "none";

      if (show) visible++;
    });

    setText("count-label", `Displaying ${visible} events`);
  }


  async function loadLogs() {
    try {
      const data = await api("/api/v1/logs");

      logs = data.logs || data.events || [];

      renderLogs();

    } catch (error) {
      console.error("[Sentinal] Logs:", error);
    }
  }


  /* =========================================================
     LOG FILTER BUTTONS
     ========================================================= */

  $("#chips")?.addEventListener("click", event => {
    const chip = event.target.closest(".fchip");

    if (!chip) return;

    $$(".fchip").forEach(element => {
      element.classList.toggle("active", element === chip);
    });

    logFilter = chip.dataset.filter || "ALL";

    applyLogFilters();
  });


  $("#search")?.addEventListener(
    "input",
    applyLogFilters
  );


  $("#clear-search")?.addEventListener("click", () => {
    const search = $("#search");

    if (search) {
      search.value = "";
    }

    applyLogFilters();
  });


  /* =========================================================
     LOG INSPECTOR
     ========================================================= */

  function inspectLog(row) {
    if (!row) return;

    $$(".log", terminal).forEach(element => {
      element.classList.remove("sel");
    });

    row.classList.add("sel");

    const level = row.dataset.level || "INFO";
    const levelElement = $("#i-level");

    if (levelElement) {
      levelElement.textContent = level;
      levelElement.className = "lvl " + level;
    }

    setText(
      "i-time",
      $(".ts", row)?.textContent || "-"
    );

    setText(
      "i-module",
      $(".mod", row)?.textContent || "-"
    );

    setText(
      "i-msg",
      $(".msg", row)?.textContent || "-"
    );

    const message = row.textContent || "";

    const ip = message.match(
      /\b(?:\d{1,3}\.){3}\d{1,3}\b/
    );

    setText("i-ip", ip ? ip[0] : "-");

    setText(
      "i-code",
      level === "ERROR" ? "ERROR" : "OK"
    );
  }


  terminal?.addEventListener("click", event => {
    const row = event.target.closest(".log");

    if (row) {
      inspectLog(row);
    }
  });


  terminal?.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;

    const row = event.target.closest(".log");

    if (row) {
      inspectLog(row);
    }
  });


  /* =========================================================
     DOWNLOAD LOGS
     ========================================================= */

  $("#download-btn")?.addEventListener("click", () => {
    if (!terminal) return;

    const content = $$(".log", terminal)
      .filter(row => row.style.display !== "none")
      .map(row =>
        row.innerText
          .replace(/\s+/g, " ")
          .trim()
      )
      .join("\n");

    const blob = new Blob([content], {
      type: "text/plain"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "sentinal-connector.log";

    document.body.appendChild(link);

    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  });


  /* =========================================================
     DIAGNOSTICS
     ========================================================= */

  $("#diag-btn")?.addEventListener(
    "click",
    async event => {
      const button = event.currentTarget;
      const original = button.innerHTML;

      button.disabled = true;
      button.innerHTML = "Checking...";

      try {
        const result = await api("/api/v1/diagnostics");

        console.log("[Sentinal] Diagnostics:", result);

        toast("Diagnostics completed.");

      } catch (error) {
        console.error(error);

        toast("Diagnostics failed.");

      } finally {
        button.disabled = false;
        button.innerHTML = original;
      }
    }
  );


  /* =========================================================
     FLUSH LOGS
     ========================================================= */

  $("#flush-btn")?.addEventListener(
    "click",
    async event => {
      if (!confirm("Flush connector logs?")) {
        return;
      }

      const button = event.currentTarget;
      const original = button.innerHTML;

      button.disabled = true;
      button.innerHTML = "Flushing...";

      try {
        await api("/api/v1/logs/flush", {
          method: "POST"
        });

        logs = [];

        renderLogs();

        toast("Connector logs flushed.");

      } catch (error) {
        console.error(error);

        toast("Unable to flush logs.");

      } finally {
        button.disabled = false;
        button.innerHTML = original;
      }
    }
  );
    /* =========================================================
     SETTINGS
     ========================================================= */

  let serverSettings = {};

  async function loadSettings() {
    try {
      const data = await api("/api/v1/settings");

      serverSettings = data.settings || data || {};

      console.log(
        "[Sentinal] Settings:",
        serverSettings
      );

    } catch (error) {
      console.error(
        "[Sentinal] Settings:",
        error
      );
    }
  }


  const tracked = $$("[data-track]");
  const initial = new Map();

  tracked.forEach(element => {
    initial.set(
      element,
      element.type === "checkbox"
        ? element.checked
        : element.value
    );
  });


  const saveBar = $(".savebar");

  function valueOf(element) {
    return element.type === "checkbox"
      ? element.checked
      : element.value;
  }


  function checkDirty() {
    let changed = 0;

    tracked.forEach(element => {
      if (valueOf(element) !== initial.get(element)) {
        changed++;
      }
    });

    saveBar?.classList.toggle("dirty", changed > 0);

    setText(
      "save-msg",
      changed
        ? `Unsaved changes: ${changed}`
        : "Unsaved changes: none"
    );

    setText(
      "save-sub",
      changed
        ? "(pending save)"
        : "(configuration synced)"
    );
  }


  tracked.forEach(element => {
    element.addEventListener("input", checkDirty);
    element.addEventListener("change", checkDirty);
  });


  $("#hb")?.addEventListener("input", event => {
    setText("hb-val", event.target.value + "s");
  });


  /* =========================================================
     SAVE SETTINGS
     ========================================================= */

  $("#save-btn")?.addEventListener("click", async () => {
    const settings = {};

    tracked.forEach(element => {
      const key = element.dataset.track;

      if (!key) return;

      settings[key] = valueOf(element);
    });

    try {
      await api("/api/v1/settings", {
        method: "PUT",
        body: JSON.stringify(settings)
      });

      tracked.forEach(element => {
        initial.set(element, valueOf(element));
      });

      checkDirty();

      toast("Configuration saved.");

    } catch (error) {
      console.error(
        "[Sentinal] Save settings:",
        error
      );

      toast("Failed to save configuration.");
    }
  });


  /* =========================================================
     RESET SETTINGS
     ========================================================= */

  $("#reset-btn")?.addEventListener("click", () => {
    tracked.forEach(element => {
      const original = initial.get(element);

      if (element.type === "checkbox") {
        element.checked = original;
      } else {
        element.value = original;
      }
    });

    const heartbeat = $("#hb");

    if (heartbeat) {
      setText("hb-val", heartbeat.value + "s");
    }

    checkDirty();

    toast("Changes discarded.");
  });


  /* =========================================================
     COPY ENDPOINT
     ========================================================= */

  $("#copy-btn")?.addEventListener("click", async () => {
    const endpoint = $("#endpoint");

    if (!endpoint) return;

    try {
      await navigator.clipboard.writeText(
        endpoint.value
      );

      toast("Endpoint copied.");

    } catch (error) {
      console.error(error);

      toast("Copy failed.");
    }
  });


  /* =========================================================
     TEST CONNECTION
     ========================================================= */

  $("#test-btn")?.addEventListener(
    "click",
    async event => {
      const button = event.currentTarget;
      const original = button.innerHTML;

      button.disabled = true;
      button.innerHTML = "Testing...";

      try {
        const result = await api(
          "/api/v1/test-connection",
          {
            method: "POST"
          }
        );

        console.log(
          "[Sentinal] Connection test:",
          result
        );

        toast("Connection test completed.");

        await loadOverview();

      } catch (error) {
        console.error(error);

        toast(
          "Connection test failed: " + error.message
        );

      } finally {
        button.disabled = false;
        button.innerHTML = original;
      }
    }
  );


  /* =========================================================
     CERTIFICATE
     ========================================================= */

  $("#renew-btn")?.addEventListener("click", () => {
    toast("Certificate action requested.");
  });


  /* =========================================================
     PAGE DATA ROUTER
     ========================================================= */

  async function loadPageData(page) {
    switch (page) {
      case "overview":
        await loadOverview();
        await loadIncidents();
        break;

      case "applications":
        await loadApplications();
        break;

      case "events":
        await loadEvents();
        break;

      case "logs":
        await loadLogs();
        break;

      case "settings":
        await loadSettings();
        break;

      case "setup":
        await loadConnectionPage();
        break;

      case "keys":
        break;
    }
  }


  /* =========================================================
     REAL-TIME REFRESH
     ========================================================= */

  let lastEventCount = -1;

  async function refreshRealtime() {
    try {
      const data = await api("/api/v1/events");
      const count = Number(data.total || 0);

      if (count !== lastEventCount) {
        lastEventCount = count;

        if (
          $("#page-overview")
            ?.classList.contains("active")
        ) {
          await loadOverview();
          await loadIncidents();
        }

        if (
          $("#page-events")
            ?.classList.contains("active")
        ) {
          renderEvents(data.events || []);
        }

        if (
          $("#page-logs")
            ?.classList.contains("active")
        ) {
          await loadLogs();
        }
      }

    } catch (error) {
      console.warn(
        "[Sentinal] Live refresh:",
        error.message
      );
    }
  }


  setInterval(refreshRealtime, 5000);


  /* =========================================================
     API KEY CONNECT
     ========================================================= */

  (function initKeyConnect() {
    const form = $("#key-form");

    if (!form) return;

    const input = $("#key-input");
    const toggle = $("#key-toggle");
    const pasteBtn = $("#key-paste");
    const connectBtn = $("#key-connect");
    const disconnectBtn = $("#key-disconnect");
    const revokeBtn = $("#key-revoke");
    const flushBtn = $("#key-flush");
    const msg = $("#key-msg");
    const state = $("#key-state");
    const savedRow = $("#key-saved-row");
    const masked = $("#key-masked");

    const BTN_HTML =
      '<span class="ms sm">verified_user</span> Verify connection';


    function mask(key) {
      if (!key) return "-";

      if (key.length <= 8) {
        return "•".repeat(key.length);
      }

      return (
        key.slice(0, 4) +
        "•".repeat(8) +
        key.slice(-4)
      );
    }


    function show(type, text) {
      if (!msg) return;

      msg.hidden = false;
      msg.className = "key-msg " + type;
      msg.textContent = text;
    }


    function setState(label, cls = "") {
      if (!state) return;

      state.textContent = label;
      state.className = "chip" + (
        cls ? " " + cls : ""
      );
    }


    function render() {
      const key = getStoredKey();
      const connected = Boolean(key);

      if (disconnectBtn) {
        disconnectBtn.hidden = !connected;
      }

      /* Revoke is always visible, but only usable with a key. */
      if (revokeBtn) {
        revokeBtn.disabled = !connected;
        revokeBtn.title = connected
          ? "Invalidate this API key on the Connector"
          : "Connect an API key to enable";
      }

      if (savedRow) {
        savedRow.hidden = !connected;
      }

      if (masked) {
        masked.textContent = connected
          ? mask(key)
          : "-";
      }

      if (connectBtn && !connectBtn.disabled) {
        connectBtn.innerHTML = BTN_HTML;
      }

      if (!connected) {
        setState("NOT CONNECTED");
      }
    }


    toggle?.addEventListener("click", () => {
      const showing = input.type === "text";

      input.type = showing
        ? "password"
        : "text";

      if (toggle.firstElementChild) {
        toggle.firstElementChild.textContent =
          showing
            ? "visibility"
            : "visibility_off";
      }
    });


    pasteBtn?.addEventListener(
      "click",
      async () => {
        try {
          const text = (
            await navigator.clipboard.readText()
          ).trim();

          if (text) {
            input.value = text;
            input.focus();
          }

        } catch {
          toast(
            "Clipboard unavailable. Paste using Ctrl+V."
          );
        }
      }
    );


    form.addEventListener("submit", async event => {
      event.preventDefault();

      const key = input.value.trim();

      if (!key) {
        show("bad", "Enter an API key first.");
        setState("NO KEY", "bad");
        input.focus();
        return;
      }

      if (/\s/.test(key)) {
        show(
          "bad",
          "The API key must not contain spaces."
        );

        setState("INVALID", "bad");
        return;
      }

      if (connectBtn) {
        connectBtn.disabled = true;
        connectBtn.textContent = "Verifying...";
      }

      show(
        "warn",
        "Verifying API key with Sentinal Connector..."
      );

      setState("VERIFYING");

      try {
        const response = await fetch(
          `${API_BASE}${KEY_VERIFY_PATH}`,
          {
            method: "POST",
            headers: {
              "X-Sentinal-API-Key": key
            }
          }
        );

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          setState("REJECTED", "bad");

          show(
            "bad",
            data.detail ||
            `Verification failed: HTTP ${response.status}`
          );

          return;
        }

        if (
          data.valid === true &&
          data.authenticated === true
        ) {
          sessionStorage.setItem(KEY_STORE, key);

          input.value = "";
          input.type = "password";

          if (toggle?.firstElementChild) {
            toggle.firstElementChild.textContent =
              "visibility";
          }

          setState("CONNECTED", "ok");

          show(
            "ok",
            data.message ||
            "API key verified successfully."
          );

          toast("API key connected successfully.");

          render();

          await Promise.allSettled([
            loadOverview(),
            loadApplications(),
            loadEvents(),
            loadIncidents()
          ]);

        } else {
          setState("REJECTED", "bad");

          show(
            "bad",
            data.detail ||
            "The Connector did not accept this API key."
          );
        }

      } catch (error) {
        console.error(error);

        setState("OFFLINE", "bad");

        show(
          "bad",
          "Could not reach Connector: " + error.message
        );

      } finally {
        if (connectBtn) {
          connectBtn.disabled = false;
          connectBtn.innerHTML = BTN_HTML;
        }

        render();
      }
    });


    disconnectBtn?.addEventListener("click", () => {
      try {
        sessionStorage.removeItem(KEY_STORE);
      } catch (error) {
        console.error(error);
      }

      if (msg) {
        msg.hidden = true;
      }

      if (input) {
        input.value = "";
      }

      setState("NOT CONNECTED");

      render();

      toast("API key disconnected.");
    });


    /* Flush all: wipe the stored event and application JSON so old data leaves the dashboard. */
    flushBtn?.addEventListener("click", async () => {
      if (
        !confirm(
          "Flush ALL data?\n\n" +
          "This permanently deletes every stored event and every registered " +
          "application (the events JSON and applications JSON) on the Sentinal " +
          "Connector. The dashboard will be empty until new telemetry arrives. " +
          "This cannot be undone."
        )
      ) {
        return;
      }

      /* Destructive admin action: needs the Connector admin key. */
      if (!getAdminKey() && !requestAdminKey()) {
        return;
      }

      const original = flushBtn.innerHTML;

      flushBtn.disabled = true;
      flushBtn.textContent = "Flushing...";

      show("warn", "Flushing all events and applications...");

      try {
        const result = await connectionRequest(FLUSH_PATH, {
          method: "POST",
          body: JSON.stringify({
            events: true,
            applications: true
          })
        });

        /* Only report success when the Connector confirms it. */
        if (!result || result.flushed !== true) {
          show(
            "bad",
            "The Connector did not confirm the flush. Nothing was reported deleted."
          );

          return;
        }

        const events = Number(result.events_removed ?? 0);
        const apps = Number(result.applications_removed ?? 0);

        show(
          "ok",
          result.message ||
          `Flushed ${events} event(s) and ${apps} application(s).`
        );

        toast("All events and applications flushed.");

        /* Force the live refresh to reload from the now-empty store. */
        lastEventCount = -1;

        await Promise.allSettled([
          loadOverview(),
          loadEvents(),
          loadApplications(),
          loadIncidents()
        ]);

      } catch (error) {
        console.error(error);

        const missing = /not found|method not allowed/i.test(error.message);

        show(
          "bad",
          missing
            ? `This Connector has no flush endpoint yet (POST ${FLUSH_PATH}). Nothing was deleted.`
            : error.message + " Nothing was reported deleted."
        );

      } finally {
        flushBtn.innerHTML = original;
        flushBtn.disabled = false;
      }
    });


    /* Revoke: invalidate the key on the Connector, then forget it locally. */
    revokeBtn?.addEventListener("click", async () => {
      const key = getStoredKey();

      if (!key) {
        render();
        return;
      }

      if (
        !confirm(
          "Revoke this connection?\n\n" +
          "The API key will be invalidated on the Sentinal Connector and " +
          "the application will no longer be able to send telemetry. " +
          "This cannot be undone."
        )
      ) {
        return;
      }

      const original = revokeBtn.innerHTML;

      revokeBtn.disabled = true;
      revokeBtn.textContent = "Revoking...";

      show("warn", "Revoking API key on the Sentinal Connector...");

      try {
        const response = await fetch(
          `${API_BASE}${KEY_REVOKE_PATH}`,
          {
            method: "POST",
            headers: { [KEY_HEADER]: key }
          }
        );

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (response.status === 404 || response.status === 405) {
          show(
            "bad",
            `This Connector has no revoke endpoint yet (POST ${KEY_REVOKE_PATH}). The key was NOT revoked.`
          );

          return;
        }

        if (!response.ok) {
          show(
            "bad",
            (data.detail ||
              `Revocation failed: HTTP ${response.status}.`) +
            " The key was NOT revoked."
          );

          return;
        }

        /* Only claim success when the Connector confirms it. */
        if (data.revoked !== true) {
          show(
            "bad",
            "The Connector did not confirm the revocation. The key was NOT revoked."
          );

          return;
        }

        try {
          sessionStorage.removeItem(KEY_STORE);
        } catch (error) {
          console.error(error);
        }

        if (input) {
          input.value = "";
        }

        render();

        setState("REVOKED", "bad");

        show(
          "ok",
          data.message ||
          "Connection revoked. This API key is no longer valid."
        );

        toast("Connection revoked.");

      } catch (error) {
        console.error(error);

        show(
          "bad",
          "Could not reach Connector: " + error.message +
          ". The key was NOT revoked."
        );

      } finally {
        revokeBtn.innerHTML = original;
        revokeBtn.disabled = !getStoredKey();
      }
    });


    if (getStoredKey()) {
      setState("KEY SAVED", "ok");
    }

    render();
  })();
    /* =========================================================
     APPLICATION CONNECTION
     ========================================================= */

  const CONNECTION_ADMIN_STORE = "sentinal_admin_key";


  function getAdminKey() {
    try {
      return sessionStorage.getItem(
        CONNECTION_ADMIN_STORE
      ) || "";
    } catch {
      return "";
    }
  }


  function setConnectionMessage(type, message) {
    const element = $("#connection-message");

    if (!element) {
      toast(message);
      return;
    }

    element.hidden = false;
    element.className = `connection-message ${type}`;
    element.textContent = message;
  }


  function setConnectionStatus(status, type = "") {
    const element = $("#connection-status");

    if (!element) return;

    element.textContent = status;
    element.dataset.state = type;
  }


  function getConnectionForm() {
    return {
      application_name:
        $("#application-name-input")?.value.trim() || "",

      application_url:
        $("#application-url-input")?.value.trim() || "",

      api_key:
        $("#application-api-key-input")?.value.trim() || ""
    };
  }


  function validateConnectionForm(data) {
    if (!data.application_name) {
      throw new Error("Enter the application name.");
    }

    if (!data.application_url) {
      throw new Error("Enter the application URL.");
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(data.application_url);
    } catch {
      throw new Error("Enter a valid application URL.");
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Only HTTP and HTTPS URLs are supported.");
    }

    if (!data.api_key) {
      throw new Error("Enter the application API key.");
    }

    return data;
  }


  async function connectionRequest(path, options = {}) {
    const adminKey = getAdminKey();

    const headers = {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {})
    };

    if (adminKey) {
      headers["X-Sentinal-Admin-Key"] = adminKey;
    }

    const response = await fetch(
      `${API_BASE}${path}`,
      {
        ...options,
        headers
      }
    );

    const contentType =
      response.headers.get("content-type") || "";

    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof data === "object"
          ? data.detail || data.message
          : data;

      throw new Error(
        message || `Request failed: HTTP ${response.status}`
      );
    }

    return data;
  }


  /* =========================================================
     SAVE ADMIN KEY FOR THIS SESSION
     ========================================================= */

  function requestAdminKey() {
    const existing = getAdminKey();

    const entered = window.prompt(
      "Enter the Sentinal Connector admin key:",
      existing
    );

    if (entered === null) {
      return false;
    }

    if (!entered.trim()) {
      toast("Connector admin key is required.");
      return false;
    }

    try {
      sessionStorage.setItem(
        CONNECTION_ADMIN_STORE,
        entered.trim()
      );

      return true;
    } catch {
      toast("Unable to store the admin key.");
      return false;
    }
  }


  /* =========================================================
     VERIFY APPLICATION URL
     ========================================================= */

  async function verifyApplicationConnection() {
    let data;

    try {
      data = validateConnectionForm(
        getConnectionForm()
      );
    } catch (error) {
      setConnectionMessage("error", error.message);
      return;
    }

    const button = $("#verify-application-btn");

    if (button) {
      button.disabled = true;
      button.textContent = "Verifying...";
    }

    setConnectionStatus("VERIFYING", "pending");

    setConnectionMessage(
      "info",
      "Checking application reachability and API documentation..."
    );

    try {
      const result = await connectionRequest(
        "/api/v1/connections/verify",
        {
          method: "POST",
          body: JSON.stringify({
            application_name: data.application_name,
            application_url: data.application_url
          })
        }
      );

      if (result.reachable === false) {
        setConnectionStatus("UNREACHABLE", "error");

        setConnectionMessage(
          "error",
          result.message ||
          "The application could not be reached."
        );

        return;
      }

      setConnectionStatus(
        result.reachable ? "REACHABLE" : "CHECK RESULT",
        result.reachable ? "success" : "pending"
      );

      setConnectionMessage(
        "success",
        result.message ||
        "Reachability check completed. API-key validity has not yet been established."
      );

    } catch (error) {
      console.error(
        "[Sentinal] Application verification:",
        error
      );

      setConnectionStatus("VERIFICATION FAILED", "error");

      setConnectionMessage(
        "error",
        error.message
      );

    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Verify URL";
      }
    }
  }


  /* =========================================================
     ANALYZE API INTEGRATION
     ========================================================= */

  async function analyzeApplicationIntegration() {
    let data;

    try {
      data = validateConnectionForm(
        getConnectionForm()
      );
    } catch (error) {
      setConnectionMessage("error", error.message);
      return;
    }

    const button = $("#analyze-application-btn");

    if (button) {
      button.disabled = true;
      button.textContent = "Analyzing...";
    }

    setConnectionStatus("ANALYZING API", "pending");

    setConnectionMessage(
      "info",
      "Analyzing API documentation and integration compatibility..."
    );

    try {
      const result = await connectionRequest(
        "/api/v1/connections/analyze",
        {
          method: "POST",
          body: JSON.stringify({
            application_name: data.application_name,
            application_url: data.application_url
          })
        }
      );

      const output = $("#integration-analysis");

      if (output) {
        output.hidden = false;

        output.textContent = JSON.stringify(
          result,
          null,
          2
        );
      }

      const compatible =
        result.compatible === true ||
        result.integration_compatible === true;

      setConnectionStatus(
        compatible ? "COMPATIBLE" : "ANALYSIS COMPLETE",
        compatible ? "success" : "pending"
      );

      setConnectionMessage(
        compatible ? "success" : "info",
        result.message ||
        "Analysis completed. Review the results before installation."
      );

    } catch (error) {
      console.error(
        "[Sentinal] Integration analysis:",
        error
      );

      setConnectionStatus("ANALYSIS FAILED", "error");

      setConnectionMessage(
        "error",
        error.message
      );

    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Analyze API";
      }
    }
  }


  /* =========================================================
     DOWNLOAD INTEGRATION PACKAGE
     ========================================================= */

  async function downloadIntegrationPackage() {
    let data;

    try {
      data = validateConnectionForm(
        getConnectionForm()
      );
    } catch (error) {
      setConnectionMessage("error", error.message);
      return;
    }

    const button = $("#download-integration-btn");

    if (button) {
      button.disabled = true;
      button.textContent = "Preparing ZIP...";
    }

    try {
      const result = await connectionRequest(
        "/api/v1/connections/install-package",
        {
          method: "POST",
          body: JSON.stringify({
            application_name: data.application_name,
            application_url: data.application_url
          })
        }
      );

      /*
       * Support either a direct ZIP response or a JSON
       * response containing a download URL.
       */

      if (result.download_url) {
        const downloadUrl = new URL(
          result.download_url,
          API_BASE
        );

        if (downloadUrl.origin !== API_BASE) {
          throw new Error(
            "The installer returned an unexpected download domain."
          );
        }

        const link = document.createElement("a");

        link.href = downloadUrl.href;
        link.download = "sentinal-integration.zip";

        document.body.appendChild(link);
        link.click();
        link.remove();

      } else {
        throw new Error(
          "The backend did not return a download URL. Check the installer endpoint."
        );
      }

      toast("Integration package download requested.");

    } catch (error) {
      console.error(
        "[Sentinal] Installer:",
        error
      );

      setConnectionMessage(
        "error",
        error.message
      );

    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Download Installer ZIP";
      }
    }
  }


  /* =========================================================
     REGISTER APPLICATION
     ========================================================= */

  async function registerApplicationConnection() {
    let data;

    try {
      data = validateConnectionForm(
        getConnectionForm()
      );
    } catch (error) {
      setConnectionMessage("error", error.message);
      return;
    }

    if (!getAdminKey() && !requestAdminKey()) {
      return;
    }

    const button = $("#register-application-btn");

    if (button) {
      button.disabled = true;
      button.textContent = "Registering...";
    }

    setConnectionStatus("REGISTERING", "pending");

    try {
      const result = await connectionRequest(
        "/api/v1/connections/register",
        {
          method: "POST",
          body: JSON.stringify(data)
        }
      );

      setConnectionStatus(
        "REGISTERED",
        "success"
      );

      setConnectionMessage(
        "success",
        result.message ||
        "Application registered successfully."
      );

      /*
       * Never display or save the submitted application
       * API key in page output.
       */

      const keyInput = $("#application-api-key-input");

      if (keyInput) {
        keyInput.value = "";
      }

      await Promise.allSettled([
        loadApplications(),
        loadOverview()
      ]);

    } catch (error) {
      console.error(
        "[Sentinal] Application registration:",
        error
      );

      setConnectionStatus("REGISTRATION FAILED", "error");

      setConnectionMessage(
        "error",
        error.message
      );

    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Register Application";
      }
    }
  }


  /* =========================================================
     CONNECTION PAGE INITIALIZATION
     ========================================================= */

  async function loadConnectionPage() {
    const urlInput = $("#connector-url");

    if (urlInput) {
      urlInput.value = API_BASE;
    }

    const registeredOutput = $("#registered-application");

    if (!registeredOutput) {
      return;
    }

    try {
      const result = await api(
        "/api/v1/applications"
      );

      registeredOutput.textContent = JSON.stringify(
        result.applications || [],
        null,
        2
      );

    } catch (error) {
      registeredOutput.textContent =
        "Unable to load registered applications: " +
        error.message;
    }
  }


  /* =========================================================
     CONNECTOR URL DISPLAY AND COPY
     ========================================================= */

  const connectorUrlInput = $("#connector-url");

  if (connectorUrlInput) {
    connectorUrlInput.value = API_BASE;
  }

  $("#connector-copy")?.addEventListener(
    "click",
    async () => {
      try {
        await navigator.clipboard.writeText(
          API_BASE
        );

        toast("Connector URL copied.");

      } catch {
        toast("Copy failed.");
      }
    }
  );


  /* =========================================================
     CONNECTION BUTTON EVENTS
     ========================================================= */

  $("#verify-application-btn")?.addEventListener(
    "click",
    verifyApplicationConnection
  );

  $("#analyze-application-btn")?.addEventListener(
    "click",
    analyzeApplicationIntegration
  );

  $("#download-integration-btn")?.addEventListener(
    "click",
    downloadIntegrationPackage
  );

  $("#register-application-btn")?.addEventListener(
    "click",
    registerApplicationConnection
  );


  /* =========================================================
     STATUS INDICATORS
     ========================================================= */

  (function statusOrb() {
    const chip = $("#key-state");
    const orb = $("#orb");
    const card = $("#status-card");
    const label = $("#status-label");

    if (!chip || !orb) return;

    const sync = () => {
      const value =
        chip.textContent.trim().toUpperCase();

      let state = "idle";

      if (value === "VERIFYING") {
        state = "verifying";
      } else if (
        value === "CONNECTED" ||
        value === "KEY SAVED"
      ) {
        state = "ok";
      } else if (
        [
          "REJECTED",
          "ERROR",
          "OFFLINE",
          "INVALID",
          "NO KEY",
          "REVOKED"
        ].includes(value)
      ) {
        state = "bad";
      }

      orb.dataset.state = state;

      if (card) {
        card.dataset.state = state;
      }

      if (label) {
        label.textContent = value;
      }
    };

    new MutationObserver(sync).observe(
      chip,
      {
        childList: true,
        characterData: true,
        subtree: true,
        attributes: true
      }
    );

    sync();
  })();


  /* =========================================================
     INITIALIZATION
     ========================================================= */

  showPage("overview", "Overview");

  loadOverview();
  loadApplications();
  loadEvents();
  loadLogs();
  loadSettings();

  console.log(
    "%c SENTINAL AI CONNECTOR ",
    "font-weight:bold;font-size:14px;"
  );

  console.log(
    "Connector API:",
    API_BASE
  );

})();