sap.ui.define([], function() {
    "use strict";
    return {
      formatDate: function(sDate) {
        if (!sDate || sDate.length !== 8) {
          return sDate;
        }
        //For View
        // Parse MMDDYYYY string to readable format, e.g. "MM/DD/YYYY"
        var month = sDate.substring(0, 2);
        var day = sDate.substring(2, 4);
        var year = sDate.substring(4, 8);
        return month + "/" + day + "/" + year;
      },
      //For Filter
      toModelDateFormat: function(sInput) {
        sInput = sInput.replace(/\D/g, ""); // Remove any non-numeric characters
    
        if (sInput.length !== 8) {
            return sInput;
        }
    
        // DDMMYYYY
        var day = sInput.substring(0, 2);
        var month = sInput.substring(2, 4);
        var year = sInput.substring(4, 8);
        if (parseInt(day) <= 31 && parseInt(month) <= 12) {
            return month + day + year; // MMDDYYYY
        }
    
        // YYYYMMDD
        year = sInput.substring(0, 4);
        month = sInput.substring(4, 6);
        day = sInput.substring(6, 8);
        if (parseInt(month) <= 12) {
            return month + day + year; // MMDDYYYY
        }
    
        // Default: MMDDYYYY
        return sInput;
    }
    };
  });
  