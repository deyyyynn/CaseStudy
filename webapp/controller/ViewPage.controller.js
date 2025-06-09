sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "./formatter",
    "sap/m/MessageBox"  
], (Controller, JSONModel,Filter, formatter, MessageBox) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.ViewPage", {
        formatter: formatter,
        onInit: function() {
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
        },
        onClickEdit: function () {
            var oModel = this.getView().getModel("employeedetails");

            if (!oModel) {
                MessageBox.error("Employee details model not available.");
                return;
            }

            var sEmployeeID = oModel.getProperty("/EmployeeID");

            if (sEmployeeID) {
                var oRouter = this.getOwnerComponent().getRouter();
                console.log("Navigating to EditPage for EmployeeID:", sEmployeeID);
                oRouter.navTo("RouteEditPage", {
                    EmployeeID: sEmployeeID
                });
            } else {
                MessageBox.warning("Employee ID not found in the model.");
            }
        }
    });
});