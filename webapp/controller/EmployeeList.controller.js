sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], (Controller,JSONModel) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.EmployeeList", {
        onInit() {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteEmployeeList").attachPatternMatched(this._onRouteMatched, this);
        },
        _fetchEmployeeCount: function () {
            var oModel = this.getOwnerComponent().getModel();

            oModel.refresh(true);
            // Read the total count from the /EMPLOYEE endpoint using $count
            oModel.read("/EMPLOYEE/$count", {
                success: function (oData) {
                    // Set the total count of employees in the model
                    var oCountModel = new JSONModel({ employeeCount: oData });
                    this.getView().setModel(oCountModel, "employeeCountModel");
                }.bind(this),
                error: function () {
                    MessageToast.show("Error fetching employee count.");
                }
            });
        },
        _onRouteMatched: function(){
            this._fetchEmployeeCount();
        },
        onClickAdd: function (){
            this.getOwnerComponent().getRouter().navTo("RouteCreatePage");
        }
    });
});