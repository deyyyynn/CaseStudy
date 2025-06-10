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
        onClickCancel: function () {
            const oHistory = sap.ui.core.routing.History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                history.go(-1);
            } else {
                oRouter.navTo("RouteViewPage", {
                    EmployeeID: oEmpData.EmployeeID
                });
            }
        },
        onClickSave: function () {
            let oView = this.getView();
            let oModel = this.getOwnerComponent().getModel();
            let oRouter = this.getOwnerComponent().getRouter();
          
            // Gather employee data from inputs
            let oEmpData = {
              FirstName: oView.byId("id_fname").getValue(),
              LastName: oView.byId("id_lname").getValue(),
              EmployeeID: oView.byId("id_empid").getValue(),
              Age: oView.byId("id_age").getValue(),
              DateHire: oView.byId("id_date").getValue(),
              CareerLevel: oView.byId("id_career").getSelectedKey(),
              CurrentProject: oView.byId("id_project").getSelectedKey()
            };
          
            // Retrieve SkillID based on EmployeeID
            let oSkillModel = this.getView().getModel("skills");
            let aSkillData = oSkillModel.getData();
            let aEmployeeSkills = aSkillData.filter(function (skill) {
              return skill.EmployeeID === oEmpData.EmployeeID;
            });
          
            // Update the employee data
            let sEmpPath = "/EMPLOYEE('" + oEmpData.EmployeeID + "')";
            let oEmpEntry = {
              FirstName: oEmpData.FirstName,
              LastName: oEmpData.LastName,
              Age: oEmpData.Age,
              DateHire: oEmpData.DateHire,
              CareerLevel: oEmpData.CareerLevel,
              CurrentProject: oEmpData.CurrentProject
            };
          
            oModel.update(sEmpPath, oEmpEntry, {
              success: function () {
                sap.m.MessageToast.show("Employee updated successfully");
          
                // Update each associated skill
                aEmployeeSkills.forEach(function (oSkill) {
                  let sSkillPath = "/SKILL('" + oSkill.SkillID + "')";
                  let oSkillEntry = {
                    SkillID: oSkill.SkillID,
                    SkillName: oSkill.SkillName,
                    ProficiencyID: oSkill.ProficiencyID
                  };
          
                  oModel.update(sSkillPath, oSkillEntry, {
                    success: function () {
                      sap.m.MessageToast.show("Skill updated successfully");
                    },
                    error: function () {
                      sap.m.MessageToast.show("Error updating skill");
                    }
                  });
                });
          
                // oRouter.navTo("RouteViewPage", {
                //     EmployeeID: oEmpData.EmployeeID
                // },true );
                oRouter.navTo("RouteEmployeeList", {}, true);
              },
              error: function () {
                sap.m.MessageToast.show("Error updating employee");
              }
            });
          }          
    });
});
