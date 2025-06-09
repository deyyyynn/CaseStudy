sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History"
], (Controller, JSONModel, History) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.EmployeeAddSkill", {
        onInit() {

        },

        onCancelDialog: function(){
            this.getView().byId("idAddSkill").close();
        }

    });

});