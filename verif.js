var url = "https://script.google.com/macros/s/AKfycbygzHU0mQEgmu7OzBCT8CwMAFOubSd9iCo5Ib_KEgN9oQjyw2XxLAcMMJomvtyl848p/exec"
var idCam = 0;
if (window.matchMedia("(max-width: 767px)").matches) {
  var idCam = 1;
} else {
  var idCam = 0;
}
// Creating a reusable QR Code Module in Node Js
var cameraId = ""
// Actual Code
const html5QrCode = new Html5Qrcode("reader");

function openScanner() {
  $("div#camera").hide()
  $("div#reader").removeClass("hide");
  Html5Qrcode.getCameras().then(devices => {
    /**
     * devices would be an array of objects of type:
     * { id: "id", label: "label" }
     */
    var cameraId = devices[idCam].id
    html5QrCode.start(
      cameraId,
      {
        fps: 10,
        qrbox: 250
      },
      qrCodeMessage => {
        // do something when code is read. For example:Nomoraaa
        $.get(url+`?page=cek&jenis=ttd&key=${qrCodeMessage}`,function(data, status){
          if(typeof data.status == "undefined"){
            Swal.fire(
              "Tanda tangan valid",
              "",
              'success'
            )
            $("div#dttd").removeClass("hide");
            $("input#dokumen").val(data[0].Dokumen);
            $("input#signby").val(data[0].SignBy);
            $("input#untuk").val(data[0].Untuk);
          }else{
            Swal.fire(
              "Tanda tangan tidak valid",
              "",
              'error'
            )
          }
        });
        closeScanner()
      },
      errorMessage => {
        // parse error, ideally ignore it. For example:
        console.log(`QR Code no longer in front of camera.`);
      })
      .catch(err => {
        // Opening the scanner failed.
      });

  }).catch(err => {
    // handle err
  });
}
function closeScanner() {
  html5QrCode.stop().then(ignore => {
    $("div#camera").show()
    $("div#reader").addClass("hide");
  }).catch(err => {
  });
}

function restartScanner(){
  closeScanner();
  openScanner();
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
      onMyfileChange(e.dataTransfer.files[0])
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
  console.log(fileInput)
  if (fileInput.files[0] == undefined) {
    return;
  }
  var filename = fileInput.files[0].name;
  // var filesize = fileInput.files[0].size;
  var reader = new FileReader();
  reader.onload = function(ev) {
    console.log("File", filename, ":");
    // 
    crypto.subtle.digest('SHA-256', ev.target.result).then(hashBuffer => {
      // Convert hex to hash, see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
      console.log(hashHex);
      cek(hashHex)
    }).catch(ex => console.error(ex));
  };
  reader.onerror = function(err) {
    console.error("Failed to read file", err);
  }
  reader.readAsArrayBuffer(fileInput.files[0]);
}

function cek(hex) {
  $.get(url+`?page=cek&jenis=doc&key=${hex}`,function(data, status){
    if(typeof data.status == "undefined"){
      Swal.fire(
        "Dokumen valid",
        "",
        'success'
      )
    }else{
      Swal.fire(
        "Dokumen tidak valid",
        "",
        'error'
      )
    }
  });
}