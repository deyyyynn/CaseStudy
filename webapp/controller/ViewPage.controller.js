sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], (Controller, History, JSONModel, MessageToast) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.ViewPage", {
        onInit() {
            this.getOwnerComponent().getRouter().getRoute("RouteViewPage").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const empId = oEvent.getParameter("arguments").employeeId;
            const sPath = `/EMPLOYEE('${empId}')`;

            // Bind the entire view to the employee
            this.getView().bindElement({
                path: sPath,
                parameters: {
                    expand: "Skills" // optional: ensure Skills are preloaded
                }
            });
        }
    });
});
