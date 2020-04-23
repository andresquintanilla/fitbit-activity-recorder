import * as fs from "fs";

// Delete a specific file from the device
export function deleteFile(fileName) {
  try {
    fs.unlinkSync(fileName);
    console.log("File " + fileName + " deleted.")
  } catch(err) {
    console.log("Error: File " + fileName + " doesn't exists");
  }
}

// Delete all files from the device
export function deleteAllFiles() {
  try {
    let deviceFiles = getDeviceFileNames();
    for (let idx in deviceFiles) {
      let tempFile = deviceFiles[idx];
      fs.unlinkSync(tempFile);
      console.log("File " + tempFile + " deleted.");
    }
  } catch(err) {
    console.log("Error: File " + fileName + " doesn't exists");
  }
}

// Get all file names from the device. Return an array
export function getDeviceFileNames() {
  let deviceFiles = [];
  try {    
    const listDir = fs.listDirSync("/private/data/");
    let fileObj = listDir.next();
    while (!fileObj.done) {
      deviceFiles.push(fileObj.value);
      fileObj = listDir.next();
    }
  } catch(err) {
    console.log("Error: Couldn't get the file: " + err);
  }
  return deviceFiles;
}


function pad(n) {
  return n<10 ? '0'+n : n;
}

export function getFileTimestamp() {
  var d = new Date();
  return d.getFullYear() + pad(d.getMonth()+1) + pad(d.getDate()) + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds()); 
}



















// Convert a float into a Uint16Array (bits)
export function floatToUint16(val) {
  var floatView = new Float32Array(1);
  var int32View = new Int32Array(floatView.buffer);

  floatView[0] = val;
  var x = int32View[0];

  var bits = (x >> 16) & 0x8000; /* Get the sign */
  var m = (x >> 12) & 0x07ff; /* Keep one extra bit for rounding */
  var e = (x >> 23) & 0xff; /* Using int is faster here */
  
  /* If zero, or denormal, or exponent underflows too much for a denormal
   * half, return signed zero. */
  if (e < 103) {
    return bits;
  }

  /* If NaN, return NaN. If Inf or exponent overflow, return Inf. */
  if (e > 142) {
    bits |= 0x7c00;
    /* If exponent was 0xff and one mantissa bit was set, it means NaN,
     * not Inf, so make sure we set one mantissa bit too. */
    bits |= ((e == 255) ? 0 : 1) && (x & 0x007fffff);
    return bits;
  }

  /* If exponent underflows but not too much, return a denormal */
  if (e < 113) {
    m |= 0x0800;
    /* Extra rounding may overflow and set mantissa to 0 and exponent
     * to 1, which is OK. */
    bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1);
    return bits;
  }

  bits |= ((e - 112) << 10) | (m >> 1);
  /* Extra rounding. An overflow will set mantissa to 0 and increment
   * the exponent, which is OK. */
  bits += m & 1;
  return bits;

};