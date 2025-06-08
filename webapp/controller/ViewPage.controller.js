sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], (Controller, History, JSONModel, MessageToast) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.ViewPage", {
        onInit() {
            var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteViewPage").attachPatternMatched(this._onRouteMatched, this);
        },
        handleClose: function () {
			var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            var oRouter = this.getOwnerComponent().getRouter();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                oRouter.navTo("RouteEmployeeList", {}, true);
            }
		},
        _fetchSkillCount: function () {
            var oModel = this.getOwnerComponent().getModel();

            oModel.refresh(true);
            // Read the total count from the /EMPLOYEE endpoint using $count
            oModel.read("/SKILL/$count", {
                success: function (oData) {
                    // Set the total count of employees in the model
                    var oCountModel = new JSONModel({ employeeCount: oData });
                    this.getView().setModel(oCountModel, "employeeCountModel");
                }.bind(this),
                error: function () {
                    MessageToast.show("Error fetching employee skill count.");
                }
            });
        },
        _onRouteMatched: function(){
            this._fetchSkillCount();
        }
    });
});