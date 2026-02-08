let boxes = JSON.parse(localStorage.getItem("boxes")) || [];
let saleItems = [];

function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.style.display="none");
  document.getElementById(id).style.display="block";
  if(id==="stock") loadStock();
}

// حفظ كرتون جديد
function saveBox(){
  let barcode = barcodeInput.value;
  let weight = weightInput.value;

  if(!barcode || !weight){
    alert("ادخل الباركود والوزن");
    return;
  }

  boxes.push({
    barcode: barcode,
    weight: weight,
    status: "بالمخزن"
  });

  localStorage.setItem("boxes", JSON.stringify(boxes));
  barcodeInput.value="";
  weightInput.value="";
  alert("تم حفظ الكرتون");
}

// إضافة كرتون للبيع
function addToSale(){
  let code = sellBarcode.value;
  let box = boxes.find(b => b.barcode === code && b.status === "بالمخزن");

  if(!box){
    alert("الباركود غير موجود أو مباع");
    return;
  }

  saleItems.push(box);
  box.status = "مباع";
  sellBarcode.value="";
  updateSaleList();
}

// تحديث قائمة البيع ومجموع الوزن
function updateSaleList(){
  saleList.innerHTML="";
  let total = 0;

  saleItems.forEach(b=>{
    let li = document.createElement("li");
    li.textContent = b.barcode + " - " + b.weight + " كغم";
    saleList.appendChild(li);
    total += parseFloat(b.weight);
  });

  totalWeight.textContent = total.toFixed(2);
}

// إنهاء البيع وحفظ PDF
function finishSale(){
  if(saleItems.length === 0){
    alert("لا توجد عناصر للبيع");
    return;
  }

  localStorage.setItem("boxes", JSON.stringify(boxes));

  const { jsPDF } = window.jspdf;
  let doc = new jsPDF();

  doc.text("سند خروج أوزان الكنارة", 20, 20);
  let y = 40;
  let total = 0;

  saleItems.forEach(b=>{
    doc.text(`${b.barcode} - ${b.weight} كغم`, 20, y);
    y += 10;
    total += parseFloat(b.weight);
  });

  doc.text("مجموع الوزن: " + total + " كغم", 20, y + 10);
  doc.save("kanara-sale.pdf");

  saleItems = [];
  updateSaleList();
}

// عرض المخزن
function loadStock(){
  stockTable.innerHTML = "";
  boxes.forEach(b=>{
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${b.barcode}</td>
      <td>${b.weight}</td>
      <td>${b.status}</td>
    `;
    stockTable.appendChild(tr);
  });
}

// تشغيل الكاميرا مباشرة عند تحميل صفحة إدخال كرتون
window.addEventListener("load", function() {
  const reader = document.getElementById("reader");

  const html5QrCode = new Html5Qrcode("reader");

  Html5Qrcode.getCameras().then(cameras => {
    if(cameras && cameras.length){
      let cameraId = cameras[0].id;
      html5QrCode.start(
        cameraId,
        { fps: 10, qrbox: 250 },
        qrCodeMessage => {
          barcodeInput.value = qrCodeMessage;
        },
        errorMessage => {
          // خطأ ممكن تجاهله
        }
      ).catch(err=>{
        alert("خطأ بالكاميرا: " + err);
      });
    } else {
      alert("الكاميرا غير متوفرة");
    }
  }).catch(err=>{
    alert("لم يتم العثور على كاميرا: " + err);
  });
});
