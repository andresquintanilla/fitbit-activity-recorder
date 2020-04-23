import { inbox } from "file-transfer";
import * as util from "../common/utilsCompanion";

// Setup variables for the recordings and transfering data
var batchSize = 10;
var recSize = 13;

// Process new files as they are received
inbox.addEventListener("newfile", processAllFiles);

// Also process any files that arrived when the companion wasn’t running
processAllFiles();

// Process the inbox queue for files, and read their contents as ArrayBuffer
async function processAllFiles() {
  let file;
  while ((file = await inbox.pop())) {
    var data = await file.arrayBuffer();
    //console.log(`File name: ${file.name} (Size: ${file.length} bytes)`);
    
    let rawData = new Array();
    let totalRecords = file.length/(recSize*batchSize);
    for (let i = 0; i<totalRecords; i++) {
      let recordData = new Array();
      for (let j = 0; j<batchSize; j++) {
        let accX = data.slice((0*batchSize)+(j*2)+(i*recSize*batchSize),(0*batchSize)+2+(j*2)+(i*recSize*batchSize));
        let accY = data.slice((2*batchSize)+(j*2)+(i*recSize*batchSize),(2*batchSize)+2+(j*2)+(i*recSize*batchSize));
        let accZ = data.slice((4*batchSize)+(j*2)+(i*recSize*batchSize),(4*batchSize)+2+(j*2)+(i*recSize*batchSize));

        let gyrX = data.slice((6*batchSize)+(j*2)+(i*recSize*batchSize),(6*batchSize)+2+(j*2)+(i*recSize*batchSize));
        let gyrY = data.slice((8*batchSize)+(j*2)+(i*recSize*batchSize),(8*batchSize)+2+(j*2)+(i*recSize*batchSize));
        let gyrZ = data.slice((10*batchSize)+(j*2)+(i*recSize*batchSize),(10*batchSize)+2+(j*2)+(i*recSize*batchSize));
        
        let actType = data.slice((12*batchSize)+(j*1)+(i*recSize*batchSize),(12*batchSize)+1+(j*1)+(i*recSize*batchSize));

        let uintAccelX = new Uint16Array(new Uint8Array(accX).buffer)[0];
        let uintAccelY = new Uint16Array(new Uint8Array(accY).buffer)[0];
        let uintAccelZ = new Uint16Array(new Uint8Array(accZ).buffer)[0];

        let uintGyroX = new Uint16Array(new Uint8Array(gyrX).buffer)[0];
        let uintGyroY = new Uint16Array(new Uint8Array(gyrY).buffer)[0];
        let uintGyroZ = new Uint16Array(new Uint8Array(gyrZ).buffer)[0];

        let accelX = util.uInt16ToFloat(uintAccelX);
        let accelY = util.uInt16ToFloat(uintAccelY);
        let accelZ = util.uInt16ToFloat(uintAccelZ);

        let gyroX = util.uInt16ToFloat(uintGyroX);
        let gyroY = util.uInt16ToFloat(uintGyroY);
        let gyroZ = util.uInt16ToFloat(uintGyroZ);

        let activityType = new Uint8Array(actType)[0];
        recordData = recordData.concat([[[activityType],[accelX],[accelY],[accelZ],[gyroX],[gyroY],[gyroZ]]]);
      }
      rawData = rawData.concat([recordData]);
    }
    // Upload the received records to a server
    util.uploadDataToServer(rawData);
  }

}
