var url = "https://script.google.com/macros/s/AKfycbygzHU0mQEgmu7OzBCT8CwMAFOubSd9iCo5Ib_KEgN9oQjyw2XxLAcMMJomvtyl848p/exec"
var id = "";
// --------------- Form ---------------
const canvas = document.querySelector("canvas");

const signaturePad = new SignaturePad(canvas, {
  backgroundColor: "rgb(255,255,255)"
});

function make_base(url) {
  base_image = new Image();
  base_image.src = url;
  base_image.onload = function() {
    context.drawImage(base_image, 0, 0);
  }
}

$("#submitdatattd").click(function() {
  $("button#submitdatattd").hide();
  $.get(url + `?page=ittd&dokumen=${$("input#Dokumen").val()}&nomor=${$("input#Nomor").val()}&type=${$("input#Type").val()}&date=${$("input#Date").val()}&sginby=${$("input#Nama").val()}&untuk=${$("input#Untuk").val()}`, function(data, status) {
    $('input').attr('readonly', true);
    $("div#ttd").removeClass("hide");

    context = canvas.getContext('2d');

    canvas.width = $("#Dokumen").width() + 50;


    // ----------------
    const toDataURL = url => fetch(url)
      .then(response => response.blob())
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      }))


    toDataURL("https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=" + data.result)
      .then(dataUrl => {
        make_base(dataUrl);
      })
    id = data.result;
  });
})

$("#downloadttd").click(function() {
  $("div#dropzone").removeClass("hide");
  var data = signaturePad.toDataURL();
  console.log(data)
  downloadBase64File(data, $("input#Dokumen").val());
})

function downloadBase64File(base64Data, fileName) {
  const linkSource = base64Data;
  const downloadLink = document.createElement("a");
  downloadLink.href = linkSource;
  downloadLink.download = fileName;
  downloadLink.click();
}

// --------------- Upload file ---------------

document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
  const dropZoneElement = inputElement.closest(".drop-zone");

  dropZoneElement.addEventListener("click", (e) => {
    inputElement.click();
  });

  inputElement.addEventListener("change", (e) => {
    if (inputElement.files.length) {
      updateThumbnail(dropZoneElement, inputElement.files[0]);
    }
  });

  dropZoneElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZoneElement.classList.add("drop-zone--over");
  });

  ["dragleave", "dragend"].forEach((type) => {
    dropZoneElement.addEventListener(type, (e) => {
      dropZoneElement.classList.remove("drop-zone--over");
    });
  });

  dropZoneElement.addEventListener("drop", (e) => {
    e.preventDefault();

    if (e.dataTransfer.files.length) {
      inputElement.files = e.dataTransfer.files;
      updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
    }

    dropZoneElement.classList.remove("drop-zone--over");
  });
});

/**
 * Updates the thumbnail on a drop zone element.
 *
 * @param {HTMLElement} dropZoneElement
 * @param {File} file
 */
function updateThumbnail(dropZoneElement, file) {
  let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

  // First time - remove the prompt
  if (dropZoneElement.querySelector(".drop-zone__prompt")) {
    // dropZoneElement.querySelector(".drop-zone__prompt").remove();
    $(".drop-zone__prompt").hide()
  }

  // First time - there is no thumbnail element, so lets create it
  if (!thumbnailElement) {
    thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("drop-zone__thumb");
    dropZoneElement.appendChild(thumbnailElement);
  }

  thumbnailElement.dataset.label = file.name;

  // Show thumbnail for image files
  if (file.type.startsWith("image/")) {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
    };
  } else {
    thumbnailElement.style.backgroundImage = null;
  }
}

// --------------- Cek Credential ---------------

function onMyfileChange(fileInput) {
  const allow = ["application/pdf"]
  if (fileInput.files[0] == undefined) {
    return;
  }
  var filename = fileInput.files[0].name;
  if (allow.includes(fileInput.files[0].type)) {

    // var filesize = fileInput.files[0].size;
    var reader = new FileReader();
    reader.onload = function(ev) {
      // 
      crypto.subtle.digest('SHA-256', ev.target.result).then(hashBuffer => {
        // Convert hex to hash, see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
        filebenar(hashHex, id)
      }).catch(ex => console.error(ex));
    };
    reader.onerror = function(err) {
      console.error("Failed to read file", err);
    }
    reader.readAsArrayBuffer(fileInput.files[0]);
  } else {
    filesalah();
  }
}

function filebenar(hex, id) {
  $.get(url+`?page=idoc&id=${id}&data={"CredentialFile":"${hex}"}`,function(data, status){
    if(data.status){
      Swal.fire(
        "Credential File Sudah Tersimpan",
        "",
        'success'
      )
    }else{
      Swal.fire(
        "File sudah pernah didaftarkan",
        "silahkan upload dokumen yang benar",
        'error'
      )
      $(".drop-zone__prompt").show()
      $(".drop-zone__thumb").remove()
    }
  });

}