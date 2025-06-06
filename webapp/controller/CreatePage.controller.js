sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], (Controller, History) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.CreatePage", {
        onInit() {
            // var oRouter = this.getOwnerComponent().getRouter();
            // oRouter.getRoute("RouteCreatePage").attachPatternMatched(this._onObjectMatched, this);
        }        
    });
});