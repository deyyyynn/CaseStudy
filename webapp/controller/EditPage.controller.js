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
            const sProficiencyID = oEvent.getParameter("arguments").ProficiencyID;
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

            // Fetch Proficiency
            oModel.read("/PROFICIENCYLIST", {
                success: function (oData) {
                    const oProfModel = new JSONModel(oData.results);
                    this.getView().setModel(oProfModel, "proficiencyList");
                }.bind(this),
                error: function () {
                    MessageBox.error("Could not load proficiency levels.");
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
        }
        
    });
});
