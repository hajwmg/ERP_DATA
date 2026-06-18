(function () {
  const STORAGE_KEYS = {
    records: "delivery-expiry-records-v1",
    products: "delivery-expiry-products-v1",
    settings: "delivery-expiry-settings-v1",
    activeAssetType: "delivery-expiry-active-asset-type-v1",
  };

  const ASSET_TYPES = ["소모품", "장비"];
  const BULK_IMPORT_PASSWORD = "5802";
  const EXPIRY_WARNING_DAYS = 90;
  const PRIORITY_DELIVERY_DAYS = 365;
  const RECENT_DELIVERY_DAYS = 365;
  const DEFAULT_SUPABASE_CONFIG = {
    supabaseUrl: "https://eqqydboscpvijvscjzbc.supabase.co",
    supabaseKey: "sb_publishable_4BVX7XCBUC3n8rgU-keZUg_A7mUvwkZ",
  };

  const REQUIRED_COLUMNS = [
    "분류",
    "관리유형",
    "납품일",
    "병원명",
    "담당자명",
    "연결그룹",
    "대표제품명",
    "세부모델/규격",
    "수량",
    "단가",
    "LOT번호",
    "유효기간만료일",
    "회계일자",
    "넣은시점",
    "품목코드",
    "기타작성칸",
  ];
  const EXPORT_COLUMNS = [...REQUIRED_COLUMNS, "데이터ID", "입력일", "수정일"];
  const PREPAID_PRIORITY_KEYWORDS = [
    "토탈메디칼",
    "노원을지대병원",
    "의정부을지대병원",
    "이지메디컴",
    "서울대학교병원",
    "서울대병원",
    "서울아산병원",
    "강원대학교병원",
    "강원대병원",
    "분당서울대병원",
    "분당서울대학교병원",
    "에비슨케어",
    "연세의료용품",
    "세브란스",
    "강남세브란스",
    "용인세브란스",
    "신촌세브란스",
    "원주세브란스",
    "세브란스 공급망관리",
    "스마트엠케어",
    "고대구로",
    "고대안산",
    "안산센터",
    "케어캠프",
    "건국대병원",
    "건국대학교병원",
    "삼성서울병원",
    "한양대 구리병원",
    "한양대학교 구리병원",
    "한림대학교 동탄성심",
    "한림대학교 강남성심",
    "디에스비",
    "원광대학교",
    "원광대학교병원",
    "동하메디칼",
    "서울순천향병원",
    "순천향대학교 서울병원",
    "안연케어",
    "오페라살루따리스",
    "여의도성모병원",
    "서울성모병원",
    "은평성모병원",
    "삼성의료원",
    "아산사회재단",
    "강릉아산병원",
    "국민건강보험공단 일산병원",
    "일산병원",
    "위더스메디",
    "일산백병원",
    "상계백병원",
    "BPS",
    "보라매병원",
    "서울특별시 보라매병원",
    "HLS",
    "충남대학교",
    "충남대학교병원",
    "분당제생병원",
    "오륜메디칼",
    "메디굿파트너스",
    "케어메디팜",
    "화홍병원",
    "아주대학교",
    "아주대 의료원",
    "아주대학교병원",
  ];

  const defaultProducts = [
    { id: "naviband", name: "나비밴드", assetType: "소모품", relationGroup: "비강 소모품군", shelfLifeMonths: 36, color: "#287c6f" },
    { id: "navifix", name: "나비픽스", assetType: "소모품", relationGroup: "비강 소모품군", shelfLifeMonths: 36, color: "#376fa3" },
    { id: "nasal-splint", name: "나잘스프린트", assetType: "소모품", relationGroup: "비강 소모품군", shelfLifeMonths: 36, color: "#b76b22" },
    { id: "nasal-dressing", name: "나잘드레싱", assetType: "소모품", relationGroup: "비강 소모품군", shelfLifeMonths: 36, color: "#6b8f47" },
    { id: "navilloon", name: "나빌룬", assetType: "소모품", relationGroup: "비강/이관 시술군", shelfLifeMonths: 36, color: "#4f8b8f" },
    { id: "eustacure-tip", name: "유스타큐어 팁", assetType: "소모품", relationGroup: "이관기능검사군", shelfLifeMonths: 36, color: "#8b6f4f" },
    { id: "eustacure", name: "유스타큐어", assetType: "장비", relationGroup: "이관기능검사군", shelfLifeMonths: 0, color: "#6c5a86" },
    { id: "etc-consumable", name: "기타 소모품", assetType: "소모품", relationGroup: "", shelfLifeMonths: 36, color: "#6f7c80" },
    { id: "etc-equipment", name: "기타 장비", assetType: "장비", relationGroup: "", shelfLifeMonths: 0, color: "#8a6f53" },
  ];

  const sampleRecords = [
    {
      id: cryptoId(),
      assetType: "소모품",
      eventType: "신규납품",
      deliveryDate: "2026-03-12",
      hospital: "샘플대학교병원",
      managerName: "샘플담당자",
      relationGroup: "비강/이관 시술군",
      productGroup: "나빌룬E",
      productDetail: "MG-BC-0601E-03 / 풍선확장기 포함",
      itemCode: "SAMPLE-BC-03",
      quantity: 2,
      unitPrice: 550000,
      lotNumber: "LOT-260312-A",
      expiryDate: "2027-03-31",
      registeredAt: "2026-03-12",
      memo: "첫 납품 샘플 데이터",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: cryptoId(),
      assetType: "소모품",
      eventType: "신규납품",
      deliveryDate: "2026-04-15",
      hospital: "샘플대학교병원",
      managerName: "샘플담당자",
      relationGroup: "비강/이관 시술군",
      productGroup: "나빌룬E",
      productDetail: "MG-BC-0601E-03 / 풍선확장기 포함",
      itemCode: "SAMPLE-BC-03",
      quantity: 1,
      unitPrice: 550000,
      lotNumber: "LOT-260415-B",
      expiryDate: "2027-04-30",
      registeredAt: "2026-04-15",
      memo: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: cryptoId(),
      assetType: "소모품",
      eventType: "교환",
      deliveryDate: "2026-05-08",
      hospital: "테스트이비인후과",
      managerName: "샘플담당자",
      relationGroup: "이어스프린트 사용군",
      productGroup: "이어스프린트",
      productDetail: "소형 팁 구성",
      itemCode: "SAMPLE-ES-S",
      quantity: 3,
      unitPrice: 120000,
      lotNumber: "ES-260508",
      expiryDate: "2026-08-20",
      registeredAt: "2026-05-08",
      memo: "유효기간 임박분 교환",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: cryptoId(),
      assetType: "장비",
      eventType: "신규납품",
      deliveryDate: "2026-02-20",
      hospital: "샘플대학교병원",
      managerName: "장비담당자",
      relationGroup: "비강/이관 시술군",
      productGroup: "이관기능검사기",
      productDetail: "검사 본체 1대 / 기본 구성",
      itemCode: "SAMPLE-EQ-01",
      quantity: 1,
      unitPrice: 2200000,
      lotNumber: "EQ-260220",
      expiryDate: "",
      registeredAt: "2026-02-20",
      memo: "소모품 납품과 연결 확인용 샘플",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const state = {
    products: loadJson(STORAGE_KEYS.products, defaultProducts),
    records: loadJson(STORAGE_KEYS.records, sampleRecords),
    settings: normalizeSettings(loadJson(STORAGE_KEYS.settings, {})),
    activeAssetType: localStorage.getItem(STORAGE_KEYS.activeAssetType) || "소모품",
    adminUnlocked: false,
    bulkImportUnlocked: false,
    importPreview: [],
    supabaseClient: null,
    editingRecordId: "",
    recordSearch: "",
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setDefaultDates();
    hydrateLegacyData();
    bindAssetMode();
    bindTabs();
    bindForms();
    bindBulkImport();
    bindAnalysisControls();
    bindStorageActions();
    hydrateSettings();
    refreshAll();
    initIcons();
    setTimeout(() => loadFromSupabase({ silent: true }), 700);
  }

  function hydrateLegacyData() {
    let changedProducts = false;
    defaultProducts.forEach((defaultProduct) => {
      const existingProduct = state.products.find((product) => product.name === defaultProduct.name || product.id === defaultProduct.id);
      if (!existingProduct) {
        state.products.push({ ...defaultProduct });
        changedProducts = true;
        return;
      }
      ["assetType", "relationGroup", "shelfLifeMonths"].forEach((key) => {
        if (existingProduct[key] !== defaultProduct[key]) {
          existingProduct[key] = defaultProduct[key];
          changedProducts = true;
        }
      });
    });

    state.products = state.products.map((product) => {
      const nextProduct = { ...product };
      if (!nextProduct.assetType) {
        nextProduct.assetType = inferAssetType(nextProduct.name);
        changedProducts = true;
      }
      if (typeof nextProduct.relationGroup === "undefined") {
        nextProduct.relationGroup = "";
        changedProducts = true;
      }
      if (getProductAssetType(nextProduct) === "소모품" && Number(nextProduct.shelfLifeMonths || 0) !== 36) {
        nextProduct.shelfLifeMonths = 36;
        changedProducts = true;
      }
      return nextProduct;
    });

    let changedRecords = false;
    state.records = state.records.map((record) => {
      const nextRecord = { ...record };
      if (!nextRecord.assetType) {
        nextRecord.assetType = inferAssetType(nextRecord.productGroup);
        changedRecords = true;
      }
      if (typeof nextRecord.managerName === "undefined") {
        nextRecord.managerName = "";
        changedRecords = true;
      }
      if (typeof nextRecord.relationGroup === "undefined") {
        nextRecord.relationGroup = getProductRelationGroup(nextRecord.productGroup);
        changedRecords = true;
      }
      return nextRecord;
    });

    if (changedProducts) saveJson(STORAGE_KEYS.products, state.products);
    if (changedRecords) saveJson(STORAGE_KEYS.records, state.records);
  }

  function bindAssetMode() {
    syncModeControls();
    $$(".asset-mode-button").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeAssetType = button.dataset.assetMode;
        localStorage.setItem(STORAGE_KEYS.activeAssetType, state.activeAssetType);
        syncModeControls();
        refreshAll();
      });
    });
  }

  function syncModeControls() {
    document.documentElement.dataset.assetMode = state.activeAssetType;
    $$(".asset-mode-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.assetMode === state.activeAssetType);
    });
    const opposite = getOppositeAssetType();
    $("#dashboardModeCopy").textContent = `${state.activeAssetType} 데이터 기준`;
    $("#analysisModeCopy").textContent = `${state.activeAssetType} 데이터 기준, ${opposite} 연결 이력 포함`;
    const entryType = $("#assetTypeSelect");
    const productType = $("#productAssetTypeSelect");
    if (entryType) entryType.value = state.activeAssetType;
    if (productType) productType.value = state.activeAssetType;
    refreshEntryMode();
  }

  function refreshEntryMode() {
    const label = $("#entrySubmitLabel");
    const copy = $("#entryModeCopy");
    if (label) label.textContent = state.editingRecordId ? "수정 저장" : "데이터 추가";
    if (copy) copy.textContent = state.editingRecordId ? "선택한 데이터 수정 중" : `${state.activeAssetType} 데이터로 등록`;
  }

  function initIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function normalizeSettings(settings) {
    return {
      supabaseUrl: settings?.supabaseUrl || DEFAULT_SUPABASE_CONFIG.supabaseUrl,
      supabaseKey: settings?.supabaseKey || DEFAULT_SUPABASE_CONFIG.supabaseKey,
    };
  }

  function requireAdminWrite(actionLabel) {
    if (state.adminUnlocked) return true;
    toast(`관리자 비밀번호 확인 후 ${actionLabel}할 수 있습니다.`);
    return false;
  }

  function setDefaultDates() {
    const today = toDateInput(new Date());
    const deliveryInput = $('[name="deliveryDate"]');
    const registeredInput = $('[name="registeredAt"]');
    if (deliveryInput) deliveryInput.value = today;
    if (registeredInput) registeredInput.value = today;
  }

  function bindTabs() {
    $$(".tab-button").forEach((button) => {
      button.addEventListener("click", () => {
        $$(".tab-button").forEach((item) => item.classList.remove("active"));
        $$(".view").forEach((view) => view.classList.remove("active"));
        button.classList.add("active");
        $(`#${button.dataset.view}-view`).classList.add("active");
      });
    });
  }

  function bindForms() {
    $("#assetTypeSelect").addEventListener("change", (event) => {
      renderProductOptions(event.target.value);
      fillRelationGroupFromProduct(true);
    });
    $("#productGroupSelect").addEventListener("change", () => fillRelationGroupFromProduct(true));

    $("#deliveryForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!requireAdminWrite(state.editingRecordId ? "데이터 수정" : "단건 입력")) return;
      const form = new FormData(event.currentTarget);
      const record = normalizeRecord(Object.fromEntries(form.entries()));
      if (!record.expiryDate) {
        record.expiryDate = calculateDefaultExpiry(record.productGroup, record.deliveryDate);
      }
      const wasEditing = Boolean(state.editingRecordId);
      if (wasEditing) {
        record.id = state.editingRecordId;
        const existing = state.records.find((item) => item.id === state.editingRecordId);
        record.createdAt = existing?.createdAt || record.createdAt;
        record.updatedAt = new Date().toISOString();
        state.records = state.records.map((item) => (item.id === state.editingRecordId ? record : item));
      } else {
        state.records.unshift(record);
      }
      await persistRecords();
      event.currentTarget.reset();
      state.editingRecordId = "";
      setDefaultDates();
      syncModeControls();
      refreshAll();
      toast(wasEditing ? "납품 데이터를 수정했습니다." : "납품 데이터가 추가되었습니다.");
    });

    $("#deliveryForm").addEventListener("reset", () => {
      state.editingRecordId = "";
      setTimeout(() => {
        setDefaultDates();
        syncModeControls();
        refreshEntryMode();
      }, 0);
    });

    $("#recordSearchInput").addEventListener("input", (event) => {
      state.recordSearch = event.target.value;
      renderRecordManager();
      bindRecordActionButtons();
    });

    $("#productForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!requireAdminWrite("제품 묶음 추가")) return;
      const form = new FormData(event.currentTarget);
      const name = String(form.get("name") || "").trim();
      if (!name) return;
      const exists = state.products.some((product) => product.name === name);
      if (exists) {
        toast("이미 등록된 대표제품명입니다.");
        return;
      }
      state.products.push({
        id: slugify(name),
        assetType: String(form.get("assetType") || state.activeAssetType),
        name,
        relationGroup: String(form.get("relationGroup") || "").trim(),
        shelfLifeMonths: numberValue(form.get("shelfLifeMonths")),
        color: String(form.get("color") || "#287c6f"),
      });
      await persistProducts();
      event.currentTarget.reset();
      event.currentTarget.color.value = "#287c6f";
      syncModeControls();
      refreshAll();
      toast("대표제품 묶음이 추가되었습니다.");
    });
  }

  function bindBulkImport() {
    $("#requiredColumns").innerHTML = REQUIRED_COLUMNS.map((column) => `<span>${escapeHtml(column)}</span>`).join("");

    $("#downloadTemplateButton").addEventListener("click", downloadTemplate);
    $("#exportAllDataButton").addEventListener("click", exportAllData);
    $("#unlockBulkButton").addEventListener("click", unlockBulkImport);
    $("#bulkPasswordInput").addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        unlockBulkImport();
      }
    });
    setBulkLockState(false);

    const input = $("#bulkFileInput");
    const dropZone = $("#dropZone");
    input.addEventListener("change", () => {
      if (!state.bulkImportUnlocked) {
        input.value = "";
        toast("비밀번호 확인 후 파일을 넣을 수 있습니다.");
        return;
      }
      if (input.files?.[0]) readBulkFile(input.files[0]);
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropZone.classList.add("dragging");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropZone.classList.remove("dragging");
      });
    });

    dropZone.addEventListener("drop", (event) => {
      if (!state.bulkImportUnlocked) {
        toast("비밀번호 확인 후 파일을 넣을 수 있습니다.");
        return;
      }
      const file = event.dataTransfer.files?.[0];
      if (file) readBulkFile(file);
    });

    $("#applyImportButton").addEventListener("click", async () => {
      if (!state.bulkImportUnlocked) {
        toast("비밀번호 확인 후 미리보기를 적용할 수 있습니다.");
        return;
      }
      const validRows = state.importPreview.filter((row) => row.valid).map((row) => row.record);
      if (!validRows.length) {
        toast("적용 가능한 데이터가 없습니다.");
        return;
      }
      const importedIds = new Set(validRows.map((row) => row.id));
      state.records = [...validRows, ...state.records.filter((record) => !importedIds.has(record.id))];
      await persistRecords();
      state.importPreview = [];
      renderImportPreview();
      refreshAll();
      toast(`${validRows.length.toLocaleString("ko-KR")}건을 추가했습니다.`);
    });

    $("#clearPreviewButton").addEventListener("click", () => {
      state.importPreview = [];
      renderImportPreview();
    });
  }

  function unlockBulkImport() {
    const input = $("#bulkPasswordInput");
    if (input.value.trim() !== BULK_IMPORT_PASSWORD) {
      setBulkLockState(false);
      input.select();
      toast("비밀번호를 확인해 주세요.");
      return;
    }
    setBulkLockState(true);
    toast("대량 입력이 열렸습니다.");
  }

  function setBulkLockState(unlocked) {
    state.adminUnlocked = unlocked;
    state.bulkImportUnlocked = unlocked;
    const fileInput = $("#bulkFileInput");
    const dropZone = $("#dropZone");
    const lockBox = $(".bulk-lock");
    const lockMessage = $("#bulkLockMessage");
    if (!fileInput || !dropZone) return;

    fileInput.disabled = !unlocked;
    dropZone.classList.toggle("locked", !unlocked);
    lockBox?.classList.toggle("unlocked", unlocked);
    const oldIcon = dropZone.querySelector("svg, i");
    if (oldIcon) {
      const newIcon = document.createElement("i");
      newIcon.setAttribute("data-lucide", unlocked ? "sheet" : "lock");
      oldIcon.replaceWith(newIcon);
    }
    dropZone.querySelector("strong").textContent = unlocked ? "파일을 선택하거나 끌어놓기" : "비밀번호 입력 후 파일 선택";
    lockMessage.textContent = unlocked
      ? "관리자 작업이 열렸습니다. 파일 업로드와 온라인 저장이 가능합니다."
      : "비밀번호 확인 후 파일 업로드와 온라인 저장이 가능합니다.";
    renderImportPreview();
    initIcons();
  }

  function bindAnalysisControls() {
    ["reportTypeSelect", "hospitalFilter", "analysisProductFilter"].forEach((id) => {
      $(`#${id}`).addEventListener("input", () => {
        renderAnalysis();
        renderReport();
      });
    });

    $("#printReportButton").addEventListener("click", () => {
      renderReport();
      window.print();
    });
  }

  function bindStorageActions() {
    $("#exportJsonButton").addEventListener("click", () => {
      const payload = {
        exportedAt: new Date().toISOString(),
        products: state.products,
        records: state.records,
      };
      downloadBlob(
        `delivery-expiry-backup-${toDateInput(new Date())}.json`,
        JSON.stringify(payload, null, 2),
        "application/json;charset=utf-8",
      );
    });

    $("#restoreJsonInput").addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const payload = JSON.parse(await file.text());
        if (!Array.isArray(payload.records) || !Array.isArray(payload.products)) {
          throw new Error("Invalid backup");
        }
        state.records = payload.records;
        state.products = payload.products;
        await persistProducts();
        await persistRecords();
        refreshAll();
        toast("백업 데이터를 복원했습니다.");
      } catch (error) {
        toast("복원 파일을 확인해 주세요.");
      }
      event.target.value = "";
    });

    $("#saveSettingsButton").addEventListener("click", () => {
      state.settings.supabaseUrl = $("#supabaseUrl").value.trim();
      state.settings.supabaseKey = $("#supabaseKey").value.trim();
      saveJson(STORAGE_KEYS.settings, state.settings);
      configureSupabase();
      toast("온라인 저장 설정을 저장했습니다.");
    });

    $("#syncButton").addEventListener("click", syncWithSupabase);
    $("#loadOnlineButton").addEventListener("click", loadFromSupabase);
  }

  function hydrateSettings() {
    $("#supabaseUrl").value = state.settings.supabaseUrl || "";
    $("#supabaseKey").value = state.settings.supabaseKey || "";
    configureSupabase();
  }

  function configureSupabase() {
    const storageState = $("#storageState");
    if (state.settings.supabaseUrl && state.settings.supabaseKey && window.supabase) {
      state.supabaseClient = window.supabase.createClient(state.settings.supabaseUrl, state.settings.supabaseKey);
      storageState.classList.add("online");
      storageState.querySelector("span:last-child").textContent = "온라인 저장 연결 준비";
      return;
    }
    state.supabaseClient = null;
    storageState.classList.remove("online");
    storageState.querySelector("span:last-child").textContent = "로컬 저장 사용 중";
  }

  async function syncWithSupabase() {
    if (!requireAdminWrite("온라인 저장")) return;
    configureSupabase();
    if (!state.supabaseClient) {
      toast("Supabase URL과 Anon Key를 먼저 입력해 주세요.");
      return;
    }

    try {
      const payload = state.records.map((record) => ({
        id: record.id,
        asset_type: getRecordAssetType(record),
        event_type: record.eventType,
        delivery_date: record.deliveryDate || null,
        hospital: record.hospital,
        manager_name: record.managerName || "",
        relation_group: record.relationGroup || "",
        product_group: record.productGroup,
        product_detail: record.productDetail || "",
        item_code: record.itemCode || "",
        quantity: record.quantity,
        unit_price: record.unitPrice,
        lot_number: record.lotNumber || "",
        expiry_date: record.expiryDate || null,
        accounting_date: record.accountingDate || null,
        registered_at: record.registeredAt || null,
        memo: record.memo || "",
        created_at: record.createdAt,
        updated_at: new Date().toISOString(),
      }));
      const { error } = await state.supabaseClient.from("delivery_records").upsert(payload, { onConflict: "id" });
      if (error) throw error;
      toast("온라인 저장소와 동기화했습니다.");
    } catch (error) {
      toast("동기화 중 문제가 생겼습니다. 테이블 생성 여부를 확인해 주세요.");
    }
  }

  async function loadFromSupabase(options = {}) {
    const silent = Boolean(options.silent);
    configureSupabase();
    if (!state.supabaseClient) {
      if (!silent) toast("Supabase URL과 Anon Key를 먼저 입력해 주세요.");
      return;
    }

    try {
      const { data, error } = await state.supabaseClient
        .from("delivery_records")
        .select("*")
        .order("delivery_date", { ascending: false });
      if (error) throw error;
      state.records = (data || []).map(recordFromSupabase);
      saveJson(STORAGE_KEYS.records, state.records);
      refreshAll();
      if (!silent) toast(`온라인 데이터 ${state.records.length.toLocaleString("ko-KR")}건을 불러왔습니다.`);
    } catch (error) {
      if (!silent) toast("온라인 데이터를 불러오지 못했습니다. 설정과 테이블을 확인해 주세요.");
    }
  }

  function recordFromSupabase(row) {
    return normalizeRecord({
      id: row.id,
      assetType: row.asset_type,
      eventType: row.event_type,
      deliveryDate: row.delivery_date,
      hospital: row.hospital,
      managerName: row.manager_name,
      relationGroup: row.relation_group,
      productGroup: row.product_group,
      productDetail: row.product_detail,
      itemCode: row.item_code,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      lotNumber: row.lot_number,
      expiryDate: row.expiry_date,
      accountingDate: row.accounting_date,
      registeredAt: row.registered_at,
      memo: row.memo,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  function refreshAll() {
    renderProductOptions();
    renderDashboard();
    renderAnalysis();
    renderProducts();
    renderReport();
    initIcons();
  }

  function renderProductOptions(entryAssetType = $("#assetTypeSelect")?.value || state.activeAssetType) {
    const entryProducts = state.products.filter((product) => getProductAssetType(product) === entryAssetType);
    const options = entryProducts
      .map((product) => `<option value="${escapeHtml(product.name)}">${escapeHtml(product.name)}</option>`)
      .join("");
    $("#productGroupSelect").innerHTML = options;

    const analysisOptions = state.products
      .filter((product) => getProductAssetType(product) === state.activeAssetType)
      .map((product) => `<option value="${escapeHtml(product.name)}">${escapeHtml(product.name)}</option>`)
      .join("");
    $("#analysisProductFilter").innerHTML = `<option value="">전체</option>${analysisOptions}`;
    renderRelationGroupOptions();
    fillRelationGroupFromProduct();
  }

  function renderRelationGroupOptions() {
    const groups = getRelationGroups();
    $("#relationGroupOptions").innerHTML = groups.map((group) => `<option value="${escapeHtml(group)}"></option>`).join("");
  }

  function fillRelationGroupFromProduct(force = false) {
    const input = $("#relationGroupInput");
    const select = $("#productGroupSelect");
    if (!input || !select) return;
    const group = getProductRelationGroup(select.value);
    if (force || (group && !input.value.trim())) {
      input.value = group;
    }
  }

  function renderDashboard() {
    const scopedRecords = getScopedRecords();
    const positiveRecords = scopedRecords.filter((record) => record.quantity > 0);
    const hospitals = new Set(scopedRecords.map((record) => record.hospital).filter(Boolean));
    const expiring = getPriorityExpiryRecords(scopedRecords);
    const recentRecords = getRecentDeliveryRecords(scopedRecords).slice(0, 8);
    const totalAmount = positiveRecords.reduce((sum, record) => sum + record.quantity * record.unitPrice, 0);

    $("#kpiGrid").innerHTML = [
      kpiCard(`${state.activeAssetType} 납품 이력`, `${scopedRecords.length.toLocaleString("ko-KR")}건`, "교환/회수 포함"),
      kpiCard("관리 병원", `${hospitals.size.toLocaleString("ko-KR")}곳`, "병원명 기준"),
      kpiCard("우선 확인", `${expiring.length.toLocaleString("ko-KR")}건`, "최근 1년·미정산·선납관리"),
      kpiCard("누적 금액", formatMoney(totalAmount), "수량 x 단가"),
    ].join("");

    $("#expiryTableBody").innerHTML = expiring.length
      ? expiring
          .map(
            (record) => `
              <tr>
                <td>${statusPill(record.expiryDate)}</td>
                <td>${escapeHtml(record.hospital)}</td>
                <td>${productChip(record.productGroup)}</td>
                <td class="wrap">${escapeHtml(record.productDetail || "-")}</td>
                <td>${escapeHtml(record.lotNumber || "-")}</td>
                <td>${formatDate(record.expiryDate)}</td>
              </tr>
            `,
          )
          .join("")
      : emptyRow(6, "최근 1년·미정산·선납관리 기준의 만료/교환 우선 확인 대상이 없습니다.");

    $("#recentRecords").innerHTML = recentRecords.length
      ? recentRecords
          .map(
            (record) => `
              <article class="record-item">
                <strong>${escapeHtml(record.hospital)} · ${escapeHtml(record.productGroup)}</strong>
                <div class="record-meta">
                  <span>${escapeHtml(record.eventType)}</span>
                  <span>${formatDate(record.deliveryDate)}</span>
                  <span>담당 ${escapeHtml(record.managerName || "-")}</span>
                  <span>${Number(record.quantity).toLocaleString("ko-KR")}개</span>
                  <span>${formatMoney(record.unitPrice)}</span>
                  <span>LOT ${escapeHtml(record.lotNumber || "-")}</span>
                  <span>회계 ${formatDate(record.accountingDate)}</span>
                </div>
                ${recordActionButtons(record.id)}
              </article>
            `,
          )
          .join("")
      : `<p class="muted-text">최근 1년 기준으로 표시할 납품 데이터가 없습니다.</p>`;
    renderRecordManager();
    bindRecordActionButtons();
  }

  function renderRecordManager() {
    const tbody = $("#recordManageBody");
    if (!tbody) return;
    const query = normalizeSearchText(state.recordSearch);
    const filtered = getScopedRecords()
      .filter((record) => !query || normalizeSearchText(recordSearchText(record)).includes(query))
      .sort((a, b) => dateNumber(b.deliveryDate) - dateNumber(a.deliveryDate));
    const visible = filtered.slice(0, 60);
    tbody.innerHTML = visible.length
      ? visible
          .map(
            (record) => `
              <tr>
                <td>${formatDate(record.deliveryDate)}</td>
                <td>${escapeHtml(record.hospital)}</td>
                <td>${escapeHtml(getRecordAssetType(record))}</td>
                <td>${productChip(record.productGroup)}</td>
                <td>${Number(record.quantity || 0).toLocaleString("ko-KR")}</td>
                <td>${formatMoney(record.unitPrice)}</td>
                <td>${escapeHtml(record.lotNumber || "-")}</td>
                <td>${formatDate(record.expiryDate)}</td>
                <td>${formatDate(record.accountingDate)}</td>
                <td>${recordActionButtons(record.id)}</td>
              </tr>
            `,
          )
          .join("")
      : emptyRow(10, "검색 조건에 맞는 데이터가 없습니다.");
    $("#recordManageSummary").textContent = filtered.length
      ? `${filtered.length.toLocaleString("ko-KR")}건 중 ${visible.length.toLocaleString("ko-KR")}건 표시`
      : "표시할 데이터 없음";
  }

  function recordActionButtons(recordId) {
    return `
      <div class="row-actions">
        <button class="icon-button" type="button" title="수정" aria-label="데이터 수정" data-edit-record="${escapeHtml(recordId)}">
          <i data-lucide="square-pen"></i>
        </button>
        <button class="icon-button danger-button" type="button" title="삭제" aria-label="데이터 삭제" data-delete-record="${escapeHtml(recordId)}">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `;
  }

  function bindRecordActionButtons() {
    $$("[data-edit-record]").forEach((button) => {
      button.addEventListener("click", () => startEditRecord(button.dataset.editRecord));
    });
    $$("[data-delete-record]").forEach((button) => {
      button.addEventListener("click", () => deleteRecord(button.dataset.deleteRecord));
    });
    initIcons();
  }

  function startEditRecord(recordId) {
    if (!requireAdminWrite("데이터 수정")) return;
    const record = state.records.find((item) => item.id === recordId);
    if (!record) {
      toast("수정할 데이터를 찾지 못했습니다.");
      return;
    }
    state.editingRecordId = record.id;
    const form = $("#deliveryForm");
    form.assetType.value = getRecordAssetType(record);
    renderProductOptions(form.assetType.value);
    form.eventType.value = record.eventType || "신규납품";
    form.deliveryDate.value = record.deliveryDate || "";
    form.hospital.value = record.hospital || "";
    form.productGroup.value = record.productGroup || "";
    form.managerName.value = record.managerName || "";
    form.relationGroup.value = record.relationGroup || "";
    form.productDetail.value = record.productDetail || "";
    form.itemCode.value = record.itemCode || "";
    form.quantity.value = Number(record.quantity || 0);
    form.unitPrice.value = Number(record.unitPrice || 0);
    form.lotNumber.value = record.lotNumber || "";
    form.expiryDate.value = record.expiryDate || "";
    form.accountingDate.value = record.accountingDate || "";
    form.registeredAt.value = record.registeredAt || "";
    form.memo.value = record.memo || "";
    refreshEntryMode();
    showView("entry");
    form.hospital.focus();
    toast("선택한 데이터를 수정 화면으로 불러왔습니다.");
  }

  async function deleteRecord(recordId) {
    if (!requireAdminWrite("데이터 삭제")) return;
    const record = state.records.find((item) => item.id === recordId);
    if (!record) {
      toast("삭제할 데이터를 찾지 못했습니다.");
      return;
    }
    const ok = window.confirm(`${record.hospital} / ${record.productGroup} 데이터를 삭제할까요?`);
    if (!ok) return;
    state.records = state.records.filter((item) => item.id !== recordId);
    await persistRecords();
    await deleteRecordFromSupabase(recordId);
    refreshAll();
    toast("데이터를 삭제했습니다.");
  }

  async function deleteRecordFromSupabase(recordId) {
    configureSupabase();
    if (!state.supabaseClient) return;
    try {
      const { error } = await state.supabaseClient.from("delivery_records").delete().eq("id", recordId);
      if (error) throw error;
    } catch (error) {
      toast("로컬에서는 삭제했지만 온라인 삭제는 확인이 필요합니다.");
    }
  }

  function showView(viewName) {
    $$(".tab-button").forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
    $$(".view").forEach((view) => view.classList.toggle("active", view.id === `${viewName}-view`));
  }

  function renderAnalysis() {
    const filtered = getFilteredRecords();
    renderPriceAnalysis(filtered);
    renderPredictionAnalysis(filtered);
    renderLastDeliveryAnalysis(filtered);
    renderLinkedHistory(filtered);
  }

  function renderPriceAnalysis(records) {
    const grouped = groupBy(records.filter((record) => record.unitPrice > 0), (record) => record.productGroup);
    const rows = Object.entries(grouped)
      .map(([productGroup, items]) => {
        const sorted = [...items].sort((a, b) => dateNumber(b.deliveryDate) - dateNumber(a.deliveryDate));
        const prices = items.map((item) => item.unitPrice).filter((price) => price > 0);
        return {
          productGroup,
          latest: sorted[0]?.unitPrice || 0,
          avg: average(prices),
          min: Math.min(...prices),
          max: Math.max(...prices),
          count: prices.length,
        };
      })
      .sort((a, b) => a.productGroup.localeCompare(b.productGroup, "ko"));

    $("#priceAnalysisBody").innerHTML = rows.length
      ? rows
          .map(
            (row) => `
              <tr>
                <td>${productChip(row.productGroup)}</td>
                <td>${formatMoney(row.latest)}</td>
                <td>${formatMoney(row.avg)}</td>
                <td>${formatMoney(row.min)}</td>
                <td>${formatMoney(row.max)}</td>
                <td>${row.count.toLocaleString("ko-KR")}</td>
              </tr>
            `,
          )
          .join("")
      : emptyRow(6, "단가 분석에 사용할 데이터가 없습니다.");
  }

  function renderPredictionAnalysis(records) {
    const grouped = groupBy(
      records.filter((record) => record.quantity > 0 && record.deliveryDate),
      (record) => `${record.hospital}|||${record.productGroup}`,
    );
    const rows = Object.entries(grouped)
      .map(([key, items]) => {
        const [hospital, productGroup] = key.split("|||");
        const sorted = [...items].sort((a, b) => dateNumber(a.deliveryDate) - dateNumber(b.deliveryDate));
        const intervals = [];
        for (let index = 1; index < sorted.length; index += 1) {
          const diff = dayDiff(sorted[index - 1].deliveryDate, sorted[index].deliveryDate);
          if (diff > 0) intervals.push(diff);
        }
        const avgDays = Math.round(average(intervals));
        const lastDate = sorted.at(-1)?.deliveryDate || "";
        return {
          hospital,
          productGroup,
          lastDate,
          avgDays,
          nextDate: avgDays ? addDays(lastDate, avgDays) : "",
        };
      })
      .sort((a, b) => dateNumber(a.nextDate || "2999-12-31") - dateNumber(b.nextDate || "2999-12-31"));

    $("#predictionAnalysisBody").innerHTML = rows.length
      ? rows
          .map(
            (row) => `
              <tr>
                <td>${escapeHtml(row.hospital)}</td>
                <td>${productChip(row.productGroup)}</td>
                <td>${formatDate(row.lastDate)}</td>
                <td>${row.avgDays ? `${row.avgDays.toLocaleString("ko-KR")}일` : "데이터 부족"}</td>
                <td>${row.nextDate ? formatDate(row.nextDate) : "-"}</td>
              </tr>
            `,
          )
          .join("")
      : emptyRow(5, "예측에 사용할 납품 이력이 없습니다.");
  }

  function renderLastDeliveryAnalysis(records) {
    const grouped = groupBy(records.filter((record) => record.deliveryDate), (record) => `${record.hospital}|||${record.productGroup}`);
    const rows = Object.entries(grouped)
      .map(([key, items]) => {
        const [hospital, productGroup] = key.split("|||");
        const latest = [...items].sort((a, b) => dateNumber(b.deliveryDate) - dateNumber(a.deliveryDate))[0];
        return { hospital, productGroup, latest };
      })
      .sort((a, b) => dateNumber(a.latest.expiryDate || "2999-12-31") - dateNumber(b.latest.expiryDate || "2999-12-31"));

    $("#lastDeliveryBody").innerHTML = rows.length
      ? rows
          .map(
            (row) => `
              <tr>
                <td>${statusPill(row.latest.expiryDate)}</td>
                <td>${escapeHtml(row.hospital)}</td>
                <td>${productChip(row.productGroup)}</td>
                <td>${escapeHtml(row.latest.relationGroup || "-")}</td>
                <td class="wrap">${escapeHtml(row.latest.productDetail || "-")}</td>
                <td>${formatDate(row.latest.deliveryDate)}</td>
                <td>${formatDate(row.latest.expiryDate)}</td>
                <td>${formatMoney(row.latest.unitPrice)}</td>
                <td>${escapeHtml(row.latest.managerName || "-")}</td>
                <td>${escapeHtml(row.latest.lotNumber || "-")}</td>
              </tr>
            `,
          )
          .join("")
      : emptyRow(10, "마지막 납품 분석에 사용할 데이터가 없습니다.");
  }

  function renderLinkedHistory(baseRecords) {
    const opposite = getOppositeAssetType();
    const baseHospitals = new Set(baseRecords.map((record) => record.hospital).filter(Boolean));
    const baseGroups = new Set(baseRecords.map((record) => record.relationGroup).filter(Boolean));
    const hospitalFilter = $("#hospitalFilter")?.value.trim().toLowerCase() || "";
    const linked = state.records
      .filter((record) => getRecordAssetType(record) === opposite)
      .filter((record) => {
        if (hospitalFilter) return record.hospital.toLowerCase().includes(hospitalFilter);
        if (baseGroups.size && record.relationGroup && baseGroups.has(record.relationGroup)) return true;
        return baseHospitals.size ? baseHospitals.has(record.hospital) : true;
      })
      .sort((a, b) => dateNumber(b.deliveryDate) - dateNumber(a.deliveryDate))
      .slice(0, 80);

    $("#linkedHistoryTitle").textContent = `연결 ${opposite} 이력`;
    $("#linkedHistoryCaption").textContent = `${state.activeAssetType} 기준 병원/연결그룹과 연결`;
    $("#linkedHistoryBody").innerHTML = linked.length
      ? linked
          .map(
            (record) => `
              <tr>
                <td>${escapeHtml(record.hospital)}</td>
                <td>${escapeHtml(opposite)}</td>
                <td>${escapeHtml(record.relationGroup || "-")}</td>
                <td>${productChip(record.productGroup)}</td>
                <td class="wrap">${escapeHtml(record.productDetail || "-")}</td>
                <td>${formatDate(record.deliveryDate)}</td>
                <td>${Number(record.quantity || 0).toLocaleString("ko-KR")}</td>
                <td>${formatMoney(record.unitPrice)}</td>
                <td>${escapeHtml(record.managerName || "-")}</td>
                <td>${escapeHtml(record.lotNumber || "-")}</td>
              </tr>
            `,
          )
          .join("")
      : emptyRow(10, `같은 병원 또는 연결그룹 기준으로 연결된 ${opposite} 이력이 없습니다.`);
  }

  function renderProducts() {
    renderProductList("소모품", "#consumableProductList", "#consumableProductCount");
    renderProductList("장비", "#equipmentProductList", "#equipmentProductCount");

    $$("[data-delete-product]").forEach((button) => {
      button.addEventListener("click", async () => {
        const name = button.dataset.deleteProduct;
        const inUse = state.records.some((record) => record.productGroup === name);
        if (inUse) {
          toast("이미 사용 중인 대표제품명은 삭제하지 않았습니다.");
          return;
        }
        state.products = state.products.filter((product) => product.name !== name);
        await persistProducts();
        refreshAll();
      });
    });
  }

  function renderProductList(assetType, listSelector, countSelector) {
    const products = state.products.filter((product) => getProductAssetType(product) === assetType);
    $(countSelector).textContent = `${products.length.toLocaleString("ko-KR")}개`;
    $(listSelector).innerHTML = products.length
      ? products
          .map(
            (product) => `
              <article class="product-item">
                <span class="product-color" style="background:${escapeHtml(product.color)}"></span>
                <div>
                  <h3>${escapeHtml(product.name)}</h3>
                  <p>기본 유효기간 ${product.shelfLifeMonths ? `${product.shelfLifeMonths}개월` : "직접 입력"}</p>
                  <small>연결그룹 ${escapeHtml(product.relationGroup || "-")}</small>
                </div>
                <button class="icon-button" type="button" title="삭제" aria-label="${escapeHtml(product.name)} 삭제" data-delete-product="${escapeHtml(product.name)}">
                  <i data-lucide="trash-2"></i>
                </button>
              </article>
            `,
          )
          .join("")
      : `<p class="muted-text">${assetType} 제품 묶음이 없습니다.</p>`;
  }

  function renderReport() {
    const reportType = $("#reportTypeSelect")?.value || "price";
    const filtered = getFilteredRecords();
    const titles = {
      price: "제품별 단가 확인 보고서",
      prediction: "병원 납품 시기 예측 보고서",
      last: "마지막 납품/유효기간/단가 보고서",
    };

    $("#reportDate").textContent = `기준일 ${formatDate(toDateInput(new Date()))}`;
    $("#reportTitle").textContent = `${state.activeAssetType} ${titles[reportType]}`;
    $("#reportGeneratedAt").textContent = `생성 ${new Date().toLocaleString("ko-KR")}`;

    const hospitals = new Set(filtered.map((record) => record.hospital).filter(Boolean));
    const products = new Set(filtered.map((record) => record.productGroup).filter(Boolean));
    const expiring = filtered.filter((record) => expiryStatus(record.expiryDate).type !== "ok");
    const amount = filtered.reduce((sum, record) => sum + record.quantity * record.unitPrice, 0);
    $("#reportKpis").innerHTML = [
      reportKpi("분류", state.activeAssetType),
      reportKpi("이력 건수", `${filtered.length.toLocaleString("ko-KR")}건`),
      reportKpi("병원 수", `${hospitals.size.toLocaleString("ko-KR")}곳`),
      reportKpi("제품 묶음", `${products.size.toLocaleString("ko-KR")}개`),
      reportKpi("주의/만료", `${expiring.length.toLocaleString("ko-KR")}건`),
      reportKpi("누적 금액", formatMoney(amount)),
      reportKpi("평균 단가", formatMoney(average(filtered.map((record) => record.unitPrice).filter(Boolean)))),
      reportKpi("최근 납품", formatDate(latestRecord(filtered)?.deliveryDate)),
    ].join("");

    if (reportType === "price") {
      $("#reportBody").innerHTML = reportPriceTable(filtered);
    } else if (reportType === "prediction") {
      $("#reportBody").innerHTML = reportPredictionTable(filtered);
    } else {
      $("#reportBody").innerHTML = reportLastTable(filtered);
    }
  }

  function reportPriceTable(records) {
    const grouped = groupBy(records.filter((record) => record.unitPrice > 0), (record) => record.productGroup);
    const rows = Object.entries(grouped)
      .map(([productGroup, items]) => {
        const prices = items.map((item) => item.unitPrice).filter(Boolean);
        const latest = [...items].sort((a, b) => dateNumber(b.deliveryDate) - dateNumber(a.deliveryDate))[0];
        return [productGroup, formatMoney(latest?.unitPrice), formatMoney(average(prices)), formatMoney(Math.min(...prices)), formatMoney(Math.max(...prices)), `${items.length}건`];
      })
      .slice(0, 12);
    return reportTable(["대표제품", "최근 단가", "평균", "최저", "최고", "건수"], rows);
  }

  function reportPredictionTable(records) {
    const grouped = groupBy(
      records.filter((record) => record.quantity > 0 && record.deliveryDate),
      (record) => `${record.hospital}|||${record.productGroup}`,
    );
    const rows = Object.entries(grouped)
      .map(([key, items]) => {
        const [hospital, productGroup] = key.split("|||");
        const sorted = [...items].sort((a, b) => dateNumber(a.deliveryDate) - dateNumber(b.deliveryDate));
        const intervals = [];
        for (let index = 1; index < sorted.length; index += 1) {
          const diff = dayDiff(sorted[index - 1].deliveryDate, sorted[index].deliveryDate);
          if (diff > 0) intervals.push(diff);
        }
        const avgDays = Math.round(average(intervals));
        const lastDate = sorted.at(-1)?.deliveryDate || "";
        return [hospital, productGroup, formatDate(lastDate), avgDays ? `${avgDays}일` : "부족", avgDays ? formatDate(addDays(lastDate, avgDays)) : "-"];
      })
      .slice(0, 14);
    return reportTable(["병원", "대표제품", "마지막 납품", "평균 간격", "예상 다음 납품"], rows);
  }

  function reportLastTable(records) {
    const grouped = groupBy(records.filter((record) => record.deliveryDate), (record) => `${record.hospital}|||${record.productGroup}`);
    const rows = Object.entries(grouped)
      .map(([key, items]) => {
        const [hospital, productGroup] = key.split("|||");
        const latest = [...items].sort((a, b) => dateNumber(b.deliveryDate) - dateNumber(a.deliveryDate))[0];
        const status = expiryStatus(latest.expiryDate).label;
        return [
          status,
          hospital,
          productGroup,
          latest.relationGroup || "-",
          latest.productDetail || "-",
          formatDate(latest.deliveryDate),
          formatDate(latest.expiryDate),
          formatMoney(latest.unitPrice),
          latest.managerName || "-",
          latest.lotNumber || "-",
        ];
      })
      .slice(0, 14);
    return reportTable(["상태", "병원", "대표제품", "연결그룹", "세부", "마지막", "유효기간", "단가", "담당자", "LOT"], rows);
  }

  function reportTable(headers, rows) {
    if (!rows.length) {
      return `<p class="muted-text">보고서에 표시할 데이터가 없습니다.</p>`;
    }
    return `
      <table class="report-table">
        <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    `;
  }

  function renderImportPreview() {
    const validCount = state.importPreview.filter((row) => row.valid).length;
    $("#previewSummary").textContent = state.importPreview.length
      ? `${validCount.toLocaleString("ko-KR")} / ${state.importPreview.length.toLocaleString("ko-KR")}건 적용 가능`
      : "대기 중";
    $("#applyImportButton").disabled = validCount === 0 || !state.bulkImportUnlocked;
    $("#clearPreviewButton").disabled = state.importPreview.length === 0;
    $("#importPreviewBody").innerHTML = state.importPreview.length
      ? state.importPreview
          .slice(0, 200)
          .map(
            (row) => `
              <tr>
                <td><span class="result-pill ${row.valid ? "status-ok" : "status-expired"}">${row.valid ? "가능" : escapeHtml(row.reason)}</span></td>
                <td>${escapeHtml(row.record.assetType)}</td>
                <td>${formatDate(row.record.deliveryDate)}</td>
                <td>${escapeHtml(row.record.hospital)}</td>
                <td>${escapeHtml(row.record.managerName || "-")}</td>
                <td>${escapeHtml(row.record.relationGroup || "-")}</td>
                <td>${productChip(row.record.productGroup)}</td>
                <td class="wrap">${escapeHtml(row.record.productDetail || "-")}</td>
                <td>${Number(row.record.quantity || 0).toLocaleString("ko-KR")}</td>
                <td>${formatMoney(row.record.unitPrice)}</td>
                <td>${escapeHtml(row.record.lotNumber || "-")}</td>
                <td>${formatDate(row.record.expiryDate)}</td>
              </tr>
            `,
          )
          .join("")
      : emptyRow(12, "파일을 올리면 미리보기가 표시됩니다.");
    initIcons();
  }

  async function readBulkFile(file) {
    try {
      const extension = file.name.split(".").pop().toLowerCase();
      let rows = [];
      if (extension === "csv") {
        rows = parseCsv(await file.text());
      } else {
        if (!window.XLSX) {
          toast("엑셀 파일 읽기 모듈을 불러오지 못했습니다. CSV로 저장 후 다시 시도해 주세요.");
          return;
        }
        const buffer = await file.arrayBuffer();
        const workbook = window.XLSX.read(buffer, { type: "array", cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = window.XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
      }
      state.importPreview = rows.map(validateImportRow);
      renderImportPreview();
      toast(`${rows.length.toLocaleString("ko-KR")}건을 읽었습니다.`);
    } catch (error) {
      toast("파일을 읽지 못했습니다. 양식 컬럼명을 확인해 주세요.");
    }
  }

  function validateImportRow(row) {
    const record = normalizeRecord({
      id: row["데이터ID"] || row["ID"],
      assetType: row["분류"] || row["구분"] || state.activeAssetType,
      eventType: row["관리유형"] || "신규납품",
      deliveryDate: normalizeDate(row["납품일"]),
      hospital: row["병원명"],
      managerName: row["담당자명"] || row["담당자"],
      relationGroup: row["연결그룹"] || row["그룹"] || row["관련그룹"],
      productGroup: row["대표제품명"],
      productDetail: row["세부모델/규격"],
      quantity: row["수량"],
      unitPrice: row["단가"],
      lotNumber: row["LOT번호"],
      expiryDate: normalizeDate(row["유효기간만료일"]),
      accountingDate: normalizeDate(row["회계일자"] || row["회계전표일자"] || row["회계전표일자-No."]),
      registeredAt: normalizeDate(row["넣은시점"]),
      itemCode: row["품목코드"],
      memo: row["기타작성칸"],
    });
    if (!record.expiryDate) {
      record.expiryDate = calculateDefaultExpiry(record.productGroup, record.deliveryDate);
    }

    const missing = [];
    if (!record.deliveryDate) missing.push("납품일");
    if (!record.hospital) missing.push("병원명");
    if (!record.productGroup) missing.push("대표제품명");
    if (!Number.isFinite(record.quantity)) missing.push("수량");
    if (!Number.isFinite(record.unitPrice)) missing.push("단가");

    if (record.productGroup && !state.products.some((product) => product.name === record.productGroup)) {
      state.products.push({
        id: slugify(record.productGroup),
        name: record.productGroup,
        assetType: record.assetType,
        relationGroup: record.relationGroup || "",
        shelfLifeMonths: record.assetType === "소모품" ? 36 : 0,
        color: "#6f7c80",
      });
      persistProducts();
    }

    return {
      valid: missing.length === 0,
      reason: missing.length ? `${missing.join(", ")} 누락` : "",
      record,
    };
  }

  function downloadTemplate() {
    const rows = [
      REQUIRED_COLUMNS,
      [
        state.activeAssetType,
        "신규납품",
        toDateInput(new Date()),
        "샘플대학교병원",
        "샘플담당자",
        "비강/이관 시술군",
        "나빌룬E",
        "MG-BC-0601E-03 / 풍선확장기 포함",
        "1",
        "550000",
        "LOT-예시-001",
        addDays(toDateInput(new Date()), 730),
        "",
        toDateInput(new Date()),
        "ITEM-CODE",
        "모델 차이, 교환 사유, 확인 메모",
      ],
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    downloadBlob("납품_유효기간_대량입력_양식.csv", `\ufeff${csv}`, "text/csv;charset=utf-8");
  }

  function exportAllData() {
    if (!state.records.length) {
      toast("내보낼 데이터가 없습니다.");
      return;
    }

    const rows = state.records.map(recordToExportRow);
    const filenameDate = toDateInput(new Date()).replaceAll("-", "");
    if (window.XLSX) {
      const worksheet = window.XLSX.utils.json_to_sheet(rows, { header: EXPORT_COLUMNS });
      const workbook = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(workbook, worksheet, "납품데이터");
      window.XLSX.writeFile(workbook, `납품_유효기간_전체데이터_${filenameDate}.xlsx`);
      toast("현재까지 등록된 데이터를 엑셀 파일로 내보냈습니다.");
      return;
    }

    const csvRows = [
      EXPORT_COLUMNS,
      ...rows.map((row) => EXPORT_COLUMNS.map((column) => row[column] ?? "")),
    ];
    const csv = csvRows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    downloadBlob(`납품_유효기간_전체데이터_${filenameDate}.csv`, `\ufeff${csv}`, "text/csv;charset=utf-8");
    toast("현재까지 등록된 데이터를 CSV 파일로 내보냈습니다.");
  }

  function recordToExportRow(record) {
    return {
      분류: getRecordAssetType(record),
      관리유형: record.eventType || "",
      납품일: record.deliveryDate || "",
      병원명: record.hospital || "",
      담당자명: record.managerName || "",
      연결그룹: record.relationGroup || "",
      대표제품명: record.productGroup || "",
      "세부모델/규격": record.productDetail || "",
      수량: record.quantity ?? "",
      단가: record.unitPrice ?? "",
      LOT번호: record.lotNumber || "",
      유효기간만료일: record.expiryDate || "",
      회계일자: record.accountingDate || "",
      넣은시점: record.registeredAt || "",
      품목코드: record.itemCode || "",
      기타작성칸: record.memo || "",
      데이터ID: record.id || "",
      입력일: record.createdAt || "",
      수정일: record.updatedAt || "",
    };
  }

  function getFilteredRecords() {
    const hospital = $("#hospitalFilter")?.value.trim().toLowerCase() || "";
    const product = $("#analysisProductFilter")?.value || "";
    return getScopedRecords().filter((record) => {
      const hospitalMatch = !hospital || record.hospital.toLowerCase().includes(hospital);
      const productMatch = !product || record.productGroup === product;
      return hospitalMatch && productMatch;
    });
  }

  function getScopedRecords(assetType = state.activeAssetType) {
    return state.records.filter((record) => getRecordAssetType(record) === assetType);
  }

  function getOppositeAssetType(assetType = state.activeAssetType) {
    return assetType === "장비" ? "소모품" : "장비";
  }

  function getRecordAssetType(record) {
    return normalizeAssetType(record.assetType || inferAssetType(record.productGroup));
  }

  function getProductAssetType(product) {
    return normalizeAssetType(product.assetType || inferAssetType(product.name));
  }

  function getProductRelationGroup(productName) {
    const product = state.products.find((item) => item.name === productName);
    return String(product?.relationGroup || "").trim();
  }

  function getRelationGroups() {
    const groups = new Set();
    state.products.forEach((product) => {
      if (product.relationGroup) groups.add(product.relationGroup);
    });
    state.records.forEach((record) => {
      if (record.relationGroup) groups.add(record.relationGroup);
    });
    return [...groups].sort((a, b) => a.localeCompare(b, "ko"));
  }

  function normalizeAssetType(value) {
    const text = String(value || "").trim();
    if (ASSET_TYPES.includes(text)) return text;
    if (/장비|기기|검사기|본체|device|equipment/i.test(text)) return "장비";
    return "소모품";
  }

  function inferAssetType(productName) {
    const text = String(productName || "");
    return /장비|기기|검사기|본체|이관기능/i.test(text) ? "장비" : "소모품";
  }

  function normalizeRecord(input) {
    const now = new Date().toISOString();
    return {
      id: input.id || cryptoId(),
      assetType: normalizeAssetType(input.assetType || inferAssetType(input.productGroup)),
      eventType: String(input.eventType || "신규납품").trim(),
      deliveryDate: normalizeDate(input.deliveryDate),
      hospital: String(input.hospital || "").trim(),
      managerName: String(input.managerName || "").trim(),
      relationGroup: String(input.relationGroup || getProductRelationGroup(input.productGroup) || "").trim(),
      productGroup: String(input.productGroup || "").trim(),
      productDetail: String(input.productDetail || "").trim(),
      itemCode: String(input.itemCode || "").trim(),
      quantity: numberValue(input.quantity),
      unitPrice: numberValue(input.unitPrice),
      lotNumber: String(input.lotNumber || "").trim(),
      expiryDate: normalizeDate(input.expiryDate),
      accountingDate: normalizeDate(input.accountingDate),
      registeredAt: normalizeDate(input.registeredAt),
      memo: String(input.memo || "").trim(),
      createdAt: input.createdAt || now,
      updatedAt: input.updatedAt || now,
    };
  }

  function calculateDefaultExpiry(productGroup, deliveryDate) {
    const product = state.products.find((item) => item.name === productGroup);
    if (!product?.shelfLifeMonths || !deliveryDate) return "";
    const date = parseDate(deliveryDate);
    date.setMonth(date.getMonth() + Number(product.shelfLifeMonths));
    return toDateInput(date);
  }

  async function persistRecords() {
    saveJson(STORAGE_KEYS.records, state.records);
  }

  async function persistProducts() {
    saveJson(STORAGE_KEYS.products, state.products);
  }

  function getPriorityExpiryRecords(records = getScopedRecords()) {
    return records
      .filter((record) => {
        const status = expiryStatus(record.expiryDate, EXPIRY_WARNING_DAYS);
        return (
          (status.type === "expired" || status.type === "warning") &&
          record.quantity > 0 &&
          record.eventType === "신규납품" &&
          isWithinDays(record.deliveryDate, PRIORITY_DELIVERY_DAYS) &&
          !hasAccountingDate(record) &&
          isPrepaidPriorityTarget(record)
        );
      })
      .sort((a, b) => dateNumber(a.expiryDate || "2999-12-31") - dateNumber(b.expiryDate || "2999-12-31"));
  }

  function getRecentDeliveryRecords(records = getScopedRecords()) {
    return records
      .filter((record) => record.quantity > 0 && isWithinDays(record.deliveryDate, RECENT_DELIVERY_DAYS))
      .sort((a, b) => dateNumber(b.deliveryDate) - dateNumber(a.deliveryDate));
  }

  function getExpiringRecords(days, records = getScopedRecords()) {
    return records
      .filter((record) => {
        const status = expiryStatus(record.expiryDate, days);
        return status.type === "expired" || status.type === "warning";
      })
      .sort((a, b) => dateNumber(a.expiryDate || "2999-12-31") - dateNumber(b.expiryDate || "2999-12-31"));
  }

  function expiryStatus(dateValue, warningDays = 90) {
    if (!dateValue) return { type: "ok", label: "미입력" };
    const days = dayDiff(toDateInput(new Date()), dateValue);
    if (days < 0) return { type: "expired", label: "만료" };
    if (days <= warningDays) return { type: "warning", label: `${days}일 남음` };
    return { type: "ok", label: "정상" };
  }

  function statusPill(dateValue) {
    const status = expiryStatus(dateValue);
    const className = status.type === "expired" ? "status-expired" : status.type === "warning" ? "status-warning" : "status-ok";
    return `<span class="status-pill ${className}">${escapeHtml(status.label)}</span>`;
  }

  function hasAccountingDate(record) {
    return Boolean(record.accountingDate);
  }

  function isWithinDays(dateValue, days) {
    if (!dateValue) return false;
    const age = dayDiff(dateValue, toDateInput(new Date()));
    return age >= 0 && age <= days;
  }

  function isPrepaidPriorityTarget(record) {
    const text = normalizeSearchText([record.hospital, record.relationGroup, record.memo].join(" "));
    return PREPAID_PRIORITY_KEYWORDS.some((keyword) => text.includes(normalizeSearchText(keyword)));
  }

  function recordSearchText(record) {
    return [
      record.hospital,
      record.assetType,
      record.eventType,
      record.managerName,
      record.relationGroup,
      record.productGroup,
      record.productDetail,
      record.itemCode,
      record.lotNumber,
      record.expiryDate,
      record.accountingDate,
      record.memo,
    ].join(" ");
  }

  function normalizeSearchText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/주식회사|[㈜()]/g, "");
  }

  function productChip(productGroup) {
    const product = state.products.find((item) => item.name === productGroup);
    const color = product?.color || "#6f7c80";
    return `<span class="product-chip" style="background:${hexToSoft(color)};color:${escapeHtml(color)}">${escapeHtml(productGroup || "-")}</span>`;
  }

  function kpiCard(label, value, helper) {
    return `<article class="kpi-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(helper)}</small></article>`;
  }

  function reportKpi(label, value) {
    return `<article class="report-kpi"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`;
  }

  function emptyRow(colspan, text) {
    return `<tr><td colspan="${colspan}" class="wrap">${escapeHtml(text)}</td></tr>`;
  }

  function latestRecord(records) {
    return [...records].sort((a, b) => dateNumber(b.deliveryDate) - dateNumber(a.deliveryDate))[0];
  }

  function groupBy(items, keyFn) {
    return items.reduce((acc, item) => {
      const key = keyFn(item);
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});
  }

  function average(values) {
    const clean = values.filter((value) => Number.isFinite(Number(value)));
    if (!clean.length) return 0;
    return clean.reduce((sum, value) => sum + Number(value), 0) / clean.length;
  }

  function numberValue(value) {
    const normalized = Number(String(value ?? "").replaceAll(",", "").trim());
    return Number.isFinite(normalized) ? normalized : 0;
  }

  function parseDate(value) {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  function normalizeDate(value) {
    if (!value) return "";
    if (value instanceof Date) return toDateInput(value);
    const raw = String(value).trim();
    if (!raw) return "";
    const normalized = raw.replace(/[./]/g, "-");
    const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? "" : toDateInput(date);
  }

  function toDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function dateNumber(dateValue) {
    if (!dateValue) return 0;
    return parseDate(dateValue).getTime();
  }

  function dayDiff(from, to) {
    return Math.round((dateNumber(to) - dateNumber(from)) / 86400000);
  }

  function addDays(dateValue, days) {
    if (!dateValue || !days) return "";
    const date = parseDate(dateValue);
    date.setDate(date.getDate() + Number(days));
    return toDateInput(date);
  }

  function formatDate(dateValue) {
    if (!dateValue) return "-";
    return normalizeDate(dateValue);
  }

  function formatMoney(value) {
    const number = Number(value || 0);
    return `${Math.round(number).toLocaleString("ko-KR")}원`;
  }

  function parseCsv(text) {
    const rows = [];
    let current = [];
    let cell = "";
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];
      if (char === '"' && inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        current.push(cell);
        cell = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") index += 1;
        current.push(cell);
        rows.push(current);
        current = [];
        cell = "";
      } else {
        cell += char;
      }
    }
    if (cell || current.length) {
      current.push(cell);
      rows.push(current);
    }
    const [headers = [], ...body] = rows.filter((row) => row.some((value) => String(value).trim()));
    return body.map((row) =>
      headers.reduce((acc, header, index) => {
        acc[String(header).replace(/^\ufeff/, "").trim()] = row[index] ?? "";
        return acc;
      }, {}),
    );
  }

  function csvCell(value) {
    return `"${String(value ?? "").replaceAll('"', '""')}"`;
  }

  function downloadBlob(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function loadJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function cryptoId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function slugify(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w가-힣-]/g, "");
  }

  function hexToSoft(hex) {
    const clean = String(hex || "#6f7c80").replace("#", "");
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.13)`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  let toastTimer = null;
  function toast(message) {
    const element = $("#toast");
    element.textContent = message;
    element.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove("show"), 2800);
  }
})();
