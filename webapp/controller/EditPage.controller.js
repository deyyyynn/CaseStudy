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
        //     const sEmployeeID = oEvent.getParameter("arguments").EmployeeID;
        //     const sProficiencyID = oEvent.getParameter("arguments").ProficiencyID;
        //     const oModel = this.getOwnerComponent().getModel();

        //     // Fetch employee data based on EmployeeID
        //     oModel.read("/EMPLOYEE", {
        //         filters: [new Filter("EmployeeID", "EQ", sEmployeeID)],
        //         success: function (oData) {
        //             if (oData.results && oData.results.length) {
        //                 const oEmpModel = new JSONModel(oData.results[0]);
        //                 this.getView().setModel(oEmpModel, "employeedetails");
        //             } else {
        //                 MessageBox.error("No employee found with ID " + sEmployeeID);
        //             }
        //         }.bind(this),
        //         error: function () {
        //             MessageBox.error("Failed to load employee data.");
        //         }
        //     });

        //     // Fetch skills for the employee
        //     oModel.read("/SKILL", {
        //         filters: [new Filter("EmployeeID", "EQ", sEmployeeID)],
        //         success: function (oData) {
        //             const oSkillsModel = new JSONModel(oData.results);
        //             this.getView().setModel(oSkillsModel, "skills");
        //         }.bind(this),
        //         error: function () {
        //             MessageBox.error("Failed to load employee skills.");
        //         }
        //     });

        //     // Fetch Proficiency
        //     oModel.read("/PROFICIENCYLIST", {
        //         success: function (oData) {
        //             const oProfModel = new JSONModel(oData.results);
        //             this.getView().setModel(oProfModel, "proficiencyList");
        //         }.bind(this),
        //         error: function () {
        //             MessageBox.error("Could not load proficiency levels.");
        //         }
        //     });
        // },
                const sEmployeeID = oEvent.getParameter("arguments").EmployeeID;
                const sProficiencyID = oEvent.getParameter("arguments").ProficiencyID; // If needed later
                const oModel = this.getOwnerComponent().getModel();
                const oView = this.getView();

                const oEmpFilter = new sap.ui.model.Filter("EmployeeID", sap.ui.model.FilterOperator.EQ, sEmployeeID);

                
                // Fetch employee details
                oModel.read("/EMPLOYEE", {
                    filters: [oEmpFilter],
                    success: function (oData) {
                        if (oData.results && oData.results.length > 0) {
                            const oEmpModel = new sap.ui.model.json.JSONModel(oData.results[0]);
                            oView.setModel(oEmpModel, "employeedetails");
                        } else {
                            sap.m.MessageBox.error("No employee found with ID " + sEmployeeID);
                        }
                    },
                    error: function () {
                        sap.m.MessageBox.error("Failed to load employee data.");
                    }
                });

                // Fetch employee skills
                oModel.read("/SKILL", {
                    filters: [oEmpFilter],
                    success: function (oData) {
                        const oSkillsModel = new sap.ui.model.json.JSONModel({ SKILL: oData.results });
                        oView.setModel(oSkillsModel, "skills");
                    },
                    error: function () {
                        sap.m.MessageBox.error("Failed to load employee skills.");
                    }
                });
                

                // Fetch proficiency list
                // oModel.read("/PROFICIENCYLIST", {
                //     success: function (oData) {
                //         const oProfModel = new sap.ui.model.json.JSONModel(oData.results);
                //         oView.setModel(oProfModel, "proficiencyList");
                //     },
                //     error: function () {
                //         sap.m.MessageBox.error("Could not load proficiency levels.");
                //     }
                // });
            },

        onAddSkill: function (){
            if (!this.oDialog) {
                this.oDialog = this.loadFragment({
                    name: "sapips.training.employeeapp.fragment.EmployeeAddSkill"
                });
            } 

            this.oDialog.then(function(oDialog) {
                oDialog.open();
            });
        },
        
       onPressDelete: function(){
        //     let oTable = this.byId("idSkillList1");
        //     let aSelectedItems = oTable.getSelectedItems();

        //     if (aSelectedItems.length === 0) {
        //         MessageBox.warning("Must select at least 1 employee.");
        //         return;
        //     }

        //     MessageBox.confirm("Are you sure you want to delete the selected skill/s?", {
        //         onClose:(oAction) => {
        //             if (oAction === sap.m.MessageBox.Action.OK) {
        //                 let oModel = this.getOwnerComponent().getModel();
        //                 let iPending = aSelectedItems.length;
        //                 let bErrorOccurred = false;
                        
        //                 aSelectedItems.forEach(function (oItem) {
        //                     let sPath = oItem.getBindingContext().getPath();

        //                     oModel.remove(sPath, {
        //                         success: function () {
        //                             iPending--;
        //                             if (iPending === 0 && !bErrorOccurred) {
        //                                 MessageBox.success("Selected skill(s) deleted successfully.");
        //                             }
        //                         },
        //                         error: function () {
        //                             bErrorOccurred = true;
        //                             MessageBox.error("Failed to delete one or more skills.");
        //                         }
        //                     });
        //                 });

        //                 oTable.removeSelections();
        //             }
        //         }
        //     });
        // },
            var oView = this.getView();
            var oModel = oView.getModel("skills");
            var oTable = oView.byId("idSkillList1");
     
            // Get all selected items
            var aSelectedItems = oTable.getSelectedItems();
            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select at least one skill to delete!");
                return;
            }
     
            // Get all SkillIDs to be deleted
            var aSelectedSkillIDs = aSelectedItems.map(item =>
                item.getBindingContext("skills").getProperty("SkillID")
            );
     
            // Filter out selected skills from SkillsData
            var aSkillsData = oModel.getProperty("/SKILL");
            var aUpdatedSkills = aSkillsData.filter(skill =>
                !aSelectedSkillIDs.includes(skill.SkillID)
            );
     
            // Update Model
            oModel.setProperty("/SKILL", aUpdatedSkills);
     
            // Clear Table Selection
            oTable.removeSelections();
            oModel.refresh(true);
     
        },

        onPressAdd: function (){
            let oView = this.getView();

            let sNewSkill = oView.byId("sel_skills").getSelectedItem()?.getText();
            let sNewProf = oView.byId("sel_prof").getSelectedItem()?.getText();
        
            if (!sNewSkill || !sNewProf) {
                MessageBox.information("Please select both Skill and Proficiency.");
                return;
            }
        
            let oData = {
                SkillName: sNewSkill,
                ProficiencyID: sNewProf
            };
        
            let oModel = this.getOwnerComponent().getModel();
            let sEntity = "/SKILL";
        
            oModel.create(sEntity, oData, {
                success: (data) => {
                    MessageBox.success("Skill added successfully!");
                    this.getView().byId("idAddSkill").close();
                },
                error: () => {
                    MessageBox.error("Failed to add skill.");
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
        onClickCancel: function (oEvent) { 
          
            const oHistory = sap.ui.core.routing.History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();
            let oEmpData = { EmployeeID: oView.byId("id_empid").getValue() } ;

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
                  let sSkillPath = "/SKILL('" + oSkill.SkillID + oSkill.SkillName + oSkill.ProficiencyID + oSkill.ProficiencyLevel + "')";
                  let oSkillEntry = {
                    
                    SkillID: oSkill.SkillID,
                    SkillName: oSkill.SkillName,
                    ProficiencyID: oSkill.ProficiencyID,
                    ProficiencyLevel: oSkill.ProficiencyLevel
                  };
          
                  oModel.update(sSkillPath, oSkillEntry, {
                    success: function () {
                      sap.m.MessageToast.show("Skill updated successfully");
                      oModel.refresh(true);
                    },
                    error: function () {
                      sap.m.MessageToast.show("Error updating skill");
                    }
                  });
                });
          
                oRouter.navTo("RouteViewPage", {
                    EmployeeID: oEmpData.EmployeeID
                 },true );
                 oModel.refresh(true);
                
              },
              error: function () {
                sap.m.MessageToast.show("Error updating employee");
              }
            });
          }          
    //     onClickSave: function(oEvent){
    //       let oView = this.getView();
    //       let oModel = this.getOwnerComponent().getModel();
    //       let oRouter = this.getOwnerComponent().getRouter();
          
    //       // Gather employee data from inputs
    //       let oEmpData = {
    //       FirstName: oView.byId("id_fname").getValue(),
    //       LastName: oView.byId("id_lname").getValue(),
    //       EmployeeID: oView.byId("id_empid").getValue(),
    //       Age: oView.byId("id_age").getValue(),
    //       DateHire: oView.byId("id_date").getValue(),
    //       CareerLevel: oView.byId("id_career").getSelectedKey(),
    //       CurrentProject: oView.byId("id_project").getSelectedKey() };

    //       var oTable = this.byId("skillsTable1");
    //       var aSelectedItems = oTable.getSelectedItems();

    //       // if (aSelectedItems.length === 0) {
    //       //     MessageBox.warning("Must select at least 1 skill.");
    //       //     return;
    //       // }

    //       MessageBox.confirm("Are you sure you want to edit the employee record?", {
    //           onClose: function (oAction) {
    //               if (oAction === sap.m.MessageBox.Action.OK) {
    //                   var oModel = this.getOwnerComponent().getModel();
    //                   var iPending = aSelectedItems.length;
    //                   var bErrorOccurred = false;
                      
    //                   aSelectedItems.forEach(function (oItem) {
    //                       var sPath = oItem.getBindingContext().getPath();

    //                       oModel.update(sEmpPath, oEmpEntry, {
    //                        success: function () {
    //                       oModel.update(sPath, {
    //                           success: function () {
    //                               iPending--;
    //                               if (iPending === 0 && !bErrorOccurred) {
    //                                   MessageBox.success("Employee record updated successfully.");
    //                                   oModel.refresh(true);
    //                               }
    //                           },
    //                           error: function () {
    //                               bErrorOccurred = true;
    //                               MessageBox.error("Failed to update Employee record.");
    //                           }
    //                       });
    //                     }
    //                   });
    //                   });
    //                   oRouter.navTo("RouteViewPage", {
    //                   EmployeeID: oEmpData.EmployeeID },null,true );
                      
    //               }
    //           }.bind(this)
    //       });
    //   }
    });
});
