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
            
            // Avoid duplication of selected Skill
            let oTable = oView.byId("idSkillList"); 
            let aItems = oTable.getItems(); 
            let bDuplicate = aItems.some(function (oItem) { 
            let sExistingSkill = oItem.getBindingContext().getProperty("SkillName");
            
            return sExistingSkill === sNewSkill;
            });

            if (bDuplicate) {
                MessageBox.warning(`${sNewSkill} has already been added.`);
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
          
            // Retrieve Skill ID based on EmployeeID
            let sNewFname = oView.byId("id_fname").getValue();
            let sNewLname = oView.byId("id_lname").getValue();
            let sNewAge = oView.byId("id_age").getValue();
        
            let oFname = oView.byId("id_fname");
            let oLname = oView.byId("id_lname");
            let oAge   = oView.byId("id_age");
            
            let bValid = true;
            
            let nameRegex = /^[A-Za-z\s\-]+$/;
            let ageRegex = /^[0-9]+$/;
            
            if (!sNewFname || !nameRegex.test(sNewFname)) {
                oFname.setValueState("Error");
                oFname.setValueStateText("This field is required and must contain valid name.");
                bValid = false;
            } else {
                oFname.setValueState("None");
            }
            
            if (!sNewLname || !nameRegex.test(sNewLname)) {
                oLname.setValueState("Error");
                oLname.setValueStateText("This field is required and must contain valid name.");
                bValid = false;
            } else {
                oLname.setValueState("None");
            }
            
            let iAge = parseInt(sNewAge);
            if (!sNewAge || !ageRegex.test(sNewAge) || iAge <= 0 || iAge > 90) {
                oAge.setValueState("Error");
                oAge.setValueStateText("Required field. Enter age between 1 and 90");
                bValid = false;
            } else {
                oAge.setValueState("None");
            }
            
            if (!bValid) {
                return; 
            }
           
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
          },
        
        onNameChange: function () {
            // First Name and Last Name validation
            const oView = this.getView();
            const oFnameInput = oView.byId("id_fname");
            const oLnameInput = oView.byId("id_lname"); 

            // FIRST NAME - Can only accept hyphen symbol
            let sFirstName = oFnameInput.getValue();
                sFirstName = sFirstName.replace(/[^A-Za-z\s\-]/g, ""); 
                    if (sFirstName.startsWith("-")) 
                    { 
                    sFirstName = sFirstName.slice(1);
                    }
                    oFnameInput.setValue(sFirstName);

            // LAST NAME - Can only accept hyphen symbol
            let sLastName = oLnameInput.getValue();
                sLastName = sLastName.replace(/[^A-Za-z\s\-]/g, ""); 
                    if (sLastName.startsWith("-")) 
                    {
                    sLastName = sLastName.slice(1); 
                    }
                    oLnameInput.setValue(sLastName); 

            const oDatePicker = oView.byId("id_date");
        
            if (sFirstName && sLastName && oDatePicker) {                
                const oDate = oDatePicker.getDateValue() || new Date();
        
                // Format date as DDMM with leading zeroes
                const sFormattedDate = 
                    String(oDate.getDate()).padStart(2, '0') +
                    String(oDate.getMonth() + 1).padStart(2, '0');
        
                // Generate Employee ID
                const sGeneratedId = `EmployeeID${sLastName}${sFirstName}${sFormattedDate}`;
                oView.byId("id_empid").setValue(sGeneratedId);
            } else {
                // Clear ID if inputs are incomplete
                oView.byId("id_empid").setValue("");
            }
        },
  
        onAgeChange: function (oEvent) {
            // Age field validation
            const oInput = oEvent.getSource();
            let sValue = oInput.getValue();

            // Allow only numbers
            sValue = sValue.replace(/[^0-9]/g, "");

            // Prevent values > 90
            let iAge = parseInt(sValue, 10);
            if (iAge > 90) {
                sValue = "90";
            }
            // Set the cleaned value back
            oInput.setValue(sValue);
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
