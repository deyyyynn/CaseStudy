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
        },

        onSave: function () {
            const oModel = this.getOwnerComponent().getModel();
            const oEmpData = this.getView().getModel("employeedetails").getData();
            const sEmpPath = "/EMPLOYEE('" + oEmpData.EmployeeID + "')";

            // Update employee details
            oModel.update(sEmpPath, oEmpData, {
                success: function () {
                    // After employee update, update skills
                    this._updateSkills()
                        .then(() => {
                            MessageBox.success("Employee and skills updated successfully!", {
                                onClose: this.onClickBack.bind(this)
                            });
                        })
                        .catch(() => {
                            MessageBox.error("Employee updated, but error updating skills.");
                        });
                }.bind(this),
                error: function () {
                    MessageBox.error("Error updating employee.");
                }
            });
        },

        _updateSkills: function () {
            const oModel = this.getOwnerComponent().getModel();
            const aSkills = this.getView().getModel("skills").getData();

            // Update each skill entry via OData update call, returns Promise for all
            const aPromises = aSkills.map(skill => {
                // Assuming SKILL entity is keyed by EmployeeID and SkillID
                const sSkillPath = `/SKILL(EmployeeID='${skill.EmployeeID}',SkillID='${skill.SkillID}')`;

                // Payload to update only proficiency (adjust if other fields needed)
                const oPayload = {
                    ProficiencyID: skill.ProficiencyID
                };

                return new Promise((resolve, reject) => {
                    oModel.update(sSkillPath, oPayload, {
                        success: () => resolve(),
                        error: () => reject()
                    });
                });
            });

            return Promise.all(aPromises);
        }
    });
});
