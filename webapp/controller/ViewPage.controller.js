sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/m/MessageBox"
    
], (Controller, History, JSONModel,Filter,MessageBox) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.ViewPage", {
        onInit: function() {
            // Assuming you have route matched setup
            // var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            // oRouter.getRoute("employeeRouteName").attachPatternMatched(this._onRouteMatched, this);
        
            // // Load skill model once here if not loaded already
            // this._oSkillModel = this.getOwnerComponent().getModel("skill");
            this.getOwnerComponent().getRouter().getRoute("RouteViewPage").attachPatternMatched(this._onObjectMatched, this);
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
                    MessageBox.error("Error fetching employee skill count.");
                }
            });
        },
        
        _onObjectMatched: function (oEvent) {
            var sEmployeeID = oEvent.getParameter("arguments").EmployeeID;
            var oModel = this.getOwnerComponent().getModel();

            // Read employee data
            oModel.read("/EMPLOYEE", {
                filters: [new Filter("EmployeeID", "EQ", sEmployeeID)],
                success: function (oData) {
                    var oEmployeeModel = new JSONModel(oData.results[0]);
                    this.getView().setModel(oEmployeeModel, "employeedetails");
                }.bind(this),
                error: function () {
                    MessageBox.error("Failed to load employee data.");
                }
            });

            // Read related skills (assuming navigation property or filtering is supported)
            oModel.read("/SKILL", {
                filters: [new Filter("EmployeeID", "EQ", sEmployeeID)],
                success: function (oData) {
                    var oSkillsModel = new JSONModel(oData.results[0]);
                    this.getView().setModel(oSkillsModel, "skills");
                }.bind(this),
                error: function () {
                    MessageBox.error("Failed to load skills.");
                }
            });
        }
    });
});