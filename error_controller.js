var fs = require('fs');    /* Import del file system */
var settings = require('./settings');


/*
   Messages level
   ----------------

   - SUCCESS
   - INFO
   - ERROR
   - START
   - END
   - WARNING
   - ""

*/
function log(errObj, level){
   var dt = new Date(Date.now()*1000);
   if ( level == undefined ) level="info";
   if ( typeof errObj == 'object' ) msg = dt.toString() + ' Object => ' + JSON.stringify(errObj, null, 4);
   else msg = errObj.toString();
   switch (level.toLowerCase()) {
      case "success":
         if (settings.OUTPUT_CONSOLE)
         {
            console.log("[SUCCESS]: " + msg);
         }
         if (settings.OUTPUT_FILE)
         {
            fs.appendFile(settings.ERROR_FILE,"[SUCCESS]: " + msg + "\r\n", function(err) {
               if(err) {
                 console.dir(err);
               }
            });
         }
         break;

      case "info":
         if (settings.OUTPUT_CONSOLE)
         {
            console.log("[INFO]: " + msg);
         }
         if (settings.OUTPUT_FILE)
         {
            fs.appendFile(settings.ERROR_FILE,"[INFO]: " + msg + "\r\n", function(err) {
               if(err) {
                 console.dir(err);
               }
            });
         }
         break;

      case "error":
         if (settings.OUTPUT_CONSOLE)
         {
            console.log("[ERROR]: " + msg);
         }
         if (settings.OUTPUT_FILE)
         {
            fs.appendFile(settings.ERROR_FILE,"[ERROR]: " + msg + "\r\n", function(err) {
               if(err) {
                 console.dir(err);
               }
            });
         }
         break;

      case "start":
         if (settings.OUTPUT_CONSOLE)
         {
            console.log("[START]: " + msg);
         }
         if (settings.OUTPUT_FILE)
         {
            fs.appendFile(settings.ERROR_FILE,"[START]: " + msg + "\r\n", function(err) {
               if(err) {
                 console.dir(err);
               }
            });
         }
         break;

      case "warning":
         if (settings.OUTPUT_CONSOLE)
         {
            console.log("[WARNING]: " + msg);
         }
         if (settings.OUTPUT_FILE)
         {
            fs.appendFile(settings.ERROR_FILE,"[WARNING]: " + msg + "\r\n", function(err) {
               if(err) {
                 console.dir(err);
               }
            });
         }
         break;

      case "end":
         if (settings.OUTPUT_CONSOLE)
         {
            console.log("[END]: " + msg);
         }
         if (settings.OUTPUT_FILE)
         {
            fs.appendFile(settings.ERROR_FILE,"[END]: " + msg + "\r\n", function(err) {
               if(err) {
                 console.dir(err);
               }
            });
         }
         break;
      default:
         if (settings.OUTPUT_CONSOLE)
         {
            console.log(msg);
         }
         if (settings.OUTPUT_FILE)
         {
            fs.appendFile(settings.ERROR_FILE,msg + "\r\n", function(err) {
               if(err) {
                 console.dir(err);
               }
            });
         }
         break;
   }
}
exports.Log = log;
