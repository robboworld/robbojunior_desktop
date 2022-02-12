import {isiOS, gn} from '../utils/lib';
import IO from './IO';
import Lobby from '../lobby/Lobby';
import Alert from '../editor/ui/Alert';
import ScratchAudio from '../utils/ScratchAudio';
import {isTablet} from '../utils/lib';
import Localization from '../utils/Localization';
import ScratchJr from '../editor/ScratchJr'; //need to get current project name

//////////////////////////////////////////////////
//  Tablet interface functions
//////////////////////////////////////////////////

// This file and object are named "iOS" for legacy reasons.
// But, it is also used for the AndroidInterface. All function calls here
// are mapped to Android/iOS native calls.

let path;
let camera;
let database = 'projects';
let mediacounter = 0;
let tabletInterface = null;

const homedir = node_os.homedir();
const storagePath = homedir + (process.platform==="win32"?"/AppData/Local/RobboJuniorProjects":"/.config/RobboJuniorProjects/");



console.log("homedir = " + homedir);

export default class iOS {

   // Getters/setters for properties used in other classes
   static get path () {
      return path;
   }

   static get storagePath () {
      return storagePath;
   }

   static set path (newPath) {
      path = newPath;
   }

   static get camera () {
      return camera;
   }

   static get database () {
      return database;
   }

   static get getStoragePath(){
      return storagePath;
   }

