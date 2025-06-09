sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/m/MessageBox"
], function (Controller, JSONModel, Filter, MessageBox) {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.EditPage", {

        onInit: function () {
            this.getOwnerComponent().getRouter()
                .getRoute("RouteEditPage")
                .attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            const sEmployeeID = oEvent.getParameter("arguments").EmployeeID;
            const oModel = this.getOwnerComponent().getModel();

            // Fetch employee data based on EmployeeID
            oModel.read("/EMPLOYEE", {
                filters: [new Filter("EmployeeID", "EQ", sEmployeeID)],
                success: function (oData) {
                    if (oData.results && oData.results.length) {
                        const oEmpModel = new JSONModel(oData.results[0]);
                        this.getView().setModel(oEmpModel, "employeedetails");
                    } else {
                        MessageBox.error("No employee found with ID " + sEmployeeID);
                    }
                }.bind(this),
                error: function () {
                    MessageBox.error("Failed to load employee data.");
                }
            });

            // Fetch skills for the employee
            oModel.read("/SKILL", {
                filters: [new Filter("EmployeeID", "EQ", sEmployeeID)],
                success: function (oData) {
                    const oSkillsModel = new JSONModel(oData.results);
                    this.getView().setModel(oSkillsModel, "skills");
                }.bind(this),
                error: function () {
                    MessageBox.error("Failed to load employee skills.");
                }
            });
        },

        onClickBack: function () {
            const oHistory = sap.ui.core.routing.History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteEmployeeList", {}, true);
            }
        },

        onSave: function () {
            const oModel = this.getOwnerComponent().getModel();
            const oEmpData = this.getView().getModel("employeedetails").getData();

            const sPath = "/EMPLOYEE('" + oEmpData.EmployeeID + "')";

            oModel.update(sPath, oEmpData, {
                success: function () {
                    MessageBox.success("Employee updated successfully!", {
                        onClose: this.onClickBack.bind(this)
                    });
                }.bind(this),
                error: function () {
                    MessageBox.error("Error updating employee.");
                }
            });
        }
    });
});
