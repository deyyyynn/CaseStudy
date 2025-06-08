sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History"
], (Controller, JSONModel, History) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.CreatePage", {
        onInit() {
            // Date of Hire Conditions
            var oDatePicker = this.byId("datePicker");
            var oToday = new Date();
            var oMaxDate = new Date();
            oMaxDate.setFullYear(oMaxDate.getFullYear() + 1); // +1 year from today
        
            // Set default value (today)
            oDatePicker.setDateValue(oToday);
        
            // Set min and max dates
            oDatePicker.setMinDate(oToday);
            oDatePicker.setMaxDate(oMaxDate);

            var oModel = new sap.ui.model.json.JSONModel({
                selectedDate: oToday
            });            
        },
        onClickBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getOwnerComponent().getRouter().navTo("RouteEmployeeList", null, true);
			}
		}       
    });
});