   // Wait for the tablet interface to be injected into the webview
   static waitForInterface (fcn) {
      console.log("waitFotInterface");
      console.log("storagePath = " + storagePath);

      //Check if ~/.config and ~/.config/RobboJuniorProjects dirs exists
      //Or ~\AppData\Local\RobboJuniorProjects exists
   
      if (!node_fs.existsSync(storagePath)){
         node_fs.mkdirSync(storagePath);
         console.log("Dir " + storagePath + " created");
      } else {
         console.log("Dir " + storagePath + " exists");
      }

      //AZ
      String.prototype.replaceAll = function(search, replacement) {
         var target = this;
         return target.replace(new RegExp(search, 'g'), replacement);
      };



      if (!isTablet){
         tabletInterface = {};

         if (window.AudioContext) {
            tabletInterface.audioContext = new window.AudioContext();
            tabletInterface.analyser = tabletInterface.audioContext.createAnalyser();
            tabletInterface.analyser.fftSize = 1024;
            tabletInterface.analyser.smoothingTimeConstant = 0.5;
         }


         tabletInterface.io_registersound = function(a, b){
            console.log(a + " " + b);
         };

         tabletInterface.askForPermission = function(a){
         }

         tabletInterface.hideSplash = function(){
         };


         tabletInterface.io_getsettings = function(){
            console.log("io_getsettings");
            return "";
         }


         tabletInterface.io_playsound = function(soundFileName, fcn){
            console.log("play sound=" + soundFileName);

            //AZ

            var infinity_case = function(audio,fcn){
               console.log("Record duration infinity case!!!");

               // set it to bigger than the actual duration
               audio.currentTime = 1e101;
               audio.ontimeupdate = function(){
                  this.ontimeupdate = ()=>{return;}

                  if(audio.duration === Infinity){
                     //  setTimeout(infinity_case(audio,fcn),2000);
                     infinity_case(audio,fcn);
                  }else{
                     console.log("Playing " + audio.src + ", for: " + audio.duration + " seconds.");

                     if(fcn){
                        let dur =  Math.round(audio.duration * 1000) + 500;
                        setTimeout(fcn, dur);
                     }
                     audio.currentTime = 0;
                  }
                  audio.play();
               }
            }

            var player = function(url,duration){
               var audio = new Audio(url);
               audio.addEventListener('loadedmetadata', function(){


                  // if(audio.duration === Infinity){

                  if((typeof(audio.duration) != "number") || (audio.duration === Infinity)){

                  //  setTimeout(infinity_case(audio,fcn),2000);

                  //infinity_case(audio,fcn)

                  console.log("Playing " + audio.src + ", for: " + duration + " milliseconds.");
                     if(fcn){
                        let dur = duration + 500;
                        setTimeout(fcn, dur);
                     }
                     audio.play();
                  }else{
                     console.log("Playing " + audio.src + ", for: " + audio.duration + " seconds.");
                     if(fcn){
                        let dur =  Math.round(audio.duration * 1000) + 500;
                        setTimeout(fcn, dur);
                     }
                     audio.play();
                  }
               });
            };

            var record_duration = 0;

            if(soundFileName.startsWith("SND_")){
               tabletInterface.io_loadFileAPIBinaryURL(soundFileName, function(url){


               var db = openDatabase('jr', '1.0', 'Scratch Junior', 2 * 1024 * 1024);

               db.transaction(function(tx) {

                     tx.executeSql("SELECT record_duration FROM sound_records WHERE record_name =  ?", [soundFileName], function(tx,result){

                        record_duration =   result.rows.item(0)["record_duration"];

                        player(url,record_duration);
                     }, function(tx, error){});
                  });
               });
            }
            else{
               player('sounds/' + soundFileName);
            }
         }


         tabletInterface.io_stopsound = function(soundFileName, fcn){
            console.log("stop sound=" + soundFileName);

            if(fcn){
               fcn({});
            }
         }



         tabletInterface.io_getfile = function(a){
            console.log("read file=" + a);
            return "";
         }


         tabletInterface.createDB = function(tx){
            tx.executeSql('CREATE TABLE IF NOT EXISTS projects  (id INTEGER PRIMARY KEY AUTOINCREMENT, name, json, thumbnail, version, deleted, ctime, mtime, isgift, gallery)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS userbkgs  (id INTEGER PRIMARY KEY AUTOINCREMENT, altmd5, md5, width, height, ext, version, ctime, mtime)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS usershapes (id INTEGER PRIMARY KEY AUTOINCREMENT, altmd5, md5, width, height, ext, name,need_flip, scale, version, ctime, mtime)');

            tx.executeSql('CREATE TABLE IF NOT EXISTS cookies (id INTEGER PRIMARY KEY, cookie_content)'); //modified_by_Yaroslav

            tx.executeSql('CREATE TABLE IF NOT EXISTS sound_records (id INTEGER PRIMARY KEY AUTOINCREMENT , record_name,record_duration)'); //modified_by_Yaroslav

            //for sprites upload //modified_by_Yaroslav
            tx.executeSql('CREATE TABLE IF NOT EXISTS customsprites (id INTEGER PRIMARY KEY AUTOINCREMENT, altmd5, md5, width, height, ext, name,need_flip,sprites_order, tags, scale, version, ctime, mtime)',[],() => {},(a,error) => {console.error("Table custom sprites creation error: " + error.code + " " + error.message)});

            //for backgrounds upload //modified_by_Yaroslav
            tx.executeSql('CREATE TABLE IF NOT EXISTS custombkgs (id INTEGER PRIMARY KEY AUTOINCREMENT, altmd5, md5, width, height, ext, name,bkgs_order, tags, scale, version, ctime, mtime)',[],() => {},(a,error) => {console.error("Table custom backgrounds creation error: " + error.code + " " + error.message)});

            tx.executeSql('SELECT sql FROM sqlite_master WHERE type = "table" AND name = "usershapes"',[], function (tx,results){
                  if (results.rows[0].sql.indexOf("need_flip") == -1){
                     tx.executeSql('ALTER TABLE "usershapes" ADD COLUMN "need_flip" TEXT',[], function(tx, results){},
                        function(tx,error){
                           console.log("ALTER TABLE 'usershapes' error: " + error.message);
                        }
                     );
                  }
               },
               function (tx,error){
                  console.log("PRAGMA table_info error: " + error.message);
               }
            );
         }


         tabletInterface.database_query = function(dbCommand, callback){
            console.log("db=" + dbCommand);

            var objCommand = JSON.parse(dbCommand);

            var db = openDatabase('jr', '1.0', 'Scratch Junior', 2 * 1024 * 1024);

            db.transaction(function (tx) {
               tabletInterface.createDB(tx);

               tx.executeSql(objCommand.stmt, objCommand.values, function (tx, results) {
                  var len = results.rows.length, i;

                  var result = "[";
                  for (i = 0; i < len; i++){
                     var tmp = "";
                     for (var property in results.rows.item(i)) {
                        if (results.rows.item(i).hasOwnProperty(property)) {
                           if(results.rows.item(i)[property]){
                              if(tmp != "") tmp += ',';
                              tmp += '"' + property + '":"' + ("" + results.rows.item(i)[property]).replaceAll('"','\\"') + '"';
                           }
                           else{
                              //null at the db
                           }
                        }
                     }
                     result += "{" + tmp + "}";

                     if(i + 1 < len){
                        result += ',';
                     }
                  }
                  result += "]";

                  console.log(result);


                  if (typeof (callback) !== 'undefined') {
                     callback(result);
                  }

               }, function (a,b){alert('error=' + b)});
            });
         }

         tabletInterface.database_stmt = function(dbCommand, callback){
            console.log("db stmt=" + dbCommand);

            var objCommand = JSON.parse(dbCommand);

            var db = openDatabase('jr', '1.0', 'Scratch Junior', 2 * 1024 * 1024);

            db.transaction(function (tx) {
               tabletInterface.createDB(tx);

               tx.executeSql(objCommand.stmt, objCommand.values,() => {},(sql_tx,error) => {

                  console.error(`Database error code: ${error.code} message: ${error.message}`);
               });

               tx.executeSql("SELECT last_insert_rowid() as last_id", [], function (tx, results) {

                  if (typeof (callback) !== 'undefined') {
                     callback(results.rows.item(0).last_id);
                  }
               });
            });
         }


         tabletInterface.scratchjr_cameracheck = function(){
            return "1";
         }

         tabletInterface.deviceName = function(){
            return "Desktop Version";
         }


         tabletInterface.analyticsEvent = function(a){
            console.log("analit=" + a);
         }


         tabletInterface.io_setfile = function(a){
            console.log("setfile=" + a);
         }



         tabletInterface.io_cleanassets = function(a){
            console.log("io_cleanassets=" + a);
         }


         tabletInterface.io_getmd5 = function(s){
            console.log("io_getmd5()");
            function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H)}if(I|d){if(x&1073741824){return(x^3221225472^F^H)}else{return(x^1073741824^F^H)}}else{return(x^F^H)}}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]| (G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}function J(k){k=k.replace(/rn/g,"n");var d="";for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x)}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128)}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128)}}}return d}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase()
         };



         tabletInterface.scratchjr_stopfeed = function(a){
            console.log("scratchjr_stopfeed=" + a);
         }


         tabletInterface.io_setmedia = function(data, ext, callback){
            console.log("io_setmedia()");
            tabletInterface.io_setmedianame(data, tabletInterface.io_getmd5(data), ext, callback);
         }



         // tabletInterface.io_setmedianame  = function(data, name, extension, callback){
         //    console.log("io_setmedianame =" + name + " extension=" + extension + " data length=" + data.length);


         //    function errorHandler(e){
         //       //alert("file error" + e);
         //       console.error("file error" + e);
         //    };


         //    function onInitFs(fs) {
         //       console.log('Opened file system: ' + fs.name);

         //       fs.root.getFile(name + "." + extension, {create: true}, function(fileEntry) {

         //          fileEntry.createWriter(function(fileWriter) {
         //             fileWriter.onwriteend = function(e) {
         //                console.log('Write completed.');
         //                if((callback) && ((data instanceof Blob))){
         //                   console.log('Data is  a blob. Sound save  callback case.');
         //                   callback();
         //                }
         //                if((callback) && (!(data instanceof Blob))){
         //                   console.log('Data is not a blob. Standart callback case.');
         //                   callback(name + "." + extension);
         //                }
         //             }

         //             fileWriter.onerror = function(e) {
         //                console.log('Write failed: ' + e.toString());
         //             };

         //             if (!(data instanceof Blob)){
         //                var bb = new Blob([data]); // Note: window.WebKitBlobBuilder in Chrome 12.
         //                fileWriter.write(bb);
         //             }else{
         //                fileWriter.write(data);
         //             }
         //          });
         //       }, errorHandler);
         //    };
            

         //    tabletInterface.requestQuota(onInitFs, errorHandler);
         // }
         
         tabletInterface.io_setmedianame  = function(data, name, extension, callback){
            if(typeof(data) == "undefined") {
               console.log("Data in io_setmedianame is undefined!!!");
               return;
            }
            console.log("io_setmedianame =" + name + " extension=" + extension + " data length=" + data.length);

            name = storagePath + name;

            console.log("Current project is " + ScratchJr.currentProject);

            if (data instanceof Blob || data.constructor.name == "Blob"){
               //console.log("io_setmedianame log: (data instanceof Blob) == true");
               var reader = new FileReader();
               reader.onload = () => {
                  data = reader.result;
                  //console.log("Before:" + data);
                  data = data.slice(data.indexOf("base64,")+7);
                  //console.log("After:" + data);
                  tabletInterface.hidden_func_write_file(name, extension, data, callback, true);
               };
               reader.readAsDataURL(data);
            } else {
               console.log("In iPad/iOS.js in io_setmedianame data.length = " + data.length);
               //data = data.toString();
               tabletInterface.hidden_func_write_file(name, extension, data, callback, false);
            }
         }

            let usageCallback = function(bytesInUse,grantedBytes){
               navigator.webkitPersistentStorage.requestQuota(grantedBytes, 
                  function(grantedBytes){
                     console.log("byte granted=" + grantedBytes);
                     window.webkitRequestFileSystem(PERSISTENT, grantedBytes, initFsCb, errorHandler);
                  }, errorHandler
               );
            }
         tabletInterface.hidden_func_write_file = function(name, extension, data, callback, isSound){
            console.log("isSound = " + isSound+"; data.length = " + data.length);
            node_fs.writeFile(name+"."+extension, data, "utf-8", (err) => {
               // console.log(data);
               if(err) console.error("Error in fs.writeFile: " + err);
               else { 
                  console.log('Write completed.');
                  if((callback) && isSound){
                     console.log('Data is  a blob. Sound save  callback case.');
                     callback();
                  }
                  if((callback) && !isSound){
                     console.log('Data is not a blob. Standart callback case.');
                     callback(name + "." + extension);
                  }
               }
            });
         }

         // tabletInterface.requestQuota = function(initFsCb,errorHandler){

         //    let errorCallback = function(error){
         //       console.error("tabletInterface.requestQuota " + error);
         //    }

         //    let usageCallback = function(bytesInUse,grantedBytes){
         //       navigator.webkitPersistentStorage.requestQuota(grantedBytes, 
         //          function(grantedBytes){
         //             console.log("byte granted=" + grantedBytes);
         //             window.webkitRequestFileSystem(PERSISTENT, grantedBytes, initFsCb, errorHandler);
         //          }, errorHandler
         //       );
         //    }

         
         //    window.webkitStorageInfo.queryUsageAndQuota(
         //       webkitStorageInfo.PERSISTENT,
         //       usageCallback,
         //       errorCallback,
         //    );
         // }


         tabletInterface.io_remove  = function(name,cb){
            console.log("io_remove = " + name);

            console.log("ScratchJr.currentProject = " + ScratchJr.currentProject);
            var error_object = {err_msg:"",err_code:0};
            var result_object = {error:error_object};

            var  errorHandler = function(e){
               console.error("File error during removing: " + e);

               if (cb){
                  error_object.err_msg = "File error during removing: " + e;
                  error_object.err_code = 1;

                  result_object.error = error_object;

                  cb(result_object);
               }
            };

            //  navigator.webkitPersistentStorage.requestQuota(2 *1024*1024*1024, //2Гб
            //     function(grantedBytes){
            //  //      console.log("byte granted=" + grantedBytes);
            //        window.webkitRequestFileSystem(PERSISTENT, grantedBytes, _onInitFs, errorHandler);
            //     }, errorHandler);

            // name = storagePath + name;

            node_fs.unlink(name, function(err){ //unlink = delete file
               if(err) errorHandler(err);
               else console.log("File "+name+" was successfully removed!");
            });
         }

         /*
               tabletInterface.io_getmedialen  = function(name, callback){
                  console.log("io_getmedialen =" + name);

                  return 0;
               }
         */


         tabletInterface.io_getmediadone  = function(name){
            console.log("io_getmediadone =" + name);
         }


         tabletInterface.io_getStorageSpaceInfo = function(callback){
            console.log("io_getStorageFreeSpace");

            let errorCallback = function(error){
               console.error(error);
            }

            let usageCallback = function(bytesInUse,grantedBytes){
               var result = {
                  bytesInUse: bytesInUse,
                  grantedBytes: grantedBytes,
               }

               if (callback){
                  callback(result);
               }
            }

            window.webkitStorageInfo.queryUsageAndQuota(
               webkitStorageInfo.PERSISTENT,
               usageCallback,
               errorCallback,
            );
         }

         // tabletInterface.io_getStorageSpaceInfo = function(callback){
         //    console.log("io_getStorageFreeSpace");

            
         //    disk.check(process.platform === 'win32' ? 'c:' : '/', (err, info) => { //disk = require('diskusage');
         //       if(callback){
         //          callback({
         //             bytesInUse: info.
         //             grantedBytes: info.available,
         //          });
         //       }
         //    });
         // }

         // tabletInterface.io_loadFileAPI = function(sFile, callback){
         //    console.log("io_loadFileAPI =" + sFile);

         //    function errorHandler(e){
         //       alert("file error" + e);
         //    };


         //    function onInitFs(fs) {
         //       console.log('Opened file system: ' + fs.name);
               
         //       //true
         //       fs.root.getFile(sFile, {create: false}, function(fileEntry) {
         //          fileEntry.file(function(file) {
         //             var reader = new FileReader();

         //             reader.onloadend = function(e) {
         //                console.log("Read completed for " + sFile + " length=" + this.result.length);
         //                callback(this.result);
         //             };

         //             reader.readAsText(file);
         //          });

         //       }, errorHandler);
         //    };

         //    //  navigator.webkitPersistentStorage.requestQuota(2 *1024*1024*1024, //2Гб
         //    //     function(grantedBytes){
         //    //        console.log("byte granted=" + grantedBytes);
         //    //        window.webkitRequestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler);
         //    //     }, errorHandler
         //    //  );

         //    tabletInterface.requestQuota(onInitFs, errorHandler);

         // }

         tabletInterface.io_loadFileAPI = function(sFile, callback){
            // sFile = storagePath + sFile;
            console.log("io_loadFileAPINew sFile=" + sFile);

            node_fs.readFile(sFile, (err, data) => {
               if(err) {
                  console.error("io_loadFileAPINew error: " + err);
               } else {
                  console.log(data.length);
                  callback(data);
               }
            });
         }

         tabletInterface.io_loadFileAPIBinaryURL = function(sFile, callback){
            console.log("io_loadFileAPIBinaryURL =" + sFile);

            let dataType = {}

            console.log("EXT IS " + sFile.slice(sFile.length - 3));

            if(sFile.slice(sFile.length - 3) === "png"){
               dataType.type = "image";
               dataType.ext = "png";
            } else if(sFile.slice(sFile.length - 3) === "svg"){
               dataType.type = "image";
               dataType.ext = "svg";
            } else if(sFile.slice(sFile.length - 3) === "wav"){
               dataType.type = "video";
               dataType.ext = "webm";
            }

            sFile = storagePath + sFile;


            node_fs.readFile(sFile, (err, data) => {
               if(err) console.error(err);
               else{
                  console.log("iOS:io_loadFileAPIBina...:Trying to read file " + sFile);
                  var resp = "data:"+dataType.type+"/"+dataType.ext+";base64,"+data;

                  if(data.constructor.name == "Buffer"){
                     console.log("loadFileAPIBinaryURL data is Buffer, type is " + data.type + " and size is " + data.size);
                     // console.log(data.toString());
                  }
                  // console.log("loadFileAPIBinaryURL.resp = " + resp);
                  callback(resp);
               }
            });
         }


         // tabletInterface.io_loadFileAPIBinaryURL = function(sFile, callback){
         //    console.log("io_loadFileAPIBinaryURL =" + sFile);

         //    function errorHandler(e){
         //       alert("file error" + e);
         //    };


         //    function onInitFs(fs) {
         //       console.log('Opened file system: ' + fs.name);

         //       let create_option = {};

         //       if (sFile.startsWith("SND_")){
         //          create_option.create = false;
         //       }else{
         //          create_option.create = true;
         //          //{create: true}
         //       }

               // var listResults = function(entries){
               //    entries.forEach(function(entry, i) {
               //       console.log("Directory entry: " + entry + "name: " + entry.name + " " + "full_path: " + entry.fullPath);
               //    });
               // }
               // var dirReader = fs.root.createReader();
               // var entries = [];
               // var readEntries = function() {
               //    function toArray(list) {
               //       return Array.prototype.slice.call(list || [], 0);
               //    }
               //    dirReader.readEntries (function(results) {
               //       if (!results.length) {
               //          listResults(entries.sort());
               //       } else {
               //          entries = entries.concat(toArray(results));
               //          readEntries();
               //       }
               //    }, errorHandler);
               // };
               // readEntries();


            //    fs.root.getFile(sFile, create_option, function(fileEntry) {
            //       fileEntry.file(function(file) {
            //          var reader = new FileReader();

            //          reader.onloadend = function(e) {
            //             console.log("Read completed for " + sFile + ". length=" + this.result.length);
            //             console.log("Result is " + this.result);
            //             callback(this.result);
            //          };

            //          reader.readAsDataURL(file);
            //       });

            //    }, errorHandler);
            // };

            //  navigator.webkitPersistentStorage.requestQuota(2 *1024*1024*1024, //2Гб
            //     function(grantedBytes){
            //        console.log("byte granted=" + grantedBytes);
            //        window.webkitRequestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler);
            //     }, errorHandler
            //  );

         //    tabletInterface.requestQuota(onInitFs, errorHandler);
         // }


         

         navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

         tabletInterface.recordsound_recordstart = function(fcn){
            console.log("recordsound_recordstart");


            var constraints = {video:false, audio: true};
            navigator.getUserMedia(
               constraints,
               function(localMediaStream){
                  console.log("localMediaStream=" + localMediaStream);

                  tabletInterface.mediaStreamSource = tabletInterface.audioContext.createMediaStreamSource(localMediaStream);
                  tabletInterface.mediaStreamSource.connect(tabletInterface.analyser);


                  tabletInterface.mediaRecorder = new MediaRecorder(localMediaStream);
                  tabletInterface.record = {

                  record_start_time:0,
                  record_stop_time:0,
                  record_duration:0

                  };

                  tabletInterface.mediaRecorder.ondataavailable = function(e){
                     tabletInterface.audioURL  = window.URL.createObjectURL(e.data);
                     tabletInterface.audioData = e.data;
                     console.log("audio file is ready=" + tabletInterface.audioURL);
                  }
                  tabletInterface.mediaRecorder.start();
                  tabletInterface.record.record_start_time = Date.now();
                  console.log("record started at: " + tabletInterface.record.record_start_time + " ms");


                  if(fcn){
                     tabletInterface.audioName = "SND_" + new Date().getTime();
                     fcn(tabletInterface.audioName + ".wav");
                  }
               },
               function(err){


                  tabletInterface.record.record_start_time = Date.now();
                  alert(Localization.localize('NAVIGATOR_USER_MEDIA_ERROR'));
               }
            );
         }


         tabletInterface.recordsound_volume = function(fcn){
            if(tabletInterface.audioContext.state === 'suspended'){
               tabletInterface.audioContext.resume();
            }
            var array = new Uint8Array(tabletInterface.analyser.frequencyBinCount);
            tabletInterface.analyser.getByteFrequencyData(array);
            var values = 0;

            var length = array.length;
            for (var i = 0; i < length; i++) {
               values += array[i];
            }

            if (fcn) {
               fcn((0.01 * values) / length);
            }
         }


         tabletInterface.recordsound_recordstop = function(){
            console.log("recordsound_recordstop");

            tabletInterface.mediaRecorder.stop();
            tabletInterface.record.record_stop_time = Date.now();
            console.log("record stoped at: " + tabletInterface.record.record_stop_time + " ms");
         }


         tabletInterface.recordsound_startplay = function(){
            console.log("recordsound_startplay");
            var audio = new Audio(tabletInterface.audioURL);
            audio.play();
         }


         tabletInterface.recordsound_recordclose = function(){
            console.log("recordsound_recordclose");
            if ((tabletInterface.record.record_stop_time < 0) || (tabletInterface.record.record_stop_time == null ) || (typeof(tabletInterface.record.record_stop_time) == 'undefined' ) ){
               tabletInterface.record.record_stop_time = Date.now();
               console.log("record stoped at: " + tabletInterface.record.record_stop_time + " ms");
            }

            tabletInterface.record.record_duration = tabletInterface.record.record_stop_time -  tabletInterface.record.record_start_time;
            console.log("record duration: " + tabletInterface.record.record_duration + " ms");

            var db = openDatabase('jr', '1.0', 'Scratch Junior', 2 * 1024 * 1024);

            db.transaction(function (tx) {
            tx.executeSql("INSERT INTO sound_records (record_name, record_duration) values(?, ?)", [tabletInterface.audioName + ".wav", tabletInterface.record.record_duration], null, null);
            });

            tabletInterface.io_setmedianame(tabletInterface.audioData, tabletInterface.audioName, "wav");

            tabletInterface.record.record_data  = new Blob([tabletInterface.audioData]);
            return tabletInterface.record;
         }


         tabletInterface.scratchjr_choosecamera = function(){
            console.log("scratchjr_choosecamera");

            tabletInterface.camera.iDeviceNumber++;

            navigator.mediaDevices.enumerateDevices().then(function(devices){
               console.log("device selector started...");

               if(tabletInterface.camera.iDeviceNumber > tabletInterface.camera.iDeviceCounter - 1){
                  tabletInterface.camera.iDeviceNumber = 0;
               }

               tabletInterface.camera.iDeviceCounter = 0;
               devices.forEach(function(device){
                  if(device.label === 'Default' || device.label == ""){
                           // Skip Default
                  }
                  else if(device.kind === 'videoinput'){
                     if(tabletInterface.camera.iDeviceCounter == tabletInterface.camera.iDeviceNumber){

                        var constraints = {video: {deviceId:{exact:device.deviceId}}, audio: false};
                        navigator.getUserMedia(
                           constraints,
                           function(localMediaStream){
                              console.log("localMediaStream=" + localMediaStream);
                              tabletInterface.camera.localMediaStream = localMediaStream;
                              tabletInterface.camera.oVideo.setAttribute('src', window.URL.createObjectURL(localMediaStream));
                           },
                           function(err){
                              alert(err);
                           }
                        );
                     }
                     tabletInterface.camera.iDeviceCounter++;
                  }
               });
            });
         }




         function translate_and_scale(rect, devicePixelRatio){
            rect.left = rect.left * devicePixelRatio;
            rect.right = rect.right * devicePixelRatio;
            rect.top = rect.top * devicePixelRatio;
            rect.bottom = rect.bottom * devicePixelRatio;
            return rect;
         }
         function scaleRectFromCenter(rect,scale){
            let deltaWidth = rect.width() * scale - rect.width();
            let deltaHeight = rect.height() * scale - rect.height();
            rect.left -= deltaWidth / 2;
            rect.top -= deltaHeight / 2;
            rect.right += deltaWidth / 2;
            rect.bottom += deltaHeight / 2;
            return rect;
         }
         tabletInterface.scratchjr_startfeed = function(data, fcn){
            console.log("scratchjr_startfeed data=" + JSON.stringify(data));


            tabletInterface.camera = {};
            tabletInterface.camera.data = data;
            tabletInterface.camera.iDeviceNumber = 0;

            var rectCamera = {};
            var rectImage = {};

            rectImage.left = data.mx;
            rectImage.top = data.my;
            rectImage.right = data.mx + data.mw;
            rectImage.bottom = data.my + data.mh;
            rectImage.width = function(){
               return this.right - this.left;
            };
            rectImage.height = function(){
               return this.bottom - this.top;
            };

            rectCamera.left = data.x;
            rectCamera.top = data.y;
            rectCamera.right = (data.x + data.width);
            rectCamera.bottom = (data.y + data.height);
            rectCamera.width = function(){
               return (this.right - this.left);
            };
            rectCamera.height = function(){
               return (this.bottom - this.top);
            };



            rectImage = translate_and_scale(rectImage,data.devicePixelRatio);
            rectCamera = translate_and_scale(rectCamera,data.devicePixelRatio);

            rectImage = scaleRectFromCenter(rectImage,data.scale);
            rectCamera = scaleRectFromCenter(rectCamera,data.scale);



            var oImg = document.createElement("img");
            oImg.setAttribute('src', data.image);
            oImg.style.left = rectImage.left + "px";
            oImg.style.top = rectImage.top + "px";
            oImg.style.width = rectImage.width() + "px";
            oImg.style.height = rectImage.height() + "px";
            oImg.style.position = "absolute";
            oImg.style.zIndex = "10002";
            document.body.appendChild(oImg);
            tabletInterface.camera.oImg = oImg;



            var constraints = {video:true, audio: false};
            navigator.getUserMedia(
               constraints,
               function(localMediaStream){
                  console.log("localMediaStream=" + localMediaStream);
                  tabletInterface.camera.localMediaStream = localMediaStream;

                  var oVideo = document.createElement("video");
                  oVideo.setAttribute('src', window.URL.createObjectURL(localMediaStream));
                  oVideo.setAttribute('autoplay', "true");
                  oVideo.style.left   = rectCamera.left + "px";
                  oVideo.style.top    = rectCamera.top + "px";
                  oVideo.style.width  = rectCamera.width() + "px";
                  oVideo.style.height = rectCamera.height() + "px";
                  oVideo.style.objectFit = "initial";
                  oVideo.style.position = "absolute";
                  oVideo.style.zIndex = "10000";
                  document.body.appendChild(oVideo);
                  tabletInterface.camera.oVideo = oVideo;


                  fcn("1");
               },
               function(err){
                  alert(err);
               }
            );
         }


         function closeAudio(){
            if(tabletInterface.mic.localMediaStream.getAudioTracks()){
               for(var f = 0; f < tabletInterface.mic.localMediaStream.getAudioTracks().length; f++){
                  try{
                     tabletInterface.mic.localMediaStream.getAudioTracks()[f].stop();
                  }
                  catch(err){
                     console.log(err);
                  }
               }
            }
         }
         function closeVideo(){
            if(tabletInterface.camera.localMediaStream.getVideoTracks()){
               for(var f = 0; f < tabletInterface.camera.localMediaStream.getVideoTracks().length; f++){
                  try{
                     tabletInterface.camera.localMediaStream.getVideoTracks()[f].stop();
                  }
                  catch(err){
                     console.log(err);
                  }
               }
            }
         }
         tabletInterface.scratchjr_stopfeed = function(){
            console.log("scratchjr_stopfeed");

            if(tabletInterface.camera){
               if(tabletInterface.camera.oImg.parentNode){
                  tabletInterface.camera.oImg.parentNode.removeChild(tabletInterface.camera.oImg);
               }
               if(tabletInterface.camera.oVideo.parentNode){
                  tabletInterface.camera.oVideo.parentNode.removeChild(tabletInterface.camera.oVideo);
               }
               closeVideo();

               delete tabletInterface.camera;
            }
         }
         tabletInterface.scratchjr_captureimage = function(fcn){
            console.log("scratchjr_captureimage");

            var canvas = document.createElement('canvas');

            // canvas.left = 0 + "px";
            //   canvas.top =  0 + "px";
            //    canvas.style.width = tabletInterface.camera.oVideo.offsetWidth + "px";
            //    canvas.style.height = tabletInterface.camera.oVideo.offsetHeight + "px";
            canvas.width = tabletInterface.camera.oVideo.offsetWidth;
            canvas.height = tabletInterface.camera.oVideo.offsetHeight;

            // canvas.style.position = "absolute";
            // canvas.style.zIndex = "10002";

            var ctx = canvas.getContext('2d');
            ctx.drawImage(tabletInterface.camera.oVideo,
                        0,
                        0,
                        tabletInterface.camera.oVideo.offsetWidth,  // tabletInterface.camera.data.mx + tabletInterface.camera.data.mw,
                        tabletInterface.camera.oVideo.offsetHeight);// tabletInterface.camera.data.my + tabletInterface.camera.data.mh);
            var sBase64 = canvas.toDataURL().replace("data:image/png;base64,", "");
            //         alert(sBase64);
            /*var Img = document.createElement("img");
            Img.setAttribute('src', canvas.toDataURL());
            Img.style.left = 0 + "px";
            Img.style.top =  0 + "px";
            Img.style.width = tabletInterface.camera.oVideo.offsetWidth + "px";
            Img.style.height = tabletInterface.camera.oVideo.offsetHeight + "px";
            Img.style.position = "absolute";
            //Img.style.zIndex = "10002";
            document.body.appendChild(Img);*/

            Camera.processimage(sBase64);
         }

         if (fcn) {
            fcn();
         }
      }else{
         // Already loaded the interface
         if (tabletInterface != null) {
            fcn();
            return;
         }

         // Android device
         if (typeof AndroidInterface !== 'undefined') {
            tabletInterface = AndroidInterface;
            if (fcn) {
                fcn();
            }
            return;
         }
         // iOS device - might not be loaded yet
         if (typeof (window.tablet) != 'object') {
            // Come back in 100ms
            setTimeout(function () {
                iOS.waitForInterface(fcn);
            }, 100);
         } else {
            // All set to run commands
            tabletInterface = window.tablet;
            if (fcn) {
                fcn();
            }
         }
      }

   }

   // Database functions
   static stmt (json, fcn) {
      //AZ let's push the call back if we are not in the tablet
      var result;



      if(isTablet){
         result = tabletInterface.database_stmt(JSON.stringify(json));
         if (typeof (fcn) !== 'undefined') {
            fcn(result);
         }
      } else {
         result = tabletInterface.database_stmt(JSON.stringify(json), fcn);
      }
   }

   static query (json, fcn) {
      //AZ let's push the call back if we are not in the tablet
      var result;


      if (tabletInterface == null){

         String.prototype.replaceAll = function(search, replacement) {
            var target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
         };

         tabletInterface = {};

         tabletInterface.createDB = function(tx){
            tx.executeSql('CREATE TABLE IF NOT EXISTS projects  (id INTEGER PRIMARY KEY AUTOINCREMENT, name, json, thumbnail, version, deleted, ctime, mtime, isgift, gallery)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS userbkgs  (id INTEGER PRIMARY KEY AUTOINCREMENT, altmd5, md5, width, height, ext, version, ctime, mtime)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS usershapes (id INTEGER PRIMARY KEY AUTOINCREMENT, altmd5, md5, width, height, ext, name,need_flip, scale, version, ctime, mtime)');

            //for sprites upload //modified_by_Yaroslav
            tx.executeSql('CREATE TABLE IF NOT EXISTS customsprites (id INTEGER PRIMARY KEY AUTOINCREMENT, altmd5, md5, width, height, ext, name,need_flip,sprites_order, tags, scale, version, ctime, mtime)',[],() => {},(a,error) => {console.error("Table custom sprites creation error: " + error.code + " " + error.message)});

            //for backgrounds upload //modified_by_Yaroslav
            tx.executeSql('CREATE TABLE IF NOT EXISTS custombkgs (id INTEGER PRIMARY KEY AUTOINCREMENT, altmd5, md5, width, height, ext, name,bkgs_order, tags, scale, version, ctime, mtime)',[],() => {},(a,error) => {console.error("Table custom backgrounds creation error: " + error.code + " " + error.message)});

            tx.executeSql('CREATE TABLE IF NOT EXISTS cookies (id INTEGER PRIMARY KEY, cookie_content)'); //modified_by_Yaroslav

            tx.executeSql('CREATE TABLE IF NOT EXISTS sound_records (id INTEGER PRIMARY KEY AUTOINCREMENT , record_name,record_duration)'); //modified_by_Yaroslav

            tx.executeSql('SELECT sql FROM sqlite_master WHERE type = "table" AND name = "usershapes"',[], function (tx,results){


                  if (results.rows[0].sql.indexOf("need_flip") == -1){
                     tx.executeSql('ALTER TABLE "usershapes" ADD COLUMN "need_flip" TEXT',[], function(tx, results){},
                        function(tx,error){
                           console.log("ALTER TABLE 'usershapes' error: " + error.message);
                        }
                     );
                  }
               },
               function (tx,error){
                  console.log("PRAGMA table_info error: " + error.message);
               }
            );
         }


         tabletInterface.database_query = function(dbCommand, callback){
            console.log("db=" + dbCommand);

            var objCommand = JSON.parse(dbCommand);

            var db = openDatabase('jr', '1.0', 'Scratch Junior', 2 * 1024 * 1024);


            db.transaction(function (tx) {
               tabletInterface.createDB(tx);

               //   console.log("query::database_query1")


               tx.executeSql(objCommand.stmt, objCommand.values, function (tx, results) {
                  //   tx.executeSql('SELECT * FROM customsprites', [], function (tx, results) {
                  //   console.log("query::database_query")
                  var len = results.rows.length, i;

                  var result = "[";
                  for (i = 0; i < len; i++){
                     var tmp = "";
                     for (var property in results.rows.item(i)) {
                        if (results.rows.item(i).hasOwnProperty(property)) {
                           if( (results.rows.item(i)[property])/* && (results.rows.item(i)[property] !== null) && (property != "id")*/ ){
                              if(tmp != "") tmp += ',';
                              tmp += '"' + property + '":"' + ("" + results.rows.item(i)[property]).replaceAll('"','\\"') + '"';
                           }
                           else{
                              //null at the db
                           }
                        }
                     }
                     result += "{" + tmp + "}";

                     if(i + 1 < len){
                        result += ',';
                     }
                  }
                  result += "]";

                  console.log(result);

                  if (typeof (callback) !== 'undefined') {
                     callback(result);
                  }
               }, function (a,b){alert('error=' + b)});
            });
         }
      }

      if(isTablet){
         var result = tabletInterface.database_query(JSON.stringify(json));
         if (typeof (fcn) !== 'undefined') {
            fcn(result);
         }
      } else {
         var result = tabletInterface.database_query(JSON.stringify(json), fcn);
      }
   }

   static setfield (db, id, fieldname, val, fcn) {
      var json = {};
      var keylist = [fieldname + ' = ?', 'mtime = ?'];
      json.values = [val, (new Date()).getTime().toString()];
      json.stmt = 'update ' + db + ' set ' + keylist.toString() + ' where id = ' + id;
      iOS.stmt(json, fcn);
   }

   static loadFileAPIBinaryURL(sFile, callback){
      tabletInterface.io_loadFileAPIBinaryURL(sFile, callback);
   }

   // IO functions

   static cleanassets (ft, fcn) {
      tabletInterface.io_cleanassets(ft); fcn();
   }

   static getmedia (file, fcn) {
      mediacounter++;
      var nextStep = function (file, key, whenDone) {
         //AZ
         if(isTablet){
            var result = tabletInterface.io_getmedialen(file, key);
            iOS.processdata(key, 0, result, '', whenDone);
         } else {
            tabletInterface.io_loadFileAPI(file, fcn);
         }
      };
      nextStep(file, mediacounter, fcn);
   }

   static getmediadata (key, offset, len, fcn) {
      var result = tabletInterface.io_getmediadata(key, offset, len);
      if (fcn) {
         fcn(result);
      }
   }

   static processdata (key, off, len, oldstr, fcn) {
      if (len == 0) {
         iOS.getmediadone(key);
         fcn(oldstr);
         return;
      }
      var newlen = (len < 100000) ? len : 100000;
      iOS.getmediadata(key, off, newlen, function (str) {
         iOS.processdata(key, off + newlen, len - newlen, oldstr + str, fcn);
      });
   }

   static getsettings (fcn) {
      if(isTablet){
         var result = tabletInterface.io_getsettings();
         if (fcn) {
            fcn(result);
         }
      } else {
         var hasCameraAccess = false;
         navigator.mediaDevices.enumerateDevices().then(function(devices){

            for(var i = 0; i < devices.length; i++){
               if(devices[i].kind === 'videoinput'){
                  hasCameraAccess = true;
               }
            };

            fcn(",,YES," + (hasCameraAccess ? "YES" : "NO"));
         });
      }
   }

   static getmediadone (file, fcn) {
      var result = tabletInterface.io_getmediadone(file);
      if (fcn) {
         fcn(result);
      }
   }

   static setmedia (str, ext, fcn) {
      var result;
      if(isTablet){
         var result = tabletInterface.io_setmedia(str, ext);
         if (fcn) {
            fcn(result);
         }
      }
      else{
         tabletInterface.io_setmedia(str, ext, fcn);
      }
   }

   static setmedianame (str, name, ext, fcn) {

   console.log("setmedianame() | name:" + name);

      var result;
      if(isTablet){
         result = tabletInterface.io_setmedianame(str, name, ext);
         if (fcn) {
            fcn(result);
         }
      }
      else{
         tabletInterface.io_setmedianame(str, name, ext, fcn);
      }
   }

   static getmd5 (str, fcn) {
      var result = tabletInterface.io_getmd5(str);
      if (fcn) {
         fcn(result);
      }
   }

   static remove (str, fcn) {
      //    var result = null;
      //     if (fcn) {
      //         fcn(result);
      //     }
      tabletInterface.io_remove(str,(result_object) => {
         if (fcn){
            fcn("iOS remove:" +str + " "  + result_object.error.err_msg);
         }
      });     
   }

   static  uploaded_asset_remove(str, fcn){
      tabletInterface.io_remove(str,fcn);
   }

   static getfile (str, fcn) {
      var result = tabletInterface.io_getfile(str);
      if (fcn) {
         fcn(result);
      }
   }

   static setfile (name, str, fcn) {
      var result = tabletInterface.io_setfile(name, btoa(str));
      if (fcn) {
         fcn(result);
      }
   }

   static getStorageSpaceInfo(fcn){
      tabletInterface.io_getStorageSpaceInfo(fcn);
   }

   // Sound functions

   static registerSound (dir, name, fcn) {
      var result = tabletInterface.io_registersound(dir, name);
      if (fcn) {
         fcn(result);
      }
   }

   static playSound (name, fcn) {
      if(isTablet){
         var result = tabletInterface.io_playsound(name);
         if (fcn){
            fcn(result);
         }
      }
      else{
         tabletInterface.io_playsound(name, fcn);
      }
   }

   static stopSound (name, fcn) {
      if(isTablet){
         var result = tabletInterface.io_stopsound(name);
         if (fcn) {
            fcn(result);
         }
      }
      else{
         tabletInterface.io_stopsound(name, fcn);
      }
   }

    // Web Wiew delegate call backs

   static soundDone (name) {
      ScratchAudio.soundDone(name);
   }

   static sndrecord (fcn) {
      if(isTablet){
         var result = tabletInterface.recordsound_recordstart();
         if (fcn) {
            fcn(result);
         }
      }
      else{
         tabletInterface.recordsound_recordstart(fcn);
      }
   }

   static recordstop (fcn) {
      var result = tabletInterface.recordsound_recordstop();
      if (fcn) {
         fcn(result);
      }
   }

   static volume (fcn) {
      if(isTablet){
         var result = tabletInterface.recordsound_volume();
         if (fcn) {
            fcn(result);
         }
      }
      else{
         tabletInterface.recordsound_volume(fcn);
      }
   }

   static startplay (fcn) {
      var result = tabletInterface.recordsound_startplay();
      if (fcn) {
         fcn(result);
      }
   }

   static stopplay (fcn) {
      var result = tabletInterface.recordsound_stopplay();
      if (fcn) {
         fcn(result);
      }
   }

   static recorddisappear (b, fcn) {
      var result = tabletInterface.recordsound_recordclose(b);
      if (fcn) {
         fcn(result);
      }
   }

    // Record state
   static askpermission () {
      if (isiOS) {
         tabletInterface.askForPermission();
      }
   }

   // camera functions
   static hascamera () {
      camera = tabletInterface.scratchjr_cameracheck();
   }

   static startfeed (data, fcn) {
      if(isTablet){
         var str = JSON.stringify(data);
         var result = tabletInterface.scratchjr_startfeed(str);
         if (fcn) {
            fcn(result);
         }
      } else {
         tabletInterface.scratchjr_startfeed(data, fcn);
      }
   }

   static stopfeed (fcn) {
      var result = tabletInterface.scratchjr_stopfeed();
      if (fcn) {
         fcn(result);
      }
   }

   static choosecamera (mode, fcn) {
      var result = tabletInterface.scratchjr_choosecamera(mode);
      if (fcn) {
         fcn(result);
      }
   }

   static captureimage (fcn) {
      tabletInterface.scratchjr_captureimage(fcn);
   }

   static hidesplash (fcn) {
      if (isiOS) {
         tabletInterface.hideSplash();
      }
      if (fcn) {
         fcn();
      }
   }

   static trace (str) {
      console.log(str); // eslint-disable-line no-console
   }

   static parse (str) {
      console.log(JSON.parse(str)); // eslint-disable-line no-console
   }

   static tracemedia (str) {
      console.log(atob(str)); // eslint-disable-line no-console
   }

   ignore () {
   }

    ///////////////
    // Sharing
    ///////////////


    // Called on the JS side to trigger native UI for project sharing.
    // fileName: name for the file to share
    // emailSubject: subject text to use for an email
    // emailBody: body HTML to use for an email
    // shareType: 0 for Email; 1 for Airdrop
    // b64data: base-64 encoded .SJR file to share

   static sendSjrToShareDialog (fileName, emailSubject, emailBody, shareType, b64data) {
      tabletInterface.sendSjrUsingShareDialog(fileName, emailSubject, emailBody, shareType, b64data);
   }


   static save_project_to_sjr(fileName, b64data){
      if (isTablet){
      }else{
         tabletInterface.io_setmedianame(b64data,fileName,"sjr");
      }
   }

   // Called on the Objective-C side.  The argument is a base64-encoded .SJR file,
   // to be unzipped, processed, and stored.
   static loadProjectFromSjr (b64data) {
      try {
         IO.loadProjectFromSjr(b64data);
      } catch (err) {
         var errorMessage = 'Couldn\'t load share -- project data corrupted. ' + err.message;
         Alert.open(gn('frame'), gn('frame'), errorMessage, '#ff0000');
         console.log(err); // eslint-disable-line no-console
         return 0;
      }
      return 1;
   }

   // Name of the device/iPad to display on the sharing dialog page
   // fcn is called with the device name as an arg
   static deviceName (fcn) {
      fcn(tabletInterface.deviceName());
   }

   static analyticsEvent (category, action, label, value) {
      if (!label) {
         label = '';
      }
      if (!value) {
         value = 1;
      }
      tabletInterface.analyticsEvent(category, action, label, value);
   }

   // Web Wiew delegate call backs

   static pageError (desc) {
      console.log('XCODE ERROR:', desc); // eslint-disable-line no-console
      if (window.location.href.indexOf('home.html') > -1) {
         if (Lobby.errorTimer) {
               Lobby.errorLoading(desc);
         }
      }
   }
}

// Expose iOS methods for ScratchJr tablet sharing callbacks
window.iOS = iOS;