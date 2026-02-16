// script.js
// ใส่ URL จาก Apps Script (Deploy Web App)
const API_URL = "https://script.google.com/macros/s/AKfycbwElPLriUfBAcQVEPF0W9z7JvG_pkuyHK5Z3RYX7KiQfls_pzu1Xmg9aA4bl0bSCsFGoQ/exec";

const $ = (q) => document.querySelector(q);
const $$ = (q) => [...document.querySelectorAll(q)];

const form = $("#cyntiaForm");
const toast = $("#toast");
const submitBtn = $("#submitBtn");

function showToast(message, type = "good"){
  toast.textContent = message;
  toast.className = `toast show ${type}`;
}

function hideToast(){
  toast.className = "toast";
}

function getMagicTypes(){
  return $$("#magicType input[type='checkbox']:checked").map(i => i.value);
}
function validateMagicTypes(){
  const m = getMagicTypes();
  if(m.length === 0) return "กรุณาเลือกสายเวทอย่างน้อย 1 สาย";
  if(m.length > 2) return "เลือกสายเวทได้สูงสุด 2 สาย";
  return null;
}

function buildPayload(){
  return {
    fullName: $("#fullName").value.trim(),
    age: $("#age").value.trim(),
    gender: $("#gender").value,
    discord: $("#discord").value.trim(),
    year: $("#year").value,
    house: $("#house").value,
    magicTypes: getMagicTypes(),
    personality: $("#personality").value.trim(),
    backstory: $("#backstory").value.trim(),
    imageUrl: $("#imageUrl").value.trim(),
    agree: $("#agree").checked,

    // optional
    userAgent: navigator.userAgent
  };
}
async function submitToSheets(payload){

  const magicError = validateMagicTypes();
  if(magicError){
    showToast(magicError, "bad");
    return;
  }

  // required
  const requiredIds = ["fullName","age","gender","discord","year","house","personality","backstory","imageUrl","agree"];
  for(const id of requiredIds){
    const el = document.getElementById(id);
    if(!el) continue;

    if(el.type === "checkbox"){
      if(!el.checked){
        showToast("กรุณายืนยันการอ่านกฎก่อนส่งใบสมัคร", "bad");
        return;
      }
    } else {
      if(!String(el.value || "").trim()){
        showToast("กรุณากรอกข้อมูลให้ครบทุกช่องที่มีเครื่องหมาย *", "bad");
        el.focus();
        return;
      }
    }
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "กำลังส่ง...";

  try{
    const payload = buildPayload();
    await submitToSheets(payload);

    showToast("ส่งใบสมัครสำเร็จ! ✨ (บันทึกลง Google Sheets แล้ว)", "good");
    form.reset();
    $$("#magicType input[type='checkbox']").forEach(i => i.checked = false);

  }catch(err){
    console.error(err);
    showToast("ส่งไม่สำเร็จ: " + err.message, "bad");
  }finally{
    submitBtn.disabled = false;
    submitBtn.textContent = "ส่งใบสมัคร";
  }
}

submitBtn.addEventListener("click", async () => {
  await submitToSheets(buildPayload());
});

$("#btnReset").addEventListener("click", () => {
  form.reset();
  $$("#magicType input[type='checkbox']").forEach(i => i.checked = false);
  hideToast();
});

$("#btnFillDemo").addEventListener("click", () => {
  $("#fullName").value = "Cyntia Aster";
  $("#age").value = "16";
  $("#gender").value = "ไม่ระบุ";
  $("#discord").value = "SamYochi#0001";
  $("#year").value = "ปี 1";
  $("#house").value = "Noctis (เงา)";

  const chips = $$("#magicType input[type='checkbox']");
  chips.forEach(i => i.checked = false);
  const pick = (v) => {
    const el = chips.find(i => i.value === v);
    if(el) el.checked = true;
  };
  pick("ความมืด");
  pick("มายา");

  $("#personality").value = "นิ่ง สุภาพ มีมารยาท แต่เวลาโกรธจะน่ากลัวมาก";
  $("#backstory").value = "เติบโตมากับตระกูลนักเวทที่เคร่งครัด ถูกส่งมาเรียนเพื่อพิสูจน์ตัวเองและตามหาความลับของโรงเรียน";
  $("#imageUrl").value = "https://example.com/character.png";
  $("#agree").checked = true;

  showToast("เติมข้อมูลตัวอย่างแล้ว (กดส่งเพื่อทดสอบได้)", "good");
});