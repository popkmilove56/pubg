(() => {
  const SUPABASE_URL = "https://dfjffbzbmkitmnsiifib.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ntEqcHgqsbxQbg_18j_ztg_IdYZcyfu";
  const MEDIA_BUCKET = "site-media";
  const app = document.querySelector("#app");
  const notice = document.querySelector("#notice");
  const sessionArea = document.querySelector("#session-area");
  const fallbackContent = {
    upcomingEvents: [
      { badge: "OPEN", date: "Sat 18:30", registrationStatus: "open", title: "1ST GREEN TOURNAMENT", note: "32 teams · 3,700 THB prize pool", details: "", imageUrl: "", tone: "green", action: "JOIN ON DISCORD", href: "https://discord.gg/rrJvHZfkw" },
      { badge: "WEEKLY", date: "Fri 20:00", registrationStatus: "open", title: "POINTS SCRIM", note: "Entry [price]", details: "", imageUrl: "", tone: "pink", action: "JOIN ON DISCORD", href: "https://discord.gg/rrJvHZfkw" },
      { badge: "SOON", date: "[Date]", registrationStatus: "open", title: "SEASON FINALE", note: "Details to be announced", details: "", imageUrl: "", tone: "purple", action: "NOTIFY ME", href: "https://discord.gg/rrJvHZfkw" },
    ],
    live: { isOnAir: false, streamLabel: "Streamed on Facebook Live", matchTitle: "FINAL · MATCH 2 OF 3", description: "The real Facebook or YouTube stream is embedded here.", streamUrl: "https://www.facebook.com/Phetvaravut?locale=th_TH", replayUrl: "", tournamentId: "" },
    pastTournamentIds: [],
    pastTournamentMedia: {},
    featuredTournamentId: "",
    workTitle: "WORK & UPDATES",
    workUpdates: [
      { title: "GRAPHICS", summary: "Posters, leaderboards and stream overlays", detail: "Updates for graphics will appear here." },
      { title: "TEAM UPDATES", summary: "Rosters, results and announcements", detail: "Updates for team updates will appear here." },
      { title: "BEHIND THE SCENES", summary: "How each event is built and run", detail: "Updates from behind the scenes will appear here." },
      { title: "SITE & TOOLS", summary: "The pages and tools behind the events", detail: "Updates about the site and tools will appear here." },
    ],
  };

  let db;
  let content = structuredClone(fallbackContent);
  let tournaments = [];
  let teams = [];
  let user = null;
  let uploading = new Set();

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);

  function showNotice(message, tone = "success") {
    notice.hidden = !message;
    notice.textContent = message || "";
    notice.dataset.tone = tone === "error" ? "error" : "success";
  }

  function getSession() {
    return db.auth.getSession().then(({ data, error }) => {
      if (error) throw error;
      user = data.session?.user ?? null;
    });
  }

  function renderSession() {
    sessionArea.innerHTML = user
      ? `<button class="button" id="sign-out">LOG OUT · ${escapeHtml(user.email || "ADMIN")}</button>`
      : "";
    document.querySelector("#sign-out")?.addEventListener("click", async () => {
      const { error } = await db.auth.signOut();
      if (error) return showNotice(error.message, "error");
      user = null;
      render();
    });
  }

  function renderLogin() {
    app.innerHTML = `<section class="panel login-card"><div class="panel-heading"><div><p class="section-kicker">ADMIN ACCESS</p><h2>Sign in to edit website content</h2><p>ใช้บัญชีแอดมิน Supabase เดียวกับระบบจัดการ Tournament</p></div></div><form id="login-form"><label class="field"><span>ADMIN EMAIL</span><input name="email" type="email" autocomplete="username" required></label><label class="field"><span>PASSWORD</span><input name="password" type="password" autocomplete="current-password" required></label><button class="button primary" type="submit">ADMIN LOGIN</button></form></section>`;
    document.querySelector("#login-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = event.currentTarget.querySelector("button");
      button.disabled = true;
      showNotice("");
      const form = new FormData(event.currentTarget);
      const { data, error } = await db.auth.signInWithPassword({
        email: form.get("email"),
        password: form.get("password"),
      });
      button.disabled = false;
      if (error) return showNotice(error.message, "error");
      user = data.user;
      render();
    });
  }

  function captureForm() {
    const form = document.querySelector("#content-form");
    if (!form) return;
    const values = new FormData(form);
    content = {
      upcomingEvents: content.upcomingEvents.map((event, index) => ({
        badge: values.get(`eventBadge${index}`) || "",
        date: values.get(`eventDate${index}`) || "",
        registrationStatus: values.get(`eventRegistrationStatus${index}`) === "ended" ? "ended" : "open",
        title: values.get(`eventTitle${index}`) || "",
        note: values.get(`eventNote${index}`) || "",
        details: values.get(`eventDetails${index}`) || "",
        imageUrl: values.get(`eventImageUrl${index}`) || "",
        tone: values.get(`eventTone${index}`) || "green",
        action: values.get(`eventAction${index}`) || "",
        href: values.get(`eventHref${index}`) || "",
      })),
      live: {
        isOnAir: values.has("liveIsOnAir"),
        streamLabel: values.get("liveStreamLabel") || "",
        matchTitle: values.get("liveMatchTitle") || "",
        description: values.get("liveDescription") || "",
        streamUrl: values.get("liveStreamUrl") || "",
        replayUrl: values.get("liveReplayUrl") || "",
        tournamentId: values.get("liveTournamentId") || "",
      },
      pastTournamentIds: values.getAll("pastTournamentIds"),
      pastTournamentMedia: {
        ...(content.pastTournamentMedia || {}),
        ...Object.fromEntries(values.getAll("pastTournamentIds").map((id) => [id, {
          imageUrl: values.get(`pastImageUrl-${id}`) || "",
          details: values.get(`pastDetails-${id}`) || "",
        }])),
      },
      featuredTournamentId: values.get("featuredTournamentId") || "",
      workTitle: values.get("workTitle") || "",
      workUpdates: content.workUpdates.map((item, index) => ({
        title: values.get(`workTitle${index}`) || "",
        summary: values.get(`workSummary${index}`) || "",
        detail: values.get(`workDetail${index}`) || "",
        imageUrl: values.get(`workImageUrl${index}`) || "",
      })),
    };
  }

  function tournamentOption(tournament, selected = false) {
    const status = tournament.status.toUpperCase();
    const date = tournament.created_at ? new Date(tournament.created_at).toLocaleDateString() : "";
    return `<label class="tournament-option"><input type="checkbox" name="pastTournamentIds" value="${escapeHtml(tournament.id)}" ${selected ? "checked" : ""}><span><strong>${escapeHtml(tournament.name)}</strong><small>${escapeHtml(status)} · ${escapeHtml(tournament.category || "Uncategorized")} · ${escapeHtml(date)}</small></span></label>`;
  }

  function imageField(name, url, label, scope, key) {
    return `<div class="image-field">
      <label class="field"><span>${label} · JPG, PNG OR WEBP (MAX 20 MB)</span><input type="file" accept="image/jpeg,image/png,image/webp" data-upload-scope="${scope}" data-upload-key="${escapeHtml(key)}"></label>
      <input type="hidden" name="${name}" value="${escapeHtml(url || "")}">
      ${url ? `<div class="image-preview"><img src="${escapeHtml(url)}" alt="Current image"><button class="button danger" type="button" data-clear-image="${name}">REMOVE IMAGE</button></div>` : '<p class="image-empty">No image selected.</p>'}
      <span class="upload-state" data-upload-state="${name}" aria-live="polite"></span>
    </div>`;
  }

  function renderEditor() {
    const selectedPast = new Set(content.pastTournamentIds || []);
    const pastMedia = content.pastTournamentMedia || {};
    const eventEditors = content.upcomingEvents.map((event, index) => `
      <article class="event-editor">
        <div class="event-editor-head"><span>EVENT ${String(index + 1).padStart(2, "0")}</span><button class="button danger" type="button" data-remove-event="${index}">REMOVE</button></div>
        ${imageField(`eventImageUrl${index}`, event.imageUrl, "CARD IMAGE", "event", String(index))}
        <div class="field-grid">
          <label class="field"><span>BADGE</span><input name="eventBadge${index}" maxlength="20" value="${escapeHtml(event.badge)}" placeholder="OPEN"></label>
          <label class="field"><span>DATE / TIME</span><input name="eventDate${index}" maxlength="40" value="${escapeHtml(event.date)}" placeholder="Sat 18:30"></label>
          <label class="field"><span>REGISTRATION STATUS</span><select name="eventRegistrationStatus${index}"><option value="open" ${event.registrationStatus !== "ended" ? "selected" : ""}>OPEN FOR REGISTRATION</option><option value="ended" ${event.registrationStatus === "ended" ? "selected" : ""}>COMPLETED</option></select></label>
          <label class="field"><span>CARD COLOR</span><select class="tone-select" name="eventTone${index}">${["green", "pink", "purple"].map((tone) => `<option value="${tone}" ${event.tone === tone ? "selected" : ""}>${tone.toUpperCase()}</option>`).join("")}</select></label>
        </div>
        <label class="field"><span>TITLE</span><input name="eventTitle${index}" maxlength="64" value="${escapeHtml(event.title)}" required></label>
        <label class="field"><span>DESCRIPTION</span><input name="eventNote${index}" maxlength="100" value="${escapeHtml(event.note)}"></label>
        <label class="field"><span>POPUP DETAILS</span><textarea name="eventDetails${index}" maxlength="800" placeholder="Rules, venue, prize details, registration information…">${escapeHtml(event.details || "")}</textarea></label>
        <div class="field-grid">
          <label class="field"><span>BUTTON TEXT</span><input name="eventAction${index}" maxlength="28" value="${escapeHtml(event.action)}"></label>
          <label class="field"><span>BUTTON LINK</span><input name="eventHref${index}" type="url" value="${escapeHtml(event.href)}" placeholder="https://..."></label>
        </div>
      </article>`).join("");
    const workEditors = content.workUpdates.map((item, index) => `
      <article class="work-editor">
        <div class="work-editor-head"><span>UPDATE GROUP ${String(index + 1).padStart(2, "0")}</span><button class="button danger" type="button" data-remove-work="${index}">REMOVE</button></div>
        ${imageField(`workImageUrl${index}`, item.imageUrl, "UPDATE IMAGE", "work", String(index))}
        <div class="field-grid">
          <label class="field"><span>GROUP TITLE</span><input name="workTitle${index}" maxlength="40" value="${escapeHtml(item.title)}" required></label>
          <label class="field"><span>SHORT DESCRIPTION</span><input name="workSummary${index}" maxlength="100" value="${escapeHtml(item.summary)}"></label>
        </div>
        <label class="field"><span>UPDATE / DETAILS</span><textarea name="workDetail${index}" maxlength="500">${escapeHtml(item.detail)}</textarea></label>
      </article>`).join("");
    const selectableTournaments = tournaments.filter((item) => item.status !== "active").map((item) => tournamentOption(item, selectedPast.has(item.id))).join("");
    const pastMediaEditors = tournaments.filter((item) => selectedPast.has(item.id)).map((item) => `
      <article class="event-editor past-media-editor">
        <div class="event-editor-head"><span>${escapeHtml(item.name)}</span></div>
        ${imageField(`pastImageUrl-${item.id}`, pastMedia[item.id]?.imageUrl, "CARD IMAGE", "past", item.id)}
        <label class="field"><span>POPUP DETAILS</span><textarea name="pastDetails-${item.id}" maxlength="800" placeholder="Add an event summary or other details…">${escapeHtml(pastMedia[item.id]?.details || "")}</textarea></label>
      </article>`).join("");

    app.innerHTML = `<form id="content-form" class="editor-form">
      <section class="panel">
        <div class="panel-heading"><div><p class="section-kicker">UPCOMING EVENTS</p><h2>Event cards</h2><p>จัดการการ์ดกิจกรรมที่แสดงใน Hero ของหน้าเว็บ</p></div><button class="button" type="button" id="add-event">+ ADD EVENT</button></div>
        <div class="event-list">${eventEditors || '<div class="empty-state">ยังไม่มี Event card</div>'}</div>
      </section>

      <section class="panel">
        <div class="panel-heading"><div><p class="section-kicker">LIVE · ON AIR</p><h2>Live stream and scoreboard</h2><p>จัดการสถานะถ่ายทอดสด ลิงก์ และเลือกคะแนนจาก Tournament ที่กำลังแข่งหรือจบแล้ว · รองรับ Facebook Live และ YouTube Live</p></div></div>
        <label class="check-field"><input type="checkbox" name="liveIsOnAir" ${content.live.isOnAir ? "checked" : ""}> แสดงสถานะ ON AIR</label>
        <div class="field-grid">
          <label class="field"><span>STREAM LABEL</span><input name="liveStreamLabel" maxlength="60" value="${escapeHtml(content.live.streamLabel)}"></label>
          <label class="field"><span>MATCH TITLE</span><input name="liveMatchTitle" maxlength="80" value="${escapeHtml(content.live.matchTitle)}"></label>
          <label class="field"><span>STREAM URL · FACEBOOK / YOUTUBE LIVE</span><input name="liveStreamUrl" type="url" value="${escapeHtml(content.live.streamUrl)}" placeholder="https://www.youtube.com/live/..."></label>
          <label class="field"><span>REPLAY URL</span><input name="liveReplayUrl" type="url" value="${escapeHtml(content.live.replayUrl)}" placeholder="https://..."></label>
        </div>
        <label class="field"><span>DESCRIPTION</span><textarea name="liveDescription" maxlength="180">${escapeHtml(content.live.description)}</textarea></label>
        <label class="field"><span>LIVE SCORE SOURCE</span><select name="liveTournamentId"><option value="">ไม่แสดงตารางคะแนน</option>${tournaments.filter((item) => item.status === "active" || item.status === "complete").map((item) => `<option value="${escapeHtml(item.id)}" ${content.live.tournamentId === item.id ? "selected" : ""}>${escapeHtml(item.name)} · ${item.status === "complete" ? "FINAL RESULTS" : `LIVE · MAP ${item.current_map}/${item.total_maps}`}</option>`).join("")}</select></label>
      </section>

      <section class="panel">
        <div class="panel-heading"><div><p class="section-kicker">PAST TOURNAMENTS</p><h2>Select tournament history</h2><p>เลือกผลการแข่งขันจากรายการเดิม การ์ดจะดึงชื่อ ประเภท ทีมชนะ และจำนวนทีมจากฐานข้อมูล</p></div></div>
        <div class="tournament-list">${selectableTournaments || '<p class="empty-state">ยังไม่มี Tournament ในระบบ</p>'}</div>
        ${pastMediaEditors ? `<div class="past-media-list"><p class="field-label">CARD IMAGE AND POPUP DETAILS</p>${pastMediaEditors}</div>` : '<p class="section-note">เลือก Tournament ด้านบนเพื่อเพิ่มภาพและรายละเอียด popup ของแต่ละรายการ</p>'}
      </section>

      <section class="panel">
        <div class="panel-heading"><div><p class="section-kicker">FROM THE LATEST TOURNAMENT</p><h2>Featured final standings</h2><p>เลือก Tournament เพื่อแสดงอันดับ คะแนน และโลโก้ทีมจากผลจริง</p></div></div>
        <label class="field"><span>TOURNAMENT</span><select name="featuredTournamentId"><option value="">ยังไม่เลือก</option>${tournaments.filter((item) => item.status !== "active").map((item) => `<option value="${escapeHtml(item.id)}" ${content.featuredTournamentId === item.id ? "selected" : ""}>${escapeHtml(item.name)} · ${escapeHtml(item.status.toUpperCase())}</option>`).join("")}</select></label>
      </section>

      <section class="panel">
        <div class="panel-heading"><div><p class="section-kicker">WORK &amp; UPDATES</p><h2>Homepage updates</h2><p>แก้ชื่อหัวข้อและรายการอัปเดตที่แสดงใน accordion</p></div><button class="button" type="button" id="add-work">+ ADD GROUP</button></div>
        <label class="field"><span>SECTION TITLE</span><input name="workTitle" maxlength="48" value="${escapeHtml(content.workTitle)}"></label>
        <div class="work-list">${workEditors || '<div class="empty-state">ยังไม่มีกลุ่มอัปเดต</div>'}</div>
      </section>

      <div class="save-bar"><span>บันทึกแล้วหน้าเว็บสาธารณะจะใช้ข้อมูลชุดใหม่นี้</span><button class="button primary" type="submit">SAVE WEBSITE CONTENT</button></div>
    </form>`;

    document.querySelector("#add-event").addEventListener("click", () => {
      captureForm();
      content.upcomingEvents.push({ badge: "", date: "", registrationStatus: "open", title: "", note: "", details: "", imageUrl: "", tone: "green", action: "", href: "" });
      renderEditor();
    });
    document.querySelectorAll("[data-remove-event]").forEach((button) => button.addEventListener("click", () => {
      captureForm();
      content.upcomingEvents.splice(Number(button.dataset.removeEvent), 1);
      renderEditor();
    }));
    document.querySelector("#add-work").addEventListener("click", () => {
      captureForm();
      content.workUpdates.push({ title: "", summary: "", detail: "", imageUrl: "" });
      renderEditor();
    });
    document.querySelectorAll("[data-remove-work]").forEach((button) => button.addEventListener("click", () => {
      captureForm();
      content.workUpdates.splice(Number(button.dataset.removeWork), 1);
      renderEditor();
    }));
    document.querySelectorAll('input[type="checkbox"][name="pastTournamentIds"]').forEach((checkbox) => checkbox.addEventListener("change", () => {
      captureForm();
      renderEditor();
    }));
    document.querySelectorAll("[data-upload-scope]").forEach((input) => input.addEventListener("change", () => selectCardImage(input)));
    document.querySelectorAll("[data-clear-image]").forEach((button) => button.addEventListener("click", () => {
      captureForm();
      const name = button.dataset.clearImage;
      if (name.startsWith("eventImageUrl")) {
        content.upcomingEvents[Number(name.replace("eventImageUrl", ""))].imageUrl = "";
      } else if (name.startsWith("workImageUrl")) {
        content.workUpdates[Number(name.replace("workImageUrl", ""))].imageUrl = "";
      } else {
        delete content.pastTournamentMedia[name.replace("pastImageUrl-", "")]?.imageUrl;
      }
      renderEditor();
    }));
    document.querySelector("#content-form").addEventListener("submit", saveContent);
  }

  async function selectCardImage(input) {
    const file = input.files?.[0];
    if (!file) return;
    const { uploadScope: scope, uploadKey: key } = input.dataset;
    input.value = "";
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return showNotice("เลือกรูป JPG, PNG หรือ WEBP เท่านั้น", "error");
    }
    if (file.size > 20 * 1024 * 1024) {
      return showNotice("รูปต้องมีขนาดไม่เกิน 20 MB", "error");
    }

    captureForm();
    const croppedFile = await openImageCropper(file);
    if (croppedFile) await uploadCardImage(croppedFile, scope, key);
  }

  function openImageCropper(file) {
    return new Promise((resolve) => {
      const image = new Image();
      const modal = document.createElement("div");
      modal.className = "crop-modal-backdrop";
      modal.innerHTML = `<section class="crop-modal" role="dialog" aria-modal="true" aria-labelledby="crop-title">
        <header class="crop-modal-header"><div><p class="section-kicker">CARD IMAGE</p><h2 id="crop-title">Crop image</h2><p>ลากรูปเพื่อจัดตำแหน่ง และปรับซูมให้พอดีกับการ์ด</p></div><button class="button crop-close" type="button" aria-label="Close crop tool">×</button></header>
        <div class="crop-stage"><canvas width="960" height="540" aria-label="Image crop preview"></canvas></div>
        <label class="crop-zoom"><span>ZOOM</span><input type="range" min="1" max="3" value="1" step="0.01"><output>100%</output></label>
        <p class="crop-error" role="alert"></p>
        <footer class="crop-actions"><button type="button" class="button crop-cancel">CANCEL</button><button type="button" class="button primary crop-confirm">USE CROP &amp; UPLOAD</button></footer>
      </section>`;
      document.body.append(modal);

      const canvas = modal.querySelector("canvas");
      const context = canvas.getContext("2d");
      const zoomInput = modal.querySelector('input[type="range"]');
      const zoomOutput = modal.querySelector("output");
      const confirmButton = modal.querySelector(".crop-confirm");
      const cropError = modal.querySelector(".crop-error");
      let zoom = 1;
      let imageX = 0;
      let imageY = 0;
      let displayWidth = 0;
      let displayHeight = 0;
      let dragPoint = null;
      let settled = false;
      let objectUrl = "";

      const finish = (result) => {
        if (settled) return;
        settled = true;
        document.removeEventListener("keydown", closeOnEscape);
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        modal.remove();
        resolve(result);
      };
      const closeOnEscape = (event) => {
        if (event.key === "Escape") finish(null);
      };
      const draw = (recenter = false) => {
        const baseScale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight) * zoom;
        displayWidth = image.naturalWidth * baseScale;
        displayHeight = image.naturalHeight * baseScale;
        if (recenter) {
          imageX = (canvas.width - displayWidth) / 2;
          imageY = (canvas.height - displayHeight) / 2;
        }
        imageX = Math.min(0, Math.max(canvas.width - displayWidth, imageX));
        imageY = Math.min(0, Math.max(canvas.height - displayHeight, imageY));
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, imageX, imageY, displayWidth, displayHeight);
      };

      modal.querySelectorAll(".crop-close, .crop-cancel").forEach((button) => button.addEventListener("click", () => finish(null)));
      modal.addEventListener("mousedown", (event) => {
        if (event.target === modal) finish(null);
      });
      zoomInput.addEventListener("input", () => {
        zoom = Number(zoomInput.value);
        zoomOutput.value = `${Math.round(zoom * 100)}%`;
        draw(true);
      });
      canvas.addEventListener("pointerdown", (event) => {
        dragPoint = { x: event.clientX, y: event.clientY };
        canvas.setPointerCapture(event.pointerId);
      });
      canvas.addEventListener("pointermove", (event) => {
        if (!dragPoint) return;
        const bounds = canvas.getBoundingClientRect();
        imageX += (event.clientX - dragPoint.x) * canvas.width / bounds.width;
        imageY += (event.clientY - dragPoint.y) * canvas.height / bounds.height;
        dragPoint = { x: event.clientX, y: event.clientY };
        draw();
      });
      canvas.addEventListener("pointerup", () => { dragPoint = null; });
      canvas.addEventListener("pointercancel", () => { dragPoint = null; });
      confirmButton.addEventListener("click", () => {
        confirmButton.disabled = true;
        canvas.toBlob((blob) => {
          if (!blob) {
            confirmButton.disabled = false;
            cropError.textContent = "เตรียมรูปที่ crop ไม่สำเร็จ กรุณาลองใหม่";
            return;
          }
          const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
          const cropped = new File([blob], file.name.replace(/\.[^.]+$/, "") + `-cropped.${extension}`, { type: file.type });
          if (cropped.size > 20 * 1024 * 1024) {
            confirmButton.disabled = false;
            cropError.textContent = "รูปหลัง crop ต้องมีขนาดไม่เกิน 20 MB";
            return;
          }
          finish(cropped);
        }, file.type, file.type === "image/png" ? undefined : 0.92);
      });
      document.addEventListener("keydown", closeOnEscape);
      image.onerror = () => {
        finish(null);
        showNotice("เปิดรูปนี้เพื่อ crop ไม่สำเร็จ กรุณาลองใช้ไฟล์รูปอื่น", "error");
      };
      image.onload = () => draw(true);
      objectUrl = URL.createObjectURL(file);
      image.src = objectUrl;
      modal.querySelector(".crop-close").focus();
    });
  }

  async function uploadCardImage(file, scope, key) {
    const stateName = scope === "event" ? `eventImageUrl${key}` : scope === "work" ? `workImageUrl${key}` : `pastImageUrl-${key}`;
    const stateNode = document.querySelector(`[data-upload-state="${CSS.escape(stateName)}"]`);
    if (stateNode) stateNode.textContent = "UPLOADING…";
    const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
    const path = `${user.id}/homepage/${scope}-${key}-${Date.now()}.${extension}`;
    const { data, error } = await db.storage.from(MEDIA_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) {
      if (stateNode) stateNode.textContent = "";
      return showNotice(`อัปโหลดรูปไม่สำเร็จ: ${error.message}`, "error");
    }
    const { data: publicData } = db.storage.from(MEDIA_BUCKET).getPublicUrl(data.path);
    if (scope === "event") {
      content.upcomingEvents[Number(key)].imageUrl = publicData.publicUrl;
    } else if (scope === "work") {
      content.workUpdates[Number(key)].imageUrl = publicData.publicUrl;
    } else {
      content.pastTournamentMedia[key] = { ...(content.pastTournamentMedia[key] || {}), imageUrl: publicData.publicUrl };
    }
    renderEditor();
    showNotice("อัปโหลดรูปแล้ว อย่าลืมกด SAVE WEBSITE CONTENT");
  }

  async function saveContent(event) {
    event.preventDefault();
    captureForm();
    const button = event.currentTarget.querySelector('[type="submit"]');
    button.disabled = true;
    showNotice("");
    const { error } = await db.from("site_content").upsert({
      key: "homepage",
      content,
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" });
    button.disabled = false;
    if (error) return showNotice(error.message, "error");
    showNotice("บันทึกเนื้อหาเว็บไซต์เรียบร้อยแล้ว");
  }

  async function loadContent() {
    const [{ data: contentRow, error: contentError }, { data: tournamentRows, error: tournamentError }, { data: teamRows, error: teamError }] = await Promise.all([
      db.from("site_content").select("content").eq("key", "homepage").maybeSingle(),
      db.from("tournaments").select("id, name, category, status, total_maps, current_map, created_at, team_ids, team_slots").order("created_at", { ascending: false }),
      db.from("teams").select("id, name, logo, short_name, team_color"),
    ]);
    if (contentError || tournamentError || teamError) {
      throw contentError || tournamentError || teamError;
    }
    tournaments = tournamentRows || [];
    teams = teamRows || [];
    if (contentRow?.content) {
      content = {
        ...structuredClone(fallbackContent),
        ...contentRow.content,
        live: { ...fallbackContent.live, ...(contentRow.content.live || {}) },
        upcomingEvents: Array.isArray(contentRow.content.upcomingEvents) ? contentRow.content.upcomingEvents.map((event) => ({
          ...fallbackContent.upcomingEvents[0],
          ...event,
          registrationStatus: event.registrationStatus === "ended" ? "ended" : "open",
        })) : fallbackContent.upcomingEvents,
        workUpdates: Array.isArray(contentRow.content.workUpdates) ? contentRow.content.workUpdates.map((item) => ({
          ...fallbackContent.workUpdates[0],
          ...item,
          imageUrl: item.imageUrl || "",
        })) : fallbackContent.workUpdates,
        pastTournamentIds: Array.isArray(contentRow.content.pastTournamentIds) ? contentRow.content.pastTournamentIds : [],
        pastTournamentMedia: contentRow.content.pastTournamentMedia || {},
      };
    }
  }

  async function render() {
    renderSession();
    showNotice("");
    if (!user) return renderLogin();
    app.innerHTML = '<div class="loading">กำลังโหลดเนื้อหาและ Tournament…</div>';
    try {
      await loadContent();
      renderEditor();
    } catch (error) {
      app.innerHTML = `<div class="notice" data-tone="error" role="alert">โหลดข้อมูลไม่สำเร็จ: ${escapeHtml(error.message || error)}</div>`;
      showNotice("ตรวจสอบว่าได้รันส่วน site_content ใน supabase.sql แล้ว", "error");
    }
  }

  async function start() {
    if (!window.supabase?.createClient) {
      showNotice("Supabase client โหลดไม่สำเร็จ กรุณารีเฟรชหน้า", "error");
      app.innerHTML = "";
      return;
    }
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    try {
      await getSession();
      await render();
    } catch (error) {
      showNotice(`ตรวจสอบ session ไม่สำเร็จ: ${error.message || error}`, "error");
    }
  }

  void start();
})();
